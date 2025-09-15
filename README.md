# Digitale visitekaart

Eenvoudige, statische webapp die een digitale visitekaart toont en bewerkbaar maakt. Via het serverless endpoint `/api/generate` kun je met OpenAI automatisch een korte tagline laten schrijven.

## Preview

- Vercel: https://visitekaart-template.vercel.app (pas de URL aan naar jouw Vercel-project)

## Structuur

```
.
├── api/             # Serverless functions (Node.js)
├── public/          # Statische assets zoals favicon en robots.txt
├── src/             # Front-end broncode (TypeScript + CSS)
├── tests/           # Vitest-tests
├── index.html       # Basis HTML-structuur voor Vite
├── vercel.json      # Vercel configuratie
└── package.json     # Scripts en afhankelijkheden
```

## Aan de slag

1. Installeer afhankelijkheden:
   ```bash
   npm install
   ```
2. Start de ontwikkelserver (http://localhost:5173):
   ```bash
   npm run dev
   ```
3. Bouw de statische site:
   ```bash
   npm run build
   ```

### Formatteren en linten

- Code formatteren met Prettier:
  ```bash
  npm run format
  ```
- Linting uitvoeren:
  ```bash
  npm run lint
  ```

### Testen

Vitest voert de test voor het serverless endpoint uit.

```bash
npm run test
```

## Serverless endpoint `/api/generate`

- Runtime: Node.js 20 (Vercel).
- Vereist environment variable `OPENAI_API_KEY`.
- Stuurt een POST-verzoek naar de OpenAI Responses API en valt terug op Chat Completions.
- Request body (voorbeeld):
  ```json
  {
    "name": "Ada",
    "title": "Engineer",
    "company": "ACME",
    "website": "https://example.com",
    "tone": "vriendelijk, beknopt"
  }
  ```
- Response:
  ```json
  {
    "text": "Voorbeeld van een korte, pakkende tagline"
  }
  ```

## Deployment naar Vercel

1. Maak een nieuw project op [Vercel](https://vercel.com/) en koppel de Git-repo.
2. Stel de volgende build settings in (worden ook via `vercel.json` geleverd):
   - **Build Command:** `npm run build`
   - **Install Command:** `npm install`
   - **Output Directory:** `dist`
3. Zet de environment variable `OPENAI_API_KEY` op zowel *Preview* als *Production*.
4. Na deployment is de preview-URL van Vercel beschikbaar (bijv. `https://visitekaart-template.vercel.app`).

Elke pull request kan een automatische preview krijgen mits Vercel is gekoppeld.

## Continuous Integration

De workflow `.github/workflows/ci.yml` voert linting en tests uit op pull requests.
