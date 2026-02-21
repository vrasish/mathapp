# Math App for Kids! 🎯

A complete, kid-friendly math learning webapp built with pure HTML, CSS, and JavaScript. No frameworks or external dependencies required!

## Features

- **Multiple Math Games**: Counting, Addition, Subtraction, Multiplication, Division, and Number Comparison
- **Three Difficulty Levels**: Easy (1-10), Medium (1-20), Hard (1-50)
- **Six Emoji Themes**: Fruits 🍎, Animals 🐶, Stars ⭐, Cars 🚗, Hearts ❤️, Sports ⚽
- **10 Questions Per Session**: Progressive learning with visual feedback
- **Sound Effects**: Optional WebAudio-based success sounds and balloon pop sounds
- **Voice Narration**: Optional SpeechSynthesis for encouragement
- **Confetti & Balloons**: Interactive canvas-based celebration on correct answers
- **Progress Tracking**: Shows current question, stars earned, and balloons popped
- **Streak System**: Track daily progress with 3-day and 10-day streak milestones
- **Talking Dinosaur Avatar**: Appears every 3 consecutive correct answers
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

1. **Game Selection Screen**: Choose from 6 different math games
2. **Home Screen**: Choose difficulty level, theme, and toggle sound/voice settings
3. **Game Screen**: 
   - Answer math questions with visual emoji aids
   - Select the correct answer from multiple-choice options
   - Get instant feedback with animations and sounds
   - Pop balloons for extra fun!
4. **End Screen**: View your score, stars, balloons popped, and streak, then play again!

## Games Available

- **Counting**: Count the number of emojis displayed
- **Addition**: Add two groups of emojis together
- **Subtraction**: Subtract one group from another
- **Multiplication**: Multiply groups of emojis
- **Division**: Divide emojis into equal groups
- **Comparison**: Compare two numbers using >, <, or =

## Customization

### Adding New Themes

To add a new emoji theme, edit `app.js`:

1. Add the theme to the `themeEmojis` object:
```javascript
const themeEmojis = {
    // ... existing themes
    'Dinosaurs': ['🦕', '🦖', '🦎'],
    'Space': ['🚀', '🛸', '⭐']
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

Edit the `playSuccessSound()`, `playWrongSound()`, and `playPopSound()` functions in `app.js` to customize frequencies, durations, and patterns.

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
- **Confetti & Balloons**: Custom canvas-based particle system with interactive balloon popping
- **Audio**: WebAudio API for cross-platform sound generation
- **Voice**: SpeechSynthesis API for text-to-speech
- **Storage**: localStorage for settings and streak persistence
- **Responsive**: Mobile-first CSS with flexible layouts
- **Accessibility**: WCAG-compliant with ARIA labels and keyboard support

## License

Free to use and modify for educational purposes.

## Credits

Built with ❤️ for kids learning math!
