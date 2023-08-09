const { response } = require('express');
const User = require('./models/User');
const { generateJwt } = require('../helpers/jwt');

const createUser =  async ( req, res = response ) => {

    const { username, password, email } = req.body;
    try {
        const newUser = await User.create({ username, password });
        const token = await generateJwt( newUser );
        res.cookie( 'token', token ).status(201).json({
            ok: true,
            token
        });
    } catch (error) {
        console.log(error);
        res.json({
            ok: false,
            msg: 'Register error'
        })
    }

}