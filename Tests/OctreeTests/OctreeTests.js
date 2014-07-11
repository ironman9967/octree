
var _ = require('lodash');

var wid = require('wid');
var octree = require('../../octree');

module.exports = {
    setUp: function (done) {
        this.octree = octree.createTree();
        this.octree.emit('insertValue',
            new octree.value(wid.NewWID(10), {
                my: "value"
            },
            new octree.geometry.shapes.box(new octree.geometry.point(10, 10, 10), 1, 1, 1)), function () {
                done();
            });
    },
    tearDown: function (done) {
        done();
    },
//    justOneValue: function (test) {
//        this.octree.emit('query', function (values) {
//            test.ok(!_.isUndefined(values), "'values' callback parameter is undefined");
//            test.ok(_.isArray(values), "'values' callback parameter is not an array");
//            test.equal(values.length, 1, "'values' array should contain only one element");
//            test.done();
//        });
//    },
//    twoCloseValues: function (test) {
//        var instance = this;
//        this.octree.emit('insertValue',
//            new octree.value(wid.NewWID(10), {
//                my: "value"
//            },
//            new octree.geometry.shapes.box(new octree.geometry.point(8, 8, 8), 1, 1, 1)), function () {
//                instance.octree.emit('query', function (values) {
//                    test.equal(values.length, 2, "'values' array should contain two elements");
//                    test.done();
//                });
//            });
//    },
    twoFarValues: function (test) {
        var instance = this;
        this.octree.emit('insertValue',
            new octree.value(wid.NewWID(10), {
                    my: "value"
                },
                new octree.geometry.shapes.box(new octree.geometry.point(-10, -10, -10), 1, 1, 1)),
            function () {
                instance.octree.emit('getLeafBoundingBoxes', function (boxes) {
                    console.log(boxes);
                    test.done();
                });
            });
    },
//    valueLeftLeaf: function (test) {
//        test.done();
//    },
//    removeValue: function (test) {
//        test.done();
//    }
};
