const express = require('express');
const demoController = require('../controllers/demoController');

const router = express.Router();

router.get('/examples', demoController.getDemoExamples);
router.get('/examples/:demoId', demoController.getDemoResult);

module.exports = router;
