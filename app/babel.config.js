// Babel config cho Expo + alias "@/..." trỏ vào src/
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          root: ['./'],
          alias: { '@': './src' },
          extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
        },
      ],
      // react-native-reanimated/plugin PHẢI đặt cuối nếu sau này thêm Reanimated
    ],
  };
};
