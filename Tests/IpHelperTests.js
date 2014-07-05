
var _ = require('lodash');

var IpHelper = require('../Helpers/IpHelper');

module.exports = {
    setUp: function (done) {
        done();
    },
    tearDown: function (done) {
        done();
    },
    GetIpTest: function (test) {
        test.expect(1);
        var ip = IpHelper.GetLocalIp();
        test.ok(!_.isUndefined(ip), "Local IP is undefined");
        test.done();
    }
};
