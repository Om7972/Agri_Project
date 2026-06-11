import 'dotenv/config';
import http from 'http';
import { Server } from 'socket.io';
import app from './app';
import { setupSockets } from '@/sockets/socketHandler';
import { logger } from '@/utils/logger';
import prisma from '@/config/db';
import redisClient from '@/config/redis';

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

// Initialize Socket.IO Server
const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    credentials: true,
  },
});

// Setup sockets handlers
setupSockets(io);

// Start Server listening
server.listen(PORT, () => {
  logger.info(`Server is running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  logger.info(`API Documentation available at http://localhost:${PORT}/api-docs`);
});

// Handle Graceful Shutdowns
const gracefulShutdown = async (signal: string) => {
  logger.warn(`Received ${signal}. Starting graceful shutdown procedure...`);

  // Close HTTP Server first
  server.close(() => {
    logger.info('HTTP server closed.');
  });

  // Disconnect Database
  try {
    await prisma.$disconnect();
    logger.info('Prisma database connection closed.');
  } catch (err: any) {
    logger.error('Error closing Prisma connection:', err);
  }

  // Disconnect Redis
  try {
    if (redisClient.isOpen) {
      await redisClient.disconnect();
      logger.info('Redis connection closed.');
    }
  } catch (err: any) {
    logger.error('Error closing Redis connection:', err);
  }

  process.exit(0);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at Promise:', reason);
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception thrown:', error);
  gracefulShutdown('UNCAUGHT_EXCEPTION');
});
