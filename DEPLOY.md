# Guia de Deploy — Synapse

Como a estrutura do repositório afeta o deploy, e o passo a passo para publicar.

## Estrutura do repositório

| Cenário | Onde fica o app | Ajuste no deploy |
|---------|-----------------|------------------|
| **Repos separados** (recomendado) | raiz do repo do app | nenhum — tudo detectado automaticamente |
| **Monorepo** | subpasta `app/` | apontar o _root directory_ para `app/` |

Fonte da verdade das questões: o repo do **banco** (onde roda o `build_bank.py`).
Ao atualizar, regenere o `ctfl-questions-ptbr.json` e copie para `src/data/` do app.

---

## Opção A — Vercel (recomendada)

A mais simples para apps Vite e a que melhor suporta o PWA (domínio na raiz).

1. Acesse vercel.com e conecte sua conta do GitHub.
2. **Add New → Project** e selecione o repositório do app.
3. A Vercel detecta o Vite automaticamente:
   - Framework: **Vite**
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - **Monorepo:** em _Root Directory_, escolha `app`.
4. **Deploy.** A cada push na branch principal, ela republica sozinha.

Não precisa do GitHub Actions neste caso — a Vercel faz o build do lado dela.

---

## Opção B — Netlify

1. netlify.com → **Add new site → Import an existing project** → GitHub.
2. Configurações:
   - Build command: `npm run build`
   - Publish directory: `dist` (monorepo: `app/dist`)
   - Base directory: vazio (monorepo: `app`)
3. **Deploy site.**

---

## Opção C — GitHub Pages (via Actions)

Use o arquivo `.github/workflows/deploy.yml` já incluído.

1. No repositório: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
2. Faça push na branch `main`. O workflow builda e publica em `https://<usuario>.github.io/<repo>/`.
3. **Monorepo:** ajuste `working-directory` e o `path` do artefato conforme os comentários no `deploy.yml`.

> **Caminhos:** o `vite.config.js` usa `base: "./"` (relativo), então funciona tanto na raiz
> (Vercel/Netlify) quanto em subdiretório (Pages) sem mudança.
>
> **PWA no Pages:** a instalação como app é mais confiável em domínio raiz (Vercel/Netlify).
> Em subdiretório do Pages costuma funcionar, mas é o ambiente menos garantido para o service worker.

---

## Checklist antes do primeiro deploy

- [ ] `npm install && npm run build` passa localmente
- [ ] `npm run preview` abre e a navegação funciona
- [ ] Progresso persiste ao recarregar (localStorage no navegador real)
- [ ] Exportar/Importar progresso funciona
- [ ] Repo no GitHub com a branch principal chamada `main`
