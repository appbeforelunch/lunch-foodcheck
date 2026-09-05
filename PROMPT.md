# The prompt (episode 3, App Before Lunch)

Build me a single-file web app that tells a pregnant person whether a food is generally considered safe, needs caution, or should be avoided.

- One index.html, no build step, no backend. A search box with instant results as you type. Works on a phone.
- The rules live in a JSON table inside the file: food, category (safe / caution / avoid), a one-line reason, and a source URL.
  Seed it with at least 60 common foods using ONLY these sources, and every row must carry the URL it came from:
  - FDA, Food Safety for Moms-to-Be: https://www.fda.gov/food/people-risk-foodborne-illness/food-safety-moms-be
  - FDA, Safe Eats food-by-food guide: https://www.fda.gov/food/people-risk-foodborne-illness/safe-eats-food-safety-moms-be
  - FDA, Listeria (Moms-to-Be): https://www.fda.gov/food/health-educators/listeria-food-safety-moms-be
  - FDA/EPA, Advice About Eating Fish: https://www.fda.gov/food/consumers/advice-about-eating-fish
  - ACOG, Healthy Eating During Pregnancy: https://www.acog.org/womens-health/faqs/healthy-eating-during-pregnancy
  - ACOG, How much coffee can I drink while pregnant: https://www.acog.org/womens-health/experts-and-stories/ask-acog/how-much-coffee-can-i-drink-while-pregnant
  - CDC, Safer Food Choices for Pregnant Women: https://www.cdc.gov/food-safety/foods/pregnant-women.html
  - CDC, Preventing Listeria Infection: https://www.cdc.gov/listeria/prevention/index.html
- Show the reason and a "Source" link on every result. Show a permanent disclaimer: "General food-safety guidance from public health agencies. Not medical advice. Ask your doctor or midwife."
- If a food is not in the table, say so plainly. Do not guess and do not generate answers.
- Include a Playwright test file (test.mjs) that checks: sushi = avoid, deli turkey = caution, canned light tuna = safe, swordfish = avoid, coffee = caution, brie made with pasteurized milk = safe, an unknown food = "not in our list", and that the disclaimer is visible. Run the tests in the foreground and wait for them; do not background anything.
- Clean, light UI, calm colors, big type.
