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
                    password: Joi.string().required().min(6)

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
                    reply(UniversalFunctions.sendSuccess(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.SUCCESS.CREATED, data)).code(201)
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
            var userData = request.auth && request.auth.credentials && request.auth.credentials.userData;
            //console.log("CCasd",userData);//reply(userData);
            if (userData && userData.id) {

                Controller.DonorController.getCampaign(userData, function (err, data) {
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
            description: 'Get all campaign data',
            auth: 'DonorAuth',
            tags: ['api', 'Donor'],
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
    }]
