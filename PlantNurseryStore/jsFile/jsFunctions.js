document.addEventListener('DOMContentLoaded', () => {
    initNav();
    initCart();
    initShopFilters();
    initAccordion();
    initForms();
    initPasswordToggle();
    initQtySelector();
    initDashboardSearch();
    smoothScroll();
});

// 1. Hamburger menu toggle & 2. Active nav link highlighter
function initNav() {
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    
    if (hamburger && navLinks) {
        hamburger.addEventListener('click', () => {
            navLinks.classList.toggle('show');
        });
    }

    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    const links = document.querySelectorAll('.nav-links a');
    
    links.forEach(link => {
        const linkPath = link.getAttribute('href').split('/').pop();
        if (linkPath === currentPath) {
            link.classList.add('active');
        }
    });
}

// 3. Cart with localStorage
let cart = JSON.parse(localStorage.getItem('cart')) || [];

function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
}

function updateCartCount() {
    const counts = document.querySelectorAll('.cart-count');
    const total = cart.reduce((sum, item) => sum + item.qty, 0);
    counts.forEach(el => el.textContent = total);
}

function addToCart(id, name, price, img, qty = 1) {
    const existing = cart.find(item => item.id === id);
    if (existing) {
        existing.qty += parseInt(qty);
    } else {
        cart.push({ id, name, price: parseFloat(price), img, qty: parseInt(qty) });
    }
    saveCart();
    alert('Added to cart!');
}

function initCart() {
    updateCartCount();

    // Render cart items if on cart page
    const cartContainer = document.getElementById('cart-items-container');
    if (cartContainer) {
        renderCartPage(cartContainer);
    }

    // Add to cart buttons globally
    document.querySelectorAll('.btn-add-cart').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const card = e.target.closest('.product-card') || e.target.closest('.details-info');
            const id = card.dataset.id;
            const name = card.dataset.name;
            const price = card.dataset.price;
            const img = card.dataset.img;
            
            let qty = 1;
            const qtyInput = document.getElementById('details-qty');
            if (qtyInput) qty = parseInt(qtyInput.textContent);

            addToCart(id, name, price, img, qty);
        });
    });
}

function renderCartPage(container) {
    container.innerHTML = '';
    let subtotal = 0;

    if (cart.length === 0) {
        container.innerHTML = '<p>Your cart is empty. <a href="shop.html">Shop now</a></p>';
        document.getElementById('cart-subtotal').textContent = '$0.00';
        document.getElementById('cart-total').textContent = '$0.00';
        return;
    }

    cart.forEach(item => {
        subtotal += item.price * item.qty;
        container.innerHTML += `
            <div class="cart-item">
                <div class="cart-item-img"><img src="${item.img}" alt="${item.name}"></div>
                <div class="cart-item-details">
                    <h4>${item.name}</h4>
                    <p class="product-price">$${item.price.toFixed(2)}</p>
                </div>
                <div class="qty-selector">
                    <button class="qty-btn" onclick="updateCartQty('${item.id}', -1)">-</button>
                    <span>${item.qty}</span>
                    <button class="qty-btn" onclick="updateCartQty('${item.id}', 1)">+</button>
                </div>
                <p>$${(item.price * item.qty).toFixed(2)}</p>
                <button class="btn btn-outline" onclick="removeFromCart('${item.id}')">X</button>
            </div>
        `;
    });

    document.getElementById('cart-subtotal').textContent = `$${subtotal.toFixed(2)}`;
    document.getElementById('cart-total').textContent = `$${(subtotal + 5).toFixed(2)}`; // $5 delivery
}

window.updateCartQty = function(id, change) {
    const item = cart.find(i => i.id === id);
    if (item) {
        item.qty += change;
        if (item.qty <= 0) {
            removeFromCart(id);
        } else {
            saveCart();
            renderCartPage(document.getElementById('cart-items-container'));
        }
    }
};

window.removeFromCart = function(id) {
    cart = cart.filter(item => item.id !== id);
    saveCart();
    renderCartPage(document.getElementById('cart-items-container'));
};

// 4. Shop filter
function initShopFilters() {
    const searchInput = document.getElementById('shop-search');
    const catBtns = document.querySelectorAll('.filter-btn');
    const priceSlider = document.getElementById('price-slider');
    const priceLabel = document.getElementById('price-label');
    const cards = document.querySelectorAll('.shop-grid .product-card');

    if (!searchInput) return;

    let currentCat = 'All';
    let currentSearch = '';
    let currentMaxPrice = 200;

    function filterCards() {
        cards.forEach(card => {
            const cat = card.dataset.category;
            const price = parseFloat(card.dataset.price);
            const name = card.dataset.name.toLowerCase();

            const matchCat = currentCat === 'All' || cat === currentCat;
            const matchSearch = name.includes(currentSearch);
            const matchPrice = price <= currentMaxPrice;

            if (matchCat && matchSearch && matchPrice) {
                card.style.display = 'flex';
            } else {
                card.style.display = 'none';
            }
        });
    }

    searchInput.addEventListener('input', (e) => {
        currentSearch = e.target.value.toLowerCase();
        filterCards();
    });

    catBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            catBtns.forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            currentCat = e.target.dataset.cat;
            filterCards();
        });
    });

    priceSlider.addEventListener('input', (e) => {
        currentMaxPrice = e.target.value;
        priceLabel.textContent = `Max Price: $${currentMaxPrice}`;
        filterCards();
    });
}

// 5. Accordion for care guides
function initAccordion() {
    const items = document.querySelectorAll('.accordion-item');
    items.forEach(item => {
        const header = item.querySelector('.accordion-header');
        header.addEventListener('click', () => {
            const isActive = item.classList.contains('active');
            items.forEach(i => i.classList.remove('active'));
            if (!isActive) item.classList.add('active');
        });
    });
}

// 6. Form validation
function initForms() {
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            let valid = true;
            const inputs = form.querySelectorAll('input[required], textarea[required]');
            
            inputs.forEach(input => {
                if (!input.value.trim()) {
                    valid = false;
                    input.style.borderColor = 'red';
                } else {
                    input.style.borderColor = 'var(--primary)';
                }
            });

            // Specific password match check
            const pwd = form.querySelector('input[name="password"]');
            const pwdConfirm = form.querySelector('input[name="confirm_password"]');
            if (pwd && pwdConfirm && pwd.value !== pwdConfirm.value) {
                valid = false;
                pwdConfirm.style.borderColor = 'red';
                alert('Passwords do not match');
            }

            if (valid) {
                alert('Form submitted successfully!');
                form.reset();
            } else if (!pwd || !pwdConfirm || pwd.value === pwdConfirm.value) {
                alert('Please fill out all required fields.');
            }
        });
    });
}

// 7. Show/hide password
function initPasswordToggle() {
    const toggles = document.querySelectorAll('.pwd-toggle');
    toggles.forEach(toggle => {
        toggle.addEventListener('click', (e) => {
            const input = e.target.previousElementSibling;
            if (input.type === 'password') {
                input.type = 'text';
                e.target.textContent = 'Hide';
            } else {
                input.type = 'password';
                e.target.textContent = 'Show';
            }
        });
    });
}

// 8. Smooth scroll
function smoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
}

// 9. Quantity selector
function initQtySelector() {
    const minus = document.getElementById('qty-minus');
    const plus = document.getElementById('qty-plus');
    const val = document.getElementById('details-qty');

    if (minus && plus && val) {
        minus.addEventListener('click', () => {
            let v = parseInt(val.textContent);
            if (v > 1) val.textContent = v - 1;
        });
        plus.addEventListener('click', () => {
            let v = parseInt(val.textContent);
            val.textContent = v + 1;
        });
    }
}

// 10. Dashboard stock table search
function initDashboardSearch() {
    const search = document.getElementById('dash-search');
    const rows = document.querySelectorAll('.dash-table tbody tr');

    if (search && rows.length > 0) {
        search.addEventListener('input', (e) => {
            const term = e.target.value.toLowerCase();
            rows.forEach(row => {
                const name = row.children[1].textContent.toLowerCase();
                if (name.includes(term)) {
                    row.style.display = '';
                } else {
                    row.style.display = 'none';
                }
            });
        });
    }
}
