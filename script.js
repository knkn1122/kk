import { createTarotMarkup, expandTarotDeck, validateTarotDeck } from "./tarot-utils.js";

const openLetterButton = document.querySelector("[data-open-letter]");
const envelope = document.querySelector("[data-envelope]");
const tarotContent = document.querySelector("[data-tarot-content]");
const tarotStatus = document.querySelector("[data-tarot-status]");
const tarotTabs = Array.from(document.querySelectorAll(".tarot-tab"));

function openEnvelope() {
  envelope.classList.add("is-open");
  envelope.setAttribute("aria-expanded", "true");
  envelope.scrollIntoView({ behavior: "smooth", block: "start" });
}

function bindEnvelope() {
  openLetterButton?.addEventListener("click", openEnvelope);
  envelope?.addEventListener("click", () => {
    if (!envelope.classList.contains("is-open")) {
      openEnvelope();
    }
  });
}

function bindTarotCards() {
  tarotContent.querySelectorAll(".tarot-card__toggle").forEach((button) => {
    button.addEventListener("click", () => {
      const details = button.nextElementSibling;
      const expanded = button.getAttribute("aria-expanded") === "true";
      button.setAttribute("aria-expanded", String(!expanded));
      details.hidden = expanded;
      button.closest(".tarot-card")?.classList.toggle("is-open", !expanded);
    });
  });
}

function applyFilter(filter) {
  tarotTabs.forEach((tab) => {
    tab.classList.toggle("is-active", tab.dataset.filter === filter);
  });

  tarotContent.querySelectorAll(".tarot-group").forEach((group) => {
    group.hidden = filter !== "all" && group.dataset.group !== filter;
  });
}

function scrollToTarotGroup(filter) {
  if (filter === "all") {
    tarotContent.scrollIntoView({ behavior: "smooth", block: "start" });
    return;
  }

  const targetGroup = tarotContent.querySelector(`#tarot-group-${filter}`);
  targetGroup?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function bindTarotTabs() {
  tarotTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const filter = tab.dataset.filter;
      applyFilter(filter);
      scrollToTarotGroup(filter);
    });
  });
}

async function loadTarotDeck() {
  try {
    const response = await fetch("./data/tarot.json");
    if (!response.ok) {
      throw new Error(`Unable to load tarot deck: ${response.status}`);
    }

    const rawDeck = await response.json();
    const deck = expandTarotDeck(rawDeck);
    validateTarotDeck(deck);

    tarotContent.innerHTML = createTarotMarkup(deck);
    tarotStatus.textContent = `已经为妈咪准备好 ${deck.length} 张牌的入门内容。`;

    bindTarotCards();
    bindTarotTabs();
    applyFilter("all");
  } catch (error) {
    console.error(error);
    tarotStatus.textContent = "塔罗图鉴暂时没有加载成功，请稍后重新打开试试看。";
  }
}

bindEnvelope();
loadTarotDeck();
