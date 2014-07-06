
var _ = require('lodash');

var Point = require('../Point');

function Box(center, width, height, depth) {
    if (!this instanceof Box) return new Box(center, width, height, depth);
    this.Center = center;
    this.Width = width;
    this.Height = height;
    this.Depth = depth;

    this.Corners = [];
    this._createCorners();
}

Box.prototype._createCorners = function() {
    this.HalfHeight = this.Height / 2;
    this.HalfWidth = this.Width / 2;
    this.HalfDepth = this.Depth / 2;
    this.Corners.push(new Point(
        this.Center.X - this.HalfWidth,
        this.Center.Y + this.HalfHeight,
        this.Center.Z + this.HalfDepth));
    this.Corners.push(new Point(
        this.Center.X - this.HalfWidth,
        this.Center.Y + this.HalfHeight,
        this.Center.Z - this.HalfDepth));
    this.Corners.push(new Point(
        this.Center.X - this.HalfWidth,
        this.Center.Y - this.HalfHeight,
        this.Center.Z + this.HalfDepth));
    this.Corners.push(new Point(
        this.Center.X - this.HalfWidth,
        this.Center.Y - this.HalfHeight,
        this.Center.Z - this.HalfDepth));
    this.Corners.push(new Point(
        this.Center.X + this.HalfWidth,
        this.Center.Y + this.HalfHeight,
        this.Center.Z + this.HalfDepth));
    this.Corners.push(new Point(
        this.Center.X + this.HalfWidth,
        this.Center.Y + this.HalfHeight,
        this.Center.Z - this.HalfDepth));
    this.Corners.push(new Point(
        this.Center.X + this.HalfWidth,
        this.Center.Y - this.HalfHeight,
        this.Center.Z + this.HalfDepth));
    this.Corners.push(new Point(
        this.Center.X + this.HalfWidth,
        this.Center.Y - this.HalfHeight,
        this.Center.Z - this.HalfDepth));
};

Box.prototype.toString = function () {
    var s = "box(";
    var instance = this;
    _.each(this.Corners, function (c) {
        s += c + (instance.Corners.indexOf(c) < instance.Corners.length - 1 ? "~" : "");
    });
    s += ")";
    return s;
};

Box.prototype.ContainsPoint = function (point) {
    var max = this.Corners[4];
    var min = this.Corners[3];
    var inX = max.X >= point.X && point.X > min.X;
    var inY = max.Y >= point.Y && point.Y > min.Y;
    var inZ = max.Z >= point.Z && point.Z > min.Z;
    return inX && inY && inZ;
};

Box.prototype.ContainsBox = function (box) {
    var success = true;
    var instance = this;
    _.each(box.Corners, function (c) {
        success = success && instance.ContainsPoint(c);
    });
    return success;
};

Box.prototype.Clone = function () {
    return new Box(this.Center.Clone(), this.width, this.height, this.depth);
};

module.exports = Box;
