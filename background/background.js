// WishPop Background Service Worker

// Installation handler
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('WishPop extension installed');

    // Set default settings
    chrome.storage.sync.set({
      apiUrl: 'https://wishpop.app',
      autoDetect: true,
      showFloatingButton: true
    });

    // Open welcome page
    chrome.tabs.create({
      url: 'https://wishpop.app/ExtensionWelcome'
    });
  } else if (details.reason === 'update') {
    console.log('WishPop extension updated');
  }
});

// Context menu items
chrome.runtime.onInstalled.addListener(() => {
  // Create context menu for adding current page to wishlist
  chrome.contextMenus.create({
    id: 'add-to-wishlist',
    title: 'Add to WishPop Wishlist',
    contexts: ['page', 'selection', 'link', 'image']
  });

  // Create context menu for adding selected text/link
  chrome.contextMenus.create({
    id: 'add-selection-to-wishlist',
    title: 'Add "%s" to WishPop',
    contexts: ['selection']
  });

  chrome.contextMenus.create({
    id: 'add-link-to-wishlist',
    title: 'Add Link to WishPop',
    contexts: ['link']
  });
});

// Context menu click handler
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  const { apiKey, apiUrl } = await chrome.storage.sync.get(['apiKey', 'apiUrl']);

  if (!apiKey) {
    chrome.notifications.create({
      type: 'basic',
      iconUrl: '../icons/icon128.png',
      title: 'WishPop',
      message: 'Please log in to WishPop first'
    });
    return;
  }

  let item = null;

  if (info.menuItemId === 'add-to-wishlist') {
    // Add current page
    item = {
      name: tab.title,
      url: tab.url,
      source: 'extension_context_menu'
    };
  } else if (info.menuItemId === 'add-selection-to-wishlist') {
    // Add selected text
    item = {
      name: info.selectionText,
      url: info.pageUrl,
      source: 'extension_context_menu_selection'
    };
  } else if (info.menuItemId === 'add-link-to-wishlist') {
    // Add link
    item = {
      name: info.linkUrl,
      url: info.linkUrl,
      source: 'extension_context_menu_link'
    };
  }

  if (item) {
    await addToWishlist(item, apiKey, apiUrl);
  }
});

// Add item to wishlist
async function addToWishlist(item, apiKey, apiUrl) {
  try {
    const baseUrl = apiUrl || 'https://wishpop.app';
    const response = await fetch(`${baseUrl}/api/p/688a4a52e2f530af6381409f/function/wishlistApi`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(item)
    });

    if (response.ok) {
      chrome.notifications.create({
        type: 'basic',
        iconUrl: '../icons/icon128.png',
        title: 'WishPop',
        message: 'Item added to your wishlist!'
      });

      // Notify popup to update count
      chrome.runtime.sendMessage({ action: 'itemAdded' });
    } else {
      const error = await response.json();
      chrome.notifications.create({
        type: 'basic',
        iconUrl: '../icons/icon128.png',
        title: 'WishPop Error',
        message: error.message || 'Failed to add item to wishlist'
      });
    }
  } catch (error) {
    console.error('Error adding to wishlist:', error);
    chrome.notifications.create({
      type: 'basic',
      iconUrl: '../icons/icon128.png',
      title: 'WishPop Error',
      message: 'Failed to add item. Please try again.'
    });
  }
}

// Message handler
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'authenticate') {
    // Handle authentication
    handleAuthentication(message.data);
  } else if (message.action === 'getAuthStatus') {
    // Return auth status
    chrome.storage.sync.get(['user', 'apiKey'], (data) => {
      sendResponse({
        authenticated: !!(data.user && data.apiKey),
        user: data.user
      });
    });
    return true; // Keep channel open for async response
  }
});

// Handle authentication
async function handleAuthentication(data) {
  if (data.user && data.apiKey) {
    await chrome.storage.sync.set({
      user: data.user,
      apiKey: data.apiKey
    });

    // Notify popup of auth change
    chrome.runtime.sendMessage({ action: 'authChanged' });

    chrome.notifications.create({
      type: 'basic',
      iconUrl: '../icons/icon128.png',
      title: 'WishPop',
      message: `Welcome back, ${data.user.name || data.user.email}!`
    });
  }
}

// Listen for URL changes to detect product pages
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    const { showFloatingButton } = await chrome.storage.sync.get(['showFloatingButton']);

    if (showFloatingButton !== false) {
      // Check if it's a product page and inject button if needed
      chrome.scripting.executeScript({
        target: { tabId },
        files: ['content/content.js']
      }).catch(() => {
        // Ignore errors for pages where we can't inject scripts
      });
    }
  }
});

// Handle keyboard shortcuts (if configured)
chrome.commands.onCommand.addListener((command) => {
  if (command === 'add-to-wishlist') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, { action: 'captureProduct' });
      }
    });
  }
});
