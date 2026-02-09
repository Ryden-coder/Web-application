// API utility module
const API_BASE_URL = 'http://localhost:5000/api';

export const api = {
    async request(endpoint, options = {}) {
        const url = `${API_BASE_URL}${endpoint}`;
        
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers
        };
        
        // Add JWT token if available
        const token = localStorage.getItem('access_token');
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        
        try {
            const response = await fetch(url, {
                ...options,
                headers
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || `Request failed: ${response.status}`);
            }
            
            return data;
        } catch (error) {
            console.error(`API Error (${endpoint}):`, error);
            throw error;
        }
    },
    
    // Auth endpoints
    async register(email, password, firstName, lastName) {
        return this.request('/auth/register', {
            method: 'POST',
            body: JSON.stringify({
                email,
                password,
                first_name: firstName,
                last_name: lastName
            })
        });
    },
    
    async login(email, password) {
        return this.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });
    },
    
    // Product endpoints
    async getProducts(category = null) {
        const url = category ? `/products?category=${category}` : '/products';
        return this.request(url);
    },
    
    async getProduct(id) {
        return this.request(`/products/${id}`);
    },
    
    // Order endpoints
    async createOrder(items) {
        return this.request('/orders', {
            method: 'POST',
            body: JSON.stringify({ items })
        });
    },
    
    async getOrders() {
        return this.request('/orders');
    },
    
    async getOrder(id) {
        return this.request(`/orders/${id}`);
    },
    
    // User endpoints
    async getProfile() {
        return this.request('/users/profile');
    },
    
    async updateProfile(firstName, lastName) {
        return this.request('/users/profile', {
            method: 'PUT',
            body: JSON.stringify({ first_name: firstName, last_name: lastName })
        });
    },
    
    // Payment endpoints
    async processPayment(paymentData) {
        return this.request('/payments/process', {
            method: 'POST',
            body: JSON.stringify(paymentData)
        });
    },
    
    // Admin endpoints
    async getAdminStats() {
        return this.request('/admin/stats');
    },
    
    async createProduct(productData) {
        return this.request('/products', {
            method: 'POST',
            body: JSON.stringify(productData)
        });
    },
    
    async updateProduct(id, productData) {
        return this.request(`/products/${id}`, {
            method: 'PUT',
            body: JSON.stringify(productData)
        });
    },
    
    async deleteProduct(id) {
        return this.request(`/products/${id}`, {
            method: 'DELETE'
        });
    }
};
