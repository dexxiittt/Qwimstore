(function () {
  'use strict';

  // Data Default Banner
  const DEFAULT_BANNERS = [
    {
      id: '1',
      title: 'Diskon Spesial Gadget Terbaru 50%',
      subtitle: 'Dapatkan smartphone dan laptop impian dengan penawaran terbatas minggu ini.',
      badge: 'PROMO ULTAH',
      image: 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?auto=format&fit=crop&w=1200&q=80',
      btnText: 'Beli Sekarang'
    },
    {
      id: '2',
      title: 'Koleksi Fashion Summer Season',
      subtitle: 'Tampil gaya dengan pilihan baju dan aksesori kekinian diskon hingga 40%.',
      badge: 'NEW ARRIVAL',
      image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1200&q=80',
      btnText: 'Lihat Produk'
    }
  ];

  let banners = JSON.parse(localStorage.getItem('promo_banners')) || DEFAULT_BANNERS;
  let currentRole = 'user'; // role aktif: guest, user, admin
  let currentIndex = 0;
  let autoPlayTimer = null;

  // DOM Elements
  const track = document.getElementById('carouselTrack');
  const paginationContainer = document.getElementById('carouselPagination');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  const roleSelect = document.getElementById('roleSelector');
  const roleBadge = document.getElementById('roleBadge');
  const modal = document.getElementById('bannerModal');
  const bannerForm = document.getElementById('bannerForm');
  const closeModalBtn = document.getElementById('closeModalBtn');
  const cancelModalBtn = document.getElementById('cancelModalBtn');

  function init() {
    setupRole();
    renderCarousel();
    setupEventListeners();
    startAutoplay();
  }

  function setupRole() {
    currentRole = roleSelect.value;
    roleBadge.textContent = currentRole.toUpperCase();
    roleBadge.className = `badge badge-${currentRole}`;

    document.querySelectorAll('.role-table tr').forEach(tr => tr.classList.remove('active-role'));
    const activeRow = document.getElementById(`row-${currentRole}`);
    if (activeRow) activeRow.classList.add('active-role');

    renderCarousel();
  }

  function renderCarousel() {
    track.innerHTML = '';
    paginationContainer.innerHTML = '';

    banners.forEach((banner) => {
      const slide = document.createElement('div');
      slide.className = 'carousel-slide';
      slide.style.backgroundImage = `url('${banner.image}')`;

      let adminControlsHTML = '';
      if (currentRole === 'admin') {
        adminControlsHTML = `
          <div class="admin-slide-controls">
            <button class="admin-btn admin-btn-edit" data-id="${banner.id}" title="Edit">✏️</button>
            <button class="admin-btn admin-btn-delete" data-id="${banner.id}" title="Hapus">🗑️</button>
          </div>
        `;
      }

      slide.innerHTML = `
        ${adminControlsHTML}
        <div class="slide-overlay">
          ${banner.badge ? `<span class="slide-badge">${banner.badge}</span>` : ''}
          <h2 class="slide-title">${banner.title}</h2>
          ${banner.subtitle ? `<p class="slide-subtitle">${banner.subtitle}</p>` : ''}
          <button class="btn-cta" onclick="handleCtaClick('${banner.title}')">
            ${banner.btnText || 'Beli Sekarang'} ➔
          </button>
        </div>
      `;
      track.appendChild(slide);
    });

    // Jika Role Admin: Tambahkan Kotak/Card Plus di paling akhir slider
    if (currentRole === 'admin') {
      const addSlide = document.createElement('div');
      addSlide.className = 'carousel-slide add-banner-slide';
      addSlide.innerHTML = `
        <div class="add-banner-card" id="addBannerCardBtn">
          <div class="plus-icon">+</div>
          <h3>Tambah Banner Baru</h3>
          <p>Klik di sini untuk menambah slide (Akses Admin)</p>
        </div>
      `;
      track.appendChild(addSlide);
    }

    // Render Pagination Dots
    const totalSlides = track.children.length;
    for (let i = 0; i < totalSlides; i++) {
      const dot = document.createElement('div');
      dot.className = `dot ${i === currentIndex ? 'active' : ''}`;
      dot.addEventListener('click', () => goToSlide(i));
      paginationContainer.appendChild(dot);
    }

    if (currentIndex >= totalSlides) {
      currentIndex = Math.max(0, totalSlides - 1);
    }

    updateTrackPosition();
  }

  function updateTrackPosition() {
    track.style.transform = `translateX(-${currentIndex * 100}%)`;
    const dots = paginationContainer.children;
    Array.from(dots).forEach((dot, idx) => {
      dot.classList.toggle('active', idx === currentIndex);
    });
  }

  function goToSlide(index) {
    const totalSlides = track.children.length;
    if (totalSlides === 0) return;
    currentIndex = (index + totalSlides) % totalSlides;
    updateTrackPosition();
    resetAutoplay();
  }

  function nextSlide() { goToSlide(currentIndex + 1); }
  function prevSlide() { goToSlide(currentIndex - 1); }

  function startAutoplay() {
    stopAutoplay();
    autoPlayTimer = setInterval(nextSlide, 5000);
  }

  function stopAutoplay() { if (autoPlayTimer) clearInterval(autoPlayTimer); }
  function resetAutoplay() { stopAutoplay(); startAutoplay(); }

  function openModal(bannerData = null) {
    stopAutoplay();
    modal.classList.add('active');

    if (bannerData) {
      document.getElementById('modalTitle').textContent = 'Edit Banner Promo';
      document.getElementById('bannerId').value = bannerData.id;
      document.getElementById('bannerTitle').value = bannerData.title;
      document.getElementById('bannerSubtitle').value = bannerData.subtitle || '';
      document.getElementById('bannerBadge').value = bannerData.badge || '';
      document.getElementById('bannerImage').value = bannerData.image;
      document.getElementById('bannerBtnText').value = bannerData.btnText || '';
    } else {
      document.getElementById('modalTitle').textContent = 'Tambah Banner Baru';
      bannerForm.reset();
      document.getElementById('bannerId').value = '';
    }
  }

  function closeModal() {
    modal.classList.remove('active');
    startAutoplay();
  }

  window.handleCtaClick = function (bannerTitle) {
    if (currentRole === 'guest') {
      alert(`[GUEST MODE]\nAnda mengeklik promo "${bannerTitle}". Silakan login untuk checkout.`);
    } else if (currentRole === 'user') {
      alert(`[USER MODE]\nBerhasil mengeklik "${bannerTitle}". Mengarahkan ke halaman checkout produk...`);
    } else if (currentRole === 'admin') {
      alert(`[ADMIN MODE]\nPreview tombol untuk promo "${bannerTitle}".`);
    }
  };

  function setupEventListeners() {
    roleSelect.addEventListener('change', setupRole);
    prevBtn.addEventListener('click', prevSlide);
    nextBtn.addEventListener('click', nextSlide);

    track.addEventListener('click', (e) => {
      if (e.target.closest('#addBannerCardBtn')) {
        openModal();
        return;
      }
      const editBtn = e.target.closest('.admin-btn-edit');
      if (editBtn) {
        const id = editBtn.dataset.id;
        const banner = banners.find(b => b.id === id);
        if (banner) openModal(banner);
        return;
      }
      const deleteBtn = e.target.closest('.admin-btn-delete');
      if (deleteBtn) {
        const id = deleteBtn.dataset.id;
        if (confirm('Yakin ingin menghapus banner ini?')) {
          banners = banners.filter(b => b.id !== id);
          localStorage.setItem('promo_banners', JSON.stringify(banners));
          renderCarousel();
        }
      }
    });

    bannerForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const id = document.getElementById('bannerId').value;
      const title = document.getElementById('bannerTitle').value;
      const subtitle = document.getElementById('bannerSubtitle').value;
      const badge = document.getElementById('bannerBadge').value;
      const image = document.getElementById('bannerImage').value;
      const btnText = document.getElementById('bannerBtnText').value;

      if (id) {
        const index = banners.findIndex(b => b.id === id);
        if (index !== -1) banners[index] = { id, title, subtitle, badge, image, btnText };
      } else {
        banners.push({ id: Date.now().toString(), title, subtitle, badge, image, btnText });
      }

      localStorage.setItem('promo_banners', JSON.stringify(banners));
      closeModal();
      renderCarousel();
    });

    closeModalBtn.addEventListener('click', closeModal);
    cancelModalBtn.addEventListener('click', closeModal);

    // Support Swipe di Smartphone
    let startX = 0, dist = 0;
    track.addEventListener('touchstart', (e) => { startX = e.touches[0].clientX; dist = 0; stopAutoplay(); }, { passive: true });
    track.addEventListener('touchmove', (e) => { dist = e.touches[0].clientX - startX; }, { passive: true });
    track.addEventListener('touchend', () => {
      if (Math.abs(dist) > 40) dist > 0 ? prevSlide() : nextSlide();
      startAutoplay();
    });
  }

  document.addEventListener('DOMContentLoaded', init);
})();
