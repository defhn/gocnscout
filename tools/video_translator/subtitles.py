from __future__ import annotations

from pathlib import Path


def timestamp(seconds: float) -> str:
    milliseconds = max(0, int(round(seconds * 1000)))
    hours, remainder = divmod(milliseconds, 3_600_000)
    minutes, remainder = divmod(remainder, 60_000)
    seconds, millis = divmod(remainder, 1000)
    return f"{hours:02d}:{minutes:02d}:{seconds:02d},{millis:03d}"


def write_srt(segments: list[dict], path: Path, text_key: str) -> None:
    lines: list[str] = []
    for index, segment in enumerate(segments, start=1):
        text = str(segment.get(text_key, "")).strip()
        if not text:
            continue
        start = float(segment.get("start", 0))
        end = max(start + 0.05, float(segment.get("end", start + 0.05)))
        lines.extend([str(index), f"{timestamp(start)} --> {timestamp(end)}", text, ""])
    path.write_text("\n".join(lines), encoding="utf-8")


def write_script(segments: list[dict], path: Path, text_key: str) -> None:
    path.write_text("\n".join(str(s.get(text_key, "")).strip() for s in segments if s.get(text_key)), encoding="utf-8")
