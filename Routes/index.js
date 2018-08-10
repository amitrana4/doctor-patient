/**
 * Created by Amit on 10/7/15.
 */
'use strict';
var DoctorRoute = require('./DoctorRoute');
var PatientRoute = require('./PatientRoute');
var AdminRoute = require('./AdminRoute');

var all = [].concat(DoctorRoute, AdminRoute, PatientRoute);

module.exports = all;

