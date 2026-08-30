# Screenshots

Screenshots referenced from the root `README.md` live here.

They are **not** committed yet. Adding an image that was not captured from a
running build would misrepresent the project, so this directory documents what
to capture rather than shipping placeholders.

## To capture

Run the production build locally so what you capture is what deploys:

```bash
npm run build && npm run start
# http://localhost:3000
```

| Filename | Route | Viewport | Notes |
| --- | --- | --- | --- |
| `homepage-desktop.png` | `/` | 1440 × 900 | Full page, signed out |
| `homepage-mobile.png` | `/` | 390 × 844 | Full page, signed out |
| `community-desktop.png` | `/community` | 1440 × 900 | Shows the full taxonomy |
| `category-desktop.png` | `/community/dog-health` | 1440 × 900 | Breadcrumbs and empty state |
| `sign-in-desktop.png` | `/sign-in` | 1440 × 900 | Auth screen |
| `mobile-nav.png` | any | 390 × 844 | Navigation drawer open |

## Guidelines

- Capture on a device pixel ratio of 2 and save as PNG.
- Keep each file under roughly 500 KB; compress before committing.
- Do not include real personal data or a real signed-in account.
- Retake them whenever the design changes materially — a stale screenshot in a
  portfolio README is worse than none.

After adding the files, uncomment the screenshots section in the root
`README.md`.
