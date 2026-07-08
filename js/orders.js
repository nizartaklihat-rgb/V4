const LMAJHOLOrders = {
    config: { botToken: 'YOUR_BOT_TOKEN_HERE', chatId: 'YOUR_CHAT_ID_HERE', useNetlifyFunction: true },
    init() { this.setupOrderForm(); this.setupFormListeners(); },
    setupOrderForm() {
        const form = document.getElementById('orderForm');
        if (!form) return;
        form.addEventListener('submit', (e) => { e.preventDefault(); this.submitOrder(); });
    },
    setupFormListeners() {
        ['productName', 'productSize', 'quantity'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.addEventListener('change', () => this.updateSummary());
        });
    },
    updateSummary() {
        const productId = document.getElementById('productName')?.value;
        const size = document.getElementById('productSize')?.value;
        const quantity = document.getElementById('quantity')?.value;
        const product = LMAJHOLProducts.getProduct(productId);
        document.getElementById('summaryProduct').textContent = product ? product.name : '—';
        document.getElementById('summarySize').textContent = size || '—';
        document.getElementById('summaryQty').textContent = quantity || '—';
        document.getElementById('summaryTotal').textContent = product && quantity ? `${product.price * parseInt(quantity)} ${product.currency}` : '— MAD';
    },
    async submitOrder() {
        const formData = this.getFormData();
        if (!this.validateForm(formData)) return;
        const btn = document.querySelector('#orderForm button[type="submit"]');
        const originalText = btn.textContent;
        btn.textContent = 'Placing Order...';
        btn.disabled = true;
        try {
            await this.sendToTelegram(formData);
            this.storeOrder(formData);
            this.showSuccess();
            document.getElementById('orderForm').reset();
            this.updateSummary();
        } catch (error) {
            console.error('Order error:', error);
            alert('Error placing order. Please try again.');
        } finally {
            btn.textContent = originalText;
            btn.disabled = false;
        }
    },
    getFormData() {
        const productId = document.getElementById('productName')?.value;
        const product = LMAJHOLProducts.getProduct(productId);
        return {
            product: product?.name || 'Unknown', productId, size: document.getElementById('productSize')?.value,
            quantity: document.getElementById('quantity')?.value, fullName: document.getElementById('fullName')?.value,
            phone: document.getElementById('phone')?.value, city: document.getElementById('city')?.value,
            address: document.getElementById('address')?.value, notes: document.getElementById('notes')?.value,
            price: product?.price || 0, currency: product?.currency || 'MAD',
            total: (product?.price || 0) * parseInt(document.getElementById('quantity')?.value || 1),
            timestamp: new Date().toISOString(), orderId: 'LMAJHOL-' + Date.now().toString(36).toUpperCase()
        };
    },
    validateForm(data) {
        for (const field of ['product', 'size', 'quantity', 'fullName', 'phone', 'city', 'address']) {
            if (!data[field] || data[field].trim() === '') { alert('Please fill in all required fields.'); return false; }
        }
        return true;
    },
    async sendToTelegram(orderData) {
        const message = `🛍️ *NEW ORDER — LMAJHOL*\n\n📋 *Order ID:* ${orderData.orderId}\n⏰ *Time:* ${new Date(orderData.timestamp).toLocaleString()}\n\n━━━━━━━━━━━━━━━━━━━━\n\n👕 *Product:* ${orderData.product}\n📏 *Size:* ${orderData.size}\n📦 *Quantity:* ${orderData.quantity}\n💰 *Total:* ${orderData.total} ${orderData.currency}\n💳 *Payment:* Cash on Delivery\n\n━━━━━━━━━━━━━━━━━━━━\n\n👤 *Customer:* ${orderData.fullName}\n📱 *Phone:* ${orderData.phone}\n🏙️ *City:* ${orderData.city}\n📍 *Address:* ${orderData.address}\n${orderData.notes ? `📝 *Notes:* ${orderData.notes}` : ''}`;
        if (this.config.useNetlifyFunction) {
            const response = await fetch('/.netlify/functions/telegram', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ order: orderData, message })
            });
            if (!response.ok) throw new Error('Failed to send notification');
            return response.json();
        }
    },
    storeOrder(orderData) {
        const orders = this.getOrders();
        orders.unshift(orderData);
        if (orders.length > 100) orders.pop();
        localStorage.setItem('lmajhol_orders', JSON.stringify(orders));
    },
    getOrders() {
        const stored = localStorage.getItem('lmajhol_orders');
        if (stored) { try { return JSON.parse(stored); } catch(e) { return []; } }
        return [];
    },
    showSuccess() {
        const form = document.getElementById('orderForm');
        const success = document.getElementById('orderSuccess');
        if (form) form.style.display = 'none';
        if (success) { success.style.display = 'block'; gsap.from(success, { opacity: 0, y: 20, duration: 0.5 }); }
        setTimeout(() => { if (form) form.style.display = 'block'; if (success) success.style.display = 'none'; }, 5000);
    }
};
document.addEventListener('DOMContentLoaded', () => { LMAJHOLOrders.init(); });
