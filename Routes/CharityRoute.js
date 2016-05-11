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
                maxBytes: 40485760
            },
            validate: {
                payload: {
                    name: Joi.string().regex(/^[a-zA-Z ]+$/).trim().min(2).required(),
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
                   console.log("XXX",err);
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
                    password: Joi.string().required().min(5).trim(),
                    deviceType: Joi.string().required().valid([UniversalFunctions.CONFIG.APP_CONSTANTS.DATABASE.DEVICE_TYPES.ANDROID, UniversalFunctions.CONFIG.APP_CONSTANTS.DATABASE.DEVICE_TYPES.IOS]),
                    deviceToken: Joi.string().required().min(1).trim(),
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
        path: '/api/charity/profile',
        handler: function (request, reply) {
            var CharityData = request.auth && request.auth.credentials && request.auth.credentials.userData || null;
            //reply(request.payload.materialImages);
            console.log(CharityData)
            Controller.CharityController.CharityOwnerProfileStep1(request.payload,CharityData, function (err, data) {
                if (err) {
                    reply(UniversalFunctions.sendError(err));
                } else {
                    reply(UniversalFunctions.sendSuccess(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.SUCCESS.DEFAULT, data))
                }
            });
        },
        config: {
            description: 'Add Profile of Charity Owner',
            tags: ['api', 'charity'],
            auth: 'CharityAuth',
            payload: {
                output: 'file',
                parse: true,
                allow: 'multipart/form-data',
                maxBytes: 40485760
            },
            validate: {
                payload: {
                    logoFileId: Joi.any()
                        .meta({swaggerType: 'file'})
                        .required()
                        .description('image file'),
                    foundationDate: Joi.date().format('YYYY-MM-DDTHH:mm:ss.SSSZ').required(),
                    type: Joi.string().required().trim(),
                    description: Joi.string().required().trim(),
                    keyWord: Joi.string().required().trim(),
                    officeAddress1: Joi.string().required().trim(),
                    officeAddress2: Joi.string().optional().trim(),
                    officeCity: Joi.string().required().trim(),
                    officeState: Joi.string().required().trim(),
                    officeCountry: Joi.string().required().trim(),
                    pictures: Joi.array().optional().max(5).description('images in array [{image1}{image2}]'),
                    videos: Joi.any()
                        .meta({swaggerType: 'file'})
                        .optional()
                        .description('video file')

                },
                headers: UniversalFunctions.authorizationHeaderObj,
                failAction: UniversalFunctions.failActionFunction
            },
            plugins: {
                'hapi-swagger': {
                    //payloadType: 'form',
                    responseMessages: UniversalFunctions.CONFIG.APP_CONSTANTS.swaggerDefaultResponseMessages
                }
            }
        }
    },
    {
        method: 'POST',
        path: '/api/charity/loginViaAccessToken',
        handler: function (request, reply) {
            var userData = request.auth && request.auth.credentials && request.auth.credentials.userData || null;
            //reply(request.payload.materialImages);
            if (userData && userData.id) {
                Controller.CharityController.loginViaAccessToken(request.payload, userData, function (err, data) {
                    if (err) {
                        reply(UniversalFunctions.sendError(err));
                    } else {
                        reply(UniversalFunctions.sendSuccess(null, data))
                    }
                });
            }
        },
        config: {
            description: 'Add Profile of Charity Owner',
            tags: ['api', 'charity'],
            auth: 'CharityAuth',
            validate: {
                payload: {
                    deviceType: Joi.string().required().valid([UniversalFunctions.CONFIG.APP_CONSTANTS.DATABASE.DEVICE_TYPES.ANDROID, UniversalFunctions.CONFIG.APP_CONSTANTS.DATABASE.DEVICE_TYPES.IOS]),
                    deviceToken: Joi.string().required().min(1).trim()

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
        path: '/api/charity/bankDetails',
        handler: function (request, reply) {
            var CharityData = request.auth && request.auth.credentials && request.auth.credentials.userData || null;
            //reply(request.payload.materialImages);
            Controller.CharityController.CharityOwnerBankDetails(request.payload,CharityData, function (err, data) {
                if (err) {
                    reply(UniversalFunctions.sendError(err));
                } else {
                    reply(UniversalFunctions.sendSuccess(null, data))
                }
            });
        },
        config: {
            description: 'Add Profile of Charity Owner',
            tags: ['api', 'charity'],
            auth: 'CharityAuth',
            validate: {
                payload: {
                    bankAccountHolderName: Joi.string().required().trim(),
                    bankAccountHolderPhoneNumber: Joi.number().required(),
                    bankAccountNumber: Joi.string().required().trim()

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
        path: '/api/charity/createCampaign',
        handler: function (request, reply) {
            var CharityData = request.auth && request.auth.credentials && request.auth.credentials.userData || null;
            //reply(request.payload.materialImages);
            Controller.CharityController.createCampaign(request.payload,CharityData, function (err, data) {
                if (err) {
                    reply(UniversalFunctions.sendError(err));
                } else {
                    reply(UniversalFunctions.sendSuccess(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.SUCCESS.DEFAULT, data))
                }
            });
        },
        config: {
            description: 'Create campaign',
            tags: ['api', 'charity'],
            auth: 'CharityAuth',
            payload: {
                output: 'file',
                parse: true,
                allow: 'multipart/form-data',
                maxBytes: 40485760
            },
            validate: {
                payload: {

                    campaignName: Joi.string().required().trim(),
                    lat: Joi.string().required(),
                    long: Joi.string().required(),
                    address: Joi.string().required().trim(),
                    description: Joi.string().required().trim(),
                    hasKeyWords: Joi.string().required().trim(),
                    mainImageFileId: Joi.any()
                        .meta({swaggerType: 'file'})
                        .required()
                        .description('image file'),
                    unitName: Joi.string().required(),
                    costPerUnit: Joi.number().required(),
                    targetUnitCount: Joi.string().regex(/^[0-9 ]+$/).required(),
                    endDate: Joi.date().min('now').format('YYYY-MM-DDTHH:mm:ss.SSSZ').required(),
                    pictures: Joi.array().optional().max(5),
                    videoLink: Joi.string().optional().trim()

                },
                headers: UniversalFunctions.authorizationHeaderObj,
                failAction: UniversalFunctions.failActionFunction
            },
            plugins: {
                'hapi-swagger': {
                    //payloadType: 'form',
                    responseMessages: UniversalFunctions.CONFIG.APP_CONSTANTS.swaggerDefaultResponseMessages
                }
            }
        }
    },
    {
        method: 'GET',
        path: '/api/charity/getCharityProfileInfo',
        handler: function (request, reply) {
            var userData = request.auth && request.auth.credentials && request.auth.credentials.userData;
            //console.log("CCasd",userData);//reply(userData);
            if (userData && userData.id) {

                Controller.CharityController.getCharityProfileInfo(userData, function (err, data) {
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
            description: 'Charity Owner Profile Info',
            auth: 'CharityAuth',
            tags: ['api', 'charity'],
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
        path: '/api/charity/campaignList',
        handler: function (request, reply) {
            var CharityData = request.auth && request.auth.credentials && request.auth.credentials.userData || null;
            //reply(request.payload.materialImages);
            Controller.CharityController.campaignList(request.payload,CharityData, function (err, data) {
                if (err) {
                    reply(UniversalFunctions.sendError(err));
                } else {
                    reply(UniversalFunctions.sendSuccess(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.SUCCESS.DEFAULT, data))
                }
            });
        },
        config: {
            description: 'Create campaign',
            tags: ['api', 'charity'],
            auth: 'CharityAuth',
            validate: {
                payload: {
                    type: Joi.string().required().valid(['COMPLETE', 'PENDING'])
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
        path: '/api/charity/getCampaignById',
        handler: function (request, reply) {
            var CharityData = request.auth && request.auth.credentials && request.auth.credentials.userData || null;
            //reply(request.payload.materialImages);
            Controller.CharityController.getCampaignById(request.payload,CharityData, function (err, data) {
                if (err) {
                    reply(UniversalFunctions.sendError(err));
                } else {
                    reply(UniversalFunctions.sendSuccess(null, data))
                }
            });
        },
        config: {
            description: 'Create campaign',
            tags: ['api', 'charity'],
            auth: 'CharityAuth',
            validate: {
                payload: {
                    campaignId: Joi.string().required().trim()
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
        path: '/api/charity/getCampaignDonors',
        handler: function (request, reply) {
            var CharityData = request.auth && request.auth.credentials && request.auth.credentials.userData || null;
            //reply(request.payload.materialImages);
            Controller.CharityController.getCampaignDonors(request.payload,CharityData, function (err, data) {
                if (err) {
                    reply(UniversalFunctions.sendError(err));
                } else {
                    reply(UniversalFunctions.sendSuccess(null, data))
                }
            });
        },
        config: {
            description: 'Create campaign',
            tags: ['api', 'charity'],
            auth: 'CharityAuth',
            validate: {
                payload: {
                    campaignId: Joi.string().optional().trim()
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
        path: '/api/charity/editCampaign',
        handler: function (request, reply) {
            var userData = request.auth && request.auth.credentials && request.auth.credentials.userData || null;
            Controller.CharityController.updateCampaign(request.payload, userData, function (err, data) {
                if (err) {
                    reply(UniversalFunctions.sendError(err));
                } else {
                    reply(UniversalFunctions.sendSuccess(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.SUCCESS.UPDATED))
                }
            });
        },
        config: {
            description: 'Edit campaign',
            tags: ['api', 'charity'],
            auth: 'CharityAuth',
            payload: {
                output: 'file',
                parse: true,
                allow: 'multipart/form-data',
                maxBytes: 40485760
            },
            validate: {
                headers: UniversalFunctions.authorizationHeaderObj,
                payload: {
                    id: Joi.string().required().trim(),
                    action: Joi.string().required().valid(['COMPLETE', 'UPDATE']),
                    campaignName: Joi.string().optional().trim(),
                    lat: Joi.string().optional(),
                    long: Joi.string().optional(),
                    address: Joi.string().optional().trim(),
                    description: Joi.string().optional().trim(),
                    hasKeyWords: Joi.string().optional().trim(),
                    mainImageFileId: Joi.any()
                        .meta({swaggerType: 'file'})
                        .optional()
                        .description('image file'),
                    unitName: Joi.string().optional(),
                    costPerUnit: Joi.number().optional(),
                    targetUnitCount: Joi.string().regex(/^[0-9 ]+$/).optional(),
                    endDate: Joi.date().min('now').format('YYYY-MM-DDTHH:mm:ss.SSSZ').optional(),
                    pictures: Joi.array().optional().max(5).description('images in array [{image1}{image2}]'),
                    videoLink: Joi.string().optional().trim()
                },
                failAction: UniversalFunctions.failActionFunction
            },
            plugins: {
                'hapi-swagger': {
                    //payloadType: 'form',
                    responseMessages: UniversalFunctions.CONFIG.APP_CONSTANTS.swaggerDefaultResponseMessages
                }
            }
        }
    },
    {
        method: 'PUT',
        path: '/api/charity/deleteProfilePictures',
        handler: function (request, reply) {
            var userData = request.auth && request.auth.credentials && request.auth.credentials.userData || null;
            Controller.CharityController.deleteProfilePictures(request.payload, userData, function (err, data) {
                if (err) {
                    reply(UniversalFunctions.sendError(err));
                } else {
                    reply(UniversalFunctions.sendSuccess(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.SUCCESS.UPDATED))
                }
            });
        },
        config: {
            description: 'Edit campaign',
            tags: ['api', 'charity'],
            auth: 'CharityAuth',
            validate: {
                headers: UniversalFunctions.authorizationHeaderObj,
                payload: {
                    imageIndex: Joi.string().required().trim()
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
        path: '/api/charity/deleteCampaignPictures',
        handler: function (request, reply) {
            var userData = request.auth && request.auth.credentials && request.auth.credentials.userData || null;
            Controller.CharityController.deleteCampaignPictures(request.payload, userData, function (err, data) {
                if (err) {
                    reply(UniversalFunctions.sendError(err));
                } else {
                    reply(UniversalFunctions.sendSuccess(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.SUCCESS.UPDATED))
                }
            });
        },
        config: {
            description: 'Edit campaign',
            tags: ['api', 'charity'],
            auth: 'CharityAuth',
            validate: {
                headers: UniversalFunctions.authorizationHeaderObj,
                payload: {
                    id: Joi.string().required().trim(),
                    imageIndex: Joi.string().required().trim()
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
        path: '/api/charity/editProfile',
        handler: function (request, reply) {
            var userData = request.auth && request.auth.credentials && request.auth.credentials.userData || null;
            Controller.CharityController.updateProfile(request.payload, userData, function (err, data) {
                if (err) {
                    reply(UniversalFunctions.sendError(err));
                } else {
                    reply(UniversalFunctions.sendSuccess(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.SUCCESS.UPDATED))
                }
            });
        },
        config: {
            description: 'Edit Profile',
            tags: ['api', 'charity'],
            auth: 'CharityAuth',
            payload: {
                output: 'file',
                parse: true,
                allow: 'multipart/form-data',
                maxBytes: 40485760
            },
            validate: {
                headers: UniversalFunctions.authorizationHeaderObj,
                payload: {
                    logoFileId: Joi.any()
                        .meta({swaggerType: 'file'})
                        .optional()
                        .description('image file'),
                    foundationDate: Joi.date().format('YYYY-MM-DDTHH:mm:ss.SSSZ').optional(),
                    type: Joi.string().optional().trim(),
                    description: Joi.string().optional().trim(),
                    keyWord: Joi.string().optional().trim(),
                    officeAddress1: Joi.string().optional().trim(),
                    officeAddress2: Joi.string().optional().trim(),
                    officeCity: Joi.string().optional().trim(),
                    officeState: Joi.string().optional().trim(),
                    officeCountry: Joi.string().optional().trim(),
                    pictures: Joi.array().optional().max(5).description('images in array [{image1}{image2}]'),
                    videos: Joi.any()
                        .meta({swaggerType: 'file'})
                        .optional()
                        .description('video file')
                },
                failAction: UniversalFunctions.failActionFunction
            },
            plugins: {
                'hapi-swagger': {
                    //payloadType: 'form',
                    responseMessages: UniversalFunctions.CONFIG.APP_CONSTANTS.swaggerDefaultResponseMessages
                }
            }
        }
    },
    {
        method: 'PUT',
        path: '/api/charity/forgotPassword',
        handler: function (request, reply) {
            Controller.CharityController.getResetPasswordToken(request.query, function (err, data) {
                if (err) {
                    reply(UniversalFunctions.sendError(err));
                } else {
                    reply(UniversalFunctions.sendSuccess(null, data))
                }
            });
        },
        config: {
            description: 'Sends Reset Password Token To Charity',
            tags: ['api', 'charity'],
            validate: {
                query: {
                    email: Joi.string().email().optional()
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
        path: '/api/charity/logout',
        handler: function (request, reply) {
            var userData = request.auth && request.auth.credentials && request.auth.credentials.userData || null;
            Controller.CharityController.logoutCharity(userData, function (err, data) {
                if (err) {
                    reply(UniversalFunctions.sendError(err));
                } else {
                    reply(UniversalFunctions.sendSuccess())
                }
            });
        },
        config: {
            description: 'Edit Profile',
            tags: ['api', 'charity'],
            auth: 'CharityAuth',
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
    }
]