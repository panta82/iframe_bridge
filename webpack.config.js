const path = require('path');

module.exports = {
	entry: './index.js',
	output: {
		filename: 'iframe_bridge.js',
		path: path.resolve(__dirname, 'dist'),
		libraryTarget: 'umd', // Flexible attach point - module.exports or var
		library: 'IFrameBridge' // Name of the exported var
	},
	devtool: 'source-map',
	module: {
		rules: [
			{
				test: /\.js$/,
				exclude: /(node_modules|bower_components)/,
				use: {
					loader: 'babel-loader',
					options: {
						presets: ['env']
					}
				}
			}
		]
	}
};