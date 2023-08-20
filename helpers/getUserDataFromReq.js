const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();

const jwtSecret = process.env.JWT_SECRET;

const getUserDataFromReq = async ( req ) => {
    return new Promise( ( resolve, reject ) => {
        const token = req.cookies?.token;
        
        if ( token ) {
            jwt.verify( token, jwtSecret, {}, ( error, userData ) => {
                if ( error ) throw error;
                resolve( userData );
            });
        } else {
            reject('No token');
        }
    });

};

module.exports = {
    getUserDataFromReq
}