
# Page Preview

A lightweight native Web Component for displaying
a preview of an HTML document.

## Features

- Fetches HTML from a URL
- Extracts the document title and first h1
- Uses an open Shadow DOM
- Supports relative URLs
- Handles loading and error states
- Reacts to src attribute changes
- Prevents outdated requests from overwriting results
- Renders external content safely using textContent

## Installation

```bash
npm install @surrealgentleman/page-preview
```

## Usage

Import the package in a browser application using
a bundler or import map:

```javascript
import '@surrealgentleman/page-preview';
```

Then use the custom element:

```html
<page-preview src="/pages/example.html"></page-preview>
```

The import automatically registers the custom element.

## Public API

### Attribute

- `src` — URL of the HTML document to preview.

### Shadow DOM

The component exposes an open Shadow DOM with:

- `[part="link"]`
- `[part="title"]`
- `[part="heading"]`

### States

The host element uses the `data-status` attribute:

- `loading`
- `ready`
- `error`

## Browser requirements

Uses native Custom Elements, Shadow DOM, Fetch API,
DOMParser and AbortController.

The requested HTML must be accessible to browser fetch.
Cross-origin requests require appropriate CORS headers.

## Development

Start the local demo server:

```bash
npm start
```

Open:

http://localhost:8000/demo/

## License

MIT
