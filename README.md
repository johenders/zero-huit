App de comparaison de références vidéo (Comparaprix).

## Setup

### 1) Variables d’environnement

Créer un `.env.local` (ou configurer sur Vercel) :

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `CLOUDFLARE_ACCOUNT_ID`
- `CLOUDFLARE_STREAM_TOKEN`
- `CLOUDFLARE_STREAM_MAX_DURATION_SECONDS` (ex: `3600`)

Voir `.env.example`.

### 2) Base de données (Supabase)

Exécuter dans le SQL Editor Supabase :

1. `supabase/schema.sql`
2. `supabase/policies.sql`
3. `supabase/seed.sql` (optionnel)

Pour donner l’accès admin à ton compte : connecte-toi, puis mets `profiles.role = 'admin'` pour ton `user_id` (dans Supabase).

### 3) Lancer en local

```bash
npm install
npm run dev
```

Ouvrir `http://localhost:3000`.

### TLS (macOS)

Si tu vois `UNABLE_TO_GET_ISSUER_CERT_LOCALLY` sans VPN/proxy explicit, utilise :

```bash
npm run dev:secure
```

Si ça ne suffit pas, il faut exporter le certificat racine (Keychain) qui signe ta connexion (proxy/VPN/antivirus) et le définir via `NODE_EXTRA_CA_CERTS`.

## Admin

La page ` /admin ` permet :

- Ajouter des options (type, mots clés, style, feel, paramètres)
- Uploader une vidéo vers Cloudflare Stream (Direct Upload) et créer l’entrée dans Supabase

Le coeur (favoris) propose un login par courriel (lien magique) via Supabase Auth.
