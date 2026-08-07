# RealEstatePlatform frontend

Next.js frontend for browsing properties and accessing the administrative interface.

## Requirements

- Node.js compatible with the version of Next.js declared in `package.json`
- npm
- A reachable RealEstatePlatform backend API

## Install

Install the locked dependencies:

```bash
npm ci
```

Copy `.env.example` to `.env.local` when an explicit local API URL is useful. Do not commit real environment files.

## API configuration

`NEXT_PUBLIC_API_BASE_URL` must contain the full absolute API base URL, including the final `/api` segment:

```text
NEXT_PUBLIC_API_BASE_URL=https://api.example.com/api
```

Trailing slashes are removed automatically. The URL must use HTTP or HTTPS, must end in `/api`, and must not contain a duplicated `/api/api` suffix.

When the variable is absent in development, the frontend uses:

```text
http://127.0.0.1:8000/api
```

Production builds fail if the variable is missing or invalid. Variables prefixed with `NEXT_PUBLIC_` are embedded in the browser bundle at build time, so they must never contain secrets. Changing the API URL requires rebuilding the frontend.

Use HTTPS for both frontend and backend in production. If they are hosted on separate origins, configure the backend CORS allowlist for the exact frontend origin.

## Development

Start the development server:

```bash
npm run dev
```

The frontend is available at `http://localhost:3000` by default.

## Verification

```bash
npm run lint
npm run build
```

For a production build, provide the API URL in the build environment. PowerShell example:

```powershell
$env:NEXT_PUBLIC_API_BASE_URL="https://api.example.com/api"
npm run build
```

## Production start

After a successful build:

```bash
npm run start
```
