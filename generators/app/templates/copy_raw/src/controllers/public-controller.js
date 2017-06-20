var _ = require('underscore');
var express = require('express');
var app = express();
// var debug = require('debug')('bbexsk:controllers:public');

var Controller = require('./controller');


module.exports = class PublicController extends Controller {

    index(req, res) {
        // global.logger.info('some info message', JSON.stringify(res.body));
        // global.logger.debug('some debug message', JSON.stringify(res.body));
        // global.logger.error('some error message', JSON.stringify(res.body));

        // this.req.logout();
        // this.req.session.destroy();

        var data = {
            ENV: app.get('env'),
            renderer: 'server app',
            title: 'the dark side',
        }
        data.dataJsonStr = JSON.stringify(data);
        // add "private" (non-JS/clinet-shared) data here:
        // NOTE: you're sending it to a template so really, this is *anything
        // but private* anyhow :)
        data.googleUaTrackingId = global.__settings.googleUaTrackingId;

        res.render('index.hbs', data);
    }
}