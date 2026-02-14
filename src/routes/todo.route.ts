import { Router } from 'express';
import {
  getTodosController,
  createTodoController,
  updateTodoController,
  deleteTodoController,
  reorderTodosController,
} from '../controllers/todo.controller';
import { authenticateToken } from '../common/auth-middleware';

const router = Router();

router.get('/', authenticateToken, getTodosController);
router.post('/', authenticateToken, createTodoController);
router.put('/reorder', authenticateToken, reorderTodosController);
router.put('/:id', authenticateToken, updateTodoController);
router.delete('/:id', authenticateToken, deleteTodoController);

export default router;
