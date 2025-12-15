import loadTemplate from '../utils/loadTemplate.js';

const template = await loadTemplate('./components/item-element.html');

export default class ItemElement extends HTMLElement {
    constructor() {
        super();
        const shadow = this.attachShadow({ mode: 'open' });
        shadow.appendChild(template.content.cloneNode(true));
    }
}
customElements.define('item-element', ItemElement);
