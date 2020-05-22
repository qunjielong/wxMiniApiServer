const path = require("path")

module.exports = {
    entry: {
        "web-sdk": "./build/web/web-sdk.js",
        "mini": "./build/mini/mini-sdk.js",
    },
    optimization: {
        // splitChunks: {
        //     cacheGroups: {
        //         commons: {
        //             name: "commons",
        //             chunks: "initial",
        //             minChunks: 2,
        //             minSize: 0
        //         }
        //     }
        // },
        // chunkIds: "named" // To keep filename consistent between different modes (for example building only)
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
        ],
    },
    output: {
        // filename: 'main.js',
        path: path.resolve(__dirname, 'dist'),
    },
};

