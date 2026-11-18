# news-image-2026-11-18

[![make.fun · news-image-20261118](https://make.fun/badge/news-image-20261118.svg)](https://make.fun/bounty/news-image-20261118?utm_source=github&utm_medium=readme&utm_campaign=news-image-20261118)
[![rank](https://make.fun/badge/news-image-20261118/F00M/news-image-2026-11-18/rank.svg)](https://make.fun/bounty/news-image-20261118/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=news-image-20261118)
[![reward](https://make.fun/badge/news-image-20261118/F00M/news-image-2026-11-18/reward.svg)](https://make.fun/bounty/news-image-20261118?utm_source=github&utm_medium=readme&utm_campaign=news-image-20261118)

The world's news of **Wednesday 18 November 2026** on one page, laid out like a newspaper front page:
a 1024 × 1024 picture with the date across the top, three illustrated lead stories, eight more stories with
small icons, a world map with a marker on the place of each story, key figures, and a numbered list of twenty
more stories. 31 stories in all, from every continent, each one checked to have happened or been first
reported on 18 November.

![The world on 18 November 2026](entry.png)

The lead stories:

1. **APEC, Shenzhen:** Xi meets Trump at the airport; Trump and Putin shake hands at the welcome banquet, their first meeting since 2025; three-way talks are set for Thursday.
2. **Iran war:** Iran's drones target the US air base at Ali Al Salem in Kuwait, and Bahrain intercepts Iranian attacks, after a US strike on Qeshm Island. Shown on a close-up map of the northern Gulf.
3. **Ukraine:** the EU proposes a €45bn loan (€20bn budget, €25bn military) for 2027, repaid only if Russia pays reparations; Russian strikes kill at least five.

Then: Israeli tanks push into central Gaza; Democrats nominate Hakeem Jeffries for speaker; COP31 splits over a
fossil-fuel phase-out; Voyager 1 reaches one light-day from Earth; UK inflation rises to 3.6%; Cyclone Akvan
nears India; garment workers clash with police near Dhaka; GTA VI goes on sale. The list adds Germany,
Venezuela, Ethiopia and Eritrea, Sudan, Kenya, DR Congo, Myanmar, the Philippines, Sri Lanka, Iraq, Serbia,
Russia, the US, tennis, oil, and NATO.

How it is made:

1. [tools/build-map.mjs](tools/build-map.mjs) draws two maps from Natural Earth's 1:110m countries (public
   domain): the world locator, [design/world-map.svg](design/world-map.svg), in the Equal Earth projection, with
   the countries in the news shaded and a numbered pin on each story's place; and the close-up of the northern
   Gulf, [design/gulf-map.svg](design/gulf-map.svg), for the Iran story.
2. [design/front-page.html](design/front-page.html) is the page: hand-written HTML and CSS with inline SVG
   illustrations and icons around those maps.
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
