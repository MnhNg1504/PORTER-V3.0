// Metro config: cho phép bundle file .gpx như asset để nạp cung THẬT từ assets/gpx.
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);
// Thêm 'gpx' vào danh sách asset để require()/Asset đọc được file GPX thật.
config.resolver.assetExts.push('gpx');

module.exports = config;
