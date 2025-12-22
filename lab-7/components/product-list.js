import loadTemplate from '../utils/loadTemplate.js';
import productsData from '../data.json' with { type: 'json' };

const template = await loadTemplate('./components/product-list.html');

export default class ProductList extends HTMLElement {
    constructor() {
        super();
        const shadow = this.attachShadow({ mode: 'open' });
        shadow.appendChild(template.content.cloneNode(true));
    }

    connectedCallback() {
        this.#render();
        this.addEventListener('click', this.#handleEvent);
    }

    disconnectedCallback() {
        this.removeEventListener('click', this.#handleEvent);
    }

    #handleEvent(e) {
        const path = e.composedPath();
        const btn = path.find(
            (n) =>
                n instanceof HTMLElement &&
                n.classList &&
                n.classList.contains('basket')
        );
        if (!btn) return;

        const item = path.find(
            (n) => n && n.tagName && n.tagName.toLowerCase() === 'item-element'
        );
        if (!item) return;

        const detail =
            typeof item.getBasketDetail === 'function'
                ? item.getBasketDetail()
                : {
                      name: item.getAttribute('name') || '',
                      price: item.getAttribute('price') || '',
                      image: item.getAttribute('image') || '',
                  };

        this.dispatchEvent(
            new CustomEvent('add-to-basket', {
                detail,
                bubbles: true,
                composed: true,
            })
        );
        console.log('add-to-basket', detail);
    }

    #render() {
        const container = this.shadowRoot.querySelector('.products');
        if (!container) return;

        container.innerHTML = '';

        for (const p of productsData) {
            container.appendChild(this.createCard(p));
        }
    }

    createCard(p) {
        console.log('createCard', p);
        const item = document.createElement('item-element');

        if (p.image) item.setAttribute('image', p.image);
        if (p.name) item.setAttribute('name', p.name);
        if (Array.isArray(p.colours) && p.colours.length)
            item.setAttribute('colours', p.colours.join(','));
        if (Array.isArray(p.sizes) && p.sizes.length)
            item.setAttribute('sizes', p.sizes.join(','));
        if (p.promotion) item.setAttribute('promotion', p.promotion);
        if (p.price) item.setAttribute('price', p.price);
        if (p.button) item.setAttribute('button', p.button);

        return item;
    }
}

customElements.define('product-list', ProductList);
