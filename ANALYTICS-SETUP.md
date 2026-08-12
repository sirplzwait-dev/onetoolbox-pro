# OneToolBox Analytics + SEO setup

## Google Analytics 4
1. Create/open a Google Analytics 4 web data stream for `https://onetoolbox.in`.
2. Copy the Measurement ID (looks like `G-XXXXXXXXXX`).
3. Open `assets/js/analytics-config.js`.
4. Replace `G-XXXXXXXXXX` with your real Measurement ID.
5. Commit/push the change to GitHub.

The analytics script records page views automatically and useful non-PII actions such as clicks, form submissions, and file selections (file type/count/size only; file names and typed values are not sent). GA4 itself provides timestamp, page, device category, browser, OS, country/region, traffic source, and other standard reports.

## Search Console
Submit:
`https://onetoolbox.in/sitemap.xml`

Then use URL Inspection for important pages and request indexing where appropriate.

## Important
Do not put names, email addresses, phone numbers, file names, or user-entered text into analytics event parameters.
