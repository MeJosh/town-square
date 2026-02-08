# Amnesiac

A comprehensive Blood on the Clocktower session management system consisting of a Progressive Web App and REST API server.

## Projects

### Web App (apps/amnesiac-client)
- Framework: Astro 5.x with Vue 3.x components
- Language: TypeScript
- Styling: Tailwind CSS with dark/light mode
- Deployment: GitHub Pages
- Purpose: Player-facing PWA for viewing scripts and game state

### Server (apps/amnesiac-server)
- Framework: Node.js with Express
- Language: TypeScript
- Runtime: Bun for enhanced performance
- Deployment: DigitalOcean Droplet via GitHub Actions
- Purpose: Session management and real-time state synchronization

### Shared (packages/amnesiac-shared)
- Purpose: Common types and utilities used across web and server
- Language: TypeScript

## Development

### Prerequisites
- Bun 1.2+ (recommended package manager and runtime)
- Node.js >= 18.0.0 (fallback compatibility)

### Setup
```bash
# Install all dependencies from repo root
bun install

# Start both projects in development mode
bun run dev:amnesiac:all

# Or start individually
bun run dev:amnesiac:client  # Web app on http://localhost:4321/amnesiac
bun run dev:amnesiac:server  # API server on http://localhost:3000
```

### Available Scripts
```bash
# Development
bun run dev:amnesiac:client
bun run dev:amnesiac:server
bun run dev:amnesiac:all

# Building
bun run build:amnesiac:client
bun run build:amnesiac:server
bun run build:amnesiac:all
bun run build:amnesiac:shared

# Code Quality
bun run format:amnesiac
bun run format:amnesiac:fix
bun run lint:amnesiac
bun run lint:amnesiac:fix

# Utilities
bun run clean
```

## Deployment

### Web App (GitHub Pages)
The web app automatically deploys to GitHub Pages on pushes to main branch.
- URL: https://abstractdevs.github.io/amnesiac/
- Build artifacts from apps/amnesiac-client/dist

### Server (DigitalOcean)
The server deploys to a DigitalOcean droplet via GitHub Actions.
- Triggered on changes to apps/amnesiac-server directory
- Environment variables managed via GitHub Secrets
- Docker containerization for consistent deployment

## Architecture

### Session Management
- Session Types: Currently supports "SCRIPT" type
- State Management: Flexible schema based on session type
- Real-time Sync: WebSocket connections for live updates
- CRUD Operations: Full session lifecycle management

### Data Flow
```
Player Device (PWA) <-> API Server <-> Database
                    <->
            Other Connected Clients
```

## Contributing

1. Make changes in appropriate apps or packages directory
2. Run bun run format:amnesiac:fix and bun run lint:amnesiac:fix
3. Test changes locally with bun run dev:amnesiac:all
4. Commit with conventional commit format
5. Push to trigger appropriate deployment pipeline

## License

MIT License - see LICENSE file for details.
