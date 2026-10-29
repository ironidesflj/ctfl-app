# Guia de Deploy — Synapse

Vercel é o destino oficial do app. Netlify e GitHub Pages são alternativas.

## Estrutura do repositório

| Cenário                           | Onde fica o app     | Ajuste no deploy                               |
| --------------------------------- | ------------------- | ---------------------------------------------- |
| **Repos separados** (recomendado) | raiz do repo do app | nenhum — tudo detectado automaticamente        |
| **Monorepo**                      | subpasta do app     | apontar o _root directory_ para a pasta do app |

Fonte da verdade das questões: o repo do **banco**. Push de
`ctfl-questions-ptbr.json` ou `synapse-question-bank.json` na `main` dispara o
workflow de sync, que copia os arquivos correspondentes, valida checksums e abre
um PR no app para merge manual.

---

## Opção A — Vercel (recomendada)

A produção oficial usa Vercel, na raiz do domínio, o caminho mais simples para
o roteamento e o service worker do PWA.

1. Acesse vercel.com e conecte sua conta do GitHub.
2. **Add New → Project** e selecione o repositório do app.
3. A Vercel detecta o Vite automaticamente:
   - Framework: **Vite**
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - **Monorepo:** em _Root Directory_, escolha a pasta do app.
4. **Deploy.** A cada push na branch principal, ela republica sozinha.

Não precisa do GitHub Actions neste caso — a Vercel faz o build do lado dela.

---

## Opção B — Netlify

1. netlify.com → **Add new site → Import an existing project** → GitHub.
2. Configurações:
   - Build command: `npm run build`
   - Publish directory: `dist` (monorepo: `<pasta-do-app>/dist`)
   - Base directory: vazio (monorepo: pasta do app)
3. **Deploy site.**

---

## Opção C — GitHub Pages (manual, via Actions)

Use o arquivo `.github/workflows/deploy.yml` já incluído.

1. No repositório: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
2. Dispare manualmente o workflow **Deploy to GitHub Pages**.
3. Em subpath (`https://<usuario>.github.io/<repo>/`), ajuste o comando de
   build para `npm run build -- --base=/<repo>/` e valide as rotas/deep links.
4. O workflow está configurado para o app na raiz do repositório. Para outro
   layout, ajuste `working-directory` e o `path` do artefato em `deploy.yml`.

> **Caminhos:** o `vite.config.js` usa `base: "/"` porque o app usa
> `BrowserRouter`. Deploy em subdiretório exige `--base` e validação adicional
> do fallback de SPA; a produção oficial em domínio raiz não precisa de ajuste.
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
