# Admin OAuth setup for Decap / Netlify CMS

This document explains how to create a GitHub OAuth App and connect it to the CMS at admin/index.html without committing secrets to the repository.

1) Create a GitHub OAuth App
   - Go to: https://github.com/settings/developers
   - Click "New OAuth App"
   - Application name: BABS 2027 CMS
   - Homepage URL: https://<YOUR_SITE_DOMAIN>/ (or https://your-username.github.io/babs2027/ for GitHub Pages)
   - Authorization callback URL: https://<YOUR_SITE_DOMAIN>/admin/  (ensure the trailing slash)
   - Save and copy the Client ID. Keep the Client Secret secure (do NOT commit it).

2) Configure admin/config.yml
   - Open admin/config.yml and replace the placeholder GITHUB_OAUTH_CLIENT_ID with your Client ID.
   - Example:
       client_id: "abcd1234efgh5678"

   - Do NOT put the client_secret in the repo. The CMS uses the OAuth implicit flow and only needs the public Client ID.

3) Host the site and access /admin/
   - The OAuth flow requires a real HTTPS origin matching the OAuth app settings. Deploy to Vercel, GitHub Pages, or Netlify and then open https://<YOUR_SITE_DOMAIN>/admin/.

4) Alternative: Netlify Identity + Git Gateway
   - If you host on Netlify, enable Identity and Git Gateway and follow Netlify's docs to enable CMS auth without creating a GitHub OAuth App.

5) Testing locally
   - You can test admin/index.html locally using the Netlify CMS proxy or a local test server, but full Git commits require an authenticated host.

If you want, I can create a small sample script to inject the client_id into admin/config.yml from an environment variable during a CI deploy to avoid committing the ID to the repo.
