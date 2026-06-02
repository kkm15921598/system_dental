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

const heroCopyEyebrow = document.querySelector('.hero-copy__eyebrow');
const heroCopyHeadline = document.querySelector('.hero-copy__headline');
const heroCopyContent = document.querySelector('.hero-copy__content');
const heroCopyData = [
  {
    eyebrow: '폐업 걱정 없이 안심할 수 있는',
    headline: '<span class="hero-copy__line1">명동에서 21년 이상</span><span class="hero-copy__line2">한 자리를 지킨 치과</span>',
  },
  {
    eyebrow: '구강악안면외과 전문의 / 통합치의학 전문의',
    headline: '<span class="hero-copy__line1">서울대 출신</span><span class="hero-copy__line2">대표 원장 직접 진료</span>',
  },
  {
    eyebrow: '3차원 정밀 진단 결과를 바탕으로',
    headline: '<span class="hero-copy__line1">자연 치아에 가까운 보철 제작</span><span class="hero-copy__line2">자체 기공 시스템</span>',
  },
];

function updateHeroCopy(index) {
  if (!heroCopyEyebrow || !heroCopyHeadline || !heroCopyContent) return;

  heroCopyContent.classList.add('is-hidden');
  window.setTimeout(() => {
    const copy = heroCopyData[index] || heroCopyData[0];
    heroCopyEyebrow.textContent = copy.eyebrow;
    heroCopyHeadline.innerHTML = copy.headline;
    heroCopyContent.classList.remove('is-hidden');
  }, 220);
}

function playHeroVideo(index) {
  if (!heroVideos.length) return;

  heroIndex = index % heroVideos.length;
  const activeVideo = heroVideos[heroIndex];
  const duration = getVideoDuration(activeVideo);

  heroCopyContent?.classList.remove('is-hidden');
  updateHeroCopy(heroIndex);

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

const digitalTabs = [...document.querySelectorAll("[data-digital-tab]")];
const digitalPanels = [...document.querySelectorAll("[data-digital-panel]")];

function showDigitalPanel(name) {
  if (!digitalTabs.length || !digitalPanels.length) return;
  const selected = digitalPanels.some((panel) => panel.dataset.digitalPanel === name) ? name : "ct";
  digitalTabs.forEach((tab) => tab.classList.toggle("is-active", tab.dataset.digitalTab === selected));
  digitalPanels.forEach((panel) => panel.classList.toggle("is-active", panel.dataset.digitalPanel === selected));
}

digitalTabs.forEach((tab) => {
  tab.addEventListener("click", (event) => {
    event.preventDefault();
    showDigitalPanel(tab.dataset.digitalTab);
    history.replaceState(null, "", `#${tab.dataset.digitalTab}`);
  });
});

if (digitalTabs.length) {
  showDigitalPanel(location.hash.slice(1));
  window.addEventListener("hashchange", () => showDigitalPanel(location.hash.slice(1)));
}

document.querySelectorAll("[data-sub-tab]").forEach((tab) => {
  tab.addEventListener("click", (event) => {
    event.preventDefault();
    const selected = tab.dataset.subTab;
    tab.closest(".subpage-tabs")?.querySelectorAll("[data-sub-tab]").forEach((item) => {
      item.classList.toggle("is-active", item === tab);
    });
    document.querySelectorAll("[data-sub-panel]").forEach((panel) => {
      panel.classList.toggle("is-active", panel.dataset.subPanel === selected);
    });
    if (selected) {
      history.replaceState(null, "", `#${selected}`);
      window.scrollTo({ top: tab.closest(".subpage-tabs")?.offsetTop || 0, behavior: "smooth" });
    }
  });
});

const subTabs = [...document.querySelectorAll("[data-sub-tab]")];
if (subTabs.length && document.querySelector("[data-sub-panel]")) {
  const activeSubTab = subTabs.find((tab) => tab.dataset.subTab === location.hash.slice(1));
  activeSubTab?.click();
}

const tourImage = document.querySelector("[data-tour-image]");
const tourPrevButton = document.querySelector(".tour-prev");
const tourNextButton = document.querySelector(".tour-next");
const tourImages = [
  "images/치과둘러보기1.png",
  "images/치과둘러보기2.png",
  "images/치과둘러보기3.png",
  "images/치과둘러보기4.png",
  "images/치과둘러보기5.png",
  "images/치과둘러보기6.png",
];
let tourIndex = 0;

function showTourImage(index) {
  if (!tourImage) return;

  tourIndex = (index + tourImages.length) % tourImages.length;
  tourImage.classList.add("is-changing");

  window.setTimeout(() => {
    tourImage.src = tourImages[tourIndex];
    tourImage.alt = `시스템치과 내부 공간 ${tourIndex + 1}`;
    tourImage.classList.remove("is-changing");
  }, 160);
}

tourPrevButton?.addEventListener("click", () => showTourImage(tourIndex - 1));
tourNextButton?.addEventListener("click", () => showTourImage(tourIndex + 1));

const doctorSection = document.querySelector('.doctor-section');
if (doctorSection) {
  const doctorObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
        // 섹션이 50% 이상 보이면 애니메이션 시작
        doctorSection.classList.add('is-visible');
      } else if (!entry.isIntersecting) {
        // 섹션이 화면에서 완전히 벗어나면 클래스 제거
        doctorSection.classList.remove('is-visible');
      }
      // 50% 미만이지만 화면에 일부 보이면 클래스 유지 (애니메이션 멈춘 상태)
    });
  }, {
    threshold: [0.5],
  });

  doctorObserver.observe(doctorSection);
}

/* Fixed background replacement for subpage visuals — ensure image is not cropped while keeping fixed effect */
function setupFixedHeroBackgrounds() {
  const heroSections = [...document.querySelectorAll('.digital-visual')];
  if (!heroSections.length) return;
  const header = document.querySelector('.site-header');
  if (!header) {
    window.setTimeout(setupFixedHeroBackgrounds, 120);
    return;
  }

  const headerHeight = header.offsetHeight;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      const img = document.querySelector(`.fixed-hero-bg[data-source-section="${entry.target.dataset.fixedIndex}"]`);
      if (!img) return;
      img.classList.toggle('is-visible', entry.isIntersecting && entry.intersectionRatio > 0.1);
    });
  }, {
    threshold: [0, 0.1, 0.2],
  });

  heroSections.forEach((sec, idx) => {
    const cs = window.getComputedStyle(sec);
    const bg = cs.backgroundImage;
    if (!bg || bg === 'none' || !bg.includes('url(')) return;
    const urlMatch = bg.match(/url\((['"]?)(.*?)\1\)/);
    if (!urlMatch) return;
    const url = urlMatch[2];

    const img = document.createElement('img');
    img.className = 'fixed-hero-bg';
    img.dataset.sourceSection = idx;
    img.dataset.fixedIndex = idx;
    img.src = url;
    img.alt = '';
    img.style.top = headerHeight + 'px';
    img.style.width = 'auto';
    img.style.height = 'auto';
    img.style.maxWidth = '100vw';
    img.style.display = 'block';
    img.style.visibility = 'hidden';

    img.addEventListener('load', () => {
      const viewportWidth = window.innerWidth;
      const width = Math.min(img.naturalWidth, viewportWidth);
      img.style.width = width + 'px';
      img.style.height = 'auto';
    });

    document.body.appendChild(img);
    sec.classList.add('use-fixed-bg');
    sec.dataset.fixedIndex = idx;
    observer.observe(sec);
  });

  function updateFixedTops() {
    const header = document.querySelector('.site-header');
    const currentHeaderHeight = header ? header.offsetHeight : 0;
    document.querySelectorAll('.fixed-hero-bg').forEach((img) => {
      img.style.top = currentHeaderHeight + 'px';
      if (img.naturalWidth) {
        const viewportWidth = window.innerWidth;
        const width = Math.min(img.naturalWidth, viewportWidth);
        img.style.width = width + 'px';
      }
    });
  }

  window.addEventListener('resize', updateFixedTops);
}

// Fixed background setup disabled because it interfered with the subpage hero display.
// window.addEventListener('DOMContentLoaded', () => setupFixedHeroBackgrounds());
