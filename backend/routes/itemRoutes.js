const { authenticate, requireRole } = require('../middleware/auth');
const express = require('express');
const router = express.Router();
const {
  createItem,
  getAllItems,
  getItemById,
  updateItem,
  deleteItem
} = require('../controllers/itemController');

// POST /api/items - Create a new item
router.post('/', createItem);

// GET /api/items - Get all items
router.get('/', getAllItems);

// GET /api/items/:id - Get a single item by ID
router.get('/:id', getItemById);

router.put('/:id', authenticate, requireRole('staff'), updateItem);

router.delete('/:id', authenticate, requireRole('staff'), deleteItem);

module.exports = router;