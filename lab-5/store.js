import { randomHsl } from './helpers.js';

const kształty = 'kształty';

class Store {
    constructor() {
        this.shapes = [];
        this.nextId = 1;
        this.subscribers = [];
        this._load();
    }

    subscribe(fn) {
        this.subscribers.push(fn);
        fn({ type: 'init', state: this.getState() });
        return () => this.unsubscribe(fn);
    }
    unsubscribe(fn) {
        this.subscribers = this.subscribers.filter((s) => s !== fn);
    }

    notify(change) {
        this._save();
        const payload = { ...change, state: this.getState() };
        this.subscribers.forEach((s) => s(payload));
    }

    getState() {
        const shapes = this.shapes.slice();
        const counts = {
            squares: shapes.filter((s) => s.type === 'square').length,
            circles: shapes.filter((s) => s.type === 'circle').length,
        };
        return { shapes, counts };
    }

    addShape(type) {
        const shape = {
            id: String(this.nextId++),
            type,
            color: randomHsl(),
        };
        this.shapes.push(shape);
        this.notify({ type: 'add', item: shape });
        return shape;
    }

    removeShape(id) {
        const idx = this.shapes.findIndex((s) => s.id === id);
        if (idx === -1) return;
        this.shapes.splice(idx, 1);
        this.notify({ type: 'remove', id });
    }

    recolor(type) {
        this.shapes.forEach((s) => {
            if (s.type === type) s.color = randomHsl();
        });
        this.notify({ type: 'recolor', shapeType: type });
    }

    _save() {
        try {
            const payload = { nextId: this.nextId, shapes: this.shapes };
            localStorage.setItem(kształty, JSON.stringify(payload));
        } catch (e) {
            console.error('store save error', e);
        }
    }

    _load() {
        try {
            const raw = localStorage.getItem(kształty);
            if (!raw) return;
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed.shapes)) this.shapes = parsed.shapes;
            if (parsed.nextId) this.nextId = parsed.nextId;
        } catch (e) {
            console.error('store load error', e);
        }
    }
}

export default new Store();
