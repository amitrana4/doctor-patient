'use strict';

var mongo = {
    URI: process.env.MONGO_URI || 'mongodb://givapp_dev:cNUaaaF3f2HclDY@localhost/givapp_dev',
  //  URI: process.env.MONGO_URI || 'mongodb://localhost/givapp_dev',
    user: 'givapp_dev',
    pass: 'cNUaaaF3f2HclDY',
    port: 27017

};


module.exports = {
    mongo: mongo
};