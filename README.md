# Hydrogen template: Skeleton

Hydrogen is Shopify’s stack for headless commerce. Hydrogen is designed to dovetail with [Remix](https://remix.run/), Shopify’s full stack web framework. This template contains a **minimal setup** of components, queries and tooling to get started with Hydrogen.

[Check out Hydrogen docs](https://shopify.dev/custom-storefronts/hydrogen)
[Get familiar with Remix](https://remix.run/docs/en/v1)

## What's included

- Remix
- Hydrogen
- Oxygen
- Vite
- Shopify CLI
- ESLint
- Prettier
- GraphQL generator
- TypeScript and JavaScript flavors
- Minimal setup of components and routes

## Getting started

**Requirements:**

- Node.js version 18.0.0 or higher

```bash
npm create @shopify/hydrogen@latest
```

## Building for production

```bash
npm run build
```

## Local development

```bash
npm run dev
```

## Cal.com popup booking

Consultation CTAs are configured with public Cal.com values only. No private
Cal.com API key is required for the popup embed.

Set these environment variables in local and hosted Hydrogen/Oxygen
environments:

```env
PUBLIC_CALCOM_USERNAME=brand-name
PUBLIC_CALCOM_DISCOVERY_EVENT=discovery-call
PUBLIC_CALCOM_INITIAL_EVENT=initial-consultation
```

If the variables are not set, the storefront uses safe placeholder values so
the UI remains usable during development. Booking CTAs always include an
external fallback URL in the form
`https://cal.com/{username}/{event-slug}`; once the Cal.com embed loads in the
browser, the same CTAs open the popup modal instead.

## Setup for using Customer Account API (`/account` section)

Follow step 1 and 2 of <https://shopify.dev/docs/custom-storefronts/building-with-the-customer-account-api/hydrogen#step-1-set-up-a-public-domain-for-local-development>
