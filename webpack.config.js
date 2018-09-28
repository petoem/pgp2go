const path = require('path');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackIncludeAssetsPlugin = require('html-webpack-include-assets-plugin');
const SriPlugin = require('webpack-subresource-integrity');

let plugins = [
    new CopyWebpackPlugin([{
        from: 'src/style.css',
        to: 'style.css'
    }]),
    new HtmlWebpackPlugin({
        filename: 'index.html',
        template: './src/index.html',
        inject: 'body',
        minify: (process.env.NODE_ENV === 'production') ? {
            collapseWhitespace: true,
            conservativeCollapse: true
        } : false,
        hash: false,
        cache: false,
        showErrors: false
    }),
    new HtmlWebpackIncludeAssetsPlugin({
        append: true,
        hash: false,
        assets: [
            'style.css'
        ]
    })
];

if (process.env.NODE_ENV === 'production') {
    plugins.push(new UglifyJSPlugin({
        uglifyOptions: {
            mangle: true,
            sourceMap: false,
            compress: true
        }
    }));
    plugins.push(new SriPlugin({
        hashFuncNames: ['sha256', 'sha384'],
        enabled: process.env.NODE_ENV === 'production'
    }));
}

module.exports = {
    entry: './src/app.js',
    output: {
        path: path.resolve(__dirname, (process.env.OUT_DIR) ? process.env.OUT_DIR : './build'),
        filename: (process.env.NODE_ENV === 'production') ? 'bundle.[hash].js' : 'bundle.js',
        crossOriginLoading: 'anonymous'
    },
    plugins: plugins,
    module: {
        rules: [{
            test: /\.m?js$/,
            use: {
                loader: 'babel-loader',
                options: {
                    presets: ['@babel/preset-env']
                }
            }
        }]
    }
}
