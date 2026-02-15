import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import path from 'path';
import { initializeSupabase } from './db/supabase';
import { logger } from './common/logger';
import { sendError } from './common/response';

import authRoutes from './routes/auth.route';
import userRoutes from './routes/user.route';
import todoRoutes from './routes/todo.route';
import transactionRoutes from './routes/transaction.route';
import adminRoutes from './routes/admin.route';
import dashboardRoutes from './routes/dashboard.route';

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 5000;

const startServer = async (): Promise<void> => {
  try {
    logger.info('Starting server initialization...');
    
    initializeSupabase();

    const corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:3000';
    app.use(cors({
      origin: true,
      credentials: true,
    }));

    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    const limiter = rateLimit({
      windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000'),
      max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
      message: {
        success: false,
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message: 'Too many requests, please try again later',
        },
      },
    });

    app.use(limiter);

    // Swagger Documentation
    try {
      const swaggerDocument = YAML.load(path.join(__dirname, '../swagger.yaml'));
      app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, {
        customCss: '.swagger-ui .topbar { display: none }',
        customSiteTitle: 'Money Manager API Documentation',
      }));
      logger.info('Swagger UI available at /api-docs');
    } catch (error) {
      logger.warn('Swagger documentation not available', { error });
    }

    app.get('/', (req: Request, res: Response) => {
      res.json({
        message: 'Backend API is running',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        documentation: '/api-docs',
      });
    });

    app.use('/api/auth', authRoutes);
    app.use('/api/users', userRoutes);
    app.use('/api/todos', todoRoutes);
    app.use('/api/transactions', transactionRoutes);
    app.use('/api/admin', adminRoutes);
    app.use('/api/dashboard', dashboardRoutes);

    app.use((req: Request, res: Response) => {
      sendError(res, 404, 'NOT_FOUND', 'Endpoint not found', 'Not Found');
    });

    app.listen(PORT, () => {
      logger.info(`Server is running on port ${PORT}`, { port: PORT });
      logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
      logger.info(`CORS Origin: ${corsOrigin}`);
      logger.info(`API Documentation: http://localhost:${PORT}/api-docs`);
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : '';
    logger.error('Failed to start server', { 
      error: errorMessage,
      stack: errorStack
    });
    console.error('\n❌ Server startup failed:');
    console.error(errorMessage);
    console.error('\n💡 Please check:');
    console.error('   1. Your .env file exists and has valid values');
    console.error('   2. SUPABASE_URL is a valid URL (https://xxxxx.supabase.co)');
    console.error('   3. SUPABASE_SERVICE_ROLE_KEY is set correctly');
    console.error('\n   Run: npm run verify\n');
    process.exit(1);
  }
};

startServer();
