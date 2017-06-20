var fs = require('fs-extra');
var path = require('path');

var RestApiController = require('./rest-api-controller');
var FileUploadMixin = require('./file-upload-mixin');
var buildProductsSearchQuery = require(global.__root + '/models/products-query-builder');
var ProductPageScraper = require(global.__root + '/scrapers/product-page-scraper');

// var debug = require('debug')('bdexsk:controllers:products');


module.exports = class ProductsController extends FileUploadMixin(RestApiController) {

    constructor(req, res) {
        super(req, res);

        this.Model = require('../models/product');

        this.searchFields = [
            'name',
            'shop_name'
        ];
    }


    /**
     * @override
     */
    create() {
        // if needed, move main pic to a product dir after...
        if (this.req.body.move_main_pic && this.req.body.main_pic) {
            var data = this.req.body.data;
            this.Model.create(data, (err, item) => {
                if (err) return this.res.status(500).jsend.error('error creating resource');

                var newPicAbsDir = global.__root + '/public' + path.dirname(item.main_pic) + '/product/' + item._id;
                var newPicUrlPath = item.main_pic.replace('/uploads/', '/uploads/product/' + item._id + '/');
                var newPicAbsFsPath = global.__root + '/public' + newPicUrlPath;

                // debug('ensuring dir exists:', newPicAbsDir);
                fs.ensureDir(newPicAbsDir, err => {
                    if (err) { // dire creation error but overall still a success
                        // debug('error creating dir for product file:', newPicAbsDir, err);
                        this.res.jsend.success({item: item});
                        return;
                    }

                    fs.rename(global.__root + '/public' + item.main_pic, newPicAbsFsPath, err => {
                        if (err) { // rename error but overall still a success
                            // debug('error moving product file to:', newPicAbsFsPath, err);
                            this.res.jsend.success({item: item});
                            return;
                        }

                        this.Model.update({_id: item._id}, {main_pic: newPicUrlPath}, err => {
                            if (err) { // log update error but still overall a success
                                // debug('error moving products file:', err);
                            }

                            this.res.jsend.success({item: item});
                        });
                    });
                });
            });

        } else { // ...otherwise just do the default thing
            super.create();
        }
    }
};
