
var util = require('util');

var _ = require('lodash');

var Eventer = require('../Helpers/Eventer');

var Box = require('../Geometry/Shapes/Box');
var OctreeValue = require('../Octree/OctreeValue');
var Octree = require('../Octree/Octree');

function OctreeLeaf(maxValuesPerLeaf) {
    if (!this instanceof OctreeLeaf) return new OctreeLeaf(maxValuesPerLeaf);
    Eventer.call(this);
    this._eventer = Eventer.prototype;

    this._maxValuesPerLeaf = maxValuesPerLeaf;

    this.Bounds = void 0;
    this.Children = [];
    this.Values = [];

    this._setupEvents();
}
util.inherits(OctreeLeaf, Eventer);

OctreeLeaf.prototype._setupEvents = function () {
    this._eventer._setupEvents.apply(this, arguments);
    this.Listen('insertValue');
};

OctreeLeaf.prototype._insertValue = function (value, callback) {
    if (this.Bounds.ContainsPoint(value.BoundingBox.Center) && this.Values.length < this._maxValuesPerLeaf) {
        this.Values.push(value);
        callback(value);
        this.emit('valueInserted', value);
    }
    else {
        this.emit('grow', value);
    }
};

OctreeLeaf.prototype._dispose = function (callback) {
    this._eventer.apply(this, arguments);
};

module.exports = OctreeLeaf;
