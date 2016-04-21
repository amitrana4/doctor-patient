'use strict';

var mongoURL;
var user1;
var pass1;

if (process.env.NODE_ENV == 'test') {
    mongoURL = "mongodb://givapp_dev:cNUaaaF3f2HclDY@localhost/givapp_dev";
    user1 = 'givapp_dev';
    pass1 = 'cNUaaaF3f2HclDY';
} else if (process.env.NODE_ENV == 'dev') {
    mongoURL = "mongodb://givapp_dev:cNUaaaF3f2HclDY@localhost/givapp_dev";
    user1 = 'givapp_dev';
    pass1 = 'cNUaaaF3f2HclDY';
}else {
    mongoURL = "mongodb://givapp_dev:cNUaaaF3f2HclDY@localhost/givapp_dev";
    //mongoURL = 'mongodb://localhost/givapp_dev',
    user1 = 'givapp_dev';
    pass1 = 'cNUaaaF3f2HclDY';
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