
var wid = require('wid');

exports.geometry = {
    point: require('./Geometry/Point'),
    shapes: {
        box: require('./Geometry/Shapes/Box')
    }
};

exports.helpers = {
    eventer: require('./Helpers/Eventer'),
    ip: require('./Helpers/IpHelper')
};

exports.value = require('./Octree/OctreeValue');
exports.leaf = require('./Octree/OctreeLeaf');

exports.createTree = function (minLeafSize, valuesPerLeaf) {
    return new (require('./Octree/Octree'))(wid.NewWID(10), minLeafSize, valuesPerLeaf);
};
