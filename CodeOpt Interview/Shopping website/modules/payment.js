// Payment processing module (Stripe)
import { api } from './api.js';
import { cart } from './cart.js';

export const payment = {
    stripeKey: 'pk_test_your_stripe_key_here',  // Replace with your Stripe key
    
    async initiatePayment() {
        if (!localStorage.getItem('access_token')) {
            alert('Please login to proceed');
            return;
        }
        
        if (cart.items.length === 0) {
            alert('Your cart is empty');
            return;
        }
        
        const total = cart.getTotal();
        
        // For now, show payment modal
        this.showPaymentForm(total);
    },
    
    showPaymentForm(total) {
        const modal = document.getElementById('payment-modal');
        if (!modal) return;
        
        document.getElementById('payment-amount').textContent = total.toFixed(2);
        modal.style.display = 'flex';
    },
    
    closePaymentForm() {
        const modal = document.getElementById('payment-modal');
        if (modal) {
            modal.style.display = 'none';
        }
    },
    
    async processPayment() {
        const cardName = document.getElementById('card-name').value;
        const cardNumber = document.getElementById('card-number').value;
        const expiryDate = document.getElementById('expiry-date').value;
        const cvv = document.getElementById('cvv').value;
        
        if (!cardName || !cardNumber || !expiryDate || !cvv) {
            alert('Please fill in all payment details');
            return;
        }
        
        try {
            // Validate card format (basic)
            if (cardNumber.length < 13 || cardNumber.length > 19) {
                alert('Invalid card number');
                return;
            }
            
            // Create order first
            const itemsForBackend = cart.items.map(item => ({
                product_id: item.product_id,
                quantity: item.quantity
            }));
            
            const orderData = await api.createOrder(itemsForBackend);
            
            // Process payment
            const paymentData = await api.processPayment({
                order_id: orderData.order.id,
                amount: cart.getTotal(),
                card_number: cardNumber.slice(-4),
                card_name: cardName
            });
            
            alert(`✅ Payment successful!\nOrder ID: ${orderData.order.id}\nAmount: $${cart.getTotal().toFixed(2)}`);
            
            // Clear cart
            cart.clear();
            cart.closeModal();
            this.closePaymentForm();
            
        } catch (error) {
            alert('❌ Payment failed: ' + error.message);
        }
    },
    
    validateCard(e) {
        // Basic validation for card number (Luhn algorithm)
        const value = e.target.value.replace(/\s/g, '');
        if (value.length <= 19 && /^\d*$/.test(value)) {
            e.target.value = value.match(/.{1,4}/g)?.join(' ') || value;
        }
    }
};
