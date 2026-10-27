# Lab Try AI: AI Prompt Builder for Etsy & KDP sellers

A static site (HTML/CSS/vanilla JS). It has no backend and makes no AI API calls. It builds structured prompts that users paste into ChatGPT, Claude, Grok or Gemini.

Live domain (planned): https://labtryai.com (GitHub Pages, `CNAME` file included).

## Run locally
```bash
cd /workspace/promptbuilder && python3 -m http.server 8765
# open http://localhost:8765
python3 tests/e2e.py   # headless end-to-end test (Playwright + Chrome); also regenerates screenshots
```

## Files
| File | Purpose |
|---|---|
| `config.js` | **All config**: brand name, price, `PAYMENT_LINK_URL`, `GUMROAD_PRODUCT_ID`, `UNLOCK_CODES` (fallback), `EMAIL_FORM_ACTION`, contact email |
| `refund.html`, `privacy.html`, `terms.html` | Plain legal pages. **These are templates, not legal advice.** Have them reviewed if revenue grows |
| `og.png` | 1200×630 social share image |
| `CNAME` | `labtryai.com` for GitHub Pages |
| `templates.js` | All 17 prompt templates (6 free, 11 Pro), with the Etsy/KDP rule blocks |
| `app.js` | Builder UI, Pro gating, copy and "Open in" links, email form |
| `index.html` | Landing page, builder, example, pricing, FAQ, email signup |
| `tools.html` + `tools.json` | AI tools directory grouped by job. Edit the JSON to update it |
| `styles.css`, `favicon.svg` | Styling |
| `sitemap.xml`, `robots.txt`, `llms.txt` | SEO and AI-crawler summary. Replace `https://example.com` with the real domain |
| `samples.md` | Real generated prompts (Etsy + KDP) |
| `tests/e2e.py` | Tests every template, the lock/unlock flow, the tools page and JS errors |
| `screenshots/` | landing.png, builder.png, mobile.png |

## Pro unlock (Gumroad licence keys)
- With `GUMROAD_PRODUCT_ID` set, "Enter your unlock code" sends the buyer's key straight from the browser to `POST https://api.gumroad.com/v2/licenses/verify` (`product_id`, `license_key`, `increment_uses_count=false`). Gumroad's API allows CORS (`Access-Control-Allow-Origin: *`, checked 2026-10-27). Pro unlocks only if the API returns `success` and the purchase isn't refunded, charged back or disputed. The result is cached in localStorage.
- With `GUMROAD_PRODUCT_ID` empty, it falls back to the shared `UNLOCK_CODES` (honour system).
- It's still client-side, so a technical user could bypass it by editing localStorage or reading the source. That's acceptable for a $19 MVP. A real fix needs a server-side check and Pro templates kept off the public bundle.
- **Owner setup:** create the Gumroad product ($19 one-time) and turn on *Generate a unique license key per sale*. Copy the **product_id** shown in that licence-key section into `GUMROAD_PRODUCT_ID` (products created before Jan 2023 may need the permalink instead). Put the product URL in `PAYMENT_LINK_URL`, and add receipt text such as "Paste your licence key at labtryai.com → Enter your unlock code".
- Lemon Squeezy alternative: its License API (`/v1/licenses/validate`) could be swapped into `verifyKey()` in `app.js`. It hasn't been tested here.

## Platform limits used (checked against KDP help pages, 2026-10-26)
- Etsy: title ≤140 chars, 13 tags ≤20 chars each.
- KDP: title+subtitle ≤200 chars, 7 keyword slots ≤50 chars each, description ≤4,000 chars (HTML counts), no trademarks, "bestselling", "free", URLs or reviews.

## Launch checklist
1. **Domain.** Register labtryai.com (paid, needs approval).
2. **GitHub Pages.** Create a GitHub repo, push this repo, then go to Settings → Pages, deploy from branch `main` / root, set the custom domain to `labtryai.com` and enable Enforce HTTPS.
3. **DNS at the registrar.** Add A records for `@` → 185.199.108.153, 185.199.109.153, 185.199.110.153, 185.199.111.153; optionally AAAA records → 2606:50c0:8000::153, 8001::153, 8002::153, 8003::153; and a CNAME for `www` → `<github-username>.github.io`. Verifying the domain in GitHub account settings is recommended.
4. **Gumroad.** Set up the product as described above, then fill in `PAYMENT_LINK_URL` and `GUMROAD_PRODUCT_ID`. Gumroad acts as merchant of record and handles sales tax. Note its fees.
5. **Email.** Use Formspree or Tally (free), or Resend/MailerLite, and put the endpoint in `EMAIL_FORM_ACTION`. Then update privacy.html to name the provider.
6. **Analytics (optional).** Plausible, Umami or Cloudflare Web Analytics. Update privacy.html if you add one.
7. **Contact email.** Set `CONTACT_EMAIL` to a real inbox; it's currently a hello@labtryai.com placeholder.
8. **Distribution.** Etsy/KDP communities, Pinterest and the owner's brand channels.
