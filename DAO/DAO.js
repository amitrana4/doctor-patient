//var Config = require('./Config');
var log4js = require('log4js');
var logger = log4js.getLogger('[DAO]');

/*
 ---------------------------------------------------------------------------------------------
 WARNING: Not a general module just for category-sub-service tree or for two level tree only
 ---------------------------------------------------------------------------------------------
 */

exports.getDataDeepPopulateFixed = function (model, query, projectionQuery, options, populateModel, nestedModel, callback) {

    model.find(query, projectionQuery, options).populate(populateModel)
        .exec(function (err, docs) {

            if (err) {
                return callback(err, docs);
            }
            model.populate(docs, nestedModel,
                function (err, populatedDocs) {
                    if (err) return callback(err);
                    callback(null, populatedDocs);// This object should now be populated accordingly.
                });
        });
};


/*
 ----------------------------------------
 GET DATA WITH REFERENCE
 ----------------------------------------
 */
exports.getDataWithReferenceFixed = function (model, query, projection, options, collectionOptions, callback) {

    model.find(query, projection, options).populate(collectionOptions).exec(function (err, data) {

        if (err) {
            logger.error("Error Data reference: ", err);
            var response = {
                message: constants.responseMessage.ERROR_IN_EXECUTION,
                data: {}
            };
            var errResponse = {
                response: response,
                details: err,
                statusCode: 400
            };

            callback(errResponse);
        }
        else {

            callback(null, data);
        }
    });
};
exports.findOneAndUpdateData = function (model, conditions, update, options, callback) {
    model.findOneAndUpdate(conditions, update, options, function (error, result) {
        if (error) {
            logger.error("Find one and update", error);
            return callback(error);
        }
        return callback(null, result);
    })
}

exports.UpdateMultipleRecords = function (model, conditions, update, options, callback) { console.log("UpdateMultipleRecords",conditions);
    model.update(conditions, update, options, function (error, result) {
        if (error) {
            logger.error("update multiple", error);
            return callback(error);
        }
        console.log(result,update);
        return callback(null, result);
    })
}