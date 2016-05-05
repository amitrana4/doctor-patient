'use strict';



var PORT;

if (process.env.NODE_ENV == 'test') {
    PORT = 8001;
} else if (process.env.NODE_ENV == 'dev') {
    PORT = 8002;
} else {
    PORT = 8000;
}


var DOMAIN_NAME_MAIL = 'http://52.91.44.245:'+PORT;
var SERVER = {
    APP_NAME: 'Your App Name',
    PORTS: {
        HAPI: PORT
    },
    TOKEN_EXPIRATION_IN_MINUTES: 600,
    JWT_SECRET_KEY: 'sUPerSeCuREKeY&^$^&$^%$^%7782348723t4872t34Ends',
    GOOGLE_API_KEY : 'AIzaSyBO2bhirASSGwMDzaO64hisl7CMDX1_Whg',
    COUNTRY_CODE : '+91',
    MAX_DISTANCE_RADIUS_TO_SEARCH : '1',
    THUMB_WIDTH : 50,
    THUMB_HEIGHT : 50,
    BASE_DELIVERY_FEE : 25,
    COST_PER_KM: 9, // In USD
    DOMAIN_NAME : 'http://localhost:8000/',
    SUPPORT_EMAIL : 'support@click-labs.com'
};

var DATABASE = {
    PROFILE_PIC_PREFIX : {
        ORIGINAL : 'profilePic_',
        THUMB : 'profileThumb_'
    },
    LOGO_PREFIX : {
        ORIGINAL : 'logo_',
        THUMB : 'logoThumb_'
    },
    DOCUMENT_PREFIX : 'document_',
    USER_ROLES: {
        ADMIN: 'ADMIN',
        CUSTOMER: 'CUSTOMER',
        DRIVER: 'DRIVER',
        CHARITYOWNER : 'CHARITYOWNER',
        DONOR : 'DONOR'
    },
    FILE_TYPES: {
        LOGO: 'LOGO',
        DOCUMENT: 'DOCUMENT',
        OTHERS: 'OTHERS'
    },
    VEHICLE_TYPE: {
        BICYCLE: 'BICYCLE',
        SCOOTER: 'SCOOTER',
        CAR: 'CAR'
    },
    DEVICE_TYPES: {
        IOS: 'IOS',
        ANDROID: 'ANDROID'
    },
    LANGUAGE: {
        EN: 'EN',
        ES_MX: 'ES_MX'
    },
    PAYMENT_OPTIONS : {
        CREDIT_DEBIT_CARD : 'CREDIT_DEBIT_CARD',
        PAYPAL : 'PAYPAL',
        BITCOIN : 'BITCOIN',
        GOOGLE_WALLET : 'GOOGLE_WALLET',
        APPLE_PAY : 'APPLE_PAY',
        EIYA_CASH : 'EIYA_CASH'
    }
};

var STATUS_MSG = {
    ERROR: {
        INVALID_USER_PASS: {
            statusCode:401,
            type: 'INVALID_USER_PASS',
            customMessage : 'Invalid username or password'
        },
        TOKEN_ALREADY_EXPIRED: {
            statusCode:401,
            customMessage : 'Token Already Expired',
            type : 'TOKEN_ALREADY_EXPIRED'
        },
        DB_ERROR: {
            statusCode:400,
            customMessage : 'DB Error : ',
            type : 'DB_ERROR'
        },
        INVALID_ID: {
            statusCode:400,
            customMessage : 'Invalid Id Provided',
            type : 'INVALID_ID'
        },
        INVALID_CARDID: {
            statusCode:400,
            customMessage : 'Invalid Card Id',
            type : 'INVALID_CARDID'
        },
        APP_ERROR: {
            statusCode:400,
            customMessage : 'Application Error',
            type : 'APP_ERROR'
        },
        ADDRESS_NOT_FOUND: {
            statusCode:400,
            customMessage : 'Address not found',
            type : 'ADDRESS_NOT_FOUND'
        },
        SAME_ADDRESS_ID: {
            statusCode:400,
            customMessage : 'Pickup and Delivery Address Cannot Be Same',
            type : 'SAME_ADDRESS_ID'
        },
        PICKUP_ADDRESS_NOT_FOUND: {
            statusCode:400,
            customMessage : 'Pickup Address not found',
            type : 'PICKUP_ADDRESS_NOT_FOUND'
        },
        DELIVERY_ADDRESS_NOT_FOUND: {
            statusCode:400,
            customMessage : 'Delivery Address not found',
            type : 'DELIVERY_ADDRESS_NOT_FOUND'
        },
        IMP_ERROR: {
            statusCode:500,
            customMessage : 'Implementation Error',
            type : 'IMP_ERROR'
        },
        APP_VERSION_ERROR: {
            statusCode:400,
            customMessage : 'One of the latest version or updated version value must be present',
            type : 'APP_VERSION_ERROR'
        },
        INVALID_TOKEN: {
            statusCode:401,
            customMessage : 'Invalid token provided',
            type : 'INVALID_TOKEN'
        },
        INVALID_CODE: {
            statusCode:400,
            customMessage : 'Invalid Verification Code',
            type : 'INVALID_CODE'
        },
        DEFAULT: {
            statusCode:400,
            customMessage : 'Error',
            type : 'DEFAULT'
        },
        PHONE_NO_EXIST: {
            statusCode:400,
            customMessage : 'Phone No Already Exist',
            type : 'PHONE_NO_EXIST'
        },
        EMAIL_EXIST: {
            statusCode:400,
            customMessage : 'Email Already Exist',
            type : 'EMAIL_EXIST'
        },
        DUPLICATE: {
            statusCode:400,
            customMessage : 'Duplicate Entry',
            type : 'DUPLICATE'
        },
        DUPLICATE_ADDRESS: {
            statusCode:400,
            customMessage : 'Address Already Exist',
            type : 'DUPLICATE_ADDRESS'
        },
        UNIQUE_CODE_LIMIT_REACHED: {
            statusCode:400,
            customMessage : 'Cannot Generate Unique Code, All combinations are used',
            type : 'UNIQUE_CODE_LIMIT_REACHED'
        },
        INVALID_REFERRAL_CODE: {
            statusCode:400,
            customMessage : 'Invalid Referral Code',
            type : 'INVALID_REFERRAL_CODE'
        },
        FACEBOOK_ID_PASSWORD_ERROR: {
            statusCode:400,
            customMessage : 'Only one field should be filled at a time, either facebookId or password',
            type : 'FACEBOOK_ID_PASSWORD_ERROR'
        },
        INVALID_EMAIL: {
            statusCode:400,
            customMessage : 'Invalid Email Address',
            type : 'INVALID_EMAIL'
        },
        CARD_DIGIT_REQUIRED: {
            statusCode:400,
            customMessage : 'Card last 3 digit required',
            type : 'CARD_DIGIT_REQUIRED'
        },
        PAYPALID_REQUIRED: {
            statusCode:400,
            customMessage : 'PAypal Id required',
            type : 'PAYPALID_REQUIRED'
        },
        PASSWORD_REQUIRED: {
            statusCode:400,
            customMessage : 'Password is required',
            type : 'PASSWORD_REQUIRED'
        },
        INVALID_COUNTRY_CODE: {
            statusCode:400,
            customMessage : 'Invalid Country Code, Should be in the format +52',
            type : 'INVALID_COUNTRY_CODE'
        },
        INVALID_PHONE_NO_FORMAT: {
            statusCode:400,
            customMessage : 'Phone no. cannot start with 0',
            type : 'INVALID_PHONE_NO_FORMAT'
        },
        CHARITYOWNERID: {
            statusCode:400,
            customMessage : 'Charity Owner Id Required',
            type : 'INVALID_CHARITY_ID'
        },
        COUNTRY_REQUIRED: {
            statusCode:400,
            customMessage : 'Country is Required',
            type : 'COUNTRY_REQUIRED'
        },
        REGISTRATIONNUMBER_REQUIRED: {
            statusCode:400,
            customMessage : 'Charity Registration Number is Required',
            type : 'REGISTRATIONNUMBER_REQUIRED'
        },
        STATE_REQUIRED: {
            statusCode:400,
            customMessage : 'State is Required',
            type : 'STATE_REQUIRED'
        },
        NAME_REQUIRED: {
            statusCode:400,
            customMessage : 'Name is Required',
            type : 'NAME_REQUIRED'
        },
        PROFILE_INCOMPLETE: {
            statusCode:400,
            customMessage : 'Please complete your profile',
            type : 'PROFILE_INCOMPLETE'
        },
        LOCATION_REQUIRED: {
            statusCode:400,
            customMessage : 'Location is Required',
            type : 'LOCATION_REQUIRED'
        },
        CITY_REQUIRED: {
            statusCode:400,
            customMessage : 'City is Required',
            type : 'City_REQUIRED'
        },
        FOUNDATIONDATE_REQUIRED: {
            statusCode:400,
            customMessage : 'Foundation date is Required',
            type : 'FOUNDATION_DATE_REQUIRED'
        },
        UNITNAME_REQUIRED: {
            statusCode:400,
            customMessage : 'Unit Name is Required',
            type : 'UNITNAME_REQUIRED'
        },
        OFFICEADDRESS1_REQUIRED: {
            statusCode:400,
            customMessage : 'Office Address1 is Required',
            type : 'OFFICEADDRESS1_REQUIRED'
        },
        BANKACCOUNTHOLDERNAME_REQUIRED: {
            statusCode:400,
            customMessage : 'Bank Account Holder Name is Required',
            type : 'BANKACCOUNTHOLDERNAME_REQUIRED'
        },
        BANKACCOUNTHOLDERPHONE_REQUIRED: {
            statusCode:400,
            customMessage : 'Bank Account Holder Phone Number is Required',
            type : 'BANKACCOUNTHOLDERPHONE_REQUIRED'
        },
        BANKACCOUNTHOLDERACCNUMBER_REQUIRED: {
            statusCode:400,
            customMessage : 'Bank Account Holder Account Number is Required',
            type : 'BANKACCOUNTHOLDERACCNUMBER_REQUIRED'
        },
        TYPE_REQUIRED: {
            statusCode:400,
            customMessage : 'Type of charity is Required',
            type : 'TYPE_OF_CHARITY_REQUIRED'
        },
        COSTPERUNIT_REQUIRED: {
            statusCode:400,
            customMessage : 'Cost per unit is Required',
            type : 'COSTPERUNIT_REQUIRED'
        },
        DESCRIPTION_REQUIRED: {
            statusCode:400,
            customMessage : 'Description is Required',
            type : 'DESCRIPTION_REQUIRED'
        },
        TARGETUNITCOUNT_REQUIRED: {
            statusCode:400,
            customMessage : 'Target for unit count is Required',
            type : 'TARGETUNITCOUNT_REQUIRED'
        },
        RECORD_NOT_FOUND: {
            statusCode:400,
            customMessage : 'Records not found.',
            type : 'RECORD_NOT_FOUND'
        },
        CAMPAIGNENDDATE_REQUIRED: {
            statusCode:400,
            customMessage : 'Campaign end date is Required',
            type : 'CAMPAIGNENDDATE_REQUIRED'
        },
        KEYWORD_REQUIRED: {
            statusCode:400,
            customMessage : 'Keyword is Required',
            type : 'DESCRIPTION_REQUIRED'
        },
        VIDEO_REQUIRED: {
            statusCode:400,
            customMessage : 'Video is Required',
            type : 'VIDEO_REQUIRED'
        },
        LOGO_FILE_REQUIRED: {
            statusCode:400,
            customMessage : 'Logo is Required',
            type : 'LOGO_FILE_REQUIRED'
        },
        TAXID_REQUIRED: {
            statusCode:400,
            customMessage : 'TAX id Required',
            type : 'TAX_ID_REQUIRED'
        },
        TAXDEDUCTIONCODE_REQUIRED: {
            statusCode:400,
            customMessage : 'TAX Deduction code Required',
            type : 'TAX_DEDUCTION_CODE_REQUIRED'
        },
        COUNTRY_CODE_MISSING: {
            statusCode:400,
            customMessage : 'You forgot to enter the country code',
            type : 'COUNTRY_CODE_MISSING'
        },
        INVALID_PHONE_NO: {
            statusCode:400,
            customMessage : 'Phone No. & Country Code does not match to which the OTP was sent',
            type : 'INVALID_PHONE_NO'
        },
        PHONE_NO_MISSING: {
            statusCode:400,
            customMessage : 'You forgot to enter the phone no.',
            type : 'PHONE_NO_MISSING'
        },
        NOTHING_TO_UPDATE: {
            statusCode:400,
            customMessage : 'Nothing to update',
            type : 'NOTHING_TO_UPDATE'
        },
        NOT_FOUND: {
            statusCode:400,
            customMessage : 'User Not Found',
            type : 'NOT_FOUND'
        },
        INVALID_RESET_PASSWORD_TOKEN: {
            statusCode:400,
            customMessage : 'Invalid Reset Password Token',
            type : 'INVALID_RESET_PASSWORD_TOKEN'
        },
        INCORRECT_PASSWORD: {
            statusCode:400,
            customMessage : 'Incorrect Password',
            type : 'INCORRECT_PASSWORD'
        },
        VALUE_EXIST: {
            statusCode:400,
            customMessage : 'Value Exist',
            type : 'VALUE_EXIST'
        },
        EMPTY_VALUE: {
            statusCode:400,
            customMessage : 'Empty String Not Allowed',
            type : 'EMPTY_VALUE'
        },
        PHONE_NOT_MATCH: {
            statusCode:400,
            customMessage : "Phone No. Doesn't Match",
            type : 'PHONE_NOT_MATCH'
        },
        SAME_PASSWORD: {
            statusCode:400,
            customMessage : 'Old password and new password are same',
            type : 'SAME_PASSWORD'
        },
        ACTIVE_PREVIOUS_SESSIONS: {
            statusCode:400,
            customMessage : 'You already have previous active sessions, confirm for flush',
            type : 'ACTIVE_PREVIOUS_SESSIONS'
        },
        EMAIL_ALREADY_EXIST: {
            statusCode:400,
            customMessage : 'Email Address Already Exists',
            type : 'EMAIL_ALREADY_EXIST'
        },
        FACEBOOK_ID_EXIST: {
            statusCode:400,
            customMessage : 'Facebook ID Already Exists',
            type : 'FACEBOOK_ID_EXIST'
        },
        CHARITYREGNO_ALREADY_EXIST: {
            statusCode:400,
            customMessage : 'charityRegistrationNo Already Exists',
            type : 'CHARITYREGNO_ALREADY_EXIST'
        },
        ERROR_PROFILE_PIC_UPLOAD: {
            statusCode:400,
            customMessage : 'Profile pic is not a valid file',
            type : 'ERROR_PROFILE_PIC_UPLOAD'
        },
        PHONE_ALREADY_EXIST: {
            statusCode:400,
            customMessage : 'Phone No. Already Exists',
            type : 'PHONE_ALREADY_EXIST'
        },
        CAMPAIGN_EXIST: {
            statusCode:400,
            customMessage : 'Campaign name already exist.',
            type : 'CAMPAIGN_EXIST'
        },
        CARD_EXIST: {
            statusCode:400,
            customMessage : 'Card already exist.',
            type : 'CARD_EXIST'
        },
        CAMPAIGN_CLOSED: {
            statusCode:400,
            customMessage : 'Campaign is closed.',
            type : 'CAMPAIGN_CLOSED'
        },
        CAMPAIGN_OVERFLOW: {
            statusCode:400,
            customMessage : 'Campaign is over flow, please select less units',
            type : 'CAMPAIGN_OVERFLOW'
        },
        EMAIL_NOT_FOUND: {
            statusCode:400,
            customMessage : 'Email Not Found',
            type : 'EMAIL_NOT_FOUND'
        },
        PROFILE_EXIST: {
            statusCode:400,
            customMessage : 'Profile Exist, Please use edit profile to edit or change profile data.',
            type : 'PROFILE_EXIST'
        },
        BANK_DETAILS_EXIST: {
            statusCode:400,
            customMessage : 'Bank Details Exist, Please use edit Bank details to change data.',
            type : 'BANK_DETAILS_EXIST'
        },
        IMAGE_LENGTH_EXCEEDED: {
            statusCode:400,
            customMessage : 'Max 5 images allowed, Remove old images or choose less then 5 images',
            type : 'IMAGE_LENGTH_EXCEEDED'
        },
        PICTURE_REQUIRED: {
            statusCode:400,
            customMessage : 'Please select pictures',
            type : 'PICTURE_REQUIRED'
        },
        FACEBOOK_ID_NOT_FOUND: {
            statusCode:400,
            customMessage : 'Facebook Id Not Found',
            type : 'FACEBOOK_ID_NOT_FOUND'
        },
        PHONE_NOT_FOUND: {
            statusCode:400,
            customMessage : 'Phone No. Not Found',
            type : 'PHONE_NOT_FOUND'
        },
        INCORRECT_OLD_PASS: {
            statusCode:400,
            customMessage : 'Incorrect Old Password',
            type : 'INCORRECT_OLD_PASS'
        },
        UNAUTHORIZED: {
            statusCode:401,
            customMessage : 'You are not authorized to perform this action',
            type : 'UNAUTHORIZED'
        }

    },
    SUCCESS: {
        CREATED: {
            statusCode:200,
            customMessage : 'Created Successfully',
            type : 'CREATED'
        },
        DEFAULT: {
            statusCode:200,
            customMessage : 'Success',
            type : 'DEFAULT'
        },
        UPDATED: {
            statusCode:200,
            customMessage : 'Updated Successfully',
            type : 'UPDATED'
        },
        LOGOUT: {
            statusCode:200,
            customMessage : 'Logged Out Successfully',
            type : 'LOGOUT'
        },
        DELETED: {
            statusCode:200,
            customMessage : 'Deleted Successfully',
            type : 'DELETED'
        }
    }
};


var swaggerDefaultResponseMessages = [
    {code: 200, message: 'OK'},
    {code: 400, message: 'Bad Request'},
    {code: 401, message: 'Unauthorized'},
    {code: 404, message: 'Data Not Found'},
    {code: 500, message: 'Internal Server Error'}
];

var SCREEN_TO_SHOW = {
    HOMEPAGE : 'HOMEPAGE',
    TRACKING : 'TRACKING',
    FEEDBACK : 'FEEDBACK'
};

var CAMPAIGN_TYPE = {
    COMPLETE : 'COMPLETE',
    PENDING : 'PENDING'
};

var notificationMessages = {
    verificationCodeMsg: 'Your 4 digit verification code for Seed Project is {{four_digit_verification_code}}',
    registrationEmail: {
        emailMessage : "Dear {{user_name}}, <br><br> Please  <a href='{{verification_url}}'>click here</a> to verify your email address",
        emailSubject: "Welcome to Seed Project"
    },
    contactDriverForm: {
        emailMessage : "A new driver has showed interest <br><br> Details : <br><br> Name : {{fullName}} <br><br> Email : {{email}} <br><br> Phone No : {{phoneNo}} <br><br> Vehicle Type : {{vehicleType}} <br><br> Bank Account : {{bankAccountBoolean}} <br><br> Heard From : {{heardFrom}}",
        emailSubject: "New Driver Contact Request"
    },
    contactBusinessForm: {
        emailMessage : "A new business has showed interest <br><br> Details : <br><br> Name : {{fullName}} <br><br> Email : {{email}} <br><br> Phone No : {{phoneNo}} <br><br> Business Name: {{businessName}} <br><br> Business Address: {{businessAddress}}  <br><br> Delivery Service : {{ownDeliveryService}} <br><br> Heard From : {{heardFrom}}",
        emailSubject: "New Business Contact Request"
    },
    forgotPassword: {
        emailMessage : "Dear {{user_name}}, <br><br>  Your reset password token is <strong>{{password_reset_token}}</strong> , <a href='{{password_reset_link}}'> Click Here </a> To Reset Your Password",
        emailSubject: "Password Reset Notification For Seed Project"
    },
    charityForgotPassword: {
        //emailMessage : "Dear {{user_name}}, <br><br>  Your reset password token is <strong>{{password_reset_token}}</strong> , <a href='{{password_reset_link}}'> Click Here </a> To Reset Your Password",
        emailMessage : "Dear {{user_name}}, <br><br>Please fill password to following link to reset your password. ,<br> <br> {{password_reset_link}}  ",
        emailSubject: "Password Reset Notification For GiveApp"
    }
};

var languageSpecificMessages = {
    verificationCodeMsg : {
        EN : 'Your 4 digit verification code for Seed Project is {{four_digit_verification_code}}',
        ES_MX : 'Your 4 digit verification code for Seed Project is {{four_digit_verification_code}}'
    }
};

var APP_CONSTANTS = {
    SERVER: SERVER,
    DATABASE: DATABASE,
    SCREEN_TO_SHOW : SCREEN_TO_SHOW,
    CAMPAIGN_TYPE : CAMPAIGN_TYPE,
    DOMAIN_NAME_MAIL: DOMAIN_NAME_MAIL,
    STATUS_MSG: STATUS_MSG,
    notificationMessages: notificationMessages,
    languageSpecificMessages: languageSpecificMessages,
    swaggerDefaultResponseMessages: swaggerDefaultResponseMessages
};

module.exports = APP_CONSTANTS;