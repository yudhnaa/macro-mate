import json
import uuid
from typing import Optional

from database.connection import get_db
from database.crud import get_user_by_email
from dependencies import get_workflow_service
from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field
from routers.profile import add_computed_fields
from services.cloudinary_service import CloudinaryService, get_cloudinary_service
from services.user_service import UserProfileService
from services.workflow_service import WorkflowService, get_profile_service
from utils.image_base64_helper import upload_file_to_base64, validate_image_file
from utils.logger import setup_logger
from utils.auth import get_current_user
from sqlalchemy.orm import Session
from utils.auth import get_current_user
from utils.logger import setup_logger

logger = setup_logger(__name__)

router = APIRouter(prefix="/advice", tags=["advice"])


class AdviceRequest(BaseModel):
    thread_id: Optional[str] = Field(None, description="thread id của đoạn chat")
    # image_url: Optional[str] = Field(None, description="URL hình ảnh món ăn")
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
        description_parts.append(
            f"Mức độ hoạt động: {user_profile.get('activity_level')}"
        )

    # Add dietary restrictions
    if user_profile.get("dietary_restrictions"):
        description_parts.append(
            f"Hạn chế chế độ ăn: {user_profile.get('dietary_restrictions')}"
        )

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
    thread_id: Optional[str] = Form(None),
    user_query: str = Form(..., min_length=1),
    img_file: Optional[UploadFile] = File(None),
    # user_id: str = Header(..., alias="X-User-ID"),
    current_user_email: str = Depends(get_current_user),
    db: Session = Depends(get_db),
    service: WorkflowService = Depends(get_workflow_service),
    profile_service: UserProfileService = Depends(get_profile_service),
    # cloudinary_service: CloudinaryService = Depends(get_cloudinary_service)
):

    # Get user from database
    user = get_user_by_email(db, current_user_email)
    print("USER=====>:", user)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Get user profile with computed fields
    user_profile = add_computed_fields(user)
    print("=====>USER PROFILE:", user_profile)

    # Có thể được tạo từ client
    print("=====>user id:", user.id)
    thread_id = thread_id or f"user_{user.id}_thread_{uuid.uuid4().hex[:8]}"

    print("=====>THREAD ID:", thread_id)

    image_data_uri = None
    
    if img_file:
        # Validate
        if not validate_image_file(img_file):
            raise HTTPException(
                status_code=400,
                detail="Invalid image format. Allowed: JPEG, PNG, WebP, HEIC"
            )
        
        try:
            # Convert to base64
            image_data_uri = await upload_file_to_base64(
                file=img_file,
                max_size_mb=5.0,
                optimize=True,
                max_dimension=1024
            )
            
            logger.info(f"Image → base64 ({len(image_data_uri)} bytes)")
            
        except ValueError as e:
            raise HTTPException(status_code=400, detail=str(e))

    # if img_file:
    #     """Upload cloudinary """
    #     upload_result = await cloudinary_service.upload_image(
    #         file=img_file,
    #         user_id=user.id,
    #         optimize=True,
    #     )

    #     image_url = upload_result.get("secure_url")
    #     if not image_url:
    #         raise HTTPException(status_code=500, detail="Image upload failed")
    #     print("=====>IMAGE URL:", image_url)

    # Format profile to match expected structure
    user_profile = format_user_profile(user_profile)
    print("=====>FORMATTED USER PROFILE:", user_profile)

    async def event_generator():
        try:
            yield f"thread_id: {thread_id}\n\n"
            if image_data_uri:
                yield f"data: {json.dumps({
                    'type': 'image_received',
                    'content': {
                        'size': len(image_data_uri),
                        'format': 'base64'
                    }
                }, ensure_ascii=False)}\n\n"

            async for event in service.process_request_stream(
                thread_id=thread_id,
                image_url=image_data_uri,
                user_query=user_query,
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
