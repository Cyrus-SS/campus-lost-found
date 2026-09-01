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

// PUT /api/items/:id - Update an item by ID
router.put('/:id', updateItem);

// DELETE /api/items/:id - Delete an item by ID
router.delete('/:id', deleteItem);

module.exports = router;