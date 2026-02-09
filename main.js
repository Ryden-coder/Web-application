// Main entry point - orchestrates all modules
import { auth } from './modules/auth.js';
import { cart } from './modules/cart.js';
import { products } from './modules/products.js';
import { orders } from './modules/orders.js';
import { admin } from './modules/admin.js';
import { payment } from './modules/payment.js';

console.log('✅ Modules imported successfully:', { auth, cart, products, orders, admin, payment });

// Make modules globally accessible for onclick handlers
window.auth = auth;
window.cart = cart;
window.products = products;
window.orders = orders;
window.admin = admin;
window.payment = payment;

console.log('✅ Modules exposed to window');

// Initialize application
export async function initializeApp() {
    console.log('🚀 Initializing Shopping App...');
    
    try {
        // Initialize cart
        cart.init();
        console.log('✅ Cart initialized');
        
        // Load products from backend
        console.log('📦 Loading products from backend...');
        await products.load();
        console.log('✅ Products loaded:', products.items);
        
        // Setup UI
        setupEventListeners();
        console.log('✅ Event listeners setup');
        
        auth.updateNavbar();
        console.log('✅ Navbar updated');
        
        console.log('✅ App initialized successfully');
    } catch (error) {
        console.error('❌ Error initializing app:', error);
    }
}

function setupEventListeners() {
    // Cart button
    const cartBtn = document.querySelector('.cart-btn');
    if (cartBtn) {
        cartBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            cart.openModal();
        });
    }
    
    // Modal close on outside click
    window.addEventListener('click', function(event) {
        const modal = document.getElementById('cart-modal');
        if (modal && event.target === modal) {
            cart.closeModal();
        }
    });
    
    // Account link
    const accountLink = document.querySelector('nav a[onclick*="handleAccountClick"]');
    if (accountLink) {
        accountLink.onclick = (e) => {
            e.preventDefault();
            auth.handleAccountClick();
        };
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}
