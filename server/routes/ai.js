const express = require('express');
const router = express.Router();
const { classifyScam, chatAssistant } = require('../controllers/aiController');

router.post('/classify', classifyScam);
router.post('/chat', chatAssistant);

module.exports = router;
