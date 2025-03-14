# Minesweeper React

A modern, mobile-friendly implementation of the classic Minesweeper game built with React and Redis for state management.

## Features

- 🎮 Classic Minesweeper gameplay
- 📱 Mobile-optimized with touch controls
- 🔄 Game state persistence with Redis
- 🎯 Responsive design for all screen sizes
- 🏆 Game history tracking

## Prerequisites

- Node.js 14.x or higher
- npm 6.x or higher
- An Upstash Redis database (for game state persistence)

## Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/minesweeper-react.git
   cd minesweeper-react
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   - Copy `.env.example` to `.env`
   - Fill in your Upstash Redis credentials:
     ```
     KV_REST_API_URL=your_upstash_redis_url_here
     KV_REST_API_TOKEN=your_upstash_redis_token_here
     ```

## Development

Start the development server:
```bash
npm start
```

The app will be available at [http://localhost:3000](http://localhost:3000).

## Building for Production

Create a production build:
```bash
npm run build
```

## Deployment

This project is configured for deployment on Vercel. Make sure to:

1. Set up the required environment variables in your Vercel project settings
2. Configure the build settings as specified in `vercel.json`

## Security Considerations

- Never commit `.env` files to version control
- Keep your Redis credentials secure
- Use environment variables for all sensitive configuration
- Regularly update dependencies for security patches

## Controls

### Desktop
- Left click: Reveal cell
- Right click: Place/remove flag

### Mobile
- Tap: Reveal cell
- Long press: Place/remove flag

## Project Structure

```
├── api/              # Serverless API functions
├── public/           # Static assets
├── src/
│   ├── components/   # React components
│   ├── hooks/        # Custom React hooks
│   └── styles/       # CSS styles
└── vercel.json       # Vercel deployment config
```

## License

MIT
