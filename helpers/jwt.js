const jwt = require('jsonwebtoken');

const generateJwt = ( createdUser ) => {
    return new Promise( (resolve, reject) => {

        jwt.sign( { userId: createdUser._id } , process.env.JWT_SECRET, {}, ( error, token ) => {
            if ( error ) {
                console.log(error);
                reject('Cannot generate token');
            }

            resolve( token );
        })

    })
};

module.exports = {
    generateJwt
}