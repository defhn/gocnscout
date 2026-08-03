from __future__ import annotations

import json
import os
import time
from typing import Any

from openai import OpenAI


class DeepSeekTranslator:
    def __init__(self) -> None:
        api_key = os.getenv("DEEPSEEK_API_KEY")
        if not api_key:
            raise RuntimeError("缺少 DEEPSEEK_API_KEY")
        self.client = OpenAI(api_key=api_key, base_url=os.getenv("DEEPSEEK_BASE_URL", "https://api.deepseek.com"))
        self.model = os.getenv("DEEPSEEK_MODEL", "deepseek-v4-flash")

    def translate(self, segments: list[dict]) -> list[dict]:
        translated: dict[int, str] = {}
        # Keep requests small enough for long videos while preserving subtitle IDs.
        for offset in range(0, len(segments), 50):
            batch = segments[offset : offset + 50]
            payload = [{"id": offset + i, "text": s["zh"]} for i, s in enumerate(batch)]
            for attempt in range(3):
                try:
                    response = self.client.chat.completions.create(
                        model=self.model,
                        messages=[
                            {"role": "system", "content": "You translate Chinese subtitles into natural English voiceover for overseas TikTok. Preserve meaning, names, numbers, and professional terminology. Keep each id and output concise spoken English. Return JSON: {\"items\":[{\"id\":0,\"en\":\"...\"}]}. Output JSON only."},
                            {"role": "user", "content": json.dumps(payload, ensure_ascii=False)},
                        ],
                        response_format={"type": "json_object"},
                        thinking={"type": "disabled"},
                        temperature=0.2,
                    )
                    break
                except Exception:
                    if attempt == 2:
                        raise
                    time.sleep(2 ** attempt)
            content = response.choices[0].message.content or "{}"
            items: list[dict[str, Any]] = json.loads(content).get("items", [])
            translated.update({int(item["id"]): str(item["en"]).strip() for item in items if "id" in item and item.get("en")})
        return [{**segment, "en": translated.get(i, segment["zh"])} for i, segment in enumerate(segments)]
