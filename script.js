const body = document.body;
const revealSections = document.querySelectorAll(".reveal");
const imageSections = document.querySelectorAll(".image-animate");
const backToTopButton = document.querySelector(".back-to-top");
const backgroundMusic = document.querySelector("#backgroundMusic");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
let ticking = false;
let lastScrollY = window.scrollY;
let musicStarted = false;

const scrollOptions = {
  behavior: prefersReducedMotion.matches ? "auto" : "smooth",
  block: "start",
};

window.addEventListener("load", () => {
  window.setTimeout(() => {
    body.classList.add("is-loaded");
  }, 900);
});

const revealSection = (section) => {
  section.classList.add("show", "active", "is-visible");
};

const hideSection = (section) => {
  section.classList.remove("show", "active", "is-visible");
};

if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          revealSection(entry.target);
          return;
        }

        hideSection(entry.target);
      });
    },
    {
      root: null,
      rootMargin: "-8% 0px -18% 0px",
      threshold: 0.12,
    }
  );

  revealSections.forEach((section) => {
    revealObserver.observe(section);
  });
} else {
  revealSections.forEach(revealSection);
}

const updateParallax = () => {
  ticking = false;

  if (prefersReducedMotion.matches) {
    return;
  }

  const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
  const viewportCenter = viewportHeight / 2;

  imageSections.forEach((section) => {
    const rect = section.getBoundingClientRect();

    if (rect.bottom < 0 || rect.top > viewportHeight) {
      return;
    }

    const sectionCenter = rect.top + rect.height / 2;
    const distance = (viewportCenter - sectionCenter) / viewportHeight;
    const offset = Math.max(-4, Math.min(4, distance * 10));

    section.style.setProperty("--parallax-y", `${offset.toFixed(2)}px`);
  });
};

const requestParallaxUpdate = () => {
  if (ticking || prefersReducedMotion.matches) {
    return;
  }

  ticking = true;
  window.requestAnimationFrame(updateParallax);
};

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
    requestParallaxUpdate();
  },
  { passive: true }
);

window.addEventListener("resize", requestParallaxUpdate, { passive: true });
updateParallax();
