const ws = require('ws');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const Message =  require('../models/Message');



const webSocketConfig = ( server ) => {

    // WebSocket initialization
    const wss = new ws.WebSocketServer( { server } );

    // Map that contains clients online
    const connectedClients = new Map();

    // On event
    wss.on( 'connection', ( connection, req ) => {
        
        const notifyAboutOnlinePeople = () => {
            const onlineClients = Array.from( connectedClients.values()).map( (client) => ({
                userId: client.userId,
                username: client.username
            }));
            [...wss.clients].forEach( (client) => {
                client.send( JSON.stringify({ online: onlineClients}));
            });
        }; 

        // Dead connections handler

        connection.isAlive = true;
        connection.timer = setInterval ( () => {
            connection.ping();
            connection.deathTimer = setTimeout( () => {
                connection.isAlive = false;
                clearInterval( connection.timer );
                connection.terminate();
                notifyAboutOnlinePeople();
                console.log('Zora')
            }, 1000 );
        }, 5000 );
        
        connection.on( 'pong', () => {
            clearTimeout( connection.deathTimer );
        });

        // Read username and id from the cookie for this connection

        const cookies = req.headers.cookie;
        if ( cookies ) {
            const tokenCookieString = cookies.split(';').find( str => str.startsWith('token=') );
            if ( tokenCookieString ) {

                const token = tokenCookieString.split('=')[1]
                
                if ( token ) {
                    jwt.verify( token, process.env.JWT_SECRET, {}, ( error, userData ) => {
                        if ( error ) {
                            throw new Error('Connection to webtoken')
                        }
                        const { userId, username } = userData;
                        connection.userId = userId;
                        connection.username = username;
                        connectedClients.set(connection.userId, connection);
                    })
                }
            }        
        }

        // Close event handler

        connection.on( 'close', () => {
            connectedClients.delete( connection.userId );
            notifyAboutOnlinePeople();
        });

        // Message event handler
        
        connection.on( 'message', async ( message ) => {
            const messageData = JSON.parse( message.toString() );
            const { recipient, text, file } = messageData;
            
            let filename = null;

            // Control file attachment

            if ( file )  {
                const parts =  file.name.split('.');
                const extension = parts[parts.length - 1];
                filename = Date.now() + '.' + extension;
                const uploadDirectory = path.join(__dirname, '..', 'uploads\\');
                const pathSave =  uploadDirectory + filename;
                const bufferData = Buffer.from( file.data.split(',')[1], 'base64')
                
                fs.writeFile( pathSave, bufferData, () => {
                    console.log( 'File saved: ' + pathSave );
                });
            };

            // Save and send messages

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
            };
            
        });

        // Notify everyone about online people (when someone connects)
        notifyAboutOnlinePeople();
    });
};

module.exports = {
    webSocketConfig
}