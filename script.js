/* -------------------------
   Core interactions & effects
   ------------------------- */

/* Helpers */
const $ = sel => document.querySelector(sel);
const $$ = sel => Array.from(document.querySelectorAll(sel));

/* ---------- PRELOADER ---------- */
window.addEventListener('load', () => {
  // ensure bar finished
  const pre = $('#preloader');
  setTimeout(() => {
    pre.style.opacity = '0';
    setTimeout(()=> pre.style.display = 'none', 600);
  }, 900);

  // trigger initial reveals
  revealOnScroll();
});

/* ---------- MOUSE GLOW ---------- */
const mouseGlow = $('#mouseGlow');
document.addEventListener('mousemove', (e) => {
  mouseGlow.style.left = `${e.clientX}px`;
  mouseGlow.style.top = `${e.clientY}px`;

  // enlarge when hovering interactive elements
  const t = e.target;
  if (t.matches('a, button, .btn, .project-card')) {
    mouseGlow.style.width = '260px';
    mouseGlow.style.height = '260px';
    mouseGlow.style.opacity = '0.95';
  } else {
    mouseGlow.style.width = '160px';
    mouseGlow.style.height = '160px';
    mouseGlow.style.opacity = '1';
  }
});

/* ---------- PARTICLES (canvas - blue glow) ---------- */
(function initParticles(){
  const canvas = document.getElementById('particlesCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let w = canvas.width = window.innerWidth;
  let h = canvas.height = window.innerHeight;
  const particles = [];
  const COUNT = Math.round(Math.max(20, w/60)); // scale with width

  function rand(min,max){ return Math.random()*(max-min)+min; }
  function Particle(){
    this.x = rand(0,w);
    this.y = rand(0,h);
    this.r = rand(1.4,4.2);
    this.vx = rand(-0.15,0.15);
    this.vy = rand(-0.12,-0.6);
    this.alpha = rand(0.08,0.35);
    this.life = rand(120,420);
  }
  for(let i=0;i<COUNT;i++) particles.push(new Particle());

  function resize(){
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resize);

  function draw(){
    ctx.clearRect(0,0,w,h);
    for (let p of particles){
      p.x += p.vx;
      p.y += p.vy;
      p.life--;
      if (p.life < 0 || p.y < -10 || p.x < -20 || p.x > w+20){
        // respawn at bottom
        p.x = rand(0,w);
        p.y = h + rand(10,80);
        p.vx = rand(-0.15,0.15);
        p.vy = rand(-0.12,-0.6);
        p.r = rand(1.4,4.2);
        p.alpha = rand(0.06,0.32);
        p.life = rand(120,420);
      }
      const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r*8);
      gradient.addColorStop(0, `rgba(63,169,245, ${p.alpha})`);
      gradient.addColorStop(0.4, `rgba(63,169,245, ${p.alpha*0.45})`);
      gradient.addColorStop(1, `rgba(63,169,245,0)`);
      ctx.beginPath();
      ctx.fillStyle = gradient;
      ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
      ctx.fill();
    }
    requestAnimationFrame(draw);
  }
  draw();
})();

/* ---------- TYPING EFFECT (hero name) ---------- */
(function typing(){
  const el = $('#typedName');
  if(!el) return;
  const text = 'Esat Eymen Karaaslan';
  let i = 0;
  function step(){
    if (i <= text.length){
      el.textContent = text.slice(0,i);
      i++;
      setTimeout(step, i < 6 ? 120 : 55); // accelerate
    } else {
      // keep caret blinking, optionally pause then loop none (we keep static after typed)
      return;
    }
  }
  setTimeout(step, 320);
})();

/* ---------- PARALLAX HERO ---------- */
const parallaxEl = document.querySelector('[data-parallax]');
window.addEventListener('scroll', () => {
  if (!parallaxEl) return;
  const offset = window.scrollY * 0.22;
  parallaxEl.style.transform = `translateY(${offset}px)`;
});

/* ---------- FADE-IN ON SCROLL ---------- */
const fadeItems = $$('.fade-in');
function revealOnScroll(){
  const winH = window.innerHeight;
  fadeItems.forEach(el => {
    const r = el.getBoundingClientRect();
    if (r.top < winH - 80) {
      el.style.opacity = 1;
      el.style.transform = 'translateY(0)';
    }
  });
}
window.addEventListener('scroll', revealOnScroll);

/* ---------- TIMELINE ANIMATION (simple appear) ---------- */
const timelineItems = $$('.timeline-item');
function revealTimeline(){
  timelineItems.forEach((it, idx) => {
    const r = it.getBoundingClientRect();
    if (r.top < window.innerHeight - 80) {
      it.style.opacity = 1;
      it.style.transform = 'translateX(0)';
      it.style.transition = `opacity .6s ease ${idx*120}ms, transform .6s ease ${idx*120}ms`;
    } else {
      it.style.opacity = 0;
      it.style.transform = 'translateX(-16px)';
    }
  });
}
window.addEventListener('scroll', revealTimeline);
window.addEventListener('load', revealTimeline);

/* ---------- MUSIC PLAYER ---------- */
const audio = $('#bgAudio');
const playBtn = $('#playBtn');
const progress = $('#mp-progress');
const curT = $('#mp-current');
const durT = $('#mp-duration');
const muteBtn = $('#mp-mute');

function formatTime(t){
  if (!t || isNaN(t)) return '0:00';
  const m = Math.floor(t/60), s = Math.floor(t%60).toString().padStart(2,'0');
  return `${m}:${s}`;
}
audio.addEventListener('loadedmetadata', () => {
  durT.textContent = formatTime(audio.duration);
});
audio.addEventListener('timeupdate', () => {
  if (audio.duration){
    progress.value = (audio.currentTime / audio.duration) * 100;
    curT.textContent = formatTime(audio.currentTime);
  }
});
playBtn.addEventListener('click', () => {
  if (audio.paused) {
    audio.play().catch(()=>{/* autoplay blocked; user must interact */});
    playBtn.textContent = '⏸';
  } else {
    audio.pause();
    playBtn.textContent = '▶';
  }
});
progress.addEventListener('input', () => {
  if (audio.duration) audio.currentTime = (progress.value/100) * audio.duration;
});
muteBtn.addEventListener('click', () => {
  audio.muted = !audio.muted;
  muteBtn.textContent = audio.muted ? '🔈' : '🔊';
});

/* ---------- Project hover cursor scale (a11y) ---------- */
$$('.project-card').forEach(card => {
  card.addEventListener('mouseenter', ()=> mouseGlow.style.transform = 'translate(-50%,-50%) scale(1.3)');
  card.addEventListener('mouseleave', ()=> mouseGlow.style.transform = 'translate(-50%,-50%) scale(1)');
});

/* ---------- Footer year ---------- */
const yearEl = $('#year');
if (yearEl) yearEl.textContent = new Date().getFullYear();
