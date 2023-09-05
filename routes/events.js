const { Router } = require('express');
const { messages } = require('../controllers/events');

const router = Router();

router.get( '/messages/:userId', messages );

module.exports = router;