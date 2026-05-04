let opened = false;

function openLetter() {
  if (opened) return;
  opened = true;

  let envelope = document.querySelector(".envelope");
  let letter = document.getElementById("letter");

  envelope.classList.add("open");

  setTimeout(() => {
    letter.classList.add("show");
    typeText();
  }, 600);
}

/* Typewriter effect */
function typeText() {
  const text = "I’m really sorry, my love. I accidentally upset the most precious and adorable person in my life — you. Please forgive me if i hurt or wasted even a little of your precious time. I promis i didn\'t mean to.";
  let i = 0;
  let speed = 40;

  function typing() {
    if (i < text.length) {
      document.getElementById("text").innerHTML += text.charAt(i);
      i++;
      setTimeout(typing, speed);
    }
  }

  typing();
}