
var util = require('util');

var _ = require('lodash');
var wid = require('wid');

var Eventer = require('../Helpers/Eventer');

var Point = require('../Geometry/Point');
var Box = require('../Geometry/Shapes/Box');

function OctreeLeaf(id, root, parent, minLeafSize, maxValuesPerLeaf) {
    Eventer.call(this);
    this._eventer = Eventer.prototype;

    this.id = id;

    this._minLeafSize = minLeafSize;
    this._maxValuesPerLeaf = maxValuesPerLeaf;

    this.BoundingBox = void 0;
    this.Root = root;
    this.Parent = parent;
    this.Children = [];
    this.Values = [];

    this._setupEvents();
}
util.inherits(OctreeLeaf, Eventer);

OctreeLeaf.prototype._setupEvents = function () {
    this._eventer._setupEvents.apply(this, arguments);
    this.Listen('insertValue');
    this.Listen('query');
    this.Listen('split');
};

OctreeLeaf.prototype.GetLeafBoundingBoxes = function (allLeaves) {
    allLeaves = _.isUndefined(allLeaves) ? [ this.BoundingBox ] : allLeaves;
    _.each(this.Children, function (leaf) {
        allLeaves.push(leaf);
        _.each(leaf.GetLeafBoundingBoxes(allLeaves), function (leafbox) {
            allLeaves.push(leafbox);
        });
    });
    return allLeaves;
};
OctreeLeaf.prototype.PopValues = function () {
    var removedValues = [];
    while (this.Values.length > 0) {
        var v = this.Values.pop();
        v.Leaf = void 0;
        removedValues.push(v);
    }
    _.each(this.Children, function (child) {
        var childRemovedValues = child.PopValues();
        _.each(childRemovedValues, function (v) {
            removedValues.push(v);
        })
    });
    return removedValues;
};

OctreeLeaf.prototype.IsRoot = function () {
    return _.isUndefined(this.Parent);
};

OctreeLeaf.prototype._insertValue = function (value, callback) {
    var containsPoint = this.BoundingBox.ContainsPoint(value.BoundingBox.Center);
    var lessThanMax = this.Values.length < this._maxValuesPerLeaf;
    var alreadyMinSize =
        this.BoundingBox.Width === this._minLeafSize
        || this.BoundingBox.Height === this._minLeafSize
        || this.BoundingBox.Depth === this._minLeafSize;
    if (!containsPoint && _.isUndefined(this.Parent)) {
        this.emit('grow', value, callback);
    }
    else if (this.Children.length === 0 && (lessThanMax || alreadyMinSize)) {
        this.Values.push(value);
        value.Leaf = this;
        if (!_.isUndefined(callback)) {
            callback(value);
        }
        this.emit('valueInserted', value);
    }
    else if (this.Children.length > 0) {
        var child = _.find(this.Children, function (child) {
            return child.BoundingBox.ContainsPoint(value.BoundingBox.Center);
        });
        if (!_.isUndefined(child)) {
            child.emit('insertValue', value, callback);
        }
    }
    else {
        var instance = this;
        this.emit('split', function () {
            instance.emit('insertValue', value, callback);
        });
    }
};

OctreeLeaf.prototype._split = function (callback) {
    for (var i = 0; i < 8; i++) {
        var child = new OctreeLeaf(wid.NewWID(), this.Root, this, this._minLeafSize, this._maxValuesPerLeaf);
        var centerX = this.BoundingBox.Center.X;
        var centerY = this.BoundingBox.Center.Y;
        var centerZ = this.BoundingBox.Center.Z;
        switch (i) {
            case 0:
                centerX -= this.BoundingBox.HalfWidth;
                centerY += this.BoundingBox.HalfHeight;
                centerZ += this.BoundingBox.HalfDepth;
                break;
            case 1:
                centerX -= this.BoundingBox.HalfWidth;
                centerY += this.BoundingBox.HalfHeight;
                centerZ -= this.BoundingBox.HalfDepth;
                break;
            case 2:
                centerX -= this.BoundingBox.HalfWidth;
                centerY -= this.BoundingBox.HalfHeight;
                centerZ += this.BoundingBox.HalfDepth;
                break;
            case 3:
                centerX -= this.BoundingBox.HalfWidth;
                centerY -= this.BoundingBox.HalfHeight;
                centerZ -= this.BoundingBox.HalfDepth;
                break;
            case 4:
                centerX += this.BoundingBox.HalfWidth;
                centerY += this.BoundingBox.HalfHeight;
                centerZ += this.BoundingBox.HalfDepth;
                break;
            case 5:
                centerX += this.BoundingBox.HalfWidth;
                centerY += this.BoundingBox.HalfHeight;
                centerZ -= this.BoundingBox.HalfDepth;
                break;
            case 6:
                centerX += this.BoundingBox.HalfWidth;
                centerY -= this.BoundingBox.HalfHeight;
                centerZ += this.BoundingBox.HalfDepth;
                break;
            case 7:
                centerX += this.BoundingBox.HalfWidth;
                centerY -= this.BoundingBox.HalfHeight;
                centerZ -= this.BoundingBox.HalfDepth;
                break;
        }
        child.BoundingBox = new Box(new Point(centerX, centerY, centerZ),
                this.BoundingBox.HalfWidth, this.BoundingBox.HalfHeight, this.BoundingBox.HalfDepth);
        this.Children.push(child);
    }

    var insertedCount = 0;
    var removedValues = this.PopValues();
    var instance = this;
    _.each(removedValues, function (value) {
        instance.emit('insertValue', value, function () {
            insertedCount++;
            if (insertedCount == removedValues.length) {
                callback();
            }
        });
    });
    if (removedValues.length === 0) {
        callback();
    }
};

OctreeLeaf.prototype._query = function (callback) {
    var values = [];
    _.each(this.Values, function (value) {
        values.push(value);
    });
    _.each(this.Children, function (child) {
        _.each(child.Values, function (value) {
            values.push(value);
        });
    });
    callback(values);
};

OctreeLeaf.prototype._dispose = function (callback) {
    this._eventer.apply(this, arguments);
};

module.exports = OctreeLeaf;
