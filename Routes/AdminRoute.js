'use strict';
/**
 * Created by Amit on 10/7/15.
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
        path: '/api/admin/getAllPatient',
        handler: function (request, reply) {
            var userData = request.auth && request.auth.credentials && request.auth.credentials.userData;
            if (userData && userData.id) {

                Controller.AdminController.getAllPatient(function (err, data) {
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
        path: '/api/admin/getAllDoctor',
        handler: function (request, reply) {
            var userData = request.auth && request.auth.credentials && request.auth.credentials.userData;
            if (userData && userData.id) {

                Controller.AdminController.getAllDoctor(function (err, data) {
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
            description: 'Get all getAllDoctor',
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
        method: 'POST',
        path: '/api/admin/createPatient',
        handler: function (request, reply) {
            var payloadData = request.payload;
            Controller.AdminController.createPatient(payloadData, function (err, data) {
                if (err) {
                    reply(UniversalFunctions.sendError(err));
                } else {
                    reply(UniversalFunctions.sendSuccess(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.SUCCESS.CREATED, data)).code(201)
                }
            });
        },
        config: {
            description: 'create patient',
            auth: 'UserAuth',
            tags: ['api', 'admin'],
            validate: {
                payload: {
                    firstName: Joi.string().required().trim(),
                    lastName: Joi.string().optional().trim(),
                    emailId: Joi.string().email().required().trim(),
                    password: Joi.string().required().min(6),
                    facebookId: Joi.string().optional().trim(),
                    deviceType: Joi.string().required().valid([UniversalFunctions.CONFIG.APP_CONSTANTS.DATABASE.DEVICE_TYPES.ANDROID, UniversalFunctions.CONFIG.APP_CONSTANTS.DATABASE.DEVICE_TYPES.IOS]),
                    deviceToken: Joi.string().required().min(1).trim(),
                    appVersion: Joi.string().required().trim()

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
        path: '/api/admin/createDoctor',
        handler: function (request, reply) {
            var payloadData = request.payload;
            Controller.AdminController.createDoctor(payloadData, function (err, data) {
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
            validate: {
                payload: {
                    emailId: Joi.string().email().required(),
                    phoneNumber: Joi.number().optional(),
                    deviceType: Joi.string().required().valid([UniversalFunctions.CONFIG.APP_CONSTANTS.DATABASE.DEVICE_TYPES.ANDROID, UniversalFunctions.CONFIG.APP_CONSTANTS.DATABASE.DEVICE_TYPES.IOS]),
                    deviceToken: Joi.string().required().min(1).trim(),
                    appVersion: Joi.string().required().trim(),
                    password: Joi.string().required().min(5).trim(),

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
        } else if (userData && userData.type != UniversalFunctions.CONFIG.APP_CONSTANTS.DATABASE.USER_ROLES.ADMIN) {
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
        auth: 'UserAuth',
        validate: {
            failAction: UniversalFunctions.failActionFunction,
            headers: UniversalFunctions.authorizationHeaderObj
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