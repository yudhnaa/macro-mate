import base64
from typing import Optional
from fastapi import UploadFile
from PIL import Image
import io
from utils.logger import setup_logger

logger = setup_logger(__name__)

async def upload_file_to_base64(
        file: UploadFile,
        max_size_mb: int = 5.0,
        optimize: bool = True,
        max_dimension: int = 1024
    ) -> Optional[str]:
    """
    Convert UploadFile to base64 data URI
    
    Args:
        file: FastAPI UploadFile object
        max_size_mb: Maximum file size in MB
        optimize: Compress image if needed
        max_dimension: Max width/height for optimization
    
    Returns:
        Base64 data URI: "data:image/jpeg;base64,..."
    """
    try:
        content = await file.read()
        file_size_mb = len(content) / (1024 * 1024)
        if file_size_mb > max_size_mb:
                raise ValueError(
                    f"File too large ({file_size_mb:.2f}MB). "
                    f"Maximum: {max_size_mb}MB"
                )
        
        content_type = file.content_type or "image/jpeg"

        if optimize:
            try:
                image = Image.open(io.BytesIO(content))
                
                # Resize if too large
                width, height = image.size
                if width > max_dimension or height > max_dimension:
                    ratio = min(max_dimension / width, max_dimension / height)
                    new_size = (int(width * ratio), int(height * ratio))
                    image = image.resize(new_size, Image.Resampling.LANCZOS)
                    logger.info(f"Resized: {width}x{height} → {new_size}")
                
                # Convert to RGB for JPEG
                if image.mode not in ("RGB", "L"):
                    image = image.convert("RGB")
                
                # Save optimized
                output = io.BytesIO()
                image.save(output, format="JPEG", quality=85, optimize=True)
                content = output.getvalue()
                content_type = "image/jpeg"
                
                logger.info(
                    f"Optimized: {file_size_mb:.2f}MB → "
                    f"{len(content) / (1024 * 1024):.2f}MB"
                )
            except Exception as e:
                logger.warning(f"Optimization failed: {e}. Using original.")
        
            base64_str = base64.b64encode(content).decode('utf-8')
            data_uri = f"data:{content_type};base64,{base64_str}"
                
            logger.info(f"Converted to base64 ({len(base64_str) / 1024:.2f}KB)")
            return data_uri
    except Exception as e:
        logger.error(f"Base64 conversion failed: {e}")
        raise ValueError(f"Image processing failed: {str(e)}")
    finally:
        await file.seek(0)

def validate_image_file(file: UploadFile) -> bool:
    """Validate if uploaded file is a valid image"""
    allowed_types = {
        "image/jpeg", "image/jpg", "image/png", 
        "image/webp", "image/heic", "image/heif"
    }
    return file.content_type in allowed_types
