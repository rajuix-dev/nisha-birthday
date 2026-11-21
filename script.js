
// =====================================
// 1. PAGE NAVIGATION
// =====================================

function showPage(pageId) {

    const pages = document.querySelectorAll(".page");

    pages.forEach(page => {
        page.classList.remove("active");
    });

    const selectedPage = document.getElementById(pageId);

    selectedPage.classList.add("active");

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

    if (pageId === "celebration") {
        launchConfetti();
    }

    if (pageId === "final") {
        launchConfetti();
    }
}


// =====================================
// 2. START THE BIRTHDAY SURPRISE
// =====================================

function startCelebration() {

    showPage("celebration");

    launchConfetti();

}


// =====================================
// 3. MAKE A BIRTHDAY WISH
// =====================================

let wishMade = false;

function makeWish() {

    if (wishMade) return;

    wishMade = true;

    const flame = document.querySelector(".cake");

    const wishMessage = document.getElementById("wish-message");

    const continueButton = document.getElementById("continue-btn");

    // Blow out the candle
    flame.classList.add("cake-blown");

    // Show birthday message
    wishMessage.innerHTML = "Your wishes deserve to come true! ❤️";

    // Celebrate
    launchConfetti();

    // Show next button
    setTimeout(() => {

        continueButton.classList.remove("hidden");

        continueButton.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });

    }, 1200);

}


// =====================================
// 4. FLOATING HEART ANIMATION
// =====================================

const heartsContainer = document.getElementById("hearts-container");

const heartSymbols = ["♥", "♡", "💕", "💗"];

function createHeart() {

    const heart = document.createElement("span");

    heart.classList.add("heart");

    heart.innerHTML =
        heartSymbols[Math.floor(Math.random() * heartSymbols.length)];

    heart.style.left = Math.random() * 100 + "vw";

    heart.style.fontSize =
        Math.random() * 18 + 12 + "px";

    heart.style.animationDuration =
        Math.random() * 5 + 5 + "s";

    heartsContainer.appendChild(heart);

    setTimeout(() => {
        heart.remove();
    }, 10000);

}

setInterval(createHeart, 500);


// =====================================
// 5. CONFETTI CELEBRATION
// =====================================

const confettiContainer =
    document.getElementById("confetti-container");

function launchConfetti() {

    const colors = [
        "#ff8eae",
        "#ffc6d9",
        "#e5b5ff",
        "#ffcf70",
        "#ffffff",
        "#f58b9d"
    ];

    for (let i = 0; i < 100; i++) {

        const piece = document.createElement("div");

        piece.classList.add("confetti");

        piece.style.left = Math.random() * 100 + "vw";

        piece.style.backgroundColor =
            colors[Math.floor(Math.random() * colors.length)];

        piece.style.animationDuration =
            Math.random() * 3 + 2 + "s";

        piece.style.animationDelay =
            Math.random() * 1.5 + "s";

        confettiContainer.appendChild(piece);

        setTimeout(() => {
            piece.remove();
        }, 6000);

    }

}


// =====================================
// 6. REPLAY THE WHOLE EXPERIENCE
// =====================================

function replayWebsite() {

    wishMade = false;

    document.querySelector(".cake").classList.remove("cake-blown");

    document.getElementById("wish-message").innerHTML = "";

    document.getElementById("continue-btn").classList.add("hidden");

    showPage("welcome");

}
