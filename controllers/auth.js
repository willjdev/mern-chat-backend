const { response } = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
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

const login = async ( req, res = response ) => {

    const { username, password } = req.body;

    try {
        
        const foundUser = await User.findOne( {username} );
        
        if ( foundUser ) {
            const passOk = bcrypt.compareSync( password, foundUser.password );
            if ( passOk ) {
                generateJwt( foundUser, username, res );
            }
        }

    } catch (error) {
        console.log(error);
    }
};

module.exports = {
    register,
    login
};
