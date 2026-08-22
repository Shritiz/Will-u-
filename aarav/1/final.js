function reveal(card, text) {
  if (card.classList.contains("revealed")) return;

  card.classList.add("revealed");

  // Delay text for smoother effect
  setTimeout(() => {
    card.innerHTML = text;
  }, 250);
}