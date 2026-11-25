# Satoshi font assets — BUNDLED (Task 2.3 COMPLETE)

Satoshi is now **bundled locally** and loaded exclusively from the `.woff2`
binaries in this folder via `./satoshi.css` (`@font-face`). There is **no**
CDN / external network `src` (Req 2.7, 2.8). The `@font-face` family name is
exactly `"Satoshi"`, matching the `--font-family-base: "Satoshi", sans-serif`
stack in `../../tokens/typography.css`, and `font-display: fallback` preserves
the centralized type scale/weight/layout if Satoshi fails to load (Req 2.1, 2.2).

## Bundled files (self-hosted `.woff2`)

Source: the official Fontshare "Satoshi" package
(https://www.fontshare.com/fonts/satoshi), by the Indian Type Foundry.
License: retained in `./LICENSE.txt` (Fontshare Free Font EULA).

| Weight name | font-weight | Style  | File                    | Used by (typography.css)                          |
| ----------- | ----------- | ------ | ----------------------- | ------------------------------------------------- |
| Regular     | 400         | normal | `Satoshi-Regular.woff2` | body, caption, `.text-body`, `.text-caption`      |
| Medium      | 500         | normal | `Satoshi-Medium.woff2`  | `.text-title`, `.text-label`                      |
| Bold        | 700         | normal | `Satoshi-Bold.woff2`    | headings, button, financial figures               |
| Black       | 900         | normal | `Satoshi-Black.woff2`   | `.text-display`                                    |

Note: Light (300) is not bundled because the finalized typography scale
(Task 2.2) does not reference weight 300. If a future style adds it, drop
`Satoshi-Light.woff2` here and add the matching `@font-face` block in
`satoshi.css`.

Do **not** commit any substitute typeface here, and do **not** load Satoshi
from any external/CDN source.
