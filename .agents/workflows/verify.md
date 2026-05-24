---
description: Full local verify + browser smoke (no new features)
---

1. @devops — `npm ci && npm run lint && npm run test && npm run build`
2. @qa — `npm run test:e2e` if configured
3. Browser agent — test `http://localhost:3000`: 4 tabs, no API key in page source
4. @handoff — update HANDOFF.md
