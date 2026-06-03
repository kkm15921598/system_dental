const heroVideos = [...document.querySelectorAll(".hero-video")];
const pager = document.querySelector(".pager");
const pagerCurrent = document.querySelector(".pager-current");
const pauseButton = document.querySelector(".hero-pause");
const storyBeforeImg = document.querySelector(".story-before-img");
const storyAfterImg = document.querySelector(".story-after-img");
const storyCase = document.querySelector(".story-case");
const storyPrevButton = document.querySelector(".story-prev");
const storyNextButton = document.querySelector(".story-next");
const storyDots = document.querySelector(".story-dots");
let storyDotButtons = [];

let heroIndex = 0;
let heroTimer;
let heroPaused = false;
let heroToken = 0;
const fallbackDuration = 6000;

const storyCases = [
  {
    before: "images/realstory_before2.png",
    after: "images/realstory_after2.png",
  },
  {
    before: "images/realstory_before3.png",
    after: "images/realstory_after3.png",
  },
  {
    before: "images/realstory_before4.png",
    after: "images/realstory_after4.png",
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
    eyebrow: '구강악안면외과 전문의 / 통합치의학 전문의',
    headline: '<span class="hero-copy__line1">서울대 출신</span><span class="hero-copy__line2">대표 원장 직접 진료</span>',
  },
  {
    eyebrow: '3차원 정밀 진단 결과를 바탕으로',
    headline: '<span class="hero-copy__line1">자연 치아에 가까운 보철 제작</span><span class="hero-copy__line2">자체 기공 시스템</span>',
  },
  {
    eyebrow: '폐업 걱정 없이 안심할 수 있는',
    headline: '<span class="hero-copy__line1">명동에서 21년 이상</span><span class="hero-copy__line2">한 자리를 지킨 치과</span>',
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

function showStoryCase(index, shouldRestart = true, dir = "next") {
  if (!storyBeforeImg || !storyAfterImg || !storyCases.length) return;

  storyIndex = (index + storyCases.length) % storyCases.length;
  updateStoryDots();

  const applyImages = () => {
    storyBeforeImg.src = storyCases[storyIndex].before;
    storyAfterImg.src = storyCases[storyIndex].after;
  };

  // 가로 슬라이드 푸시: 현재 사례가 한쪽으로 밀려나가고, 다음 사례가 반대쪽에서 밀려 들어옴
  if (storyCase) {
    const SHIFT = 90;
    const outX = dir === "prev" ? SHIFT : -SHIFT;   // 밀려나가는 방향
    const inX = dir === "prev" ? -SHIFT : SHIFT;    // 반대쪽에서 들어오는 시작 위치

    storyCase.style.transition = "transform .3s ease, opacity .3s ease";
    storyCase.style.opacity = "0";
    storyCase.style.transform = `translateX(${outX}px)`;

    const onSlideOut = (e) => {
      if (e.target !== storyCase || e.propertyName !== "transform") return;
      storyCase.removeEventListener("transitionend", onSlideOut);

      applyImages();

      // 반대쪽으로 순간 이동(전환 없이) 후 제자리로 밀어 넣기
      storyCase.style.transition = "none";
      storyCase.style.transform = `translateX(${inX}px)`;
      void storyCase.offsetWidth; // 리플로우 강제
      storyCase.style.transition = "transform .42s cubic-bezier(.22, 1, .36, 1), opacity .42s ease";
      storyCase.style.opacity = "1";
      storyCase.style.transform = "translateX(0)";
    };

    storyCase.addEventListener("transitionend", onSlideOut);
  } else {
    applyImages();
  }

  if (shouldRestart) {
    restartStoryTimer();
  }
}

function nextStoryCase() {
  showStoryCase(storyIndex + 1, false, "next");
}

function restartStoryTimer() {
  window.clearInterval(storyTimer);
  storyTimer = window.setInterval(nextStoryCase, storyDuration);
}

storyPrevButton?.addEventListener("click", () => {
  showStoryCase(storyIndex - 1, true, "prev");
});

storyNextButton?.addEventListener("click", () => {
  showStoryCase(storyIndex + 1, true, "next");
});

function updateStoryDots() {
  storyDotButtons.forEach((dot, i) => {
    const active = i === storyIndex;
    dot.classList.toggle("is-active", active);
    dot.setAttribute("aria-selected", String(active));
  });
}

function buildStoryDots() {
  if (!storyDots) return;
  storyDots.innerHTML = "";
  storyDotButtons = storyCases.map((_, i) => {
    const dot = document.createElement("button");
    dot.type = "button";
    dot.setAttribute("role", "tab");
    dot.setAttribute("aria-label", `${i + 1}번째 사례 보기`);
    dot.addEventListener("click", () => {
      if (i === storyIndex) return;
      showStoryCase(i, true, i > storyIndex ? "next" : "prev");
    });
    storyDots.appendChild(dot);
    return dot;
  });
  updateStoryDots();
}

buildStoryDots();
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
    }
  });
});

const subTabs = [...document.querySelectorAll("[data-sub-tab]")];
if (subTabs.length && document.querySelector("[data-sub-panel]")) {
  const activeSubTab = subTabs.find((tab) => tab.dataset.subTab === location.hash.slice(1));
  activeSubTab?.click();
}

const tourTrack = document.querySelector("[data-tour-track]");
const tourPrevButton = document.querySelector(".tour-prev");
const tourNextButton = document.querySelector(".tour-next");
const tourImages = [
  "images/sub1_2_img1.png",
  "images/sub1_2_img2.png",
  "images/sub1_2_img3.png",
  "images/sub1_2_img5.png",
  "images/sub1_2_img6.png",
];
let tourIndex = 0;
let tourAnimating = false;
let tourPosition = 1;

function createTourImage(index, isClone = false) {
  const image = document.createElement("img");
  image.src = tourImages[index];
  image.alt = `시스템치과 내부 공간 ${index + 1}`;
  if (!isClone) {
    image.dataset.tourImage = "";
  }
  return image;
}

function setTourTrackPosition(shouldAnimate = true) {
  if (!tourTrack) return;

  tourTrack.classList.toggle("is-resetting", !shouldAnimate);
  tourTrack.style.transform = `translate3d(${-tourPosition * 100}%,0,0)`;
}

function initTourSlider() {
  if (!tourTrack || !tourImages.length) return;

  tourTrack.classList.add("is-resetting");

  if (tourTrack.children.length !== tourImages.length + 2) {
    tourTrack.innerHTML = "";

    const lastIndex = tourImages.length - 1;
    tourTrack.append(createTourImage(lastIndex, true));
    tourImages.forEach((_, index) => tourTrack.append(createTourImage(index)));
    tourTrack.append(createTourImage(0, true));
  }

  tourIndex = 0;
  tourPosition = 1;
  setTourTrackPosition(false);
  void tourTrack.offsetWidth;
  tourTrack.classList.remove("is-resetting");
}

function showTourImage(direction = "next") {
  if (!tourTrack || tourAnimating || !tourImages.length) return;

  tourAnimating = true;
  tourPosition += direction === "prev" ? -1 : 1;
  setTourTrackPosition(true);
}

tourTrack?.addEventListener("transitionend", (event) => {
  if (event.target !== tourTrack || event.propertyName !== "transform") return;

  if (tourPosition === 0) {
    tourPosition = tourImages.length;
    tourIndex = tourImages.length - 1;
    setTourTrackPosition(false);
  } else if (tourPosition === tourImages.length + 1) {
    tourPosition = 1;
    tourIndex = 0;
    setTourTrackPosition(false);
  } else {
    tourIndex = tourPosition - 1;
  }

  void tourTrack.offsetWidth;
  tourTrack.classList.remove("is-resetting");
  tourAnimating = false;
});

if (tourTrack) {
  initTourSlider();
}

tourPrevButton?.addEventListener("click", () => showTourImage("prev"));
tourNextButton?.addEventListener("click", () => showTourImage("next"));

const animatedSections = [
  '.doctor-section',
  '.implant-section',
  '.digital-section',
  '.story-section',
  '.event-section',
  '.info-section',
]
  .map((selector) => document.querySelector(selector))
  .filter(Boolean);

if (animatedSections.length) {
  let lastAnimationScrollY = window.scrollY || document.documentElement.scrollTop;

  const sectionObserver = new IntersectionObserver((entries) => {
    const currentScrollY = window.scrollY || document.documentElement.scrollTop;
    const isScrollingDown = currentScrollY > lastAnimationScrollY;

    entries.forEach((entry) => {
      if (entry.isIntersecting && entry.intersectionRatio >= 0.4) {
        entry.target.classList.add('is-visible');
      } else if (!isScrollingDown) {
        entry.target.classList.remove('is-visible');
      }
    });

    lastAnimationScrollY = currentScrollY;
  }, {
    threshold: [0, 0.25, 0.4],
  });

  animatedSections.forEach((section) => sectionObserver.observe(section));
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

const privacyDetailToggle = document.querySelector('.privacy-detail-toggle');
const privacyDetailPopup = document.querySelector('.privacy-detail-popup');
const privacyDetailClose = document.querySelector('.privacy-detail-close');

function setPrivacyDetailOpen(isOpen) {
  if (!privacyDetailToggle || !privacyDetailPopup) return;
  privacyDetailPopup.classList.toggle('is-open', isOpen);
  privacyDetailToggle.setAttribute('aria-expanded', String(isOpen));
}

privacyDetailToggle?.addEventListener('click', (event) => {
  event.preventDefault();
  setPrivacyDetailOpen(!privacyDetailPopup?.classList.contains('is-open'));
});

privacyDetailClose?.addEventListener('click', (event) => {
  event.preventDefault();
  setPrivacyDetailOpen(false);
});

privacyDetailPopup?.addEventListener('click', (event) => {
  event.preventDefault();
  event.stopPropagation();
});

document.addEventListener('click', (event) => {
  if (!event.target.closest('.privacy-detail-wrap')) {
    setPrivacyDetailOpen(false);
  }
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    setPrivacyDetailOpen(false);
  }
});

const consultForm = document.querySelector('.consult-form');
const consultSubmit = document.querySelector('.consult-submit');

consultSubmit?.addEventListener('click', (event) => {
  event.preventDefault();
  if (!consultForm || !consultForm.reportValidity()) return;

  const formData = new FormData(consultForm);
  const subject = '[시스템치과] 임플란트 할인 혜택 상담 신청';
  const body = [
    '임플란트 할인 혜택 상담을 신청합니다.',
    '',
    `이름: ${formData.get('name') || ''}`,
    `연락처: ${formData.get('phone') || ''}`,
    `상담 내용: ${formData.get('message') || ''}`,
    `상담 시간: ${formData.get('time') || ''}`,
    '개인정보 수집 및 이용 동의: 동의함',
  ].join('\n');

  window.location.href = `mailto:zbxm2000@naver.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
});

const floatingBar = document.querySelector('.floating-sns');
const floatingToggle = floatingBar && floatingBar.querySelector('.floating-toggle');
const floatingContent = floatingBar && floatingBar.querySelector('.floating-sns-content');

if (floatingToggle) {
  floatingToggle.addEventListener('click', () => {
    const collapsed = floatingBar.classList.toggle('collapsed');
    floatingToggle.setAttribute('aria-expanded', String(!collapsed));
    floatingToggle.setAttribute('aria-label', collapsed ? '열기' : '닫기');

    if (floatingContent) {
      // 접히는 동안에는 내용을 잘라내고, 다 펼쳐진 뒤에 버튼 그림자가 보이도록 overflow 해제
      floatingContent.style.overflow = 'hidden';
      if (!collapsed) {
        const reveal = (e) => {
          if (e.propertyName !== 'max-width') return;
          floatingContent.style.overflow = 'visible';
          floatingContent.removeEventListener('transitionend', reveal);
        };
        floatingContent.addEventListener('transitionend', reveal);
      }
    }
  });
}

// 디지털 시스템 세로 슬라이더 (3개씩 보이기)
const systemSlider = document.querySelector('.system-slider');

if (systemSlider) {
  const track = systemSlider.querySelector('.system-list');
  const upBtn = systemSlider.querySelector('.system-nav--up');
  const downBtn = systemSlider.querySelector('.system-nav--down');
  const cards = track ? track.querySelectorAll('article') : [];
  const VISIBLE = 3;
  const STEP = 138; // 카드 높이 112 + 간격 26
  const maxIndex = Math.max(0, cards.length - VISIBLE);
  let index = 0;

  const isDesktop = () => window.matchMedia('(min-width: 981px)').matches;
  const AUTOPLAY_MS = 3000;
  let timer = null;

  const render = () => {
    if (!isDesktop()) {
      track.style.transform = '';
      return;
    }
    track.style.transform = `translateY(${-index * STEP}px)`;
    upBtn.disabled = index <= 0;
    downBtn.disabled = index >= maxIndex;
  };

  const stopAuto = () => {
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
  };

  const startAuto = () => {
    stopAuto();
    if (!isDesktop() || maxIndex === 0) return;
    timer = setInterval(() => {
      index = index >= maxIndex ? 0 : index + 1; // 끝에 닿으면 처음으로 순환
      render();
    }, AUTOPLAY_MS);
  };

  upBtn.addEventListener('click', () => {
    if (index > 0) {
      index -= 1;
      render();
    }
    startAuto(); // 수동 조작 후 타이머 재시작
  });

  downBtn.addEventListener('click', () => {
    if (index < maxIndex) {
      index += 1;
      render();
    }
    startAuto();
  });

  // 마우스를 올리면 잠시 멈춤
  systemSlider.addEventListener('mouseenter', stopAuto);
  systemSlider.addEventListener('mouseleave', startAuto);

  window.addEventListener('resize', () => {
    render();
    startAuto();
  });

  render();
  startAuto();
}

// 우측 고정 TOP 버튼: 스크롤 내리면 표시, 클릭 시 맨 위로
const toTopBtn = document.querySelector('.to-top');

if (toTopBtn) {
  const toggleToTop = () => {
    toTopBtn.classList.toggle('is-visible', window.scrollY > 400);
  };
  window.addEventListener('scroll', toggleToTop, { passive: true });
  toggleToTop();

  toTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

// 의료진: 탭(클릭)하면 이름 표시 (모바일/터치용, PC 호버는 그대로)
const doctorCards = [...document.querySelectorAll('.doctor-photo__card')];

if (doctorCards.length) {
  doctorCards.forEach((card) => {
    card.addEventListener('click', (e) => {
      e.stopPropagation();
      const wasActive = card.classList.contains('is-active');
      doctorCards.forEach((c) => c.classList.remove('is-active'));
      if (!wasActive) card.classList.add('is-active');
    });
  });

  // 바깥을 탭하면 닫기
  document.addEventListener('click', () => {
    doctorCards.forEach((c) => c.classList.remove('is-active'));
  });
}
