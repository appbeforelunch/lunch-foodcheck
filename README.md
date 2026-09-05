# Pregnancy Food Check

Type a food, see whether public health guidance says it is generally **safe**, needs **caution**, or should be **avoided** in pregnancy, with a link to the exact FDA, ACOG, or CDC page the rule came from. If a food is not in the table, the app says so. It never guesses.

**Not medical advice.** This is a lookup over public guidance. Ask your doctor or midwife.

Built by Claude Code for App Before Lunch, episode 3. The prompt is in `PROMPT.md`. Open `index.html` in a browser; there is no build step and the app calls no API.

## Tests

```bash
npm install && npx playwright install chromium
node test.mjs
```

Eleven checks: specific answers (sushi, deli turkey, canned light tuna, swordfish, coffee, pasteurized brie, unknown food), the disclaimer, and three citation guards: no rule may cite a hub page, every rule must cite one of the eight allowed pages, and the table must hold at least 60 rules.

## Sources
FDA Listeria (Moms-to-Be), FDA/EPA Advice About Eating Fish, ACOG How much coffee can I drink while pregnant, CDC Safer Food Choices for Pregnant Women, CDC Preventing Listeria Infection. Two more pages were allowed but ended up unused after the citation audit.
