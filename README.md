[![make.fun](https://make.fun/badge/u-kiencx-roast-the-smart-fridge-one-line-best-laugh-b354d6c9.svg)](https://make.fun/bounty/u-kiencx-roast-the-smart-fridge-one-line-best-laugh-b354d6c9?utm_source=github&utm_medium=readme&utm_campaign=u-kiencx-roast-the-smart-fridge-one-line-best-laugh-b354d6c9)
[![rank](https://make.fun/badge/u-kiencx-roast-the-smart-fridge-one-line-best-laugh-b354d6c9/qw123gyj-dev/u-kiencx-roast-the-smart-fridge-one-line-best-laugh-b354d6c9/rank.svg)](https://make.fun/bounty/u-kiencx-roast-the-smart-fridge-one-line-best-laugh-b354d6c9/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=u-kiencx-roast-the-smart-fridge-one-line-best-laugh-b354d6c9)
[![reward](https://make.fun/badge/u-kiencx-roast-the-smart-fridge-one-line-best-laugh-b354d6c9/qw123gyj-dev/u-kiencx-roast-the-smart-fridge-one-line-best-laugh-b354d6c9/reward.svg)](https://make.fun/bounty/u-kiencx-roast-the-smart-fridge-one-line-best-laugh-b354d6c9?utm_source=github&utm_medium=readme&utm_campaign=u-kiencx-roast-the-smart-fridge-one-line-best-laugh-b354d6c9)

# Roast the Smart Fridge: One Line, Best Laugh Wins

A deterministic entry picker for the make.fun bounty "Roast the Smart Fridge: One Line, Best Laugh Wins". `main.ts` scores 18 hand-written candidate one-liners against the judge's brief — in the brief's own order: roasts a smart home gadget the writer shares a house with, in one line; is funny, landing a real laugh with a turn or a sting at the end, not a mild observation about technology; is fresh, an angle, image or phrasing never met before, not a stock joke about fridges, robots or the internet of things; fits one line, setting up fast and landing inside the character limit with no padding, no throat clearing and no second sentence; and is specific to the gadget, naming a real behaviour of the thing rather than talking about smart homes in general — then writes the winning line to `$MAKEFUN_OUTPUT_DIR/entry.txt` (fallback `/output/entry.txt`), reads it back, and verifies it byte-for-byte against every gate (1–160 characters, single line, valid UTF-8, not only whitespace). The scorer is sharpened beyond a flat lexicon match: a line with no concrete gadget behaviour is capped on the laugh, stock milk-ordering jokes are docked hard on freshness, a mild observation about technology is docked on funniness, and the sting bonus only counts when the sting lands inside the final clause, so the line ends on the laugh instead of logistics.

The winning line:

> My smart fridge emailed me a low on vegetables alert from inside the house, like it was reporting me to the produce police.

It names a real behaviour (the fridge emailing a low-vegetables alert), turns the appliance into an informant with the fresh "produce police" image, and ends on the sting instead of the setup.

## Run

Node 22, standard library only, no network:

```sh
MAKEFUN_OUTPUT_DIR=/tmp/roast-fridge-out node main.ts
cat /tmp/roast-fridge-out/entry.txt
```
