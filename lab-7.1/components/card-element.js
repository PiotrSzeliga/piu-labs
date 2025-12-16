import loadTemplate from '../utils/loadTemplate.js';

const template = await loadTemplate('./components/card-element.html');

export default class CardElement extends HTMLElement {
    constructor() {
        super();
        const shadow = this.attachShadow({ mode: 'open' });
        shadow.appendChild(template.content.cloneNode(true));
    }

    connectedCallback() {
        this.shadowRoot.querySelector('h3').textContent =
        this.getAttribute('title') || 'Untitled';
        this.shadowRoot.querySelector('p').textContent =
        this.getAttribute('desc') || '';
        
        this.shadowRoot.addEventListener('click', this.#handleOnClick);
    }

    disconnectedCallback() {
        this.shadowRoot.removeEventListener('click', this.#handleOnClick);
    }

    static get observedAttributes() {
        return ['title', 'desc'];
    }

    attributeChangedCallback(name, oldVal, newVal) {
        if (oldVal === newVal) return;
        if (name === 'title')
        this.shadowRoot.querySelector('h3').textContent = newVal;
        if (name === 'desc')
        this.shadowRoot.querySelector('p').textContent = newVal;
    }
        // getter i setter dla 'title'
    get title() { return this.getAttribute('title'); }
    set title(value) { this.setAttribute('title', value); }

    // getter i setter dla 'desc'
    get desc() { return this.getAttribute('desc'); }
    set desc(value) { this.setAttribute('desc', value); }

    shuffleDesc() {
        this.desc = this.desc
            .split(' ')
            .sort(() => Math.random() - 0.5)
            .join(' ');
        this.#emitChange()
    }

    #emitChange() {
        this.dispatchEvent(
            new CustomEvent('desc-shuffled', {
            detail: { title: this.title, newDesc: this.desc },
            bubbles: true, // pozwala "płynąć" w górę DOM
            composed: true, // pozwala "przebić się" przez Shadow DOM
            })
        );
    }

    // Koniecznie funkcja strzałkowa, aby zachować kontekst 'this'
    //#handleOnClick = () => this.shuffleDesc();
    #handleOnClick = (e) => {
        if (e.target.tagName === 'P') this.shuffleDesc();
    };

}

customElements.define('card-element', CardElement);