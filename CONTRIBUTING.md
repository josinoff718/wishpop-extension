# Contributing to WishPop Chrome Extension

Thank you for your interest in contributing to the WishPop Chrome Extension!

## How to Contribute

### Reporting Bugs

1. Check if the bug has already been reported in [Issues](https://github.com/yourusername/wishpop-extension/issues)
2. If not, create a new issue with:
   - Clear title and description
   - Steps to reproduce
   - Expected vs actual behavior
   - Chrome version and OS
   - Screenshots if applicable

### Suggesting Features

1. Check if the feature has already been suggested
2. Create a new issue with:
   - Clear description of the feature
   - Use case and benefits
   - Possible implementation approach

### Code Contributions

1. **Fork the repository**

2. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make your changes**
   - Follow the existing code style
   - Add comments for complex logic
   - Test thoroughly on multiple websites

4. **Test your changes**
   - Load the extension in Chrome
   - Test all affected functionality
   - Check console for errors
   - Test on different websites

5. **Commit your changes**
   ```bash
   git add .
   git commit -m "Add feature: your feature description"
   ```

6. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```

7. **Create a Pull Request**
   - Provide clear description of changes
   - Link related issues
   - Include screenshots if UI changes

## Development Guidelines

### Code Style

- Use meaningful variable and function names
- Use `const` and `let`, avoid `var`
- Use async/await instead of promises when possible
- Add JSDoc comments for functions
- Keep functions small and focused

### File Organization

- Place popup-related code in `popup/`
- Place content scripts in `content/`
- Place background scripts in `background/`
- Place shared utilities in `lib/`

### Commit Messages

Use clear, descriptive commit messages:
- `feat: add price tracking feature`
- `fix: resolve floating button positioning`
- `docs: update installation instructions`
- `refactor: improve product detection logic`
- `style: format popup CSS`

### Testing

Before submitting:
1. Test on multiple e-commerce sites
2. Test all user flows (login, add item, settings)
3. Check for console errors
4. Test with and without authentication
5. Test error handling

## Adding Support for New Websites

To add support for a new e-commerce platform:

1. Add site detector to `content/content.js`:
   ```javascript
   sitename: {
     match: /sitename\.com/i,
     selectors: {
       name: '.product-title',
       price: '.product-price',
       image: '.product-image img'
     }
   }
   ```

2. Test on multiple product pages from the site
3. Document the site in README.md

## Questions?

Feel free to open an issue for questions or reach out via email.

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
