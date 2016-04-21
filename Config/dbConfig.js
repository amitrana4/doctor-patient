'use strict';

var mongoURL;
var user1;
var pass1;

if (process.env.NODE_ENV == 'test') {
    mongoURL = "mongodb://"+process.env.MONGO_USER_DEV+":"+process.env.MONGO_PASS_DEV+"@"+process.env.DB_IP+"/"+process.env.DB_NAME_DEV;
    user1 = process.env.MONGO_USER_DEV;
    pass1 = process.env.MONGO_PASS_DEV;
} else if (process.env.NODE_ENV == 'dev') {
    mongoURL = "mongodb://"+process.env.MONGO_USER_DEV+":"+process.env.MONGO_PASS_DEV+"@"+process.env.DB_IP+"/"+process.env.DB_NAME_DEV;
    user1 = process.env.MONGO_USER_DEV;
    pass1 = process.env.MONGO_PASS_DEV;
}else {
    //mongoURL = 'mongodb://localhost/givapp_dev',
    mongoURL = "mongodb://"+process.env.MONGO_USER_DEV+":"+process.env.MONGO_PASS_DEV+"@"+process.env.DB_IP+"/"+process.env.DB_NAME_DEV;
    user1 = process.env.MONGO_USER_DEV;
    pass1 = process.env.MONGO_PASS_DEV;
}

var mongo = {
    URI: mongoURL,
    user: user1,
    pass: pass1,
    port: 27017
};


module.exports = {
    mongo: mongo
};