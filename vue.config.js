'use strict'
const path = require('path')
const defaultSettings = require('./src/settings.js')
// const fs = require('fs')
// var https = require('https')
// https.globalAgent.options.rejectUnauthorized = false
const backend = {
    // target: 'http://112.137.129.214:15580',
    target: 'http://10.10.1.155',
    secure: false,
    changeOrigin: true
//    pathRewrite: {'^/api' : ''}
}

function resolve(dir) {
  return path.join(__dirname, dir)
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
      '/containmentRels': backend
      // '/api': {
      //     target: 'http://112.137.129.214:15580',
      //     pathRewrite: {'^/api' : ''},
      //     secure: false,
      //     changeOrigin: true
      // }
    },
    // https: true,
    // key: fs.readFileSync('/home/nnhoa/ca/new/server.key'),
    // cert: fs.readFileSync('/home/nnhoa/ca/new/server.crt'),
    // ca: fs.readFileSync('/home/nnhoa/ca/new/ca.crt'),
    // key: fs.readFileSync('server.key'),
    // cert: fs.readFileSync('server.crt'),
    // public: 'https://ipsmanager.herokuapp.com/'
  },
  configureWebpack: {
    resolve: {
      alias: {
        "requestfactory": resolve('src/request/RequestFactory.js'),
        "common": resolve('src/common'),
        "@": resolve('src')
      }
    }
  },
  lintOnSave: process.env.NODE_ENV !== "production",
  chainWebpack(config) {
    // set svg-sprite-loader
    config.module
      .rule('svg')
      .exclude.add(resolve('src/icons'))
      .end()
    config.module
      .rule('icons')
      .test(/\.svg$/)
      .include.add(resolve('src/icons'))
      .end()
      .use('svg-sprite-loader')
      .loader('svg-sprite-loader')
      .options({
        symbolId: 'icon-[name]'
      })
      .end()
    config.when(process.env.NODE_ENV === "development", config =>
      config.devtool("cheap-source-map")
    );
  }
}
