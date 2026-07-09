# Google Search Console setup

Goal: get Daniel Oliver's site indexed and ranking for searches like *"Daniel Oliver"*,
*"Daniel Oliver racing"*, *"Daniel Oliver driver"*. Do this **after** the custom domain
`danieloliverracing.com` is attached in Netlify — Search Console should track the real
domain, not the temporary `daniel-oliver-site.netlify.app` address.

> ⚠️ **Why the order matters:** every canonical URL, the sitemap, and the Open Graph tags
> already point at `https://danieloliverracing.com`. Until that domain actually serves the
> site, Google can't verify or index it. So: **attach the domain first, then do the steps
> below.**

---

## 1. Attach the domain in Netlify (prerequisite)

1. Netlify → project **daniel-oliver-site** → **Domain management** → **Add a domain**.
2. Enter `danieloliverracing.com`, follow the prompts to point DNS at Netlify
   (either move the nameservers to Netlify DNS, or add the `A` / `CNAME` records they show).
3. Wait for the SSL certificate to say **"Netlify certificate provisioned"** (usually minutes,
   can take up to a few hours after DNS propagates).
4. Confirm `https://danieloliverracing.com` loads the new site and `https://www.danieloliverracing.com`
   redirects to it.

## 2. Verify ownership in Search Console

1. Go to <https://search.google.com/search-console> and sign in with the Google account you
   want to own the property (e.g. `danielolivertech@gmail.com`).
2. Click **Add property** → choose the **Domain** type (not "URL prefix") → enter
   `danieloliverracing.com`. The Domain property covers http/https + www/non-www + every
   subdomain in one go.
3. Google shows a **TXT record** to add to your DNS. Add it wherever your DNS lives:
   - **Netlify DNS:** project → **Domains** → `danieloliverracing.com` → **DNS records** →
     **Add record** → Type `TXT`, Name `@` (or blank), Value = the string Google gave you.
   - **Registrar DNS:** add the same TXT record in your registrar's DNS panel.
4. Back in Search Console, click **Verify**. (DNS can take a while to propagate; if it fails,
   wait 15–60 min and retry — the record is still correct.)

## 3. Submit the sitemap

1. In Search Console (with the property selected) → left sidebar → **Sitemaps**.
2. Under "Add a new sitemap" enter:  `sitemap-index.xml`
   (full URL: `https://danieloliverracing.com/sitemap-index.xml`)
3. Click **Submit**. Status should become **Success** within a day; it lists every page.

The sitemap is generated automatically on each deploy by `@astrojs/sitemap`, and
`robots.txt` already references it — so you only submit it once. New pages you add via the CMS
show up in it automatically after the next deploy.

## 4. Request indexing for the key pages (optional, speeds things up)

1. In Search Console, paste a URL into the **top search bar** ("Inspect any URL"):
   - `https://danieloliverracing.com/`
   - `https://danieloliverracing.com/about/`
2. Click **Request indexing**. This nudges Google to crawl it sooner than waiting for the
   sitemap sweep. Do this for the homepage and About page at minimum.

## 5. What to expect

- First impressions in Search Console usually appear within **2–7 days**; ranking for the
  name builds over a few weeks as Google trusts the domain.
- To help it rank for "Daniel Oliver racing", link to `danieloliverracing.com` from your
  social profiles (Instagram, LinkedIn, team pages) — inbound links are the biggest lever.
- The site already ships the SEO groundwork: `Person` + `WebSite` structured data (JSON-LD),
  per-page titles/descriptions, canonical URLs, Open Graph/Twitter cards, `robots.txt`, and a
  sitemap. Nothing else to configure in the code.

## 6. Bing (2 minutes, worth it)

Bing powers DuckDuckGo and some others. Go to <https://www.bing.com/webmasters>, and use
**"Import from Google Search Console"** — it copies your verification and sitemap over in one
click. No separate DNS record needed.
