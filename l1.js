// Utility function for toast notifications
function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    toast.setAttribute('aria-live', 'assertive');
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

// Real-time clock update
const hotline = document.querySelector('.right-info');
const timeSpan = document.createElement('span');

function updateTime() {
    const now = new Date();
    timeSpan.textContent = ` | Giờ hiện tại: ${now.toLocaleTimeString('vi-VN')}`;
    timeSpan.setAttribute('aria-live', 'polite');
}

if (hotline) {
    hotline.appendChild(timeSpan);
    updateTime();
    const timeInterval = setInterval(updateTime, 1000);
    window.addEventListener('unload', () => clearInterval(timeInterval));
} else {
    console.error('Hotline element not found.');
    showToast('Lỗi: Không thể hiển thị giờ hiện tại.');
}

// Mobile menu toggle
const navToggle = document.getElementById('navToggle');
const navList = document.getElementById('navList');

if (navToggle && navList) {
    navToggle.addEventListener('click', () => {
        navList.classList.toggle('show');
        navToggle.setAttribute('aria-expanded', navList.classList.contains('show'));
        if (navList.classList.contains('show')) {
            navList.querySelector('a').focus();
        }
    });
    navToggle.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            navList.classList.toggle('show');
            navToggle.setAttribute('aria-expanded', navList.classList.contains('show'));
            if (navList.classList.contains('show')) {
                navList.querySelector('a').focus();
            }
        }
    });
} else {
    console.error('Navigation elements not found.');
    showToast('Lỗi: Không thể khởi tạo menu điều hướng.');
}

// Charge time calculator
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('chargeCalculator');
    const chargeResult = document.getElementById('chargeResult');
    const resultText = document.getElementById('resultText');

    if (form && chargeResult && resultText) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const device = document.getElementById('deviceType').value;
            const current = parseInt(document.getElementById('currentBattery').value);
            const watt = parseInt(document.getElementById('chargerWatt').value);

            if (!device) {
                resultText.textContent = 'Vui lòng chọn thiết bị.';
                chargeResult.style.display = 'block';
                showToast('Lỗi: Chưa chọn thiết bị.');
                return;
            }
            if (isNaN(current) || current < 0 || current > 100) {
                resultText.textContent = 'Mức pin phải từ 0% đến 100%.';
                chargeResult.style.display = 'block';
                showToast('Lỗi: Mức pin không hợp lệ.');
                return;
            }
            if (isNaN(watt) || watt <= 0) {
                resultText.textContent = 'Vui lòng chọn loại sạc hợp lệ.';
                chargeResult.style.display = 'block';
                showToast('Lỗi: Công suất sạc không hợp lệ.');
                return;
            }

            const batteryMap = {
                iphone15: 3349,
                iphone14: 3279,
                iphone13: 3227,
                'samsung-s24': 4000,
                'samsung-s23': 3900,
                xiaomi14: 4610,
                'oppo-find': 5000
            };

            const batterySize = batteryMap[device] || 4000;
            const remaining = 100 - current;
            const energyNeeded = (batterySize * remaining / 100) / 1000; // kWh
            const timeHours = energyNeeded / (watt * 0.8); // 80% efficiency
            const hours = Math.floor(timeHours);
            const minutes = Math.round((timeHours - hours) * 60);

            resultText.innerHTML = `
                <strong>${current}% → 100%:</strong> ${hours}h ${minutes}p<br>
                <small>Sử dụng sạc ${watt}W (hiệu dụng ${Math.round(watt * 0.8)}W)</small>
            `;
            chargeResult.style.display = 'block';
            chargeResult.setAttribute('aria-live', 'polite');
        });
    } else {
        console.error('Charging calculator elements not found.');
        showToast('Lỗi: Không thể khởi tạo công cụ tính thời gian sạc.');
    }
});

// Smooth scrolling
function smoothScrollTo(targetId) {
    const target = document.querySelector(targetId);
    if (target) {
        window.scrollTo({
            top: target.offsetTop - 80,
            behavior: 'smooth'
        });
    } else {
        console.error(`Target section ${targetId} not found.`);
        showToast('Lỗi: Không tìm thấy mục tiêu cuộn.');
    }
}

document.querySelectorAll('.category-item, .nav-list a').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = link.getAttribute('href');
        smoothScrollTo(targetId);
    });
    link.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            const targetId = link.getAttribute('href');
            smoothScrollTo(targetId);
        }
    });
});

// Cart management
let cart = [];
try {
    cart = JSON.parse(localStorage.getItem('cart')) || [];
} catch (e) {
    console.error('Lỗi khi đọc localStorage:', e);
    showToast('Không thể truy cập giỏ hàng. Vui lòng kiểm tra cài đặt trình duyệt.');
}

function updateCartUI() {
    const cartCount = document.getElementById('cartCount');
    const cartTotal = document.getElementById('cartTotal');
    if (cartCount && cartTotal) {
        const count = cart.reduce((sum, item) => sum + item.quantity, 0);
        const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
        cartCount.textContent = count;
        cartTotal.textContent = total.toLocaleString('vi-VN') + '₫';
    } else {
        console.error('Cart UI elements not found.');
        showToast('Lỗi: Không thể cập nhật giỏ hàng.');
    }
}

document.querySelectorAll('.product-card .add-cart').forEach(button => {
    button.addEventListener('click', () => {
        const card = button.closest('.product-card');
        if (!card) return;
        const name = card.querySelector('h3')?.textContent;
        const priceText = card.querySelector('.new')?.textContent.replace(/[^\d]/g, '');
        const price = parseInt(priceText);
        const img = card.querySelector('img')?.src;

        if (!name || isNaN(price) || !img) {
            showToast('Lỗi: Không thể thêm sản phẩm vào giỏ hàng.');
            return;
        }

        const exist = cart.find(item => item.name === name);
        if (exist) {
            exist.quantity++;
        } else {
            cart.push({ name, price, img, quantity: 1 });
        }

        try {
            localStorage.setItem('cart', JSON.stringify(cart));
        } catch (e) {
            console.error('Lỗi khi lưu vào localStorage:', e);
            showToast('Không thể lưu giỏ hàng. Vui lòng kiểm tra cài đặt trình duyệt.');
        }

        updateCartUI();
        showToast(`${name} đã được thêm vào giỏ hàng!`);
    });

    button.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            button.click();
        }
    });
});

// Favorites management
let favorites = [];
try {
    favorites = JSON.parse(localStorage.getItem('favorites')) || [];
} catch (e) {
    console.error('Lỗi khi đọc localStorage:', e);
    showToast('Không thể truy cập danh sách yêu thích.');
}

function updateFavorites() {
    const favCount = document.getElementById('favCount');
    if (favCount) {
        favCount.textContent = `(${favorites.length})`;
        localStorage.setItem('favorites', JSON.stringify(favorites));
    } else {
        console.error('Favorites count element not found.');
    }
}

document.getElementById('favoriteBtn')?.addEventListener('click', () => {
    showToast('Chuyển đến danh sách yêu thích');
    // TODO: Implement navigation to favorites page
});

// Product sorting
document.querySelectorAll('.products').forEach(section => {
    const sortSelect = section.querySelector('.product-filter select');
    const productGrid = section.querySelector('.product-grid');

    if (sortSelect && productGrid) {
        sortSelect.addEventListener('change', () => {
            const sortValue = sortSelect.value;
            const products = Array.from(productGrid.querySelectorAll('.product-card'));

            products.sort((a, b) => {
                const priceA = parseInt(a.dataset.price) || 0;
                const priceB = parseInt(b.dataset.price) || 0;
                const popA = parseInt(a.dataset.popularity) || 0;
                const popB = parseInt(b.dataset.popularity) || 0;

                if (sortValue === 'priceAsc') {
                    return priceA - priceB;
                } else if (sortValue === 'priceDesc') {
                    return priceB - priceA;
                } else if (sortValue === 'popular') {
                    return popB - popA;
                }
                return 0;
            });

            productGrid.innerHTML = '';
            products.forEach(product => productGrid.appendChild(product));
        });
    } else {
        console.error('Product sorting elements not found.');
        showToast('Lỗi: Không thể sắp xếp sản phẩm.');
    }
});

// Fade-in animations
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (!prefersReducedMotion) {
    const featureCards = document.querySelectorAll('.feature-card');
    const brandLogos = document.querySelectorAll('.brand-logos img');

    const checkFadeIn = debounce(() => {
        featureCards.forEach(card => {
            const rect = card.getBoundingClientRect();
            if (rect.top < window.innerHeight - 100 && !card.classList.contains('show')) {
                card.classList.add('show');
            }
        });
        brandLogos.forEach(logo => {
            const rect = logo.getBoundingClientRect();
            if (rect.top < window.innerHeight - 50 && !logo.classList.contains('show')) {
                logo.classList.add('show');
            }
        });
    }, 100);

    window.addEventListener('scroll', checkFadeIn);
}

/* Wheel of Fortune (Commented out due to missing HTML elements)
const spinBtn = document.getElementById('spinBtn');
const wheelInner = document.getElementById('wheelInner');
const wheelResultBox = document.getElementById('wheelResultBox');
const voucherResult = document.getElementById('voucherResult');
const prizes = ['-10%', '-15%', '-20%', 'FREESHIP', '-5%', '-50K'];
let isSpinning = false;

if (spinBtn && wheelInner && wheelResultBox && voucherResult) {
    spinBtn.addEventListener('click', () => {
        if (isSpinning) return;
        isSpinning = true;
        spinBtn.disabled = true;
        spinBtn.setAttribute('aria-disabled', 'true');
        showToast('Đang quay...');

        const randomIndex = Math.floor(Math.random() * prizes.length);
        const fullSpins = 5 + Math.floor(Math.random() * 5); // 5–10 full spins
        const degree = 360 * fullSpins + randomIndex * 60;

        wheelInner.style.transition = 'transform 4s ease-out';
        wheelInner.style.transform = `rotate(${degree}deg)`;

        setTimeout(() => {
            wheelResultBox.style.display = 'block';
            voucherResult.textContent = `Chúc mừng! Bạn nhận được ${prizes[randomIndex]}!`;
            voucherResult.setAttribute('aria-live', 'polite');
            isSpinning = false;
            spinBtn.disabled = false;
            spinBtn.setAttribute('aria-disabled', 'false');

            // Reset wheel rotation for next spin
            setTimeout(() => {
                wheelInner.style.transition = 'none';
                wheelInner.style.transform = `rotate(${randomIndex * 60}deg)`;
            }, 1000);
        }, 4000);
    });

    spinBtn.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            spinBtn.click();
        }
    });
} else {
    console.error('Wheel of Fortune elements not found.');
    showToast('Lỗi: Không thể khởi tạo vòng quay may mắn.');
}
*/

// Search functionality
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');

if (searchBtn && searchInput) {
    searchBtn.addEventListener('click', () => {
        const query = searchInput.value.trim().toLowerCase();
        if (query) {
            const products = document.querySelectorAll('.product-card');
            products.forEach(product => {
                const name = product.querySelector('h3').textContent.toLowerCase();
                product.style.display = name.includes(query) ? 'block' : 'none';
            });
            showToast(`Tìm kiếm: ${query}`);
        } else {
            showToast('Vui lòng nhập từ khóa tìm kiếm');
        }
    });

    searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            searchBtn.click();
        }
    });
} else {
    console.error('Search elements not found.');
    showToast('Lỗi: Không thể khởi tạo chức năng tìm kiếm.');
}

// FAQ accordion
document.querySelectorAll('.faq-item').forEach(item => {
    item.addEventListener('click', () => {
        item.classList.toggle('active');
        const answer = item.querySelector('.faq-answer');
        answer.style.display = item.classList.contains('active') ? 'block' : 'none';
    });
});

// Contact form submission
document.querySelector('.contact-form')?.addEventListener('submit', e => {
    e.preventDefault();
    const name = e.target.querySelector('input[placeholder="Họ và tên"]')?.value.trim();
    const email = e.target.querySelector('input[placeholder="Email"]')?.value.trim();
    const message = e.target.querySelector('textarea')?.value.trim();
    let valid = true;

    if (!name) {
        e.target.querySelector('#nameError')?.classList.add('active');
        valid = false;
    } else {
        e.target.querySelector('#nameError')?.classList.remove('active');
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        e.target.querySelector('#emailError')?.classList.add('active');
        valid = false;
    } else {
        e.target.querySelector('#emailError')?.classList.remove('active');
    }

    if (!message) {
        e.target.querySelector('#messageError')?.classList.add('active');
        valid = false;
    } else {
        e.target.querySelector('#messageError')?.classList.remove('active');
    }

    if (valid) {
        showToast('Cảm ơn bạn đã liên hệ! Chúng tôi sẽ phản hồi sớm.');
        e.target.reset();
    } else {
        showToast('Vui lòng điền đầy đủ thông tin.');
    }
});

// CSKH Messenger
const cskhBtn = document.getElementById('cskhBtn');
const chatBox = document.getElementById('chatBox');
const closeChat = document.getElementById('closeChat');

if (cskhBtn && chatBox && closeChat) {
    cskhBtn.addEventListener('click', () => {
        chatBox.style.display = 'flex';
    });

    closeChat.addEventListener('click', () => {
        chatBox.style.display = 'none';
    });
} else {
    console.error('CSKH Messenger elements not found.');
    showToast('Lỗi: Không thể khởi tạo CSKH Messenger.');
}

// Bubble game
document.addEventListener('DOMContentLoaded', () => {
    const startBtn = document.getElementById('startBubbleGame');
    const bubbleArea = document.getElementById('bubbleArea');
    const resultBox = document.getElementById('bubbleResultBox');
    const resultText = document.getElementById('bubbleResultText');
    const timeLeftEl = document.getElementById('timeLeft');
    const scoreEl = document.getElementById('score');

    const vouchers = ['-5%', '-10%', 'FREESHIP', '-15%', '-20%', '-50K'];
    let playing = false;
    let score = 0;
    let timeLeft = 15;

    if (startBtn && bubbleArea && resultBox && resultText && timeLeftEl && scoreEl) {
        startBtn.addEventListener('click', () => {
            if (playing) return;
            playing = true;
            score = 0;
            timeLeft = 15;
            scoreEl.textContent = score;
            timeLeftEl.textContent = timeLeft;

            resultBox.style.display = 'none';
            bubbleArea.innerHTML = '';

            const gameDuration = 15000;
            const spawnInterval = 800;

            // Countdown timer
            const timer = setInterval(() => {
                timeLeft--;
                timeLeftEl.textContent = timeLeft;
                if (timeLeft <= 0) clearInterval(timer);
            }, 1000);

            // Spawn bubbles
            const spawn = setInterval(() => {
                const bubble = document.createElement('div');
                bubble.classList.add('bubble');
                bubble.textContent = '🎈';
                bubble.style.left = Math.random() * (bubbleArea.offsetWidth - 60) + 'px';
                bubble.style.animationDuration = 3 + Math.random() * 2 + 's';

                bubble.addEventListener('click', () => {
                    const reward = vouchers[Math.floor(Math.random() * vouchers.length)];
                    score++;
                    scoreEl.textContent = score;
                    bubble.remove();
                    resultText.textContent = `Bạn vừa nhận voucher ${reward} 🎉 (Tổng: ${score})`;
                    resultBox.style.display = 'block';
                });

                bubbleArea.appendChild(bubble);

                setTimeout(() => bubble.remove(), 5000);
            }, spawnInterval);

            setTimeout(() => {
                clearInterval(spawn);
                clearInterval(timer);
                playing = false;
                bubbleArea.innerHTML = '';
                resultText.textContent += ` — Trò chơi kết thúc!`;
            }, gameDuration);
        });
    } else {
        console.error('Bubble game elements not found.');
        showToast('Lỗi: Không thể khởi tạo trò chơi bong bóng.');
    }
});

// Initialize UI
updateCartUI();
updateFavorites();
