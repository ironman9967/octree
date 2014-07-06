
function Point(x, y, z) {
    if (!this instanceof Point) return new Point(x, y, z);

    this.X = x;
    this.Y = y;
    this.Z = z;
}

Point.prototype.toString = function () {
    return "(" + this.X.toString() + ":" + this.Y.toString() + ":" + this.Z.toString() + ")";
};

Point.prototype.Clone = function () {
    return Point(this.X, this.Y, this.Z);
};

Point.Distance = function (p1, p2) {
    return Math.sqrt(Math.pow(p2.X - p1.X, 2) + Math.pow(p2.Y - p1.Y, 2) + Math.pow(p2.Z - p1.Z, 2));
};

module.exports = Point;
