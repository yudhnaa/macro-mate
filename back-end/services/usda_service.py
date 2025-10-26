import httpx
import asyncio
from typing import List, Dict, Optional
import json
from utils.logger import setup_logger
from config import settings
from functools import lru_cache
from utils.redis_client import RedisCache

logger = setup_logger(__name__)

class USDAService:
    BASE_URL = "https://api.nal.usda.gov/fdc/v1"

    def __init__(self, api_key: str, redis_client=None):
        self.api_key = api_key
        self.redis = redis_client
        self.client = httpx.AsyncClient(timeout=15.0)

    async def search_ingredient(
        self,
        name_en: str,
        cooking_method: Optional[str] = None
    ) -> Optional[Dict]:
        """Search USDA database with Redis caching"""

        # Build cache key
        cache_key = f"usda:{name_en}:{cooking_method or 'raw'}"

        # ✅ FIXED: Check redis exists and has get method
        if self.redis and hasattr(self.redis, 'get'):
            cached = self.redis.get(cache_key)
            if cached:
                logger.info(f"✅ USDA Cache HIT: {name_en}")
                import json
                return json.loads(cached)

        # Search USDA API
        query = f"{name_en} {cooking_method}" if cooking_method else name_en

        try:
            response = await self.client.get(
                f"{self.BASE_URL}/foods/search",
                params={
                    "api_key": self.api_key,
                    "query": query,
                    "dataType": ["Foundation", "SR Legacy"],
                    "pageSize": 10
                }
            )

            if response.status_code != 200:
                logger.error(f"USDA API error {response.status_code}: {response.text}")
                return None

            data = response.json()
            foods = data.get("foods", [])

            if not foods:
                logger.warning(f"No USDA results for: {query}")
                return None

            # Select best match
            best_food = self._select_best_match(foods, name_en, cooking_method)

            if not best_food:
                return None

            # Parse nutrients
            result = self._parse_food_nutrients(best_food)

            # ✅ FIXED: Cache result if redis exists
            if result and self.redis and hasattr(self.redis, 'setex'):
                import json
                self.redis.setex(
                    cache_key,
                    604800,  # 7 days
                    json.dumps(result, ensure_ascii=False)
                )

            return result

        except Exception as e:
            logger.error(f"USDA search error for '{query}': {e}")
            return None

    def _select_best_match(
        self,
        foods: List[Dict],
        name_en: str,
        cooking_method: Optional[str]
    ) -> Optional[Dict]:
        scored = []
        for food in foods:
            score = 0.0
            desc = food.get("description", "").lower()

            if food.get("dataType") == "Foundation":
                score += 0.40
            elif food.get("dataType") == "SR Legacy":
                score += 0.30

            if cooking_method and cooking_method.lower() in desc:
                score += 0.20

            if any(b in desc for b in ["brand", "®", "™"]):
                score -= 0.30

            if name_en.lower() in desc:
                score += 0.10

            scored.append((score, food))

        scored.sort(key=lambda x: x[0], reverse=True)

        if scored and scored[0][0] > 0.3:
            best_score, best_food = scored[0]
            best_food["match_score"] = best_score
            return best_food

        return None

    def _parse_food_nutrients(self, food: Dict) -> Dict:
        """Extract nutrition per 100g"""
        nutrients_map = {
            "Energy": "calories",
            "Protein": "protein",
            "Carbohydrate, by difference": "carbs",
            "Total lipid (fat)": "fat",
            "Fiber, total dietary": "fiber",
            "Sodium, Na": "sodium"
        }
        nutrients = {}

        for nutrient in food.get("foodNutrients", []):
            nutrient_name = nutrient.get("nutrientName", "")
            value = nutrient.get("value", 0)
            unit = nutrient.get("unitName", "")

            for usda_name, our_name in nutrients_map.items():
                if usda_name in nutrient_name:
                    if our_name == "calories" and unit.upper() == "KCAL":
                        nutrients[our_name] = value
                    elif unit.upper() in ["G", "MG"]:
                        nutrients[our_name] = value if unit.upper() == "G" else value / 1000
                    break

        for key in ["calories", "protein", "carbs", "fat", "fiber", "sodium"]:
            if key not in nutrients:
                nutrients[key] = 0

        return {
            "fdc_id": food.get("fdcId"),
            "name": food.get("description"),
            "nutrients_per_100g": nutrients,
            "data_source": food.get("dataType"),
            "match_score": food.get("match_score", 0)
        }

    async def batch_search(self, components: List[Dict]) -> List[Dict]:
        """Parallel search for multiple components"""
        tasks = [
            self.search_ingredient(comp["name_en"], comp.get("cooking_method"))
            for comp in components
        ]

        results = await asyncio.gather(*tasks, return_exceptions=True)

        valid = []
        for comp, result in zip(components, results):
            if isinstance(result, Exception):
                logger.error(f"Batch error {comp['name_en']}: {result}")
                valid.append(None)
            else:
                valid.append(result)

        return valid

    async def close(self):
        await self.client.aclose()

@lru_cache
def get_usda_service() -> USDAService:
    """Factory for FastAPI Depends"""
    from utils.redis_client import RedisCache
    from dependencies import get_checkpointer

    redis_cache = RedisCache()

    return USDAService(
        api_key=settings.USDA_API_KEY,
        redis_client=redis_cache  # ✅ Pass RedisCache instance
    )
