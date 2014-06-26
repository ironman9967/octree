
var util = require('util');
var events = require('events');

var _ = require('lodash');

function Eventer() {
    if (!this instanceof Eventer) return new Eventer();
    events.EventEmitter.apply(this, arguments);
}
util.inherits(Eventer, events.EventEmitter);

Eventer.prototype._setupEvents = function () {
    this.Listen('dispose');
};

Eventer.prototype._dispose = function (callback) {
    Eventer.ClearAllEvents(this);
    if (!_.isUndefined(callback)) {
        callback();
    }
};

Eventer.prototype.Listen = function (eventName, callback) {
    var instance = this;
    if (_.isUndefined(callback)) {
        callback = instance['_' + eventName];
    }
    this.on(eventName, function () {
        callback.apply(instance, arguments);
    });
};

Eventer.ClearAllEvents = function (eventer) {
    _.each(eventer._events, function (callback, eventName) {
        eventer.removeAllListeners(eventName);
    });
};

module.exports = Eventer;
