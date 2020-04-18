module.exports = { 
  entry: `./src/client/main.ts`,
  output: {
    path: `${__dirname}/docs`,
    filename: 'main.js'
  },
  mode: 'development',
  devtool: 'source-map',
  // mode: 'production',
  module: {
    rules: [
      {
        // 拡張子 .ts の場合
        test: /\.ts$/,
        // TypeScript をコンパイルする
        use: "ts-loader"
      }
    ]
  },
  // import 文で .ts ファイルを解決するため
  resolve: {
    extensions: [".ts", ".js", ".json", ".jsx", ".css"]
  }
};
