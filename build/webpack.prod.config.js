const path = require('path');
const fs = require('fs');
const merge = require('webpack-merge');
const webpack = require('webpack');
const cleanWebpackPlugin = require('clean-webpack-plugin');
const progressBarWebpackPlugin = require('progress-bar-webpack-plugin');
const visualizer = require('webpack-visualizer-plugin');
const commonWebpackConfig = require('./webpack.common.config');
const { version } = require('../package.json');

const cleanOptions = {
    root: path.resolve(__dirname, '../dist'),
    verbose: true, //开启控制台信息
    dry: false //开启文件删除
};

module.exports = env => {
    return merge(commonWebpackConfig, {
        entry: {
            main: path.resolve(__dirname, '../index.ts')
        },
        output: {
            path: path.resolve(__dirname, '../dist'),
            filename: `geov.js`,
            chunkFilename: `geov.js`,
            library: 'GeoV',
            libraryTarget: 'window'
        },
        mode: 'production',
        plugins: [
         
            new cleanWebpackPlugin(cleanOptions),
            new progressBarWebpackPlugin(),
            new visualizer({
                filename: './statistics.html'
            })
        ]
    });
};
