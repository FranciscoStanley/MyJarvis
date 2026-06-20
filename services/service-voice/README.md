# service-voice

Serviço de voz — **Piper TTS** local (pt-BR) e contrato STT client-side.

**Autor:** Francisco Stanley Rodrigues Albuquerque

- **Porta**: 3003
- **Swagger**: http://localhost:3003/api/docs

## Stack gratuita

| Função | Implementação |
|--------|---------------|
| TTS | `PiperVoiceAdapter` → container Piper (:5000) |
| STT | Web Speech API no browser (`clientSide: true`) |

Voz padrão: `pt_BR-faber-medium` (português brasileiro).

## Variáveis

| Variável | Padrão | Descrição |
|----------|--------|-----------|
| `PIPER_URL` | `http://piper:5000` | URL do servidor Piper |
| `PIPER_VOICE` | `pt_BR-faber-medium.onnx` | Modelo ONNX |
| `PIPER_LENGTH_SCALE` | `1.08` | Velocidade da fala |

## Endpoints

| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/api/voice/synthesize` | Texto → WAV (Piper) ou fallback browser |
| POST | `/api/voice/transcribe` | Orienta uso do Web Speech API |
| GET | `/api/health` | Health check |

## Desenvolvimento

```bash
npm run start:dev -w service-voice
npm run test:unit -w service-voice
npm run test:integration -w service-voice
```

Requer Piper rodando: `docker compose up -d piper`
