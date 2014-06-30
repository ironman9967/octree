
var util = require('util');

var _ = require('lodash');
var wid = require('wid');

var Eventer = require('../Helpers/Eventer');

var Box = require('../Geometry/Shapes/Box');

var OctreeLeaf = require('./OctreeLeaf');

function Octree(id, minLeafSize, maxValuesPerLeaf) {
    Eventer.call(this);
    this._eventer = Eventer.prototype;

    this.id = id;

    this._minLeafSize = _.isUndefined(minLeafSize)
        ? Octree.DefaultMinimumLeafSize
        : parseInt(minLeafSize);
    this._maxValuesPerLeaf = _.isUndefined(maxValuesPerLeaf)
        ? Octree.DefaultMaxValuesPerLeaf
        : parseInt(maxValuesPerLeaf);

    this._setupEvents();
}
util.inherits(Octree, Eventer);

Octree.DefaultMinimumLeafSize = 10;
Octree.DefaultMaxValuesPerLeaf = 1;

Octree.prototype._setupEvents = function () {
    this._eventer._setupEvents.apply(this, arguments);
    this.Listen('newRoot');
    this.Listen('getLeafBoundingBoxes');
    this.Listen('query');
    this.Listen('insertValue');
};

Octree.prototype._newRoot = function (leaf) {
    this._root = leaf;
    this.Reemit('valueInserted', this._root);

    this.ListenToAnother('grow', this._root);
};

Octree.prototype._getLeafBoundingBoxes = function (callback) {
    callback(([ this._root.BoundingBox ]).concat(this._root.GetLeafBoundingBoxes()));
};

Octree.prototype._insertValue = function (value, callback) {
    if (_.isUndefined(value.id)) {
        value.id = wid.NewWID();
    }
    if (_.isUndefined(this._root)) {
        this._root = new OctreeLeaf(wid.NewWID(10), this._minLeafSize, this._maxValuesPerLeaf);
        this._root.BoundingBox = new Box(value.BoundingBox.Center, this._minLeafSize, this._minLeafSize,
            this._minLeafSize);
        this.emit('newRoot', this._root);
        this.emit('rootInitialized');
    }
    this._root.emit('insertValue', value, callback);
};

Octree.prototype._query = function () {
    this._root.emit.apply(this._root, ([ 'query' ]).concat(_.toArray(arguments)));
};

Octree.prototype._grow = function (value) {
    var xMin = this.root.BoundingBox[3].x;
    //var xMax = this.root.BoundingBox[4].x;
    var yMin = this.root.BoundingBox[3].y;
    //var yMax = this.root.BoundingBox[4].y;
    var zMin = this.root.BoundingBox[3].z;
    //var zMax = this.root.BoundingBox[4].z;
    var growX = value.BoundingBox.Center.x > xMin;
    var growY = value.BoundingBox.Center.y > yMin;
    var growZ = value.BoundingBox.Center.z > zMin;
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
    var newRootBox = new Box(this._root.BoundingBox[cornerIndex], this._root.BoundingBox.Width * 2,
            this._root.BoundingBox.Height * 2, this._root.BoundingBox.Depth * 2);
};

Octree.prototype._dispose = function () {
    this._eventer._dispose.apply(this, arguments);
};

module.exports = Octree;
