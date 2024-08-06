const merge = require('lodash/merge');
const rspackConfig = require('./rspack.config');

// 合并rspackConfig
module.exports = merge({}, rspackConfig, {

});