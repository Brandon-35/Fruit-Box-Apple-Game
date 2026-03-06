# Fruit Box: Apple Game

A classic **Fruit Box** puzzle game built with React. Drag to select rectangular groups of fruits whose values sum to **10** to clear them from the board and score points!

## How to Play

1. A grid of fruits is generated, each with a number value (1-9)
2. **Drag** to select a rectangular area on the board
3. If the selected fruits' values **sum to 10**, they are cleared and you earn points
4. Clear as many fruits as possible before time runs out (Time Attack) or take your time (Endless)

## Features

### Game Modes
- **Time Attack** - Score as many points as possible within a fixed time limit
- **Endless** - No time pressure, focus on clearing the entire board

### Difficulty Levels
| Level | Grid Size | Time Limit |
|-------|-----------|------------|
| Easy | 8 x 12 | 180s |
| Medium | 10 x 17 | 120s |
| Hard | 12 x 22 | 90s |

### Combo & Fever System
- Clearing fruits within **2 seconds** of each other builds a **combo chain**
- Reach a **5x combo** to activate **Fever Mode** (8 seconds of double points!)

### Special Fruits
- **Normal** - Standard numbered fruit
- **Bomb** - Clears surrounding fruits when matched
- **Clock** - Adds bonus time when matched
- **Wildcard** - Acts as any number to complete a sum of 10
- **Golden** - Worth bonus points when cleared

### Mission System
- Random missions appear every 30 seconds during gameplay
- Complete missions to earn rewards: bonus points, time freeze, or golden fruits
- Mission types: clear specific numbers, exact group sizes, or chain combos

### Other Features
- 6 fruit themes to choose from (Apple, Orange, Grape, Strawberry, Pear, Peach)
- Sound effects with mute toggle
- High score tracking via localStorage
- Smooth animations powered by Motion (Framer Motion)
- Fully responsive design

## Tech Stack

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool & dev server
- **Tailwind CSS 4** - Utility-first styling
- **Motion** - Animations
- **Lucide React** - Icons

## Getting Started

**Prerequisites:** Node.js (v18+)

```bash
# Clone the repository
git clone https://github.com/Brandon-35/Fruit-Box-Apple-Game.git
cd Fruit-Box-Apple-Game

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server on port 3000 |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Type-check with TypeScript |
| `npm run clean` | Remove dist folder |

## License

Apache-2.0
