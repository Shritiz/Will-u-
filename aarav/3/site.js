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
        candle.addEventListener("click", function () {
            if (candle.classList.contains("is-out")) {
                return;
            }

            candle.classList.add("is-out", "is-smoking");
            candle.disabled = true;
            extinguishedCount += 1;
            syncProgress();

            window.setTimeout(function () {
                candle.classList.remove("is-smoking");
            }, 1800);

            if (extinguishedCount === candles.length) {
                window.setTimeout(showModal, 500);
            }
        });
    });

    syncProgress();
}

function imageExists(src) {
    return new Promise(function (resolve) {
        const probe = new Image();

        probe.onload = function () {
            resolve(true);
        };

        probe.onerror = function () {
            resolve(false);
        };

        probe.src = src;
    });
}

async function discoverSequentialImages(limit) {
    const sources = [];

    for (let index = 1; index <= limit; index += 1) {
        const src = `assets/${index}.jpg`;
        const exists = await imageExists(src);

        if (!exists) {
            if (sources.length > 0) {
                break;
            }

            continue;
        }

        sources.push(src);
    }

    return sources;
}

function createPolaroid(src, index, stageRect) {
    const frame = document.createElement("figure");
    const photo = document.createElement("img");
    const caption = document.createElement("figcaption");
    const cardWidth = window.matchMedia("(max-width: 720px)").matches
        ? 92 + Math.random() * 24
        : 110 + Math.random() * 54;
    const cardHeight = cardWidth * 1.32;
    const usableTop = window.matchMedia("(max-width: 720px)").matches ? 136 : 164;
    const maxLeft = Math.max(24, stageRect.width - cardWidth - 42);
    const maxTop = Math.max(usableTop, stageRect.height - cardHeight - 34);
    const left = 18 + Math.random() * maxLeft;
    const top = usableTop + Math.random() * Math.max(20, maxTop - usableTop);
    const rotation = -19 + Math.random() * 38;

    frame.className = "memory-polaroid";
    frame.style.width = `${cardWidth}px`;
    frame.style.left = `${left}px`;
    frame.style.top = `${top}px`;
    frame.style.setProperty("--angle", `${rotation}deg`);
    frame.style.transform = `translateY(26px) rotate(${rotation}deg)`;
    frame.style.zIndex = `${index + 2}`;

    photo.src = src;
    photo.alt = `Birthday memory ${index + 1}`;

    caption.textContent = index % 2 === 0 ? "Tannu" : "Jerry x Tannu";

    frame.appendChild(photo);
    frame.appendChild(caption);

    window.requestAnimationFrame(function () {
        frame.classList.add("is-visible");
    });

    return frame;
}

function initGiftPage() {
    const giftStage = document.getElementById("giftStage");

    if (!giftStage) {
        return;
    }

    const giftBox = document.getElementById("giftBox");
    const statusText = document.getElementById("giftStatusText");
    const memoryStage = document.getElementById("memoryStage");
    const collagePrompt = document.getElementById("collagePrompt");
    const mainPhotoOverlay = document.getElementById("mainPhotoOverlay");
    const mainPhoto = document.getElementById("mainPhoto");
    const mainPhotoShell = document.getElementById("mainPhotoShell");
    let state = "closed";

    async function revealMainPhoto() {
        if (state !== "collage-complete") {
            return;
        }

        state = "main-photo-revealed";
        collagePrompt.classList.add("is-hidden");
        collagePrompt.setAttribute("aria-hidden", "true");
        mainPhotoOverlay.setAttribute("aria-hidden", "false");

        if (mainPhoto.complete && mainPhoto.naturalWidth > 0) {
            mainPhotoShell.classList.add("has-main-photo");
        }

        window.requestAnimationFrame(function () {
            mainPhotoOverlay.classList.add("is-visible");
        });
    }

    async function buildCollage() {
        const sources = await discoverSequentialImages(80);
        const displaySources = sources.slice(0, Math.min(sources.length, 18));

        statusText.textContent = "Your present is opening into a whole table full of memories.";

        if (displaySources.length === 0) {
            statusText.textContent = "The collage is ready for photos. Add numbered images like 1.jpg, 2.jpg, 3.jpg in assets.";
            collagePrompt.textContent = "Tap again for the giant birthday memory.";
            collagePrompt.classList.add("is-visible");
            collagePrompt.setAttribute("aria-hidden", "false");
            state = "collage-complete";
            return;
        }

        const stageRect = giftStage.getBoundingClientRect();

        for (let index = 0; index < displaySources.length; index += 1) {
            const polaroid = createPolaroid(displaySources[index], index, stageRect);
            memoryStage.appendChild(polaroid);

            // Keep the collage reveal calm and readable instead of dumping every image at once.
            await new Promise(function (resolve) {
                window.setTimeout(resolve, 220);
            });
        }

        statusText.textContent = "Every memory is on the table now. Tap once more for the biggest one.";
        collagePrompt.classList.add("is-visible");
        collagePrompt.setAttribute("aria-hidden", "false");
        state = "collage-complete";
    }

    async function burstGift() {
        if (state !== "closed") {
            return;
        }

        state = "bursting";
        document.body.classList.add("is-awake");
        giftBox.classList.add("is-bursting");
        statusText.textContent = "The gift is opening. Give it a second and watch what spills out.";

        await new Promise(function (resolve) {
            window.setTimeout(resolve, 950);
        });

        state = "collage-building";
        await buildCollage();
    }

    function handleActivation(event) {
        if (event.target.closest("a")) {
            return;
        }

        if (state === "closed") {
            burstGift();
            return;
        }

        if (state === "collage-complete") {
            revealMainPhoto();
        }
    }

    giftStage.addEventListener("click", handleActivation);
    giftStage.addEventListener("keydown", function (event) {
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            handleActivation(event);
        }
    });

    mainPhoto.addEventListener("load", function () {
        mainPhotoShell.classList.add("has-main-photo");
    });

    mainPhoto.addEventListener("error", function () {
        mainPhotoShell.classList.remove("has-main-photo");
    });
}

document.addEventListener("DOMContentLoaded", function () {
    initCakePage();
    initGiftPage();
});
