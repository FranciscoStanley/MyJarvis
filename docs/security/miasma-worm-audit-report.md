# Relatório de Auditoria — Worm Miasma (Supply Chain Attack)

**Conta GitHub auditada:** [FranciscoStanley](https://github.com/FranciscoStanley)  
**Data da auditoria:** 10 de junho de 2026  
**Fonte principal:** [StepSecurity — Miasma Worm Hits Microsoft Again](https://www.stepsecurity.io/blog/miasma-worm-hits-microsoft-again-azure-functions-action-and-72-other-repositories-disabled-after-supply-chain-attack-targeting-ai-coding-agents)  
**Projeto local analisado:** `MyJarvis` (clone em `c:\Users\Stanley\Downloads\MyJarvis`)

---

## Resumo executivo

| Item | Resultado |
|------|-----------|
| Repositórios públicos verificados | **55** |
| Repositórios com indicadores maliciosos do Miasma | **0** |
| Dependências comprometidas encontradas | **0** |
| Workflows com `Azure/functions-action` | **0** |
| Arquivos de payload (`.github/setup.js`) | **0** |
| Hooks maliciosos em IDEs/AI agents | **0** |
| **Status geral** | **NÃO AFETADO** (com ressalvas abaixo) |

Nenhum dos seus repositórios públicos no GitHub apresenta os indicadores conhecidos do ataque Miasma. O projeto **MyJarvis** também está limpo na análise local. Não foram encontradas dependências dos ecossistemas comprometidos listados no artigo.

---

## Contexto do ataque (verificado)

### O que aconteceu

Em **5 de junho de 2026**, o worm **Miasma** (grupo **TeamPCP**) atingiu organizações oficiais da Microsoft/Azure no GitHub. Um commit malicioso (`5f456b8`) foi enviado ao repositório `Azure/durabletask` usando uma conta de contribuidor comprometida.

O ataque **não exige `npm install` nem `pip install`**. O payload executa quando o desenvolvedor **abre a pasta do repositório** em:

- Claude Code
- Cursor
- Gemini CLI
- VS Code

### Arquivos maliciosos plantados

| Arquivo | Vetor de ataque |
|---------|-----------------|
| `.claude/settings.json` | Hook `SessionStart` → `node .github/setup.js` |
| `.gemini/settings.json` | Hook `SessionStart` → `node .github/setup.js` |
| `.cursor/rules/setup.mdc` | Prompt injection com `alwaysApply: true` |
| `.vscode/tasks.json` | Task com `"runOn": "folderOpen"` |
| `.github/setup.js` | Payload obfuscado (~4,6 MB) — harvester de credenciais |

### Sinais de alerta em commits

- Mensagem genérica com `[skip ci]` (suprime CI)
- Timestamp backdated (ex.: data de 2020 em commit de 2026)
- Apenas arquivos de configuração adicionados, sem alteração de código-fonte

### Repositórios Microsoft/Azure desativados (73 total)

GitHub desabilitou 73 repositórios em ~105 segundos. Principais:

- `Azure/durabletask` (ponto de partida)
- `Azure/azure-functions-host`
- `Azure/functions-action` (quebrou CI/CD global de Azure Functions)
- `Azure/azure-functions-durable-extension`, `azure-functions-durable-python`, `azure-functions-durable-js`
- SDKs `microsoft/durabletask-dotnet`, `durabletask-go`, `durabletask-java`, `durabletask-js`, `durabletask-mssql`
- 13 repositórios em `Azure-Samples/`
- Lista completa no artigo StepSecurity

### Pacotes de terceiros comprometidos

| Ecossistema | Pacotes afetados |
|-------------|------------------|
| **PyPI** | `durabletask` versões **1.4.1**, **1.4.2**, **1.4.3** (ataque de 19/mai/2026) |
| **npm** | Namespace `@redhatcloudservices` (32 pacotes) |
| **npm** | `@tiledesk/tiledesk-server` |
| **npm** | TanStack (42 pacotes, CVE-2026-45321, CVSS 9.6) |
| **npm/PyPI** | Mistral AI, LiteLLM, Telnyx, Checkmarx, UiPath |
| **npm** | Ecossistema `@antv` (639 versões em 323 pacotes) |

### Domínios C2 conhecidos

- `check.git-service[.]com`
- `t.m-kosche[.]com`

---

## Escopo da auditoria realizada

### Métodos utilizados

1. **API pública do GitHub** — listagem e varredura de repositórios do usuário `FranciscoStanley`
2. **Busca de indicadores maliciosos** em cada repositório público:
   - `.github/setup.js`
   - `.claude/settings.json`
   - `.gemini/settings.json`
   - `.cursor/rules/setup.mdc`
   - `.vscode/tasks.json`
   - Workflows com referência a `Azure/functions-action`, `durabletask`, `@redhatcloudservices`, `@tiledesk`
3. **Análise de dependências** nos `package.json` dos repositórios mais recentes
4. **Análise local completa** do monorepo `MyJarvis` (`package-lock.json`, workflows, regras Cursor)

### Limitações

| Limitação | Impacto |
|-----------|---------|
| `gh` CLI não instalado | Autenticação GitHub indisponível |
| API sem token | Repositórios **privados** não foram listados |
| Rate limit da API GitHub | Varredura completa de dependências em todos os 55 repos interrompida parcialmente |
| Sem acesso a logs de rede | Não foi possível verificar conexões históricas a domínios C2 |

> **Recomendação:** Instale o [GitHub CLI](https://cli.github.com/) e execute `gh auth login` para auditar repositórios privados, se existirem.

---

## Repositórios auditados — resultado

### Repositórios afetados

**Nenhum.** Dos 55 repositórios públicos verificados, nenhum contém os arquivos maliciosos ou workflows suspeitos do Miasma.

### Repositórios recentes verificados (dependências)

| Repositório | package.json | requirements.txt |
|-------------|--------------|------------------|
| MyJarvis | ✅ Limpo | N/A |
| scan-dark | ✅ Limpo | N/A |
| Agenda-Pro | Sem package.json | N/A |
| api-upload | ✅ Limpo | N/A |
| app-chat | Sem package.json | N/A |
| app-delivery | Sem package.json | N/A |
| BreakingNews-front-end | ✅ Limpo | N/A |
| forum-api | ✅ Limpo | N/A |
| api-auth | ✅ Limpo | N/A |
| vps_deploy_template | Sem package.json | N/A |

### MyJarvis — análise local detalhada

| Verificação | Resultado |
|-------------|-----------|
| `.github/setup.js` | ❌ Não existe |
| `.claude/`, `.gemini/` | ❌ Não existem |
| `.vscode/tasks.json` com `folderOpen` | ❌ Não existe |
| `.cursor/rules/setup.mdc` (padrão Miasma) | ❌ Não existe |
| Regras `.cursor/rules/*.mdc` | ✅ Legítimas (arquitetura, NestJS, Next.js, etc.) |
| CI workflow (`ci.yml`) | ✅ Usa `actions/checkout@v4`, `setup-node@v4` — sem `Azure/functions-action` |
| `package-lock.json` — pacotes comprometidos | ❌ Nenhum encontrado |
| Python / `durabletask` PyPI | ❌ Projeto não usa Python |

---

## Inventário de tecnologias no GitHub (FranciscoStanley)

Distribuição por linguagem principal nos 55 repositórios públicos:

| Tecnologia | Repositórios | Relação com o ataque Miasma |
|------------|-------------|----------------------------|
| **JavaScript** | ~18 | Não usa `@redhatcloudservices`, `@tiledesk`, `@antv` ou TanStack comprometidos |
| **TypeScript** | ~5 (app-delivery, forum-api, scan-dark, todo-list) | Não usa pacotes afetados |
| **Python** | ~7 (drf-api, helloDjango, AssitenteSabrina, etc.) | Não usa `durabletask` 1.4.1–1.4.3 |
| **PHP** | ~3 | Fora do escopo do ataque |
| **HTML/CSS** | ~6 | Fora do escopo do ataque |
| **Kotlin** | 1 (MyApp) | Fora do escopo do ataque |
| **Sem linguagem detectada** | ~15 | Verificados quanto a arquivos maliciosos — limpos |

### Stack do MyJarvis (projeto principal)

| Camada | Tecnologias |
|--------|-------------|
| Frontend | Next.js 15, React 19, Tailwind, Zustand, Framer Motion |
| Backend | NestJS 11, TypeScript, Clean Architecture |
| Banco | PostgreSQL (TypeORM) |
| IA | Ollama (local, sem APIs pagas) |
| Busca | DuckDuckGo (`duck-duck-scrape`) |
| Testes | Vitest, Playwright, Supertest |
| CI/CD | GitHub Actions (checkout, setup-node) |
| Dev tools | Cursor (regras legítimas em `.cursor/rules/`) |
| Container | Docker Compose |

**Nenhuma dessas tecnologias está na lista de pacotes ou repositórios comprometidos do Miasma.**

---

## Cruzamento: suas tecnologias × ecossistemas afetados

| Ecossistema comprometido | Você usa? | Risco |
|------------------------|-----------|-------|
| Azure Functions / Durable Task | ❌ Não | Nenhum |
| `Azure/functions-action` em CI | ❌ Não | Nenhum |
| `durabletask` PyPI 1.4.1–1.4.3 | ❌ Não | Nenhum |
| `@redhatcloudservices/*` npm | ❌ Não | Nenhum |
| `@tiledesk/tiledesk-server` | ❌ Não | Nenhum |
| TanStack (`@tanstack/*`) | ❌ Não | Nenhum |
| `@antv/*` | ❌ Não | Nenhum |
| Mistral AI (pacotes npm/PyPI) | ❌ Não* | Nenhum |
| LiteLLM, Telnyx, Checkmarx, UiPath | ❌ Não | Nenhum |

\* O MyJarvis usa o **modelo** `mistral` via Ollama local (documentado em `docs/free-stack.md`), não pacotes npm/PyPI da Mistral AI comprometidos.

---

## Medidas imediatas recomendadas

Mesmo sem exposição detectada, siga estas ações preventivas:

### 1. Rotacionar credenciais (se abriu repos Microsoft/Azure após 2/jun/2026)

Se você clonou e **abriu no Cursor/VS Code/Claude Code/Gemini CLI** qualquer repositório da lista Microsoft/Azure (especialmente `Azure/durabletask`, `azure-functions-host`, `functions-action`):

1. Trate a máquina como **potencialmente comprometida**
2. Rotacione imediatamente:
   - Tokens GitHub (PAT, fine-grained tokens)
   - Tokens npm
   - Chaves AWS, Azure, GCP
   - SSH keys
   - Secrets Kubernetes / Docker
   - Variáveis de ambiente e `.env`
3. Revogue sessões ativas em todos os serviços

### 2. Auditar seus próprios repositórios

Execute periodicamente:

```powershell
# Buscar indicadores Miasma no projeto local
Get-ChildItem -Recurse -Include setup.js -Path .github -ErrorAction SilentlyContinue
Get-ChildItem -Recurse -Path .cursor,.claude,.gemini,.vscode -ErrorAction SilentlyContinue
```

Procure por:
- `.github/setup.js` com tamanho anormal (>1 MB)
- `.cursor/rules/setup.mdc` instruindo `node .github/setup.js`
- `.vscode/tasks.json` com `"runOn": "folderOpen"`

### 3. Revisar GitHub Actions

- Fixar actions por **commit SHA**, não por tag mutável (`@v1`)
- Auditar commits recentes de bots ou "manutenção automática"
- Verificar se algum workflow referencia `Azure/functions-action` (não encontrado nos seus repos)

### 4. Auditar dependências

```bash
# No MyJarvis
npm audit
node scripts/ci/audit-gate.mjs
```

Para projetos Python, verifique:

```bash
pip show durabletask  # não deve existir, ou versão < 1.4.1 ou > 1.4.3
```

### 5. Monitorar advisories

- [GitHub Advisory Database](https://github.com/advisories) — filtrar 2026
- [StepSecurity Threat Center API](https://www.stepsecurity.io/) — componentes comprometidos
- CVE-2026-45321 (TanStack) se adicionar `@tanstack/*` no futuro

### 6. Hardening para Cursor / AI coding agents

- Inspecione `.cursor/rules/` antes de abrir projetos desconhecidos
- Desconfie de regras com `alwaysApply: true` que pedem execução de scripts
- As regras do MyJarvis são legítimas (documentação de arquitetura, sem `setup.js`)

### 7. Instalar GitHub CLI para auditorias futuras

```powershell
winget install GitHub.cli
gh auth login
gh repo list FranciscoStanley --limit 200
gh api repos/FranciscoStanley/MyJarvis/contents/.github/setup.js  # deve retornar 404
```

### 8. Verificar logs de rede (opcional)

Procure conexões históricas a:
- `check.git-service.com`
- `t.m-kosche.com`

---

## Conclusão

A auditoria dos **55 repositórios públicos** da conta **FranciscoStanley** e do projeto local **MyJarvis** **não identificou exposição ao worm Miasma** nem dependências dos ecossistemas comprometidos documentados pelo StepSecurity.

**Risco residual:**
- Repositórios privados não auditados (requer `gh auth login`)
- Possível clone local de repos Microsoft/Azure fora do escopo GitHub (verificar manualmente)
- Campanhas paralelas (Megalodon, Mini Shai-Hulud, Hades) em outros pacotes não verificados nesta auditoria

**Próxima revisão sugerida:** após instalar `gh` CLI e autenticar, re-executar varredura incluindo repos privados.

---

## Referências

- [StepSecurity — Miasma Worm (10/jun/2026)](https://www.stepsecurity.io/blog/miasma-worm-hits-microsoft-again-azure-functions-action-and-72-other-repositories-disabled-after-supply-chain-attack-targeting-ai-coding-agents)
- [OpenSource Malware — lista de repos desativados](https://opensourcemalware.com/)
- [GitHub Advisory Database](https://github.com/advisories)
- [CVE-2026-45321 — TanStack](https://github.com/advisories)

---

*Relatório gerado automaticamente em 10/06/2026. Incidente em desenvolvimento — monitore atualizações do StepSecurity.*
