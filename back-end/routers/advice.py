import json
import uuid
from typing import Optional

from dependencies import get_workflow_service
from fastapi import APIRouter, Depends, Header, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field
from services.user_service import UserProfileService
from services.workflow_service import WorkflowService, get_profile_service
from utils.logger import setup_logger
from utils.auth import get_current_user
from sqlalchemy.orm import Session
from database.connection import get_db
from routers.profile import add_computed_fields

from database.crud import get_user_by_email

logger = setup_logger(__name__)

router = APIRouter(prefix="/advice", tags=["advice"])


class AdviceRequest(BaseModel):
    thread_id: Optional[str] = Field(None, description="thread id của đoạn chat")
    image_url: Optional[str] = Field(None, description="URL hình ảnh món ăn")
    user_query: str = Field(..., min_length=1, description="Câu hỏi của người dùng")

def format_user_profile(user_profile: dict) -> dict:
    """Format user profile to match the expected structure"""
    # Build comprehensive description
    description_parts = []
    
    # Add fitness goal
    if user_profile.get("fitness_goal"):
        description_parts.append(f"Mục tiêu: {user_profile.get('fitness_goal')}")
    
    # Add gender
    if user_profile.get("gender"):
        description_parts.append(f"Giới tính: {user_profile.get('gender')}")
    
    # Add activity level
    if user_profile.get("activity_level"):
        description_parts.append(f"Mức độ hoạt động: {user_profile.get('activity_level')}")
    
    # Add dietary restrictions
    if user_profile.get("dietary_restrictions"):
        description_parts.append(f"Hạn chế chế độ ăn: {user_profile.get('dietary_restrictions')}")
    
    # Add allergies
    if user_profile.get("allergies"):
        description_parts.append(f"Dị ứng: {user_profile.get('allergies')}")
    
    description = ". ".join(description_parts) if description_parts else ""
    
    return {
        "user_id": f"{user_profile.get('id', '')}",
        "name": user_profile.get("full_name") or user_profile.get("username", ""),
        "age": user_profile.get("age"),
        "weight": user_profile.get("weight"),
        "height": user_profile.get("height"),
        "bmi": user_profile.get("bmi") or "N/A",
        "bodyShape": user_profile.get("body_shape", ""),
        "health_conditions": user_profile.get("health_conditions", ""),
        "description": description,
    }


@router.post("/stream")
async def stream_advice(
    request: AdviceRequest,
    # user_id: str = Header(..., alias="X-User-ID"),
    current_user_email: str = Depends(get_current_user),
    db: Session = Depends(get_db),
    service: WorkflowService = Depends(get_workflow_service),
    profile_service: UserProfileService = Depends(get_profile_service),
):
    
        # Get user from database
    user = get_user_by_email(db, current_user_email)
    print("USER=====>:", user)
    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )
    
    # Get user profile with computed fields
    user_profile = add_computed_fields(user)
    print("=====>USER PROFILE:", user_profile)
    
    # Có thể được tạo từ client
    print("=====>user id:", user.id)
    thread_id = request.thread_id or f"user_{user.id}_thread_{uuid.uuid4().hex[:8]}"

    print("=====>THREAD ID:", thread_id)

    # Format profile to match expected structure
    user_profile = format_user_profile(user_profile)
    print("=====>FORMATTED USER PROFILE:", user_profile)
    # Có thể được tạo từ client
    thread_id = request.thread_id or f"user_{user.id}_thread_{uuid.uuid4().hex[:8]}"

    # try:
    #     user_profile = await get_profile_service().get_profile(user_id)
    # except Exception as e:
    #     logger.error(f"Failed to load profile for {user_id}: {e}")
    #     raise HTTPException(
    #         status_code=503, detail=f"Cannot fetch user profile: {str(e)}"
    #     )

    async def event_generator():
        try:
            yield f"thread_id: {thread_id}\n\n"
            async for event in service.process_request_stream(
                thread_id=thread_id,
                image_url=request.image_url or "",
                user_query=request.user_query,
                user_profile=user_profile,
            ):
                # Format SSE
                yield f"data: {json.dumps(event, ensure_ascii=False)}\n\n"

            # End signal
            yield "data: [DONE]\n\n"

        except Exception as e:
            # Global error handler
            yield f"data: {json.dumps({'type': 'error', 'content': str(e)})}\n\n"
            yield "data: [DONE]\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )
