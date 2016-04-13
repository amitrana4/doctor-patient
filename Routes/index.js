/**
 * Created by shahab on 10/7/15.
 */
'use strict';
var CharityRoute = require('./CharityRoute');
var AdminRoute = require('./AdminRoute');

var all = [].concat(CharityRoute, AdminRoute);

module.exports = all;

