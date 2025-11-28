# WishPop Chrome Extension

Shop anywhere on the web and seamlessly add items to your WishPop wishlist!

## Features

- **One-Click Add**: Floating button on product pages to instantly add items to your wishlist
- **Smart Detection**: Automatically detects product information (name, price, image, description)
- **Quick Add**: Add items manually from any webpage using the extension popup
- **Context Menu**: Right-click on any page, link, or selection to add to your wishlist
- **Price Tracking**: Keep track of item prices (when integrated with WishPop backend)
- **Multi-Site Support**: Works on Amazon, and generic e-commerce sites
- **Offline Support**: Queue items when offline and sync when back online

## Installation

### From Source (Development)

1. **Download or Clone this Repository**
   ```bash
   git clone https://github.com/yourusername/wishpop-extension.git
   cd wishpop-extension
   ```

2. **Generate Extension Icons**
   - Open `icons/generate-icons.html` in your browser
   - Click "Download All" to get all icon sizes
   - Save the icons in the `icons/` folder

3. **Load Extension in Chrome**
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top-right corner)
   - Click "Load unpacked"
   - Select the `wishpop-extension` folder

4. **Verify Installation**
   - You should see the WishPop icon in your Chrome toolbar
   - Click it to open the popup

### From Chrome Web Store (Coming Soon)

Once published, you'll be able to install directly from the Chrome Web Store.

## Setup

### First-Time Configuration

1. **Click the WishPop extension icon** in your Chrome toolbar

2. **Login to WishPop**
   - Click "Login to WishPop" button
   - You'll be redirected to wishpop.app
   - Log in with your credentials
   - The extension will automatically detect your login

3. **Configure Settings (Optional)**
   - Right-click the extension icon and select "Options"
   - Or click the "Settings" button in the popup
   - Configure your preferences:
     - API URL (for custom instances)
     - Auto-detection of product pages
     - Floating button visibility
     - Notifications

### API Configuration

The extension communicates with the WishPop backend API. By default, it uses `https://wishpop.app`.

If you're running a local or custom instance:
1. Go to extension Options
2. Set your API URL (e.g., `http://localhost:3000`)
3. Save settings

## Usage

### Method 1: Floating Button (Recommended)

When you visit a product page, a floating "Add to WishPop" button appears in the bottom-right corner.

1. Navigate to any product page (Amazon, Etsy, etc.)
2. Click the floating button
3. Product is automatically added to your wishlist!

### Method 2: Extension Popup

1. Click the WishPop extension icon
2. Fill in the "Quick Add" form:
   - Item name (required)
   - URL (optional)
   - Price (optional)
   - Notes (optional)
3. Click "Add to Wishlist"

### Method 3: Capture Current Page

1. Navigate to any product page
2. Click the WishPop extension icon
3. Click "Capture Current Page"
4. Product information is automatically extracted and added

### Method 4: Context Menu

Right-click anywhere on a webpage:
- **Add to WishPop Wishlist**: Adds current page
- **Add "text" to WishPop**: Adds selected text as item name
- **Add Link to WishPop**: Adds the link you right-clicked on

## Supported Websites

The extension includes smart product detection for:

### Fully Supported
- Amazon (all regions: .com, .co.uk, .ca, .de, .fr, etc.)

### Generic Support
- Most e-commerce sites with standard product pages
- Any site with schema.org Product markup
- Sites with Open Graph product metadata

### Manual Add
- Any website using the Quick Add form or context menu

## Project Structure

```
wishpop-extension/
├── manifest.json           # Extension configuration
├── popup/                  # Extension popup UI
│   ├── popup.html
│   ├── popup.css
│   └── popup.js
├── content/                # Content scripts (injected into pages)
│   ├── content.js
│   └── content.css
├── background/             # Background service worker
│   └── background.js
├── options/                # Settings page
│   ├── options.html
│   ├── options.css
│   └── options.js
├── lib/                    # Shared libraries
│   └── api.js             # WishPop API integration
├── icons/                  # Extension icons
│   ├── icon16.png
│   ├── icon32.png
│   ├── icon48.png
│   ├── icon128.png
│   └── generate-icons.html
└── README.md
```

## Development

### Making Changes

1. **Edit the source files** in your preferred code editor

2. **Reload the extension**:
   - Go to `chrome://extensions/`
   - Find WishPop extension
   - Click the refresh icon

3. **Test your changes**:
   - Try adding items from different websites
   - Test the popup, context menu, and floating button
   - Check the browser console for errors

### Debugging

- **Background Script Console**:
  - Go to `chrome://extensions/`
  - Click "Inspect views: background page"

- **Popup Console**:
  - Right-click extension icon → Inspect popup

- **Content Script Console**:
  - Open DevTools on any webpage (F12)
  - Look for WishPop console messages

- **Options Page Console**:
  - Right-click on options page → Inspect

## API Integration

The extension expects the following API endpoints on the WishPop backend:

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/refresh` - Refresh auth token

### Wishlist Items
- `GET /api/wishlist/items` - Get all wishlist items
- `POST /api/wishlist/items` - Add new item
- `GET /api/wishlist/items/:id` - Get specific item
- `PATCH /api/wishlist/items/:id` - Update item
- `DELETE /api/wishlist/items/:id` - Delete item
- `GET /api/wishlist/count` - Get item count

### User
- `GET /api/user/me` - Get current user info

### Expected Item Schema

```json
{
  "name": "Product Name",
  "url": "https://example.com/product",
  "price": 29.99,
  "image": "https://example.com/image.jpg",
  "description": "Product description",
  "notes": "Personal notes",
  "source": "extension_capture",
  "categoryId": "optional-category-id",
  "tags": ["tag1", "tag2"]
}
```

## Privacy & Security

- **Minimal Permissions**: Extension only requests necessary permissions
- **Secure Communication**: All API calls use HTTPS
- **Local Storage**: Only stores user preferences and auth token locally
- **No Tracking**: Extension doesn't track your browsing history
- **Data Collection**: Only collects product info when you explicitly add items

## Troubleshooting

### Extension Not Detecting Products

1. Refresh the page
2. Check if the site is supported
3. Try using "Capture Current Page" button
4. Use manual Quick Add as fallback

### Authentication Issues

1. Clear extension data:
   - Go to Options → "Clear All Local Data"
2. Log in again
3. Check API URL in settings

### Floating Button Not Appearing

1. Go to Options
2. Ensure "Show floating button" is checked
3. Refresh the product page

### API Errors

1. Check your internet connection
2. Verify API URL in settings
3. Check browser console for detailed errors
4. Ensure you're logged in

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## Roadmap

- [ ] Support for more e-commerce platforms
- [ ] Price drop notifications
- [ ] Wishlist organization (categories, tags)
- [ ] Share wishlist functionality
- [ ] Import/export wishlists
- [ ] Firefox and Edge versions
- [ ] Dark mode support

## License

[MIT License](LICENSE)

## Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/wishpop-extension/issues)
- **Documentation**: [WishPop Docs](https://wishpop.app/docs)
- **Email**: support@wishpop.app

## Credits

Built with ❤️ for WishPop users

---

**Version**: 1.0.0
**Last Updated**: 2025-11-28
