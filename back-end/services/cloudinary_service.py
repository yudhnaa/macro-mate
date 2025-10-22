import cloudinary
import cloudinary.uploader
import cloudinary.api
from typing import Dict, Any, Optional, BinaryIO
from fastapi import UploadFile, HTTPException
from config import settings
from utils.logger import setup_logger
import uuid
from datetime import datetime

logger = setup_logger(__name__)

class CloudinaryService:
    def __init__(self):
        try:
            cloudinary.config(
                cloud_name=settings.CLOUDINARY_CLOUD_NAME,
                api_key=settings.CLOUDINARY_API_KEY,
                api_secret=settings.CLOUDINARY_API_SECRET,
                secure=True
            )
            logger.info("Cloudinary configured successfully")
        except Exception as e:
            logger.error(f"Failed to configure Cloudinary: {e}")
            raise
    
    async def upload_image(
        self,
        file: UploadFile,
        user_id: Optional[str] = None,
        optimize: bool = True,
    ) -> Dict[str, Any]:
        try:
            if not file.content_type or not file.content_type.startswith("image/"):
                raise HTTPException(
                    status_code=400,
                    detail=f"Invalid file type. Expected image/*, got {file.content_type}"
               )
            
            file_size = 0
            content = await file.read()
            file_size = len(content)

            if file_size > settings.CLOUDINARY_MAX_FILE_SIZE:
                raise HTTPException(
                    status_code=400,
                    detail=f"File too large. Max size: {settings.CLOUDINARY_MAX_FILE_SIZE / 1024 / 1024}MB"
                )
            
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            unique_id = uuid.uuid4().hex[:8]

            folder_parts = [settings.CLOUDINARY_FOLDER]
            if user_id:
                folder_parts.append(f"user_{user_id}")
            
            folder = "/".join(folder_parts)
            public_id = f"{folder}/{timestamp}_{unique_id}"

            upload_options = {
                "public_id": public_id,
                "resource_type": "image",
                "folder": folder,
                "use_filename": False,
                "unique_filename": False,
                "overwrite": False,
                "invalidate": True,  # Invalidate CDN cache
            }

            if optimize:
                upload_options["transformation"] = [
                    {
                        "quality": "auto:good",
                        "fetch_format": "auto"
                    }
                ]
            
            result = cloudinary.uploader.upload(
                content,
                **upload_options
            )

            logger.info(f"Upload successful: {result['secure_url']}")
            response = {
                "public_id": result["public_id"],
                "url": result["url"],
                "secure_url": result["secure_url"],
                "width": result.get("width"),
                "height": result.get("height"),
                "format": result.get("format"),
                "size": result.get("bytes"),
                "created_at": result.get("created_at"),
            }

            return response
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Cloudinary upload failed: {e}")
            raise HTTPException(
                status_code=500,
                detail=f"Failed to upload image: {str(e)}"
            )
    
    async def upload_from_url(
        self,
        image_url: str,
        user_id: Optional[str] = None
    ) -> Dict[str, Any]:
        try:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            unique_id = uuid.uuid4().hex[:8]
            
            folder_parts = [settings.CLOUDINARY_FOLDER]
            if user_id:
                folder_parts.append(f"user_{user_id}")
            
            folder = "/".join(folder_parts)
            public_id = f"{folder}/{timestamp}_{unique_id}"

            logger.info(f"Uploading from URL: {image_url}")

            result = cloudinary.uploader.upload(
                image_url,
                public_id=public_id,
                folder=folder,
                resource_type="image",
                transformation=[
                    {
                        "quality": "auto:good",
                        "fetch_format": "auto"
                    }
                ]
            )

            logger.info(f"Upload from URL successful: {result['secure_url']}")

            return {
                "public_id": result["public_id"],
                "url": result["url"],
                "secure_url": result["secure_url"],
                "width": result.get("width"),
                "height": result.get("height"),
                "format": result.get("format"),
                "size": result.get("bytes"),
                "created_at": result.get("created_at"),
            }

        except Exception as e:
            logger.error(f"Upload from URL failed: {e}")
            raise HTTPException(
                status_code=500,
                detail=f"Failed to upload from URL: {str(e)}"
            )
    
    async def delete_image(self, public_id: str) -> bool:
        """
        Xóa ảnh khỏi Cloudinary
        
        Args:
            public_id: Public ID của ảnh cần xóa
            
        Returns:
            True nếu xóa thành công
        """
        try:
            result = cloudinary.uploader.destroy(public_id)
            
            if result.get("result") == "ok":
                logger.info(f"Image deleted: {public_id}")
                return True
            else:
                logger.warning(f"Failed to delete: {public_id} - {result}")
                return False

        except Exception as e:
            logger.error(f"Delete failed: {e}")
            return False
    
    def get_optimized_url(
        self,
        public_id: str,
        width: Optional[int] = None,
        height: Optional[int] = None,
        crop: str = "fill",
        quality: str = "auto:good"
    ) -> str:
        """
        Tạo URL với transformation
        
        Args:
            public_id: Public ID của ảnh
            width: Width mong muốn
            height: Height mong muốn
            crop: Crop mode (fill, fit, scale, etc.)
            quality: Quality (auto:good, auto:best, 80, etc.)
            
        Returns:
            Optimized URL
        """
        transformations = {
            "quality": quality,
            "fetch_format": "auto"
        }

        if width:
            transformations["width"] = width
        if height:
            transformations["height"] = height
        if width or height:
            transformations["crop"] = crop

        url = cloudinary.CloudinaryImage(public_id).build_url(**transformations)
        return url

# Singleton instance
_cloudinary_service: Optional[CloudinaryService] = None


def get_cloudinary_service() -> CloudinaryService:
    """
    Dependency injection cho FastAPI
    
    Usage:
        @router.post("/upload")
        async def upload(
            service: CloudinaryService = Depends(get_cloudinary_service)
        ):
            ...
    """
    global _cloudinary_service
    if _cloudinary_service is None:
        _cloudinary_service = CloudinaryService()
    return _cloudinary_service