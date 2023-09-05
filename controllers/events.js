const { response } = require('express');
const Message =  require('../models/Message');
const { getUserDataFromReq } = require('../helpers/getUserDataFromReq');


const messages = async ( req, res ) => {

    const { userId } = req.params;
    const userData = await getUserDataFromReq( req );
    const ourUserId = userData.userId;
    const messages = await Message.find({
        sender: { $in: [userId, ourUserId] },
        recipient: { $in: [userId, ourUserId] },
    }).sort({ sortedAt: 1 }).exec();
    res.json( messages );

};

module.exports = {
    messages
};