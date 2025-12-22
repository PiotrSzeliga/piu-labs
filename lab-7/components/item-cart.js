import loadTemplate from '../utils/loadTemplate.js';

const template = await loadTemplate('./components/item-cart.html');

export default class ItemCart extends HTMLElement {
    constructor() {
        super();
        const shadow = this.attachShadow({ mode: 'open' });
        shadow.appendChild(template.content.cloneNode(true));
        this.onAdd = this.onAdd.bind(this);
    }

    connectedCallback() {
        document.addEventListener('add-to-basket', this.onAdd);
    }

    disconnectedCallback() {
        document.removeEventListener('add-to-basket', this.onAdd);
    }

    onAdd(e) {
        if (!e?.detail) return;
        this.addItem(e.detail);
    }

    addItem(detail) {
        const container = this.shadowRoot.querySelector('.items');
        if (!container) return;

        const item = document.createElement('div');
        item.className = 'cart-item';

        const left = document.createElement('div');
        left.className = 'left';

        const img = document.createElement('img');
        img.className = 'thumb';
        img.src = detail.image || '';
        img.alt = detail.name || '';
        img.width = 48;
        img.height = 48;

        const info = document.createElement('div');
        info.className = 'info';

        const name = document.createElement('div');
        name.className = 'name';
        name.textContent = detail.name || '';

        const price = document.createElement('div');
        price.className = 'price';
        price.textContent = detail.price || '';

        info.appendChild(name);
        info.appendChild(price);
        left.appendChild(img);
        left.appendChild(info);

        const numeric = this.#parsePrice(detail.price || '');
        item.dataset.price = String(numeric);

        const remove = document.createElement('button');
        remove.className = 'remove';
        remove.type = 'button';
        remove.textContent = 'X';
        remove.addEventListener('click', () => {
            item.remove();
            this.#updateTotal();
        });

        item.appendChild(left);
        item.appendChild(remove);

        container.appendChild(item);

        this.#updateTotal();
    }

    #parsePrice(value) {
        if (!value) return 0;
        const m = String(value)
            .replace(/\s/g, '')
            .match(/-?\d+([.,]\d+)?/);
        if (!m) return 0;
        const num = m[0].replace(',', '.');
        return Number.parseFloat(num) || 0;
    }

    #updateTotal() {
        const container = this.shadowRoot.querySelector('.items');
        const totalEl = this.shadowRoot.querySelector('.total-amount');
        if (!container || !totalEl) return;
        let sum = 0;
        for (const it of container.children) {
            const p = Number(it.dataset.price || '0');
            if (!Number.isNaN(p)) sum += p;
        }
        const formatted = Number.isInteger(sum)
            ? `${sum} zł`
            : `${sum.toFixed(2)} zł`;
        totalEl.textContent = formatted;
    }
}

customElements.define('item-cart', ItemCart);
