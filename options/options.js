// DOM elements
const accountInfo = document.getElementById('accountInfo');
const loginPrompt = document.getElementById('loginPrompt');
const userEmail = document.getElementById('userEmail');
const userPlan = document.getElementById('userPlan');
const loginBtn = document.getElementById('loginBtn');
const logoutBtn = document.getElementById('logoutBtn');

const apiUrl = document.getElementById('apiUrl');
const apiKey = document.getElementById('apiKey');
const toggleApiKey = document.getElementById('toggleApiKey');

const showFloatingButton = document.getElementById('showFloatingButton');
const autoDetect = document.getElementById('autoDetect');
const notifications = document.getElementById('notifications');

const saveBtn = document.getElementById('saveBtn');
const resetBtn = document.getElementById('resetBtn');
const clearDataBtn = document.getElementById('clearDataBtn');
const messageBox = document.getElementById('messageBox');

// Load settings on page load
document.addEventListener('DOMContentLoaded', async () => {
  await loadSettings();
  await checkAuthStatus();
});

// Load settings from storage
async function loadSettings() {
  const settings = await chrome.storage.sync.get([
    'apiUrl',
    'apiKey',
    'showFloatingButton',
    'autoDetect',
    'notifications'
  ]);

  apiUrl.value = settings.apiUrl || 'https://wishpop.app';
  apiKey.value = settings.apiKey || '';
  showFloatingButton.checked = settings.showFloatingButton !== false;
  autoDetect.checked = settings.autoDetect !== false;
  notifications.checked = settings.notifications !== false;
}

// Check authentication status
async function checkAuthStatus() {
  const { user, apiKey: key } = await chrome.storage.sync.get(['user', 'apiKey']);

  if (user && key) {
    accountInfo.style.display = 'block';
    loginPrompt.style.display = 'none';
    userEmail.textContent = user.email || user.name || 'User';
    userPlan.textContent = user.plan || 'Free Plan';
  } else {
    accountInfo.style.display = 'none';
    loginPrompt.style.display = 'block';
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

// Toggle API key visibility
toggleApiKey.addEventListener('click', () => {
  if (apiKey.type === 'password') {
    apiKey.type = 'text';
    toggleApiKey.textContent = 'Hide';
  } else {
    apiKey.type = 'password';
    toggleApiKey.textContent = 'Show';
  }
});

// Login button click
loginBtn.addEventListener('click', async () => {
  const baseUrl = apiUrl.value || 'https://wishpop.app';
  chrome.tabs.create({ url: `${baseUrl}/login?ext=true` });
});

// Logout button click
logoutBtn.addEventListener('click', async () => {
  if (confirm('Are you sure you want to logout?')) {
    await chrome.storage.sync.remove(['user', 'apiKey']);
    await checkAuthStatus();
    showMessage('Logged out successfully', 'success');

    // Notify other parts of extension
    chrome.runtime.sendMessage({ action: 'authChanged' });
  }
});

// Save settings
saveBtn.addEventListener('click', async () => {
  const settings = {
    apiUrl: apiUrl.value.trim() || 'https://wishpop.app',
    apiKey: apiKey.value.trim(),
    showFloatingButton: showFloatingButton.checked,
    autoDetect: autoDetect.checked,
    notifications: notifications.checked
  };

  await chrome.storage.sync.set(settings);
  showMessage('Settings saved successfully!', 'success');

  // Notify background script of settings change
  chrome.runtime.sendMessage({ action: 'settingsChanged', settings });
});

// Reset to defaults
resetBtn.addEventListener('click', async () => {
  if (confirm('Are you sure you want to reset all settings to defaults?')) {
    const defaults = {
      apiUrl: 'https://wishpop.app',
      showFloatingButton: true,
      autoDetect: true,
      notifications: true
    };

    await chrome.storage.sync.set(defaults);
    await loadSettings();
    showMessage('Settings reset to defaults', 'success');
  }
});

// Clear all data
clearDataBtn.addEventListener('click', async () => {
  if (confirm('Are you sure you want to clear all local data? This will log you out and reset all settings.')) {
    await chrome.storage.sync.clear();
    await chrome.storage.local.clear();
    await loadSettings();
    await checkAuthStatus();
    showMessage('All local data cleared', 'success');
  }
});

// Listen for messages (e.g., auth updates)
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'authChanged') {
    checkAuthStatus();
  }
});
