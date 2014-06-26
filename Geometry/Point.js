
function Point(x, y, z) {
    if (!this instanceof Point) return new Point(x, y, z);

    this.X = x;
    this.Y = y;
    this.Z = z;
}

Point.prototype.ToString = function () {
    return "(" + this.x + ":" + this.y + ":" + this.z + ")";
};

Point.Distance = function (p1, p2) {
    return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2) + Math.pow(p2.z - p1.z, 2));
};

module.exports = Point;
