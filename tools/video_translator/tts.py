from __future__ import annotations

import base64
import os
import time
from io import BytesIO
from pathlib import Path

import requests
from pydub import AudioSegment


class CosyVoiceClient:
    def __init__(self) -> None:
        self.provider = os.getenv("COSYVOICE_PROVIDER", "generic").lower()
        self.url = os.getenv("COSYVOICE_API_URL")
        self.api_key = os.getenv("COSYVOICE_API_KEY") or os.getenv("DASHSCOPE_API_KEY")
        self.clone_id = os.getenv("COSYVOICE_CLONE_ID")
        self.model = os.getenv("COSYVOICE_MODEL", "cosyvoice-v3-flash")
        if self.provider == "dashscope":
            self.url = self.url or "https://dashscope.aliyuncs.com/api/v1/services/audio/tts/SpeechSynthesizer"
        if not self.url or not self.api_key or not self.clone_id:
            raise RuntimeError("需要设置 CosyVoice API 地址、API Key 和 COSYVOICE_CLONE_ID")

    def synthesize(self, text: str, destination: Path) -> None:
        headers = {"Content-Type": "application/json"}
        if self.api_key:
            headers["Authorization"] = f"Bearer {self.api_key}"
        if self.provider == "dashscope":
            payload = {
                "model": self.model,
                "input": {
                    "text": text,
                    "voice": self.clone_id,
                    "format": "wav",
                    "sample_rate": 24000,
                    "language_hints": ["en"],
                },
            }
        else:
            payload = {
                os.getenv("COSYVOICE_TEXT_FIELD", "text"): text,
                os.getenv("COSYVOICE_VOICE_FIELD", "voice_id"): self.clone_id,
            }
        for attempt in range(3):
            try:
                response = requests.post(self.url, headers=headers, json=payload, timeout=180)
                response.raise_for_status()
                break
            except requests.RequestException:
                if attempt == 2:
                    raise
                time.sleep(2 ** attempt)
        content_type = response.headers.get("content-type", "")
        if "audio" in content_type or response.content[:4] in {b"RIFF", b"ID3", b"\xff\xfb"}:
            destination.write_bytes(response.content)
            return
        data = response.json()
        nested_audio_url = data.get("output", {}).get("audio", {}).get("url")
        if nested_audio_url:
            audio = requests.get(nested_audio_url, timeout=180)
            audio.raise_for_status()
            destination.write_bytes(audio.content)
            return
        if data.get("audio_base64"):
            destination.write_bytes(base64.b64decode(data["audio_base64"]))
            return
        if data.get("audio_url"):
            audio = requests.get(data["audio_url"], timeout=180)
            audio.raise_for_status()
            destination.write_bytes(audio.content)
            return
        raise RuntimeError("CosyVoice 返回中没有 audio_base64 或 audio_url")


def synthesize_timeline(segments: list[dict], destination: Path, work_dir: Path) -> None:
    client = CosyVoiceClient()
    mixed = AudioSegment.silent(duration=0)
    for index, segment in enumerate(segments):
        clip_path = work_dir / f"tts_{index:05d}.wav"
        client.synthesize(segment["en"], clip_path)
        clip = AudioSegment.from_file(clip_path)
        start_ms = int(float(segment["start"]) * 1000)
        required_ms = start_ms + len(clip)
        if len(mixed) < required_ms:
            mixed += AudioSegment.silent(duration=required_ms - len(mixed))
        mixed = mixed.overlay(clip, position=start_ms)
    mixed.export(destination, format="mp3", bitrate="192k")
