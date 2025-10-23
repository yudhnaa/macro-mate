from datetime import datetime, time
from typing import Optional

from database.connection import get_db
from database.crud import (
    create_user_meal,
    get_user_by_id,
    get_user_meal_by_id,
    get_user_meals,
    get_user_meals_by_date_range,
    mark_meal_failed,
    update_meal_analysis,
)
from database.models import MealTypeDB
from dependencies import get_workflow_service
from fastapi import APIRouter, Depends, File, Form, HTTPException, Query, UploadFile
from fastapi.responses import JSONResponse
from models.factory import ModelFactory
from pydantic import BaseModel, Field
from services.cloudinary_service import CloudinaryService, get_cloudinary_service
from services.workflow_service import WorkflowService
from sqlalchemy.orm import Session
from utils.logger import setup_logger

logger = setup_logger(__name__)

router = APIRouter(prefix="/analyze", tags=["analyze"])


class ImageAnalysRequest(BaseModel):
    image_url: str = Field(..., description="URL hình ảnh cần phân tích")


@router.post("/analyze-image")
async def analyze_image(
    request: ImageAnalysRequest,
    service: WorkflowService = Depends(get_workflow_service),
):
    try:
        result = await service.analyze_image(request.image_url)

        # Convert pydantic model sang dict
        result_dict = (
            result.model_dump() if hasattr(result, "model_dump") else result.dict()
        )
        return JSONResponse(content=result_dict, status_code=200)
    except Exception as e:
        logger.error(f"Failed to analyze image {request.image_url}: {e}")
        raise HTTPException(status_code=500, detail=f"Image analysis failed: {str(e)}")


@router.post("/upload-and-analyze-image")
async def upload_and_analyze_image(
    file: UploadFile = File(..., description="Ảnh món ăn cần phân tích"),
    meal_type: str = Form(
        "snack", description="Loại bữa ăn (breakfast, lunch, dinner, snack)"
    ),
    meal_time: Optional[str] = Form(None, description="Thời gian bữa ăn (ISO format)"),
    cloudinary_service: CloudinaryService = Depends(get_cloudinary_service),
    workflow_service: WorkflowService = Depends(get_workflow_service),
    db: Session = Depends(get_db),
):
    """
    Upload ảnh lên Cloudinary và phân tích ngay, sau đó lưu vào database

    Workflow:
    1. Upload ảnh lên Cloudinary
    2. Nhận URL
    3. Tạo record trong database với status PENDING
    4. Gọi vision analysis
    5. Lưu kết quả phân tích vào database
    6. Trả về kết quả phân tích + URL ảnh

    Form Parameters:
    - file: Ảnh món ăn (required)
    - meal_type: Loại bữa ăn (breakfast, lunch, dinner, snack) - default: snack
    - meal_time: Thời gian bữa ăn (ISO format, e.g., 2025-01-01T12:30:00) \
        - optional, defaults to current time

    TODO: Implement JWT authentication to get user_id
    """
    meal_id = None
    try:
        # TODO: Replace with JWT authentication
        # For now, using mock user_id = 1
        user_id_int = 1
        user_id = str(user_id_int)

        # Verify user exists
        user = get_user_by_id(db, user_id_int)
        if not user:
            raise HTTPException(
                status_code=404,
                detail=f"Mock user with ID {user_id_int} not found. \
                    Please ensure user exists in database.",
            )

        # Validate meal_type
        try:
            meal_type_enum = MealTypeDB(meal_type.lower())
        except ValueError:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid meal type. Must be one of: \
                    {', '.join([e.value for e in MealTypeDB])}",
            )

        # Parse meal_time if provided, otherwise use current time
        if meal_time:
            try:
                meal_time_dt = datetime.fromisoformat(meal_time.replace("Z", "+00:00"))
            except ValueError:
                raise HTTPException(
                    status_code=400,
                    detail="Invalid meal_time format. \
                        Use ISO format (e.g., 2025-01-01T12:30:00)",
                )
        else:
            meal_time_dt = datetime.now()

        logger.info(f"Uploading image for user {user_id}")

        # Upload ảnh lên Cloudinary
        upload_result = await cloudinary_service.upload_image(
            file=file,
            user_id=user_id,
            optimize=True,
        )

        image_url = upload_result.get("secure_url")
        if not image_url:
            raise HTTPException(status_code=500, detail="Image upload failed")

        logger.info(f"Image uploaded successfully: {image_url}")

        # Tạo record meal trong database với status PENDING
        meal = create_user_meal(
            db=db,
            user_id=user_id_int,
            image_url=image_url,
            meal_type=meal_type_enum,
            meal_time=meal_time_dt,
        )
        meal_id = meal.id

        logger.info(f"Created meal record with ID: {meal_id}")

        # Phân tích ảnh
        analysis_result = await workflow_service.analyze_image(image_url)
        analysis_dict = (
            analysis_result.model_dump()
            if hasattr(analysis_result, "model_dump")
            else analysis_result.dict()
        )

        # Get model name from ModelFactory
        vlm_model = ModelFactory.create_vlm()
        model_name = getattr(vlm_model, "model_name", "unknown_model")

        # Lưu kết quả phân tích vào database
        updated_meal = update_meal_analysis(
            db=db,
            meal_id=meal_id,
            analysis_data=analysis_dict,
            model_name=model_name,
        )

        if not updated_meal:
            raise HTTPException(
                status_code=500, detail="Failed to save analysis results"
            )

        logger.info(f"Analysis results saved for meal ID: {meal_id}")

        response = {
            "meal_id": meal_id,
            "upload": {
                "url": upload_result["secure_url"],
                "thumbnail_url": upload_result.get("thumbnail_url"),
                "public_id": upload_result["public_id"],
                "width": upload_result["width"],
                "height": upload_result["height"],
                "format": upload_result["format"],
                "size": upload_result["size"],
            },
            "analysis": analysis_dict,
            "nutrition_summary": {
                "total_calories": updated_meal.total_calories,
                "total_protein": updated_meal.total_protein,
                "total_fat": updated_meal.total_fat,
                "total_carbs": updated_meal.total_carbs,
                "total_fiber": updated_meal.total_fiber,
                "total_sodium": updated_meal.total_sodium,
            },
        }

        return JSONResponse(content=response, status_code=200)

    except HTTPException:
        # Re-raise HTTP exceptions
        if meal_id:
            mark_meal_failed(db, meal_id, "HTTP error occurred")
        raise
    except Exception as e:
        logger.error(f"Failed to process image: {e}")
        if meal_id:
            mark_meal_failed(db, meal_id, str(e))
        raise HTTPException(
            status_code=500, detail=f"Image processing failed: {str(e)}"
        )


@router.get("/meals/{meal_id}")
async def get_meal_detail(
    meal_id: int,
    db: Session = Depends(get_db),
):
    """
    Lấy chi tiết một bữa ăn theo ID

    TODO: Implement JWT authentication to get user_id
    """
    try:
        # TODO: Replace with JWT authentication
        # For now, using mock user_id = 1
        user_id_int = 1

        # Get meal
        meal = get_user_meal_by_id(db, meal_id)
        if not meal:
            raise HTTPException(status_code=404, detail="Meal not found")

        # Verify ownership
        if meal.user_id != user_id_int:
            raise HTTPException(status_code=403, detail="Access denied")

        # Format response
        response = {
            "id": meal.id,
            "meal_name": meal.meal_name,
            "meal_type": meal.meal_type.value,
            "meal_time": meal.meal_time.isoformat() if meal.meal_time else None,
            "image_url": meal.image_url,
            "analysis_status": meal.analysis_status.value,
            "nutrition_summary": {
                "total_calories": meal.total_calories,
                "total_protein": meal.total_protein,
                "total_fat": meal.total_fat,
                "total_carbs": meal.total_carbs,
                "total_fiber": meal.total_fiber,
                "total_sodium": meal.total_sodium,
            },
            "items": [
                {
                    "id": item.id,
                    "name": item.name,
                    "estimated_weight": item.estimated_weight,
                    "calories": item.calories,
                    "protein": item.protein,
                    "fat": item.fat,
                    "carbs": item.carbs,
                    "fiber": item.fiber,
                    "sodium": item.sodium,
                }
                for item in meal.items
            ],
            "created_at": meal.created_at.isoformat() if meal.created_at else None,
        }

        return JSONResponse(content=response, status_code=200)

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get meal detail: {e}")
        raise HTTPException(
            status_code=500, detail=f"Failed to get meal detail: {str(e)}"
        )


@router.get("/meals")
async def get_meal_history(
    meal_type: str = Query(
        None, description="Filter by meal type (breakfast, lunch, dinner, snack)"
    ),
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(
        50, ge=1, le=100, description="Maximum number of records to return"
    ),
    db: Session = Depends(get_db),
):
    """
    Lấy lịch sử bữa ăn của user

    Query Parameters:
    - meal_type: Filter theo loại bữa ăn (optional)
    - skip: Pagination - số records bỏ qua (default: 0)
    - limit: Pagination - số records tối đa (default: 50, max: 100)

    TODO: Implement JWT authentication to get user_id
    """
    try:
        # TODO: Replace with JWT authentication
        # For now, using mock user_id = 1
        user_id_int = 1

        # Verify user exists
        user = get_user_by_id(db, user_id_int)
        if not user:
            raise HTTPException(
                status_code=404,
                detail=f"Mock user with ID {user_id_int} not found.\
                    Please ensure user exists in database.",
            )

        # Validate meal_type if provided
        meal_type_enum = None
        if meal_type:
            try:
                meal_type_enum = MealTypeDB(meal_type.lower())
            except ValueError:
                raise HTTPException(
                    status_code=400,
                    detail=f"Invalid meal type. Must be one of: \
                    {', '.join([e.value for e in MealTypeDB])}",
                )

        # Get meals
        meals = get_user_meals(
            db=db,
            user_id=user_id_int,
            skip=skip,
            limit=limit,
            meal_type=meal_type_enum,
        )

        # Format response
        response = {
            "total": len(meals),
            "skip": skip,
            "limit": limit,
            "meals": [
                {
                    "id": meal.id,
                    "meal_name": meal.meal_name,
                    "meal_type": meal.meal_type.value,
                    "meal_time": meal.meal_time.isoformat() if meal.meal_time else None,
                    "image_url": meal.image_url,
                    "analysis_status": meal.analysis_status.value,
                    "nutrition_summary": {
                        "total_calories": meal.total_calories,
                        "total_protein": meal.total_protein,
                        "total_fat": meal.total_fat,
                        "total_carbs": meal.total_carbs,
                        "total_fiber": meal.total_fiber,
                        "total_sodium": meal.total_sodium,
                    },
                    "items_count": len(meal.items),
                    "created_at": (
                        meal.created_at.isoformat() if meal.created_at else None
                    ),
                }
                for meal in meals
            ],
        }

        return JSONResponse(content=response, status_code=200)

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get meal history: {e}")
        raise HTTPException(
            status_code=500, detail=f"Failed to get meal history: {str(e)}"
        )


@router.get("/nutrition-stats")
async def get_nutrition_statistics(
    start_date: str = Query(
        ..., description="Start date in YYYY-MM-DD format (e.g., 2025-01-01)"
    ),
    end_date: str = Query(
        ..., description="End date in YYYY-MM-DD format (e.g., 2025-01-31)"
    ),
    meal_type: str = Query(
        None, description="Filter by meal type (breakfast, lunch, dinner, snack)"
    ),
    db: Session = Depends(get_db),
):
    """
    Thống kê dinh dưỡng của người dùng trong khoảng thời gian

    Query Parameters:
    - start_date: Ngày bắt đầu (YYYY-MM-DD) (required)
    - end_date: Ngày kết thúc (YYYY-MM-DD) (required)
    - meal_type: Filter theo loại bữa ăn (optional)

    Returns:
    - Tổng số bữa ăn
    - Tổng số món ăn đã ăn
    - Danh sách món ăn với số lần xuất hiện
    - Tổng cộng các chất dinh dưỡng (calories, protein, fat, carbs, fiber, sodium)
    - Trung bình các chất dinh dưỡng mỗi ngày
    - Breakdown theo loại bữa ăn
    - Timeline theo ngày

    TODO: Implement JWT authentication to get user_id
    """
    try:
        # TODO: Replace with JWT authentication
        # For now, using mock user_id = 1
        user_id_int = 1

        # Verify user exists
        user = get_user_by_id(db, user_id_int)
        if not user:
            raise HTTPException(
                status_code=404,
                detail=f"Mock user with ID {user_id_int} not found. \
                    Please ensure user exists in database.",
            )

        # Parse dates
        try:
            start_dt = datetime.strptime(start_date, "%Y-%m-%d")
            end_dt = datetime.strptime(end_date, "%Y-%m-%d")
            # Set time to end of day for end_date
            end_dt = datetime.combine(end_dt.date(), time(23, 59, 59))
        except ValueError:
            raise HTTPException(
                status_code=400,
                detail="Invalid date format. Use YYYY-MM-DD (e.g., 2025-01-01)",
            )

        # Validate date range
        if start_dt > end_dt:
            raise HTTPException(
                status_code=400,
                detail="Start date must be before or equal to end date",
            )

        # Validate meal_type if provided
        meal_type_enum = None
        if meal_type:
            try:
                meal_type_enum = MealTypeDB(meal_type.lower())
            except ValueError:
                raise HTTPException(
                    status_code=400,
                    detail=f"Invalid meal type. Must be one of: \
                    {', '.join([e.value for e in MealTypeDB])}",
                )

        # Get meals in date range
        meals = get_user_meals_by_date_range(
            db=db,
            user_id=user_id_int,
            start_date=start_dt,
            end_date=end_dt,
            meal_type=meal_type_enum,
        )

        # Initialize statistics
        total_meals = len(meals)
        total_items = 0
        food_items_count = {}  # {food_name: count}
        all_meals_list = []  # List of all meals with details

        # Initialize nutrition totals
        total_nutrition = {
            "calories": 0.0,
            "protein": 0.0,
            "fat": 0.0,
            "carbs": 0.0,
            "fiber": 0.0,
            "sodium": 0.0,
        }

        # Breakdown by meal type
        meal_type_breakdown = {
            "breakfast": {
                "count": 0,
                "calories": 0.0,
                "protein": 0.0,
                "fat": 0.0,
                "carbs": 0.0,
                "fiber": 0.0,
                "sodium": 0.0,
            },
            "lunch": {
                "count": 0,
                "calories": 0.0,
                "protein": 0.0,
                "fat": 0.0,
                "carbs": 0.0,
                "fiber": 0.0,
                "sodium": 0.0,
            },
            "dinner": {
                "count": 0,
                "calories": 0.0,
                "protein": 0.0,
                "fat": 0.0,
                "carbs": 0.0,
                "fiber": 0.0,
                "sodium": 0.0,
            },
            "snack": {
                "count": 0,
                "calories": 0.0,
                "protein": 0.0,
                "fat": 0.0,
                "carbs": 0.0,
                "fiber": 0.0,
                "sodium": 0.0,
            },
        }

        # Timeline by date
        daily_timeline = {}

        # Process each meal
        for meal in meals:
            # Count meal type
            meal_type_key = meal.meal_type.value
            meal_type_breakdown[meal_type_key]["count"] += 1
            meal_type_breakdown[meal_type_key]["calories"] += meal.total_calories or 0
            meal_type_breakdown[meal_type_key]["protein"] += meal.total_protein or 0
            meal_type_breakdown[meal_type_key]["fat"] += meal.total_fat or 0
            meal_type_breakdown[meal_type_key]["carbs"] += meal.total_carbs or 0
            meal_type_breakdown[meal_type_key]["fiber"] += meal.total_fiber or 0
            meal_type_breakdown[meal_type_key]["sodium"] += meal.total_sodium or 0

            # Add to total nutrition
            total_nutrition["calories"] += meal.total_calories or 0
            total_nutrition["protein"] += meal.total_protein or 0
            total_nutrition["fat"] += meal.total_fat or 0
            total_nutrition["carbs"] += meal.total_carbs or 0
            total_nutrition["fiber"] += meal.total_fiber or 0
            total_nutrition["sodium"] += meal.total_sodium or 0

            # Collect meal items for food count
            meal_items = []
            for item in meal.items:
                total_items += 1
                food_name = item.name or "Unknown"
                food_items_count[food_name] = food_items_count.get(food_name, 0) + 1
                meal_items.append(
                    {
                        "name": item.name,
                        "estimated_weight": item.estimated_weight,
                        "calories": item.calories,
                        "protein": item.protein,
                        "fat": item.fat,
                        "carbs": item.carbs,
                        "fiber": item.fiber,
                        "sodium": item.sodium,
                    }
                )

            # Add meal to all meals list
            all_meals_list.append(
                {
                    "id": meal.id,
                    "meal_name": meal.meal_name,
                    "meal_type": meal.meal_type.value,
                    "meal_time": meal.meal_time.isoformat() if meal.meal_time else None,
                    "image_url": meal.image_url,
                    "items": meal_items,
                    "nutrition_summary": {
                        "calories": meal.total_calories,
                        "protein": meal.total_protein,
                        "fat": meal.total_fat,
                        "carbs": meal.total_carbs,
                        "fiber": meal.total_fiber,
                        "sodium": meal.total_sodium,
                    },
                }
            )

            # Add to daily timeline
            meal_date = meal.meal_time.date().isoformat()
            if meal_date not in daily_timeline:
                daily_timeline[meal_date] = {
                    "date": meal_date,
                    "meals_count": 0,
                    "meals": [],
                    "calories": 0.0,
                    "protein": 0.0,
                    "fat": 0.0,
                    "carbs": 0.0,
                    "fiber": 0.0,
                    "sodium": 0.0,
                }

            daily_timeline[meal_date]["meals_count"] += 1
            daily_timeline[meal_date]["meals"].append(
                {
                    "id": meal.id,
                    "meal_name": meal.meal_name,
                    "meal_type": meal.meal_type.value,
                    "image_url": meal.image_url,
                    "items_count": len(meal.items),
                }
            )
            daily_timeline[meal_date]["calories"] += meal.total_calories or 0
            daily_timeline[meal_date]["protein"] += meal.total_protein or 0
            daily_timeline[meal_date]["fat"] += meal.total_fat or 0
            daily_timeline[meal_date]["carbs"] += meal.total_carbs or 0
            daily_timeline[meal_date]["fiber"] += meal.total_fiber or 0
            daily_timeline[meal_date]["sodium"] += meal.total_sodium or 0

        # Calculate number of days
        num_days = (end_dt.date() - start_dt.date()).days + 1

        # Calculate daily averages
        daily_averages = {
            "calories": (
                round(total_nutrition["calories"] / num_days, 2) if num_days > 0 else 0
            ),
            "protein": (
                round(total_nutrition["protein"] / num_days, 2) if num_days > 0 else 0
            ),
            "fat": round(total_nutrition["fat"] / num_days, 2) if num_days > 0 else 0,
            "carbs": (
                round(total_nutrition["carbs"] / num_days, 2) if num_days > 0 else 0
            ),
            "fiber": (
                round(total_nutrition["fiber"] / num_days, 2) if num_days > 0 else 0
            ),
            "sodium": (
                round(total_nutrition["sodium"] / num_days, 2) if num_days > 0 else 0
            ),
        }

        # Sort food items by count
        top_foods = sorted(
            [
                {"name": name, "count": count}
                for name, count in food_items_count.items()
            ],
            key=lambda x: x["count"],
            reverse=True,
        )

        # Sort timeline by date
        timeline_list = sorted(daily_timeline.values(), key=lambda x: x["date"])

        # Round nutrition totals
        total_nutrition = {k: round(v, 2) for k, v in total_nutrition.items()}

        # Round meal type breakdown
        for meal_type_key in meal_type_breakdown:
            meal_type_breakdown[meal_type_key] = {
                k: round(v, 2) if isinstance(v, float) else v
                for k, v in meal_type_breakdown[meal_type_key].items()
            }

        # Build response
        response = {
            "period": {
                "start_date": start_date,
                "end_date": end_date,
                "total_days": num_days,
            },
            "summary": {
                "total_meals": total_meals,
                "total_food_items": total_items,
                "unique_foods": len(food_items_count),
            },
            "nutrition_totals": total_nutrition,
            "daily_averages": daily_averages,
            "meal_type_breakdown": meal_type_breakdown,
            "top_foods": top_foods,
            "meals": all_meals_list,
            "daily_timeline": timeline_list,
        }

        return JSONResponse(content=response, status_code=200)

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get nutrition statistics: {e}")
        raise HTTPException(
            status_code=500, detail=f"Failed to get nutrition statistics: {str(e)}"
        )
