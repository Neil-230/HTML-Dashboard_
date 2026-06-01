/**
 * Cohesive Premium Dashboard JS Interactions System
 * Built for Antigravity's Advanced Premium Dashboard Design
 */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize Global UI Logic
    initTheme();
    initMobileNav();
    initActiveLinks();
    initTopBarSearch();
    initStatCounters();
    initCustomDropdowns();
    
    // 2. Initialize Page-Specific Logic
    const canvasEl = document.getElementById('salesChart');
    if (canvasEl) {
        initSalesChart(canvasEl);
    }
    
    // 3. Page Interaction Listeners
    initProductPageActions();
    initAccountPageActions();
    initSettingsPageActions();
    initLogoutTimer();
});

/* ==========================================================================
   Global Theme Logic (Dark / Light Mode)
   ========================================================================== */
function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
    
    // Update theme toggle checkboxes/selects if they exist on the page
    const darkToggle = document.getElementById('darkModeToggle');
    const themeSelect = document.getElementById('themeSelect');
    
    if (darkToggle) {
        darkToggle.checked = savedTheme === 'dark';
        darkToggle.addEventListener('change', (e) => {
            const newTheme = e.target.checked ? 'dark' : 'light';
            setTheme(newTheme);
        });
    }
    
    if (themeSelect) {
        themeSelect.value = savedTheme;
        themeSelect.addEventListener('change', (e) => {
            setTheme(e.target.value);
        });
    }
}

function setTheme(theme) {
    if (theme === 'system') {
        const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        theme = systemDark ? 'dark' : 'light';
    }
    
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    
    // Sync UI components
    const darkToggle = document.getElementById('darkModeToggle');
    if (darkToggle) {
        darkToggle.checked = theme === 'dark';
    }
    
    // Redraw charts if on page
    const canvasEl = document.getElementById('salesChart');
    if (canvasEl) {
        initSalesChart(canvasEl);
    }
}

/* ==========================================================================
   Mobile Sidebar Navigation Toggle
   ========================================================================== */
function initMobileNav() {
    const sidebar = document.querySelector('.sidebar');
    const toggleBtn = document.querySelector('.mobile-toggle');
    
    if (!toggleBtn || !sidebar) return;
    
    // Create modern dark blur overlay if it doesn't exist
    let overlay = document.querySelector('.sidebar-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.className = 'sidebar-overlay';
        document.body.appendChild(overlay);
    }
    
    toggleBtn.addEventListener('click', () => {
        sidebar.classList.toggle('active');
        overlay.classList.toggle('active');
    });
    
    overlay.addEventListener('click', () => {
        sidebar.classList.remove('active');
        overlay.classList.remove('active');
    });
}

/* ==========================================================================
   Active Link Navigation Styling
   ========================================================================== */
function initActiveLinks() {
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href && (href.toLowerCase() === currentPath.toLowerCase() || 
            (currentPath.toLowerCase() === 'index.html' && href.toLowerCase() === 'index.html'))) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

/* ==========================================================================
   Interactive Stats counter Animations
   ========================================================================== */
function initStatCounters() {
    const counters = document.querySelectorAll('.stat-number');
    
    const countUp = (counter) => {
        const targetText = counter.innerText.replace(/[^0-9.]/g, '');
        const target = parseFloat(targetText);
        const prefix = counter.innerText.includes('₱') ? '₱' : counter.innerText.includes('$') ? '$' : '';
        const suffix = counter.innerText.includes('%') ? '%' : counter.innerText.includes('+') ? '+' : '';
        
        let start = 0;
        const duration = 1200; // ms
        const stepTime = 15;
        const totalSteps = duration / stepTime;
        const increment = target / totalSteps;
        
        const timer = setInterval(() => {
            start += increment;
            if (start >= target) {
                clearInterval(timer);
                counter.innerText = prefix + formatNumber(target) + suffix;
            } else {
                counter.innerText = prefix + formatNumber(Math.floor(start)) + suffix;
            }
        }, stepTime);
    };
    
    // Intersection Observer to trigger counter on view
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                countUp(entry.target);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });
    
    counters.forEach(counter => observer.observe(counter));
}

function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

/* ==========================================================================
   Generic Real-time Client-Side Search
   ========================================================================== */
function initTopBarSearch() {
    const searchInputs = document.querySelectorAll('.search-bar input, .search-input input');
    
    searchInputs.forEach(input => {
        input.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase().trim();
            
            // Search across items based on active page content
            // 1. Search products grid
            const productCards = document.querySelectorAll('.product-card');
            if (productCards.length > 0) {
                productCards.forEach(card => {
                    const title = card.querySelector('.product-title')?.innerText.toLowerCase() || '';
                    const desc = card.querySelector('.product-desc')?.innerText.toLowerCase() || '';
                    const cat = card.querySelector('.product-category')?.innerText.toLowerCase() || '';
                    
                    if (title.includes(query) || desc.includes(query) || cat.includes(query)) {
                        card.style.display = '';
                        card.classList.add('animate-fade-in');
                    } else {
                        card.style.display = 'none';
                    }
                });
            }
            
            // 2. Search Accounts grid
            const accountCards = document.querySelectorAll('.account-card');
            if (accountCards.length > 0) {
                accountCards.forEach(card => {
                    const name = card.querySelector('.account-name')?.innerText.toLowerCase() || '';
                    const email = card.querySelector('.account-email')?.innerText.toLowerCase() || '';
                    const badge = card.querySelector('.account-role-badge')?.innerText.toLowerCase() || '';
                    
                    if (name.includes(query) || email.includes(query) || badge.includes(query)) {
                        card.style.display = '';
                    } else {
                        card.style.display = 'none';
                    }
                });
            }
            
            // 3. Search Table Rows (Reports page)
            const tableRows = document.querySelectorAll('table tbody tr');
            if (tableRows.length > 0) {
                tableRows.forEach(row => {
                    const text = row.innerText.toLowerCase();
                    if (text.includes(query)) {
                        row.style.display = '';
                    } else {
                        row.style.display = 'none';
                    }
                });
            }
        });
    });
}

/* ==========================================================================
   Premium Custom Dynamic Canvas Reports Chart
   ========================================================================== */
function initSalesChart(canvas) {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Responsive Canvas dimensions
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    canvas.width = width;
    canvas.height = height;
    
    // Get colors based on theme
    const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
    const gridColor = isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)';
    const textColor = isDark ? '#9ca3af' : '#6b7280';
    const primaryAccent = isDark ? '#00f2fe' : '#8b5cf6';
    const secondaryAccent = isDark ? '#8b5cf6' : '#06b6d4';
    
    // Custom Chart Data
    const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const salesData = [12000, 18500, 15000, 24000, 21000, 29000, 24780];
    const orderData = [5000, 9000, 7500, 11000, 9800, 15000, 12450];
    
    // Draw Grid & Labels
    const padding = 50;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;
    
    const maxVal = 35000;
    const gridLines = 5;
    
    ctx.font = '500 11px sans-serif';
    ctx.fillStyle = textColor;
    ctx.textAlign = 'right';
    
    // Y-Axis Gridlines
    for (let i = 0; i <= gridLines; i++) {
        const y = padding + (chartHeight / gridLines) * i;
        const value = Math.round(maxVal - (maxVal / gridLines) * i);
        
        ctx.fillText('₱' + formatNumber(value), padding - 10, y + 4);
        
        ctx.beginPath();
        ctx.moveTo(padding, y);
        ctx.lineTo(width - padding, y);
        ctx.strokeStyle = gridColor;
        ctx.lineWidth = 1;
        ctx.stroke();
    }
    
    // X-Axis Labels
    ctx.textAlign = 'center';
    const stepX = chartWidth / (labels.length - 1);
    for (let i = 0; i < labels.length; i++) {
        const x = padding + stepX * i;
        ctx.fillText(labels[i], x, height - padding + 20);
    }
    
    // Draw Line helper
    const drawLine = (data, strokeColor, gradientStart, gradientEnd) => {
        ctx.beginPath();
        for (let i = 0; i < data.length; i++) {
            const x = padding + stepX * i;
            const y = padding + chartHeight - (data[i] / maxVal) * chartHeight;
            
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = 4;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.shadowColor = strokeColor;
        ctx.shadowBlur = 10;
        ctx.stroke();
        ctx.shadowBlur = 0; // reset
        
        // Gradient fill below line
        const fillGrad = ctx.createLinearGradient(0, padding, 0, padding + chartHeight);
        fillGrad.addColorStop(0, gradientStart);
        fillGrad.addColorStop(1, gradientEnd);
        
        ctx.beginPath();
        ctx.moveTo(padding, padding + chartHeight);
        for (let i = 0; i < data.length; i++) {
            const x = padding + stepX * i;
            const y = padding + chartHeight - (data[i] / maxVal) * chartHeight;
            ctx.lineTo(x, y);
        }
        ctx.lineTo(padding + chartWidth, padding + chartHeight);
        ctx.closePath();
        ctx.fillStyle = fillGrad;
        ctx.fill();
        
        // Draw Points
        for (let i = 0; i < data.length; i++) {
            const x = padding + stepX * i;
            const y = padding + chartHeight - (data[i] / maxVal) * chartHeight;
            
            ctx.beginPath();
            ctx.arc(x, y, 5, 0, Math.PI * 2);
            ctx.fillStyle = isDark ? '#111827' : '#ffffff';
            ctx.strokeStyle = strokeColor;
            ctx.lineWidth = 3;
            ctx.fill();
            ctx.stroke();
        }
    };
    
    // Draw both data sets
    drawLine(salesData, primaryAccent, 'rgba(0, 242, 254, 0.25)', 'rgba(0, 242, 254, 0.0)');
    drawLine(orderData, secondaryAccent, 'rgba(139, 92, 246, 0.2)', 'rgba(139, 92, 246, 0.0)');
}

/* ==========================================================================
   Product Page Interactive Logic
   ========================================================================== */
function initProductPageActions() {
    const productForm = document.getElementById('productForm');
    const catalog = document.querySelector('.products-catalog');
    
    if (productForm && catalog) {
        productForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Extract values
            const name = document.getElementById('productName').value;
            const cat = document.getElementById('productCategory').value;
            const price = parseFloat(document.getElementById('productPrice').value);
            const stock = parseInt(document.getElementById('productStock').value);
            const desc = document.getElementById('productDescription').value;
            
            // Create highly modern new Card element
            const newCard = document.createElement('div');
            newCard.className = 'product-card animate-fade-in';
            
            const stockClass = stock > 10 ? 'in-stock' : stock > 0 ? 'low-stock' : 'out-stock';
            const stockText = stock > 10 ? `In Stock (${stock})` : stock > 0 ? `Low Stock (${stock})` : 'Out of Stock';
            
            newCard.innerHTML = `
                <div class="product-admin-overlay">
                    <div class="btn-icon-sm edit-btn"><i class="fas fa-edit"></i></div>
                    <div class="btn-icon-sm delete-btn delete"><i class="fas fa-trash-alt"></i></div>
                </div>
                <div class="product-badge">${cat.toUpperCase()}</div>
                <div class="product-img-wrapper">
                    <img src="https://images.unsplash.com/photo-1542751371-adc38448a05e?w=500&auto=format&fit=crop" alt="${name}">
                </div>
                <div class="product-details">
                    <span class="product-category">${cat}</span>
                    <h5 class="product-title">${name}</h5>
                    <p class="product-desc">${desc || 'No description provided.'}</p>
                    <div class="product-meta-row">
                        <div class="product-price-box">
                            <span class="product-price">₱${formatNumber(price)}</span>
                        </div>
                        <span class="product-stock ${stockClass}">
                            <i class="fas ${stock > 0 ? 'fa-check-circle' : 'fa-times-circle'}"></i> ${stockText}
                        </span>
                    </div>
                </div>
            `;
            
            // Insert at front
            catalog.insertBefore(newCard, catalog.firstChild);
            
            // Clean up
            productForm.reset();
            
            // Bind actions to new card elements
            bindDeleteAction(newCard.querySelector('.delete-btn'));
            showNotification('Product successfully added!', 'success');
        });
    }
    
    // Bind all existing product cards
    document.querySelectorAll('.product-card .delete-btn').forEach(btn => bindDeleteAction(btn));
}

/* ==========================================================================
   Account Page Interactive Logic
   ========================================================================== */
function initAccountPageActions() {
    const accountForm = document.querySelector('form');
    const accountsGrid = document.querySelector('.accounts-grid');
    
    // Check if on accounts page
    if (accountForm && accountsGrid) {
        accountForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const username = document.getElementById('username').value;
            const email = document.getElementById('email').value;
            const role = document.getElementById('role').value;
            
            const newCard = document.createElement('div');
            newCard.className = 'account-card animate-fade-in';
            
            const badgeBg = role === 'Admin' ? 'bg-primary' : role === 'Special' ? 'bg-warning text-dark' : 'bg-success';
            
            newCard.innerHTML = `
                <div class="account-avatar-wrapper">
                    <img src="Images/hacker.png" alt="${username}">
                    <span class="account-role-badge ${badgeBg}">${role}</span>
                </div>
                <h5 class="account-name">${username}</h5>
                <p class="account-email">${email}</p>
                <div class="account-actions">
                    <button class="btn btn-sm btn-outline-primary"><i class="fas fa-edit me-1"></i>Edit</button>
                    <button class="btn btn-sm btn-outline-danger delete-btn"><i class="fas fa-trash me-1"></i>Delete</button>
                </div>
            `;
            
            accountsGrid.insertBefore(newCard, accountsGrid.firstChild);
            accountForm.reset();
            
            bindDeleteAction(newCard.querySelector('.delete-btn'));
            showNotification('Account successfully created!', 'success');
        });
    }
    
    document.querySelectorAll('.account-card .delete-btn, .btn-outline-danger').forEach(btn => {
        if (btn.innerText.includes('Delete') || btn.classList.contains('delete-btn')) {
            bindDeleteAction(btn);
        }
    });
}

function bindDeleteAction(btn) {
    btn.addEventListener('click', (e) => {
        const item = e.target.closest('.product-card') || e.target.closest('.account-card') || e.target.closest('tr');
        if (!item) return;
        
        if (confirm('Are you sure you want to permanently delete this item?')) {
            // Cool premium exit animation
            item.style.transition = 'all 0.4s cubic-bezier(0.6, -0.28, 0.735, 0.045)';
            item.style.transform = 'scale(0.8) translateY(-30px)';
            item.style.opacity = '0';
            
            setTimeout(() => {
                item.remove();
                showNotification('Item successfully deleted', 'info');
            }, 400);
        }
    });
}

/* ==========================================================================
   Settings Page Live Update Logic
   ========================================================================== */
function initSettingsPageActions() {
    const resetBtn = document.querySelector('button.btn-outline-secondary');
    const saveBtn = document.querySelector('button.btn-primary');
    
    // Check if on settings page
    if (resetBtn && saveBtn && document.location.pathname.includes('Settings')) {
        saveBtn.addEventListener('click', () => {
            const email = document.getElementById('email').value;
            showNotification(`Changes saved! Primary email updated to: ${email}`, 'success');
        });
        
        resetBtn.addEventListener('click', () => {
            if (confirm('Are you sure you want to restore default settings?')) {
                setTheme('dark');
                document.getElementById('email').value = 'neil@example.com';
                const darkToggle = document.getElementById('darkModeToggle');
                if (darkToggle) darkToggle.checked = true;
                showNotification('Settings restored to defaults', 'info');
            }
        });
    }
}

/* ==========================================================================
   Premium Custom Dynamic Dropdown Menu support
   ========================================================================== */
function initCustomDropdowns() {
    const dropdownToggle = document.querySelector('.user-menu .dropdown-toggle');
    const dropdownMenu = document.querySelector('.user-menu .dropdown-menu');
    
    if (dropdownToggle && dropdownMenu) {
        dropdownToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            dropdownMenu.classList.toggle('show');
        });
        
        document.addEventListener('click', () => {
            dropdownMenu.classList.remove('show');
        });
    }
}

/* ==========================================================================
   Beautiful Custom Notifications Toast system
   ========================================================================== */
function showNotification(message, type = 'success') {
    // Check if container exists
    let container = document.querySelector('.toast-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'toast-container';
        
        // Add styling for container if not already in dashboard.css
        Object.assign(container.style, {
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            zIndex: '9999',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            pointerEvents: 'none'
        });
        document.body.appendChild(container);
    }
    
    // Create Toast element
    const toast = document.createElement('div');
    const borderAccent = type === 'success' ? '#10b981' : type === 'danger' ? '#ef4444' : '#3b82f6';
    const icon = type === 'success' ? 'fa-check-circle' : type === 'danger' ? 'fa-exclamation-triangle' : 'fa-info-circle';
    
    Object.assign(toast.style, {
        background: 'rgba(17, 24, 39, 0.95)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderLeft: `5px solid ${borderAccent}`,
        borderRadius: '12px',
        padding: '1rem 1.5rem',
        color: '#fff',
        display: 'flex',
        align-items: 'center',
        gap: '12px',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.25)',
        transform: 'translateX(50px) scale(0.95)',
        opacity: '0',
        transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        pointerEvents: 'auto',
        minWidth: '280px',
        maxWidth: '400px'
    });
    
    toast.innerHTML = `
        <i class="fas ${icon}" style="color: ${borderAccent}; font-size: 1.2rem;"></i>
        <div style="font-size: 0.9rem; font-weight: 500; flex: 1;">${message}</div>
    `;
    
    container.appendChild(toast);
    
    // Trigger entrance
    setTimeout(() => {
        toast.style.transform = 'translateX(0) scale(1)';
        toast.style.opacity = '1';
    }, 50);
    
    // Trigger Exit
    setTimeout(() => {
        toast.style.transform = 'translateY(-20px) scale(0.9)';
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 400);
    }, 3500);
}

/* ==========================================================================
   Logout Portal automatic timer logic
   ========================================================================== */
function initLogoutTimer() {
    const countdownEl = document.getElementById('logoutCountdown');
    if (countdownEl) {
        let count = 5;
        const timer = setInterval(() => {
            count--;
            countdownEl.innerText = count;
            if (count <= 0) {
                clearInterval(timer);
                // Redirect back to Index.html (mock portal log in again)
                window.location.href = 'Index.html';
            }
        }, 1000);
    }
}
