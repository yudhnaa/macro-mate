import asyncio
import base64
import io
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
    thread_id: Optional[str] = Form(None),
    user_query: str = Form(..., min_length=1),
    img_file: Optional[UploadFile] = File(None),
    # user_id: str = Header(..., alias="X-User-ID"),
    current_user_email: str = Depends(get_current_user),
    db: Session = Depends(get_db),
    service: WorkflowService = Depends(get_workflow_service),
    profile_service: UserProfileService = Depends(get_profile_service),
    cloudinary_service: CloudinaryService = Depends(get_cloudinary_service),
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
    thread_id = thread_id or f"user_{user.id}_thread_{uuid.uuid4().hex[:8]}"

    print("=====>THREAD ID:", thread_id)

    image_base64 = None
    cloudinary_task = None
    upload_result = None

    if img_file:
        # Đọc file thành bytes
        image_bytes = await img_file.read()

        # Convert sang base64 để gửi cho Gemini
        image_base64 = base64.b64encode(image_bytes).decode('utf-8')
        content_type = img_file.content_type or "image/jpeg"

        # Tạo data URL cho Gemini
        image_data_url = f"data:{content_type};base64,{image_base64}"

        # Tạo lại UploadFile để upload Cloudinary (vì đã read hết)
        img_file.file = io.BytesIO(image_bytes)
        await img_file.seek(0)

        # Chạy upload Cloudinary bất đồng bộ (không đợi)
        cloudinary_task = asyncio.create_task(
            cloudinary_service.upload_image(
                file=img_file,
                user_id=user.id,
                optimize=True,
            )
        )

        print("=====>IMAGE converted to base64 for Gemini")
    else:
        image_data_url = None

    # Format profile to match expected structure
    user_profile = format_user_profile(user_profile)
    print("=====>FORMATTED USER PROFILE:", user_profile)

    async def event_generator():
        try:
            yield f"thread_id: {thread_id}\n\n"

            # Stream analysis từ Gemini (sử dụng base64 image)
            async for event in service.process_request_stream(
                thread_id=thread_id,
                image_url=image_data_url,  # Gửi base64 data URL thay vì Cloudinary URL
                user_query=user_query,
                user_profile=user_profile,
            ):
                # Format SSE
                yield f"data: {json.dumps(event, ensure_ascii=False)}\n\n"

            # Sau khi analysis xong, lấy kết quả upload từ Cloudinary
            if cloudinary_task:
                try:
                    upload_result = await cloudinary_task
                    if upload_result and upload_result.get("secure_url"):
                        yield f"data: {json.dumps({'type': 'image_uploaded', 'content': upload_result}, ensure_ascii=False)}\n\n"
                        print("=====>CLOUDINARY URL:", upload_result.get("secure_url"))
                except Exception as e:
                    logger.error(f"Cloudinary upload failed: {e}")
                    yield f"data: {json.dumps({'type': 'warning', 'content': 'Image analysis completed but upload failed'}, ensure_ascii=False)}\n\n"

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
