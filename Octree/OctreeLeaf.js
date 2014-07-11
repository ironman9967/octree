
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
    this.Listen('attemptMerge');
    this.Listen('attemptShrink');
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

OctreeLeaf.SplitBox = function (box) {
    var segments = [];
    for (var i = 0; i < 8; i++) {
        var centerX = box.Center.X;
        var centerY = box.Center.Y;
        var centerZ = box.Center.Z;
        switch (i) {
            case 0:
                centerX -= box.HalfWidth / 2;
                centerY += box.HalfHeight / 2;
                centerZ += box.HalfDepth / 2;
                break;
            case 1:
                centerX -= box.HalfWidth / 2;
                centerY += box.HalfHeight / 2;
                centerZ -= box.HalfDepth / 2;
                break;
            case 2:
                centerX -= box.HalfWidth / 2;
                centerY -= box.HalfHeight / 2;
                centerZ += box.HalfDepth / 2;
                break;
            case 3:
                centerX -= box.HalfWidth / 2;
                centerY -= box.HalfHeight / 2;
                centerZ -= box.HalfDepth / 2;
                break;
            case 4:
                centerX += box.HalfWidth / 2;
                centerY += box.HalfHeight / 2;
                centerZ += box.HalfDepth / 2;
                break;
            case 5:
                centerX += box.HalfWidth / 2;
                centerY += box.HalfHeight / 2;
                centerZ -= box.HalfDepth / 2;
                break;
            case 6:
                centerX += box.HalfWidth / 2;
                centerY -= box.HalfHeight / 2;
                centerZ += box.HalfDepth / 2;
                break;
            case 7:
                centerX += box.HalfWidth / 2;
                centerY -= box.HalfHeight / 2;
                centerZ -= box.HalfDepth / 2;
                break;
        }
        segments[i] = new Box(new Point(centerX, centerY, centerZ), box.HalfWidth, box.HalfHeight, box.HalfDepth);
    }
    return segments;
};

OctreeLeaf.GetSegmentContainingPoint = function (box, point) {
    var segments = OctreeLeaf.SplitBox(box);
    return _.find(segments, function (segment) {
        return segment.ContainsPoint(point);
    });
};

OctreeLeaf.prototype._insertValue = function (value, callback) {
    var containsPoint = this.BoundingBox.ContainsPoint(value.BoundingBox.Center);
    var lessThanMax = this.Values.length < this._maxValuesPerLeaf;
    var alreadyMinSize =
        this.BoundingBox.Width === this._minLeafSize
        || this.BoundingBox.Height === this._minLeafSize
        || this.BoundingBox.Depth === this._minLeafSize;
    if (!containsPoint && this.IsRoot()) {
        this.emit('grow', value, callback);
    }
    else if (this.Children.length === 0 && (lessThanMax || alreadyMinSize)) {
        this.Values.push(value);
        value.Leaf = this;
        if (this.Values.length <= this._maxValuesPerLeaf && this.Children.length > 0 && !alreadyMinSize) {
            this.emit('attemptMerge');
        }
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

OctreeLeaf.prototype._attemptMerge = function () {
    var childValues = this.PopValues();
    if (childValues.length + this.Values.length <= this._maxValuesPerLeaf) {
        var instance = this;
        _.each(this.Children, function (child) {
            instance.emit('leafRemoved', child.id);
            child.emit('dispose');
        });
        this.Children = [];
        var numInserted = 0;
        _.each(childValues, function (value) {
            numInserted++;
            instance.emit('insertValue', value, function () {
                if (numInserted === childValues.length) {
                    instance.emit('attemptShrink');
                }
            });
        });
        if (childValues.length === 0 && this.IsRoot()) {
            instance.emit('attemptShrink');
        }
    }
    else if (this.IsRoot()) {
        this.emit('attemptShrink');
    }
};

OctreeLeaf.prototype._split = function (callback) {
    var instance = this;
    _.each(OctreeLeaf.SplitBox(this.BoundingBox), function (box) {
        var child = new OctreeLeaf(wid.NewWID(), instance.Root, instance, instance._minLeafSize,
            instance._maxValuesPerLeaf);
        child.BoundingBox = box;
        instance.emit('leafAdded', child);
        instance.Reemit('leafAdded', child);
        instance.Reemit('leafRemoved', child);
        instance.Children.push(child);
    });

    var insertedCount = 0;
    var removedValues = this.PopValues();
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
