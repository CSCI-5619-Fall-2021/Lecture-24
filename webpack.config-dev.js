const merge = require('webpack-merge');
const path = require('path');
const fs = require('fs');
const common = require('./webpack.common.js');

// App directory
const appDirectory = fs.realpathSync(process.cwd());

module.exports = merge(common, {
    mode: 'development',
    devtool: 'inline-source-map',

    devServer: {
        contentBase: path.resolve(appDirectory),
        publicPath: '/',
        compress: true,
        hot: true,
        open: true,
        disableHostCheck: true,

        // enable all of these options if you are not using ngrok
        //useLocalIp: true,
        //host: '0.0.0.0', 
        //https: true,
    }    
});