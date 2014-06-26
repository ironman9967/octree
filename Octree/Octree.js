
var util = require('util');

var _ = require('lodash');

var Eventer = require('../Helpers/Eventer');

var Box = require('../Geometry/Shapes/Box');

var OctreeLeaf = require('./OctreeLeaf');
var OctreeValue = require('./OctreeValue');

function Octree(minLeafSize, valuesPerLeaf) {
    if (!this instanceof Octree) return new Octree(minLeafSize, valuesPerLeaf);
    Eventer.call(this);
    this._eventer = Eventer.prototype;

    this._minLeafSize = _.isUndefined(minLeafSize) ? Octree.DefaultMinimumLeafSize : parseInt(minLeafSize);
    this._valuesPerLeaf = _.isUndefined(valuesPerLeaf) ? Octree.DefaultValuesPerLeaf : parseInt(valuesPerLeaf);

    this._setupEvents();
}
util.inherits(Octree, Eventer);

Octree.DefaultMinimumLeafSize = 10;
Octree.DefaultValuesPerLeaf = 1;

Octree.prototype._setupEvents = function () {
    this._eventer._setupEvents.apply(this, arguments);
    this.Listen('newRoot');
    this.Listen('insertValue');
};

Octree.prototype._insertValue = function (value, callback) {
    if (_.isUndefined(this._root)) {
        this._root = new OctreeLeaf(this._valuesPerLeaf);
        this._root.Bounds = new Box(value.BoundingBox.Center, this._minLeafSize, this._minLeafSize, this._minLeafSize);
        this.emit('newRoot', this._root);
        this.emit('rootInitialized');
    }
    this._root.emit('insertValue', value, callback);
};

Octree.prototype._newRoot = function (leaf) {
    this._root = leaf;
    this._root.Listen('grow', this._grow);
};

Octree.prototype._grow = function (value) {
    var xMin = this.root.bounds[3].x;
    //var xMax = this.root.bounds[4].x;
    var yMin = this.root.bounds[3].y;
    //var yMax = this.root.bounds[4].y;
    var zMin = this.root.bounds[3].z;
    //var zMax = this.root.bounds[4].z;
    var growX = value.boundingBox.center.x > xMin;
    var growY = value.boundingBox.center.y > yMin;
    var growZ = value.boundingBox.center.z > zMin;
    var cornerIndex = -1;
    if (!growX && growY && growZ) {
        cornerIndex = 0;
    }
    else if (!growX && growY && !growZ) {
        cornerIndex = 1;
    }
    else if (!growX && !growY && growZ) {
        cornerIndex = 2;
    }
    else if (!growX && !growY && !growZ) {
        cornerIndex = 3;
    }
    else if (growX && growY && growZ) {
        cornerIndex = 4;
    }
    else if (growX && growY && !growZ) {
        cornerIndex = 5;
    }
    else if (growX && !growY && growZ) {
        cornerIndex = 6;
    }
    else if (growX && !growY && !growZ) {
        cornerIndex = 7;
    }
    var newRootBox = new Box(this._root.Bounds[cornerIndex], this._root.Bounds.Width * 2,
            this._root.Bounds.Height * 2, this._root.Bounds.Depth * 2);
};

Octree.prototype._dispose = function () {
    this._eventer._dispose.apply(this, arguments);
};

module.exports = Octree;
