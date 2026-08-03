from __future__ import annotations

import shutil
import subprocess
from pathlib import Path

VIDEO_EXTENSIONS = {".mp4", ".mov", ".mkv"}
AUDIO_EXTENSIONS = {".mp3", ".wav", ".m4a"}


def media_kind(path: Path) -> str:
    suffix = path.suffix.lower()
    if suffix in VIDEO_EXTENSIONS:
        return "video"
    if suffix in AUDIO_EXTENSIONS:
        return "audio"
    raise ValueError(f"不支持的输入格式: {path.suffix}")


def require_ffmpeg() -> None:
    if not shutil.which("ffmpeg") or not shutil.which("ffprobe"):
        raise RuntimeError("找不到 ffmpeg/ffprobe，请安装 FFmpeg 并加入 PATH")


def run_ffmpeg(args: list[str]) -> None:
    require_ffmpeg()
    command = ["ffmpeg", "-hide_banner", "-loglevel", "error", "-y", *args]
    subprocess.run(command, check=True)


def normalize_audio(source: Path, destination: Path) -> None:
    run_ffmpeg(["-i", str(source), "-vn", "-ac", "1", "-ar", "16000", "-c:a", "pcm_s16le", str(destination)])


def extract_video_audio(source: Path, destination: Path) -> None:
    normalize_audio(source, destination)


def burn_subtitles(video: Path, subtitle: Path, destination: Path) -> None:
    # FFmpeg's subtitles filter needs a colon escaped on Windows paths.
    subtitle_filter_path = subtitle.resolve().as_posix().replace(":", r"\:")
    run_ffmpeg(["-i", str(video), "-vf", f"subtitles='{subtitle_filter_path}'", "-c:a", "copy", str(destination)])


def mux_audio(video: Path, audio: Path, destination: Path) -> None:
    run_ffmpeg(["-i", str(video), "-i", str(audio), "-map", "0:v:0", "-map", "1:a:0", "-c:v", "copy", "-shortest", str(destination)])
