'use strict';
/**
 * Created by shahab on 10/7/15.
 */

var Controller = require('../Controllers');
var UniversalFunctions = require('../Utils/UniversalFunctions');
var Joi = require('joi');

var non_auth_routes = [
    /*{
        method: 'DELETE',
        path: '/api/admin/deleteCustomer',
        handler: function (request, reply) {
            var phoneNo = request.query.phoneNo;
            Controller.AdminController.deleteCustomer(phoneNo, function (err, data) {
                if (err) {
                    reply(UniversalFunctions.sendError(err));
                } else {
                    reply(UniversalFunctions.sendSuccess(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.SUCCESS.DELETED))
                }
            });

        }, config: {
        description: 'ONLY FOR TESTING',
        tags: ['api', 'admin', 'customer'],
        validate: {
            query: {
                phoneNo: Joi.string().required().min(10)
            },
            failAction: UniversalFunctions.failActionFunction
        },
        plugins: {
            'hapi-swagger': {
                responseMessages: UniversalFunctions.CONFIG.APP_CONSTANTS.swaggerDefaultResponseMessages
            }
        }
    }
    }*/
   /* {
        method: 'DELETE',
        path: '/api/admin/deleteDriver',
        handler: function (request, reply) {
            var phoneNo = request.query.phoneNo;
            Controller.AdminController.deleteDriver(phoneNo, function (err, data) {
                if (err) {
                    reply(UniversalFunctions.sendError(err));
                } else {
                    reply(UniversalFunctions.sendSuccess(null))
                }
            });

        }, config: {
        description: 'ONLY FOR TESTING',
        tags: ['api', 'admin', 'driver'],
        validate: {
            query: {
                phoneNo: Joi.string().regex(/^[0-9]+$/).required().length(10)
            },
            failAction: UniversalFunctions.failActionFunction
        },
        plugins: {
            'hapi-swagger': {
                responseMessages: UniversalFunctions.CONFIG.APP_CONSTANTS.swaggerDefaultResponseMessages
            }
        }
    }
    }, */

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
    /*{
        method: 'GET'
        , path: '/api/admin/getAllCustomers'
        , handler: function (request, reply) {
        var data = request.query;
        Controller.AdminController.getCustomer(data, function (err, data) {
            if (err) {
                reply(UniversalFunctions.sendError(err));
            } else {
                reply(UniversalFunctions.sendSuccess(null, data))
            }
        });
    }, config: {
        description: 'Get List Of Customers',
        tags: ['api', 'admin'],
        validate: {
            query: {
                phoneNo: Joi.string().regex(/^[0-9]+$/).optional().length(10),
                userId: Joi.string().optional().trim(),
                appVersion: Joi.string().optional().trim(),
                deviceToken: Joi.string().optional().trim(),
                deviceType: Joi.string().optional().valid([UniversalFunctions.CONFIG.APP_CONSTANTS.DATABASE.DEVICE_TYPES.ANDROID, UniversalFunctions.CONFIG.APP_CONSTANTS.DATABASE.DEVICE_TYPES.IOS]),
                isBlocked: Joi.boolean().optional(),
                limit: Joi.number().integer().optional(),
                skip: Joi.number().integer().optional()
            },
            failAction: UniversalFunctions.failActionFunction
        },
        plugins: {
            'hapi-swagger': {
                responseMessages: UniversalFunctions.CONFIG.APP_CONSTANTS.swaggerDefaultResponseMessages
            }
        }
    }
    },*/

    /*{
        method: 'GET'
        , path: '/api/admin/getAllDrivers'
        , handler: function (request, reply) {
        var data = request.query;
        Controller.AdminController.getDriver(data, function (err, data) {
            if (err) {
                reply(UniversalFunctions.sendError(err));
            } else {
                reply(UniversalFunctions.sendSuccess(null, data))
            }
        });
    }, config: {
        description: 'Get List Of Drivers',
        tags: ['api', 'admin'],
        validate: {
            query: {
                phoneNo: Joi.string().regex(/^[0-9]+$/).optional().length(10),
                email: Joi.string().email().optional(),
                appVersion: Joi.string().optional().trim(),
                deviceToken: Joi.string().optional().trim(),
                deviceType: Joi.string().optional().valid([UniversalFunctions.CONFIG.APP_CONSTANTS.DATABASE.DEVICE_TYPES.ANDROID, UniversalFunctions.CONFIG.APP_CONSTANTS.DATABASE.DEVICE_TYPES.IOS]),
                emailVerified: Joi.boolean().optional(),
                wheelChairAccessibilityVan: Joi.boolean().optional(),
                availabilityStatus: Joi.boolean().optional(),
                isBlocked: Joi.boolean().optional(),
                limit: Joi.number().integer().optional(),
                skip: Joi.number().integer().optional()
            },
            failAction: UniversalFunctions.failActionFunction
        },
        plugins: {
            'hapi-swagger': {
                responseMessages: UniversalFunctions.CONFIG.APP_CONSTANTS.swaggerDefaultResponseMessages
            }
        }
    }
    },*/
 /*   {
        method: 'PUT'
        , path: '/api/admin/updateCustomer'
        , handler: function (request, reply) {
        var payloadData = request.payload;
        var phoneNo = request.query.phoneNo;
        Controller.AdminController.updateCustomer(phoneNo, payloadData, function (err, data) {
            if (err) {
                reply(UniversalFunctions.sendError(err));
            } else {
                reply(UniversalFunctions.sendSuccess(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.SUCCESS.UPDATED, data))
            }
        });

    }, config: {
        description: 'Update Customer',
        tags: ['api', 'admin', 'customer'],
        validate: {
            query: {
                phoneNo: Joi.string().optional().min(10).trim()
            },
            payload: {
                name: Joi.string().regex(/^[a-zA-Z ]+$/).optional().trim(),
                email: Joi.string().email().optional().trim(),
                phoneNo: Joi.string().optional().min(10).trim(),
                deviceType: Joi.string().optional().valid([UniversalFunctions.CONFIG.APP_CONSTANTS.DATABASE.DEVICE_TYPES.IOS, UniversalFunctions.CONFIG.APP_CONSTANTS.DATABASE.DEVICE_TYPES.ANDROID]),
                deviceToken: Joi.string().optional().trim(),
                appVersion: Joi.string().optional().trim(),
                isBlocked: Joi.boolean().optional()
           },
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
        method: 'GET'
        , path: '/api/admin/getAppVersion'
        , handler: function (request, reply) {
        var appType = request.query.appType;
        Controller.AppVersionController.getAppVersion(appType, function (err, data) {
            if (err) {
                reply(UniversalFunctions.sendError(err));
            } else {
                reply(UniversalFunctions.sendSuccess(null, data))
            }
        });
    }, config: {
        description: 'Get App Version',
        tags: ['api', 'admin'],
        validate: {
            query: {
                appType: Joi.string().required().valid([
                    UniversalFunctions.CONFIG.APP_CONSTANTS.DATABASE.USER_ROLES.CUSTOMER,
                    UniversalFunctions.CONFIG.APP_CONSTANTS.DATABASE.USER_ROLES.DRIVER
                ])
            },
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
        path: '/api/admin/updateAppVersion',
        handler: function (request, reply) {
        var payloadData = request.payload;
        Controller.AppVersionController.updateAppVersion(payloadData, function (err, data) {
            if (err) {
                reply(UniversalFunctions.sendError(err));
            } else {
                reply(UniversalFunctions.sendSuccess(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.SUCCESS.UPDATED, data))
            }
        });

    }, config: {
        description: 'Update App Version',
        tags: ['api', 'admin'],
        validate: {
            payload: {
                latestCriticalVersion: Joi.string().optional(),
                latestUpdatedVersion: Joi.string().optional(),
                deviceType: Joi.string().required().valid([
                    UniversalFunctions.CONFIG.APP_CONSTANTS.DATABASE.DEVICE_TYPES.IOS,
                    UniversalFunctions.CONFIG.APP_CONSTANTS.DATABASE.DEVICE_TYPES.ANDROID
                ]),
                appType: Joi.string().required().valid([
                    UniversalFunctions.CONFIG.APP_CONSTANTS.DATABASE.USER_ROLES.CUSTOMER,
                    UniversalFunctions.CONFIG.APP_CONSTANTS.DATABASE.USER_ROLES.DRIVER
                ])
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
    },*/
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
            var payloadData = request.payload;
            Controller.AdminController.approveCharity(payloadData, function (err, data) {
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
                charityId: Joi.string().optional(),
                status: Joi.string().required().valid(
                    [
                        'true',
                        'false'
                    ]
                )
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
    /*,
    {
        method: 'PUT'
        , path: '/api/admin/updateDriver'
        , handler: function (request, reply) {
        var payloadData = request.payload;
        var phoneNo = request.query.phoneNo;
        Controller.AdminController.updateDriver(phoneNo, payloadData, function (err, data) {
            if (err) {
                reply(UniversalFunctions.sendError(err));
            } else {
                reply(UniversalFunctions.sendSuccess(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.SUCCESS.UPDATED, data))
            }
        });

    }, config: {
        description: 'Update Driver',
        tags: ['api', 'admin', 'driver'],
        validate: {
            query: {
                phoneNo: Joi.string().regex(/^[0-9]+$/).length(10).required()
            },
            payload: {
                name: Joi.string().regex(/^[a-zA-Z ]+$/).optional().trim(),
                email: Joi.string().email().optional(),
                password: Joi.string().optional().length(3),
                phoneNo: Joi.string().regex(/^[0-9]+$/).length(10).optional().trim(),
                deviceType: Joi.string().optional().valid([UniversalFunctions.CONFIG.APP_CONSTANTS.DATABASE.DEVICE_TYPES.IOS, UniversalFunctions.CONFIG.APP_CONSTANTS.DATABASE.DEVICE_TYPES.ANDROID]),
                deviceToken: Joi.string().optional().trim(),
                appVersion: Joi.string().optional().trim(),
                isBlocked: Joi.boolean().optional(),
                wheelChairAccessibilityVan: Joi.boolean().optional(),
                emailVerified: Joi.boolean().optional(),
            },
            failAction: UniversalFunctions.failActionFunction
        },
        plugins: {
            'hapi-swagger': {
                responseMessages: UniversalFunctions.CONFIG.APP_CONSTANTS.swaggerDefaultResponseMessages
            }
        }
    }
    }*/
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