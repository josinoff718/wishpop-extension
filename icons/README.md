# WishPop Extension Icons

This folder should contain the extension icons in PNG format.

## Required Icons

You need to create the following icon files:

- `icon16.png` - 16x16 pixels
- `icon32.png` - 32x32 pixels
- `icon48.png` - 48x48 pixels
- `icon128.png` - 128x128 pixels

## Design Guidelines

The icons should feature the WishPop brand:
- Use the purple gradient theme (#667eea to #764ba2)
- Include a heart symbol to represent wishlists
- Keep the design simple and recognizable at small sizes

## Creating Icons

You can create these icons using:
- Design tools like Figma, Adobe Illustrator, or Canva
- Online icon generators
- SVG to PNG converters

### Temporary Solution

For development purposes, you can generate simple placeholder icons using this SVG:

```svg
<svg width="128" height="128" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="128" height="128" rx="24" fill="url(#grad)"/>
  <path d="M84.84 44.61a15.5 15.5 0 0 0-21.78 0L64 45.67l-1.06-1.06a15.5 15.5 0 0 0-21.78 21.78l1.06 1.06L64 89.23l21.78-21.78 1.06-1.06a15.5 15.5 0 0 0 0-21.78z" fill="white"/>
</svg>
```

Save this as an SVG file and convert to PNG at the required sizes.
