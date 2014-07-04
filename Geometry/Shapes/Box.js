
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

Box.prototype.ToString = function () {
    var s = "box(";
    var instance = this;
    _.each(this.Corners, function (c) {
        s += c + (instance.Corners.indexOf(c) < instance.Corners.length - 1 ? "~" : "");
    });
    s += ")";
    return s;
};

Box.prototype.ContainsPoint = function (point) {
    return point.X > this.Corners[0].X && point.X <= this.Corners[4].X
        && point.Y <= this.Corners[0].Y && point.Y > this.Corners[2].Y
        && point.Z <= this.Corners[0].Z && point.Z > this.Corners[1].Z;
};

Box.prototype.ContainsBox = function (box) {
    var success = true;
    var instance = this;
    _.each(box.Corners, function (c) {
        success = success && instance.ContainsPoint(c);
    });
    return success;
};

module.exports = Box;
