from __future__ import annotations

from pathlib import Path
import time

from dotenv import load_dotenv

from asr import transcribe
from lipsync import run_wav2lip
from media import burn_subtitles, extract_video_audio, media_kind, mux_audio, normalize_audio
from subtitles import write_script, write_srt
from translator import DeepSeekTranslator
from tts import synthesize_timeline


def process(source: Path, output_root: Path, args, is_batch: bool) -> None:
    kind = media_kind(source)
    # Keep the requested output/english_* layout for one file. Batch jobs get
    # an isolated directory per input to avoid overwriting results.
    destination = output_root / source.stem if is_batch else output_root
    destination.mkdir(parents=True, exist_ok=True)
    work = destination / "work"
    work.mkdir(exist_ok=True)
    wav = work / "normalized.wav"
    started = time.perf_counter()
    if kind == "video":
        extract_video_audio(source, wav)
    else:
        normalize_audio(source, wav)
    print(f"[计时] 音频标准化: {time.perf_counter() - started:.1f}s")
    stage = time.perf_counter()
    segments = transcribe(wav, args.asr_model, args.device, args.compute_type, args.batch_size)
    print(f"[计时] WhisperX ASR: {time.perf_counter() - stage:.1f}s ({len(segments)} 段)")
    write_srt(segments, destination / "chinese_subtitle.srt", "zh")
    stage = time.perf_counter()
    segments = DeepSeekTranslator().translate(segments)
    print(f"[计时] DeepSeek 翻译: {time.perf_counter() - stage:.1f}s")
    write_srt(segments, destination / "english_subtitle.srt", "en")
    write_script(segments, destination / "english_script.txt", "en")
    stage = time.perf_counter()
    english_audio = destination / "english_audio.mp3"
    synthesize_timeline(segments, english_audio, work)
    print(f"[计时] CosyVoice TTS: {time.perf_counter() - stage:.1f}s")
    if kind == "video":
        video_with_audio = work / "dubbed_video.mp4"
        mux_audio(source, english_audio, video_with_audio)
        if args.lipsync:
            stage = time.perf_counter()
            lipsynced = work / "lipsynced_video.mp4"
            run_wav2lip(source, english_audio, lipsynced)
            print(f"[计时] Wav2Lip 嘴型同步: {time.perf_counter() - stage:.1f}s")
            stage = time.perf_counter()
            burn_subtitles(lipsynced, destination / "english_subtitle.srt", destination / "english_video.mp4")
            print(f"[计时] 字幕烧录: {time.perf_counter() - stage:.1f}s")
        else:
            stage = time.perf_counter()
            burn_subtitles(video_with_audio, destination / "english_subtitle.srt", destination / "english_video.mp4")
            print(f"[计时] 字幕烧录: {time.perf_counter() - stage:.1f}s")
    if not args.keep_work:
        for item in work.iterdir():
            if item.is_file():
                item.unlink()
        work.rmdir()
    print(f"完成: {source} -> {destination}")


def run(sources: list[Path], output_root: Path, args) -> None:
    # Load project credentials first, then allow tool-local values to override
    # them. Secrets stay in the existing untracked project .env.local file.
    project_env = Path(__file__).resolve().parents[2] / ".env.local"
    load_dotenv(project_env)
    load_dotenv(Path(__file__).with_name(".env"), override=True)
    is_batch = len(sources) > 1
    for source in sources:
        try:
            process(source, output_root, args, is_batch)
        except Exception as exc:  # noqa: BLE001
            print(f"[失败] {source}: {exc}")
