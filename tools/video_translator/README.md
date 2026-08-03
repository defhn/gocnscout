# 中文视频/音频 → 英文视频/音频

Windows 命令行工具，支持单文件和批量目录：

1. FFmpeg 将媒体统一为 16 kHz、mono WAV。
2. WhisperX 生成中文稿件、时间轴和中文 SRT。
3. DeepSeek `deepseek-v4-flash` 翻译成适合海外短视频口播的英文。
4. 通过 CosyVoice HTTP API 生成英文语音。
5. 视频可选用 Wav2Lip 合成英文嘴型，并烧录英文字幕。

## 安装

先安装系统依赖：

- FFmpeg，并把 `ffmpeg.exe`、`ffprobe.exe` 加入 PATH。
- Python 3.10 或 3.11。
- NVIDIA 驱动和 CUDA 运行时（RTX 6GB 建议 `compute_type=float16`、`batch_size=1`）。

```powershell
cd tools/video_translator
# 推荐使用短路径，避免 PyTorch 在 Windows 上触发 WinError 206
powershell -ExecutionPolicy Bypass -File .\install_windows.ps1
& C:\vtvenv\Scripts\Activate.ps1
# 先安装与你驱动匹配的 CUDA 版 PyTorch，示例：
copy .env.example .env
```

`install_windows.ps1` 会安装 CUDA PyTorch、WhisperX small 模型、Wav2Lip 仓库和 GAN checkpoint。CosyVoice 仍使用你提供的远程服务地址/声音克隆 ID；脚本不会把声音克隆 ID 或 API Key 写入代码。

## 配置

编辑 `.env`：

```text
DEEPSEEK_API_KEY=sk-...
DEEPSEEK_MODEL=deepseek-v4-flash
COSYVOICE_API_URL=https://your-cosyvoice-service/v1/tts
COSYVOICE_API_KEY=
COSYVOICE_CLONE_ID=your-voice-clone-id
WAV2LIP_DIR=C:\\models\\Wav2Lip
WAV2LIP_CHECKPOINT=C:\\models\\Wav2Lip\\checkpoints\\wav2lip_gan.pth
```

如果使用阿里云百炼，在 `.env` 设置 `COSYVOICE_PROVIDER=dashscope`，把百炼 API Key 填入 `COSYVOICE_API_KEY`（也可使用 `DASHSCOPE_API_KEY`），并设置 `COSYVOICE_CLONE_ID`；程序会调用 CosyVoice HTTP 接口并读取返回的音频 URL。其他 CosyVoice 服务使用 `generic`，默认发送 `{"text":"...", "voice_id":"..."}`。

## 使用

单个视频（默认只生成英文音频，不跑 Wav2Lip）：

```powershell
python video_translator.py input.mp4 --output-dir output --asr-model large-v3 --device cuda
```

生成嘴型同步视频：

```powershell
python video_translator.py input.mp4 --output-dir output --lipsync
```

批量处理文件夹：

```powershell
python video_translator.py .\inputs --output-dir .\output --lipsync
```

单文件输出为 `output/english_audio.mp3`、`output/english_subtitle.srt`、`output/english_script.txt`；视频输入还会生成 `output/english_video.mp4`。批量处理时每个文件使用 `output/<文件名>/` 子目录。

## 说明

- 免费显存较小时使用 `--asr-model small` 或 `medium`，并保持 `--batch-size 1`。
- Wav2Lip 对长视频非常耗时，脚本会先完成 ASR、翻译、TTS，再单独执行嘴型同步。
- API 密钥只从环境变量读取；请勿把 `.env` 提交到 Git。
