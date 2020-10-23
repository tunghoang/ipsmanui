const path = require("path")
// const fs = require('fs')
// var https = require('https')
// https.globalAgent.options.rejectUnauthorized = false
const backend = {
    target: 'http://112.137.129.214:15580',
    secure: false
//    pathRewrite: {'^/api' : ''}
}
module.exports = {
  lintOnSave: false,
  runtimeCompiler: true,
  publicPath: '/',
  devServer: {
    disableHostCheck: true,
    injectClient: false,
    compress: true,
    port: 10099,
    // proxy: 'https://ipsmanagerapi.uetis.com/',
    proxy: {
      '/users': backend,
      '/roles': backend,
      '/objects': backend,
      '/userRoleRels': backend,
      '/login': backend,
      '/logout': backend,
      '/enginetypes': backend,
      '/engines': backend,
      '/permissions': backend,
      '/containmentRels': backend,
      // '/api': {
      //     target: 'http://112.137.129.214:15580',
      //     pathRewrite: {'^/api' : ''}
      // }
    },
    // https: true,
    // key: fs.readFileSync('/home/nnhoa/ca/new/server.key'),
    // cert: fs.readFileSync('/home/nnhoa/ca/new/server.crt'),
    // ca: fs.readFileSync('/home/nnhoa/ca/new/ca.crt'),
    // key: fs.readFileSync('server.key'),
    // cert: fs.readFileSync('server.crt'),
    // public: 'https://ipsmanager.uetis.com'
  },
  configureWebpack: {
    resolve: {
      alias: {
        "requestfactory": path.resolve(
          __dirname,
          "src/request/RequestFactory.js"
        ),
        "common": path.resolve(__dirname, 'src/common'),
        "@": path.resolve(__dirname, 'src')
      }
    }
  },
  lintOnSave: process.env.NODE_ENV !== "production",
  chainWebpack(config) {
    config.when(process.env.NODE_ENV === "development", config =>
      config.devtool("cheap-source-map")
    );
  }
}
