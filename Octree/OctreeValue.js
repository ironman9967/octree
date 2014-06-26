
var util = require('util');

var _ = require('lodash');

var Eventer = require('../Helpers/Eventer');

function OctreeValue(value, boundingBox) {
    if (!this instanceof OctreeValue) return new OctreeValue(value, boundingBox);
    Eventer.call(this);
    this._eventer = Eventer.prototype;

    this.Leaf = void 0;
    this.Value = value;
    this.BoundingBox = boundingBox;

    this._setupEvents();
}
util.inherits(OctreeValue, Eventer);

OctreeValue.prototype._setupEvents = function () {
    this._eventer._setupEvents.apply(this, arguments);
    this.Listen('move');
};

OctreeValue.prototype._move = function (point) {
    this.emit('moved', this.BoundingBox.Center, point);
    this.BoundingBox.Center = point;
    if (!_.isUndefined(this.Leaf)) {
        if (!this.Leaf.ContainsPoint(point)) {
            this.emit('leftLeaf');
        }
    }
    else {
        this.emit('notInLeaf');
    }
};

OctreeValue.prototype._dispose = function () {
    this._eventer._dispose.apply(this, arguments);
};

module.exports = OctreeValue;