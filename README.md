# Magpie Website

The React and Vite marketing website for
[magpie.tools](https://magpie.tools).

## Requirements

- Node.js `20+`
- npm

## Development

```bash
npm ci
npm run dev
```

## Validation

```bash
npm run lint
npm run build
```

Cloudflare Web Analytics is optional. Copy `.env.example` to `.env` and set
`VITE_CLOUDFLARE_BEACON_TOKEN` before building to enable it.

## Deployment

```bash
npm run deploy
```

The deployment script builds the site, then publishes it to the root of the
distribution repository's `gh-pages` branch. It preserves the existing
`/docs` directory. Clone `magpie-website` and `magpie` as siblings, or set
`MAGPIE_DISTRIBUTION_REPO` to the local distribution repository path.

Use `MAGPIE_DEPLOY_DRY_RUN=1 npm run deploy` to build and validate without
changing `gh-pages`. Use `MAGPIE_DEPLOY_PUSH=0 npm run deploy` to create the
Pages commit locally without pushing it.

## Related repositories

- [Distribution and deployment](https://github.com/Magpie-Tools/magpie)
- [Backend](https://github.com/Magpie-Tools/magpie-backend)
- [Frontend](https://github.com/Magpie-Tools/magpie-frontend)
- [Documentation](https://github.com/Magpie-Tools/magpie-docs)

## License

Magpie is distributed under the GNU Affero General Public License v3.0.
