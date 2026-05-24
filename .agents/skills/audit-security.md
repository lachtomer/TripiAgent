# Skill: Security audit

Act as @qa. Check:
- [ ] No secrets in git diff
- [ ] API keys only in server routes
- [ ] Zod on POST `/api/ai` and query params on places/weather/geocode
- [ ] Rate limit on `/api/ai`
- [ ] No `dangerouslySetInnerHTML` without sanitization
- [ ] Dependencies: no known critical vulns (`npm audit` — report only)

Output: `SECURITY.md` snippet or section in HANDOFF.md — do not block on low severity unless user asks.
