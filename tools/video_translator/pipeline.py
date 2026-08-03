from __future__ import annotations

from pathlib import Path

from dotenv import load_dotenv

from asr import transcribe
from lipsync import run_wav2lip
from media import burn_subtitles, extract_video_audio, media_kind, mux_audio, normalize_audio
from subtitles import write_script, write_srt
from translator import DeepSeekTranslator
from tts import synthesize_timeline


def process(source: Path, output_root: Path, args) -> None:
    kind = media_kind(source)
    destination = output_root / source.stem
    destination.mkdir(parents=True, exist_ok=True)
    work = destination / "work"
    work.mkdir(exist_ok=True)
    wav = work / "normalized.wav"
    if kind == "video":
        extract_video_audio(source, wav)
    else:
        normalize_audio(source, wav)
    segments = transcribe(wav, args.asr_model, args.device, args.compute_type, args.batch_size)
    write_srt(segments, destination / "chinese_subtitle.srt", "zh")
    segments = DeepSeekTranslator().translate(segments)
    write_srt(segments, destination / "english_subtitle.srt", "en")
    write_script(segments, destination / "english_script.txt", "en")
    english_audio = destination / "english_audio.mp3"
    synthesize_timeline(segments, english_audio, work)
    if kind == "video":
        video_with_audio = work / "dubbed_video.mp4"
        mux_audio(source, english_audio, video_with_audio)
        if args.lipsync:
            lipsynced = work / "lipsynced_video.mp4"
            run_wav2lip(source, english_audio, lipsynced)
            burn_subtitles(lipsynced, destination / "english_subtitle.srt", destination / "english_video.mp4")
        else:
            burn_subtitles(video_with_audio, destination / "english_subtitle.srt", destination / "english_video.mp4")
    print(f"完成: {source} -> {destination}")


def run(sources: list[Path], output_root: Path, args) -> None:
    load_dotenv()
    for source in sources:
        try:
            process(source, output_root, args)
        except Exception as exc:  # noqa: BLE001
            print(f"[失败] {source}: {exc}")
