/* ============================================
   Kid-Friendly Counting Webapp - JavaScript
   ============================================ */

// ============================================
// App State Management
// ============================================

const appState = {
    screen: 'gameSelect', // 'gameSelect' | 'home' | 'game' | 'end'
    currentGame: null, // 'counting' | 'addition' | 'subtraction' | 'multiplication' | 'division' | 'comparison'
    settings: {
        levelMax: 10, // Easy: 10, Medium: 20, Hard: 50
        theme: 'Fruits',
        soundOn: true,
        voiceOn: true
    },
    session: {
        questionIndex: 0,
        totalQuestions: 10,
        score: 0,
        stars: 0,
        totalBalloonsPopped: 0,
        questionsCompletedToday: 0, // Track questions completed today
        consecutiveStars: 0 // Track consecutive correct answers for avatar
    },
    currentQuestion: {
        count: 0,
        choices: [],
        correctChoice: 0,
        revealed: false,
        // For addition/subtraction/multiplication/division games
        group1: 0,
        group2: 0,
        total: 0,
        // Selected emoji for this question (same throughout the question)
        emoji: null,
        // For comparison game
        number1: 0,
        number2: 0,
        correctOperator: '' // '>', '<', or '='
    }
};

// Theme to Emoji Mapping (arrays for variety!)
const themeEmojis = {
    'Fruits': ['🍎', '🍌', '🍇', '🍊', '🍓', '🍑', '🥝', '🍉', '🍒', '🍐', '🥭', '🍋'],
    'Animals': ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵'],
    'Stars': ['⭐', '🌟', '✨', '💫'],
    'Cars': ['🚗', '🚕', '🚙', '🚌', '🚎', '🏎️', '🚓', '🚑', '🚒', '🚐', '🛻', '🚚', '🚛', '🚜'],
    'Hearts': ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💖', '💗', '💓', '💕', '💞', '💟'],
    'Sports': ['⚽', '🏀', '🏈', '⚾', '🎾', '🏐', '🏉', '🎱', '🏓', '🏸', '🥊', '🥋', '🥅', '⛳', '🏹']
};

/**
 * Get a random emoji from a theme
 */
function getRandomEmoji(theme) {
    const emojis = themeEmojis[theme] || themeEmojis['Fruits'];
    return emojis[Math.floor(Math.random() * emojis.length)];
}

// ============================================
// DOM Elements
// ============================================

const elements = {
    // Screens
    gameSelectScreen: document.getElementById('gameSelectScreen'),
    homeScreen: document.getElementById('homeScreen'),
    gameScreen: document.getElementById('gameScreen'),
    endScreen: document.getElementById('endScreen'),
    
    // Game selection
    countingGameBtn: document.getElementById('countingGameBtn'),
    additionGameBtn: document.getElementById('additionGameBtn'),
    subtractionGameBtn: document.getElementById('subtractionGameBtn'),
    multiplicationGameBtn: document.getElementById('multiplicationGameBtn'),
    divisionGameBtn: document.getElementById('divisionGameBtn'),
    comparisonGameBtn: document.getElementById('comparisonGameBtn'),
    
    // Home screen controls
    levelSelect: document.getElementById('levelSelect'),
    themeSelect: document.getElementById('themeSelect'),
    soundToggle: document.getElementById('soundToggle'),
    voiceToggle: document.getElementById('voiceToggle'),
    startButton: document.getElementById('startButton'),
    
    // Game screen elements
    gameTitle: document.getElementById('gameTitle'),
    homeButton: document.getElementById('homeButton'),
    homeButtonGameSelect: document.getElementById('homeButtonGameSelect'),
    homeButtonEnd: document.getElementById('homeButtonEnd'),
    progressText: document.getElementById('progressText'),
    starsDisplay: document.getElementById('starsDisplay'),
    balloonsDisplay: document.getElementById('balloonsDisplay'),
    showPicturesButton: document.getElementById('showPicturesButton'),
    picturesContainer: document.getElementById('picturesContainer'),
    additionGroups: document.getElementById('additionGroups'),
    comparisonNumbers: document.getElementById('comparisonNumbers'),
    hintText: document.getElementById('hintText'),
    choicesContainer: document.getElementById('choicesContainer'),
    
    // End screen elements
    finalScore: document.getElementById('finalScore'),
    finalStars: document.getElementById('finalStars'),
    finalBalloons: document.getElementById('finalBalloons'),
    streakItem: document.getElementById('streakItem'),
    finalStreak: document.getElementById('finalStreak'),
    playAgainButton: document.getElementById('playAgainButton'),
    backToGamesButton: document.getElementById('backToGamesButton'),
    
    // Overlays
    successOverlay: document.getElementById('successOverlay'),
    confettiCanvas: document.getElementById('confettiCanvas'),
    avatarOverlay: document.getElementById('avatarOverlay')
};

// ============================================
// Audio Context (for WebAudio)
// ============================================

let audioContext = null;

/**
 * Initialize audio context (must be called after user interaction)
 */
function initAudioContext() {
    if (!audioContext) {
        try {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            console.warn('WebAudio not supported:', e);
        }
    }
    // Resume if suspended (required for iOS Safari)
    if (audioContext && audioContext.state === 'suspended') {
        audioContext.resume();
    }
}

/**
 * Play success sound using WebAudio
 */
function playSuccessSound() {
    if (!appState.settings.soundOn || !audioContext) return;
    
    try {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        // Play a pleasant ascending melody
        oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime); // C5
        oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.1); // E5
        oscillator.frequency.setValueAtTime(783.99, audioContext.currentTime + 0.2); // G5
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.4);
    } catch (e) {
        console.warn('Error playing success sound:', e);
    }
}

/**
 * Play gentle wrong sound (optional, very soft)
 */
function playWrongSound() {
    if (!appState.settings.soundOn || !audioContext) return;
    
    try {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        // Very gentle low tone
        oscillator.frequency.setValueAtTime(200, audioContext.currentTime);
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.2);
    } catch (e) {
        console.warn('Error playing wrong sound:', e);
    }
}

/**
 * Play balloon pop sound
 */
function playPopSound() {
    if (!appState.settings.soundOn || !audioContext) return;
    
    try {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        // Quick pop sound - high frequency that drops quickly
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(200, audioContext.currentTime + 0.1);
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.1);
    } catch (e) {
        console.warn('Error playing pop sound:', e);
    }
}

// ============================================
// Speech Synthesis (Voice)
// ============================================

/**
 * Speak text using SpeechSynthesis API
 */
function speak(text) {
    if (!appState.settings.voiceOn || !('speechSynthesis' in window)) {
        return;
    }
    
    try {
        // Cancel any ongoing speech
        window.speechSynthesis.cancel();
        
        const utterance = new SpeechSynthesisUtterance(text);
        // Very exciting and enthusiastic settings!
        utterance.rate = 1.0; // Normal speed for excitement
        utterance.pitch = 1.3; // Higher pitch for excitement and energy!
        utterance.volume = 1.0; // Full volume for celebration!
        
        // Try to find the most natural, warm-sounding voice
        const voices = window.speechSynthesis.getVoices();
        
        // Priority order: look for enthusiastic, expressive voices
        let preferredVoice = voices.find(voice => 
            voice.lang.startsWith('en') && 
            (voice.name.includes('Samantha') || 
             voice.name.includes('Karen') ||
             voice.name.includes('Victoria') ||
             voice.name.includes('Alex') ||
             voice.name.includes('Siri') ||
             voice.name.includes('Enhanced') ||
             voice.name.includes('Premium'))
        );
        
        // Fallback: any expressive female voice
        if (!preferredVoice) {
            preferredVoice = voices.find(voice => 
                voice.lang.startsWith('en') && 
                (voice.name.toLowerCase().includes('female') || 
                 voice.name.toLowerCase().includes('woman') ||
                 voice.name.toLowerCase().includes('enhanced') ||
                 voice.localService === true) // Prefer local voices (often more natural)
            );
        }
        
        // Final fallback: any English voice
        if (!preferredVoice) {
            preferredVoice = voices.find(voice => voice.lang.startsWith('en'));
        }
        
        if (preferredVoice) {
            utterance.voice = preferredVoice;
        }
        
        window.speechSynthesis.speak(utterance);
    } catch (e) {
        console.warn('Speech synthesis error:', e);
    }
}

// Load voices when available (some browsers need this)
// Pre-load voices to ensure best voice selection
if ('speechSynthesis' in window) {
    // Force voice loading
    const loadVoices = () => {
        const voices = window.speechSynthesis.getVoices();
        // Voices are now available
    };
    
    window.speechSynthesis.onvoiceschanged = loadVoices;
    // Just load voices without speaking (no user activation needed for getVoices)
    loadVoices();
}

// ============================================
// Confetti Animation
// ============================================

let confettiParticles = [];
let balloonParticles = [];
let confettiAnimationId = null;
let balloonsPopped = 0; // Track how many balloons were popped

/**
 * Initialize confetti canvas size
 */
function initConfettiCanvas() {
    const canvas = elements.confettiCanvas;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

/**
 * Create confetti particles and balloons
 */
function createConfetti() {
    const canvas = elements.confettiCanvas;
    const ctx = canvas.getContext('2d');
    confettiParticles = [];
    balloonParticles = [];
    
    const colors = ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE'];
    const balloonColors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFD700', '#FFA07A', '#98D8C8', '#BB8FCE', '#FF69B4'];
    const particleCount = 250; // Even more confetti
    const balloonCount = 20; // More balloons
    
    // Create confetti particles
    for (let i = 0; i < particleCount; i++) {
        confettiParticles.push({
            x: Math.random() * canvas.width,
            y: -10 - Math.random() * 100,
            vx: (Math.random() - 0.5) * 2,
            vy: Math.random() * 3 + 2,
            size: Math.random() * 8 + 4,
            color: colors[Math.floor(Math.random() * colors.length)],
            rotation: Math.random() * Math.PI * 2,
            rotationSpeed: (Math.random() - 0.5) * 0.2,
            shape: Math.random() > 0.5 ? 'rect' : 'circle',
            type: 'confetti'
        });
    }
    
    // Create balloon particles (float upward) - BIGGER BALLOONS!
    for (let i = 0; i < balloonCount; i++) {
        balloonParticles.push({
            x: Math.random() * canvas.width,
            y: canvas.height + 20 + Math.random() * 50, // Start from bottom
            vx: (Math.random() - 0.5) * 0.5, // Slow horizontal drift
            vy: -(Math.random() * 1.5 + 1), // Float upward
            size: Math.random() * 40 + 50, // MUCH bigger balloons (50-90px)
            color: balloonColors[Math.floor(Math.random() * balloonColors.length)],
            rotation: Math.random() * Math.PI * 2,
            rotationSpeed: (Math.random() - 0.5) * 0.1,
            stringLength: Math.random() * 40 + 30, // Longer strings for bigger balloons
            type: 'balloon'
        });
    }
}

/**
 * Check if a point is inside a balloon
 */
function isPointInBalloon(x, y, balloon) {
    // Calculate distance from point to balloon center
    const dx = x - balloon.x;
    const dy = y - balloon.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // Check if point is within the balloon's radius (using the larger radius)
    const radius = Math.max(balloon.size / 2, balloon.size / 1.3);
    return distance <= radius;
}

/**
 * Draw a balloon
 */
function drawBalloon(ctx, balloon) {
    ctx.save();
    ctx.translate(balloon.x, balloon.y);
    ctx.rotate(balloon.rotation);
    
    // Draw balloon string (line from balloon to bottom)
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, balloon.size / 2);
    ctx.lineTo(0, balloon.size / 2 + balloon.stringLength);
    ctx.stroke();
    
    // Draw balloon (oval shape)
    ctx.fillStyle = balloon.color;
    ctx.beginPath();
    ctx.ellipse(0, 0, balloon.size / 2, balloon.size / 1.3, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Add highlight for 3D effect
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.beginPath();
    ctx.ellipse(-balloon.size / 6, -balloon.size / 6, balloon.size / 6, balloon.size / 8, 0, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.restore();
}

/**
 * Create pop particles when balloon is popped
 */
function createPopParticles(x, y, color) {
    const popParticles = [];
    const particleCount = 8;
    
    for (let i = 0; i < particleCount; i++) {
        const angle = (Math.PI * 2 * i) / particleCount;
        const speed = Math.random() * 3 + 2;
        popParticles.push({
            x: x,
            y: y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            size: Math.random() * 4 + 2,
            color: color,
            life: 0.3 // Duration in seconds
        });
    }
    
    return popParticles;
}

let popParticles = [];

/**
 * Handle balloon pop
 */
function popBalloon(balloon, index) {
    // Create pop particles
    const particles = createPopParticles(balloon.x, balloon.y, balloon.color);
    popParticles.push(...particles);
    
    // Play pop sound
    playPopSound();
    
    // Increment popped balloons counter (for this question)
    balloonsPopped++;
    
    // Increment total balloons popped (for the session)
    appState.session.totalBalloonsPopped++;
    
    // Update balloon display immediately
    if (elements.balloonsDisplay) {
        elements.balloonsDisplay.textContent = `🎈 ${appState.session.totalBalloonsPopped}`;
    }
    
    // Remove balloon from array
    balloonParticles.splice(index, 1);
}

/**
 * Animate confetti particles and balloons
 */
function animateConfetti() {
    const canvas = elements.confettiCanvas;
    const ctx = canvas.getContext('2d');
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    let activeParticles = 0;
    let activeBalloons = 0;
    
    // Animate confetti (falling down)
    confettiParticles.forEach(particle => {
        // Update position
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.rotation += particle.rotationSpeed;
        
        // Apply gravity
        particle.vy += 0.15;
        
        // Draw confetti particle
        ctx.save();
        ctx.translate(particle.x, particle.y);
        ctx.rotate(particle.rotation);
        ctx.fillStyle = particle.color;
        
        if (particle.shape === 'rect') {
            ctx.fillRect(-particle.size / 2, -particle.size / 2, particle.size, particle.size);
        } else {
            ctx.beginPath();
            ctx.arc(0, 0, particle.size / 2, 0, Math.PI * 2);
            ctx.fill();
        }
        
        ctx.restore();
        
        // Check if still on screen
        if (particle.y < canvas.height + 50 && particle.x > -50 && particle.x < canvas.width + 50) {
            activeParticles++;
        }
    });
    
    // Animate balloons (floating up)
    balloonParticles.forEach((balloon, index) => {
        // Update position
        balloon.x += balloon.vx;
        balloon.y += balloon.vy;
        balloon.rotation += balloon.rotationSpeed;
        
        // Slight upward drift (balloons float)
        balloon.vy -= 0.01; // Gradually slow down
        
        // Draw balloon
        drawBalloon(ctx, balloon);
        
        // Check if still on screen
        if (balloon.y > -100 && balloon.x > -100 && balloon.x < canvas.width + 100) {
            activeBalloons++;
        }
    });
    
    // Animate and draw pop particles
    popParticles = popParticles.filter(particle => {
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.vy += 0.2; // Gravity
        particle.life -= 0.016; // ~60fps
        
        // Draw pop particle
        if (particle.life > 0) {
            ctx.save();
            ctx.globalAlpha = particle.life / 0.3;
            ctx.fillStyle = particle.color;
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
        
        return particle.life > 0;
    });
    
    if (activeParticles > 0 || activeBalloons > 0) {
        confettiAnimationId = requestAnimationFrame(animateConfetti);
    } else {
        // Clear canvas when done
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        confettiParticles = [];
        balloonParticles = [];
    }
}

/**
 * Handle canvas click/touch for balloon popping
 */
function handleCanvasClick(event) {
    event.preventDefault();
    const canvas = elements.confettiCanvas;
    const rect = canvas.getBoundingClientRect();
    
    // Get click/touch coordinates relative to viewport
    let clientX, clientY;
    if (event.touches && event.touches.length > 0) {
        clientX = event.touches[0].clientX;
        clientY = event.touches[0].clientY;
    } else {
        clientX = event.clientX;
        clientY = event.clientY;
    }
    
    // Convert to canvas coordinates (accounting for canvas internal size vs display size)
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (clientX - rect.left) * scaleX;
    const y = (clientY - rect.top) * scaleY;
    
    // Check if click is on any balloon (check in reverse to pop the topmost one)
    for (let i = balloonParticles.length - 1; i >= 0; i--) {
        if (isPointInBalloon(x, y, balloonParticles[i])) {
            popBalloon(balloonParticles[i], i);
            break; // Only pop one balloon per click
        }
    }
}

/**
 * Show balloon popping score
 */
function showBalloonScore() {
    const message = `You popped ${balloonsPopped} balloon${balloonsPopped !== 1 ? 's' : ''}!`;
    elements.hintText.textContent = message;
    elements.hintText.classList.remove('error');
    elements.hintText.style.color = 'var(--primary-color)';
    elements.hintText.style.fontSize = 'clamp(1.2rem, 5vw, 1.8rem)';
    elements.hintText.style.fontWeight = 'bold';
    
    // Speak the score
    if (appState.settings.voiceOn) {
        speak(message);
    }
}

/**
 * Start confetti animation with balloons
 */
function startConfetti() {
    // Reset popped balloons counter
    balloonsPopped = 0;
    
    createConfetti();
    if (confettiAnimationId) {
        cancelAnimationFrame(confettiAnimationId);
    }
    
    // Enable pointer events on canvas for balloon popping
    elements.confettiCanvas.classList.add('interactive');
    
    // Add event listeners for clicking/tapping balloons
    elements.confettiCanvas.addEventListener('click', handleCanvasClick);
    elements.confettiCanvas.addEventListener('touchstart', handleCanvasClick, { passive: true });
    
    // Show instructions to tap balloons
    elements.hintText.textContent = '🎈 Tap the balloons to pop them! 🎈';
    elements.hintText.classList.remove('error');
    elements.hintText.style.color = 'var(--secondary-color)';
    elements.hintText.style.fontSize = 'clamp(1.1rem, 4vw, 1.5rem)';
    elements.hintText.style.fontWeight = 'bold';
    
    animateConfetti();
    
    // Stop after 13 seconds (long enough for kids to pop all balloons!)
    setTimeout(() => {
        if (confettiAnimationId) {
            cancelAnimationFrame(confettiAnimationId);
            confettiAnimationId = null;
        }
        
        // Disable pointer events and remove listeners
        elements.confettiCanvas.classList.remove('interactive');
        elements.confettiCanvas.removeEventListener('click', handleCanvasClick);
        elements.confettiCanvas.removeEventListener('touchstart', handleCanvasClick);
        
        const ctx = elements.confettiCanvas.getContext('2d');
        ctx.clearRect(0, 0, elements.confettiCanvas.width, elements.confettiCanvas.height);
        confettiParticles = [];
        balloonParticles = [];
        popParticles = [];
    }, 13000);
}

// ============================================
// Question Generation
// ============================================

/**
 * Generate a random integer between min and max (inclusive)
 */
function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Shuffle array using Fisher-Yates algorithm
 */
function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

/**
 * Generate a new counting question
 */
function generateCountingQuestion() {
    const levelMax = appState.settings.levelMax;
    const count = randomInt(1, levelMax);
    
    // Generate distractors
    const choices = [count];
    
    // First distractor: count ± 1 (within bounds)
    let distractor1 = count + (Math.random() > 0.5 ? 1 : -1);
    if (distractor1 < 1) distractor1 = count + 1;
    if (distractor1 > levelMax) distractor1 = count - 1;
    if (distractor1 < 1) distractor1 = 2; // Fallback
    choices.push(distractor1);
    
    // Second distractor: count ± random(2..4) within bounds
    let distractor2 = count + (Math.random() > 0.5 ? 1 : -1) * randomInt(2, 4);
    if (distractor2 < 1) distractor2 = count + randomInt(2, 4);
    if (distractor2 > levelMax) distractor2 = count - randomInt(2, 4);
    if (distractor2 < 1) distractor2 = Math.min(levelMax, count + 2);
    if (distractor2 > levelMax) distractor2 = Math.max(1, count - 2);
    
    // Ensure all choices are unique
    while (choices.includes(distractor2)) {
        distractor2 = randomInt(1, levelMax);
    }
    choices.push(distractor2);
    
    // Shuffle choices
    const shuffledChoices = shuffleArray(choices);
    const correctIndex = shuffledChoices.indexOf(count);
    
    // Pick one random emoji for this question (will be same throughout)
    const selectedEmoji = getRandomEmoji(appState.settings.theme);
    
    appState.currentQuestion = {
        count: count,
        choices: shuffledChoices,
        correctChoice: correctIndex,
        revealed: false,
        emoji: selectedEmoji
    };
}

/**
 * Generate a new addition question
 */
function generateAdditionQuestion() {
    const levelMax = appState.settings.levelMax;
    const maxPerGroup = Math.floor(levelMax / 2); // Split max between two groups
    
    // Generate two groups that add up to something reasonable
    const group1 = randomInt(1, Math.min(maxPerGroup, 10));
    const group2 = randomInt(1, Math.min(maxPerGroup, 10));
    const total = group1 + group2;
    
    // Ensure total doesn't exceed levelMax
    if (total > levelMax) {
        const adjustedGroup1 = Math.floor(total / 2);
        const adjustedGroup2 = total - adjustedGroup1;
        appState.currentQuestion.group1 = adjustedGroup1;
        appState.currentQuestion.group2 = adjustedGroup2;
        appState.currentQuestion.total = total;
    } else {
        appState.currentQuestion.group1 = group1;
        appState.currentQuestion.group2 = group2;
        appState.currentQuestion.total = total;
    }
    
    // Generate distractors
    const choices = [total];
    
    // First distractor: total ± 1 (within bounds)
    let distractor1 = total + (Math.random() > 0.5 ? 1 : -1);
    if (distractor1 < 1) distractor1 = total + 1;
    if (distractor1 > levelMax * 2) distractor1 = total - 1;
    if (distractor1 < 1) distractor1 = 2;
    choices.push(distractor1);
    
    // Second distractor: total ± random(2..4)
    let distractor2 = total + (Math.random() > 0.5 ? 1 : -1) * randomInt(2, 4);
    if (distractor2 < 1) distractor2 = total + randomInt(2, 4);
    if (distractor2 > levelMax * 2) distractor2 = total - randomInt(2, 4);
    if (distractor2 < 1) distractor2 = Math.min(levelMax * 2, total + 2);
    if (distractor2 > levelMax * 2) distractor2 = Math.max(1, total - 2);
    
    // Ensure all choices are unique
    while (choices.includes(distractor2)) {
        distractor2 = randomInt(1, levelMax * 2);
    }
    choices.push(distractor2);
    
    // Shuffle choices
    const shuffledChoices = shuffleArray(choices);
    const correctIndex = shuffledChoices.indexOf(total);
    
    // Pick one random emoji for this question (will be same throughout)
    const selectedEmoji = getRandomEmoji(appState.settings.theme);
    
    appState.currentQuestion.choices = shuffledChoices;
    appState.currentQuestion.correctChoice = correctIndex;
    appState.currentQuestion.revealed = false;
    appState.currentQuestion.emoji = selectedEmoji;
}

/**
 * Generate a new subtraction question
 */
function generateSubtractionQuestion() {
    const levelMax = appState.settings.levelMax;
    const maxTotal = Math.min(levelMax, 20);
    
    // Generate total (larger number) and subtract (smaller number)
    const total = randomInt(5, maxTotal);
    const subtract = randomInt(1, Math.min(total - 1, 10));
    const result = total - subtract;
    
    appState.currentQuestion.group1 = total;
    appState.currentQuestion.group2 = subtract;
    appState.currentQuestion.total = result;
    
    // Generate distractors
    const choices = [result];
    
    // First distractor: result ± 1
    let distractor1 = result + (Math.random() > 0.5 ? 1 : -1);
    if (distractor1 < 0) distractor1 = result + 1;
    if (distractor1 > levelMax) distractor1 = result - 1;
    if (distractor1 < 0) distractor1 = 1;
    choices.push(distractor1);
    
    // Second distractor: result ± random(2..4)
    let distractor2 = result + (Math.random() > 0.5 ? 1 : -1) * randomInt(2, 4);
    if (distractor2 < 0) distractor2 = result + randomInt(2, 4);
    if (distractor2 > levelMax) distractor2 = result - randomInt(2, 4);
    if (distractor2 < 0) distractor2 = Math.min(levelMax, result + 2);
    if (distractor2 > levelMax) distractor2 = Math.max(0, result - 2);
    
    // Ensure all choices are unique
    while (choices.includes(distractor2)) {
        distractor2 = randomInt(0, levelMax);
    }
    choices.push(distractor2);
    
    // Shuffle choices
    const shuffledChoices = shuffleArray(choices);
    const correctIndex = shuffledChoices.indexOf(result);
    
    // Pick one random emoji for this question (will be same throughout)
    const selectedEmoji = getRandomEmoji(appState.settings.theme);
    
    appState.currentQuestion.choices = shuffledChoices;
    appState.currentQuestion.correctChoice = correctIndex;
    appState.currentQuestion.revealed = false;
    appState.currentQuestion.emoji = selectedEmoji;
}

/**
 * Generate a new multiplication question
 */
function generateMultiplicationQuestion() {
    const levelMax = appState.settings.levelMax;
    // For multiplication, use smaller numbers to keep it manageable
    const maxFactor = Math.min(6, Math.floor(Math.sqrt(levelMax)));
    
    const factor1 = randomInt(2, maxFactor);
    const factor2 = randomInt(2, maxFactor);
    const product = factor1 * factor2;
    
    appState.currentQuestion.group1 = factor1;
    appState.currentQuestion.group2 = factor2;
    appState.currentQuestion.total = product;
    
    // Generate distractors
    const choices = [product];
    
    // First distractor: product ± factor1 or factor2
    let distractor1 = product + (Math.random() > 0.5 ? factor1 : -factor1);
    if (distractor1 < 1) distractor1 = product + factor1;
    if (distractor1 > levelMax * 2) distractor1 = product - factor1;
    if (distractor1 < 1) distractor1 = product + 2;
    choices.push(distractor1);
    
    // Second distractor: product ± random amount
    let distractor2 = product + (Math.random() > 0.5 ? 1 : -1) * randomInt(3, 8);
    if (distractor2 < 1) distractor2 = product + randomInt(3, 8);
    if (distractor2 > levelMax * 2) distractor2 = product - randomInt(3, 8);
    if (distractor2 < 1) distractor2 = Math.min(levelMax * 2, product + 5);
    if (distractor2 > levelMax * 2) distractor2 = Math.max(1, product - 5);
    
    // Ensure all choices are unique
    while (choices.includes(distractor2)) {
        distractor2 = randomInt(1, levelMax * 2);
    }
    choices.push(distractor2);
    
    // Shuffle choices
    const shuffledChoices = shuffleArray(choices);
    const correctIndex = shuffledChoices.indexOf(product);
    
    // Pick one random emoji for this question (will be same throughout)
    const selectedEmoji = getRandomEmoji(appState.settings.theme);
    
    appState.currentQuestion.choices = shuffledChoices;
    appState.currentQuestion.correctChoice = correctIndex;
    appState.currentQuestion.revealed = false;
    appState.currentQuestion.emoji = selectedEmoji;
}

/**
 * Generate a new division question
 */
function generateDivisionQuestion() {
    const levelMax = appState.settings.levelMax;
    // For division, use smaller numbers
    const maxDivisor = Math.min(6, Math.floor(Math.sqrt(levelMax)));
    
    // Generate divisor and quotient, then calculate dividend
    const divisor = randomInt(2, maxDivisor);
    const quotient = randomInt(2, Math.min(6, Math.floor(levelMax / divisor)));
    const dividend = divisor * quotient;
    
    appState.currentQuestion.group1 = dividend;
    appState.currentQuestion.group2 = divisor;
    appState.currentQuestion.total = quotient;
    
    // Generate distractors
    const choices = [quotient];
    
    // First distractor: quotient ± 1
    let distractor1 = quotient + (Math.random() > 0.5 ? 1 : -1);
    if (distractor1 < 1) distractor1 = quotient + 1;
    if (distractor1 > levelMax) distractor1 = quotient - 1;
    if (distractor1 < 1) distractor1 = 2;
    choices.push(distractor1);
    
    // Second distractor: quotient ± random(2..4)
    let distractor2 = quotient + (Math.random() > 0.5 ? 1 : -1) * randomInt(2, 4);
    if (distractor2 < 1) distractor2 = quotient + randomInt(2, 4);
    if (distractor2 > levelMax) distractor2 = quotient - randomInt(2, 4);
    if (distractor2 < 1) distractor2 = Math.min(levelMax, quotient + 2);
    if (distractor2 > levelMax) distractor2 = Math.max(1, quotient - 2);
    
    // Ensure all choices are unique
    while (choices.includes(distractor2)) {
        distractor2 = randomInt(1, levelMax);
    }
    choices.push(distractor2);
    
    // Shuffle choices
    const shuffledChoices = shuffleArray(choices);
    const correctIndex = shuffledChoices.indexOf(quotient);
    
    // Pick one random emoji for this question (will be same throughout)
    const selectedEmoji = getRandomEmoji(appState.settings.theme);
    
    appState.currentQuestion.choices = shuffledChoices;
    appState.currentQuestion.correctChoice = correctIndex;
    appState.currentQuestion.revealed = false;
    appState.currentQuestion.emoji = selectedEmoji;
}

/**
 * Generate a new comparison question
 */
function generateComparisonQuestion() {
    const levelMax = appState.settings.levelMax;
    
    // Generate two numbers
    const number1 = randomInt(1, levelMax);
    const number2 = randomInt(1, levelMax);
    
    // Determine correct operator
    let correctOperator;
    if (number1 > number2) {
        correctOperator = '>';
    } else if (number1 < number2) {
        correctOperator = '<';
    } else {
        correctOperator = '=';
    }
    
    // Pick one random emoji for this question (will be same throughout)
    const selectedEmoji = getRandomEmoji(appState.settings.theme);
    
    appState.currentQuestion.number1 = number1;
    appState.currentQuestion.number2 = number2;
    appState.currentQuestion.correctOperator = correctOperator;
    appState.currentQuestion.choices = ['>', '<', '='];
    appState.currentQuestion.correctChoice = appState.currentQuestion.choices.indexOf(correctOperator);
    appState.currentQuestion.revealed = true; // Numbers are always visible in comparison game
    appState.currentQuestion.emoji = selectedEmoji;
}

/**
 * Generate a new question based on current game
 */
function generateQuestion() {
    if (appState.currentGame === 'counting') {
        generateCountingQuestion();
    } else if (appState.currentGame === 'addition') {
        generateAdditionQuestion();
    } else if (appState.currentGame === 'subtraction') {
        generateSubtractionQuestion();
    } else if (appState.currentGame === 'multiplication') {
        generateMultiplicationQuestion();
    } else if (appState.currentGame === 'division') {
        generateDivisionQuestion();
    } else if (appState.currentGame === 'comparison') {
        generateComparisonQuestion();
    }
}

// ============================================
// Rendering Functions
// ============================================

/**
 * Show a specific screen
 */
function showScreen(screenName) {
    elements.gameSelectScreen.classList.remove('active');
    elements.homeScreen.classList.remove('active');
    elements.gameScreen.classList.remove('active');
    elements.endScreen.classList.remove('active');
    
    appState.screen = screenName;
    
    switch (screenName) {
        case 'gameSelect':
            elements.gameSelectScreen.classList.add('active');
            break;
        case 'home':
            elements.homeScreen.classList.add('active');
            break;
        case 'game':
            elements.gameScreen.classList.add('active');
            renderGame();
            break;
        case 'end':
            elements.endScreen.classList.add('active');
            renderEnd();
            break;
    }
}

/**
 * Render home screen
 */
function renderHome() {
    // Settings are already bound to appState via event listeners
    // Just ensure UI reflects current state
    elements.levelSelect.value = appState.settings.levelMax;
    elements.themeSelect.value = appState.settings.theme;
    elements.soundToggle.checked = appState.settings.soundOn;
    elements.voiceToggle.checked = appState.settings.voiceOn;
}

/**
 * Render game screen
 */
function renderGame() {
    const question = appState.currentQuestion;
    const session = appState.session;
    
    // Ensure question exists and is properly generated - if not, generate it
    let needsGeneration = false;
    if (appState.currentGame === 'comparison') {
        // For comparison game, check if correctOperator is set (indicates question was generated)
        // Also check if number1 and number2 are valid (not 0, which is the default)
        needsGeneration = !question.correctOperator || question.number1 === 0 || question.number2 === 0 || !question.emoji;
    } else {
        // For other games, check if choices array is populated and has valid data
        needsGeneration = !question.choices || question.choices.length === 0 || 
                         (appState.currentGame === 'counting' && question.count === 0);
    }
    
    if (needsGeneration) {
        generateQuestion();
    }
    
    // Get the current question (may have been regenerated above)
    const currentQuestion = appState.currentQuestion;
    
    // Update game title
    if (appState.currentGame === 'counting') {
        elements.gameTitle.textContent = '🔢 Counting Game';
    } else if (appState.currentGame === 'addition') {
        elements.gameTitle.textContent = '➕ Addition Game';
    } else if (appState.currentGame === 'subtraction') {
        elements.gameTitle.textContent = '➖ Subtraction Game';
    } else if (appState.currentGame === 'multiplication') {
        elements.gameTitle.textContent = '✖️ Multiplication Game';
    } else if (appState.currentGame === 'division') {
        elements.gameTitle.textContent = '➗ Division Game';
    } else if (appState.currentGame === 'comparison') {
        elements.gameTitle.textContent = '⚖️ Comparison Game';
    }
    
    // Update progress
    elements.progressText.textContent = `Question ${session.questionIndex + 1} of ${session.totalQuestions}`;
    elements.starsDisplay.textContent = `⭐ ${session.stars}`;
    if (elements.balloonsDisplay) {
        elements.balloonsDisplay.textContent = `🎈 ${session.totalBalloonsPopped}`;
    }
    
    // Reset UI
    elements.picturesContainer.innerHTML = '';
    elements.additionGroups.innerHTML = '';
    elements.comparisonNumbers.innerHTML = '';
    elements.choicesContainer.innerHTML = '';
    elements.hintText.textContent = '';
    elements.hintText.classList.remove('error');
    // Reset hint text styles
    elements.hintText.style.color = '';
    elements.hintText.style.fontSize = '';
    elements.hintText.style.fontWeight = '';
    
    // Set appropriate button text and visibility
    if (appState.currentGame === 'comparison') {
        // Comparison game doesn't need "Show Pictures" button - numbers are always visible
        elements.showPicturesButton.style.display = 'none';
    } else {
        elements.showPicturesButton.style.display = 'block';
        if (appState.currentGame === 'counting') {
            elements.showPicturesButton.textContent = 'Show Pictures';
        } else {
            elements.showPicturesButton.textContent = 'Show Groups';
        }
        elements.showPicturesButton.disabled = false;
    }
    
    // Hide/show appropriate containers
    if (appState.currentGame === 'counting') {
        elements.picturesContainer.style.display = 'grid';
        elements.additionGroups.style.display = 'none';
        elements.comparisonNumbers.style.display = 'none';
    } else if (appState.currentGame === 'comparison') {
        elements.picturesContainer.style.display = 'none';
        elements.additionGroups.style.display = 'none';
        elements.comparisonNumbers.style.display = 'flex';
        // Always show numbers for comparison game
        if (currentQuestion && currentQuestion.number1 !== undefined && currentQuestion.number2 !== undefined && currentQuestion.emoji) {
            renderComparisonNumbers(currentQuestion.number1, currentQuestion.number2, currentQuestion.emoji);
        }
    } else {
        elements.picturesContainer.style.display = 'none';
        elements.additionGroups.style.display = 'flex';
        elements.comparisonNumbers.style.display = 'none';
    }
    
    // Render choices (always visible)
    if (appState.currentGame === 'comparison') {
        renderComparisonChoices();
        // Speak the comparison question
        if (currentQuestion && currentQuestion.number1 !== undefined && currentQuestion.number2 !== undefined) {
            const questionText = `Compare ${currentQuestion.number1} and ${currentQuestion.number2}. Which is greater, less than, or equal?`;
            setTimeout(() => speak(questionText), 300);
        }
    } else {
        if (currentQuestion && currentQuestion.choices) {
            renderChoices(currentQuestion.choices);
        }
    }
    
    // Pictures/groups are shown only when revealed (not for comparison)
    if (currentQuestion && currentQuestion.revealed && appState.currentGame !== 'comparison') {
        if (appState.currentGame === 'counting') {
            renderPictures(currentQuestion.count, currentQuestion.emoji);
        } else if (appState.currentGame === 'addition') {
            renderAdditionGroups(currentQuestion.group1, currentQuestion.group2, currentQuestion.emoji, '+');
        } else if (appState.currentGame === 'subtraction') {
            renderAdditionGroups(currentQuestion.group1, currentQuestion.group2, currentQuestion.emoji, '-');
        } else if (appState.currentGame === 'multiplication') {
            renderAdditionGroups(currentQuestion.group1, currentQuestion.group2, currentQuestion.emoji, '×');
        } else if (appState.currentGame === 'division') {
            renderDivisionGroups(currentQuestion.group1, currentQuestion.group2, currentQuestion.emoji);
        }
        elements.showPicturesButton.textContent = 'Next Question';
    }
}

/**
 * Render emoji pictures in a grid (same emoji throughout question)
 */
function renderPictures(count, emoji) {
    elements.picturesContainer.innerHTML = '';
    
    for (let i = 0; i < count; i++) {
        const emojiElement = document.createElement('div');
        emojiElement.className = 'picture-emoji';
        // Use the same emoji for this question
        emojiElement.textContent = emoji;
        emojiElement.setAttribute('aria-hidden', 'true');
        elements.picturesContainer.appendChild(emojiElement);
    }
    
    // Update aria-label for screen readers
    elements.picturesContainer.setAttribute('aria-label', `${count} ${emoji} pictures`);
}

/**
 * Render addition/subtraction/multiplication groups (same emoji throughout question)
 */
function renderAdditionGroups(group1, group2, emoji, operator = '+') {
    elements.additionGroups.innerHTML = '';
    
    // Group 1
    const group1Div = document.createElement('div');
    group1Div.className = 'addition-group';
    const label1 = document.createElement('div');
    label1.className = 'addition-group-label';
    label1.textContent = 'Group 1';
    group1Div.appendChild(label1);
    
    const items1 = document.createElement('div');
    items1.className = 'addition-group-items';
    for (let i = 0; i < group1; i++) {
        const emojiEl = document.createElement('div');
        emojiEl.className = 'addition-group-emoji';
        // Use the same emoji for this question
        emojiEl.textContent = emoji;
        emojiEl.setAttribute('aria-hidden', 'true');
        items1.appendChild(emojiEl);
    }
    group1Div.appendChild(items1);
    elements.additionGroups.appendChild(group1Div);
    
    // Operator sign
    const operatorDiv = document.createElement('div');
    operatorDiv.className = 'addition-plus';
    operatorDiv.textContent = operator;
    operatorDiv.setAttribute('aria-label', operator === '+' ? 'plus' : operator === '-' ? 'minus' : 'times');
    elements.additionGroups.appendChild(operatorDiv);
    
    // Group 2
    const group2Div = document.createElement('div');
    group2Div.className = 'addition-group';
    const label2 = document.createElement('div');
    label2.className = 'addition-group-label';
    label2.textContent = 'Group 2';
    group2Div.appendChild(label2);
    
    const items2 = document.createElement('div');
    items2.className = 'addition-group-items';
    for (let i = 0; i < group2; i++) {
        const emojiEl = document.createElement('div');
        emojiEl.className = 'addition-group-emoji';
        // Use the same emoji for this question
        emojiEl.textContent = emoji;
        emojiEl.setAttribute('aria-hidden', 'true');
        items2.appendChild(emojiEl);
    }
    group2Div.appendChild(items2);
    elements.additionGroups.appendChild(group2Div);
    
    // Update aria-label
    let result;
    if (operator === '+') result = group1 + group2;
    else if (operator === '-') result = group1 - group2;
    else if (operator === '×') result = group1 * group2;
    elements.additionGroups.setAttribute('aria-label', `Group 1 has ${group1} ${emoji}, Group 2 has ${group2} ${emoji}, ${operator} equals ${result}`);
}

/**
 * Render division groups (shows total items divided into groups) (same emoji throughout question)
 */
function renderDivisionGroups(total, divisor, emoji) {
    elements.additionGroups.innerHTML = '';
    
    // Total group
    const totalDiv = document.createElement('div');
    totalDiv.className = 'addition-group';
    const label1 = document.createElement('div');
    label1.className = 'addition-group-label';
    label1.textContent = 'Total';
    totalDiv.appendChild(label1);
    
    const items1 = document.createElement('div');
    items1.className = 'addition-group-items';
    for (let i = 0; i < total; i++) {
        const emojiEl = document.createElement('div');
        emojiEl.className = 'addition-group-emoji';
        // Use the same emoji for this question
        emojiEl.textContent = emoji;
        emojiEl.setAttribute('aria-hidden', 'true');
        items1.appendChild(emojiEl);
    }
    totalDiv.appendChild(items1);
    elements.additionGroups.appendChild(totalDiv);
    
    // Division sign
    const operatorDiv = document.createElement('div');
    operatorDiv.className = 'addition-plus';
    operatorDiv.textContent = '÷';
    operatorDiv.setAttribute('aria-label', 'divided by');
    elements.additionGroups.appendChild(operatorDiv);
    
    // Divisor group (show as groups)
    const divisorDiv = document.createElement('div');
    divisorDiv.className = 'addition-group';
    const label2 = document.createElement('div');
    label2.className = 'addition-group-label';
    label2.textContent = `Groups of ${divisor}`;
    divisorDiv.appendChild(label2);
    
    const items2 = document.createElement('div');
    items2.className = 'addition-group-items';
    const quotient = total / divisor;
    // Show the quotient visually (number of groups)
    for (let i = 0; i < quotient; i++) {
        const groupBox = document.createElement('div');
        groupBox.className = 'division-group-box';
        groupBox.textContent = `${divisor}`;
        items2.appendChild(groupBox);
    }
    divisorDiv.appendChild(items2);
    elements.additionGroups.appendChild(divisorDiv);
    
    // Update aria-label
    elements.additionGroups.setAttribute('aria-label', `Total ${total} ${emoji}, divided into groups of ${divisor}, equals ${quotient} groups`);
}

/**
 * Render answer choice buttons
 */
function renderChoices(choices) {
    elements.choicesContainer.innerHTML = '';
    
    choices.forEach((choice, index) => {
        const button = document.createElement('button');
        button.className = 'choice-btn';
        button.textContent = choice;
        button.setAttribute('aria-label', `Answer choice ${choice}`);
        button.dataset.choiceIndex = index;
        
        button.addEventListener('click', () => handleChoiceClick(index));
        
        elements.choicesContainer.appendChild(button);
    });
}

/**
 * Render comparison numbers with emojis
 */
function renderComparisonNumbers(number1, number2, emoji) {
    elements.comparisonNumbers.innerHTML = '';
    
    // Number 1 with emojis
    const number1Div = document.createElement('div');
    number1Div.className = 'comparison-number-group';
    const label1 = document.createElement('div');
    label1.className = 'comparison-number-label';
    label1.textContent = number1;
    number1Div.appendChild(label1);
    
    const items1 = document.createElement('div');
    items1.className = 'comparison-emoji-items';
    for (let i = 0; i < number1; i++) {
        const emojiEl = document.createElement('div');
        emojiEl.className = 'comparison-emoji';
        emojiEl.textContent = emoji;
        emojiEl.setAttribute('aria-hidden', 'true');
        items1.appendChild(emojiEl);
    }
    number1Div.appendChild(items1);
    elements.comparisonNumbers.appendChild(number1Div);
    
    // Number 2 with emojis
    const number2Div = document.createElement('div');
    number2Div.className = 'comparison-number-group';
    const label2 = document.createElement('div');
    label2.className = 'comparison-number-label';
    label2.textContent = number2;
    number2Div.appendChild(label2);
    
    const items2 = document.createElement('div');
    items2.className = 'comparison-emoji-items';
    for (let i = 0; i < number2; i++) {
        const emojiEl = document.createElement('div');
        emojiEl.className = 'comparison-emoji';
        emojiEl.textContent = emoji;
        emojiEl.setAttribute('aria-hidden', 'true');
        items2.appendChild(emojiEl);
    }
    number2Div.appendChild(items2);
    elements.comparisonNumbers.appendChild(number2Div);
    
    // Update aria-label
    elements.comparisonNumbers.setAttribute('aria-label', `Compare ${number1} and ${number2}`);
}

/**
 * Render comparison choice buttons (>, <, =)
 */
function renderComparisonChoices() {
    elements.choicesContainer.innerHTML = '';
    
    const operators = ['>', '<', '='];
    const operatorLabels = {
        '>': 'Greater Than',
        '<': 'Less Than',
        '=': 'Equal To'
    };
    
    operators.forEach((operator, index) => {
        const button = document.createElement('button');
        button.className = 'choice-btn comparison-operator-btn';
        button.textContent = operator;
        button.setAttribute('aria-label', operatorLabels[operator]);
        button.dataset.choiceIndex = index;
        
        button.addEventListener('click', () => handleChoiceClick(index));
        
        elements.choicesContainer.appendChild(button);
    });
}

/**
 * Render end screen
 */
function renderEnd() {
    elements.finalScore.textContent = appState.session.score;
    elements.finalStars.textContent = `⭐ ${appState.session.stars}`;
    elements.finalBalloons.textContent = `🎈 ${appState.session.totalBalloonsPopped}`;
    
    // Show streak information
    const streakInfo = getStreakInfo();
    if (streakInfo.currentStreak > 0) {
        elements.streakItem.style.display = 'flex';
        elements.finalStreak.textContent = `🔥 ${streakInfo.currentStreak} day${streakInfo.currentStreak !== 1 ? 's' : ''}`;
    } else {
        elements.streakItem.style.display = 'none';
    }
}

/**
 * Show success overlay
 */
function showSuccessOverlay() {
    elements.successOverlay.classList.add('show');
    elements.successOverlay.setAttribute('aria-hidden', 'false');
    
    // Show overlay for 1.5 seconds (quick celebration message)
    setTimeout(() => {
        elements.successOverlay.classList.remove('show');
        elements.successOverlay.setAttribute('aria-hidden', 'true');
    }, 1500);
}

/**
 * Show avatar overlay for 3 consecutive stars
 */
function showAvatarOverlay() {
    console.log('showAvatarOverlay called'); // Debug
    if (!elements.avatarOverlay) {
        console.error('Avatar overlay element not found!', elements.avatarOverlay);
        return;
    }
    
    console.log('Avatar overlay element found, showing in 2 seconds'); // Debug
    
    // Show avatar after success overlay disappears (1.5 seconds) plus a small delay
    // This ensures it appears on top and is visible
    setTimeout(() => {
        console.log('Showing avatar now'); // Debug
        if (!elements.avatarOverlay) {
            console.error('Avatar overlay disappeared!');
            return;
        }
        
        // Force display style and z-index to ensure visibility
        elements.avatarOverlay.style.display = 'flex';
        elements.avatarOverlay.style.zIndex = '3000';
        elements.avatarOverlay.classList.add('show');
        elements.avatarOverlay.setAttribute('aria-hidden', 'false');
        
        // Speak the message
        speak('You are on fire great job!');
        
        // Show overlay for 4 seconds (longer so it's more visible)
        setTimeout(() => {
            if (elements.avatarOverlay) {
                console.log('Hiding avatar'); // Debug
                elements.avatarOverlay.classList.remove('show');
                elements.avatarOverlay.setAttribute('aria-hidden', 'true');
                elements.avatarOverlay.style.display = 'none';
            }
        }, 4000);
    }, 2000); // Show 2 seconds after the success overlay appears (which shows for 1.5 seconds)
}

// ============================================
// Game Logic
// ============================================

/**
 * Handle choice button click
 */
function handleChoiceClick(choiceIndex) {
    const question = appState.currentQuestion;
    
    // Check if pictures are revealed (comparison game doesn't need this)
    if (!question.revealed && appState.currentGame !== 'comparison') {
        elements.hintText.textContent = 'Press "Show Pictures" first!';
        elements.hintText.classList.add('error');
        setTimeout(() => {
            elements.hintText.textContent = '';
            elements.hintText.classList.remove('error');
        }, 2000);
        return;
    }
    
    // Disable all choice buttons
    const choiceButtons = elements.choicesContainer.querySelectorAll('.choice-btn');
    choiceButtons.forEach(btn => {
        btn.disabled = true;
        btn.style.pointerEvents = 'none';
    });
    
    const isCorrect = choiceIndex === question.correctChoice;
    const clickedButton = choiceButtons[choiceIndex];
    
    if (isCorrect) {
        // Correct answer
        clickedButton.classList.add('correct');
        
        // Update score
        appState.session.score++;
        appState.session.stars++;
        appState.session.consecutiveStars++;
        
        // Check for 3 consecutive stars milestone
        console.log('Consecutive stars:', appState.session.consecutiveStars); // Debug
        if (appState.session.consecutiveStars === 3) {
            console.log('Showing avatar overlay!'); // Debug
            showAvatarOverlay();
            appState.session.consecutiveStars = 0; // Reset after showing avatar
        }
        
        // Update streak for each correct answer
        const streakData = updateStreak();
        
        // Check if this is the 5th question completed today (milestone reached)
        if (streakData.questionsToday === 5) {
            checkStreakMilestones(streakData.currentStreak);
        }
        
        // Play effects
        playSuccessSound();
        speak('Congratulations you did it!');
        startConfetti();
        showSuccessOverlay();
        
        // Show balloon score at 11 seconds (before confetti ends)
        setTimeout(() => {
            showBalloonScore();
        }, 11000);
        
        // Move to next question after 14 seconds (after score is shown for 3 seconds)
        setTimeout(() => {
            nextQuestion();
        }, 14000);
    } else {
        // Wrong answer - reset consecutive stars
        appState.session.consecutiveStars = 0;
        
        clickedButton.classList.add('wrong');
        playWrongSound();
        
        elements.hintText.textContent = 'Try again!';
        elements.hintText.classList.add('error');
        
        // Re-enable buttons after shake animation
        setTimeout(() => {
            clickedButton.classList.remove('wrong');
            choiceButtons.forEach(btn => {
                btn.disabled = false;
                btn.style.pointerEvents = 'auto';
            });
        }, 500);
    }
}

/**
 * Handle "Show Pictures" button click
 */
function handleShowPictures() {
    const question = appState.currentQuestion;
    
    // Comparison game doesn't use this button
    if (appState.currentGame === 'comparison') {
        return;
    }
    
    if (!question.revealed) {
        // Reveal pictures/groups
        question.revealed = true;
        if (appState.currentGame === 'counting') {
            renderPictures(question.count, question.emoji);
        } else if (appState.currentGame === 'addition') {
            renderAdditionGroups(question.group1, question.group2, question.emoji, '+');
        } else if (appState.currentGame === 'subtraction') {
            renderAdditionGroups(question.group1, question.group2, question.emoji, '-');
        } else if (appState.currentGame === 'multiplication') {
            renderAdditionGroups(question.group1, question.group2, question.emoji, '×');
        } else if (appState.currentGame === 'division') {
            renderDivisionGroups(question.group1, question.group2, question.emoji);
        }
        elements.showPicturesButton.textContent = 'Next Question';
    } else {
        // Move to next question
        nextQuestion();
    }
}

/**
 * Move to next question
 */
function nextQuestion() {
    appState.session.questionIndex++;
    
    if (appState.session.questionIndex >= appState.session.totalQuestions) {
        // Game over
        showScreen('end');
    } else {
        // Generate next question
        generateQuestion();
        renderGame();
    }
}

/**
 * Start a new game session
 */
function startGame() {
    // Initialize audio context on user interaction
    initAudioContext();
    
    // Reset session
    appState.session = {
        questionIndex: 0,
        totalQuestions: 10,
        score: 0,
        stars: 0,
        totalBalloonsPopped: 0,
        questionsCompletedToday: 0,
        consecutiveStars: 0 // Reset consecutive stars counter
    };
    
    // Generate first question
    generateQuestion();
    
    // Show game screen
    showScreen('game');
}

/**
 * Select a game type
 */
function selectGame(gameType) {
    appState.currentGame = gameType;
    showScreen('home');
}

// ============================================
// Settings Management (LocalStorage)
// ============================================

/**
 * Load settings from localStorage
 */
function loadSettings() {
    try {
        const saved = localStorage.getItem('countingAppSettings');
        if (saved) {
            const settings = JSON.parse(saved);
            appState.settings = { ...appState.settings, ...settings };
        }
    } catch (e) {
        console.warn('Error loading settings:', e);
    }
}

/**
 * Save settings to localStorage
 */
function saveSettings() {
    try {
        localStorage.setItem('countingAppSettings', JSON.stringify(appState.settings));
    } catch (e) {
        console.warn('Error saving settings:', e);
    }
}

/**
 * Update setting and save
 */
function updateSetting(key, value) {
    appState.settings[key] = value;
    saveSettings();
}

// ============================================
// Streak Management (LocalStorage)
// ============================================

/**
 * Get today's date as a string (YYYY-MM-DD)
 */
function getTodayDateString() {
    const today = new Date();
    return today.toISOString().split('T')[0];
}

/**
 * Get yesterday's date as a string (YYYY-MM-DD)
 */
function getYesterdayDateString() {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return yesterday.toISOString().split('T')[0];
}

/**
 * Load streak data from localStorage
 */
function loadStreakData() {
    try {
        const saved = localStorage.getItem('countingAppStreak');
        if (saved) {
            return JSON.parse(saved);
        }
    } catch (e) {
        console.warn('Error loading streak data:', e);
    }
    return {
        lastDate: null,
        currentStreak: 0,
        questionsToday: 0,
        dayCompleted: false // Whether 5 questions were completed today
    };
}

/**
 * Save streak data to localStorage
 */
function saveStreakData(streakData) {
    try {
        localStorage.setItem('countingAppStreak', JSON.stringify(streakData));
    } catch (e) {
        console.warn('Error saving streak data:', e);
    }
}

/**
 * Update streak when a question is completed
 */
function updateStreak() {
    const streakData = loadStreakData();
    const today = getTodayDateString();
    const yesterday = getYesterdayDateString();
    
    // Check if it's a new day
    if (streakData.lastDate !== today) {
        // Check if yesterday was completed
        const yesterdayCompleted = streakData.lastDate === yesterday && streakData.dayCompleted;
        
        if (streakData.lastDate === yesterday) {
            // If yesterday was NOT completed, reset streak
            if (!yesterdayCompleted) {
                streakData.currentStreak = 0;
            }
            // If yesterday WAS completed, keep the streak going (don't change currentStreak)
        } else if (streakData.lastDate === null) {
            // First time playing
            streakData.currentStreak = 0;
        } else {
            // Streak broken (missed a day or more)
            streakData.currentStreak = 0;
        }
        
        // Reset for new day
        streakData.questionsToday = 1;
        streakData.dayCompleted = false;
        streakData.lastDate = today;
    } else {
        // Same day - increment questions
        streakData.questionsToday = (streakData.questionsToday || 0) + 1;
    }
    
    // Check if 5 questions completed today (this is the 5th question)
    if (streakData.questionsToday === 5 && !streakData.dayCompleted) {
        // Mark day as completed and increment streak
        streakData.dayCompleted = true;
        streakData.currentStreak = (streakData.currentStreak || 0) + 1;
    }
    
    saveStreakData(streakData);
    return streakData;
}

/**
 * Get current streak information
 */
function getStreakInfo() {
    const streakData = loadStreakData();
    const today = getTodayDateString();
    
    // Reset if it's a new day and they haven't played yet
    if (streakData.lastDate !== today && streakData.lastDate !== null) {
        const yesterday = getYesterdayDateString();
        if (streakData.lastDate !== yesterday) {
            // Streak broken
            streakData.currentStreak = 0;
        }
    }
    
    return {
        currentStreak: streakData.currentStreak || 0,
        questionsToday: streakData.lastDate === today ? (streakData.questionsToday || 0) : 0,
        completedToday: streakData.lastDate === today && (streakData.dayCompleted || false)
    };
}

/**
 * Check for streak milestones and celebrate
 */
function checkStreakMilestones(streakCount) {
    if (streakCount === 3) {
        // 3 day streak milestone!
        speak('Amazing! You have a 3 day streak! Keep it up!');
        setTimeout(() => {
            startConfetti();
        }, 500);
    } else if (streakCount === 10) {
        // 10 day streak milestone!
        speak('Incredible! You have a 10 day streak! You are a superstar!');
        setTimeout(() => {
            startConfetti();
        }, 500);
    }
}

// ============================================
// Event Listeners
// ============================================

// Game selection
elements.countingGameBtn.addEventListener('click', () => {
    selectGame('counting');
});

elements.additionGameBtn.addEventListener('click', () => {
    selectGame('addition');
});

elements.subtractionGameBtn.addEventListener('click', () => {
    selectGame('subtraction');
});

elements.multiplicationGameBtn.addEventListener('click', () => {
    selectGame('multiplication');
});

elements.divisionGameBtn.addEventListener('click', () => {
    selectGame('division');
});

elements.comparisonGameBtn.addEventListener('click', () => {
    selectGame('comparison');
});

// Home screen controls
elements.levelSelect.addEventListener('change', (e) => {
    updateSetting('levelMax', parseInt(e.target.value));
});

elements.themeSelect.addEventListener('change', (e) => {
    updateSetting('theme', e.target.value);
});

elements.soundToggle.addEventListener('change', (e) => {
    updateSetting('soundOn', e.target.checked);
});

elements.voiceToggle.addEventListener('change', (e) => {
    updateSetting('voiceOn', e.target.checked);
});

elements.startButton.addEventListener('click', () => {
    startGame();
});

// Game screen controls
elements.homeButton.addEventListener('click', () => {
    showScreen('gameSelect');
});

// Home buttons on all screens
if (elements.homeButtonGameSelect) {
    elements.homeButtonGameSelect.addEventListener('click', () => {
        showScreen('gameSelect');
    });
}

if (elements.homeButtonEnd) {
    elements.homeButtonEnd.addEventListener('click', () => {
        showScreen('gameSelect');
    });
}

elements.showPicturesButton.addEventListener('click', () => {
    handleShowPictures();
});

// End screen controls
elements.playAgainButton.addEventListener('click', () => {
    // Reset current game to allow selecting a new game
    appState.currentGame = null;
    showScreen('gameSelect');
});

elements.backToGamesButton.addEventListener('click', () => {
    showScreen('gameSelect');
});

// Window resize handler for confetti canvas
window.addEventListener('resize', () => {
    initConfettiCanvas();
});

// ============================================
// Initialization
// ============================================

/**
 * Initialize the app
 */
function init() {
    // Load saved settings
    loadSettings();
    
    // Render home screen with loaded settings
    renderHome();
    
    // Initialize confetti canvas
    initConfettiCanvas();
    
    // Show game selection screen
    showScreen('gameSelect');
}

// Start the app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
