
var _ = require('lodash');

var Point = require('../../../Geometry/Point');
var Box = require('../../../Geometry/Shapes/Box');

module.exports = {
    setUp: function (done) {
        done();
    },
    tearDown: function (done) {
        done();
    },
    ContainsPoint: function (test) {
        var center = new Point(0, 0, 0);
        var box = new Box(center, 10, 10, 10);
        test.ok(box.ContainsPoint(center), "Box does not contain the point");
        test.done();
    },
    DoesNotContainPoint: function (test) {
        var box = new Box(new Point(0, 0, 0), 10, 10, 10);
        test.ok(!box.ContainsPoint(new Point(50, 50, 50)), "Box contains the point");
        test.done();
    },
    ContainsPointOnLine: function (test) {
        var box = new Box(new Point(0, 0, 0), 10, 10, 10);
        test.ok(box.ContainsPoint(new Point(5, 5, 5)), "Box does not contain the point on the line");
        test.done();
    },
    DoesNotContainPointOnLine: function (test) {
        var box = new Box(new Point(0, 0, 0), 10, 10, 10);
        test.ok(!box.ContainsPoint(new Point(-5, -5, -5)), "Box contains the point on the line");
        test.done();
    }
};
