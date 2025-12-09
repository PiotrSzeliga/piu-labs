class Ajax {
    constructor(options = {}) {
        this.defaults = {
            baseURL: options.baseURL || '',
            timeout:
                typeof options.timeout === 'number' ? options.timeout : 5000,
            headers: options.headers || {},
            fetchOptions: options.fetchOptions || {},
        };
    }

    async get(url, options = {}) {
        return this._request('GET', url, null, options);
    }
    async post(url, data = {}, options = {}) {
        return this._request('POST', url, data, options);
    }
    async put(url, data = {}, options = {}) {
        return this._request('PUT', url, data, options);
    }
    async delete(url, options = {}) {
        return this._request('DELETE', url, null, options);
    }

    async _request(method, url, data = null, options = {}) {
        const cfg = this._mergeOptions(this.defaults, options);
        const fullUrl = this._buildUrl(cfg.baseURL, url);
        const headers = this._normalizeHeaders(cfg.headers);

        let body;
        if (data !== null && method !== 'GET' && method !== 'HEAD') {
            const ct =
                this._findHeader(headers, 'content-type') || 'application/json';
            if (!this._findHeader(headers, 'content-type')) {
                headers['Content-Type'] = ct;
            }
            if (ct.includes('application/json')) {
                try {
                    body = JSON.stringify(data);
                } catch (err) {
                    throw new Error(
                        'Failed to encode request body as JSON: ' + err.message
                    );
                }
            } else {
                body = data;
            }
        }

        const controller = new AbortController();
        const signal = controller.signal;
        let timeoutId;
        if (typeof cfg.timeout === 'number' && cfg.timeout > 0) {
            timeoutId = setTimeout(() => controller.abort(), cfg.timeout);
        }

        let externalAbortUnsubscribe = null;
        if (options.signal) {
            if (options.signal.aborted) controller.abort();
            else {
                const onAbort = () => controller.abort();
                options.signal.addEventListener('abort', onAbort, {
                    once: true,
                });
                externalAbortUnsubscribe = () =>
                    options.signal.removeEventListener('abort', onAbort);
            }
        }

        const fetchOpts = {
            method,
            headers,
            body,
            signal,
            ...cfg.fetchOptions,
        };

        let res;
        try {
            res = await fetch(fullUrl, fetchOpts);
        } catch (err) {
            if (timeoutId) clearTimeout(timeoutId);
            if (externalAbortUnsubscribe) externalAbortUnsubscribe();

            if (err.name === 'AbortError') {
                const reason =
                    typeof cfg.timeout === 'number' && cfg.timeout > 0
                        ? 'timeout'
                        : 'abort';
                throw new Error(
                    `Request aborted (${reason}): ${method} ${fullUrl}`
                );
            }
            throw new Error(`Network error: ${err.message}`);
        }

        if (timeoutId) clearTimeout(timeoutId);
        if (externalAbortUnsubscribe) externalAbortUnsubscribe();

        if (!res.ok) {
            let errMsg = `${res.status} ${res.statusText}`;
            try {
                const ct = res.headers.get('Content-Type') || '';
                if (ct.includes('application/json')) {
                    const j = await res.json();
                    if (j && (j.message || j.error)) {
                        errMsg += ' - ' + (j.message || j.error);
                    } else {
                        errMsg += ' - ' + JSON.stringify(j);
                    }
                } else {
                    const t = await res.text();
                    if (t) errMsg += ' - ' + t;
                }
            } catch (e) {}
            const error = new Error(`HTTP Error: ${errMsg}`);
            error.status = res.status;
            error.response = res;
            throw error;
        }

        if (res.status === 204 || res.status === 205) return null;

        const ct = res.headers.get('Content-Type') || '';
        if (ct.includes('application/json')) {
            try {
                return await res.json();
            } catch (err) {
                throw new Error(
                    `Failed to parse JSON response from ${fullUrl}: ${err.message}`
                );
            }
        } else {
            return await res.text();
        }
    }

    _mergeOptions(defaults, options) {
        const out = {
            baseURL:
                typeof options.baseURL !== 'undefined'
                    ? options.baseURL
                    : defaults.baseURL,
            timeout:
                typeof options.timeout !== 'undefined'
                    ? options.timeout
                    : defaults.timeout,
            headers: Object.assign(
                {},
                defaults.headers || {},
                options.headers || {}
            ),
            fetchOptions: Object.assign(
                {},
                defaults.fetchOptions || {},
                options.fetchOptions || {}
            ),
        };
        return out;
    }

    _normalizeHeaders(h = {}) {
        if (!h) return {};
        if (h instanceof Headers) {
            const obj = {};
            for (const [k, v] of h.entries()) obj[k] = v;
            return obj;
        }
        if (Array.isArray(h)) {
            const obj = {};
            h.forEach(([k, v]) => (obj[k] = v));
            return obj;
        }
        return Object.assign({}, h);
    }

    _findHeader(headersObj, name) {
        const lower = name.toLowerCase();
        for (const k of Object.keys(headersObj || {})) {
            if (k.toLowerCase() === lower) return headersObj[k];
        }
        return undefined;
    }

    _buildUrl(base, url) {
        if (!base) return url;
        try {
            const u = new URL(url);
            if (u.protocol === 'http:' || u.protocol === 'https:') return url;
        } catch (e) {}
        if (base.endsWith('/') && url.startsWith('/'))
            return base + url.slice(1);
        if (!base.endsWith('/') && !url.startsWith('/'))
            return base + '/' + url;
        return base + url;
    }
}

export default Ajax;
