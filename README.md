# Counting Fun for Kids! 🎯

A complete, kid-friendly counting webapp built with pure HTML, CSS, and JavaScript. No frameworks or external dependencies required!

## Features

- **Three Difficulty Levels**: Easy (1-10), Medium (1-20), Hard (1-50)
- **Six Emoji Themes**: Fruits 🍎, Animals 🐶, Stars ⭐, Cars 🚗, Hearts ❤️, Sports ⚽
- **10 Questions Per Session**: Progressive learning with visual feedback
- **Sound Effects**: Optional WebAudio-based success sounds
- **Voice Narration**: Optional SpeechSynthesis for encouragement
- **Confetti Animation**: Canvas-based celebration on correct answers
- **Progress Tracking**: Shows current question and stars earned
- **Settings Persistence**: Saves preferences to localStorage
- **Fully Responsive**: Works great on desktop, tablet, and mobile devices
- **Accessibility**: ARIA labels, keyboard navigation, and high contrast support

## How to Run

### Option 1: Direct File Opening
Simply open `index.html` in any modern web browser:
- Double-click `index.html`, or
- Right-click and select "Open with" your preferred browser

### Option 2: Local Server (Recommended)
For the best experience, use a local web server:

**Using Python:**
```bash
# Python 3
python3 -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000
```

**Using Node.js (http-server):**
```bash
npx http-server -p 8000
```

**Using PHP:**
```bash
php -S localhost:8000
```

Then open `http://localhost:8000` in your browser.

## Game Flow

1. **Home Screen**: Choose difficulty level, theme, and toggle sound/voice settings
2. **Game Screen**: 
   - Click "Show Pictures" to reveal emojis to count
   - Select the correct number from three multiple-choice options
   - Get instant feedback with animations and sounds
3. **End Screen**: View your score and stars, then play again!

## Customization

### Adding New Themes

To add a new emoji theme, edit `app.js`:

1. Add the theme to the `themeEmojis` object:
```javascript
const themeEmojis = {
    // ... existing themes
    'Dinosaurs': '🦕',
    'Space': '🚀'
};
```

2. Add the option to the theme select dropdown in `index.html`:
```html
<option value="Dinosaurs">🦕 Dinosaurs</option>
<option value="Space">🚀 Space</option>
```

### Adjusting Question Count

Change the `totalQuestions` value in `app.js`:
```javascript
session: {
    questionIndex: 0,
    totalQuestions: 15, // Change from 10 to 15
    score: 0,
    stars: 0
}
```

### Modifying Sound Effects

Edit the `playSuccessSound()` and `playWrongSound()` functions in `app.js` to customize frequencies, durations, and patterns.

## Browser Compatibility

- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest, including iOS)
- ✅ Opera (latest)

**Note**: WebAudio and SpeechSynthesis require user interaction to activate (iOS Safari requirement). The app handles this automatically when the Start button is clicked.

## File Structure

```
counting-kids-webapp/
├── index.html          # Main HTML structure
├── styles.css          # All styling and animations
├── app.js              # Game logic, confetti, audio
├── assets/
│   ├── sounds/         # (Optional sound files)
│   └── icons/          # (Optional icon files)
└── README.md           # This file
```

## Technical Details

- **No Dependencies**: Pure vanilla JavaScript, no npm packages or CDNs
- **Confetti**: Custom canvas-based particle system
- **Audio**: WebAudio API for cross-platform sound generation
- **Voice**: SpeechSynthesis API for text-to-speech
- **Storage**: localStorage for settings persistence
- **Responsive**: Mobile-first CSS with flexible layouts
- **Accessibility**: WCAG-compliant with ARIA labels and keyboard support

## License

Free to use and modify for educational purposes.

## Credits

Built with ❤️ for kids learning to count!
