const { response } = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const { generateJwt } = require('../helpers/jwt');


const register =  async ( req, res = response ) => {
    
    const salt = bcrypt.genSaltSync( 10 );
    const { username, password } = req.body;

    try {

        const hashedPassword = bcrypt.hashSync( password, salt );
        const newUser = await User.create({ username, password: hashedPassword });
        generateJwt( newUser, username, res );

    } catch (error) {
        console.log(error);
    }
};

module.exports = {
    register
}