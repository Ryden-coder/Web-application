// Cart management module
import { api } from './api.js';
import { auth } from './auth.js';

export const cart = {
    items: [],
    STORAGE_KEY: 'cart',
    
    init() {
        this.items = JSON.parse(localStorage.getItem(this.STORAGE_KEY)) || [];
        this.updateDisplay();
    },
    
    add(productId, name, price) {
        const existingItem = this.items.find(item => item.product_id == productId);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            this.items.push({
                product_id: productId,
                name,
                price,
                quantity: 1
            });
        }
        
        this.save();
        this.updateDisplay();
        alert(`${name} added to cart!`);
    },
    
    remove(productId) {
        this.items = this.items.filter(item => item.product_id != productId);
        this.save();
        this.updateDisplay();
    },
    
    updateQuantity(productId, quantity) {
        const item = this.items.find(item => item.product_id == productId);
        
        if (item) {
            if (quantity <= 0) {
                this.remove(productId);
            } else {
                item.quantity = quantity;
                this.save();
                this.updateDisplay();
            }
        }
    },
    
    clear() {
        this.items = [];
        this.save();
        this.updateDisplay();
    },
    
    getTotal() {
        return this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    },
    
    getTotalItems() {
        return this.items.reduce((sum, item) => sum + item.quantity, 0);
    },
    
    save() {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.items));
    },
    
    updateDisplay() {
        const cartCount = document.getElementById('cart-count');
        if (cartCount) {
            cartCount.textContent = this.getTotalItems();
        }
    },
    
    displayItems() {
        const container = document.getElementById('cart-items-container');
        
        if (!container) return;
        
        if (this.items.length === 0) {
            container.innerHTML = '<p style="text-align: center; padding: 20px;">Your cart is empty</p>';
        } else {
            container.innerHTML = this.items.map(item => `
                <div style="border-bottom: 1px solid #ddd; padding: 10px 0;">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <h4>${item.name}</h4>
                            <p>Price: $${item.price.toFixed(2)}</p>
                        </div>
                        <div style="display: flex; gap: 10px; align-items: center;">
                            <input type="number" min="1" value="${item.quantity}" 
                                   onchange="window.cart.updateQuantity(${item.product_id}, parseInt(this.value))"
                                   style="width: 60px; padding: 5px;">
                            <button class="btn" onclick="window.cart.remove(${item.product_id})" style="background-color: #ff523b;">Remove</button>
                        </div>
                    </div>
                </div>
            `).join('');
        }
        
        const totalItems = this.getTotalItems();
        const totalPrice = this.getTotal();
        
        document.getElementById('total-items').textContent = totalItems;
        document.getElementById('total-price').textContent = totalPrice.toFixed(2);
    },
    
    openModal() {
        const modal = document.getElementById('cart-modal');
        if (modal) {
            modal.style.display = 'flex';
            this.displayItems();
        }
    },
    
    closeModal() {
        const modal = document.getElementById('cart-modal');
        if (modal) {
            modal.style.display = 'none';
        }
    },
    
    async checkout() {
        if (!auth.isLoggedIn()) {
            alert('Please login to checkout');
            await auth.login();
            return;
        }
        
        if (this.items.length === 0) {
            alert('Your cart is empty');
            return;
        }
        
        // Import payment module dynamically to avoid circular dependencies
        const { payment } = await import('./payment.js');
        payment.initiatePayment();
    }
};
