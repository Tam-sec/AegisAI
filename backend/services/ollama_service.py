import httpx
import json
from typing import List, Dict, Any, Optional
from core.config import get_settings

settings = get_settings()


class OllamaService:
    def __init__(self):
        self.base_url = settings.OLLAMA_BASE_URL.rstrip("/")
        self.model = settings.OLLAMA_MODEL
        self.embed_model = settings.OLLAMA_EMBED_MODEL
        self.timeout = settings.OLLAMA_TIMEOUT

    async def health_check(self) -> Dict[str, Any]:
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                resp = await client.get(f"{self.base_url}/api/tags")
                if resp.status_code != 200:
                    return {"healthy": False, "error": "Ollama API unreachable"}
                models = resp.json().get("models", [])
                model_names = [m.get("name", "") for m in models]
                model_available = any(self.model in name for name in model_names)
                return {
                    "healthy": True,
                    "model_available": model_available,
                    "models": model_names,
                }
        except Exception as e:
            return {"healthy": False, "error": str(e)}

    async def generate(
        self, prompt: str, system: str = "", temperature: float = 0.1
    ) -> str:
        payload = {
            "model": self.model,
            "prompt": prompt,
            "system": system,
            "stream": False,
            "options": {"temperature": temperature},
        }
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            resp = await client.post(f"{self.base_url}/api/generate", json=payload)
            resp.raise_for_status()
            data = resp.json()
            return data.get("response", "").strip()

    async def embed(self, texts: List[str]) -> List[List[float]]:
        embeddings = []
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            for text in texts:
                payload = {"model": self.embed_model, "prompt": text}
                resp = await client.post(
                    f"{self.base_url}/api/embeddings", json=payload
                )
                resp.raise_for_status()
                data = resp.json()
                embeddings.append(data.get("embedding", []))
        return embeddings

    async def chat(
        self, messages: List[Dict[str, str]], temperature: float = 0.3
    ) -> str:
        payload = {
            "model": self.model,
            "messages": messages,
            "stream": False,
            "options": {"temperature": temperature},
        }
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            resp = await client.post(f"{self.base_url}/api/chat", json=payload)
            resp.raise_for_status()
            data = resp.json()
            return data.get("message", {}).get("content", "").strip()


ollama_service = OllamaService()
