let progress = document.getElementById("progress");
let percentText = document.getElementById("percent");
let button = document.getElementById("btn");
let warning = document.getElementById("warning");

let value = 0;
let max = 120; // yes, over 100 for fun effect 😄

let interval = setInterval(() => {
  value++;

  percentText.innerText = value + "%";
  progress.style.width = (value > 100 ? 100 : value) + "%";

  if (value >= max) {
    clearInterval(interval);

    warning.innerText = "⚠️ Warning: too cute to handle";

    button.disabled = false;
    button.classList.add("enabled");
  }
}, 30);