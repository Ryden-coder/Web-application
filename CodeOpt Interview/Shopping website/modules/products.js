// Products module
import { api } from './api.js';

export const products = {
    items: [],
    
    async load() {
        try {
            this.items = await api.getProducts();
            this.display();
        } catch (error) {
            console.error('Failed to load products:', error);
        }
    },
    
    display() {
        const row = document.querySelector('.categories .row');
        
        if (!row) return;
        
        row.innerHTML = '<h2>Our Products</h2>' + this.items.map(product => `
            <div class="col-3">
                <img src="${product.image_url}" alt="${product.name}" title="${product.name}">
                <h4>${product.name}</h4>
                <p class="price">$${product.price.toFixed(2)}</p>
                <p style="font-size: 12px; color: #888;">Stock: ${product.stock}</p>
                <button class="btn add-to-cart" onclick="window.cart.add(${product.id}, '${product.name}', ${product.price})">Add to Cart</button>
            </div>
        `).join('');
    },
    
    getById(id) {
        return this.items.find(p => p.id === id);
    }
};
