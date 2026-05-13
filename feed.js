const VIDEOS = [
  '/videos/-1381854028232193089.MP4',
  '/videos/-2466797579047759691.MP4',
  '/videos/-2635594312504430960.MP4',
  '/videos/3698940505591559678.MP4',
  '/videos/3746059563046546718.MP4',
  '/videos/-425148686832983381.MP4',
  '/videos/6702137189532704568.MP4',
  '/videos/6737137111559968548.MP4',
  '/videos/-6974447037748169156.MP4',
  '/videos/7578542087815133230.MP4',
  '/videos/7870372071727092435.MP4',
];

const POOL_SIZE = 5;
const HALF = Math.floor(POOL_SIZE / 2);

let currentIndex = 0;
let isAnimating = false;
let isMuted = true;
let touchStartY = 0;
let touchStartTime = 0;
let isPointerDown = false;
let didMove = false;
let isHolding = false;
let holdTimer = null;

const feed = document.getElementById('feed');
const slides = [];

function videoAt(i) {
  return VIDEOS[((i % VIDEOS.length) + VIDEOS.length) % VIDEOS.length];
}

function thumbAt(i) {
  const file = videoAt(i);
  return file.replace('/videos/', '/thumbs/').replace(/\.[^.]+$/, '.jpg');
}

function hydrateSlide(slide, videoIndex) {
  slide.videoIndex = videoIndex;
  const src = videoAt(videoIndex);
  if (new URL(src, location.origin).href !== slide.video.src) {
    slide.video.src = src;
    slide.video.load();
    slide.img.src = thumbAt(videoIndex);
    slide.img.style.display = '';
  }
}

function createSlide(videoIndex) {
  const el = document.createElement('div');
  el.className = 'slide';

  const video = document.createElement('video');
  video.muted = true;
  video.loop = true;
  video.playsInline = true;

  const img = document.createElement('img');
  img.className = 'thumb';

  el.appendChild(video);
  el.appendChild(img);
  el.style.transform = `translateY(${videoIndex * 100}%)`;
  feed.appendChild(el);

  const slide = { el, video, img, videoIndex };
  hydrateSlide(slide, videoIndex);
  return slide;
}

function initAudioBtn() {
  const btn = document.querySelector('.audio-btn');
  btn.addEventListener('click', () => {
    isMuted = !isMuted;
    btn.querySelector('.icon-muted').style.display = isMuted ? 'block' : 'none';
    btn.querySelector('.icon-sound').style.display = isMuted ? 'none' : 'block';
    const current = slides.find(s => s.videoIndex === currentIndex);
    if (current) current.video.muted = isMuted;
  });
}

function updatePreload() {
  slides.forEach(slide => {
    slide.video.preload = Math.abs(slide.videoIndex - currentIndex) <= 1 ? 'auto' : 'metadata';
  });
}

function updateVideos() {
  slides.forEach(slide => {
    if (slide.videoIndex === currentIndex) {
      slide.video.muted = isMuted;
      slide.video.play().catch(() => {});
      slide.video.addEventListener('playing', () => {
        slide.img.style.display = 'none';
      }, { once: true });
    } else {
      slide.video.pause();
      slide.video.currentTime = 0;
    }
  });
}

function navigate(dir) {
  if (isAnimating) return;
  isAnimating = true;

  currentIndex += dir;

  slides.forEach(slide => {
    const offset = slide.videoIndex - currentIndex;
    if (Math.abs(offset) > HALF) {
      const newVideoIndex = currentIndex + (dir > 0 ? HALF : -HALF);
      slide.el.style.transition = 'none';
      hydrateSlide(slide, newVideoIndex);
      slide.el.style.transform = `translateY(${(newVideoIndex - currentIndex) * 100}%)`;
      requestAnimationFrame(() => { requestAnimationFrame(() => { slide.el.style.transition = ''; }); });
    } else {
      slide.el.style.transform = `translateY(${offset * 100}%)`;
    }
  });

  updatePreload();
  updateVideos();

  const current = slides.find(s => s.videoIndex === currentIndex);
  const done = () => { isAnimating = false; };
  current.el.addEventListener('transitionend', done, { once: true });
  current.el.addEventListener('transitioncancel', done, { once: true });
}

function init() {
  for (let i = -HALF; i <= HALF; i++) slides.push(createSlide(i));
  initAudioBtn();
  updatePreload();
  updateVideos();

  document.addEventListener('visibilitychange', () => {
    const current = slides.find(s => s.videoIndex === currentIndex);
    if (!current) return;
    document.hidden ? current.video.pause() : current.video.play().catch(() => {});
  });

  feed.addEventListener('pointercancel', () => {
    isPointerDown = false;
    clearTimeout(holdTimer);
    if (didMove) {
      slides.forEach(s => { s.el.style.transition = ''; });
      requestAnimationFrame(() => {
        slides.forEach(s => {
          s.el.style.transform = `translateY(${(s.videoIndex - currentIndex) * 100}%)`;
        });
      });
    }
    didMove = false;
    isHolding = false;
  });

  feed.addEventListener('wheel', e => {
    e.preventDefault();
    navigate(e.deltaY > 0 ? 1 : -1);
  }, { passive: false });

  document.addEventListener('keydown', e => {
    if (e.key === 'ArrowDown') navigate(1);
    if (e.key === 'ArrowUp') navigate(-1);
  });

  feed.addEventListener('pointerdown', e => {
    if (e.target.closest('.audio-btn') || isAnimating) return;
    touchStartY = e.clientY;
    touchStartTime = Date.now();
    didMove = false;
    isHolding = false;
    isPointerDown = true;
    feed.setPointerCapture(e.pointerId);
    holdTimer = setTimeout(() => {
      isHolding = true;
      const current = slides.find(s => s.videoIndex === currentIndex);
      if (current) current.video.pause();
    }, 300);
  });

  feed.addEventListener('pointermove', e => {
    if (!isPointerDown) return;
    const dragY = e.clientY - touchStartY;
    if (!didMove && Math.abs(dragY) > 10) {
      didMove = true;
      clearTimeout(holdTimer);
      if (isHolding) {
        isHolding = false;
        const current = slides.find(s => s.videoIndex === currentIndex);
        if (current) current.video.play().catch(() => {});
      }
      slides.forEach(s => { s.el.style.transition = 'none'; });
    }
    if (didMove) {
      slides.forEach(s => {
        s.el.style.transform = `translateY(calc(${(s.videoIndex - currentIndex) * 100}% + ${dragY}px))`;
      });
    }
  });

  feed.addEventListener('pointerup', e => {
    if (e.target.closest('.audio-btn')) return;
    isPointerDown = false;
    clearTimeout(holdTimer);
    const delta = touchStartY - e.clientY;

    if (isHolding) {
      isHolding = false;
      const current = slides.find(s => s.videoIndex === currentIndex);
      if (current) current.video.play().catch(() => {});
      return;
    }

    if (didMove) {
      slides.forEach(s => { s.el.style.transition = ''; });
      const velocity = Math.abs(delta) / (Date.now() - touchStartTime);
      if ((velocity > 0.5 && Math.abs(delta) > 20) || Math.abs(delta) > window.innerHeight * 0.3) {
        navigate(delta > 0 ? 1 : -1);
      } else {
        requestAnimationFrame(() => {
          slides.forEach(s => {
            s.el.style.transform = `translateY(${(s.videoIndex - currentIndex) * 100}%)`;
          });
        });
      }
      return;
    }

    const current = slides.find(s => s.videoIndex === currentIndex);
    if (current) current.video.paused ? current.video.play().catch(() => {}) : current.video.pause();
  });
}

init();
