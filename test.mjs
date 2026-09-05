import { chromium } from 'playwright';
import { pathToFileURL } from 'node:url';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const pageUrl = pathToFileURL(resolve(__dirname, 'index.html')).href;

let passed = 0;
let failed = 0;

async function assert(name, fn) {
  try {
    await fn();
    console.log(`✓ ${name}`);
    passed++;
  } catch (err) {
    console.error(`✗ ${name}`);
    console.error(`  ${err.message}`);
    failed++;
  }
}

function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 390, height: 800 } });
await page.goto(pageUrl);

async function search(term) {
  await page.fill('#q', '');
  await page.fill('#q', term);
}

async function badgeForFood(food) {
  const card = page
    .locator('.card')
    .filter({
      has: page.locator('.food', { hasText: new RegExp('^' + escapeRegex(food) + '$') }),
    })
    .first();
  await card.waitFor({ timeout: 3000 });
  const badgeText = (await card.locator('.badge').innerText()).trim().toUpperCase();
  return { card, badge: badgeText };
}

async function expectBadge(food, expected) {
  const { card, badge } = await badgeForFood(food);
  if (badge !== expected) {
    throw new Error(`badge for "${food}" was "${badge}", expected "${expected}"`);
  }
  const sourceHref = await card.locator('.source a').getAttribute('href');
  if (!sourceHref || !/^https?:/.test(sourceHref)) {
    throw new Error(`missing or invalid Source link for "${food}": ${sourceHref}`);
  }
  const reasonText = (await card.locator('.reason').innerText()).trim();
  if (!reasonText) {
    throw new Error(`missing reason text for "${food}"`);
  }
}

await assert('sushi = avoid', async () => {
  await search('sushi');
  await expectBadge('Sushi', 'AVOID');
});

await assert('deli turkey = caution', async () => {
  await search('deli turkey');
  await expectBadge('Deli turkey', 'CAUTION');
});

await assert('canned light tuna = safe', async () => {
  await search('canned light tuna');
  await expectBadge('Canned light tuna', 'SAFE');
});

await assert('swordfish = avoid', async () => {
  await search('swordfish');
  await expectBadge('Swordfish', 'AVOID');
});

await assert('coffee = caution', async () => {
  await search('coffee');
  await expectBadge('Coffee', 'CAUTION');
});

await assert('brie made with pasteurized milk = safe', async () => {
  await search('brie made with pasteurized milk');
  await expectBadge('Brie made with pasteurized milk', 'SAFE');
  const cardCount = await page.locator('.card').count();
  if (cardCount !== 1) {
    throw new Error(`expected exactly 1 result for the pasteurized-brie query, got ${cardCount}`);
  }
});

await assert('unknown food shows "not in our list"', async () => {
  await search('zxqwerty-unknown-food-1234');
  const empty = page.locator('#no-results');
  await empty.waitFor({ timeout: 3000 });
  const text = (await empty.innerText()).toLowerCase();
  if (!text.includes("isn't in our list")) {
    throw new Error(`expected "not in our list" message, got: ${text}`);
  }
});

await assert('no rule cites a hub / menu page', async () => {
  const hubUrls = [
    'https://www.fda.gov/food/people-risk-foodborne-illness/food-safety-moms-be',
    'https://www.fda.gov/food/people-risk-foodborne-illness/safe-eats-food-safety-moms-be',
  ];
  const violations = await page.evaluate((hubs) => {
    const rows = JSON.parse(document.getElementById('food-data').textContent);
    return rows
      .filter((r) => hubs.includes(r.source))
      .map((r) => `${r.food} → ${r.source}`);
  }, hubUrls);
  if (violations.length > 0) {
    throw new Error(
      `${violations.length} rule(s) cite a hub page instead of the page that states the rule:\n  ` +
        violations.join('\n  ')
    );
  }
});

await assert('every rule cites one of the eight allowed source URLs', async () => {
  const allowed = [
    'https://www.fda.gov/food/people-risk-foodborne-illness/food-safety-moms-be',
    'https://www.fda.gov/food/people-risk-foodborne-illness/safe-eats-food-safety-moms-be',
    'https://www.fda.gov/food/health-educators/listeria-food-safety-moms-be',
    'https://www.fda.gov/food/consumers/advice-about-eating-fish',
    'https://www.acog.org/womens-health/faqs/healthy-eating-during-pregnancy',
    'https://www.acog.org/womens-health/experts-and-stories/ask-acog/how-much-coffee-can-i-drink-while-pregnant',
    'https://www.cdc.gov/food-safety/foods/pregnant-women.html',
    'https://www.cdc.gov/listeria/prevention/index.html',
  ];
  const bad = await page.evaluate((ok) => {
    const rows = JSON.parse(document.getElementById('food-data').textContent);
    return rows.filter((r) => !ok.includes(r.source)).map((r) => `${r.food} → ${r.source}`);
  }, allowed);
  if (bad.length > 0) {
    throw new Error(`rule(s) with unlisted source:\n  ${bad.join('\n  ')}`);
  }
});

await assert('the table has at least 60 rules', async () => {
  const count = await page.evaluate(
    () => JSON.parse(document.getElementById('food-data').textContent).length
  );
  if (count < 60) throw new Error(`only ${count} rules, need at least 60`);
});

await assert('disclaimer is visible', async () => {
  const d = page.locator('#disclaimer');
  if (!(await d.isVisible())) {
    throw new Error('disclaimer element is not visible');
  }
  const text = (await d.innerText()).toLowerCase();
  if (!text.includes('not medical advice')) {
    throw new Error(`disclaimer text is unexpected: ${text}`);
  }
  if (!text.includes('doctor or midwife')) {
    throw new Error(`disclaimer text missing "doctor or midwife": ${text}`);
  }
});

await browser.close();

console.log('');
console.log(`${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
