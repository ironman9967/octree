
var os = require('os');

var _ = require('lodash');

exports.GetLocalIp = function () {
    var interfaces = os.networkInterfaces();
    var ip = void 0;
    _.each(interfaces, function (networks) {
        _.each(networks, function (network) {
            if (!_.isUndefined(network.family)
                && network.family.toLowerCase() === "ipv4"
                && !network.internal) {
                    ip = network.address;
                }
        });
    });
    return ip;
};