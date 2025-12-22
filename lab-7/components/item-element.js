import loadTemplate from '../utils/loadTemplate.js';

const template = await loadTemplate('./components/item-element.html');

export default class ItemElement extends HTMLElement {
    static get observedAttributes() {
        return [
            'image',
            'name',
            'colours',
            'sizes',
            'promotion',
            'price',
            'button',
        ];
    }

    constructor() {
        super();
        const shadow = this.attachShadow({ mode: 'open' });
        shadow.appendChild(template.content.cloneNode(true));
    }

    connectedCallback() {
        for (const attr of ItemElement.observedAttributes) {
            if (this.hasAttribute(attr))
                this.attributeChangedCallback(
                    attr,
                    null,
                    this.getAttribute(attr)
                );
        }

        const btn = this.shadowRoot.querySelector('.basket');
        if (btn) {
            btn.textContent = this.buttonText || 'Do koszyka';
        }
    }

    disconnectedCallback() {}

    #ensureLightSlot(name, tag = 'span') {
        let el = this.querySelector(`[slot="${name}"]`);
        if (!el) {
            el = document.createElement(tag);
            el.slot = name;
            if (tag === 'img') el.alt = '';
            this.appendChild(el);
        }
        return el;
    }

    attributeChangedCallback(name, oldVal, newVal) {
        if (oldVal === newVal) return;
        switch (name) {
            case 'name': {
                const el =
                    this.querySelector('[slot="name"]') ||
                    this.#ensureLightSlot('name', 'span');
                el.textContent = newVal || '';
                break;
            }
            case 'price': {
                const el =
                    this.querySelector('[slot="price"]') ||
                    this.#ensureLightSlot('price', 'span');
                el.textContent = newVal || '';
                break;
            }
            case 'promotion': {
                const el =
                    this.querySelector('[slot="promotion"]') ||
                    this.#ensureLightSlot('promotion', 'span');
                el.textContent = newVal || '';
                break;
            }
            case 'image': {
                const img =
                    this.querySelector('[slot="image"]') ||
                    this.#ensureLightSlot('image', 'img');
                if (newVal) img.src = newVal;
                else img.removeAttribute('src');
                break;
            }
            case 'colours': {
                this.#updateColours(newVal);
                break;
            }
            case 'sizes': {
                this.#updateSizes(newVal);
                break;
            }
            case 'button': {
                const btn = this.shadowRoot.querySelector('.basket');
                if (btn) btn.textContent = newVal || 'Do koszyka';
                break;
            }
        }
    }

    #updateColours(value) {
        const container =
            this.querySelector('[slot="colours"]') ||
            this.#ensureLightSlot('colours', 'span');
        container.innerHTML = '';
        if (!value) return;
        const list = value
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean);
        for (const col of list) {
            const sw = document.createElement('button');
            sw.className = 'swatch';
            sw.style.background = col;
            sw.disabled = true;
            container.appendChild(sw);
        }
    }

    #updateSizes(value) {
        const container =
            this.querySelector('[slot="sizes"]') ||
            this.#ensureLightSlot('sizes', 'span');
        container.innerHTML = '';
        if (!value) return;
        const list = value
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean);
        for (const size of list) {
            const el = document.createElement('button');
            el.className = 'size';
            el.disabled = true;
            el.textContent = size;
            container.appendChild(el);
        }
    }

    getBasketDetail() {
        return {
            name: this.name || '',
            price: this.price || '',
            image: this.image || '',
            colours: (this.colours || '')
                .split(',')
                .map((s) => s.trim())
                .filter(Boolean),
            sizes: (this.sizes || '')
                .split(',')
                .map((s) => s.trim())
                .filter(Boolean),
        };
    }

    get name() {
        return this.getAttribute('name');
    }
    set name(v) {
        if (v == null) this.removeAttribute('name');
        else this.setAttribute('name', v);
    }

    get price() {
        return this.getAttribute('price');
    }
    set price(v) {
        if (v == null) this.removeAttribute('price');
        else this.setAttribute('price', v);
    }

    get image() {
        return this.getAttribute('image');
    }
    set image(v) {
        if (v == null) this.removeAttribute('image');
        else this.setAttribute('image', v);
    }

    get colours() {
        return this.getAttribute('colours');
    }
    set colours(v) {
        if (v == null) this.removeAttribute('colours');
        else this.setAttribute('colours', v);
    }

    get sizes() {
        return this.getAttribute('sizes');
    }
    set sizes(v) {
        if (v == null) this.removeAttribute('sizes');
        else this.setAttribute('sizes', v);
    }

    get promotion() {
        return this.getAttribute('promotion');
    }
    set promotion(v) {
        if (v == null) this.removeAttribute('promotion');
        else this.setAttribute('promotion', v);
    }

    get buttonText() {
        return this.getAttribute('button');
    }
    set buttonText(v) {
        if (v == null) this.removeAttribute('button');
        else this.setAttribute('button', v);
    }
}

customElements.define('item-element', ItemElement);
