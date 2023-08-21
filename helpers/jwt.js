const jwt = require('jsonwebtoken');


const generateJwt = ( user, username, res ) => {
    
    jwt.sign( { userId: user._id, username: username }, process.env.JWT_SECRET, {}, ( error, token ) => {
        if ( error ) {
            console.log(error);
            throw new Error('Error generating token');
        }
        res.cookie( 'token', token, { sameSite: 'none', secure: true } ).status(201).json({
            _id: user._id,
            ok: true,
            msg: 'User registered'
        });
        console.log( user );
    })

};

module.exports = {
    generateJwt
}