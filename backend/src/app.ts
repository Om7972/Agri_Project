import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import apiRoutes from '@/routes';
import { errorHandler } from '@/middlewares/error';
import { NotFoundError } from '@/utils/apiErrors';

const app = express();

// Security and utility Middlewares
app.use(helmet({
  contentSecurityPolicy: false, // Turn off CSP temporarily for Swagger UI
}));
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Swagger API Documentation Setup
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'MandiPrime Premium Agriculture Exchange API',
      version: '1.0.0',
      description: 'Production-ready institutional agricultural marketplace backend APIs.',
    },
    servers: [
      {
        url: process.env.BACKEND_URL || 'http://localhost:5000/api/v1',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./src/routes/*.ts', './src/routes/**/*.ts'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Root Endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    name: 'MandiPrime API Exchange Node',
    status: 'ONLINE',
    time: new Date(),
    docs: '/api-docs',
  });
});

// API Routes
app.use('/api/v1', apiRoutes);

// Fallback 404 Route
app.use((req, res, next) => {
  next(new NotFoundError(`Requested path '${req.originalUrl}' not found.`));
});

// Global Error Handler Middleware
app.use(errorHandler);

export default app;
