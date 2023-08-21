const { Router } = require('express');
const { check } = require('express-validator');
const { validateFields } = require('../middlewares/field-validator');
const { register } = require('../controllers/auth');

const router = Router();

router.post(
    '/register',
    [
        check('username', 'Username required').not().isEmpty(),
        check('password', 'Password must meet the requirements').isStrongPassword(),
        validateFields
    ],
    register
);

module.exports = router;
