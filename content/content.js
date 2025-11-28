// WishPop Content Script - Detects products and adds wishlist functionality

let isWishPopActive = false;

// Product detection patterns for common e-commerce sites
const productDetectors = {
  // Amazon
  amazon: {
    match: /amazon\.(com|co\.uk|ca|de|fr|it|es|in|jp)/i,
    selectors: {
      name: '#productTitle, #title',
      price: '.a-price-whole, .a-price .a-offscreen, #priceblock_ourprice, #priceblock_dealprice',
      image: '#landingImage, #imgBlkFront',
      description: '#feature-bullets, #productDescription'
    }
  },

  // Generic e-commerce patterns
  generic: {
    selectors: {
      name: [
        '[itemprop="name"]',
        '.product-title',
        '.product-name',
        'h1.product',
        'h1[class*="product"]',
        'h1[class*="title"]'
      ],
      price: [
        '[itemprop="price"]',
        '.price',
        '[class*="price"]',
        '[data-price]'
      ],
      image: [
        '[itemprop="image"]',
        '.product-image img',
        '.product-img img',
        '[class*="product-image"] img'
      ]
    }
  }
};

// Initialize content script
function init() {
  if (isProductPage()) {
    injectWishlistButton();
  }

  // Listen for messages from popup
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'captureProduct') {
      captureProduct().then(result => {
        sendResponse(result);
      });
      return true; // Keep message channel open for async response
    }
  });
}

// Check if current page is a product page
function isProductPage() {
  const url = window.location.href;

  // Check for common product page patterns
  const productPatterns = [
    /\/product\//i,
    /\/item\//i,
    /\/p\//i,
    /\/dp\//i,
    /\/products\//i
  ];

  const hasProductPattern = productPatterns.some(pattern => pattern.test(url));
  const hasProductSchema = !!document.querySelector('[itemtype*="schema.org/Product"]');
  const hasProductMeta = !!document.querySelector('meta[property="og:type"][content="product"]');

  return hasProductPattern || hasProductSchema || hasProductMeta;
}

// Extract product information from page
function extractProductInfo() {
  const hostname = window.location.hostname;
  let detector = null;

  // Try to match specific site detector
  for (const [site, config] of Object.entries(productDetectors)) {
    if (site !== 'generic' && config.match && config.match.test(hostname)) {
      detector = config;
      break;
    }
  }

  // Fall back to generic detector
  if (!detector) {
    detector = productDetectors.generic;
  }

  const product = {
    name: extractText(detector.selectors.name),
    price: extractPrice(detector.selectors.price),
    image: extractImage(detector.selectors.image),
    url: window.location.href,
    source: hostname,
    description: extractText(detector.selectors.description)
  };

  return product;
}

// Extract text from selectors
function extractText(selectors) {
  if (!selectors) return null;

  const selectorList = Array.isArray(selectors) ? selectors : [selectors];

  for (const selector of selectorList) {
    const element = document.querySelector(selector);
    if (element) {
      return element.textContent.trim();
    }
  }

  return null;
}

// Extract price from selectors
function extractPrice(selectors) {
  if (!selectors) return null;

  const selectorList = Array.isArray(selectors) ? selectors : [selectors];

  for (const selector of selectorList) {
    const element = document.querySelector(selector);
    if (element) {
      let priceText = element.textContent || element.getAttribute('content') || element.getAttribute('data-price');
      if (priceText) {
        // Extract numeric value
        const match = priceText.match(/[\d,]+\.?\d*/);
        if (match) {
          return parseFloat(match[0].replace(/,/g, ''));
        }
      }
    }
  }

  return null;
}

// Extract image URL from selectors
function extractImage(selectors) {
  if (!selectors) return null;

  const selectorList = Array.isArray(selectors) ? selectors : [selectors];

  for (const selector of selectorList) {
    const element = document.querySelector(selector);
    if (element) {
      return element.src || element.getAttribute('data-src') || element.getAttribute('content');
    }
  }

  return null;
}

// Inject floating wishlist button
function injectWishlistButton() {
  // Check if button already exists
  if (document.getElementById('wishpop-float-btn')) return;

  const button = document.createElement('button');
  button.id = 'wishpop-float-btn';
  button.className = 'wishpop-float-btn';
  button.innerHTML = `
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" fill="currentColor"/>
    </svg>
    <span>Add to WishPop</span>
  `;

  button.addEventListener('click', async () => {
    button.disabled = true;
    button.classList.add('loading');
    button.innerHTML = '<span>Adding...</span>';

    const result = await captureProduct();

    if (result.success) {
      button.classList.remove('loading');
      button.classList.add('success');
      button.innerHTML = `
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M20 6L9 17l-5-5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <span>Added!</span>
      `;

      setTimeout(() => {
        button.classList.remove('success');
        button.innerHTML = `
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" fill="currentColor"/>
          </svg>
          <span>Add to WishPop</span>
        `;
        button.disabled = false;
      }, 2000);
    } else {
      button.classList.remove('loading');
      button.classList.add('error');
      button.innerHTML = '<span>Failed - Try again</span>';

      setTimeout(() => {
        button.classList.remove('error');
        button.innerHTML = `
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" fill="currentColor"/>
          </svg>
          <span>Add to WishPop</span>
        `;
        button.disabled = false;
      }, 2000);
    }
  });

  document.body.appendChild(button);
}

// Capture and send product to wishlist
async function captureProduct() {
  try {
    const product = extractProductInfo();

    if (!product.name) {
      return {
        success: false,
        message: 'Could not detect product information on this page'
      };
    }

    // Get API credentials from storage
    const { apiKey, apiUrl } = await chrome.storage.sync.get(['apiKey', 'apiUrl']);

    if (!apiKey) {
      return {
        success: false,
        message: 'Please log in to WishPop first'
      };
    }

    // Send to API
    const baseUrl = apiUrl || 'https://wishpop.app';
    const response = await fetch(`${baseUrl}/api/wishlist/items`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        ...product,
        source: 'extension_capture'
      })
    });

    if (response.ok) {
      return {
        success: true,
        message: 'Product added to wishlist!'
      };
    } else {
      const error = await response.json();
      return {
        success: false,
        message: error.message || 'Failed to add product'
      };
    }
  } catch (error) {
    console.error('Error capturing product:', error);
    return {
      success: false,
      message: 'Failed to add product. Please try again.'
    };
  }
}

// Start the content script
init();
