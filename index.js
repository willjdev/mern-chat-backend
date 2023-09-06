const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { dbConnection } = require('./db/config');
const { webSocketConfig } = require('./websocket/config');
require('dotenv').config();


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

// Server listening
const server = app.listen( 4000, () => {
    console.log('Server listening')
});

// Websocket Server
webSocketConfig( server );

