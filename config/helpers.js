const path = require('path');

exports.root = path.join.bind(path, path.resolve(__dirname, '..'));
