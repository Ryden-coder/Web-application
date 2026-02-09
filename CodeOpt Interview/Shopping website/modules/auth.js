// Authentication module
import { api } from './api.js';

export const auth = {
    async register() {
        const email = prompt('Email:');
        const password = prompt('Password:');
        const firstName = prompt('First Name:');
        const lastName = prompt('Last Name:');
        
        if (!email || !password) {
            alert('Email and password are required');
            return false;
        }
        
        try {
            const data = await api.register(email, password, firstName, lastName);
            alert('Registration successful! Please login now.');
            return await this.login();
        } catch (error) {
            alert(error.message || 'Registration failed');
            return false;
        }
    },
    
    async login() {
        const email = prompt('Email:');
        const password = prompt('Password:');
        
        if (!email || !password) {
            alert('Email and password are required');
            return false;
        }
        
        try {
            const data = await api.login(email, password);
            localStorage.setItem('access_token', data.access_token);
            localStorage.setItem('user', JSON.stringify(data.user));
            alert(`Welcome, ${data.user.first_name || data.user.email}!`);
            this.updateNavbar();
            return true;
        } catch (error) {
            alert(error.message || 'Login failed');
            return false;
        }
    },
    
    logout() {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
        alert('Logged out successfully');
        this.updateNavbar();
    },
    
    isLoggedIn() {
        return !!localStorage.getItem('access_token');
    },
    
    getUser() {
        const userStr = localStorage.getItem('user');
        return userStr ? JSON.parse(userStr) : null;
    },
    
    updateNavbar() {
        const user = this.getUser();
        const accountLink = document.querySelector('nav ul li:last-child a');
        
        if (accountLink) {
            if (user) {
                accountLink.textContent = user.first_name || user.email;
            } else {
                accountLink.textContent = 'Account';
            }
        }
    },
    
    async handleAccountClick() {
        const user = this.getUser();
        
        if (user) {
            const options = `Welcome, ${user.first_name || user.email}!\n\nType:\n"profile" - View profile\n"orders" - Order history\n"logout" - Sign out\n"admin" - Admin panel(if authorized)`;
            const action = prompt(options);
            
            if (action && action.toLowerCase() === 'logout') {
                this.logout();
            } else if (action && action.toLowerCase() === 'profile') {
                alert(`Email: ${user.email}\nName: ${user.first_name} ${user.last_name}`);
            } else if (action && action.toLowerCase() === 'orders') {
                // Import orders dynamically
                const { orders } = await import('./orders.js');
                orders.openModal();
            } else if (action && action.toLowerCase() === 'admin') {
                // Import admin dynamically
                const { admin } = await import('./admin.js');
                admin.openPanel();
            }
        } else {
            const choice = prompt('Are you a new user?\n\nType "register" to create an account\nType "login" to sign in');
            
            if (choice && choice.toLowerCase() === 'register') {
                await this.register();
            } else if (choice && choice.toLowerCase() === 'login') {
                await this.login();
            }
        }
    }
};
