# Dark Mode / Light Mode Toggle Feature

## Overview
The ResQ app includes a comprehensive dark/light mode toggle feature with persistent user preferences. **Dark mode is the default** theme.

## Features

### ✅ Default Dark Mode
- App starts in **dark mode** by default
- Provides better visibility in low-light conditions (important for crisis situations)

### ✅ Persistent User Preference
- User's theme choice is saved in `localStorage` (key: `resq-theme`)
- Preference persists across:
  - Browser sessions
  - App restarts
  - Page refreshes
  - Device restarts

### ✅ Theme Toggle Component
- Accessible from:
  - **Login Page**: Top-right corner
  - **Field Responder Page**: Header (next to Sign Out button)
  - **Dashboard Page**: Header (next to title)
- Visual indicator shows current mode:
  - 🌙 Moon icon = Dark mode (click to switch to light)
  - ☀️ Sun icon = Light mode (click to switch to dark)

### ✅ Smooth Transitions
- All theme changes animate smoothly (0.3s transition)
- No jarring color switches

## Technical Implementation

### Theme Service (`src/services/themeService.js`)
```javascript
// Default theme: 'dark'
const DEFAULT_THEME = 'dark';

// Functions:
- getTheme()        // Get current theme from localStorage
- setTheme(theme)    // Save theme and apply it
- toggleTheme()     // Switch between dark/light
- applyTheme(theme) // Apply theme classes to DOM
- initTheme()       // Initialize theme on app load
```

### Theme Application
- Theme classes are applied to:
  - `<html>` element (document.documentElement)
  - `<body>` element
- Classes: `dark-mode` or `light-mode`

### CSS Structure
All components use CSS class selectors:
```css
.light-mode .component {
  /* Light mode styles */
}

.dark-mode .component {
  /* Dark mode styles */
}
```

## Color Scheme

### Dark Mode (Default)
- Background: `#111827` (dark gray)
- Text: `#f9fafb` (light gray)
- Cards: `#1f2937` (slightly lighter gray)
- Borders: `#374151` (medium gray)

### Light Mode
- Background: `#f5f7fa` (light gray)
- Text: `#1f2937` (dark gray)
- Cards: `white`
- Borders: `#e5e7eb` (light gray)

## Components with Theme Support

✅ **All components** support dark/light mode:
- Login Page
- Field Responder Page
- Dashboard Page
- Incident Form
- Pending Incidents
- Network Status Banner
- Theme Toggle Button
- All buttons, inputs, and cards

## Usage

### For Users
1. Click the theme toggle button (🌙 or ☀️) anywhere in the app
2. Theme switches immediately
3. Your preference is saved automatically
4. Next time you open the app, your preferred theme loads

### For Developers
```javascript
import { getTheme, setTheme, toggleTheme } from './services/themeService';

// Get current theme
const currentTheme = getTheme(); // 'dark' or 'light'

// Set specific theme
setTheme('dark');
setTheme('light');

// Toggle theme
const newTheme = toggleTheme(); // Returns 'dark' or 'light'
```

## Storage

- **Key**: `resq-theme`
- **Location**: `localStorage`
- **Values**: `'dark'` or `'light'`
- **Default**: `'dark'` (if no preference saved)

## Benefits

1. **Better Visibility**: Dark mode reduces eye strain in low-light conditions
2. **Battery Saving**: Dark mode saves battery on OLED screens
3. **User Preference**: Users can choose what works best for them
4. **Professional Look**: Modern apps support theme switching
5. **Accessibility**: Helps users with light sensitivity

## Testing

To test the theme feature:

1. **Default Theme**:
   - Clear localStorage: `localStorage.removeItem('resq-theme')`
   - Refresh app → Should load in dark mode

2. **Theme Persistence**:
   - Toggle to light mode
   - Refresh app → Should stay in light mode
   - Close and reopen app → Should remember light mode

3. **Theme Toggle**:
   - Click theme button → Should switch immediately
   - All components should update smoothly

## Files Modified

- `src/services/themeService.js` - Theme management service
- `src/components/ThemeToggle.jsx` - Toggle button component
- `src/components/ThemeToggle.css` - Toggle button styles
- `src/index.css` - Global theme styles (dark mode default)
- `src/App.jsx` - Theme initialization on app load
- All component CSS files - Dark/light mode styles

## Future Enhancements

Potential improvements:
- System theme detection (follow OS preference)
- More theme options (e.g., high contrast mode)
- Theme-specific color schemes for different incident types
- Animated theme transition effects


