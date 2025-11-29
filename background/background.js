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

  // Create context menu items (on install/update)
  try {
    chrome.contextMenus.removeAll(() => {
      chrome.contextMenus.create({
        id: 'add-to-wishlist',
        title: 'Add to WishPop Wishlist',
        contexts: ['page', 'selection', 'link', 'image']
      });

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
  } catch (error) {
    console.error('Error creating context menus:', error);
  }
});

// Context menu click handler
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  const { apiKey, apiUrl } = await chrome.storage.sync.get(['apiKey', 'apiUrl']);

  if (!apiKey) {
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icons/icon128.png',
      title: 'WishPop',
      message: 'Please log in to WishPop first'
    });
    return;
  }

  let item = null;

  if (info.menuItemId === 'add-to-wishlist') {
    item = {
      name: tab.title,
      url: tab.url,
      source: 'extension_context_menu'
    };
  } else if (info.menuItemId === 'add-selection-to-wishlist') {
    item = {
      name: info.selectionText,
      url: info.pageUrl,
      source: 'extension_context_menu_selection'
    };
  } else if (info.menuItemId === 'add-link-to-wishlist') {
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
        iconUrl: 'icons/icon128.png',
        title: 'WishPop',
        message: 'Item added to your wishlist!'
      });

      // Notify popup to update count
      chrome.runtime.sendMessage({ action: 'itemAdded' }).catch(() => {
        // Ignore if no listener
      });
    } else {
      const error = await response.json().catch(() => ({}));
      chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icons/icon128.png',
        title: 'WishPop Error',
        message: error.message || 'Failed to add item to wishlist'
      });
    }
  } catch (error) {
    console.error('Error adding to wishlist:', error);
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icons/icon128.png',
      title: 'WishPop Error',
      message: 'Failed to add item. Please try again.'
    });
  }
}

// Message handler
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'authenticate') {
    handleAuthentication(message.data);
  } else if (message.action === 'getAuthStatus') {
    chrome.storage.sync.get(['user', 'apiKey'], (data) => {
      sendResponse({
        authenticated: !!(data.user && data.apiKey),
        user: data.user
      });
    });
    return true;
  }
});

// Handle authentication
async function handleAuthentication(data) {
  if (data.user && data.apiKey) {
    await chrome.storage.sync.set({
      user: data.user,
      apiKey: data.apiKey
    });

    chrome.runtime.sendMessage({ action: 'authChanged' }).catch(() => {
      // Ignore if no listener
    });

    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icons/icon128.png',
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
      try {
        await chrome.scripting.executeScript({
          target: { tabId },
          files: ['content/content.js']
        });
      } catch (error) {
        // Ignore errors for pages where we can't inject scripts
      }
    }
  }
});

// Handle keyboard shortcuts
chrome.commands.onCommand.addListener((command) => {
  if (command === 'add-to-wishlist') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, { action: 'captureProduct' });
      }
    });
  }
});
