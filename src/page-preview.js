
const template = document.createElement('template');

template.innerHTML = `
  <style>
    :host {
      display: block;
      font-family: Arial, sans-serif;
      max-width: 420px;
    }

    .card {
      border: 1px solid #d1d5db;
      border-radius: 10px;
      padding: 16px;
      margin: 12px 0;
      background: #ffffff;
    }

    a {
      color: #2563eb;
      text-decoration: none;
      overflow-wrap: anywhere;
    }

    a:hover {
      text-decoration: underline;
    }

    [part="title"] {
      display: block;
      font-weight: bold;
      font-size: 18px;
    }

    [part="heading"] {
      display: block;
      margin-top: 8px;
      color: #374151;
    }

    .status {
      color: #6b7280;
      font-size: 14px;
    }

    .status:empty {
      display: none;
    }

    .url {
      display: block;
      font-size: 12px;
      margin-top: 6px;
      overflow-wrap: anywhere;
    }

    .url:empty {
      display: none;
    }
  </style>

  <div class="card">
    <a part="link">
      <span part="title"></span>
      <span part="heading"></span>
      <span class="url"></span>
    </a>
    <div class="status" role="status"></div>
  </div>
`;

class PagePreview extends HTMLElement {
  static get observedAttributes() {
    return ['src'];
  }

  constructor() {
    super();

    const shadow = this.attachShadow({ mode: 'open' });

    shadow.appendChild(
      template.content.cloneNode(true)
    );

    this.linkElement =
      shadow.querySelector('[part="link"]');

    this.titleElement =
      shadow.querySelector('[part="title"]');

    this.headingElement =
      shadow.querySelector('[part="heading"]');

    this.urlElement =
      shadow.querySelector('.url');

    this.statusElement =
      shadow.querySelector('.status');

    this.controller = null;
    this.requestId = 0;
  }

  connectedCallback() {
    this.loadPage();
  }

  disconnectedCallback() {
    this.cancelRequest();
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (
      name === 'src' &&
      oldValue !== newValue &&
      this.isConnected
    ) {
      this.loadPage();
    }
  }

  cancelRequest() {
    this.requestId++;

    if (this.controller) {
      this.controller.abort();
      this.controller = null;
    }
  }

  clearContent() {
    this.titleElement.textContent = '';
    this.headingElement.textContent = '';
    this.urlElement.textContent = '';
    this.statusElement.textContent = '';

    this.linkElement.removeAttribute('href');
  }

  showError(message) {
    this.clearContent();
    this.statusElement.textContent = message;
    this.setAttribute('data-status', 'error');
  }

  async loadPage() {
    this.cancelRequest();

    const requestId = this.requestId;
    const src = this.getAttribute('src');

    this.clearContent();

    if (!src || !src.trim()) {
      this.showError('Не указан src');
      return;
    }

    let url;

    try {
      url = new URL(src, document.baseURI);
    } catch {
      this.showError('Некорректный URL');
      return;
    }

    this.linkElement.href = url.href;
    this.urlElement.textContent = url.href;

    this.setAttribute('data-status', 'loading');
    this.statusElement.textContent = 'Загрузка...';

    const controller = new AbortController();
    this.controller = controller;

    try {
      const response = await fetch(url.href, {
        signal: controller.signal
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const html = await response.text();

      const doc = new DOMParser().parseFromString(
        html,
        'text/html'
      );

      const title = doc.title.trim();

      const heading =
        doc.querySelector('h1')?.textContent.trim() ?? '';

      if (
        !this.isConnected ||
        requestId !== this.requestId
      ) {
        return;
      }

      this.titleElement.textContent =
        title || 'Название отсутствует';

      this.headingElement.textContent =
        heading || 'Заголовок отсутствует';

      this.statusElement.textContent = '';

      this.setAttribute('data-status', 'ready');
    } catch (error) {
      if (
        !this.isConnected ||
        requestId !== this.requestId
      ) {
        return;
      }

      if (error.name === 'AbortError') {
        return;
      }

      this.showError('Ошибка загрузки страницы');
    } finally {
      if (this.controller === controller) {
        this.controller = null;
      }
    }
  }
}

if (!customElements.get('page-preview')) {
  customElements.define('page-preview', PagePreview);
}
