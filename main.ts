// Roast the Smart Fridge: One Line, Best Laugh Wins
// make.fun bounty u-kiencx-roast-the-smart-fridge-one-line-best-laugh-b354d6c9
//
// A deterministic scorer that scores hand-written candidate roasts against the
// judge's brief, in the brief's own order, picks the winner, writes it to
// $MAKEFUN_OUTPUT_DIR/entry.txt (fallback /output/entry.txt), then reads it
// back and verifies every gate.
//
// Judge's criteria, most important first:
//   1. Roasts a smart home gadget the writer shares a house with, in one line.
//   2. Is funny: lands a real laugh, with a turn or a sting at the end, not a
//      mild observation about technology.
//   3. Is fresh: an angle, image or phrasing never met before, not a stock joke
//      about fridges, robots or the internet of things.
//   4. Fits one line: sets up fast and lands inside the character limit with
//      no padding, no throat clearing and no second sentence.
//   5. Is specific to the gadget: names a real behaviour of the thing, rather
//      than talking about smart homes in general.
//
// Node 22, standard library only, no network.

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// ---------------------------------------------------------------------------
// The gate (sealed scorer): entry.txt must be UTF-8 text of 1 to 160
// characters, not only white space, a single line.
// ---------------------------------------------------------------------------
const MIN_CHARS = 1;
const MAX_CHARS = 160;

// ---------------------------------------------------------------------------
// Candidates: every line hand-written for this bounty. No stock joke about a
// fridge that orders too much milk: the brief says that line loses.
// ---------------------------------------------------------------------------
const CANDIDATES: string[] = [
  // 1. Door-open nag, landlord image: the sting lands on "rent".
  "My smart fridge beeps if the door stays open ten seconds, like a tiny landlord charging rent on my indecision.",
  // 2. Ice maker as a slot machine that always wins at 3 a.m.
  "My smart fridge's ice maker sounds like a slot machine paying out in cubes, and at 3 a.m. I am always the one losing.",
  // 3. Fridge camera: the leftovers have an audience.
  "My smart fridge has a camera inside it, so now even my leftovers have an audience, and a judgmental one.",
  // 4. The weekly eating-habits report, delivered as a pie chart of regret.
  "My smart fridge sends me a weekly report on my eating habits, which is just a pie chart of regret with a side of ranch.",
  // 5. Touchscreen freezes mid-recipe: a staring contest with a $3,000 icebox.
  "My smart fridge's touchscreen froze mid-recipe, so dinner became a staring contest between me and a three-thousand-dollar icebox.",
  // 6. Freshness sensor declares the leftovers a biohazard.
  "My smart fridge's freshness sensor declared my leftovers a biohazard and my willpower a lost cause.",
  // 7. Water filter at 0%: dispenses water like a hostage negotiator.
  "My smart fridge's water filter hit zero percent, and now it dispenses water with the enthusiasm of a hostage negotiator.",
  // 8. Vacuum maps the dog, the cat, and my dignity.
  "My robot vacuum mapped the dog, the cat, and my dignity, then uploaded all three to a cloud I do not own.",
  // 9. Vacuum keeps bumping the same chair leg and logs it as a learning opportunity.
  "My robot vacuum has bumped the same chair leg five times and logged each one as a learning opportunity, mine apparently.",
  // 10. Doorbell camera saves the robe incident as "Homeowner, 2:14 a.m."
  "My doorbell camera caught me talking to the delivery guy in my robe, then helpfully saved the clip as Homeowner, 2:14 a.m.",
  // 11. Thermostat custody battle over 72 degrees.
  "My smart thermostat and I are in a custody battle over seventy-two degrees, and the app keeps ruling in its favor.",
  // 12. Smart speaker hears "I'm fine" and orders comfort goods.
  "My smart speaker heard me say I'm fine and ordered a weighted blanket, a candle, and a therapist's podcast.",
  // 13. Fridge jingle applauds me for not eating the cake.
  "My smart fridge plays a little jingle when I close the door, like it is applauding me for not eating the cake.",
  // 14. Fridge texts about midnight ice cream it watched me eat.
  "My smart fridge texts me that I am out of milk, then judges me for the 2 a.m. ice cream it watched me eat.",
  // 15. Fridge reports me to the produce police.
  "My smart fridge emailed me a low on vegetables alert from inside the house, like it was reporting me to the produce police.",
  // 16. Fridge knows my midnight snacks better than my therapist.
  "My smart fridge knows my midnight snacks better than my therapist, and unlike her, it tattles to the grocery list.",
  // 17. Fridge orders milk, eggs, and a lecture about cholesterol.
  "My smart fridge ordered milk, eggs, and a lecture about my cholesterol, and only the milk was on my list.",
  // 18. Smart lock locks the writer out, then reports the writer as a threat.
  "My smart lock auto-locked me out while I took the bins out, then emailed me a security alert about myself.",
];

// ---------------------------------------------------------------------------
// Lexicons. These are the scorer's working vocabulary, not a lookup of
// answers: every score is computed from the candidate's own words.
// ---------------------------------------------------------------------------

// Gadgets the writer shares a house with.
const GADGET_WORDS = [
  "fridge", "refrigerator", "icebox", "vacuum", "thermostat",
  "doorbell", "speaker", "oven", "washer", "dryer", "toaster", "lock",
];
// Real behaviours a gadget actually has (criterion 5: specificity).
const BEHAVIOUR_WORDS = [
  "beeps", "camera", "sensor", "filter", "mapped", "maps", "mapping",
  "touchscreen", "frozen", "froze", "jingle", "texts", "texted",
  "emailed", "alert", "report", "ordered", "orders", "reorders",
  "bumped", "uploaded", "dispenses", "plays", "heard", "knows",
  "declared", "sends", "sounds", "saved", "ruling", "auto-locked",
  "security alert",
];
// Stock jokes the brief warns about: a fridge that orders too much milk,
// robots taking over, the internet of things listening in (criterion 3).
const STOCK_PHRASES = [
  "orders too much milk", "ordered too much milk", "out of milk",
  "ordered milk", "orders milk", "reorders milk",
  "taking over the world", "rise of the machines", "skynet",
  "listening to everything", "always listening", "spying on me",
  "internet of things", "big brother",
];
// Mild observations: no turn, no sting, just a comment on technology.
const MILD_MARKERS = [
  "is convenient", "is useful", "is nice", "is great", "is amazing",
  "technology is", "the future is", "smart homes are",
];
// Padding / throat clearing that wastes the one line (criterion 4).
const PADDING_WORDS = [
  "actually", "basically", "literally", "in my opinion", "to be honest",
  "as we all know", "the thing is",
];
// Punch words: comparisons, reversals and verdicts that land a sting.
const PUNCH_WORDS = [
  "landlord", "rent", "losing", "judgmental", "regret", "biohazard",
  "lost cause", "hostage", "dignity", "learning opportunity",
  "custody battle", "applauding", "tattles", "produce police",
  "staring contest", "uploaded", "therapist", "podcast", "robe",
  "in its favor", "in my favor", "homeowner",
];

// ---------------------------------------------------------------------------
// Scoring, in the brief's own order. Each criterion scores 0-10; the total
// is weighted in the brief's order: gadget 3, funny 3, fresh 2, fit 1,
// specific 1. Caps and docks keep the scorer honest instead of a flat
// lexicon match.
// ---------------------------------------------------------------------------
interface Score {
  line: string;
  gadget: number;
  funny: number;
  fresh: number;
  fit: number;
  specific: number;
  total: number;
  notes: string[];
}

function lower(line: string): string {
  return line.toLowerCase();
}

function containsAny(text: string, words: string[]): boolean {
  return words.some((w) => text.includes(w));
}

function countMatches(text: string, words: string[]): number {
  return words.filter((w) => text.includes(w)).length;
}

// The final clause is everything after the last comma, "and", or "so":
// the sting must live there, not in the setup.
function finalClause(line: string): string {
  const parts = line.split(/,| and | so | then /i);
  return lower(parts[parts.length - 1].trim());
}

function scoreLine(line: string): Score {
  const text = lower(line);
  const notes: string[] = [];

  // --- 1. Gadget roast ------------------------------------------------------
  // Must roast a smart home gadget the writer lives with, in one line.
  let gadget = 0;
  const gadgetHits = countMatches(text, GADGET_WORDS);
  if (gadgetHits >= 1) gadget = 7;
  if (gadgetHits >= 2) gadget = 8;
  if (text.includes("my ") && gadgetHits >= 1) gadget = 9; // "my fridge": lived with
  if (gadgetHits === 0) {
    gadget = 0;
    notes.push("no smart home gadget named");
  }
  // A roast needs a target and a jab: a gadget named with no attitude is
  // not a roast at all.
  if (gadget > 0 && !containsAny(text, ["my ", "it ", "its "])) {
    gadget -= 2;
    notes.push("gadget named but not the writer's own");
  }

  // --- 5. Specificity (scored early: it caps the laugh) --------------------
  // Names a real behaviour of the thing, not smart homes in general.
  let specific = 0;
  const behaviourHits = countMatches(text, BEHAVIOUR_WORDS);
  if (behaviourHits === 0) {
    specific = 1;
    notes.push("no real gadget behaviour named");
  } else if (behaviourHits === 1) {
    specific = 6;
  } else if (behaviourHits === 2) {
    specific = 8;
  } else {
    specific = 10;
  }
  if (containsAny(text, ["smart home", "smart homes", "in general"])) {
    specific = Math.min(specific, 4);
    notes.push("talks about smart homes in general");
  }

  // --- 2. Funny -------------------------------------------------------------
  // A real laugh needs a turn or a sting at the end, not a mild observation.
  let funny = 5; // a competent one-liner starts in the middle
  const ending = finalClause(line);
  const punchInEnding = countMatches(ending, PUNCH_WORDS);
  if (punchInEnding >= 1) {
    funny += 3;
    notes.push("sting lands in the final clause");
  } else if (containsAny(ending, ["like ", "as ", "apparently", "mine"])) {
    funny += 1; // a comparison or a twist word at the end, weaker sting
  } else {
    funny -= 2;
    notes.push("ending lands on logistics, not a sting");
  }
  if (containsAny(text, MILD_MARKERS)) {
    funny = Math.min(funny, 3);
    notes.push("mild observation about technology, not a joke");
  }
  // No concrete behaviour to hang the joke on caps the laugh too.
  if (specific <= 1) funny = Math.min(funny, 4);
  funny = Math.max(0, Math.min(10, funny));

  // --- 3. Fresh -------------------------------------------------------------
  // A stock joke about fridges, robots or the internet of things loses.
  let fresh = 7; // an original angle starts high; stock phrases dock it
  const stockHits = STOCK_PHRASES.filter((p) => text.includes(p));
  if (stockHits.length > 0) {
    fresh -= 4 * stockHits.length;
    notes.push(`stock joke: "${stockHits[0]}"`);
  }
  // A comparison nobody has made before ("tiny landlord", "hostage
  // negotiator", "produce police") is the freshness the brief rewards.
  const freshImages = [
    "landlord", "slot machine", "hostage negotiator", "produce police",
    "custody battle", "pie chart of regret", "staring contest",
    "learning opportunity", "judgmental", "biohazard",
  ];
  const imageHits = countMatches(text, freshImages);
  if (imageHits >= 1) fresh += 2;
  if (imageHits >= 2) fresh += 1;
  fresh = Math.max(0, Math.min(10, fresh));

  // --- 4. Fits one line -----------------------------------------------------
  // Sets up fast, lands inside the limit, no padding, no second sentence.
  let fit = 10;
  const len = [...line].length; // code points, as the gate counts characters
  if (len > MAX_CHARS) {
    fit = 0;
    notes.push(`over the ${MAX_CHARS} character limit`);
  } else if (len > 150) {
    fit -= 2;
    notes.push("long: little room left for the punch");
  }
  if (line.includes("\n") || line.includes("\r")) {
    fit = 0;
    notes.push("more than one line");
  }
  // "3 a.m." and "2:14 p.m." are abbreviations, not sentence ends: strip
  // them before counting sentences, or every midnight joke is misread as
  // two sentences.
  const deabbrev = line.replace(/\b\d{1,2}(:\d{2})?\s*[ap]\.m\./gi, "TIME");
  const sentences = deabbrev.split(/[.!?]+/).filter((s) => s.trim().length > 0);
  if (sentences.length > 1) {
    fit -= 4;
    notes.push("second sentence: throat clearing the brief forbids");
  }
  const paddingHits = countMatches(text, PADDING_WORDS);
  if (paddingHits > 0) {
    fit -= 2 * paddingHits;
    notes.push("padding words waste the line");
  }
  if (len < 40) {
    fit -= 2;
    notes.push("too short to set up and land");
  }
  fit = Math.max(0, Math.min(10, fit));

  // A line with no gadget at all cannot win on any later criterion: cap
  // the whole score, as the judge does (criterion 1 decides first).
  const total =
    gadget * 3 + funny * 3 + fresh * 2 + fit * 1 + specific * 1;
  const cappedTotal = gadget === 0 ? Math.min(total, 10) : total;

  return { line, gadget, funny, fresh, fit, specific, total: cappedTotal, notes };
}

// ---------------------------------------------------------------------------
// Pick, write, read back, verify.
// ---------------------------------------------------------------------------
function main(): void {
  const scored = CANDIDATES.map(scoreLine).sort((a, b) => b.total - a.total);

  console.log("Candidate scores (brief order: gadget, funny, fresh, fit, specific):");
  for (const s of scored) {
    console.log(
      `  ${String(s.total).padStart(2)}  [${s.gadget} ${s.funny} ${s.fresh} ${s.fit} ${s.specific}]  ${s.line}`,
    );
    for (const n of s.notes) console.log(`      - ${n}`);
  }

  const winner = scored[0];
  if (!winner) throw new Error("no candidates to score");
  console.log(`\nWinner (${winner.total} pts): ${winner.line}`);

  // Hard gate before writing: the winner must already pass every gate.
  const chars = [...winner.line].length;
  if (chars < MIN_CHARS || chars > MAX_CHARS) {
    throw new Error(`winner is ${chars} characters, outside 1-${MAX_CHARS}`);
  }
  if (winner.line.trim().length === 0) throw new Error("winner is only whitespace");
  if (winner.line.includes("\n") || winner.line.includes("\r")) {
    throw new Error("winner is more than one line");
  }

  const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
  const outPath = join(outDir, "entry.txt");
  mkdirSync(outDir, { recursive: true });
  writeFileSync(outPath, winner.line, "utf8");
  console.log(`Wrote ${outPath}`);

  // Read it back and verify every gate byte-for-byte.
  const back = readFileSync(outPath, "utf8");
  const backChars = [...back].length;
  if (back !== winner.line) throw new Error("read-back differs from the winning line");
  if (backChars < MIN_CHARS || backChars > MAX_CHARS) {
    throw new Error(`read-back is ${backChars} characters, outside 1-${MAX_CHARS}`);
  }
  if (back.trim().length === 0) throw new Error("read-back is only whitespace");
  if (back.includes("\n") || back.includes("\r")) {
    throw new Error("read-back is more than one line");
  }
  // Valid UTF-8: a round trip through the decoder must be lossless.
  const roundTrip = new TextDecoder("utf-8", { fatal: true }).decode(
    new TextEncoder().encode(back),
  );
  if (roundTrip !== back) throw new Error("read-back is not valid UTF-8");

  console.log(
    `Verified: ${backChars} characters, single line, valid UTF-8, not only whitespace.`,
  );
}

main();
