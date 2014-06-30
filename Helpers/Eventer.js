
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

Eventer.prototype._listen = function (eventName, callback, listener, eventer) {
    eventer.on(eventName, function () {
        callback.apply(listener, arguments);
    });
};
Eventer.prototype.Listen = function (eventName) {
    this._listen(eventName, this['_' + eventName], this, this);
};
Eventer.prototype.ListenCustomCallback = function (eventName, callback) {
    this._listen(eventName, callback, this, this);
};
Eventer.prototype.ListenToAnother = function (eventName, eventer) {
    this._listen(eventName, this['_' + eventName], this, eventer);
};
Eventer.prototype.ListenToAnotherListenCustomCallback = function (eventName, eventer, callback) {
    this._listen(eventName, callback, this, eventer);
};
Eventer.prototype.ListenCallAnother = function (eventName, listener) {
    this._listen(eventName, listener['_' + eventName], listener, this);
};
Eventer.prototype.Reemit = function (eventName, listener) {
    this._listen(eventName, function () {
        listener.emit.apply(listener, ([ eventName ]).concat(_.toArray(arguments)));
    }, listener, this);
};

Eventer.ClearAllEvents = function (eventer) {
    _.each(eventer._events, function (callback, eventName) {
        eventer.removeAllListeners(eventName);
    });
};

module.exports = Eventer;
