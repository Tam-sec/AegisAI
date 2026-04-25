import os
import shutil
from pathlib import Path
from typing import Optional
from fastapi import UploadFile
from core.config import get_settings
from core.encryption import encrypt_data, decrypt_data

settings = get_settings()


class FileService:
    def __init__(self):
        self.upload_dir = Path(settings.UPLOAD_DIR)
        self.upload_dir.mkdir(parents=True, exist_ok=True)
        self.max_size = settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024

    def validate_file(self, file: UploadFile) -> bool:
        if file.content_type and file.content_type == "application/pdf":
            return True
        if file.filename and file.filename.lower().endswith(".pdf"):
            return True
        return False

    async def save_file(self, file: UploadFile, candidate_id: int) -> str:
        candidate_dir = self.upload_dir / str(candidate_id)
        candidate_dir.mkdir(exist_ok=True)
        filename = file.filename or "document.pdf"
        file_path = candidate_dir / filename

        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        return str(file_path)

    def delete_candidate_files(self, candidate_id: int):
        candidate_dir = self.upload_dir / str(candidate_id)
        if candidate_dir.exists():
            shutil.rmtree(candidate_dir)

    def get_file_size(self, file_path: str) -> int:
        return os.path.getsize(file_path)
