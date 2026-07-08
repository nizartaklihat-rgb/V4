const LMAJHOLProducts = {
    defaults: [
        { id: 'white-oversized-tee', name: 'White Oversized T-Shirt', color: 'White', price: 149, currency: 'MAD', image: '', badge: 'Essential', description: 'Premium 220gsm cotton oversized t-shirt.', sizes: ['S','M','L','XL','XXL'], active: true },
        { id: 'black-oversized-tee', name: 'Black Oversized T-Shirt', color: 'Black', price: 149, currency: 'MAD', image: '', badge: 'Essential', description: 'Premium 220gsm cotton oversized t-shirt.', sizes: ['S','M','L','XL','XXL'], active: true }
    ],
    getProducts() {
        const stored = localStorage.getItem('lmajhol_products');
        if (stored) { try { return JSON.parse(stored); } catch(e) { return this.defaults; } }
        return this.defaults;
    },
    saveProducts(products) { localStorage.setItem('lmajhol_products', JSON.stringify(products)); },
    getProduct(id) { return this.getProducts().find(p => p.id === id); },
    renderProducts() {
        const grid = document.getElementById('productsGrid');
        if (!grid) return;
        const products = this.getProducts().filter(p => p.active);
        grid.innerHTML = '';
        products.forEach((product) => {
            const card = document.createElement('div');
            card.className = 'product-card';
            const imageContent = product.image ? `<img src="${product.image}" alt="${product.name}" loading="lazy">` : `<div class="product-placeholder">${product.color === 'Black' ? 'B' : 'W'}</div>`;
            card.innerHTML = `${product.badge ? `<span class="product-badge">${product.badge}</span>` : ''}<div class="product-image" style="background: ${product.color === 'Black' ? '#1a1a1a' : '#f0f0f0'}">${imageContent}</div><div class="product-info"><h3 class="product-name">${product.name}</h3><p class="product-price">${product.price} ${product.currency}</p></div>`;
            card.addEventListener('click', () => {
                document.getElementById('order').scrollIntoView({ behavior: 'smooth' });
                const select = document.getElementById('productName');
                if (select) { select.value = product.id; select.dispatchEvent(new Event('change')); }
            });
            grid.appendChild(card);
        });
    },
    populateOrderSelect() {
        const select = document.getElementById('productName');
        if (!select) return;
        const products = this.getProducts().filter(p => p.active);
        select.innerHTML = '<option value="">Select product</option>';
        products.forEach(p => {
            const opt = document.createElement('option');
            opt.value = p.id;
            opt.textContent = `${p.name} — ${p.price} ${p.currency}`;
            select.appendChild(opt);
        });
    },
    getPrice(id) { const p = this.getProduct(id); return p ? p.price : 0; }
};
document.addEventListener('DOMContentLoaded', () => { LMAJHOLProducts.renderProducts(); LMAJHOLProducts.populateOrderSelect(); });
