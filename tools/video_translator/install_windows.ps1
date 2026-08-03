$ErrorActionPreference = "Stop"

# Keep the environment outside the repository so Windows does not hit the
# MAX_PATH limit while installing PyTorch's third-party license files.
$envDir = "C:\vtvenv"
$wav2lipDir = "C:\Wav2Lip"
$python = Join-Path $envDir "Scripts\python.exe"
$pip = Join-Path $envDir "Scripts\pip.exe"

if (-not (Test-Path $python)) {
    py -V:Astral/CPython3.11.15 -m venv $envDir
}

& $pip install --timeout 60 --retries 2 openai python-dotenv requests tqdm pydub gdown
& $pip install --timeout 60 --retries 2 torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu126
& $pip install --timeout 60 --retries 2 whisperx --no-deps
& $pip install --timeout 60 --retries 2 "ctranslate2>=4.5.0" "faster-whisper>=1.2.0" "nltk>=3.9.1" "numpy>=2.1.0" "omegaconf>=2.3.0" "pandas>=2.2.3" "pyannote-audio>=4.0.0" "huggingface-hub<1.0.0" "torchcodec>=0.6.0,<0.8.0" "transformers>=4.48.0"
& $pip install --timeout 60 --retries 2 "librosa>=0.10.2" "opencv-contrib-python>=4.10.0" "scipy>=1.13" "numba>=0.60" soundfile resampy
# WhisperX's dependency resolver may replace CUDA torch with CPU torch. Restore
# the exact CUDA builds required by WhisperX 3.8.x after dependency install.
& $pip install --force-reinstall --no-deps --timeout 60 --retries 2 "torch==2.8.0+cu126" "torchvision==0.23.0+cu126" "torchaudio==2.8.0+cu126" --index-url https://download.pytorch.org/whl/cu126

if (-not (Test-Path (Join-Path $wav2lipDir "inference.py"))) {
    git -c http.proxy= -c https.proxy= clone --depth 1 https://github.com/Rudrabha/Wav2Lip.git $wav2lipDir
}
New-Item -ItemType Directory -Force -Path (Join-Path $wav2lipDir "checkpoints") | Out-Null
$checkpoint = Join-Path $wav2lipDir "checkpoints\wav2lip_gan.pth"
if (-not (Test-Path $checkpoint)) {
    & (Join-Path $envDir "Scripts\gdown.exe") 15G3U08c8xsCkOqQxE38Z2XXDnPcOptNk -O $checkpoint
}

& $python -c "import torch, whisperx; assert torch.cuda.is_available(); print(torch.__version__, torch.cuda.get_device_name(0)); whisperx.load_model('small', device='cuda', compute_type='float16', language='zh'); print('WhisperX small ready')"
Write-Host "安装完成。虚拟环境: $envDir; Wav2Lip: $wav2lipDir"
