const path = require('path');
const webpack = require('webpack');

const ROOT = path.resolve( __dirname, 'src' );
const DESTINATION = path.resolve( __dirname, 'dist' );
const pkg = require('./package.json');

let libraryName = pkg.name;

module.exports = {
    context: ROOT,

    entry: {
        'stringaligner': './stringaligner',
        'alignment': './alignment',
        'align_files': './align_files',
    },
    
    output: {
        filename: '[name].bundle.js',
        library: libraryName,
        libraryTarget: 'umd',
        umdNamedDefine: true,
        globalObject: 'this',
        path: DESTINATION
    },

    resolve: {
        extensions: ['.ts', '.js', '.txt'],
        modules: [
            ROOT,
            'node_modules'
        ]
    },

    module: {
        rules: [
            /****************
            * PRE-LOADERS
            *****************/
            {
                enforce: 'pre',
                test: /\.js$/,
                use: 'source-map-loader'
            },
            {
                enforce: 'pre',
                test: /\.ts$/,
                exclude: /node_modules/,
                use: 'tslint-loader'
            },

            /****************
            * LOADERS
            *****************/
            {
                test: /\.ts$/,
                exclude: [ /node_modules/ ],
                use: 'awesome-typescript-loader'
            },
        ],
    },
    
    devtool: 'cheap-module-source-map',
    devServer: {},
    target: 'node'
};

