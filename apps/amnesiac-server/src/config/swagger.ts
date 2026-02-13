import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current directory for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const options: swaggerJSDoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Amnesiac API',
      version: '1.0.0',
      description:
        'REST API for managing Blood on the Clocktower game sessions',
      contact: {
        name: 'AbstractDevs',
        url: 'https://github.com/AbstractDevs/amnesiac',
      },
    },
    servers: [
      {
        url: 'http://localhost/amnesiac/api',
        description: 'Development server (via proxy)',
      },
      {
        url: 'http://localhost:3000',
        description: 'Development server (direct)',
      },
      {
        url: 'http://64.225.49.223:3000',
        description: 'Production server',
      },
    ],
    components: {
      schemas: {
        Session: {
          type: 'object',
          required: ['id', 'name', 'startTime', 'lastUpdated', 'type', 'state'],
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'Unique session identifier',
              example: '123e4567-e89b-12d3-a456-426614174000',
            },
            name: {
              type: 'string',
              description: 'Human-readable session name',
              example: 'Evening Game - Rotting Moors',
            },
            startTime: {
              type: 'string',
              format: 'date-time',
              description: 'When the session was created',
              example: '2025-10-26T15:30:00.000Z',
            },
            lastUpdated: {
              type: 'string',
              format: 'date-time',
              description: 'When the session was last modified',
              example: '2025-10-26T16:45:00.000Z',
            },
            type: {
              type: 'string',
              description: 'Type of session',
              example: 'SCRIPT',
              enum: ['SCRIPT'],
            },
            state: {
              type: 'object',
              description: 'Flexible session state object',
              example: {
                currentPhase: 'night',
                playerCount: 7,
                script: 'rotting-moors',
              },
            },
          },
        },
        CreateSessionRequest: {
          type: 'object',
          required: ['name', 'type'],
          properties: {
            name: {
              type: 'string',
              description: 'Human-readable session name',
              example: 'Evening Game - Rotting Moors',
            },
            type: {
              type: 'string',
              description: 'Type of session',
              example: 'SCRIPT',
              enum: ['SCRIPT'],
            },
            state: {
              type: 'object',
              description: 'Initial session state (optional)',
              example: {
                script: 'rotting-moors',
                playerCount: 7,
              },
            },
          },
        },
        UpdateSessionRequest: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              description: 'Updated session name',
              example: 'Updated Game Name',
            },
            type: {
              type: 'string',
              description: 'Updated session type',
              example: 'SCRIPT',
            },
            state: {
              type: 'object',
              description: 'Updated session state',
              example: {
                currentPhase: 'day',
                playerCount: 8,
              },
            },
          },
        },
        UpdateStateRequest: {
          type: 'object',
          required: ['state'],
          properties: {
            state: {
              type: 'object',
              description: 'New session state to merge',
              example: {
                currentPhase: 'voting',
                nomination: {
                  nominee: 'player1',
                  nominator: 'player2',
                },
              },
            },
          },
        },
        SuccessResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true,
            },
            data: {
              type: 'object',
              description: 'Response data',
            },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false,
            },
            error: {
              type: 'string',
              description: 'Error message',
              example: 'Session not found',
            },
          },
        },
        HealthResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true,
            },
            message: {
              type: 'string',
              example: 'Amnesiac Server is running',
            },
            timestamp: {
              type: 'string',
              format: 'date-time',
              example: '2025-10-26T15:30:00.000Z',
            },
          },
        },
      },
    },
  },
  apis: [
    // Use absolute paths to ensure files are found
    path.join(__dirname, '../routes/*.js'),
    path.join(__dirname, '../controllers/*.js'),
    // Also include TypeScript files for development
    path.join(__dirname, '../routes/*.ts'),
    path.join(__dirname, '../controllers/*.ts'),
  ],
};

const specs = swaggerJSDoc(options);

export const setupSwagger = (app: Express): void => {
  // Swagger UI setup
  app.use(
    '/docs',
    ...swaggerUi.serve,
    swaggerUi.setup(specs, {
      explorer: true,
      customCss:
        '.swagger-ui .topbar { display: none }\n' +
        '@media (prefers-color-scheme: dark) {\n' +
        '  body, .swagger-ui { background: #0f172a; color: #e2e8f0; }\n' +
        '  .swagger-ui .scheme-container { background: #0b1220; box-shadow: none; }\n' +
        '  .swagger-ui .opblock { background: #111827; border-color: #1f2937; }\n' +
        '  .swagger-ui .opblock-tag { color: #e2e8f0; border-bottom-color: #1f2937; }\n' +
        '  .swagger-ui .opblock-summary-description, .swagger-ui .opblock-description-wrapper, .swagger-ui .opblock-title_normal { color: #e2e8f0; }\n' +
        '  .swagger-ui .info .title, .swagger-ui .info .base-url, .swagger-ui .info p { color: #e2e8f0; }\n' +
        '  .swagger-ui .parameter__name, .swagger-ui .parameter__type, .swagger-ui .response-col_status, .swagger-ui .response-col_description { color: #e2e8f0; }\n' +
        '  .swagger-ui table thead tr th, .swagger-ui table tbody tr td { color: #e2e8f0; }\n' +
        '  .swagger-ui select, .swagger-ui input[type="text"], .swagger-ui textarea { background: #111827; color: #e2e8f0; border-color: #334155; }\n' +
        '}\n',
      customSiteTitle: 'Amnesiac API Documentation',
    })
  );

  // Raw OpenAPI JSON
  app.get('/docs/openapi.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(specs);
  });
};

export default specs;
