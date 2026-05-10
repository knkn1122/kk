const SECTION_META = [
  { key: "major", title: "大阿卡纳", description: "22 张关于人生课题、转折与内在成长的大牌。" },
  { key: "wands", title: "权杖", description: "火元素，偏向热情、行动、勇气和创造。" },
  { key: "cups", title: "圣杯", description: "水元素，偏向情感、关系、共鸣和温柔。" },
  { key: "swords", title: "宝剑", description: "风元素，偏向思考、表达、判断与真相。" },
  { key: "pentacles", title: "星币", description: "土元素，偏向身体、现实、稳定与长期照顾。" }
];

const REQUIRED_KEYS = [
  "id",
  "arcana",
  "suit",
  "number",
  "nameZh",
  "nameEn",
  "shortLabel",
  "keywords",
  "upright",
  "reversed",
  "lesson",
  "symbolism"
];

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export function expandTarotDeck(source) {
  const majors = source.majors.map((item, index) => ({
    id: `major-${index + 1}`,
    arcana: "major",
    suit: "major",
    number: index,
    nameZh: item[0],
    nameEn: item[1],
    shortLabel: `大阿卡纳 · ${item[0]}`,
    keywords: item[2],
    upright: item[3],
    reversed: item[4],
    lesson: item[5],
    symbolism: "大阿卡纳常象征人生课题、成长阶段与更深层的内在变化。"
  }));

  const minors = [];
  for (const [suitKey, suit] of Object.entries(source.suits)) {
    source.ranks.forEach((rank, index) => {
      const quality = suit.qualities[index % suit.qualities.length];
      const nextQuality = suit.qualities[(index + 1) % suit.qualities.length];
      minors.push({
        id: `${suitKey}-${index + 1}`,
        arcana: "minor",
        suit: suitKey,
        number: index + 1,
        nameZh: `${suit.nameZh}${rank[1]}`,
        nameEn: `${rank[0]} of ${suit.nameZh}`,
        shortLabel: `${suit.nameZh} · ${rank[1]}`,
        keywords: `${rank[2]}、${suit.keywords[index % suit.keywords.length]}`,
        upright: `${rank[3]} 在 ${suit.nameZh} 里，它更多表现为${quality}层面的展开。`,
        reversed: `${rank[4]} 在 ${suit.nameZh} 里，往往提醒你别让${nextQuality}失去平衡。`,
        lesson:
          index === 0
            ? `${suit.element}。${suit.aceLesson}`
            : `${suit.element}。这一张更像关于“${rank[2]}”的一课，提醒人用更温柔的节奏去理解${suit.nameZh}的主题。`,
        symbolism: `${suit.nameZh}对应${suit.element}，常把主题落在${suit.qualities.join("、")}上。`
      });
    });
  }

  return [...majors, ...minors];
}

export function validateTarotDeck(deck) {
  if (!Array.isArray(deck)) {
    throw new Error("Tarot deck must be an array.");
  }

  const ids = new Set();
  for (const card of deck) {
    for (const key of REQUIRED_KEYS) {
      if (card[key] === undefined || card[key] === null || card[key] === "") {
        throw new Error(`Tarot card is missing required key: ${key}`);
      }
    }

    if (ids.has(card.id)) {
      throw new Error(`Duplicate tarot card id: ${card.id}`);
    }
    ids.add(card.id);
  }
}

export function groupTarotCards(deck) {
  return {
    major: deck.filter((card) => card.arcana === "major"),
    wands: deck.filter((card) => card.suit === "wands"),
    cups: deck.filter((card) => card.suit === "cups"),
    swords: deck.filter((card) => card.suit === "swords"),
    pentacles: deck.filter((card) => card.suit === "pentacles")
  };
}

export function createTarotMarkup(deck) {
  const grouped = groupTarotCards(deck);

  return SECTION_META.map((section) => {
    const cards = grouped[section.key];
    return `
      <section class="tarot-group" data-group="${section.key}">
        <header class="tarot-group__header">
          <p class="eyebrow">${section.title}</p>
          <h3>${section.title}</h3>
          <p>${section.description}</p>
        </header>
        <div class="tarot-grid">
          ${cards
            .map(
              (card) => `
                <article class="tarot-card" data-card-name="${escapeHtml(card.nameZh)}">
                  <button class="tarot-card__toggle" type="button" aria-expanded="false">
                    <span class="tarot-card__badge">${escapeHtml(card.shortLabel)}</span>
                    <strong>${escapeHtml(card.nameZh)}</strong>
                    <small>${escapeHtml(card.nameEn)}</small>
                    <span class="tarot-card__keywords">${escapeHtml(card.keywords)}</span>
                  </button>
                  <div class="tarot-card__details" hidden>
                    <p><strong>正位：</strong>${escapeHtml(card.upright)}</p>
                    <p><strong>逆位：</strong>${escapeHtml(card.reversed)}</p>
                    <p><strong>象征：</strong>${escapeHtml(card.symbolism)}</p>
                    <p><strong>学习提示：</strong>${escapeHtml(card.lesson)}</p>
                  </div>
                </article>
              `
            )
            .join("")}
        </div>
      </section>
    `;
  }).join("");
}

export { SECTION_META };
