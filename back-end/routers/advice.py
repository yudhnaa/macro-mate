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

logger = setup_logger(__name__)

router = APIRouter(prefix="/advice", tags=["advice"])


class AdviceRequest(BaseModel):
    thread_id: Optional[str] = Field(None, description="thread id của đoạn chat")
    image_url: Optional[str] = Field(None, description="URL hình ảnh món ăn")
    user_query: str = Field(..., min_length=1, description="Câu hỏi của người dùng")


@router.post("/stream")
async def stream_advice(
    request: AdviceRequest,
    user_id: str = Header(..., alias="X-User-ID"),
    service: WorkflowService = Depends(get_workflow_service),
    profile_service: UserProfileService = Depends(get_profile_service),
):
    # Có thể được tạo từ client
    thread_id = request.thread_id or f"user_{user_id}_thread_{uuid.uuid4().hex[:8]}"

    try:
        user_profile = await get_profile_service().get_profile(user_id)
    except Exception as e:
        logger.error(f"Failed to load profile for {user_id}: {e}")
        raise HTTPException(
            status_code=503, detail=f"Cannot fetch user profile: {str(e)}"
        )

    async def event_generator():
        try:
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
