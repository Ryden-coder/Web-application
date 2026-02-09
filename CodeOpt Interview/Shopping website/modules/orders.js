// Order history module
import { api } from './api.js';

export const orders = {
    items: [],
    
    async load() {
        try {
            this.items = await api.getOrders();
            console.log('✅ Orders loaded:', this.items);
        } catch (error) {
            console.error('Failed to load orders:', error);
        }
    },
    
    async openModal() {
        await this.load();
        
        const modal = document.getElementById('orders-modal');
        if (modal) {
            this.display();
            modal.style.display = 'flex';
        }
    },
    
    closeModal() {
        const modal = document.getElementById('orders-modal');
        if (modal) {
            modal.style.display = 'none';
        }
    },
    
    display() {
        const container = document.getElementById('orders-container');
        
        if (!container) return;
        
        if (this.items.length === 0) {
            container.innerHTML = '<p style="text-align: center; padding: 20px;">No orders yet</p>';
            return;
        }
        
        container.innerHTML = this.items.map(order => `
            <div style="border: 1px solid #ddd; padding: 15px; margin: 10px 0; border-radius: 8px;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <h4>Order #${order.id}</h4>
                        <p>Date: ${new Date(order.created_at).toLocaleDateString()}</p>
                        <p>Status: <strong style="color: ${order.status === 'completed' ? '#27ae60' : '#e74c3c'}">${order.status.toUpperCase()}</strong></p>
                        <p>Total: $${order.total_amount.toFixed(2)}</p>
                    </div>
                    <button class="btn" onclick="orders.showDetails(${order.id})">View Details</button>
                </div>
            </div>
        `).join('');
    },
    
    showDetails(orderId) {
        const order = this.items.find(o => o.id === orderId);
        if (!order) return;
        
        let itemsList = order.items.map(item => 
            `${item.product_name} x${item.quantity} = $${(item.price * item.quantity).toFixed(2)}`
        ).join('\n');
        
        alert(`Order #${order.id}\n\nItems:\n${itemsList}\n\nTotal: $${order.total_amount.toFixed(2)}\nStatus: ${order.status}`);
    }
};
