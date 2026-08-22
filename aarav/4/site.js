function initCakePage() {
    const cakeScene = document.querySelector("[data-cake-scene]");

    if (!cakeScene) {
        return;
    }

    const candles = Array.from(cakeScene.querySelectorAll("[data-candle]"));
    const progressText = document.getElementById("candleProgressText");
    const modal = document.getElementById("cakeSuccessModal");
    let extinguishedCount = 0;

    function syncProgress() {
        const remaining = candles.length - extinguishedCount;
        const label = remaining === 1 ? "candle" : "candles";
        progressText.textContent = `${remaining} ${label} still glowing`;
    }

    function showModal() {
        if (!modal || !modal.hidden) {
            return;
        }

        modal.hidden = false;
        window.requestAnimationFrame(function () {
            modal.classList.add("is-visible");
        });
    }

    candles.forEach(function (candle) {
        const candleX = candle.getAttribute("data-candle-x");
        const candleY = candle.getAttribute("data-candle-y");
        const flameButton = candle.querySelector(".candle-flame");

        if (candleX !== null) {
            candle.style.setProperty("--candle-x", `${candleX}%`);
        }

        if (candleY !== null) {
            candle.style.setProperty("--candle-y", `${candleY}%`);
        }

        if (!flameButton) {
            return;
        }

        flameButton.addEventListener("click", function () {
            if (flameButton.classList.contains("is-out")) {
                return;
            }

            flameButton.classList.add("is-out", "is-smoking");
            flameButton.disabled = true;
            extinguishedCount += 1;
            syncProgress();

            window.setTimeout(function () {
                flameButton.classList.remove("is-smoking");
            }, 1700);

            if (extinguishedCount === candles.length) {
                window.setTimeout(showModal, 500);
            }
        });
    });

    syncProgress();
}

function shuffleArray(items) {
    const shuffled = [...items];

    for (let index = shuffled.length - 1; index > 0; index -= 1) {
        const swapIndex = Math.floor(Math.random() * (index + 1));
        [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
    }

    return shuffled;
}

function createWishCard(index, stageRect, asset, text) {
    const card = document.createElement("article");
    const image = document.createElement("img");
    const caption = document.createElement("p");
    const cardWidth = window.matchMedia("(max-width: 720px)").matches
        ? 170
        : 210 + Math.random() * 44;
    const usableTop = window.matchMedia("(max-width: 720px)").matches ? 240 : 180;
    const maxLeft = Math.max(18, stageRect.width - cardWidth - 34);
    const maxTop = Math.max(usableTop, stageRect.height - 220);
    const left = 18 + Math.random() * maxLeft;
    const top = usableTop + Math.random() * Math.max(30, maxTop - usableTop);
    const rotation = -15 + Math.random() * 30;

    card.className = "wish-card polaroid-card";
    card.style.width = `${cardWidth}px`;
    card.style.left = `${left}px`;
    card.style.top = `${top}px`;
    card.style.setProperty("--angle", `${rotation}deg`);
    card.style.transform = `translateY(24px) rotate(${rotation}deg)`;
    card.style.zIndex = `${index + 2}`;

    image.src = `assets/${asset}`;
    image.alt = text;
    image.className = "polaroid-photo";

    caption.textContent = text;
    caption.className = "polaroid-caption";

    card.appendChild(image);
    card.appendChild(caption);

    window.requestAnimationFrame(function () {
        card.classList.add("is-visible");
    });

    return card;
}

function initGiftPage() {
    const giftStage = document.getElementById("giftStage");

    if (!giftStage) {
        return;
    }

    const giftBox = document.getElementById("giftBox");
    const statusText = document.getElementById("giftStatusText");
    const wishStage = document.getElementById("wishStage");
    const prompt = document.getElementById("giftPrompt");
    const overlay = document.getElementById("finalOverlay");
    const wishes = [
        "A year full of wins that feel earned.",
        "Friends who show up without being asked.",
        "Confidence for every new challenge.",
        "Laughs that ruin serious photos.",
        "Peace after busy days.",
        "A birthday cake slice with your name on it.",
        "Stories worth telling again."
    ];
    const numberedAssets = [
        "1.jpg",
        "2.jpg",
        "3.jpg",
        "4.jpg",
        "5.jpg",
        "6.jpg",
        "7.jpg",
        "8.jpg",
        "9.jpg",
        "10.jpg",
        "11.png",
        "12.png",
        "13.png",
        "14.png",
        "15.jpg"
    ];
    const captions = [
        "Birthday grin",
        "Bestie energy",
        "Tiny victory",
        "Sunshine day",
        "Happy chaos",
        "Aarav magic",
        "Sweet memory",
        "Laugh track",
        "Dream big",
        "Bright spark",
        "Good vibes",
        "Future wow",
        "Warm heart",
        "Forever fun",
        "Gay"
    ];
    let state = "closed";

    async function scatterWishes() {
        statusText.textContent = "The gift is open. Birthday memories incoming.";
        const stageRect = giftStage.getBoundingClientRect();
        const shuffledAssets = shuffleArray(numberedAssets);
        const shuffledCaptions = shuffleArray(captions);
        const totalCards = Math.min(shuffledAssets.length, shuffledCaptions.length);

        for (let index = 0; index < totalCards; index += 1) {
            const asset = shuffledAssets[index];
            const text = shuffledCaptions[index];
            wishStage.appendChild(createWishCard(index, stageRect, asset, text));
            await new Promise(function (resolve) {
                window.setTimeout(resolve, 180);
            });
        }

        statusText.textContent = "Every memory is on the screen. Tap once more for the final unlock.";
        prompt.classList.add("is-visible");
        prompt.setAttribute("aria-hidden", "false");
        state = "wishes-complete";
    }

    async function openGift() {
        if (state !== "closed") {
            return;
        }

        state = "opening";
        document.body.classList.add("is-awake");
        giftBox.classList.add("is-bursting");

        await new Promise(function (resolve) {
            window.setTimeout(resolve, 900);
        });

        await scatterWishes();
    }

    function showFinalUnlock() {
        if (state !== "wishes-complete") {
            return;
        }

        state = "final-visible";
        prompt.classList.add("is-hidden");
        prompt.setAttribute("aria-hidden", "true");
        overlay.setAttribute("aria-hidden", "false");
        window.requestAnimationFrame(function () {
            overlay.classList.add("is-visible");
        });
    }

    function handleActivation(event) {
        if (event.target.closest("a")) {
            return;
        }

        if (state === "closed") {
            openGift();
            return;
        }

        if (state === "wishes-complete") {
            showFinalUnlock();
        }
    }

    giftStage.addEventListener("click", handleActivation);
    giftStage.addEventListener("keydown", function (event) {
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            handleActivation(event);
        }
    });
}

document.addEventListener("DOMContentLoaded", function () {
    initCakePage();
    initGiftPage();
});
