'use strict';
var nodeMailer = {
    "Mandrill" : {
        host: "smtp.mandrillapp.com", // hostname
        //secureConnection: true, // use SSL
        port: 587, // port for secure SMTP
        auth: {
            user: "marketing@homegenie.me",
            pass: "831hw3l3ZLCahx6Si6jfuw"
            /*user: "givapp",
            pass: "c_kyRl_lRPm5W7IcAUxRng"*/
        }
    }
};
module.exports = {
    nodeMailer: nodeMailer
};
