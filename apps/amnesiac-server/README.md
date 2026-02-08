# Amnesiac Server

A TypeScript REST API server for managing Blood on the Clocktower game sessions with real-time state synchronization.

## Requirements

- **Bun** 1.2+ (recommended) or Node.js 18+
- TypeScript 5+

## Features

- **Session Management**: Full CRUD operations for game sessions
- **Flexible State System**: Supports different session types with dynamic state schemas
- **TypeScript**: Full type safety and modern development experience
- **RESTful API**: Clean, predictable API endpoints
- **Real-time Ready**: Built for future WebSocket integration
- **API Documentation**: Interactive Swagger/OpenAPI documentation

## Quick Start

### Installation

```bash
bun install
```

### Development

```bash
bun run dev
```

Server will start at `http://localhost:3000`

### Production

```bash
bun run build
bun start
```

## API Endpoints

### Interactive Documentation

Access the interactive Swagger documentation at:

- **Development**: `http://localhost:3000/api-docs`
- **Production**: `http://64.225.49.223:3000/api-docs`

The Swagger UI provides:

- Complete API documentation with request/response schemas
- Interactive testing of all endpoints
- Example requests and responses
- Authentication details (when implemented)

### Quick Reference

#### Health Check

- `GET /health` - Server health status

#### Sessions

- `POST /api/sessions` - Create a new session
- `GET /api/sessions` - Get all sessions
- `GET /api/sessions/:id` - Get a specific session
- `PUT /api/sessions/:id` - Update a session
- `DELETE /api/sessions/:id` - Delete a session
- `PATCH /api/sessions/:id/state` - Update session state

## Session Schema

```typescript
interface Session {
  id: string; // UUID
  name: string; // Session name
  startTime: Date; // When session was created
  lastUpdated: Date; // Last modification time
  type: string; // Session type (currently supports "SCRIPT")
  state: object; // Flexible state based on session type
}
```

## Session Types

### SCRIPT Type

For Blood on the Clocktower script sessions, the `state` follows the schema from:
`https://raw.githubusercontent.com/AbstractDevs/librarian/refs/heads/main/src/data/scripts/rotting-moors/latest.json`

## Example Requests

### Create a Session

```bash
curl -X POST http://localhost:3000/api/sessions \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Friday Night Game",
    "type": "SCRIPT",
    "state": {
      "meta": {
        "id": "rotting-moors",
        "name": "Rotting Moors",
        "author": "Custom Author"
      },
      "characters": []
    }
  }'
```

### Get All Sessions

```bash
curl http://localhost:3000/api/sessions
```

### Update Session State

```bash
curl -X PATCH http://localhost:3000/api/sessions/{session-id}/state \
  -H "Content-Type: application/json" \
  -d '{
    "currentPlayer": "player1",
    "phase": "night"
  }'
```

## Project Structure

```text
src/
├── app.ts                 # Main Express application
├── types/
│   ├── session.ts         # Session type definitions
│   └── api.ts            # API response types
├── services/
│   └── sessionService.ts  # Session business logic
├── controllers/
│   └── sessionController.ts # HTTP request handlers
└── routes/
    ├── index.ts          # Main router
    └── sessions.ts       # Session routes
```

### Environment Variables

Create a `.env` file:

```env
PORT=3000
NODE_ENV=development
```

## Future Enhancements

- WebSocket support for real-time synchronization
- Database persistence (currently in-memory)
- Authentication and authorization
- Session validation based on type
- Rate limiting and security enhancements
