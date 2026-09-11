# Minor Portfolio

Standalone portfolio applicatie voor de HBO-ICT Minor van Steven Heijn.
Gehost via Vercel op [minor.stevenheijn.nl](https://minor.stevenheijn.nl).

## Functionaliteit

- **Bezoekersmodus**: Bezoekers landen direct op het overzicht en kunnen alle sprints, user stories, acceptatiecriteria, bewijslast, beoordelingen en presentaties bekijken en exporteren. Er zijn geen knoppen zichtbaar om wijzigingen aan te brengen en er is geen zichtbare verwijzing naar de login pagina.
- **Adminmodus**: Beheerder logt in via `/login` met `Steven` en krijgt alle bewerk-, toevoeg- en verwijdermogelijkheden zoals in de originele applicatie.
- **Zelfvoorzienend**: Bevat alle initiële data in `data/minor-data.json` en heeft geen externe SQL server of database account nodig voor deployments.

## Vercel Deployment

1. Koppel deze repository aan een nieuw Vercel project.
2. Configureer het domein `minor.stevenheijn.nl` in Vercel Project Settings > Domains.
3. (Optioneel) Stel `SESSION_SECRET` in bij Environment Variables (automatische fallback is ingebouwd).
4. (Optioneel) Stel `GITHUB_TOKEN` en `GITHUB_REPO` in als je wijzigingen gemaakt in productie op Vercel direct wilt laten committen naar je repository.

## Lokaal draaien

```bash
bun install # of npm install
bun dev     # of npm run dev
```
