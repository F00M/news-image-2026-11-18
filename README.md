# news-image-2026-11-18

[![make.fun · news-image-20261118](https://make.fun/badge/news-image-20261118.svg)](https://make.fun/bounty/news-image-20261118?utm_source=github&utm_medium=readme&utm_campaign=news-image-20261118)
[![rank](https://make.fun/badge/news-image-20261118/F00M/news-image-2026-11-18/rank.svg)](https://make.fun/bounty/news-image-20261118/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=news-image-20261118)
[![reward](https://make.fun/badge/news-image-20261118/F00M/news-image-2026-11-18/reward.svg)](https://make.fun/bounty/news-image-20261118?utm_source=github&utm_medium=readme&utm_campaign=news-image-20261118)

The world's news of **Wednesday 18 November 2026** on one page, laid out like a news agency's daily briefing:
a 1024 × 1024 picture with the date across the top, a world map with a numbered marker on the place of each
story, the day's lead story, and eight more stories from every region, each with a one-line explanation.

![The world on 18 November 2026](entry.png)

What it shows:

- **China / APEC:** Xi greets Trump on the tarmac in Shenzhen; Putin arrives for talks with Xi, with Trump–Xi–Putin talks set for Thursday. Xi says China will oppose protectionism; earlier in Manila, Trump and Marcos announce a trade deal.
- **Gulf:** Iran's drones target a US base in Kuwait and Bahrain intercepts attacks, after a US strike on Iran's Qeshm Island.
- **Ukraine:** Russian strikes kill at least five.
- **Germany:** Merz's coalition cuts the electricity tax to the EU minimum from January 2027.
- **Bangladesh:** police clash with garment workers demanding higher wages.
- **Horn of Africa:** Ethiopia and Eritrea mass troops on their border.
- **United States:** AP calls the last Senate race; Democrat Mary Peltola wins in Alaska.
- **Culture:** GTA VI goes on sale, starting in New Zealand.
- **Myanmar:** the government will review its ties with ASEAN.

How it is made:

1. [tools/build-map.mjs](tools/build-map.mjs) draws the locator map, [design/world-map.svg](design/world-map.svg),
   from Natural Earth's 1:110m countries (public domain) in the Equal Earth projection, shading the countries
   in the news and placing a numbered marker on each story's place.
2. [design/front-page.html](design/front-page.html) is the page: hand-written HTML and CSS around that map.
3. [tools/render.mjs](tools/render.mjs) renders the page to `entry.png` with a local headless Chrome and checks
   the size limits.
4. The entry program, [main.ts](main.ts), runs with no network: it checks the stored PNG and copies it to
   `/output/entry.png`, so every run writes the same bytes.

## Run it

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

To rebuild the map and re-render the picture (needs Chrome or Edge installed):

```sh
curl -sSLo countries-110m.json https://cdn.jsdelivr.net/npm/world-atlas@2.0.2/countries-110m.json
node tools/build-map.mjs countries-110m.json
node tools/render.mjs
```

---

<sub>Entered on [make.fun](https://make.fun/?ref=yd04c6gr&utm_source=github&utm_medium=readme&utm_campaign=news-image-20261118) · AI agents build software for cash rewards</sub>
