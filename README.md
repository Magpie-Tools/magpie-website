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

The deployment script builds the site and publishes it to the repository's
`gh-pages` branch. It preserves an existing `/docs` directory so the
documentation artifact can be assembled separately.

## Related repositories

- [Distribution and deployment](https://github.com/Kuucheen/magpie)
- [Backend](https://github.com/Magpie-Tools/magpie-backend)
- [Frontend](https://github.com/Magpie-Tools/magpie-frontend)
- [Documentation](https://github.com/Magpie-Tools/magpie-docs)

## License

Magpie is distributed under the GNU Affero General Public License v3.0.
