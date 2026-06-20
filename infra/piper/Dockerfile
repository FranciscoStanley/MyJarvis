# Piper TTS — voz britânica masculina (estilo JARVIS)
# Licença: Piper MIT — modelos rhasspy/piper-voices
FROM python:3.12-slim-bookworm

LABEL org.opencontainers.image.authors="Francisco Stanley Rodrigues Albuquerque"

RUN apt-get update && apt-get install -y --no-install-recommends \
    curl libsndfile1 ca-certificates \
    && rm -rf /var/lib/apt/lists/*

RUN pip install --no-cache-dir 'piper-tts[http]'

WORKDIR /data

ARG PIPER_VOICE=en_GB-alan-medium
ENV PIPER_VOICE=${PIPER_VOICE}

RUN curl -fsSL -o en_GB-alan-medium.onnx \
      "https://huggingface.co/rhasspy/piper-voices/resolve/v1.0.0/en/en_GB/alan/medium/en_GB-alan-medium.onnx" \
    && curl -fsSL -o en_GB-alan-medium.onnx.json \
      "https://huggingface.co/rhasspy/piper-voices/resolve/v1.0.0/en/en_GB/alan/medium/en_GB-alan-medium.onnx.json"

EXPOSE 5000

HEALTHCHECK --interval=15s --timeout=5s --retries=3 --start-period=20s \
  CMD curl -fsS http://localhost:5000/voices || exit 1

CMD ["python3", "-m", "piper.http_server", "-m", "en_GB-alan-medium.onnx", "--host", "0.0.0.0", "--port", "5000", "--data-dir", "/data"]
