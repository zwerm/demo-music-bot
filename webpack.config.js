const path = require('path');

module.exports = {
    mode: 'development',
    entry: './src/index.js',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'main.js'
    },
    module: {
        rules: [
            {
                test: /\.(scss)$/,
                use: [
                    { loader: 'style-loader' },// inject CSS to page
                    { loader: 'css-loader', }, // translates CSS into CommonJS modules
                    // Run post css actions
                    {
                        loader: 'postcss-loader',
                        options: {
                            plugins: () => { // post css plugins, can be exported to postcss.config.js
                                return [
                                    require('precss'),
                                    require('autoprefixer')
                                ];
                            }
                        }
                    },
                    { loader: 'sass-loader' } // compiles Sass to CSS
                ]
            }
        ]
    }
};
