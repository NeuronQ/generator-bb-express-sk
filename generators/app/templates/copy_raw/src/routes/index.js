module.exports = function (app) {
    app.use('/', require('./public'));
    app.use('/api', require('./api'));
};
