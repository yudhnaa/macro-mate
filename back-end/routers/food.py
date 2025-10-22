from typing import List, Optional

from database.connection import get_db
from database.crud import (
    create_food,
    delete_food,
    get_food_by_id,
    get_foods,
    update_food,
)
from fastapi import APIRouter, Depends, HTTPException, Query, status
from models.food import Food, FoodCreate, FoodUpdate
from sqlalchemy.orm import Session

router = APIRouter(prefix="/foods", tags=["Foods"])


@router.get("/", response_model=List[Food])
async def get_food_list(
    skip: int = Query(0, ge=0, description="Number of items to skip"),
    limit: int = Query(100, ge=1, le=500, description="Maximum number of items to return"),
    meal_type: Optional[str] = Query(
        None,
        description="Filter by meal type",
        pattern="^(breakfast|lunch|dinner|snack|dessert)$"
    ),
    equipment: Optional[str] = Query(
        None,
        description="Filter by required equipment",
        pattern="^(blender|oven|stove|slow_cooker|toaster|food_processor|microwave|grill)$"
    ),
    max_complexity: Optional[int] = Query(
        None,
        ge=1,
        le=10,
        description="Maximum complexity level (1-10)"
    ),
    search: Optional[str] = Query(
        None,
        min_length=1,
        max_length=100,
        description="Search by food name"
    ),
    db: Session = Depends(get_db)
):
    """
    Get list of foods with optional filters:
    
    - **skip**: Pagination offset (default: 0)
    - **limit**: Maximum items to return (default: 100, max: 500)
    - **meal_type**: Filter by breakfast, lunch, dinner, snack, or dessert
    - **equipment**: Filter by required equipment
    - **max_complexity**: Filter by maximum complexity level
    - **search**: Search foods by name (case-insensitive)
    """
    foods = get_foods(
        db=db,
        skip=skip,
        limit=limit,
        meal_type=meal_type,
        equipment=equipment,
        max_complexity=max_complexity,
        search=search
    )
    return foods


@router.get("/{food_id}", response_model=Food)
async def get_food(
    food_id: int,
    db: Session = Depends(get_db)
):
    """
    Get a specific food by ID
    """
    food = get_food_by_id(db, food_id)
    if not food:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Food with id {food_id} not found"
        )
    return food


@router.post("/", response_model=Food, status_code=status.HTTP_201_CREATED)
async def create_new_food(
    food: FoodCreate,
    db: Session = Depends(get_db)
):
    """
    Create a new food item
    """
    try:
        new_food = create_food(db, food.model_dump())
        return new_food
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Error creating food: {str(e)}"
        )


@router.put("/{food_id}", response_model=Food)
async def update_food_item(
    food_id: int,
    food_update: FoodUpdate,
    db: Session = Depends(get_db)
):
    """
    Update a food item
    """
    update_data = {k: v for k, v in food_update.model_dump().items() if v is not None}
    
    if not update_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No data provided for update"
        )
    
    updated_food = update_food(db, food_id, update_data)
    if not updated_food:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Food with id {food_id} not found"
        )
    return updated_food


@router.delete("/{food_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_food_item(
    food_id: int,
    db: Session = Depends(get_db)
):
    """
    Delete a food item
    """
    success = delete_food(db, food_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Food with id {food_id} not found"
        )
    return None
