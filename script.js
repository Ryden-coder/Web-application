// Configuration
const API_BASE_URL = 'http://localhost:5000/api';
let accessToken = localStorage.getItem('access_token');
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// ============ INITIALIZATION ============

document.addEventListener('DOMContentLoaded', function() {
    loadProductsFromBackend();
    updateCartDisplay();
    setupEventListeners();
});

// ============ EVENT LISTENERS ============

function setupEventListeners() {
    const cartBtn = document.querySelector('.cart-btn');
    if (cartBtn) {
        cartBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            openCart();
        });
    }
}

// ============ CART MANAGEMENT ============

function addToCart(productId, productName, price) {
    const existingItem = cart.find(item => item.product_id == productId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            product_id: productId,
            name: productName,
            price: price,
            quantity: 1
        });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartDisplay();
    alert(`${productName} added to cart!`);
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.product_id != productId);
    localStorage.setItem('cart', JSON.stringify(cart));
    displayCartItems();
    updateCartDisplay();
}

function updateQuantity(productId, quantity) {
    const item = cart.find(item => item.product_id == productId);
    if (item) {
        if (quantity <= 0) {
            removeFromCart(productId);
        } else {
            item.quantity = quantity;
            localStorage.setItem('cart', JSON.stringify(cart));
            displayCartItems();
            updateCartDisplay();
        }
    }
}

function updateCartDisplay() {
    const cartCount = document.getElementById('cart-count');
    if (cartCount) {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCount.textContent = totalItems;
    }
}

function openCart() {
    const modal = document.getElementById('cart-modal');
    if (modal) {
        modal.style.display = 'flex';
        displayCartItems();
    }
}

function closeCart() {
    const modal = document.getElementById('cart-modal');
    if (modal) {
        modal.style.display = 'none';
    }
}

function displayCartItems() {
    const container = document.getElementById('cart-items-container');
    
    if (!container) return;
    
    if (cart.length === 0) {
        container.innerHTML = '<p style="text-align: center; padding: 20px;">Your cart is empty</p>';
    } else {
        container.innerHTML = cart.map(item => `
            <div style="border-bottom: 1px solid #ddd; padding: 10px 0;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <h4>${item.name}</h4>
                        <p>Price: $${item.price.toFixed(2)}</p>
                    </div>
                    <div style="display: flex; gap: 10px; align-items: center;">
                        <input type="number" min="1" value="${item.quantity}" 
                               onchange="updateQuantity(${item.product_id}, parseInt(this.value))"
                               style="width: 60px; padding: 5px;">
                        <button class="btn" onclick="removeFromCart(${item.product_id})" style="background-color: #ff523b;">Remove</button>
                    </div>
                </div>
            </div>
        `).join('');
    }
    
    // Update totals
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    document.getElementById('total-items').textContent = totalItems;
    document.getElementById('total-price').textContent = totalPrice.toFixed(2);
}

// ============ PRODUCT MANAGEMENT ============

async function loadProductsFromBackend() {
    try {
        const response = await fetch(`${API_BASE_URL}/products`);
        
        if (!response.ok) {
            console.error('Failed to load products');
            return;
        }
        
        const products = await response.json();
        displayProducts(products);
    } catch (error) {
        console.error('Error loading products:', error);
    }
}

function displayProducts(products) {
    const row = document.querySelector('.categories .row');
    
    if (!row) return;
    
    row.innerHTML = '<h2>Our Products</h2>' + products.map(product => `
        <div class="col-3">
            <img src="${product.image_url}" alt="${product.name}" title="${product.name}">
            <h4>${product.name}</h4>
            <p class="price">$${product.price.toFixed(2)}</p>
            <p style="font-size: 12px; color: #888;">Stock: ${product.stock}</p>
            <button class="btn add-to-cart" onclick="addToCart(${product.id}, '${product.name}', ${product.price})">Add to Cart</button>
        </div>
    `).join('');
}

// ============ AUTHENTICATION ============

async function registerUser() {
    const email = prompt('Email:');
    const password = prompt('Password:');
    const firstName = prompt('First Name:');
    const lastName = prompt('Last Name:');
    
    if (!email || !password) {
        alert('Email and password are required');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email,
                password,
                first_name: firstName,
                last_name: lastName
            })
        });
        
        const data = await response.json();
        console.log('Register response:', data);
        
        if (!response.ok) {
            alert(data.message || 'Registration failed');
            return;
        }
        
        alert('Registration successful! Please login now.');
        loginUser();
    } catch (error) {
        console.error('Registration error:', error);
        alert('An error occurred during registration');
    }
}

async function loginUser() {
    const email = prompt('Email:');
    const password = prompt('Password:');
    
    if (!email || !password) {
        alert('Email and password are required');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            alert(data.message || 'Login failed');
            return;
        }
        
        accessToken = data.access_token;
        localStorage.setItem('access_token', accessToken);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        alert(`Welcome, ${data.user.first_name || data.user.email}!`);
        updateNavbar();
    } catch (error) {
        console.error('Login error:', error);
        alert('An error occurred during login');
    }
}

function logoutUser() {
    accessToken = null;
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    alert('Logged out successfully');
    updateNavbar();
}

function updateNavbar() {
    const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;
    const accountLink = document.querySelector('nav ul li:last-child a');
    
    if (accountLink) {
        if (user) {
            accountLink.textContent = user.first_name || user.email;
            accountLink.href = '#profile';
            accountLink.onclick = (e) => {
                e.preventDefault();
                showUserProfile(user);
            };
        } else {
            accountLink.textContent = 'Account';
        }
    }
}

function handleAccountClick() {
    const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;
    
    if (user) {
        // Already logged in, show profile
        alert(`Welcome, ${user.first_name || user.email}!\n\nEmail: ${user.email}`);
    } else {
        // Not logged in, ask to register or login
        const choice = prompt('Are you a new user?\n\nType "register" to create an account\nType "login" to sign in');
        
        if (choice && choice.toLowerCase() === 'register') {
            registerUser();
        } else if (choice && choice.toLowerCase() === 'login') {
            loginUser();
        }
    }
}

function showUserProfile(user) {
    alert(`User: ${user.first_name} ${user.last_name}\nEmail: ${user.email}`);
}

// ============ CHECKOUT ============

async function checkout() {
    if (!accessToken) {
        alert('Please login to checkout');
        loginUser();
        return;
    }
    
    if (cart.length === 0) {
        alert('Your cart is empty');
        return;
    }
    
    // Prepare items for backend
    const items = cart.map(item => ({
        product_id: item.product_id,
        quantity: item.quantity
    }));
    
    console.log('Sending checkout request with items:', items);
    
    try {
        const response = await fetch(`${API_BASE_URL}/orders`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`
            },
            body: JSON.stringify({ items: items })
        });
        
        const data = await response.json();
        console.log('Backend response:', data);
        
        if (!response.ok) {
            alert(data.message || 'Checkout failed');
            return;
        }
        
        alert(`Order created successfully! Order ID: ${data.order.id}`);
        cart = [];
        localStorage.removeItem('cart');
        updateCartDisplay();
        closeCart();
    } catch (error) {
        console.error('Checkout error:', error);
        alert('An error occurred during checkout. Check console for details.');
    }
}

// ============ MODAL CLOSE ============

window.onclick = function(event) {
    const modal = document.getElementById('cart-modal');
    if (modal && event.target === modal) {
        modal.style.display = 'none';
    }
}
