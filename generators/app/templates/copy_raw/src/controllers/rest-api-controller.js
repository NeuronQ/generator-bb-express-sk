'use strict';

var _ = require('lodash');
var ObjectId = require('mongoose').Types.ObjectId;
// var debug = require('debug')('bbexsk:controllers:rest-api-controller');
var fs = require('fs');

var Controller = require('./controller');


module.exports = class RestApiController extends Controller {

    index(req, res) {
        var params = {
            q: req.param('q', {}),
            search: req.param('search'),
            // paginatin params
            page: +req.param('page'),
            offset: +req.param('offset') || 0,
            limit: +req.param('limit') || 100,
        }
        this._getItems(params, (err, r) => {
            if (err) return res.status(500).jsend.error('error listing resources');
            res.jsend.success({
                r: r,
                items: r.docs,
                offset: r.offset || 0,
                page: r.page || 1,
                pages: Math.ceil(r.total / r.offset) || 1,
                total: r.total
            });
        });
    }


    create(req, res) {
        var data = req.body.data;
        this.Model.create(data, (err, item) => {
            if (err) return res.status(500).jsend.error('error creating resource');
            res.jsend.success({item: item});
        });
    }


    read(req, res, id) {
        this.Model.findById(id, (err, item) => {
            if (err) return res.status(404).jsend.error('resource not found');
            if (!item.id) item.id = item._id;
            res.jsend.success({item: item});
        });
    }


    updateReplace(req, res, id) {
        var data = req.body.data;
        delete data._id;
        delete data.id;
        this.Model.findByIdAndUpdate(id, data, {overwrite: true}, (err, item) => {
            if (err) return res.status(500).jsend.error('error replace-updating resource');
            if (!item) return res.status(404).jsend.error('cannot find resource to replace-update');
            res.jsend.success({old_item: item});
        });
    }


    updatePatch(req, res, id) {
        var data = data || req.body.data;
        this.Model.update({_id: new ObjectId(id)}, data, (err, raw) => {
            if (err) return res.status(500).jsend.error('error patch-updating resource');
            if (!raw.n) return res.status(404).jsend.error('cannot find resource to patch-update');
            res.jsend.success(null);
        });
    }


    remove(req, res, id) {
        this.Model.findByIdAndRemove(id, (err, item) => {
            if (err) return res.status(500).jsend.error('error deleting resource');
            if (!item) return res.status(404).jsend.error('cannot find resource to delete');
            res.jsend.success({deleted_item: item});
        });
    }


    _getItems(params, cb) {
        var q = params.q;

        // search
        var search = params.search;
        if (search && this.searchFields) {
            var searchQuery = this._getSearchQuery(search);
            // debug('searchQuery:', searchQuery);
            if (!q.$and) q.$and = [];
            Array.prototype.push.apply(q.$and, searchQuery);
        }

        // debug('q:', q);

        // pagination
        var pageOpts = {
            page: params.page,
            offset: params.offset,
            limit: params.limit
        };

        this.Model.paginate(q, pageOpts, cb);
    }


    /**
     * We parse a search query to a mongo query.
     *
     * Phrases separated by commas are AND-ed (each one of them must match at
     * least one of the searchable fields), and each comma separated phrase
     * can contain OR-ed sub-phrases (marked by"or" separated by spaced, case
     * insensitive). Both "," and "or" can be preceded by a backslash (\) if
     * we want them to not have special meaning (like when we want to search
     * for strings containing literal "," or "or")
     *
     * Example ("* /i" to be read without the space):
     *     "term1, and another [term2], term3 or phrase term 4"
     *     =>
     *     [
     *       { $or: [
     *         { searchable_field_1: /.*term1. * /i },
     *         { searchable_field_2: /.*term1. * /i },
     *         ... ] },
     *       { $or: [
     *         { searchable_field_1: /.*and another \[term2\] * /i },
     *         { searchable_field_2: /.*and another \[term2\] * /i },
     *         ... ] },
     *       { $or: [
     *         { searchable_field_1: /.*term3. * /i },
     *         { searchable_field_1: /.*phrase term 4. * /i },
     *         { searchable_field_2: /.*term3. * /i },
     *         { searchable_field_2: /.*phrase term 4. * /i },
     *         ... ] }
     *     ]
     *
     * @param searchStr
     * @returns {Array}
     */
    _getSearchQuery(searchStr) {
        // split on commas not preceded by backslashes (\)
        // (1) space out all ","s without a \ immediately before
        // (2) split on it (because we know the character just behind is a space
        //     so we can safely throw it away
        var parts = searchStr
            .replace(/([^\\]),/g, "$1 , ") // (1)
            .split(/[^\\],/) // (2)
            .map(s => s.trim())
            .filter(s => s);

        var r = [];

        parts.forEach(searchPartStr => {
            searchPartStr = unquoteSpecials(searchPartStr);
            r.push(this._getSearchPartQuery(searchPartStr));
        });

        return r;


        function unquoteSpecials(s) {
            return s.replace(/\\,/g, ",");
        }
    }


    /**
     * Parse part of query to part of mongo query.
     *
     * Example ("* /i" to be read without the space):
     *     "term3 or phrase term 4"
     *     =>
     *     { $or: [
     *       { searchable_field_1: /.*term3. * /i },
     *       { searchable_field_1: /.*phrase term 4. * /i },
     *       { searchable_field_2: /.*term3. * /i },
     *       { searchable_field_2: /.*phrase term 4. * /i },
     *       ... ] }
     *
     * @param str
     * @returns {{$or: Array}}
     */
    _getSearchPartQuery(str) {
        var phrases = str.split(/\sOR\s/i)
            .map(s => s.trim())
            .filter(s => s);

        var subQParts = [];
        phrases.forEach(phrase => {
            this.searchFields.forEach(field => {
                phrase = _.escapeRegExp(unquoteSpecials(phrase));
                subQParts.push({
                    [field]: {
                        $regex: '.*' + phrase + '.*',
                        $options: 'i'
                    }
                });
            });
        });

        return { $or: subQParts };


        function unquoteSpecials(s) {
            return s.replace(/\s\\(OR)\s/ig, " $1 ");
        }
    }
};
