# Infinite Guesser

An AI-powered guessing game where you try to list as many items as possible in a given category before getting 5 strikes.

## Features

- AI-powered answer validation using OpenAI GPT-5.1
- Dynamic category selection with suggestions
- Real-time feedback and scoring
- Persistent game history stored locally
- Responsive design with playful animations
- Three-strikes-you're-out gameplay mechanic

## Tech Stack

- **Framework**: Next.js 16 with App Router
- **UI**: React 19, Tailwind CSS 4, Radix UI components
- **Animations**: Framer Motion
- **AI Integration**: Vercel AI SDK with OpenAI provider
- **Type Safety**: TypeScript, Zod schema validation

## Getting Started

### Prerequisites

- Node.js (latest LTS version recommended)
- OpenAI API key

### Installation

1. Clone the repository
2. Install dependencies:

```bash
bun install
```

3. Set up environment variables (create a `.env.local` file):

```env
OPENAI_API_KEY=your_api_key_here
```

4. Run the development server:

```bash
bun run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## How to Play

1. Choose a category (or enter your own)
2. Type items that belong to that category
3. The AI validates each guess in real-time
4. Earn points for correct, specific answers
5. Get strikes for invalid or too vague answers
6. Game ends after 5 strikes or when you give up
7. View your final score and game history

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## Project Structure

```
app/
  ├── actions.ts      # Server actions for AI validation
  ├── layout.tsx      # Root layout
  └── page.tsx        # Home page
components/
  ├── game-manager.tsx    # Game state management
  ├── start-screen.tsx    # Category selection screen
  ├── play-screen.tsx     # Main gameplay screen
  ├── summary-screen.tsx  # End game summary
  └── ui/                 # Reusable UI components
```

## License

Private project
