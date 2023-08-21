const express = require('express');
const mongoose = require('mongoose');
const { dbConnection } = require('./db/config');
const ws = require('ws');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
//const { generateJwt } = require('./helpers/jwt');
const User = require('./models/User');
const Message =  require('./models/Message');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const { getUserDataFromReq } = require('./helpers/getUserDataFromReq')
require('dotenv').config();
const { generateJwt } = require('./helpers/jwt');


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





const jwtSecret = process.env.JWT_SECRET;
const salt = bcrypt.genSaltSync( 10 );

app.use( '/uploads', express.static( __dirname + '/uploads' ) );


app.get('/test', ( req, res ) => {
    res.json('test ok');
});

app.get( '/messages/:userId', async ( req, res ) => {
    const { userId } = req.params;
    const userData = await getUserDataFromReq( req );
    const ourUserId = userData.userId;
    const messages = await Message.find({
        sender: { $in: [userId, ourUserId] },
        recipient: { $in: [userId, ourUserId] },
    }).sort({ sortedAt: 1 }).exec();
    res.json( messages );
});

app.get( '/people', async ( req, res ) => {
    const users = await User.find( {}, { '_id': 1, username: 1 } );
    res.json( users );
});

app.get( '/profile', ( req, res ) => {
    const { token } = req.cookies?.token;
    
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

});

/* app.post( '/login', async ( req, res ) => {
    const { username, password } = req.body;

    const foundUser = await User.findOne( {username} );
    
    if ( foundUser ) {
        const passOk = bcrypt.compareSync( password, foundUser.password );
        if ( passOk ) {
            jwt.sign( { userId: foundUser._id, username }, jwtSecret, {}, ( error, token ) => {
                res.cookie( 'token', token, { sameSite: 'none', secure: true } ).json({
                    ok: true,
                    _id: foundUser._id,
                    username
                })
            })
            
        }
    }
}); */

app.post( '/logout', ( req, res ) => {
    res.cookie( 'token', '', { samesite: 'none', secure: true } ).json('ok')
})

const server = app.listen( 4000, () => {
    console.log('Server listening')
});

// Websocket Server

const wss = new ws.WebSocketServer( { server } );
wss.on( 'connection', ( connection, req ) => {

    const notifyAboutOnlinePeople = () => {
        [...wss.clients].forEach( client => {
            client.send( JSON.stringify({
                online: [...wss.clients].map( c => ({ userId: c.userId, username: c.username }) )
            }) )
        });
    } 

    connection.isAlive = true;
    connection.timer = setInterval ( () => {
        connection.ping();
        connection.deathTimer = setTimeout( () => {
            clearInterval( connection.timer );
            connection.isAlive = false;
            connection.terminate();
            console.log('Zora')
            notifyAboutOnlinePeople();
        }, 1000 );
    }, 5000 );

    connection.on( 'pong', () => {
        clearTimeout( connection.deathTimer );
    })

    // Read username and id from the cookie for this connection
    const cookies = req.headers.cookie;
    if ( cookies ) {
        const tokenCookieString = cookies.split(';').find( str => str.startsWith('token=') );
        if ( tokenCookieString ) {

            const token = tokenCookieString.split('=')[1]
            
            if ( token ) {
                jwt.verify( token, jwtSecret, {}, ( error, userData ) => {
                    if ( error ) {
                        throw new Error('Connection to webtoken')
                    }
                    const { userId, username } = userData;
                    connection.userId = userId;
                    connection.username = username;
                })
            }
        }        
    }
    
    connection.on( 'message', async ( message ) => {
        const messageData = JSON.parse( message.toString() );
        console.log(messageData)
        const { recipient, text, file } = messageData;
        let filename = null;
        if ( file )  {
            const parts =  file.name.split('.');
            const extension = parts[parts.length - 1];
            filename = Date.now() + '.' + extension;
            const path =  __dirname + '/uploads/' + filename;
            const bufferData = Buffer.from( file.data.split(',')[1], 'base64')
            
            fs.writeFile( path, bufferData, () => {
                console.log( 'File saved: ' + path );
            });
        }
        if ( recipient && ( text || file ) ) {
            const messageDoc = await Message.create({
                sender: connection.userId,
                recipient,
                text,
                file: file ? filename : null,
            });
            [...wss.clients]
                .filter( client => client.userId === recipient )
                .forEach( c => c.send( JSON.stringify({ 
                    text, 
                    recipient,
                    file: file ? filename: null,
                    sender: connection.userId, 
                    _id: messageDoc._id,
                })));
        }
    });

    // Notify everyone about online people (when someone connects)
    notifyAboutOnlinePeople();
});

