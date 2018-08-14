const HtmlWebPackPlugin = require("html-webpack-plugin");

const CimpressTranslationsWebpackPlugin = require("cimpress-translations-webpack-plugin");
const Auth0 = require("cimpress-translations-webpack-plugin/lib/auth0Authenticator");

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;

const auth = new Auth0("cimpress.auth0.com", CLIENT_ID, CLIENT_SECRET);

let translationPlugin = new CimpressTranslationsWebpackPlugin({
    serviceId: "8a76a642-dd82-41d0-887f-604ff91901c9",
    path: path.join(__dirname, "./src/locales/translations.json"),
    authorizer: {
        getAccessToken: async () => await auth.getAccessTokenUsingRefreshToken()
    }
});

const htmlPlugin = new HtmlWebPackPlugin({
    template: "./dev/index.html",
    filename: "./index.html"
});

module.exports = {
    entry: "./dev/index.js",
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: "babel-loader"
                }
            },
            {
                test: /\.css$/,
                use: ["style-loader", "css-loader"]
            }
        ]
    },
    plugins: [htmlPlugin, translationPlugin]
};