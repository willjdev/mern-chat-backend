const { response } = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { generateJwt } = require('../helpers/jwt');

const jwtSecret = process.env.JWT_SECRET;

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

const logout = ( req, res = response ) => {
    res.cookie( 'token', '', { sameSite: 'none', secure: true } ).json('ok');
    console.log('Logged out from server')
};

const profile = ( req, res = response ) => {
    const token = req.cookies?.token;
    
    if ( token ) {
        jwt.verify( token, jwtSecret, {}, ( error, userData ) => {
            if ( error ) throw error;
            res.json( userData );
        });
    } else {
        res.status(401).json({
            ok: false,
            msg: 'No token found'
        })
    }
};

const people = async ( req, res = response ) => {

    const users = await User.find( {}, { '_id': 1, username: 1 } );
    res.json( users );

};

module.exports = {
    register,
    login,
    logout,
    profile,
    people
};
