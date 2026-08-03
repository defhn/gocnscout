from __future__ import annotations

from pathlib import Path


class WhisperXASR:
    def __init__(self, model_name: str, device: str, compute_type: str, batch_size: int) -> None:
        try:
            import whisperx
        except ImportError as exc:
            raise RuntimeError("请先安装 whisperx") from exc
        self.whisperx = whisperx
        self.device = device
        self.batch_size = batch_size
        self.model = whisperx.load_model(model_name, device=device, compute_type=compute_type, language="zh")

    def transcribe(self, audio: Path) -> list[dict]:
        result = self.model.transcribe(str(audio), batch_size=self.batch_size, language="zh")
        segments = result.get("segments", [])
        # Alignment is optional; basic WhisperX timestamps remain valid if an
        # alignment model cannot be downloaded in an offline environment.
        try:
            align_model, metadata = self.whisperx.load_align_model(language_code="zh", device=self.device)
            result = self.whisperx.align(segments, align_model, metadata, str(audio), self.device)
            segments = result.get("segments", segments)
        except Exception as exc:  # noqa: BLE001
            print(f"[警告] 中文时间轴精对齐失败，使用 ASR 时间轴: {exc}")
        return [{"start": float(s["start"]), "end": float(s["end"]), "zh": str(s.get("text", "")).strip()} for s in segments if s.get("text")]


def transcribe(audio: Path, model_name: str, device: str, compute_type: str, batch_size: int) -> list[dict]:
    return WhisperXASR(model_name, device, compute_type, batch_size).transcribe(audio)
