from __future__ import annotations

import os
import subprocess
from pathlib import Path


def run_wav2lip(video: Path, audio: Path, destination: Path) -> None:
    wav2lip_dir = os.getenv("WAV2LIP_DIR")
    checkpoint = os.getenv("WAV2LIP_CHECKPOINT")
    if not wav2lip_dir or not checkpoint:
        raise RuntimeError("使用 --lipsync 前请设置 WAV2LIP_DIR 和 WAV2LIP_CHECKPOINT")
    inference = Path(wav2lip_dir) / "inference.py"
    if not inference.exists():
        raise FileNotFoundError(f"找不到 Wav2Lip inference.py: {inference}")
    subprocess.run([
        "python", str(inference), "--checkpoint_path", checkpoint,
        "--face", str(video), "--audio", str(audio), "--outfile", str(destination),
    ], cwd=wav2lip_dir, check=True)
