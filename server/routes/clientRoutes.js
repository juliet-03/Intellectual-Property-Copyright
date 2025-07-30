const express = require('express');
const router = express.Router();
const {
  getClients,
  getClientById,
  addClient,
  updateClient,
  deleteClient,
} = require('../controllers/clientController');

const { protect } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, getClients)
  .post(protect, addClient);

router.route('/:id')
  .get(protect, getClientById)
  .put(protect, updateClient)
  .delete(protect, deleteClient);

module.exports = router;
