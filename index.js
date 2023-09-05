const express = require('express');
const mongoose = require('mongoose');
const { dbConnection } = require('./db/config');
const ws = require('ws');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const User = require('./models/User');
const Message =  require('./models/Message');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const { getUserDataFromReq } = require('./helpers/getUserDataFromReq');
require('dotenv').config();
const { generateJwt } = require('./helpers/jwt');
const { webSocketConfig } = require('./websocket/config');


// Express server
const app = express();

// Database Connection
dbConnection();

// CORS
const corsOptions = {
    origin: 'http://localhost:5173',
    credentials: true
};
app.use( cors( corsOptions ) );

// Body reading and parsing
app.use( express.json() );

// Cookie parsing
app.use( cookieParser() );

//Routes
app.use( '/api/auth', require('./routes/auth') );
app.use( '/api/events', require('./routes/events') );
app.use( '/uploads', express.static( __dirname + '/uploads' ) );


app.get('/test', ( req, res ) => {
    res.json('test ok');
});

app.get( '/people', async ( req, res ) => {
    const users = await User.find( {}, { '_id': 1, username: 1 } );
    res.json( users );
});

const server = app.listen( 4000, () => {
    console.log('Server listening')
});

// Websocket Server
webSocketConfig( server );

