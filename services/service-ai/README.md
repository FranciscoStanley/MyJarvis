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

## Fluxo de chat

1. Ollama gera resposta + tool calls (busca, abrir app)
2. Buscas executadas via `service-search`
3. Segunda chamada Ollama **sintetiza** resposta conversacional com os resultados
4. `clientActions` retornadas para o frontend executar no navegador (YouTube, Spotify, Gmail, embed)

Confirmação: ações sensíveis exigem `sim`/`não` ou botões na UI antes de `window.open`.

## Desenvolvimento

```bash
npm run start:dev -w service-ai
npm run test -w service-ai
```
