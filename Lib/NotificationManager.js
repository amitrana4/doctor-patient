'use strict';
/**
 * Created by shahab on 12/7/15.
 */
var Config = require('../Config');
var async = require('async');

var client = require('twilio')(Config.smsConfig.twilioCredentials.accountSid, Config.smsConfig.twilioCredentials.authToken);
var nodeMailerModule = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');
var transporter = nodeMailerModule.createTransport(smtpTransport(Config.emailConfig.nodeMailer.Mandrill));

var sendPUSHToUser = function (pushToSend, callback) {
    callback();
};

var sendSMSToUser = function (four_digit_verification_code, countryCode, phoneNo, externalCB) {
    console.log('sendSMSToUser')

    var templateData = Config.APP_CONSTANTS.notificationMessages.verificationCodeMsg;
    var variableDetails = {
        four_digit_verification_code: four_digit_verification_code
    };

    var smsOptions = {
        from: Config.smsConfig.twilioCredentials.smsFromNumber,
        To: countryCode + phoneNo.toString(),
        Body: null
    };

    async.series([
        function (internalCallback) {
            smsOptions.Body = renderMessageFromTemplateAndVariables(templateData, variableDetails);
            internalCallback();
        }, function (internalCallback) {
            sendSMS(smsOptions, function (err, res) {
                internalCallback(err, res);
            })
        }
    ], function (err, responses) {
        if (err) {
            externalCB(err);
        } else {
            externalCB(null, Config.APP_CONSTANTS.STATUS_MSG.SUCCESS.DEFAULT);
        }
    });
};


var sendEmailToUser = function (emailType ,emailVariables, emailId, callback) {
    var mailOptions = {
        from: 'support@boohol.com',
        to: emailId,
        subject: null,
        html: null
    };
    async.series([
        function(cb){
            switch (emailType){
                case 'REGISTRATION_MAIL' :
                    mailOptions.subject = Config.APP_CONSTANTS.notificationMessages.registrationEmail.emailSubject;
                    mailOptions.html = renderMessageFromTemplateAndVariables(Config.APP_CONSTANTS.notificationMessages.registrationEmail.emailMessage, emailVariables) ;
                    break;
                case 'FORGOT_PASSWORD' :
                    mailOptions.subject = Config.APP_CONSTANTS.notificationMessages.forgotPassword.emailSubject;
                    mailOptions.html = renderMessageFromTemplateAndVariables(Config.APP_CONSTANTS.notificationMessages.forgotPassword.emailMessage, emailVariables) ;
                    break;
                case 'DRIVER_CONTACT_FORM' :
                    mailOptions.subject = Config.APP_CONSTANTS.notificationMessages.contactDriverForm.emailSubject;
                    mailOptions.html = renderMessageFromTemplateAndVariables(Config.APP_CONSTANTS.notificationMessages.contactDriverForm.emailMessage, emailVariables) ;
                    break;
                case 'BUSINESS_CONTACT_FORM' :
                    mailOptions.subject = Config.APP_CONSTANTS.notificationMessages.contactBusinessForm.emailSubject;
                    mailOptions.html = renderMessageFromTemplateAndVariables(Config.APP_CONSTANTS.notificationMessages.contactBusinessForm.emailMessage, emailVariables) ;
                    break;
            }
            cb();

        },function(cb){
            sendMailViaTransporter(mailOptions, function(err,res){
                cb(err,res);
            })
        }
    ], function (err, responses) {
        if (err){
            callback(err);
        }else {
            callback();
        }
    });

};

function renderMessageFromTemplateAndVariables(templateData, variablesData) {
    var Handlebars = require('handlebars');
    return Handlebars.compile(templateData)(variablesData);
}

/*
 @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
 @ sendSMS Function
 @ This function will initiate sending sms as per the smsOptions are set
 @ Requires following parameters in smsOptions
 @ from:  // sender address
 @ to:  // list of receivers
 @ Body:  // SMS text message
 @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
 */
function sendSMS(smsOptions, cb) {
    client.messages.create(smsOptions, function (err, message) {
        console.log('SMS RES', err, message);
        if (err) {
            console.log(err)
        }
        else {
            console.log(message.sid);
        }
    });
    cb(null, null); // Callback is outside as sms sending confirmation can get delayed by a lot of time
}


/*
 ==========================================================
 Send the notification to the iOS device for customer
 ==========================================================
 */
function sendIosPushNotification(iosDeviceToken, message, payload) {

    console.log(payload);

    console.log(config.iOSPushSettings.iosApnCertificate);
    console.log(config.iOSPushSettings.gateway);

    if (payload.address) {
        payload.address = '';
    }
    var status = 1;
    var msg = message;
    var snd = 'ping.aiff';
    //if (flag == 4 || flag == 6) {
    //    status = 0;
    //    msg = '';
    //    snd = '';
    //}


    var options = {
        cert: config.iOSPushSettings.iosApnCertificate,
        certData: null,
        key: config.iOSPushSettings.iosApnCertificate,
        keyData: null,
        passphrase: 'BooholPass',
        ca: null,
        pfx: null,
        pfxData: null,
        gateway: config.iOSPushSettings.gateway,
        port: 2195,
        rejectUnauthorized: true,
        enhanced: true,
        cacheLength: 100,
        autoAdjustCache: true,
        connectionTimeout: 0,
        ssl: true
    };


    var deviceToken = new apns.Device(iosDeviceToken);
    var apnsConnection = new apns.Connection(options);
    var note = new apns.Notification();

    note.expiry = Math.floor(Date.now() / 1000) + 3600;
    note.contentAvailable = 1;
    note.sound = snd;
    note.alert = msg;
    note.newsstandAvailable = status;
    note.payload = {message: payload};

    apnsConnection.pushNotification(note, deviceToken);

    // Handle these events to confirm that the notification gets
    // transmitted to the APN server or find error if any
    function log(type) {
        return function () {
            if (debugging_enabled)
                console.log("iOS PUSH NOTIFICATION RESULT: " + type);
        }
    }

    apnsConnection.on('error', log('error'));
    apnsConnection.on('transmitted', log('transmitted'));
    apnsConnection.on('timeout', log('timeout'));
    apnsConnection.on('connected', log('connected'));
    apnsConnection.on('disconnected', log('disconnected'));
    apnsConnection.on('socketError', log('socketError'));
    apnsConnection.on('transmissionError', log('transmissionError'));
    apnsConnection.on('cacheTooSmall', log('cacheTooSmall'));

}


/*
 ==============================================
 Send the notification to the android device
 =============================================
 */
function sendAndroidPushNotification(deviceToken, message) {

    console.log(message)

    var message = new gcm.Message({
        collapseKey: 'demo',
        delayWhileIdle: false,
        timeToLive: 2419200,
        data: {
            message: message,
            brand_name: config.androidPushSettings.brandName
        }
    });
    var sender = new gcm.Sender(config.androidPushSettings.gcmSender);
    var registrationIds = [];
    registrationIds.push(deviceToken);

    sender.send(message, registrationIds, 4, function (err, result) {
        if (debugging_enabled) {
            console.log("ANDROID NOTIFICATION RESULT: " + JSON.stringify(result));
            console.log("ANDROID NOTIFICATION ERROR: " + JSON.stringify(err));
        }
    });
}

/*
 @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
 @ sendMailViaTransporter Function
 @ This function will initiate sending email as per the mailOptions are set
 @ Requires following parameters in mailOptions
 @ from:  // sender address
 @ to:  // list of receivers
 @ subject:  // Subject line
 @ html: html body
 @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
 */
function sendMailViaTransporter(mailOptions, cb) {
    transporter.sendMail(mailOptions, function (error, info) {
        console.log('Mail Sent Callback Error:',error);
        console.log('Mail Sent Callback Ifo:',info);
    });
    cb(null, null) // Callback is outside as mail sending confirmation can get delayed by a lot of time
}

module.exports = {
    sendSMSToUser: sendSMSToUser,
    sendEmailToUser: sendEmailToUser,
    sendPUSHToUser: sendPUSHToUser
};