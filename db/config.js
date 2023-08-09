const mongoose = require('mongoose');
const dotenv = require('dotenv');

const dbConnection =  async () => {

    dotenv.config();

    try {
        
        mongoose.connect( process.env.DB_CNN )
        console.log('DB Online')

    } catch (error) {
        console.log(error);
        throw new Error('Error starting DB');
    }
}

module.exports = {
    dbConnection
}