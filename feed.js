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
let touchStartY = 0;

const feed = document.getElementById('feed');
const slides = [];

function videoAt(i) {
  return VIDEOS[((i % VIDEOS.length) + VIDEOS.length) % VIDEOS.length];
}

function createSlide(videoIndex) {
  const el = document.createElement('div');
  el.className = 'slide';
  const video = document.createElement('video');
  video.muted = true;
  video.loop = true;
  video.playsInline = true;
  video.src = videoAt(videoIndex);
  el.appendChild(video);
  el.style.transform = `translateY(${videoIndex * 100}%)`;
  feed.appendChild(el);
  return { el, video, videoIndex };
}

function updateVideos() {
  slides.forEach(slide => {
    slide.videoIndex === currentIndex ? slide.video.play() : slide.video.pause();
  });
}

function navigate(dir) {
  if (isAnimating) return;
  isAnimating = true;

  currentIndex += dir;

  slides.forEach(slide => {
    const offset = slide.videoIndex - currentIndex;
    if (Math.abs(offset) > HALF) {
      slide.videoIndex = currentIndex + (dir > 0 ? HALF : -HALF);
      slide.video.src = videoAt(slide.videoIndex);
      slide.el.style.transition = 'none';
      slide.el.style.transform = `translateY(${(slide.videoIndex - currentIndex) * 100}%)`;
      requestAnimationFrame(() => { slide.el.style.transition = ''; });
    } else {
      slide.el.style.transform = `translateY(${offset * 100}%)`;
    }
  });

  updateVideos();
  setTimeout(() => { isAnimating = false; }, 400);
}

function init() {
  for (let i = -HALF; i <= HALF; i++) slides.push(createSlide(i));
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
