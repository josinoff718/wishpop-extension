// DOM elements
const loginSection = document.getElementById('loginSection');
const loggedInSection = document.getElementById('loggedInSection');
const loginBtn = document.getElementById('loginBtn');
const logoutBtn = document.getElementById('logoutBtn');
const settingsBtn = document.getElementById('settingsBtn');
const userName = document.getElementById('userName');
const itemCount = document.getElementById('itemCount');
const messageBox = document.getElementById('messageBox');

// Quick add form elements
const itemName = document.getElementById('itemName');
const itemUrl = document.getElementById('itemUrl');
const itemPrice = document.getElementById('itemPrice');
const itemNotes = document.getElementById('itemNotes');
const quickAddBtn = document.getElementById('quickAddBtn');
const captureBtn = document.getElementById('captureBtn');
const viewWishlistBtn = document.getElementById('viewWishlistBtn');

// Check authentication status on load
document.addEventListener('DOMContentLoaded', async () => {
  await checkAuthStatus();
  await updateItemCount();
});

// Check if user is authenticated
async function checkAuthStatus() {
  const { user, apiKey } = await chrome.storage.sync.get(['user', 'apiKey']);

  if (user && apiKey) {
    showLoggedInView(user);
  } else {
    showLoginView();
  }
}

// Show login view
function showLoginView() {
  loginSection.style.display = 'block';
  loggedInSection.style.display = 'none';
}

// Show logged in view
function showLoggedInView(user) {
  loginSection.style.display = 'none';
  loggedInSection.style.display = 'block';
  userName.textContent = user.name || user.email || 'User';
}

// Update item count
async function updateItemCount() {
  try {
    const { apiKey, apiUrl } = await chrome.storage.sync.get(['apiKey', 'apiUrl']);

    if (!apiKey) {
      itemCount.textContent = '0';
      return;
    }

    const baseUrl = apiUrl || 'https://wishpop.app';
    const response = await fetch(`${baseUrl}/api/p/688a4a52e2f530af6381409f/function/wishlistApi?action=count`, {
      headers: {
        'Authorization': `Bearer ${apiKey}`
      }
    });

    if (response.ok) {
      const data = await response.json();
      itemCount.textContent = data.count || '0';
    }
  } catch (error) {
    console.error('Error fetching item count:', error);
  }
}

// Show message
function showMessage(message, type = 'success') {
  messageBox.textContent = message;
  messageBox.className = `message-box ${type}`;
  messageBox.style.display = 'block';

  setTimeout(() => {
    messageBox.style.display = 'none';
  }, 3000);
}

// Login button click
loginBtn.addEventListener('click', async () => {
  const { apiUrl } = await chrome.storage.sync.get(['apiUrl']);
  const baseUrl = apiUrl || 'https://wishpop.app';
  chrome.tabs.create({ url: `${baseUrl}/ExtensionAuth?ext=true` });
});

// Settings button click
settingsBtn.addEventListener('click', () => {
  chrome.runtime.openOptionsPage();
});

// Logout button click
logoutBtn.addEventListener('click', async () => {
  await chrome.storage.sync.remove(['user', 'apiKey']);
  showLoginView();
  showMessage('Logged out successfully', 'success');
});

// Quick add button click
quickAddBtn.addEventListener('click', async () => {
  const name = itemName.value.trim();

  if (!name) {
    showMessage('Please enter an item name', 'error');
    return;
  }

  const item = {
    name,
    url: itemUrl.value.trim() || null,
    price: itemPrice.value ? parseFloat(itemPrice.value) : null,
    notes: itemNotes.value.trim() || null,
    source: 'extension_quick_add'
  };

  try {
    const { apiKey, apiUrl } = await chrome.storage.sync.get(['apiKey', 'apiUrl']);

    if (!apiKey) {
      showMessage('Please log in first', 'error');
      return;
    }

    const baseUrl = apiUrl || 'https://wishpop.app';
    const response = await fetch(`${baseUrl}/api/p/688a4a52e2f530af6381409f/function/wishlistApi?action=items`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(item)
    });

    if (response.ok) {
      showMessage('Item added to wishlist!', 'success');
      // Clear form
      itemName.value = '';
      itemUrl.value = '';
      itemPrice.value = '';
      itemNotes.value = '';
      await updateItemCount();
    } else {
      const error = await response.json();
      showMessage(error.message || 'Failed to add item', 'error');
    }
  } catch (error) {
    console.error('Error adding item:', error);
    showMessage('Failed to add item. Please try again.', 'error');
  }
});

// Capture current page
captureBtn.addEventListener('click', async () => {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    // Send message to content script to extract product info
    chrome.tabs.sendMessage(tab.id, { action: 'captureProduct' }, async (response) => {
      if (chrome.runtime.lastError) {
        showMessage('Could not capture page. Try refreshing the page.', 'error');
        return;
      }

      if (response && response.success) {
        showMessage('Product captured and added to wishlist!', 'success');
        await updateItemCount();
      } else {
        showMessage(response?.message || 'Failed to capture product', 'error');
      }
    });
  } catch (error) {
    console.error('Error capturing page:', error);
    showMessage('Failed to capture page', 'error');
  }
});

// View wishlist button
viewWishlistBtn.addEventListener('click', async () => {
  const { apiUrl } = await chrome.storage.sync.get(['apiUrl']);
  const baseUrl = apiUrl || 'https://wishpop.app';
  chrome.tabs.create({ url: `${baseUrl}/wishlist` });
});

// Listen for auth changes from background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'authChanged') {
    checkAuthStatus();
    updateItemCount();
  }
});
