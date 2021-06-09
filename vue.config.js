'use strict'
const path = require('path');
require('events').EventEmitter.defaultMaxListeners = 150;
const defaultSettings = require('./src/settings.js')
// const fs = require('fs')
// var https = require('https')
// https.globalAgent.options.rejectUnauthorized = false
const backend = {
    //target: 'http://112.137.129.214:34280',
    target: 'http://ipsman.duckdns.org',
    // target: 'http://10.10.1.155',
    secure: false,
    changeOrigin: true
//    pathRewrite: {'^/api' : ''}
}

const ips = {
  target: 'https://ipsmanager.uetis.com',
  changeOrigin: true
}

function resolve(dir) {
  return path.join(__dirname, dir)
}

module.exports = {
  lintOnSave: false,
  runtimeCompiler: true,
  publicPath: process.env.NODE_ENV === 'production'
    ? '/ipsman-fe/'
    : '/',
  devServer: {
    disableHostCheck: true,
    injectClient: false,
    compress: true,
    //port: 15580,
    port: 8000,
    // host: "112.137.129.225",
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
      '/control': backend
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

/**
 * Proxy bypass function to bypass request to interface.domain.ext back to /index.html
 *
 * @param req
 * @param res
 * @param proxyOptions
 * @returns {string}
 */
function bypassFunction(req, res, proxyOptions) {
  if (req.headers && req.headers.host) {
    let expression = new RegExp('(my\\.(' + domains.join('|').replace(new RegExp('\\.', 'gi'), '\\.') + '))', 'i');
    let match = req.headers.host.match( expression );
    if (match && match.length > 0) {
       return '/index.html';
    }
  }
}


/**
 * Adjust request headers before send to script
 * @param proxyReq
 * @param req
 */
function relayRequestHeaders(proxyReq, req) {}


/**
 * Adjust response headers before send to browser
 * @param proxyRes
 * @param req
 * @param res
 */
function relayResponseHeaders(proxyRes, req, res) {
  if (proxyRes.headers && proxyRes.headers.location) {
    // my is not in the prefixes
    let expression = new RegExp('https://(((my|' + domainPrefixes.join('|') + ')\\.(' + domains.join('|').replace(new RegExp('\\.', 'gi'), '\\.') + '))(:443)?)/', 'i');
    let match = proxyRes.headers.location.match( expression );
    if (match && match.length > 0) {
      // match[0] is full url
      // match[1] is url including port (if set)
      // match[2] is url excluding port
      // match[3] is domain prefix
      // match[4] is domain
      // match[5] is port if set
      proxyRes.headers.location = proxyRes.headers.location.replace(match[1], match[2] + ':8080');
      res.append( 'location', proxyRes.headers.location );
    }
  }
}
