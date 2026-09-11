# Minor Portfolio

Standalone portfolio applicatie voor de HBO-ICT Minor van Steven Heijn.
Gehost via Vercel op [minor.stevenheijn.nl](https://minor.stevenheijn.nl).

## Functionaliteit

- **Bezoekersmodus**: Bezoekers landen direct op het overzicht en kunnen alle sprints, user stories, acceptatiecriteria, bewijslast, beoordelingen en presentaties bekijken en exporteren. Er zijn geen knoppen zichtbaar om wijzigingen aan te brengen en er is geen zichtbare verwijzing naar de login pagina.
- **Adminmodus**: Beheerder logt in via `/login` met `Steven` en krijgt alle bewerk-, toevoeg- en verwijdermogelijkheden zoals in de originele applicatie.
- **Zelfvoorzienend**: Bevat alle initiële data in `data/minor-data.json` en heeft geen externe SQL server of database account nodig voor deployments.

## 🚀 Deployment (Vercel)

1. Koppel deze repository (`redluee/future-proof-met-ai`) aan Vercel.
2. Framework Preset: **Next.js**.
3. Voeg eventueel de optionele environment variables toe:
   - `AUTH_USERNAME`: default `Steven`
   - `AUTH_PASSWORD`: default `Duimpie2.0`
   - `AUTH_SECRET`: willekeurige string voor de sessie cookie
4. Koppel in Vercel het custom domein: `minor.stevenheijn.nl`.
5. Klaar! Zowel publieke bezoekers als beheerder werken out-of-the-box.

## Lokaal draaien

```bash
bun install # of npm install
bun dev     # of npm run dev
```
