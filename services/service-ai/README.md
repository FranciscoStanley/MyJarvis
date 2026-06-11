# service-ai

Cérebro JARVIS — conversação via **Ollama** (IA local, gratuita, MIT).

**Autor:** Francisco Stanley Rodrigues Albuquerque

- **Porta**: 3002
- **Swagger**: http://localhost:3002/api/docs

## Requer

- Ollama em execução (`docker compose up ollama`)
- Modelo baixado: `ollama pull llama3.2`

## Variáveis

- `OLLAMA_BASE_URL` — padrão `http://localhost:11434`
- `OLLAMA_MODEL` — padrão `llama3.2`

## Desenvolvimento

```bash
npm run start:dev -w service-ai
npm run test -w service-ai
```
