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

const posterCache = new Map();
let currentIndex = 0;
let isAnimating = false;
let touchStartY = 0;

const feed = document.getElementById('feed');
const slides = [];

function videoAt(i) {
  return VIDEOS[((i % VIDEOS.length) + VIDEOS.length) % VIDEOS.length];
}

function capturePoster(video, url) {
  video.addEventListener('loadeddata', () => {
    if (new URL(video.src, location.origin).pathname !== url) return;
    if (posterCache.has(url) || !video.videoWidth) return;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);
    posterCache.set(url, canvas.toDataURL('image/jpeg', 0.7));
  }, { once: true });
}

function hydrateSlide(slide, videoIndex) {
  const url = videoAt(videoIndex);
  slide.videoIndex = videoIndex;
  slide.video.src = url;
  slide.img.style.display = 'none';
  capturePoster(slide.video, url);
}

function showPoster(slide) {
  const url = videoAt(slide.videoIndex);
  if (!posterCache.has(url)) return;
  slide.img.src = posterCache.get(url);
  slide.img.style.display = '';
}

function createSlide(videoIndex) {
  const el = document.createElement('div');
  el.className = 'slide';

  const video = document.createElement('video');
  video.muted = true;
  video.loop = true;
  video.playsInline = true;

  const img = document.createElement('img');
  img.className = 'placeholder';
  img.style.display = 'none';

  el.appendChild(video);
  el.appendChild(img);
  el.style.transform = `translateY(${videoIndex * 100}%)`;
  feed.appendChild(el);

  const slide = { el, video, img, videoIndex };
  hydrateSlide(slide, videoIndex);
  return slide;
}

function updatePreload() {
  slides.forEach(slide => {
    slide.video.preload = Math.abs(slide.videoIndex - currentIndex) <= 1 ? 'auto' : 'metadata';
  });
}

function updateVideos() {
  slides.forEach(slide => {
    if (slide.videoIndex === currentIndex) {
      showPoster(slide);
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
      requestAnimationFrame(() => { slide.el.style.transition = ''; });
    } else {
      slide.el.style.transform = `translateY(${offset * 100}%)`;
    }
  });

  updatePreload();
  updateVideos();
  setTimeout(() => { isAnimating = false; }, 400);
}

function init() {
  for (let i = -HALF; i <= HALF; i++) slides.push(createSlide(i));
  updatePreload();
  updateVideos();

  feed.addEventListener('wheel', e => {
    e.preventDefault();
    navigate(e.deltaY > 0 ? 1 : -1);
  }, { passive: false });

  document.addEventListener('keydown', e => {
    if (e.key === 'ArrowDown') navigate(1);
    if (e.key === 'ArrowUp') navigate(-1);
  });

  feed.addEventListener('pointerdown', e => { touchStartY = e.clientY; });
  feed.addEventListener('pointerup', e => {
    const delta = touchStartY - e.clientY;
    if (Math.abs(delta) > 60) navigate(delta > 0 ? 1 : -1);
  });
}

init();
