
var util = require('util');

var _ = require('lodash');
var wid = require('wid');

var Eventer = require('../Helpers/Eventer');

function OctreeLeaf(id, minLeafSize, maxValuesPerLeaf) {
    if (!this instanceof OctreeLeaf) return new OctreeLeaf(maxValuesPerLeaf);
    Eventer.call(this);
    this._eventer = Eventer.prototype;

    this.id = id;

    this._minLeafSize = minLeafSize;
    this._maxValuesPerLeaf = maxValuesPerLeaf;

    this.BoundingBox = void 0;
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

OctreeLeaf.prototype._insertValue = function (value, callback) {
    if (_.isUndefined(value.id)) {
        value.id = wid.NewWID();
    }
    var containsPoint = this.BoundingBox.ContainsPoint(value.BoundingBox.Center);
    var leafAtMax = this.Values.length >= this._maxValuesPerLeaf;
    var alreadyMinSize =
        this.BoundingBox.Width === this._minLeafSize
        || this.BoundingBox.Height === this._minLeafSize
        || this.BoundingBox.Depth === this._minLeafSize;
    if (this.Children.length === 0 && containsPoint && (leafAtMax || alreadyMinSize)) {
        this.Values.push(value);
        value.Leaf = this;
        if (!_.isUndefined(callback)) {
            callback(value);
        }
        this.emit('valueInserted', value);
    }
    else {
        this.emit('grow', value, callback);
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

OctreeLeaf.prototype._split = function (value, callback) {
    console.log("split");
};

OctreeLeaf.prototype._dispose = function (callback) {
    this._eventer.apply(this, arguments);
};

module.exports = OctreeLeaf;
