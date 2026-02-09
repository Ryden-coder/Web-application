// Admin panel module
import { api } from './api.js';
import { auth } from './auth.js';

export const admin = {
    products: [],
    orders: [],
    stats: {
        total_users: 0,
        total_orders: 0,
        total_revenue: 0
    },
    
    isAdmin() {
        return localStorage.getItem('is_admin') === 'true';
    },
    
    async openPanel() {
        if (!this.isAdmin()) {
            alert('⛔ Admin access only');
            return;
        }
        
        const modal = document.getElementById('admin-modal');
        if (modal) {
            modal.style.display = 'flex';
            await this.loadData();
            this.displayDashboard();
        }
    },
    
    closePanel() {
        const modal = document.getElementById('admin-modal');
        if (modal) {
            modal.style.display = 'none';
        }
    },
    
    async loadData() {
        try {
            // Load products
            const productsData = await api.getProducts();
            this.products = productsData;
            
            // Load stats
            const statsData = await api.getAdminStats();
            this.stats = statsData;
            
            console.log('✅ Admin data loaded');
        } catch (error) {
            console.error('Failed to load admin data:', error);
        }
    },
    
    displayDashboard() {
        const container = document.getElementById('admin-content');
        if (!container) return;
        
        container.innerHTML = `
            <div style="margin-bottom: 30px;">
                <h2>📊 Dashboard</h2>
                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin: 20px 0;">
                    <div style="background: #3498db; color: white; padding: 20px; border-radius: 8px; text-align: center;">
                        <h3>${this.stats.total_users || 0}</h3>
                        <p>Total Users</p>
                    </div>
                    <div style="background: #2ecc71; color: white; padding: 20px; border-radius: 8px; text-align: center;">
                        <h3>${this.stats.total_orders || 0}</h3>
                        <p>Total Orders</p>
                    </div>
                    <div style="background: #e74c3c; color: white; padding: 20px; border-radius: 8px; text-align: center;">
                        <h3>$${(this.stats.total_revenue || 0).toFixed(2)}</h3>
                        <p>Total Revenue</p>
                    </div>
                </div>
            </div>
            
            <div style="margin-bottom: 30px;">
                <h2>📦 Products Management</h2>
                <button class="btn" onclick="admin.showAddProductForm()">+ Add New Product</button>
                ${this.displayProducts()}
            </div>
        `;
    },
    
    displayProducts() {
        if (this.products.length === 0) return '<p>No products found</p>';
        
        return `
            <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
                <thead>
                    <tr style="background: #ecf0f1;">
                        <th style="padding: 10px; text-align: left; border: 1px solid #bdc3c7;">Name</th>
                        <th style="padding: 10px; text-align: left; border: 1px solid #bdc3c7;">Price</th>
                        <th style="padding: 10px; text-align: left; border: 1px solid #bdc3c7;">Stock</th>
                        <th style="padding: 10px; text-align: left; border: 1px solid #bdc3c7;">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${this.products.map(product => `
                        <tr style="border: 1px solid #bdc3c7;">
                            <td style="padding: 10px;">${product.name}</td>
                            <td style="padding: 10px;">$${product.price.toFixed(2)}</td>
                            <td style="padding: 10px;">${product.stock}</td>
                            <td style="padding: 10px;">
                                <button class="btn" onclick="admin.editProduct(${product.id})" style="background: #3498db; font-size: 12px; padding: 5px 10px;">Edit</button>
                                <button class="btn" onclick="admin.deleteProduct(${product.id})" style="background: #e74c3c; font-size: 12px; padding: 5px 10px;">Delete</button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    },
    
    showAddProductForm() {
        const name = prompt('Product Name:');
        if (!name) return;
        
        const price = parseFloat(prompt('Price:'));
        const stock = parseInt(prompt('Stock:'));
        const description = prompt('Description:');
        const imageUrl = prompt('Image URL:');
        const category = prompt('Category:');
        
        this.addProduct({name, price, stock, description, image_url: imageUrl, category});
    },
    
    async addProduct(data) {
        try {
            const response = await api.createProduct(data);
            alert('✅ Product added successfully');
            await this.loadData();
            this.displayDashboard();
        } catch (error) {
            alert('❌ Failed to add product: ' + error.message);
        }
    },
    
    async editProduct(id) {
        const product = this.products.find(p => p.id === id);
        if (!product) return;
        
        const name = prompt('Product Name:', product.name);
        if (!name) return;
        
        const price = parseFloat(prompt('Price:', product.price));
        const stock = parseInt(prompt('Stock:', product.stock));
        
        try {
            await api.updateProduct(id, {name, price, stock});
            alert('✅ Product updated');
            await this.loadData();
            this.displayDashboard();
        } catch (error) {
            alert('❌ Failed to update: ' + error.message);
        }
    },
    
    async deleteProduct(id) {
        if (!confirm('Are you sure you want to delete this product?')) return;
        
        try {
            await api.deleteProduct(id);
            alert('✅ Product deleted');
            await this.loadData();
            this.displayDashboard();
        } catch (error) {
            alert('❌ Failed to delete: ' + error.message);
        }
    }
};
