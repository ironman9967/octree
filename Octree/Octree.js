
var util = require('util');

var _ = require('lodash');
var wid = require('wid');

var Eventer = require('../Helpers/Eventer');

var Point = require('../Geometry/Point');
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
    this._idValue(value);
    if (_.isUndefined(this._root)) {
        var instance = this;
        this._createRoot(new Point(0, 0, 0), this._minLeafSize, this._minLeafSize, this._minLeafSize, function () {
            instance.emit('rootInitialized');
            instance._root.emit('insertValue', value, callback);
        });
    }
    else {
        this._root.emit('insertValue', value, callback);
    }
};

Octree.prototype._idValue = function (value) {
    if (!_.isUndefined(value.Value.ID)) {
        value.id = value.Value.ID;
    }
    if (!_.isUndefined(value.Value.Id)) {
        value.id = value.Value.Id;
    }
    if (!_.isUndefined(value.Value.id)) {
        value.id = value.Value.id;
    }
    if (!_.isUndefined(value.Value._id)) {
        value.id = value.Value._id;
    }
    if (_.isUndefined(value.id)) {
        value.id = wid.NewWID();
    }
};

Octree.prototype._query = function () {
    if (!_.isUndefined(this._root)) {
        this._root.emit.apply(this._root, ([ 'query' ]).concat(_.toArray(arguments)));
    }
};

Octree.prototype._grow = function (value, callback) {
    var xMin = this._root.BoundingBox.Corners[3].X;
    //var xMax = this._root.BoundingBox.Corners[4].X;
    var yMin = this._root.BoundingBox.Corners[3].Y;
    //var yMax = this._root.BoundingBox.Corners[4].Y;
    var zMin = this._root.BoundingBox.Corners[3].Z;
    //var zMax = this._root.BoundingBox.Corners[4].Z;
//    var growX = this._root.BoundingBox.Center.X > xMin;
//    var growY = this._root.BoundingBox.Center.Y > yMin;
//    var growZ = this._root.BoundingBox.Center.Z > zMin;
    var growX = value.BoundingBox.Center.X > xMin;
    var growY = value.BoundingBox.Center.Y > yMin;
    var growZ = value.BoundingBox.Center.Z > zMin;
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
    var instance = this;
    this._createRoot(this._root.BoundingBox.Corners[cornerIndex],
        this._root.BoundingBox.Width * 2, this._root.BoundingBox.Height * 2, this._root.BoundingBox.Depth * 2,
        function () {
            instance.emit('insertValue', value, callback);
        });
};

Octree.prototype._createRoot = function (center, width, heigth, depth, callback) {
    var id;
    if (_.isUndefined(this._root)) {
        id = wid.NewWID(10);
    }
    else {
        id = this._root.id;
    }
    var root = new OctreeLeaf(id, void 0, void 0, this._minLeafSize, this._maxValuesPerLeaf);
    root.Root = root;
    root.BoundingBox = new Box(center, width, heigth, depth);
    if (!_.isUndefined(this._root)) {
        var removedValues = this._root.PopValues();
        _.each(removedValues, function (v) {
            root.emit('insertValue', v);
        });
    }
    this._root = root;
    this.emit('newRoot', this._root);
    callback();
};

Octree.prototype._dispose = function () {
    this._eventer._dispose.apply(this, arguments);
};

module.exports = Octree;
