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
                    reply(UniversalFunctions.sendSuccess(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.SUCCESS.CREATED, data)).code(201)
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
        path: '/api/donor/getCampaigns',
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
        method: 'GET',
        path: '/api/donor/getDonations',
        handler: function (request, reply) {
            var userData = request.auth && request.auth.credentials && request.auth.credentials.userData || null;
            Controller.DonorController.getDonations(userData, function (err, data) {
                if (err) {
                    reply(UniversalFunctions.sendError(err));
                } else {
                    reply(UniversalFunctions.sendSuccess(null, data))
                }
            });
        },
        config: {
            description: 'Get all donations data',
            tags: ['api', 'Donor'],
            auth: 'DonorAuth',
            validate: {
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
        path: '/api/donor/getCharities',
        handler: function (request, reply) {

            Controller.DonorController.getCharities(function (err, data) {
                if (err) {
                    reply(UniversalFunctions.sendError(err));
                } else {
                    reply(UniversalFunctions.sendSuccess(null, data))
                }
            });
        },
        config: {
            description: 'Get all charity data',
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
        path: '/api/donor/charityDonation',
        handler: function (request, reply) {
            var userData = request.auth && request.auth.credentials && request.auth.credentials.userData || null;
            Controller.DonorController.charityDonation(request.payload, userData, function (err, data) {
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
                    charityId: Joi.string().required().trim(),
                    donatedAmount: Joi.string().required().trim(),
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
                    campaignId: Joi.string().required().trim()
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
        path: '/api/donor/getCharityById',
        handler: function (request, reply) {
            Controller.DonorController.getCharityById(request.payload, function (err, data) {
                if (err) {
                    reply(UniversalFunctions.sendError(err));
                } else {
                    reply(UniversalFunctions.sendSuccess(null, data))
                }
            });
        },
        config: {
            description: 'get charity by id.',
            tags: ['api', 'donor'],
            validate: {
                payload: {
                    charityId: Joi.string().required().trim()
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
    },
    {
        method: 'POST',
        path: '/api/donor/setFavourite',
        handler: function (request, reply) {
            var donorData = request.auth && request.auth.credentials && request.auth.credentials.userData || null;
            Controller.DonorController.setFavourite(request.payload, donorData, function (err, data) {
                if (err) {
                    reply(UniversalFunctions.sendError(err));
                } else {
                    reply(UniversalFunctions.sendSuccess(null, data))
                }
            });
        },
        config: {
            description: 'Set Favourite charity or campaign',
            tags: ['api', 'donor'],
            auth: 'DonorAuth',
            validate: {
                payload:{
                    id:Joi.string().length(24).required(),
                    type: Joi.string().required().valid(
                        [
                            'CHARITY',
                            'CAMPAIGN'
                        ]
                    ),
                    favourite: Joi.string().required().valid(
                        [
                            'true',
                            'false'
                        ]
                    )
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
        path: '/api/donor/getAllAndFavourite',
        handler: function (request, reply) {
            var donorData = request.auth && request.auth.credentials && request.auth.credentials.userData || null;
            Controller.DonorController.getFavourites(request.payload, donorData, function (err, data) {
                if (err) {
                    reply(UniversalFunctions.sendError(err));
                } else {
                    reply(UniversalFunctions.sendSuccess(null, data))
                }
            });
        },
        config: {
            description: 'Get Favourite charity or campaign',
            tags: ['api', 'donor'],
            auth: 'DonorAuth',
            validate: {
                payload:{
                    jobType: Joi.string().required().valid(
                        [
                            'FAVOURITE',
                            'ALL'
                        ]
                    ),
                    type: Joi.string().required().valid(
                        [
                            'CHARITY',
                            'CAMPAIGN'
                        ]
                    )
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
    }]