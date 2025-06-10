const express = require('express');
const { createUser, updateUser, deleteUser, getUsers, getUserById } = require('../controllers/Users.js');
const { verifyUser, adminOnly } = require('../middleware/AuthUser.js');
const upload = require('../middleware/multer-config.js');  // Import multer config
const router = express.Router();

// Routes
router.get('/users', verifyUser, adminOnly, getUsers);
router.get('/users/:id', verifyUser, adminOnly, getUserById);

// Profile image upload routes
router.post('/users', upload, createUser);
router.patch('/users/:id', verifyUser, adminOnly, upload, updateUser);

router.delete('/users/:id', verifyUser, adminOnly, deleteUser);

module.exports = router;
