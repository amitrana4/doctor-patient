'use strict';
var nodeMailer = {
    "Mandrill" : {
        host: "smtp.mandrillapp.com", // hostname
        //secureConnection: true, // use SSL
        port: 587, // port for secure SMTP
        auth: {
            user: "contact@click-labs.com",
            pass: "XpjNUzOfxEt6NO_auSKjmA"
        }
    }
};
module.exports = {
    nodeMailer: nodeMailer
};
