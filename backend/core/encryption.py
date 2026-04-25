from cryptography.fernet import Fernet
import base64
import hashlib
from core.config import get_settings

settings = get_settings()


def get_fernet():
    source = settings.ENCRYPTION_KEY or settings.SECRET_KEY
    key = base64.urlsafe_b64encode(hashlib.sha256(source.encode()).digest())
    return Fernet(key)


def encrypt_data(data: str) -> str:
    f = get_fernet()
    return f.encrypt(data.encode()).decode()


def decrypt_data(token: str) -> str:
    f = get_fernet()
    return f.decrypt(token.encode()).decode()


def mask_pii(text: str) -> str:
    import re

    # Mask emails
    text = re.sub(
        r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b", "[EMAIL]", text
    )
    # Mask phone numbers
    text = re.sub(
        r"\b(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b",
        "[PHONE]",
        text,
    )
    return text
