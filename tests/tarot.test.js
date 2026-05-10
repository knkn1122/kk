import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import {
  createTarotMarkup,
  expandTarotDeck,
  groupTarotCards,
  validateTarotDeck
} from "../tarot-utils.js";

const tarotJsonPath = new URL("../data/tarot.json", import.meta.url);

async function loadDeck() {
  const raw = await readFile(tarotJsonPath, "utf8");
  return JSON.parse(raw);
}

async function loadIndexHtml() {
  const indexPath = new URL("../index.html", import.meta.url);
  return readFile(indexPath, "utf8");
}

test("tarot deck contains a valid 78-card structure", async () => {
  const deck = expandTarotDeck(await loadDeck());

  assert.equal(deck.length, 78);
  assert.doesNotThrow(() => validateTarotDeck(deck));
});

test("tarot cards are grouped into the expected five sections", async () => {
  const deck = expandTarotDeck(await loadDeck());
  const grouped = groupTarotCards(deck);

  assert.deepEqual(Object.keys(grouped), [
    "major",
    "wands",
    "cups",
    "swords",
    "pentacles"
  ]);
  assert.equal(grouped.major.length, 22);
  assert.equal(grouped.wands.length, 14);
  assert.equal(grouped.cups.length, 14);
  assert.equal(grouped.swords.length, 14);
  assert.equal(grouped.pentacles.length, 14);
});

test("tarot markup includes section titles and card details", async () => {
  const deck = expandTarotDeck(await loadDeck());
  const markup = createTarotMarkup(deck);

  assert.match(markup, /大阿卡纳/);
  assert.match(markup, /权杖/);
  assert.match(markup, /data-card-name="愚者"/);
  assert.match(markup, /正位/);
  assert.match(markup, /逆位/);
});

test("tarot markup exposes anchor ids for each tarot group", async () => {
  const deck = expandTarotDeck(await loadDeck());
  const markup = createTarotMarkup(deck);

  assert.match(markup, /id="tarot-group-major"/);
  assert.match(markup, /id="tarot-group-wands"/);
  assert.match(markup, /id="tarot-group-cups"/);
  assert.match(markup, /id="tarot-group-swords"/);
  assert.match(markup, /id="tarot-group-pentacles"/);
});

test("letter section keeps a dedicated scroll container outside button markup", async () => {
  const html = await loadIndexHtml();

  assert.match(html, /class="envelope" role="button" tabindex="0"/);
  assert.match(html, /class="letter-sheet__scroll"/);
  assert.doesNotMatch(html, /<button class="envelope"/);
});
