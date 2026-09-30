# Minor Portfolio

Read-only one-pager voor de HBO-ICT Minor van Steven Heijn, gehost via Vercel op [minor.stevenheijn.nl](https://minor.stevenheijn.nl).

De inhoud komt uit S-Base. Zodra de zelfevaluatie van een sprint is opgeslagen, haalt n8n een opgeschoonde snapshot op en commit `data/minor-snapshot.json` (plus `public/minor/*`) naar deze repo. Vercel bouwt daarna automatisch opnieuw. Data wijzig je dus alleen in S-Base. Zie `AGENTS.md` voor het data-contract.

## Lokaal draaien

```bash
bun install
bun dev
bun test
```

## Deployment (Vercel)

1. Repository `redluee/future-proof-met-ai` gekoppeld aan Vercel, framework preset Next.js, branch `main`.
2. Custom domein `minor.stevenheijn.nl`.
3. Er zijn geen environment variables nodig.
