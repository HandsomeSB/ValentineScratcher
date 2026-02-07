# 💝 Valentine's Lottery Scratcher

A personalized lottery scratcher game where users scratch cards to reveal a secret message word by word. Perfect for Valentine's Day or any special occasion!

## Features

- **URL-Encoded Messages**: Create shareable links with custom messages
- **Traditional Lottery Mechanics**: Match your number with 6 prize numbers to win words
- **Canvas-Based Scratching**: Realistic scratch-off effect using HTML5 Canvas
- **Progress Persistence**: Game state saved in localStorage
- **Audio Feedback**: Web Audio API sounds for scratching, winning, and completion
- **Confetti Animation**: Celebration effect when message is fully revealed
- **Social Sharing**: Share your revealed message on Twitter or copy the link
- **Fully Responsive**: Works on desktop and mobile devices
- **TypeScript**: Fully typed for better developer experience

## Tech Stack

- **Next.js 16** with App Router
- **TypeScript** for type safety
- **Tailwind CSS v4** for styling
- **HTML5 Canvas** for scratch-off mechanics
- **Web Audio API** for procedural sound generation
- **localStorage** for progress persistence

## Getting Started

### Prerequisites

- Node.js 20+ installed
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd valentine-scratcher
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Building for Production

```bash
npm run build
npm start
```

## How It Works

### Creating a Message

1. Visit the homepage
2. Enter your custom message (at least 3 words)
3. Click "Generate Link"
4. Copy and share the generated URL

### Playing the Game

1. Open the shared link
2. Scratch the "Your Number" card and all 6 "Prize Numbers" cards
3. If your number matches any prize number, you win a word!
4. Collect all words to reveal the complete message
5. Enjoy the confetti and share your achievement!

## Project Structure

```
valentine-scratcher/
├── app/
│   ├── [message]/          # Dynamic route for game pages
│   │   └── page.tsx        # Game page component
│   ├── globals.css         # Global styles with Valentine's theme
│   ├── layout.tsx          # Root layout
│   └── page.tsx            # Landing page
├── components/
│   ├── Confetti.tsx        # Confetti animation component
│   ├── MessageInput.tsx    # Landing page form component
│   ├── NumberScratcher.tsx # "Your Number" scratcher
│   ├── PrizeScratcher.tsx  # Prize numbers scratcher (6x)
│   ├── ScratchCard.tsx     # Reusable scratch canvas component
│   └── ShareModal.tsx      # Completion modal with sharing
├── lib/
│   ├── audioManager.ts     # Web Audio API sound manager
│   ├── config.ts           # Game configuration constants
│   ├── gameState.ts        # localStorage state management
│   └── urlEncoder.ts       # Base64 URL encoding/decoding
└── public/                 # Static assets
```

## Configuration

Game settings can be adjusted in `lib/config.ts`:

```typescript
export const GAME_CONFIG = {
  SCRATCH_THRESHOLD: 0.6,    // 60% scratched to reveal
  SCRATCH_RADIUS: 30,        // Scratch brush size
  CARD_WIDTH: 300,           // Canvas width
  CARD_HEIGHT: 200,          // Canvas height
  MIN_NUMBER: 1,             // Minimum lottery number
  MAX_NUMBER: 50,            // Maximum lottery number
  PRIZE_COUNT: 6,            // Number of prize numbers
  // ... color and audio settings
};
```

## Customization

### Changing the Theme

Edit the CSS variables in `app/globals.css`:

```css
:root {
  --valentine-red: #FF1744;
  --valentine-pink: #F8BBD0;
  --valentine-dark-red: #880E4F;
  /* ... other colors */
}
```

### Adjusting Game Difficulty

Modify the number range or prize count in `lib/config.ts`:

```typescript
MIN_NUMBER: 1,        // Lower = easier
MAX_NUMBER: 50,       // Higher = harder
PRIZE_COUNT: 6,       // More prizes = easier
```

## Deployment

This is a standard Next.js app and can be deployed to:

- **Vercel** (recommended): `vercel deploy`
- **Netlify**: Connect your Git repository
- **Any Node.js host**: Run `npm run build && npm start`

## Browser Support

- Modern browsers with Canvas API support
- Web Audio API for sound (degrades gracefully if unavailable)
- localStorage for progress saving

## License

This project is open source and available for personal and commercial use.

## Credits

Built with ❤️ using Next.js, TypeScript, and Tailwind CSS.

---

Happy Valentine's Day! 💝
