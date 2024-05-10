const serveStatic = require("serve-static");

const {
  createProxyMiddleware,
  debugProxyErrorsPlugin, // subscribe to proxy errors to prevent server from crashing
  errorResponsePlugin, // return 5xx response on proxy error
  proxyEventsPlugin, // implements the "on:" option
  loggerPlugin,
} = require("http-proxy-middleware");


const pathFilter = function (path, req) {
  return path.match("^/api");
};

module.exports = function (app) {
  // this middleware serve statc assets
  app.use(serveStatic("src/public"));
  app.use(
    createProxyMiddleware({
      logger: console,
      target: "https://toolkit.lte.ink:8000/",
      changeOrigin: true,
      pathFilter: pathFilter,
      pathRewrite: {
        "^/api": "",
      },
      plugins: [
        debugProxyErrorsPlugin,
        loggerPlugin,
        errorResponsePlugin,
        proxyEventsPlugin,
      ],
    })
  );
};
