
exports.geometry = {
    point: require('./Geometry/Point'),
    shapes: {
        box: require('./Geometry/Shapes/Box')
    }
};

exports.helpers = {
    eventer: require('./Helpers/Eventer')
};

exports.value = require('./Octree/OctreeValue');

exports.createTree = function (minLeafSize, valuesPerLeaf) {
    return new (require('./Octree/Octree'))(minLeafSize, valuesPerLeaf);
};
