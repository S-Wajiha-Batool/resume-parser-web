const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: "https://resume-parser-web-backend.onrender.com",
      changeOrigin: true,
    })
  );
};
