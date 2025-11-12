/**
 * PDF Library - Simplified with Native PDF Viewer
 * Uses browser's built-in <iframe> PDF viewer
 */

let subjectsGrid, searchResults, noResults, searchInput, clearSearchBtn;
let pdfModal, pdfViewer, closeModalBtn, downloadBtn, loadingSkeleton, particlesContainer;
let isSearching = false;
let animationFrameId;
let particles = [];

// Subject icons and colors
const subjectInfo = {
    "Math": { icon: "📐", color: "#00CEDA" },
    "Physics": { icon: "⚛️", color: "#FF1493" },
    "Chemistry": { icon: "🧪", color: "#FFD700" },
    "Biology": { icon: "🧬", color: "#00CEDA" },
    "Computer Science": { icon: "💻", color: "#FF1493" }
};

document.addEventListener('DOMContentLoaded', () => {
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

    // Initialize features
    initializeParticles();
    initializeEnhancedEffects();

    if (subjectsGrid) {
        initializeMainPage();
    } else {
        initializeSubjectPage();
    }

    setupEventListeners();
});

function initializeMainPage() {
    loadingSkeleton.style.display = 'flex';
    setTimeout(() => {
        renderSubjectsGrid();
        loadingSkeleton.style.opacity = '0';
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
    a.className = 'subject-button';
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
    addSubjectButtonEffects(a);
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
    pdfs.forEach((pdf, i) => {
        setTimeout(() => container.appendChild(createPdfCard(pdf)), i * 100);
    });
}

function createPdfCard(pdf) {
    const card = document.createElement('div');
    card.className = 'pdf-card';
    const info = subjectInfo[pdf.category] || { icon: "Book", color: "#6b7280" };
    card.innerHTML = `
        <div class="pdf-thumbnail"><div class="pdf-thumbnail-icon">${info.icon}</div></div>
        <div class="pdf-card-content">
            <div class="pdf-card-title">${pdf.title}</div>
            ${pdf.description ? `<div class="pdf-card-description">${pdf.description}</div>` : ''}
            <div class="pdf-card-actions">
                <button class="btn-view-card" data-path="${pdf.path}" data-filename="${pdf.filename}">View</button>
                <a href="${pdf.path}" download="${pdf.filename}" class="btn-download-card">Download</a>
            </div>
        </div>
    `;
    card.querySelector('.btn-view-card').addEventListener('click', (e) => {
        openPdfModal(e.target.dataset.path, e.target.dataset.filename);
    });
    card.addEventListener('mouseenter', () => card.style.transform = 'translateY(-8px)');
    card.addEventListener('mouseleave', () => card.style.transform = 'translateY(0)');
    return card;
}

// === Native PDF Modal ===
function openPdfModal(pdfPath, filename) {
    pdfModal.classList.add('active');
    pdfViewer.src = pdfPath;
    downloadBtn.href = pdfPath;
    downloadBtn.download = filename || 'document.pdf';
    setTimeout(() => {
        pdfModal.style.opacity = '1';
        pdfModal.querySelector('.modal-content').style.animation = 'slideUpScale 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)';
    }, 10);
    document.body.style.overflow = 'hidden';
}

function closePdfModal() {
    pdfModal.querySelector('.modal-content').style.animation = 'fadeOut 0.3s ease-out both';
    setTimeout(() => {
        pdfModal.classList.remove('active');
        pdfModal.style.opacity = '0';
        pdfViewer.src = '';
        document.body.style.overflow = '';
    }, 300);
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
    item.className = 'pdf-item';
    item.innerHTML = `
        <div class="pdf-info">
            <div class="pdf-title">${pdf.title}</div>
            ${pdf.description ? `<div class="pdf-description">${pdf.description}</div>` : ''}
        </div>
        <div class="pdf-actions">
            <button class="btn-view" data-path="${pdf.path}" data-filename="${pdf.filename}">View</button>
            <a href="${pdf.path}" download="${pdf.filename}" class="btn-download">Download</a>
        </div>
    `;
    item.querySelector('.btn-view').addEventListener('click', (e) => {
        openPdfModal(e.target.dataset.path, e.target.dataset.filename);
    });
    item.addEventListener('mouseenter', () => item.style.transform = 'translateX(8px)');
    item.addEventListener('mouseleave', () => item.style.transform = 'translateX(0)');
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
        timeout = setTimeout(handleSearch, 300);
    });

    clearSearchBtn?.addEventListener('click', () => {
        clearSearchBtn.style.transform = 'translateY(-50%) rotate(180deg)';
        clearSearchResults();
        setTimeout(() => clearSearchBtn.style.transform = 'translateY(-50%) rotate(0deg)', 300);
    });

    closeModalBtn?.addEventListener('click', closePdfModal);
    pdfModal?.addEventListener('click', e => e.target === pdfModal && closePdfModal());

    document.addEventListener('keydown', e => {
        if (pdfModal.classList.contains('active') && e.key === 'Escape') closePdfModal();
    });
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