from dependencies import get_workflow_service
from fastapi import APIRouter, Depends, File, Header, HTTPException, UploadFile
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
from services.cloudinary_service import CloudinaryService, get_cloudinary_service
from services.workflow_service import WorkflowService
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
    user_id: str = Header(None, alias="X-User-ID"),
    cloudinary_service: CloudinaryService = Depends(get_cloudinary_service),
    workflow_service: WorkflowService = Depends(get_workflow_service),
):
    """
    Upload ảnh lên Cloudinary và phân tích ngay

    Workflow:
    1. Upload ảnh lên Cloudinary
    2. Nhận URL
    3. Gọi vision analysis
    4. Trả về kết quả phân tích + URL ảnh
    """
    try:
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

        # Phân tích ảnh
        analysis_result = await workflow_service.analyze_image(image_url)
        analysis_dict = (
            analysis_result.model_dump()
            if hasattr(analysis_result, "model_dump")
            else analysis_result.dict()
        )

        response = {
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
        }

        return JSONResponse(content=response, status_code=200)
    except Exception as e:
        logger.error(f"Failed to analyze image {image_url}: {e}")
        raise HTTPException(status_code=500, detail=f"Image analysis failed: {str(e)}")
