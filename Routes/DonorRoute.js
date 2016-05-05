'use strict';
/**
 * Created by shahab on 10/7/15.
 */

var Controller = require('../Controllers');
var UniversalFunctions = require('../Utils/UniversalFunctions');
var Joi = require('joi');

module.exports = [
    {
        method: 'POST',
        path: '/api/donor/register',
        handler: function (request, reply) {
            var payloadData = request.payload;
            Controller.DonorController.createDonor(payloadData, function (err, data) {
                if (err) {
                    reply(UniversalFunctions.sendError(err));
                } else {
                    reply(UniversalFunctions.sendSuccess(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.SUCCESS.CREATED, data))
                }
            });
        },
        config: {
            description: 'Register as Donor',
            tags: ['api', 'Donor'],
            validate: {
                payload: {
                    firstName: Joi.string().required().trim(),
                    lastName: Joi.string().optional().trim(),
                    emailId: Joi.string().email().required().trim(),
                    password: Joi.string().optional().min(6),
                    facebookId: Joi.string().optional().trim(),
                    deviceType: Joi.string().required().valid([UniversalFunctions.CONFIG.APP_CONSTANTS.DATABASE.DEVICE_TYPES.ANDROID, UniversalFunctions.CONFIG.APP_CONSTANTS.DATABASE.DEVICE_TYPES.IOS]),
                    deviceToken: Joi.string().required().min(1).trim(),
                    appVersion: Joi.string().required().trim()

                },
                failAction: UniversalFunctions.failActionFunction
            },
            plugins: {
                'hapi-swagger': {
                    payloadType: 'form',
                    responseMessages: UniversalFunctions.CONFIG.APP_CONSTANTS.swaggerDefaultResponseMessages
                }
            }
        }
    },
    {
        method: 'POST',
        path: '/api/donor/editProfile',
        handler: function (request, reply) {
            var userData = request.auth && request.auth.credentials && request.auth.credentials.userData || null;
            Controller.DonorController.UpdateDonor(request.payload, userData, function (err, data) {
                if (err) {
                    reply(UniversalFunctions.sendError(err));
                } else {
                    reply(UniversalFunctions.sendSuccess(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.SUCCESS.UPDATED, data))
                }
            });
        },
        config: {
            description: 'Register as Donor',
            tags: ['api', 'Donor'],
            auth: 'DonorAuth',
            validate: {
                headers: UniversalFunctions.authorizationHeaderObj,
                payload: {
                    firstName: Joi.string().optional().trim(),
                    lastName: Joi.string().optional().trim(),
                    phoneNumber: Joi.number().optional(),
                    country: Joi.string().optional().trim()
                },
                failAction: UniversalFunctions.failActionFunction
            },
            plugins: {
                'hapi-swagger': {
                    payloadType: 'form',
                    responseMessages: UniversalFunctions.CONFIG.APP_CONSTANTS.swaggerDefaultResponseMessages
                }
            }
        }
    },
    {
        method: 'PUT',
        path: '/api/donor/changePassword',
        handler: function (request, reply) {
            var userData = request.auth && request.auth.credentials && request.auth.credentials.userData || null;
            Controller.DonorController.changePassword(request.payload, userData, function (err, data) {
                if (err) {
                    reply(UniversalFunctions.sendError(err));
                } else {
                    reply(UniversalFunctions.sendSuccess(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.SUCCESS.UPDATED))
                }
            });
        },
        config: {
            description: 'Change Password of Donor',
            tags: ['api', 'donor'],
            auth: 'DonorAuth',
            validate: {
                headers: UniversalFunctions.authorizationHeaderObj,
                payload: {
                    oldPassword: Joi.string().required().min(5).trim(),
                    newPassword: Joi.string().required().min(5).trim()
                },
                failAction: UniversalFunctions.failActionFunction
            },
            plugins: {
                'hapi-swagger': {
                    payloadType: 'form',
                    responseMessages: UniversalFunctions.CONFIG.APP_CONSTANTS.swaggerDefaultResponseMessages
                }
            }
        }
    },
    {
        method: 'GET',
        path: '/api/donor/getCampaign',
        handler: function (request, reply) {

            Controller.DonorController.getCampaign(function (err, data) {
                if (err) {
                    reply(UniversalFunctions.sendError(err));
                } else {
                    reply(UniversalFunctions.sendSuccess(null, data))
                }
            });
        },
        config: {
            description: 'Get all campaign data',
            tags: ['api', 'Donor'],
            validate: {
                failAction: UniversalFunctions.failActionFunction
            },
            plugins: {
                'hapi-swagger': {
                    responseMessages: UniversalFunctions.CONFIG.APP_CONSTANTS.swaggerDefaultResponseMessages
                }
            }
        }
    },
    {
        method: 'POST',
        path: '/api/donor/donation',
        handler: function (request, reply) {
            var userData = request.auth && request.auth.credentials && request.auth.credentials.userData || null;
            Controller.DonorController.Donation(request.payload, userData, function (err, data) {
                if (err) {
                    reply(UniversalFunctions.sendError(err));
                } else {
                    reply(UniversalFunctions.sendSuccess(null, data))
                }
            });
        },
        config: {
            description: 'Register as Donor',
            tags: ['api', 'Donor'],
            auth: 'DonorAuth',
            validate: {
                headers: UniversalFunctions.authorizationHeaderObj,
                payload: {
                    campaignId: Joi.string().required().trim(),
                    donatedAmount: Joi.string().required().trim(),
                    donatedUnit: Joi.number().required(),
                    donatedCurrency: Joi.string().required().trim(),
                    cardId: Joi.string().required().trim(),
                    paymentGatewayTransactionId: Joi.string().required().trim()
                },
                failAction: UniversalFunctions.failActionFunction
            },
            plugins: {
                'hapi-swagger': {
                    payloadType: 'form',
                    responseMessages: UniversalFunctions.CONFIG.APP_CONSTANTS.swaggerDefaultResponseMessages
                }
            }
        }
    },
    {
        method: 'POST',
        path: '/api/donor/getCampaignById',
        handler: function (request, reply) {
            Controller.DonorController.getCampaignById(request.payload, function (err, data) {
                if (err) {
                    reply(UniversalFunctions.sendError(err));
                } else {
                    reply(UniversalFunctions.sendSuccess(null, data))
                }
            });
        },
        config: {
            description: 'Create donor',
            tags: ['api', 'donor'],
            validate: {
                payload: {
                    campaignId: Joi.string().optional().trim()
                },
                failAction: UniversalFunctions.failActionFunction
            },
            plugins: {
                'hapi-swagger': {
                    payloadType: 'form',
                    responseMessages: UniversalFunctions.CONFIG.APP_CONSTANTS.swaggerDefaultResponseMessages
                }
            }
        }
    },
    {
        method: 'POST',
        path: '/api/donor/login',
        handler: function (request, reply) {
            var payloadData = request.payload;
            Controller.DonorController.loginDonor(payloadData, function (err, data) {
                if (err) {
                    //console.log();
                    reply(UniversalFunctions.sendError(err));
                } else {
                    reply(UniversalFunctions.sendSuccess(null, data))
                }
            });
        },
        config: {
            description: 'Login Via Email & Password For Donor',
            tags: ['api', 'donor'],
            validate: {
                payload: {
                    email: Joi.string().email().required(),
                    password: Joi.string().required().min(5).trim(),
                    deviceType: Joi.string().required().valid([UniversalFunctions.CONFIG.APP_CONSTANTS.DATABASE.DEVICE_TYPES.ANDROID, UniversalFunctions.CONFIG.APP_CONSTANTS.DATABASE.DEVICE_TYPES.IOS]),
                    deviceToken: Joi.string().required().min(1).trim(),
                    appVersion: Joi.string().required().trim()
                },
                failAction: UniversalFunctions.failActionFunction
            },
            plugins: {
                'hapi-swagger': {
                    payloadType: 'form',
                    responseMessages: UniversalFunctions.CONFIG.APP_CONSTANTS.swaggerDefaultResponseMessages
                }
            }
        }
    },
    {
        method: 'POST',
        path: '/api/donor/addCard',
        handler: function (request, reply) {
            var donorData = request.auth && request.auth.credentials && request.auth.credentials.userData || null;
            Controller.DonorController.addCard(request.payload,donorData, function (err, data) {
                if (err) {
                    reply(UniversalFunctions.sendError(err));
                } else {
                    reply(UniversalFunctions.sendSuccess(null, data))
                }
            });
        },
        config: {
            description: 'Add Card Data',
            tags: ['api', 'donor'],
            auth: 'DonorAuth',
            validate: {
                payload: {
                    Digit:Joi.string().required().trim(),
                    payPalId:Joi.string().required().trim()
                },
                headers: UniversalFunctions.authorizationHeaderObj,
                failAction: UniversalFunctions.failActionFunction
            },
            plugins: {
                'hapi-swagger': {
                    payloadType: 'form',
                    responseMessages: UniversalFunctions.CONFIG.APP_CONSTANTS.swaggerDefaultResponseMessages
                }
            }
        }
    },
    {
        method: 'PUT',
        path: '/api/donor/setDefaultCard',
        handler: function (request, reply) {
            var donorData = request.auth && request.auth.credentials && request.auth.credentials.userData || null;
            Controller.DonorController.setDefaultCard(request.payload,donorData, function (err, data) {
                if (err) {
                    reply(UniversalFunctions.sendError(err));
                } else {
                    reply(UniversalFunctions.sendSuccess(null, data))
                }
            });
        },
        config: {
            description: 'Set Default Card',
            tags: ['api', 'donor'],
            auth: 'DonorAuth',
            validate: {
                payload:{
                    cardID:Joi.string().length(24).required()
                },
                headers: UniversalFunctions.authorizationHeaderObj,
                failAction: UniversalFunctions.failActionFunction
            },
            plugins: {
                'hapi-swagger': {
                    payloadType: 'form',
                    responseMessages: UniversalFunctions.CONFIG.APP_CONSTANTS.swaggerDefaultResponseMessages
                }
            }
        }
    },
    {
        method: 'GET',
        path: '/api/donor/listCards',
        handler: function (request, reply) {
            var donorData = request.auth && request.auth.credentials && request.auth.credentials.userData || null;
            Controller.DonorController.listCards(request.payload, donorData, function (err, data) {
                if (err) {
                    reply(UniversalFunctions.sendError(err));
                } else {
                    reply(UniversalFunctions.sendSuccess(null, data))
                }
            });
        },
        config: {
            description: 'Set Default Card',
            tags: ['api', 'donor'],
            auth: 'DonorAuth',
            validate: {
                headers: UniversalFunctions.authorizationHeaderObj,
                failAction: UniversalFunctions.failActionFunction
            },
            plugins: {
                'hapi-swagger': {
                    responseMessages: UniversalFunctions.CONFIG.APP_CONSTANTS.swaggerDefaultResponseMessages
                }
            }
        }
    },
    {
        method: 'PUT',
        path: '/api/donor/rating',
        handler: function (request, reply) {
            var donorData = request.auth && request.auth.credentials && request.auth.credentials.userData || null;
            Controller.DonorController.setRating(request.payload,donorData, function (err, data) {
                if (err) {
                    reply(UniversalFunctions.sendError(err));
                } else {
                    reply(UniversalFunctions.sendSuccess(null, data))
                }
            });
        },
        config: {
            description: 'Set Default Card',
            tags: ['api', 'donor'],
            auth: 'DonorAuth',
            validate: {
                payload:{
                    donationId:Joi.string().length(24).required(),
                    rating:Joi.number().max(5).required(),
                    comment:Joi.string().required().trim()
                },
                headers: UniversalFunctions.authorizationHeaderObj,
                failAction: UniversalFunctions.failActionFunction
            },
            plugins: {
                'hapi-swagger': {
                    payloadType: 'form',
                    responseMessages: UniversalFunctions.CONFIG.APP_CONSTANTS.swaggerDefaultResponseMessages
                }
            }
        }
    },
    {
        method: 'POST',
        path: '/api/donor/loginViaFacebook',
        handler: function (request, reply) {
            var payloadData = request.payload;
            Controller.DonorController.loginViaFacebook(payloadData, function (err, data) {
                if (err) {
                    reply(UniversalFunctions.sendError(err));
                } else {
                    reply(UniversalFunctions.sendSuccess(null, data))
                }
            });
        },
        config: {
            description: 'Login Via Facebook For  Customer',
            tags: ['api', 'customer'],
            validate: {
                payload: {
                    facebookId: Joi.string().required(),
                    deviceType: Joi.string().required().valid(
                        [
                            UniversalFunctions.CONFIG.APP_CONSTANTS.DATABASE.DEVICE_TYPES.IOS,
                            UniversalFunctions.CONFIG.APP_CONSTANTS.DATABASE.DEVICE_TYPES.ANDROID
                        ]
                    ),
                    deviceToken: Joi.string().required().trim(),
                    flushPreviousSessions: Joi.boolean().required(),
                    appVersion: Joi.string().required().trim()
                },
                failAction: UniversalFunctions.failActionFunction
            },
            plugins: {
                'hapi-swagger': {
                    payloadType : 'form',
                    responseMessages: UniversalFunctions.CONFIG.APP_CONSTANTS.swaggerDefaultResponseMessages
                }
            }
        }
    }]