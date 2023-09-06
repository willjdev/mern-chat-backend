const { Router } = require('express');
const { check } = require('express-validator');
const { validateFields } = require('../middlewares/field-validator');
const { register, login, logout, profile, people } = require('../controllers/auth');

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

router.post(
    '/login',
    [
        check('username', 'Username required').not().isEmpty(),
        check('password', 'Incorrect Password').isStrongPassword(),
        validateFields
    ],
    login
);

router.post( '/logout', logout );

router.get( '/profile', profile );

router.get( '/people', people );



module.exports = router;
