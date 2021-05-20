const path = require("path");
const tsNameof = require("ts-nameof");
const SpeedMeasurePlugin = require("speed-measure-webpack-plugin");
const Happypack = require("happypack");

const node_modules_path = path.resolve(__dirname, "../node_modules");

const smp = new SpeedMeasurePlugin();

module.exports = {
  node: {
    fs: "empty"
  },
  module: {
    rules: [
      {
        test: /\.(js|ts)$/,
        use: {
          loader: "happypack/loader?id=babel"
        },
        include: [path.resolve(__dirname, "../src")]
      },
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: [
          {
            loader: "happypack/loader?id=ts"
          }
        ]
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"]
      },
      {
        test: /\.(gif|jpe?g|png|xml|woff|svg|eot|ttf)$/,
        use: [
          {
            loader: "url-loader",
            options: {
              limit: 8192
            }
          }
        ]
      }
    ]
  },
  resolve: {
    extensions: [".ts", ".js", ".json"]
  },
  plugins: [
    new Happypack({
      id: "ts",
      loaders: [
        {
          loader: "ts-loader",
          options: {
            happyPackMode: true,
            getCustomTransformers: () => ({
              before: [tsNameof]
            })
          }
        }
      ]
    }),
    new Happypack({
      id: "babel",
      loaders: [
        {
          loader: "babel-loader",
          options: {
            configFile: path.resolve(__dirname, "../babel.config.js"),
            cacheDirectory: true,
            cacheCompression: false,
            presets: ["@babel/preset-env", ['es2015', {"modules":"commonjs"}]],
            plugins: ["@babel/plugin-transform-runtime"]
          }
        }
      ]
    })
  ]
};

