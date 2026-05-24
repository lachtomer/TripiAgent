# Skill: Firebase App Hosting

## Objective
Configure deploy for Next.js standalone on Firebase App Hosting.

## Tasks
- `apphosting.yaml` + `firebase.json` (no harmful SPA rewrites)
- `next.config`: `output: 'standalone'`
- Env secrets documented for Firebase Console (mirror `.env.example`)
- Security headers via `next.config` headers — `Permissions-Policy: geolocation=(self)`

## Stop before deploy
List exact CLI commands for human: `firebase login`, `firebase use`, connect GitLab in console.

Do not deploy without user saying "deploy now".
