const heroVideos = [...document.querySelectorAll(".hero-video")];
const pager = document.querySelector(".pager");
const pagerCurrent = document.querySelector(".pager-current");
const pauseButton = document.querySelector(".hero-pause");
const storyBeforeImg = document.querySelector(".story-before-img");
const storyAfterImg = document.querySelector(".story-after-img");
const storyCase = document.querySelector(".story-case");
const storyPrevButton = document.querySelector(".story-prev");
const storyNextButton = document.querySelector(".story-next");

let heroIndex = 0;
let heroTimer;
let heroPaused = false;
let heroToken = 0;
const fallbackDuration = 6000;

const storyCases = [
  {
    before: "images/realstory_before_1.png",
    after: "images/realstory_after_1.png",
  },
  {
    before: "images/realstory_before_2.png",
    after: "images/realstory_after_2.png",
  },
  {
    before: "images/realstory_before_3.png",
    after: "images/realstory_after_3.png",
  },
];
let storyIndex = 0;
let storyTimer;
const storyDuration = 4500;

function formatSlideNumber(index) {
  return String(index + 1).padStart(2, "0");
}

function restartProgress(duration) {
  if (!pager) return;

  pager.style.setProperty("--hero-duration", `${duration}ms`);
  pager.classList.remove("is-running");
  void pager.offsetWidth;
  pager.classList.add("is-running");
}

function getVideoDuration(video) {
  return Number.isFinite(video.duration) && video.duration > 0
    ? video.duration * 1000
    : fallbackDuration;
}

function scheduleNext(duration) {
  window.clearTimeout(heroTimer);
  heroToken += 1;
  const token = heroToken;

  heroTimer = window.setTimeout(() => {
    if (!heroPaused && token === heroToken) {
      nextHeroVideo();
    }
  }, duration);
}

function playHeroVideo(index) {
  if (!heroVideos.length) return;

  heroIndex = index % heroVideos.length;
  const activeVideo = heroVideos[heroIndex];
  const duration = getVideoDuration(activeVideo);

  heroVideos.forEach((video, videoIndex) => {
    const isActive = videoIndex === heroIndex;
    video.classList.toggle("is-active", isActive);

    if (isActive) {
      video.currentTime = 0;
      if (!heroPaused) {
        video.play().catch(() => {});
      }
    } else {
      video.pause();
    }
  });

  if (pagerCurrent) {
    pagerCurrent.textContent = formatSlideNumber(heroIndex);
  }

  restartProgress(duration);

  if (!heroPaused) {
    scheduleNext(duration);
  }
}

function nextHeroVideo() {
  playHeroVideo((heroIndex + 1) % heroVideos.length);
}

if (heroVideos.length) {
  heroVideos.forEach((video) => {
    video.addEventListener("loadedmetadata", () => {
      if (video === heroVideos[heroIndex]) {
        playHeroVideo(heroIndex);
      }
    }, { once: true });
  });

  pauseButton?.addEventListener("click", () => {
    heroPaused = !heroPaused;
    pauseButton.classList.toggle("is-paused", heroPaused);
    pauseButton.setAttribute("aria-label", heroPaused ? "영상 재생" : "영상 일시정지");

    if (heroPaused) {
      window.clearTimeout(heroTimer);
      heroToken += 1;
      heroVideos[heroIndex].pause();
      pager?.classList.remove("is-running");
      return;
    }

    const activeVideo = heroVideos[heroIndex];
    const remaining = Number.isFinite(activeVideo.duration) && activeVideo.duration > activeVideo.currentTime
      ? (activeVideo.duration - activeVideo.currentTime) * 1000
      : fallbackDuration;

    activeVideo.play().catch(() => {});
    restartProgress(remaining);
    scheduleNext(remaining);
  });

  playHeroVideo(0);
}

function showStoryCase(index, shouldRestart = true) {
  if (!storyBeforeImg || !storyAfterImg || !storyCases.length) return;

  storyIndex = (index + storyCases.length) % storyCases.length;

  storyCase?.classList.add("is-changing");

  window.setTimeout(() => {
    storyBeforeImg.src = storyCases[storyIndex].before;
    storyAfterImg.src = storyCases[storyIndex].after;
    storyCase?.classList.remove("is-changing");
  }, 180);

  if (shouldRestart) {
    restartStoryTimer();
  }
}

function nextStoryCase() {
  showStoryCase(storyIndex + 1, false);
}

function restartStoryTimer() {
  window.clearInterval(storyTimer);
  storyTimer = window.setInterval(nextStoryCase, storyDuration);
}

storyPrevButton?.addEventListener("click", () => {
  showStoryCase(storyIndex - 1);
});

storyNextButton?.addEventListener("click", () => {
  showStoryCase(storyIndex + 1);
});

showStoryCase(0, false);
restartStoryTimer();
