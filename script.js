const body = document.body;
const backToTopButton = document.querySelector(".back-to-top");
const backgroundMusic = document.querySelector("#backgroundMusic");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
let lastScrollY = window.scrollY;
let musicStarted = false;

const setAppHeight = () => {
  const height = window.innerHeight || document.documentElement.clientHeight;
  document.documentElement.style.setProperty("--app-height", `${height}px`);
};

const refreshAppHeightNearTop = () => {
  if (window.scrollY <= 2) {
    setAppHeight();
  }
};

const scrollOptions = {
  behavior: prefersReducedMotion.matches ? "auto" : "smooth",
  block: "start",
};

setAppHeight();

window.addEventListener("load", () => {
  setAppHeight();
  window.setTimeout(() => {
    body.classList.add("is-loaded");
  }, 260);
});

const stopMusicTriggers = () => {
  window.removeEventListener("scroll", handleMusicScroll);
};

const startMusic = async () => {
  if (!backgroundMusic || !backgroundMusic.paused || musicStarted) {
    stopMusicTriggers();
    return;
  }

  backgroundMusic.volume = 0.42;

  try {
    await backgroundMusic.play();
    musicStarted = true;
    stopMusicTriggers();
  } catch (error) {
    // Browsers may wait for a stronger user gesture before allowing audio.
  }
};

const handleMusicScroll = () => {
  const currentScrollY = window.scrollY;
  const isScrollingDown = currentScrollY > lastScrollY;

  lastScrollY = currentScrollY;

  if (isScrollingDown && currentScrollY > 8) {
    startMusic();
  }
};

window.addEventListener("scroll", handleMusicScroll, { passive: true });

backgroundMusic?.addEventListener("error", stopMusicTriggers, { once: true });

backToTopButton?.addEventListener("click", () => {
  document.querySelector("#cover")?.scrollIntoView(scrollOptions);
});

window.addEventListener(
  "scroll",
  () => {
    const shouldShow = window.scrollY > window.innerHeight * 0.8;
    backToTopButton?.classList.toggle("is-visible", shouldShow);
  },
  { passive: true }
);

window.addEventListener("resize", refreshAppHeightNearTop, { passive: true });
window.addEventListener("orientationchange", () => {
  window.setTimeout(setAppHeight, 250);
});

window.visualViewport?.addEventListener("resize", refreshAppHeightNearTop, {
  passive: true,
});
