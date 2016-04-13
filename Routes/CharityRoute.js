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
        path: '/api/charity/register',
        handler: function (request, reply) {
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
            payload: {
                output: 'file',
                parse: true,
                allow: 'multipart/form-data',
                maxBytes: 20485760
            },
            validate: {
                payload: {
                    name: Joi.string().regex(/^[a-zA-Z ]+$/).trim().min(2).required(),
                    charityOwnerId: Joi.string().required().trim(),
                    emailId: Joi.string().email().required(),
                    phoneNumber: Joi.string().regex(/^[0-9]+$/).min(5).required(),
                    country: Joi.string().required().trim(),
                    salesRepCode: Joi.string().optional().trim(),
                    facebookId: Joi.string().optional().trim(),
                    password: Joi.string().required().min(5).trim(),
                    taxId: Joi.string().required().trim(),
                    taxDeductionCode: Joi.string().required().trim(),
                    registrationProofFileId: Joi.any()
                        .meta({swaggerType: 'file'})
                        .required()
                        .description('image file'),
                    supportingDocumentFileId: Joi.any()
                        .meta({swaggerType: 'file'})
                        .required()
                        .description('image file')

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
        path: '/api/charity/login',
        handler: function (request, reply) {
            var payloadData = request.payload;
            Controller.CharityController.loginCharityOwner(payloadData, function (err, data) {
                if (err) {
                    //console.log();
                    reply(UniversalFunctions.sendError(err));
                } else {
                    reply(UniversalFunctions.sendSuccess(null, data))
                }
            });
        },
        config: {
            description: 'Login Via Email & Password For charity Owner',
            tags: ['api', 'charity'],
            validate: {
                payload: {
                    email: Joi.string().email().required(),
                    password: Joi.string().required().min(5).trim()
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
        path: '/api/charity/changePassword',
        handler: function (request, reply) {
            var userData = request.auth && request.auth.credentials && request.auth.credentials.userData || null;
            Controller.CharityController.changePassword(request.payload, userData, function (err, data) {
                if (err) {
                    reply(UniversalFunctions.sendError(err));
                } else {
                    reply(UniversalFunctions.sendSuccess(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.SUCCESS.UPDATED))
                }
            });
        },
        config: {
            description: 'Change Password Driver',
            tags: ['api', 'charity'],
            auth: 'CharityAuth',
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
        method: 'POST',
        path: '/api/charity/profileOne',
        handler: function (request, reply) {
            var payloadData = request.payload;
            Controller.CharityController.CharityOwnerProfileStep1(payloadData, function (err, data) {
                if (err) {
                    reply(UniversalFunctions.sendError(err));
                } else {
                    reply(UniversalFunctions.sendSuccess(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.SUCCESS.CREATED, data)).code(201)
                }
            });
        },
        config: {
            description: 'Add Profile of Charity Owner',
            tags: ['api', 'charity'],
            payload: {
                output: 'file',
                parse: true,
                allow: 'multipart/form-data',
                maxBytes: 20485760
            },
            validate: {
                payload: {
                    logoFileId: Joi.any()
                        .meta({swaggerType: 'file'})
                        .required()
                        .description('image file'),
                    foundationDate: Joi.string().required().trim(),
                    type: Joi.string().required().trim(),
                    description: Joi.string().required().trim(),
                    keyWord: Joi.string().required().trim()
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