# Sincronização com a Wiki GitHub

> **Fonte canônica:** `docs/` no repositório principal. A wiki espelha estes arquivos.

A wiki do MyJarvis vive em um repositório Git separado:

```text
https://github.com/FranciscoStanley/MyJarvis.wiki.git
```

---

## Quando sincronizar

Sempre que alterar documentação em `docs/` que tenha página correspondente na wiki:

- `getting-started.md` → **Getting-Started**
- `deployment.md` → **Deployment**
- `environment-variables.md` → **Environment-Variables**
- `contributing.md` → **Contributing**
- `architecture.md` → **Architecture**
- `api.md` → **API-Reference**
- `project-structure.md` → **Project-Structure**
- `privacy-policy.md` → **Privacy-Policy**
- `terms-of-use.md` → **Terms-of-Use**

---

## Passo a passo

### 1. Gerar páginas locais

```bash
npm run wiki:sync
```

O script `scripts/wiki/sync-from-docs.mjs` copia os arquivos mapeados de `docs/` para `wiki/` com nomes compatíveis com a wiki GitHub.

### 2. Publicar na wiki

```bash
# Clone único (primeira vez)
git clone https://github.com/FranciscoStanley/MyJarvis.wiki.git ../MyJarvis.wiki

# Copiar páginas geradas
cp wiki/*.md ../MyJarvis.wiki/

cd ../MyJarvis.wiki
git add .
git commit -m "docs: sincroniza wiki com docs/ (conversas persistentes)"
git push origin master
```

> **Nota:** a branch padrão da wiki pode ser `master` ou `main` — verifique com `git branch -a`.

### 3. Página inicial

Mantenha `wiki/Home.md` como índice com links para as páginas acima. O script preserva `Home.md` se já existir; na primeira execução, gera um índice básico.

---

## Habilitar a wiki

Se a API retornar 404, ative em **GitHub → Repositório → Settings → Features → Wikis**.

---

## Autor

Francisco Stanley Rodrigues Albuquerque
