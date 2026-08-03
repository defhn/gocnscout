from __future__ import annotations

import argparse
from pathlib import Path

from pipeline import run


def collect_sources(path: Path) -> list[Path]:
    allowed = {".mp4", ".mov", ".mkv", ".mp3", ".wav", ".m4a"}
    if path.is_file():
        return [path]
    if path.is_dir():
        return sorted(p for p in path.iterdir() if p.is_file() and p.suffix.lower() in allowed)
    raise FileNotFoundError(path)


def main() -> None:
    parser = argparse.ArgumentParser(description="中文视频/音频翻译为英文视频/音频")
    parser.add_argument("input", type=Path, help="媒体文件或输入目录")
    parser.add_argument("--output-dir", type=Path, default=Path("output"))
    parser.add_argument("--asr-model", default="small", help="WhisperX 模型，如 small、medium、large-v3")
    parser.add_argument("--device", default="cuda", choices=["cuda", "cpu"])
    parser.add_argument("--compute-type", default="float16", help="RTX 6GB 建议 float16；CPU 使用 int8")
    parser.add_argument("--batch-size", type=int, default=1)
    parser.add_argument("--lipsync", action="store_true", help="使用本地 Wav2Lip 生成嘴型同步视频")
    args = parser.parse_args()
    sources = collect_sources(args.input)
    if not sources:
        raise SystemExit("输入目录没有找到支持的媒体文件")
    run(sources, args.output_dir, args)


if __name__ == "__main__":
    main()
