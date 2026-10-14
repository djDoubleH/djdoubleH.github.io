/* =============================================
   Double H – main.js
============================================= */

'use strict';

/* ── Fullscreen Intro Video (Tự phát ngay khi load/reload) ── */
const introOverlay = document.getElementById('introOverlay');
const introVideo   = document.getElementById('introVideo');
const introSkipBtn = document.getElementById('introSkipBtn');

if (introOverlay && introVideo) {
  // Khoá cuộn trang khi đang chạy intro
  document.body.style.overflow = 'hidden';

  const CUT_END_SECONDS = 1.5; // Cắt đúng 1.5 giây cuối để thấy trọn vẹn tên Double H
  let isIntroFinished = false;

  const finishIntro = () => {
    if (isIntroFinished) return;
    isIntroFinished = true;

    introVideo.pause();
    introOverlay.classList.add('fade-out');
    document.body.style.overflow = '';

    // Khởi chạy video nền Hero sau khi vào trang chính
    const heroVid = document.getElementById('heroVideo');
    if (heroVid) {
      heroVid.play().catch(() => {});
    }

    setTimeout(() => {
      introOverlay.remove();
    }, 1400);
  };

  // Tự động phát video intro ngay khi tải trang
  introVideo.muted = true; // Bắt buộc muted để 100% trình duyệt cho phép tự phát ngay khi load trang
  const playPromise = introVideo.play();
  if (playPromise !== undefined) {
    playPromise.catch(() => {
      introVideo.muted = true;
      introVideo.play().catch(() => {});
    });
  }

  // Tự động chuyển cảnh khi còn 1.5s cuối (cắt 1.5 giây cuối của video)
  introVideo.addEventListener('timeupdate', () => {
    if (!isIntroFinished && introVideo.duration > CUT_END_SECONDS) {
      if (introVideo.currentTime >= introVideo.duration - CUT_END_SECONDS) {
        finishIntro();
      }
    }
  });

  // Nếu người dùng click vào màn hình trong lúc intro đang chạy, tự động bật âm thanh
  window.addEventListener('click', () => {
    if (introVideo && !introVideo.paused) {
      introVideo.muted = false;
    }
  }, { once: true });

  // Khi video intro chạy xong -> tự động mở trang mượt mà (dự phòng)
  introVideo.addEventListener('ended', finishIntro);

  // Nút Bỏ qua intro
  if (introSkipBtn) {
    introSkipBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      finishIntro();
    });
  }

  // Phòng ngừa trường hợp file video lỗi -> không bị kẹt màn hình
  introVideo.addEventListener('error', finishIntro);
}

/* ── Navbar scroll effect ──────────────────── */
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 60);
  highlightActiveNav();
});

/* ── Hamburger / mobile nav ─────────────────── */
const hamburger = document.getElementById('hamburger');
const navLinks  = document.getElementById('navLinks');
const navClose  = document.getElementById('navClose');

hamburger.addEventListener('click', () => {
  navLinks.classList.toggle('open');
  hamburger.classList.toggle('active');
});

// Nút X đóng menu
if (navClose) {
  navClose.addEventListener('click', () => {
    navLinks.classList.remove('open');
    hamburger.classList.remove('active');
  });
}

// Click vào link thì đóng menu
navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('open');
    hamburger.classList.remove('active');
  });
});

// Click ra ngoài overlay thì đóng menu
document.addEventListener('click', (e) => {
  if (navLinks.classList.contains('open') &&
      !navLinks.contains(e.target) &&
      !hamburger.contains(e.target)) {
    navLinks.classList.remove('open');
    hamburger.classList.remove('active');
  }
});

/* ── Bảo vệ nghệ danh 'Double H' không bị dịch trên toàn bộ trang ── */
function protectDoubleHBrand() {
  const walker = document.createTreeWalker(
    document.body,
    NodeFilter.SHOW_TEXT,
    {
      acceptNode: (node) => {
        const parent = node.parentElement;
        if (!parent) return NodeFilter.FILTER_REJECT;
        const tag = parent.tagName.toLowerCase();
        if (tag === 'script' || tag === 'style' || tag === 'noscript') return NodeFilter.FILTER_REJECT;
        if (parent.classList.contains('notranslate') || parent.closest('.notranslate')) return NodeFilter.FILTER_REJECT;
        if (node.nodeValue && node.nodeValue.includes('Double H')) return NodeFilter.FILTER_ACCEPT;
        return NodeFilter.FILTER_SKIP;
      }
    }
  );

  const nodesToReplace = [];
  while (walker.nextNode()) {
    nodesToReplace.push(walker.currentNode);
  }

  nodesToReplace.forEach(node => {
    const parent = node.parentNode;
    if (!parent) return;
    const parts = node.nodeValue.split(/(Double H)/g);
    const fragment = document.createDocumentFragment();
    parts.forEach(part => {
      if (part === 'Double H') {
        const span = document.createElement('span');
        span.className = 'notranslate';
        span.translate = false;
        span.textContent = 'Double H';
        fragment.appendChild(span);
      } else if (part) {
        fragment.appendChild(document.createTextNode(part));
      }
    });
    parent.replaceChild(fragment, node);
  });
}

// Chạy bảo vệ nghệ danh ngay khi load trang
protectDoubleHBrand();

/* ── Chức năng dịch 20 ngôn ngữ (Google Translate API) ── */
const langSelector = document.getElementById('langSelector');
const langBtn      = document.getElementById('langBtn');
const langDropdown = document.getElementById('langDropdown');
const langCurrent  = document.querySelector('.lang-current');

if (langBtn && langSelector) {
  // Bật/tắt menu dropdown chọn ngôn ngữ
  langBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    langSelector.classList.toggle('active');
  });

  // Đóng dropdown khi click ra ngoài
  document.addEventListener('click', (e) => {
    if (!langSelector.contains(e.target)) {
      langSelector.classList.remove('active');
    }
  });

  // Xử lý chọn 1 trong 20 ngôn ngữ
  document.querySelectorAll('.lang-option').forEach(option => {
    option.addEventListener('click', () => {
      const selectedLang = option.dataset.lang;
      const flagCode = option.dataset.flag;

      document.querySelectorAll('.lang-option').forEach(opt => opt.classList.remove('active'));
      option.classList.add('active');
      langSelector.classList.remove('active');

      if (langCurrent) {
        langCurrent.textContent = selectedLang.toUpperCase().slice(0, 2);
      }

      const currentFlagImg = document.querySelector('.lang-flag-current');
      if (currentFlagImg && flagCode) {
        currentFlagImg.src = `https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/svg/${flagCode}.svg`;
      }

      // Kích hoạt dịch bằng cách đặt cookie googtrans
      changeLanguage(selectedLang);
    });
  });
}

function changeLanguage(langCode) {
  const host = window.location.hostname;
  const cookieValue = `/auto/${langCode}`;
  
  // Thiết lập cookie cho Google Translate
  document.cookie = `googtrans=${cookieValue}; path=/;`;
  if (host) {
    document.cookie = `googtrans=${cookieValue}; domain=.${host}; path=/;`;
    document.cookie = `googtrans=${cookieValue}; domain=${host}; path=/;`;
  }

  // Kích hoạt widget dịch của Google nếu đã load
  const select = document.querySelector('.goog-te-combo');
  if (select) {
    select.value = langCode;
    select.dispatchEvent(new Event('change'));
  } else {
    // Nếu widget chưa mount sẵn, reload nhẹ để nhận cookie ngôn ngữ mới
    window.location.reload();
  }
}

/* ── Active nav highlight ───────────────────── */
function highlightActiveNav() {
  const sections = document.querySelectorAll('section[id]');
  const scrollY  = window.scrollY + 120;
  sections.forEach(sec => {
    const top = sec.offsetTop, bottom = top + sec.offsetHeight;
    const link = document.querySelector(`.nav-links a[href="#${sec.id}"]`);
    if (link) link.classList.toggle('active', scrollY >= top && scrollY < bottom);
  });
}

/* ── Scroll reveal ──────────────────────────── */
const revealObserver = new IntersectionObserver(
  (entries) => entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('visible'); revealObserver.unobserve(e.target); }
  }),
  { threshold: 0.12 }
);

document.querySelectorAll(
  '.about-image, .about-content, .experience-card, .video-card, .contact-info, .contact-form, .section-header'
).forEach(el => { el.classList.add('reveal'); revealObserver.observe(el); });

/* ── Animated counters ──────────────────────── */
const countObserver = new IntersectionObserver(
  (entries) => entries.forEach(e => {
    if (e.isIntersecting) { animateCount(e.target); countObserver.unobserve(e.target); }
  }),
  { threshold: 0.5 }
);
document.querySelectorAll('.stat-num').forEach(el => countObserver.observe(el));

function animateCount(el) {
  const target = +el.dataset.count;
  let current = 0;
  const step = Math.max(1, Math.floor(target / 60));
  const timer = setInterval(() => {
    current += step;
    if (current >= target) { el.textContent = target; clearInterval(timer); }
    else { el.textContent = current; }
  }, 20);
}

/* ── Skill bars ─────────────────────────────── */
const skillObserver = new IntersectionObserver(
  (entries) => entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.querySelectorAll('.skill-fill').forEach(bar => {
        bar.style.width = bar.dataset.width + '%';
      });
      skillObserver.unobserve(e.target);
    }
  }),
  { threshold: 0.3 }
);
const skillsSection = document.querySelector('.skills-list');
if (skillsSection) skillObserver.observe(skillsSection);

/* ── Gallery: Hiện 6 ảnh đầu + Hiệu ứng xuất hiện từng ảnh một ── */
const INITIAL_SHOW = 6;
const galleryItems = document.querySelectorAll('.gallery-item');
const galleryGrid = document.querySelector('.gallery-grid');
const galleryMoreBtn = document.getElementById('galleryMoreBtn');
let isGalleryExpanded = false;
let galleryAnimatedOnce = false;

function updateGalleryVisibility(animateNew = false) {
  let staggerDelay = 0;
  galleryItems.forEach((item, index) => {
    if (isGalleryExpanded || index < INITIAL_SHOW) {
      const wasHidden = item.classList.contains('hidden-item');
      item.classList.remove('hidden-item');
      
      // Nếu là lần đầu vào tầm nhìn hoặc mới bấm Xem Thêm
      if (animateNew && wasHidden) {
        item.classList.remove('show-item');
        setTimeout(() => {
          item.classList.add('show-item');
        }, staggerDelay);
        staggerDelay += 90; // Mỗi ảnh cách nhau 90ms
      } else if (!animateNew && !galleryAnimatedOnce) {
        // Chưa được kích hoạt hiệu ứng cuộn thì giữ nguyên chờ IntersectionObserver
      } else {
        item.classList.add('show-item');
      }
    } else {
      item.classList.add('hidden-item');
      item.classList.remove('show-item');
    }
  });

  if (galleryMoreBtn) {
    if (galleryItems.length <= INITIAL_SHOW) {
      galleryMoreBtn.style.display = 'none';
    } else {
      galleryMoreBtn.style.display = 'inline-flex';
      if (isGalleryExpanded) {
        galleryMoreBtn.innerHTML = '<i class="fas fa-chevron-up"></i> Thu gọn ảnh';
      } else {
        const remaining = galleryItems.length - INITIAL_SHOW;
        galleryMoreBtn.innerHTML = `<i class="fas fa-plus-circle"></i> Xem Thêm (+${remaining} ảnh)`;
      }
    }
  }
}

// Khởi tạo hiển thị 6 ảnh đầu
updateGalleryVisibility(false);

// Hiệu ứng xuất hiện từng ảnh một khi cuộn đến Gallery
if (galleryGrid) {
  const gallerySectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !galleryAnimatedOnce) {
          galleryAnimatedOnce = true;
          // Xuất hiện tuần tự từng ảnh trong số các ảnh đang hiển thị
          let delay = 0;
          galleryItems.forEach((item, idx) => {
            if (idx < INITIAL_SHOW) {
              setTimeout(() => {
                item.classList.add('show-item');
              }, delay);
              delay += 110; // Cách nhau 110ms cho từng ảnh
            }
          });
          gallerySectionObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1 }
  );
  gallerySectionObserver.observe(galleryGrid);
}

if (galleryMoreBtn) {
  galleryMoreBtn.addEventListener('click', () => {
    isGalleryExpanded = !isGalleryExpanded;
    if (isGalleryExpanded) {
      // Khi bấm Xem Thêm: chạy hiệu ứng từng ảnh một cho các ảnh mới mở ra
      updateGalleryVisibility(true);
    } else {
      updateGalleryVisibility(false);
      const gallerySec = document.getElementById('gallery');
      if (gallerySec) gallerySec.scrollIntoView({ behavior: 'smooth' });
    }
  });
}

/* ── Lightbox ────────────────────────────────── */
const lightbox     = document.getElementById('lightbox');
const lightboxImg  = document.getElementById('lightboxImg');
const lbClose      = document.getElementById('lightboxClose');
const lbPrev       = document.getElementById('lightboxPrev');
const lbNext       = document.getElementById('lightboxNext');

let currentLbIdx = 0;
const lbImages   = [];

galleryItems.forEach((item, idx) => {
  const img = item.querySelector('img');
  lbImages.push({ src: img.src, alt: img.alt });
  item.addEventListener('click', () => openLightbox(idx));
});

function openLightbox(idx) {
  currentLbIdx = idx;
  lightboxImg.src = lbImages[idx].src;
  lightboxImg.alt = lbImages[idx].alt;
  lightbox.classList.add('active');
  document.body.style.overflow = 'hidden';
}
function closeLightbox() {
  lightbox.classList.remove('active');
  document.body.style.overflow = '';
}

lbClose.addEventListener('click', closeLightbox);
lightbox.addEventListener('click', e => { if (e.target === lightbox) closeLightbox(); });
lbPrev.addEventListener('click', () => {
  currentLbIdx = (currentLbIdx - 1 + lbImages.length) % lbImages.length;
  lightboxImg.src = lbImages[currentLbIdx].src;
});
lbNext.addEventListener('click', () => {
  currentLbIdx = (currentLbIdx + 1) % lbImages.length;
  lightboxImg.src = lbImages[currentLbIdx].src;
});
document.addEventListener('keydown', e => {
  if (!lightbox.classList.contains('active')) return;
  if (e.key === 'Escape') closeLightbox();
  if (e.key === 'ArrowLeft') lbPrev.click();
  if (e.key === 'ArrowRight') lbNext.click();
});

/* ── Video lazy load (chỉ nạp khi cuộn đến gần) ──────── */
const lazyVideos = document.querySelectorAll('.lazy-video');
if ('IntersectionObserver' in window) {
  const videoLazyObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const video = entry.target;
        if (video.dataset.src) {
          video.src = video.dataset.src;
          video.load();
        }
        observer.unobserve(video);
      }
    });
  }, {
    rootMargin: '200px 0px' // Tải trước khi người dùng cuộn đến cách 200px
  });

  lazyVideos.forEach(video => videoLazyObserver.observe(video));
} else {
  // Fallback nếu trình duyệt cũ không hỗ trợ IntersectionObserver
  lazyVideos.forEach(video => {
    if (video.dataset.src) video.src = video.dataset.src;
  });
}

/* ── Video modal ─────────────────────────────── */
const videoModal    = document.getElementById('videoModal');
const videoPlayer   = document.getElementById('videoPlayer');
const drivePlayer   = document.getElementById('drivePlayer');
const vmClose       = document.getElementById('videoModalClose');

document.querySelectorAll('.video-thumb').forEach(thumb => {
  thumb.addEventListener('click', () => {
    const driveId = thumb.dataset.drive;
    const localSrc = thumb.dataset.video;

    // Ưu tiên Drive Player để xem mượt và hỗ trợ GitHub Pages không có file lớn
    if (driveId) {
      if (drivePlayer) {
        drivePlayer.src = `https://drive.google.com/file/d/${driveId}/preview`;
        drivePlayer.style.display = 'block';
      }
      if (videoPlayer) {
        videoPlayer.pause();
        videoPlayer.style.display = 'none';
      }
    } else if (localSrc && videoPlayer) {
      if (drivePlayer) {
        drivePlayer.src = '';
        drivePlayer.style.display = 'none';
      }
      videoPlayer.style.display = 'block';
      videoPlayer.querySelector('source').setAttribute('src', localSrc);
      videoPlayer.load();
      videoPlayer.play().catch(() => {});
    }

    videoModal.classList.add('active');
    document.body.style.overflow = 'hidden';
  });
});

function closeVideoModal() {
  videoModal.classList.remove('active');
  if (videoPlayer) {
    videoPlayer.pause();
  }
  if (drivePlayer) {
    drivePlayer.src = ''; // Dừng video drive khi đóng modal
  }
  document.body.style.overflow = '';
}
vmClose.addEventListener('click', closeVideoModal);
videoModal.addEventListener('click', e => { if (e.target === videoModal) closeVideoModal(); });
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && videoModal.classList.contains('active')) closeVideoModal();
});



/* ── Hero Video Background (Phát từ đầu và tự động lặp) ── */
const heroVideo = document.getElementById('heroVideo');
const heroSoundToggle = document.getElementById('heroSoundToggle');

if (heroVideo) {
  // Đảm bảo video ở chế độ tắt tiếng và phát từ đầu
  heroVideo.muted = true;
  if (!introOverlay) {
    heroVideo.play().catch(() => {});
  }

  // Nút bật/tắt tiếng banner
  if (heroSoundToggle) {
    heroSoundToggle.addEventListener('click', () => {
      heroVideo.muted = !heroVideo.muted;
      const icon = heroSoundToggle.querySelector('i');
      if (heroVideo.muted) {
        icon.className = 'fas fa-volume-mute';
        heroSoundToggle.title = 'Bật âm thanh';
      } else {
        icon.className = 'fas fa-volume-up';
        heroSoundToggle.title = 'Tắt âm thanh';
      }
    });
  }
}

/* ── Hiệu ứng nhỏ giọt mực đỏ loang thấm dần trên giấy (Blood Ink Bleed Canvas) ── */
const inkCanvas = document.getElementById('bloodInkCanvas');
if (inkCanvas) {
  const ctx = inkCanvas.getContext('2d');
  let width = 0, height = 0;
  let drops = [];

  function resizeCanvas() {
    const parent = inkCanvas.parentElement;
    if (!parent) return;
    width = inkCanvas.width = parent.clientWidth || window.innerWidth;
    height = inkCanvas.height = parent.clientHeight || 800;
  }

  // Giọt mực đỏ máu loang thấm với tốc độ cao
  class InkDrop {
    constructor(x, y, maxR) {
      this.x = x;
      this.y = y;
      this.r = 6;
      this.maxR = maxR;
      this.speed = 3.8 + Math.random() * 3.5; // Tốc độ loang nhanh vượt trội (gấp 3 lần)
      this.alpha = 0.6 + Math.random() * 0.35; // Màu đậm, phủ kín nền nhanh
      this.done = false;
      
      // Tạo hình dạng mép loang méo mó tự nhiên như thấm trên giấy
      this.points = [];
      const count = 36;
      for (let i = 0; i < count; i++) {
        this.points.push(0.82 + Math.random() * 0.36);
      }
    }

    update() {
      if (this.r < this.maxR) {
        this.r += this.speed;
        this.speed *= 0.995; // Duy trì tốc độ loang nhanh hơn
      } else {
        this.done = true;
      }
    }

    draw() {
      ctx.save();
      ctx.beginPath();
      const count = this.points.length;
      const step = (Math.PI * 2) / count;

      for (let i = 0; i <= count; i++) {
        const idx = i % count;
        const radius = this.r * this.points[idx];
        const angle = i * step;
        const px = this.x + Math.cos(angle) * radius;
        const py = this.y + Math.sin(angle) * radius;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();

      // Màu đỏ máu rực rỡ, lan dần ra mép
      const grad = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, Math.max(1, this.r));
      grad.addColorStop(0, `rgba(235, 15, 45, ${this.alpha})`);
      grad.addColorStop(0.4, `rgba(185, 5, 35, ${this.alpha * 0.88})`);
      grad.addColorStop(0.75, `rgba(135, 0, 25, ${this.alpha * 0.55})`);
      grad.addColorStop(1, 'rgba(40, 0, 8, 0)');

      ctx.fillStyle = grad;
      ctx.fill();
      ctx.restore();
    }
  }

  function spawnDrop() {
    if (!width || !height) return;
    const x = Math.random() * width;
    const y = Math.random() * height;
    const maxR = 350 + Math.random() * 400;
    drops.push(new InkDrop(x, y, maxR));

    if (drops.length > 35) {
      drops.shift();
    }
  }

  window.addEventListener('resize', resizeCanvas);
  
  // Khởi động: tạo ngay 6 giọt lớn bao phủ các góc
  setTimeout(() => {
    resizeCanvas();
    drops.push(new InkDrop(width * 0.2, height * 0.25, 480));
    drops.push(new InkDrop(width * 0.8, height * 0.3, 500));
    drops.push(new InkDrop(width * 0.5, height * 0.65, 520));
    drops.push(new InkDrop(width * 0.15, height * 0.8, 450));
    drops.push(new InkDrop(width * 0.85, height * 0.85, 460));
    drops.push(new InkDrop(width * 0.5, height * 0.15, 450));
  }, 50);

  // Nhỏ thêm giọt mới liên tục mỗi 450ms (chớp mắt là loang ra các vị trí mới)
  setInterval(spawnDrop, 450);

  function animate() {
    ctx.clearRect(0, 0, width, height);
    for (let i = 0; i < drops.length; i++) {
      drops[i].update();
      drops[i].draw();
    }
    requestAnimationFrame(animate);
  }
  animate();
}

/* ── Init ────────────────────────────────────── */
highlightActiveNav();
