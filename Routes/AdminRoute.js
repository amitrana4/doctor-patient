'use strict';
/**
 * Created by shahab on 10/7/15.
 */

var Controller = require('../Controllers');
var UniversalFunctions = require('../Utils/UniversalFunctions');
var Joi = require('joi');

var non_auth_routes = [


    {
        method: 'POST',
        path: '/api/admin/login',
        config: {
            description: 'Login for Super Admin',
            tags: ['api', 'admin'],
            handler: function (request, reply) {
                var queryData = {
                    email: request.payload.email,
                    password: request.payload.password,
                    ipAddress: request.info.remoteAddress || null
                };
                Controller.AdminController.adminLogin(queryData, function (err, data) {
                    if (err) {
                        reply(UniversalFunctions.sendError(err))
                    } else {
                        reply(UniversalFunctions.sendSuccess(null, data))
                    }
                })
            },
            validate: {
                failAction: UniversalFunctions.failActionFunction,
                payload: {
                    email: Joi.string().email().required(),
                    password: Joi.string().required()
                }
            },
            plugins: {
                'hapi-swagger': {
                    responseMessages: UniversalFunctions.CONFIG.APP_CONSTANTS.swaggerDefaultResponseMessages
                }
            }
        }
    }

];

var userRoutes = [

    {
        method: 'GET',
        path: '/api/admin/getAllCharity',
        handler: function (request, reply) {
            var userData = request.auth && request.auth.credentials && request.auth.credentials.userData;
            if (userData && userData.id) {

                Controller.AdminController.getAllCharity(userData, function (err, data) {
                    if (err) {
                        reply(UniversalFunctions.sendError(err));
                    } else {
                        reply(UniversalFunctions.sendSuccess(null, data))
                    }
                });
            } else {
                reply(UniversalFunctions.sendError(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR));
            }
        },
        config: {
            description: 'Get all charity',
            auth: 'UserAuth',
            tags: ['api', 'admin'],
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
        method: 'GET',
        path: '/api/admin/getAllDonors',
        handler: function (request, reply) {
            var userData = request.auth && request.auth.credentials && request.auth.credentials.userData;
            if (userData && userData.id) {

                Controller.AdminController.getAllDonors(userData, function (err, data) {
                    if (err) {
                        reply(UniversalFunctions.sendError(err));
                    } else {
                        reply(UniversalFunctions.sendSuccess(null, data))
                    }
                });
            } else {
                reply(UniversalFunctions.sendError(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR));
            }
        },
        config: {
            description: 'Get all charity',
            auth: 'UserAuth',
            tags: ['api', 'admin'],
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
        method: 'GET',
        path: '/api/admin/getAllCampaign',
        handler: function (request, reply) {
            var userData = request.auth && request.auth.credentials && request.auth.credentials.userData;
            if (userData && userData.id) {

                Controller.AdminController.getAllCampaign(userData, function (err, data) {
                    if (err) {
                        reply(UniversalFunctions.sendError(err));
                    } else {
                        reply(UniversalFunctions.sendSuccess(null, data))
                    }
                });
            } else {
                reply(UniversalFunctions.sendError(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR));
            }
        },
        config: {
            description: 'Get all charity',
            auth: 'UserAuth',
            tags: ['api', 'admin'],
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
        path: '/api/admin/approveCharity',
        handler: function (request, reply) {
            var AdminData = request.auth && request.auth.credentials && request.auth.credentials.userData || null;
            Controller.AdminController.approveCharity(request.payload, AdminData, function (err, data) {
                if (err) {
                    reply(UniversalFunctions.sendError(err));
                } else {
                    reply(UniversalFunctions.sendSuccess(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.SUCCESS.UPDATED, data))
                }
            });

        }, config: {
        description: 'Approve Charity',
        auth: 'UserAuth',
        tags: ['api', 'admin'],
        validate: {
            payload: {
                charityId: Joi.string().required(),
                status: Joi.string().required().valid(
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
        path: '/api/admin/addCharity',
        handler: function (request, reply) {
            var AdminData = request.auth && request.auth.credentials && request.auth.credentials.userData || null;
            var payloadData = request.payload;
            Controller.CharityController.createCharityOwner(payloadData, function (err, data) {
                if (err) {
                    reply(UniversalFunctions.sendError(err));
                } else {
                    reply(UniversalFunctions.sendSuccess(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.SUCCESS.CREATED, data)).code(201)
                }
            });
        },
        config: {
            description: 'Register Charity Owner',
            tags: ['api', 'charity'],
            auth: 'UserAuth',
            payload: {
                output: 'file',
                parse: true,
                allow: 'multipart/form-data',
                maxBytes: 40485760
            },
            validate: {
                payload: {
                    name: Joi.string().regex(/^[a-zA-Z -]+$/).trim().min(2).required(),
                    charityRegistrationNo: Joi.number().required(),
                    website: Joi.string().required().trim(),
                    contactPerson: Joi.string().required().trim(),
                    emailId: Joi.string().email().required(),
                    phoneNumber: Joi.number().required(),
                    countryCode: Joi.string().required().trim(),
                    country: Joi.string().required().trim(),
                    salesRepCode: Joi.string().optional().trim(),
                    deviceType: Joi.string().required().valid([UniversalFunctions.CONFIG.APP_CONSTANTS.DATABASE.DEVICE_TYPES.ANDROID, UniversalFunctions.CONFIG.APP_CONSTANTS.DATABASE.DEVICE_TYPES.IOS]),
                    deviceToken: Joi.string().required().min(1).trim(),
                    appVersion: Joi.string().required().trim(),
                    password: Joi.string().required().min(5).trim(),
                    taxId: Joi.string().required().trim(),
                    taxDeductionCode: Joi.string().required().trim(),
                    hasKeyWords: Joi.string().required().trim(),
                    registrationProofFileId: Joi.any()
                        .meta({swaggerType: 'file'})
                        .required()
                        .description('image file'),
                    supportingDocumentFileId: Joi.any()
                        .meta({swaggerType: 'file'})
                        .required()
                        .description('image file')

                },
                headers: UniversalFunctions.authorizationHeaderObj,
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
];

var adminLogin = [
    {
        method: 'PUT'
        , path: '/api/admin/logout'
        , handler: function (request, reply) {
        var token = request.auth.credentials.token;
        var userData = request.auth.credentials.userData;
        if (!token) {
            reply(UniversalFunctions.sendError(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.INVALID_TOKEN));
        } else if (userData && userData.role != UniversalFunctions.CONFIG.APP_CONSTANTS.DATABASE.USER_ROLES.ADMIN) {
            reply(UniversalFunctions.sendError(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.UNAUTHORIZED))
        } else {
            Controller.AdminController.adminLogout(token, function (err, data) {
                if (err) {
                    reply(UniversalFunctions.sendError(err));
                } else {
                    reply(UniversalFunctions.sendSuccess())
                }
            });

        }
    }, config: {
        description: 'Logout for Super Admin',
        tags: ['api', 'admin'],
        validate: {
            failAction: UniversalFunctions.failActionFunction
        },
        plugins: {
            'hapi-swagger': {
                responseMessages: UniversalFunctions.CONFIG.APP_CONSTANTS.swaggerDefaultResponseMessages
            }
        }
    }
    }
];


var authRoutes = [].concat(userRoutes, adminLogin);

module.exports = authRoutes.concat(non_auth_routes);