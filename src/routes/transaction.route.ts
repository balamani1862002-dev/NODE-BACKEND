import { Router } from 'express';
import {
  getTransactionsController,
  getTransactionSummaryController,
  createTransactionController,
  updateTransactionController,
  deleteTransactionController,
  getAnalyticsController,
} from '../controllers/transaction.controller';
import { authenticateToken } from '../common/auth-middleware';

const router = Router();

router.get('/', authenticateToken, getTransactionsController);
router.get('/summary', authenticateToken, getTransactionSummaryController);
router.get('/analytics', authenticateToken, getAnalyticsController);
router.post('/', authenticateToken, createTransactionController);
router.put('/:id', authenticateToken, updateTransactionController);
router.delete('/:id', authenticateToken, deleteTransactionController);

export default router;
