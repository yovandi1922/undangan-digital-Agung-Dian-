var body = document.body;
var backToTopButton = document.querySelector(".back-to-top");
var mapButton = document.querySelector(".map-button");
var backgroundMusic = document.querySelector("#backgroundMusic");
var prefersReducedMotion = window.matchMedia
  ? window.matchMedia("(prefers-reduced-motion: reduce)")
  : { matches: false };
var lastScrollY = window.scrollY || window.pageYOffset || 0;
var musicStarted = false;
var musicTrying = false;
var musicRetryTimer = null;
var musicRetryCount = 0;
var musicEvents = [
  "click",
  "touchstart",
  "touchend",
  "touchmove",
  "pointerdown",
  "pointermove",
  "mousedown",
  "mousemove",
  "keydown",
  "wheel",
  "scroll"
];

function hasClass(element, className) {
  return (" " + element.className + " ").indexOf(" " + className + " ") > -1;
}

function addClass(element, className) {
  if (!element) {
    return;
  }

  if (element.classList) {
    element.classList.add(className);
  } else if (!hasClass(element, className)) {
    element.className += " " + className;
  }
}

function removeClass(element, className) {
  if (!element) {
    return;
  }

  if (element.classList) {
    element.classList.remove(className);
  } else {
    element.className = (" " + element.className + " ")
      .replace(" " + className + " ", " ")
      .replace(/^\s+|\s+$/g, "");
  }
}

function getScrollY() {
  return window.scrollY || window.pageYOffset || 0;
}

function setAppHeight() {
  var height = window.innerHeight || document.documentElement.clientHeight;
  document.documentElement.style.setProperty("--app-height", height + "px");
}

function refreshAppHeightNearTop() {
  if (getScrollY() <= 2) {
    setAppHeight();
  }
}

function smoothScrollTo(element) {
  if (!element) {
    return;
  }

  try {
    element.scrollIntoView({
      behavior: prefersReducedMotion.matches ? "auto" : "smooth",
      block: "start"
    });
  } catch (error) {
    element.scrollIntoView(true);
  }
}

function showLoadedState() {
  setAppHeight();
  window.setTimeout(function () {
    addClass(body, "is-loaded");
  }, 260);
}

function stopMusicTriggers() {
  var i;
  var handler;

  for (i = 0; i < musicEvents.length; i += 1) {
    handler = musicEvents[i] === "scroll" ? handleMusicScroll : handleMusicGesture;
    window.removeEventListener(musicEvents[i], handler, false);
  }

  if (musicRetryTimer) {
    window.clearTimeout(musicRetryTimer);
    musicRetryTimer = null;
  }
}

function startMusic() {
  var playResult;

  if (!backgroundMusic || !backgroundMusic.paused || musicStarted) {
    stopMusicTriggers();
    return;
  }

  if (musicTrying) {
    return;
  }

  musicTrying = true;
  backgroundMusic.volume = 0.42;
  playResult = backgroundMusic.play();

  if (playResult && typeof playResult.then === "function") {
    playResult
      .then(function () {
        musicStarted = true;
        musicTrying = false;
        stopMusicTriggers();
      })
      .catch(function () {
        musicTrying = false;
        scheduleMusicRetry();
      });
    return;
  }

  musicStarted = true;
  musicTrying = false;
  stopMusicTriggers();
}

function scheduleMusicRetry() {
  if (musicStarted || musicRetryCount >= 4) {
    return;
  }

  musicRetryCount += 1;
  musicRetryTimer = window.setTimeout(startMusic, 350);
}

function handleMusicGesture() {
  musicRetryCount = 0;
  startMusic();
}

function handleMusicScroll() {
  var currentScrollY = getScrollY();
  var isScrollingDown = currentScrollY > lastScrollY;

  lastScrollY = currentScrollY;

  if (isScrollingDown && currentScrollY > 8) {
    handleMusicGesture();
  }
}

function updateBackToTop() {
  var currentScrollY = getScrollY();
  var shouldShow = currentScrollY > window.innerHeight * 0.8;

  if (backToTopButton) {
    if (shouldShow) {
      addClass(backToTopButton, "is-visible");
    } else {
      removeClass(backToTopButton, "is-visible");
    }
  }
}

setAppHeight();

if (document.readyState === "complete") {
  showLoadedState();
} else {
  window.addEventListener("load", showLoadedState, false);
}

for (var i = 0; i < musicEvents.length; i += 1) {
  window.addEventListener(
    musicEvents[i],
    musicEvents[i] === "scroll" ? handleMusicScroll : handleMusicGesture,
    false
  );
}

window.addEventListener("scroll", updateBackToTop, false);
window.addEventListener("resize", refreshAppHeightNearTop, false);
window.addEventListener(
  "orientationchange",
  function () {
    window.setTimeout(setAppHeight, 250);
  },
  false
);

if (window.visualViewport) {
  window.visualViewport.addEventListener("resize", refreshAppHeightNearTop, false);
}

if (backgroundMusic) {
  backgroundMusic.addEventListener("error", stopMusicTriggers, false);
}

if (backToTopButton) {
  backToTopButton.addEventListener(
    "click",
    function () {
      smoothScrollTo(document.querySelector("#cover"));
    },
    false
  );
}

if (mapButton) {
  mapButton.addEventListener(
    "click",
    function (event) {
      var href = mapButton.getAttribute("href");

      if (!href) {
        return;
      }

      event.preventDefault();
      window.open(href, "_blank");
    },
    false
  );

  mapButton.addEventListener(
    "touchend",
    function (event) {
      var href = mapButton.getAttribute("href");

      if (!href) {
        return;
      }

      event.preventDefault();
      window.open(href, "_blank");
    },
    false
  );
}
