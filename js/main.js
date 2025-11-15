/**
 * PDF Library - Simplified with Native PDF Viewer
 * Uses browser's built-in <iframe> PDF viewer
 */

let subjectsGrid, searchResults, noResults, searchInput, clearSearchBtn;
let pdfModal, pdfViewer, closeModalBtn, downloadBtn, loadingSkeleton, particlesContainer;
let scrollProgress, themeToggle, scrollToTop, totalPdfsEl, totalCategoriesEl;
let isSearching = false;
let animationFrameId;
let particles = [];
let currentFilter = 'all';

// Subject icons and colors
const subjectInfo = {
    "Math": { icon: "📐", color: "#00CEDA" },
    "Physics": { icon: "⚛️", color: "#FF1493" },
    "Chemistry": { icon: "🧪", color: "#FFD700" },
    "Biology": { icon: "🧬", color: "#00CEDA" },
    "Computer Science": { icon: "💻", color: "#FF1493" }
};

document.addEventListener('DOMContentLoaded', () => {
    // Add page entrance animation
    document.body.style.opacity = '0';
    document.body.style.transform = 'translateY(10px)';
    
    setTimeout(() => {
        document.body.style.transition = 'opacity 0.5s ease-out, transform 0.5s ease-out';
        document.body.style.opacity = '1';
        document.body.style.transform = 'translateY(0)';
    }, 50);
    
    // DOM Elements
    subjectsGrid = document.getElementById('subjectsGrid');
    searchResults = document.getElementById('searchResults');
    noResults = document.getElementById('noResults');
    searchInput = document.getElementById('searchInput');
    clearSearchBtn = document.getElementById('clearSearch');
    pdfModal = document.getElementById('pdfModal');
    pdfViewer = document.getElementById('pdfViewer');
    closeModalBtn = document.getElementById('closeModal');
    downloadBtn = document.getElementById('downloadBtn');
    loadingSkeleton = document.getElementById('loadingSkeleton');
    particlesContainer = document.getElementById('particles-container');
    scrollProgress = document.getElementById('scrollProgress');
    themeToggle = document.getElementById('themeToggle');
    scrollToTop = document.getElementById('scrollToTop');
    totalPdfsEl = document.getElementById('totalPdfs');
    totalCategoriesEl = document.getElementById('totalCategories');

    // Initialize features
    initializeParticles();
    initializeEnhancedEffects();
    initializeNewUIElements();
    updateStats();

    if (subjectsGrid) {
        initializeMainPage();
    } else {
        initializeSubjectPage();
    }

    setupEventListeners();
});

function initializeMainPage() {
    loadingSkeleton.style.display = 'flex';
    loadingSkeleton.style.animation = 'fadeInScale 0.5s ease-out';
    
    setTimeout(() => {
        renderSubjectsGrid();
        loadingSkeleton.style.opacity = '0';
        loadingSkeleton.style.transform = 'scale(0.95)';
        
        setTimeout(() => {
            loadingSkeleton.style.display = 'none';
            subjectsGrid.style.display = 'grid';
            subjectsGrid.style.animation = 'fadeInScale 0.8s ease-out both';
        }, 300);
    }, 1500);
}

function initializeSubjectPage() {
    const subjectName = document.title.split(' - ')[0];
    document.body.style.animation = 'fadeIn 0.6s ease-out both';
    renderSubjectPdfs(subjectName);
}

// === Particles ===
function initializeParticles() {
    if (!particlesContainer) return;
    for (let i = 0; i < 50; i++) createParticle();
    animateParticles();
}

function createParticle() {
    const p = document.createElement('div');
    p.style.position = 'fixed';
    p.style.width = p.style.height = Math.random() * 4 + 1 + 'px';
    p.style.backgroundColor = getComputedStyle(document.documentElement)
        .getPropertyValue('--particle-colors').split(', ')[Math.floor(Math.random() * 6)];
    p.style.borderRadius = '50%';
    p.style.pointerEvents = 'none';
    p.style.zIndex = '-1';
    p.style.opacity = Math.random() * 0.6 + 0.2;
    p.style.left = Math.random() * window.innerWidth + 'px';
    p.style.top = Math.random() * window.innerHeight + 'px';
    p.dataset.vx = (Math.random() - 0.5) * 0.5;
    p.dataset.vy = (Math.random() - 0.5) * 0.5;
    p.dataset.size = parseFloat(p.style.width);
    document.body.appendChild(p);
    particles.push(p);
}

function animateParticles() {
    particles.forEach(p => {
        let x = parseFloat(p.style.left);
        let y = parseFloat(p.style.top);
        let vx = parseFloat(p.dataset.vx);
        let vy = parseFloat(p.dataset.vy);
        const size = parseFloat(p.dataset.size);

        x += vx; y += vy;
        if (x <= 0 || x >= window.innerWidth - size) vx = -vx;
        if (y <= 0 || y >= window.innerHeight - size) vy = -vy;
        p.dataset.vx = vx; p.dataset.vy = vy;
        p.style.left = x + 'px';
        p.style.top = y + 'px';
        p.style.transform = `translateY(${Math.sin(Date.now() * 0.001 + x) * 2}px)`;
    });
    animationFrameId = requestAnimationFrame(animateParticles);
}

function initializeEnhancedEffects() {
    document.addEventListener('mousemove', (e) => {
        const x = (e.clientX / window.innerWidth - 0.5) * 20;
        const y = (e.clientY / window.innerHeight - 0.5) * 20;
        if (particlesContainer) particlesContainer.style.transform = `translate(${x}px, ${y}px)`;
    });
    addEntranceAnimations();
}

function addEntranceAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, i) => {
            if (entry.isIntersecting) {
                setTimeout(() => entry.target.style.animation = `fadeInUp 0.6s ease-out both`, i * 100);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });
    document.querySelectorAll('.subject-button, .pdf-item, .pdf-card').forEach(el => observer.observe(el));
}

// === Render Subjects ===
function renderSubjectsGrid() {
    const categories = [...new Set(pdfData.map(p => p.category))];
    const order = ['Math', 'Physics', 'Chemistry', 'Biology', 'Computer Science'];
    categories.sort((a, b) => {
        const ia = order.indexOf(a), ib = order.indexOf(b);
        return ia !== -1 && ib !== -1 ? ia - ib : ia !== -1 ? -1 : ib !== -1 ? 1 : a.localeCompare(b);
    });

    subjectsGrid.innerHTML = '';
    categories.forEach((cat, i) => {
        const count = pdfData.filter(p => p.category === cat).length;
        const btn = createEnhancedSubjectButton(cat, count, i);
        setTimeout(() => subjectsGrid.appendChild(btn), i * 150);
    });
}

function createEnhancedSubjectButton(name, count, index) {
    const a = document.createElement('a');
    a.className = 'subject-button smooth-transition';
    a.href = `${name.toLowerCase()}.html`;
    const info = subjectInfo[name] || { icon: "Book", color: "#6b7280" };
    a.innerHTML = `
        <div class="subject-icon-wrapper"><div class="subject-icon">${info.icon}</div></div>
        <div class="subject-content">
            <div class="subject-name">${name}</div>
            <div class="subject-count">${count} PDF${count !== 1 ? 's' : ''}</div>
        </div>
        <div class="subject-glow"></div>
    `;
    
    // Enhanced interaction effects
    a.addEventListener('click', function(e) {
        // Create ripple effect at click position
        const ripple = document.createElement('span');
        const rect = this.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height) * 2;
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;
        
        ripple.className = 'ripple';
        ripple.style.cssText = `
            position: absolute;
            border-radius: 50%;
            background: rgba(255,255,255,0.6);
            width: ${size}px;
            height: ${size}px;
            left: ${x}px;
            top: ${y}px;
            transform: scale(0);
            animation: ripple 0.8s ease-out;
            pointer-events: none;
        `;
        this.style.position = 'relative';
        this.style.overflow = 'hidden';
        this.appendChild(ripple);
        setTimeout(() => ripple.remove(), 800);
    });
    
    // 3D tilt effect on mouse move
    a.addEventListener('mousemove', e => {
        const r = a.getBoundingClientRect();
        const x = e.clientX - r.left - r.width / 2;
        const y = e.clientY - r.top - r.height / 2;
        a.style.transform = `translateY(-8px) rotateX(${-y * 0.02}deg) rotateY(${x * 0.02}deg) scale(1.02)`;
    });
    
    a.addEventListener('mouseleave', () => {
        a.style.transform = 'translateY(0) rotateX(0) rotateY(0) scale(1)';
    });
    
    generateSubjectPage(name, info);
    return a;
}

function addSubjectButtonEffects(btn) {
    btn.addEventListener('click', function(e) {
        const ripple = document.createElement('span');
        ripple.className = 'ripple';
        ripple.style.cssText = `position:absolute;border-radius:50%;background:rgba(255,255,255,0.6);width:40px;height:40px;transform:scale(0);animation:ripple 0.6s ease-out;pointer-events:none;left:${e.clientX - this.getBoundingClientRect().left - 20}px;top:${e.clientY - this.getBoundingClientRect().top - 20}px;`;
        this.appendChild(ripple);
        setTimeout(() => ripple.remove(), 600);
    });
    btn.addEventListener('mousemove', e => {
        const r = btn.getBoundingClientRect();
        const x = e.clientX - r.left - r.width / 2;
        const y = e.clientY - r.top - r.height / 2;
        btn.style.transform = `translateY(-8px) rotateX(${-y * 0.01}deg) rotateY(${x * 0.01}deg)`;
    });
    btn.addEventListener('mouseleave', () => btn.style.transform = 'translateY(0) rotateX(0) rotateY(0)');
}

// === PDF Cards & List ===
function renderSubjectPdfs(subjectName) {
    const pdfs = pdfData.filter(p => p.category === subjectName);
    const container = document.querySelector('.pdf-list') || document.querySelector('.pdf-grid');
    if (!container) return;

    container.className = 'pdf-grid';
    container.innerHTML = '';
    if (pdfs.length === 0) {
        container.innerHTML = `<div class="no-results" style="grid-column:1/-1"><p>No PDFs yet.</p></div>`;
        return;
    }
    
    // Add stagger animation with enhanced timing
    pdfs.forEach((pdf, i) => {
        setTimeout(() => {
            const card = createPdfCard(pdf);
            card.style.animation = `fadeInScale 0.6s ease-out both`;
            card.style.animationDelay = `${i * 0.05}s`;
            container.appendChild(card);
        }, i * 50);
    });
}

function createPdfCard(pdf) {
    const card = document.createElement('div');
    card.className = 'pdf-card smooth-transition';
    const info = subjectInfo[pdf.category] || { icon: "Book", color: "#6b7280" };
    card.innerHTML = `
        <div class="pdf-thumbnail"><div class="pdf-thumbnail-icon">${info.icon}</div></div>
        <div class="pdf-card-content">
            <div class="pdf-card-title">${pdf.title}</div>
            ${pdf.description ? `<div class="pdf-card-description">${pdf.description}</div>` : ''}
            <div class="pdf-card-actions">
                <button class="btn-view-card smooth-transition" data-path="${pdf.path}" data-filename="${pdf.filename}">View</button>
                <a href="${pdf.path}" download="${pdf.filename}" class="btn-download-card smooth-transition">Download</a>
            </div>
        </div>
    `;
    
    const viewBtn = card.querySelector('.btn-view-card');
    viewBtn.addEventListener('click', (e) => {
        // Add click animation
        e.target.style.transform = 'scale(0.95)';
        setTimeout(() => {
            e.target.style.transform = '';
            openPdfModal(e.target.dataset.path, e.target.dataset.filename);
        }, 100);
    });
    
    // Enhanced hover effects
    card.addEventListener('mouseenter', () => {
        card.style.transform = 'translateY(-8px)';
        card.querySelector('.pdf-thumbnail-icon').style.transform = 'scale(1.1) rotate(5deg)';
    });
    
    card.addEventListener('mouseleave', () => {
        card.style.transform = 'translateY(0)';
        card.querySelector('.pdf-thumbnail-icon').style.transform = 'scale(1) rotate(0)';
    });
    
    // Add ripple effect to buttons
    addRippleEffect(viewBtn);
    addRippleEffect(card.querySelector('.btn-download-card'));
    
    return card;
}

// === PDF Viewer with Google Docs Viewer ===
function openPdfModal(pdfPath, filename) {
    pdfModal.classList.add('active');
    pdfViewer.style.opacity = '0';
    pdfViewer.src = pdfPath;
    downloadBtn.href = pdfPath;
    downloadBtn.download = filename || 'document.pdf';
    
    // Add smooth fade-in for PDF viewer
    setTimeout(() => {
        pdfViewer.style.opacity = '1';
    }, 200);
    
    setTimeout(() => {
        pdfModal.style.opacity = '1';
        pdfModal.querySelector('.modal-content').style.animation = 'slideUpScale 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)';
    }, 10);
    document.body.style.overflow = 'hidden';
    
    // Add ripple effect to download button
    addRippleEffect(downloadBtn);
}

function closePdfModal() {
    pdfModal.querySelector('.modal-content').style.animation = 'fadeOut 0.3s ease-out both';
    setTimeout(() => {
        pdfModal.classList.remove('active');
        pdfModal.style.opacity = '0';
        pdfViewer.src = '';
        pdfViewer.style.opacity = '0';
        document.body.style.overflow = '';
    }, 300);
}

// === Enhanced Ripple Effect ===
function addRippleEffect(element) {
    element.addEventListener('click', function(e) {
        const ripple = document.createElement('span');
        const rect = this.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;
        
        ripple.style.cssText = `
            position: absolute;
            border-radius: 50%;
            background: rgba(255,255,255,0.6);
            width: ${size}px;
            height: ${size}px;
            left: ${x}px;
            top: ${y}px;
            transform: scale(0);
            animation: ripple 0.6s ease-out;
            pointer-events: none;
        `;
        ripple.className = 'ripple-effect';
        this.style.position = 'relative';
        this.style.overflow = 'hidden';
        this.appendChild(ripple);
        setTimeout(() => ripple.remove(), 600);
    });
}

// === New UI Elements ===
function initializeNewUIElements() {
    // Scroll progress bar
    window.addEventListener('scroll', updateScrollProgress);
    
    // Theme toggle (light/dark mode simulation)
    themeToggle?.addEventListener('click', toggleTheme);
    
    // Scroll to top button
    scrollToTop?.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        scrollToTop.style.transform = 'scale(1.2) rotate(360deg)';
        setTimeout(() => {
            scrollToTop.style.transform = '';
        }, 300);
    });
    
    // Show/hide scroll to top button
    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            scrollToTop?.classList.add('visible');
        } else {
            scrollToTop?.classList.remove('visible');
        }
    });
    
    // Filter buttons
    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all
            filterBtns.forEach(b => b.classList.remove('active'));
            // Add active to clicked
            btn.classList.add('active');
            currentFilter = btn.dataset.filter;
            applyFilter();
            
            // Add click animation
            btn.style.transform = 'scale(0.9)';
            setTimeout(() => btn.style.transform = '', 100);
        });
        
        // Add ripple effect
        addRippleEffect(btn);
    });
}

function updateScrollProgress() {
    const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrolled = (window.scrollY / windowHeight) * 100;
    if (scrollProgress) {
        scrollProgress.style.width = scrolled + '%';
    }
}

function toggleTheme() {
    document.body.classList.toggle('light-theme');
    themeToggle.style.transform = 'rotate(180deg) scale(1.2)';
    setTimeout(() => {
        themeToggle.style.transform = '';
    }, 300);
}

function updateStats() {
    // Animate numbers counting up
    const totalPdfs = pdfData.length;
    const categories = [...new Set(pdfData.map(p => p.category))].length;
    
    animateNumber(totalPdfsEl, 0, totalPdfs, 1500);
    animateNumber(totalCategoriesEl, 0, categories, 1500);
}

function animateNumber(element, start, end, duration) {
    if (!element) return;
    const range = end - start;
    const increment = range / (duration / 16);
    let current = start;
    
    const timer = setInterval(() => {
        current += increment;
        if (current >= end) {
            element.textContent = end;
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(current);
        }
    }, 16);
}

function applyFilter() {
    if (currentFilter === 'all') {
        // Show all subjects
        subjectsGrid.style.display = 'grid';
        searchResults.style.display = 'none';
        noResults.style.display = 'none';
    } else {
        // Filter by category
        const filtered = pdfData.filter(p => p.category === currentFilter);
        if (filtered.length > 0) {
            displayEnhancedSearchResults(filtered);
        } else {
            displayEnhancedNoResults();
        }
    }
}

// === Search ===
function handleSearch() {
    const query = searchInput.value.trim().toLowerCase();
    if (!query) { clearSearchResults(); return; }
    if (!isSearching) { isSearching = true; searchInput.style.animation = 'pulse 1s ease-in-out infinite'; }

    const results = pdfData.filter(p =>
        p.title.toLowerCase().includes(query) ||
        p.category.toLowerCase().includes(query) ||
        (p.description && p.description.toLowerCase().includes(query))
    );

    setTimeout(() => {
        isSearching = false;
        searchInput.style.animation = '';
        if (results.length > 0) displayEnhancedSearchResults(results);
        else displayEnhancedNoResults();
    }, 300);
}

function displayEnhancedSearchResults(results) {
    subjectsGrid.style.animation = 'fadeOut 0.3s both';
    setTimeout(() => {
        subjectsGrid.style.display = 'none';
        noResults.style.display = 'none';
        searchResults.style.display = 'block';
        searchResults.style.animation = 'fadeInScale 0.5s both';
        searchResults.innerHTML = '';

        const grouped = {};
        results.forEach(p => {
            if (!grouped[p.category]) grouped[p.category] = [];
            grouped[p.category].push(p);
        });

        Object.keys(grouped).sort().forEach((cat, i) => {
            setTimeout(() => {
                const header = document.createElement('div');
                header.className = 'search-category';
                header.textContent = cat;
                header.style.animation = 'slideInLeft 0.4s both';
                searchResults.appendChild(header);

                grouped[cat].forEach((pdf, j) => {
                    setTimeout(() => {
                        const item = createEnhancedPdfElement(pdf);
                        searchResults.appendChild(item);
                    }, j * 100);
                });
            }, i * 200);
        });
    }, 300);
}

function createEnhancedPdfElement(pdf) {
    const item = document.createElement('div');
    item.className = 'pdf-item smooth-transition';
    item.innerHTML = `
        <div class="pdf-info">
            <div class="pdf-title">${pdf.title}</div>
            ${pdf.description ? `<div class="pdf-description">${pdf.description}</div>` : ''}
        </div>
        <div class="pdf-actions">
            <button class="btn-view smooth-transition" data-path="${pdf.path}" data-filename="${pdf.filename}">View</button>
            <a href="${pdf.path}" download="${pdf.filename}" class="btn-download smooth-transition">Download</a>
        </div>
    `;
    
    const viewBtn = item.querySelector('.btn-view');
    viewBtn.addEventListener('click', (e) => {
        // Add click feedback
        e.target.style.transform = 'scale(0.95)';
        setTimeout(() => {
            e.target.style.transform = '';
            openPdfModal(e.target.dataset.path, e.target.dataset.filename);
        }, 100);
    });
    
    // Enhanced hover with smooth transitions
    item.addEventListener('mouseenter', () => {
        item.style.transform = 'translateX(8px)';
        item.style.background = 'rgba(255, 255, 255, 0.15)';
    });
    
    item.addEventListener('mouseleave', () => {
        item.style.transform = 'translateX(0)';
        item.style.background = '';
    });
    
    // Add ripple effects
    addRippleEffect(viewBtn);
    addRippleEffect(item.querySelector('.btn-download'));
    
    return item;
}

function displayEnhancedNoResults() {
    subjectsGrid.style.animation = 'fadeOut 0.3s both';
    setTimeout(() => {
        subjectsGrid.style.display = 'none';
        searchResults.style.display = 'none';
        noResults.style.display = 'block';
        noResults.style.animation = 'fadeInScale 0.5s both';
    }, 300);
}

function clearSearchResults() {
    searchInput.value = '';
    searchResults.style.animation = 'fadeOut 0.3s both';
    setTimeout(() => {
        searchResults.style.display = 'none';
        noResults.style.display = 'none';
        subjectsGrid.style.display = 'grid';
        subjectsGrid.style.animation = 'fadeInScale 0.5s both';
    }, 300);
}

// === Event Listeners ===
function setupEventListeners() {
    let timeout;
    searchInput?.addEventListener('input', () => {
        clearTimeout(timeout);
        // Add typing animation feedback
        searchInput.style.transform = 'scale(1.02)';
        setTimeout(() => {
            searchInput.style.transform = 'scale(1)';
        }, 100);
        timeout = setTimeout(handleSearch, 300);
    });

    clearSearchBtn?.addEventListener('click', () => {
        clearSearchBtn.style.transform = 'translateY(-50%) rotate(180deg) scale(1.2)';
        clearSearchResults();
        setTimeout(() => clearSearchBtn.style.transform = 'translateY(-50%) rotate(0deg) scale(1)', 300);
    });

    closeModalBtn?.addEventListener('click', () => {
        closeModalBtn.style.transform = 'rotate(90deg) scale(1.2)';
        setTimeout(() => {
            closeModalBtn.style.transform = '';
            closePdfModal();
        }, 150);
    });
    
    pdfModal?.addEventListener('click', e => {
        if (e.target === pdfModal) {
            closePdfModal();
        }
    });

    document.addEventListener('keydown', e => {
        if (pdfModal.classList.contains('active') && e.key === 'Escape') {
            closePdfModal();
        }
    });
    
    // Add ripple effects to buttons
    if (clearSearchBtn) addRippleEffect(clearSearchBtn);
}

// === Dynamic Subject Page Generation (unchanged logic) ===
function generateSubjectPage(categoryName, subjectData) {
    const fileName = `${categoryName.toLowerCase()}.html`;
    if (localStorage.getItem(`page_generated_${fileName}`)) return;

    const subjectPdfs = pdfData.filter(pdf => pdf.category === categoryName);
    const html = `<!DOCTYPE html>...`; // (keep your original generateSubjectPage HTML string)
    localStorage.setItem(`subject_page_${fileName}`, html);
    localStorage.setItem(`page_generated_${fileName}`, 'true');
    console.log(`Generated ${fileName}. Copy from localStorage.`);
}

// Cleanup
window.addEventListener('beforeunload', () => animationFrameId && cancelAnimationFrame(animationFrameId));

// Ripple CSS
document.head.insertAdjacentHTML('beforeend', `<style>
    @keyframes ripple { to { transform: scale(4); opacity: 0; } }
    @keyframes fadeOut { to { opacity: 0; transform: translateY(20px); } }
    .pdf-viewer-iframe { width: 100%; height: 100%; border: none; }
    .btn-download-modal { background: #FF1493; color: white; padding: 0.5rem 1rem; border-radius: 8px; text-decoration: none; }
</style>`);