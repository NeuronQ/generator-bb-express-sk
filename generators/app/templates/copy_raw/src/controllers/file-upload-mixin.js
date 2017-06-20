var fs = require('fs-extra');
var path = require('path');
var shortid = require('shortid');
var assert = require('assert');

// var debug = require('debug')('bdexsk:controllers:file-upload-mixin');


module.exports = base => class extends base {
    /*
     * Assume:
     * - one file field per request
     */

    upload(req, res, id) {
        this.Model.findById(id, (err, item) => {
            if (err) return res.status(500).jsend.error('item to attach file to not found');

            var file;
            if (req.file) {
                file = req.file;
            } else if (req.files) {
                file = req.files[Object.keys(req.files)[0]][0];
            }
            if (!file) return res.status(400).jsend.fail('no file');

            // console.log('#--- file:', req.file);
            // console.log('#--- files:', req.files);
            // console.log('#--- var file:', file);

            this._processUploadedFile(id, file, (err, path) => {
                if (err) return res.status(500).jsend.error({
                    message: 'error processing uploaded file',
                    data: err
                });

                this._linkFileToItem(item, file.fieldname, path, err => {
                    if (err) return res.status(500).jsend.err({
                        message: 'error linking file to item',
                        data: err
                    });

                    res.json({
                        success: true,
                        uuid: path
                    });
                });
            });

        });
    }


    deleteFile(req, res, id, fieldName) {

        // console.log(`!!!--- delete file request (${id}, ${fieldName}`);

        var path = req.query.path;
        // if we have a double slash prefix, remove it and use a single one
        path = path.replace(/^\/\//, '/');
        if (!path) return res.status(400).jsend.fail('no "path" parameter');

        fs.realpath(global.__root + '/public' + path, (err, absPath) => {
            assert(err === null);

            fs.unlink(absPath, err => {
                if (err) return res.status(500).jsend.error({
                    message: 'error deleting file',
                    path: path
                });

                // console.log('!!!--- file deleted');

                this.Model.findById(id, (err, item) => {
                    if (err) return res.status(500).jsend.error('item to detach file from not found');

                    // console.log('!!!--- got item linked to deleted file');

                    this._unlinkFileFromItem(item, fieldName, path, err => {
                        if (err) return res.status(500).jsend.err({
                            message: 'error linking file to item',
                            data: err
                        });

                        // console.log('!!!--- unlinked file from item');

                        res.json({success: true});
                    });
                });
            });
        });
    }


    remove(req, res, id) {
        this.Model.findByIdAndRemove(id, (err, item) => {
            if (err) return res.status(500).jsend.error('error deleting resource');
            if (!item) return res.status(404).jsend.error('cannot find resource to delete');

            const itemDirAbsPath = this._makeDirPath(id);
            fs.remove(itemDirAbsPath, err => {
                if (err) return res.status(500).jsend.error({
                    message: 'error deleting files for deleted item',
                    date: {
                        item_id: id,
                    }
                });

                res.jsend.success({deleted_item: item});
            });
        });
    }


    _processUploadedFile(id, file, cb) {
        // debug('processing uploaded file:', arguments);

        // Path where file will end up
        var destDirPath = this._makeDirPath(id, file.fieldname, file.originalname);

        // debug('dest dir path:', destDirPath);

        fs.ensureDir(destDirPath, err => {
            assert(err === null);

            fs.realpath(destDirPath, (err, absDestDirPath) => {
                // debug('dest dir real path:', absDestDirPath);

                var destFileName = this._makeFilename(id, file.fieldname, file.originalname);

                // debug('destFileName:', destFileName);

                var destPath = path.join(absDestDirPath, destFileName);

                // debug('destPath:', destPath);

                fs.move(file.path, destPath, err => {
                    if (err) return cb(err);

                    // console.log('### uploaded file now at:', destPath);

                    cb(null, destPath.replace(global.__root + '/public', ''));
                });
            });
        });
    }


    _makeDirPath(id, fieldName, fileName) {
        let dirPath = global.__root + '/public/uploads/' +
            this.Model.modelName.toLowerCase() + '/' + id;
        if (fieldName && this.Model.fileFields[fieldName] === 'multiple') {
            dirPath += '/' + fieldName;
        }
        return dirPath;
    }


    _makeFilename(id, fieldName, fileName) {
        var m = fileName.match(/\.[^.]+$/g);
        var ext = m && m[0] ? m[0].trim() : '.jpg';
        return fileName.slice(0, 8) + '_' + shortid.generate() + ext;
    }


    _linkFileToItem(item, fieldName, path, cb) {

        if (item[fieldName] && Array.isArray(item[fieldName])) {
            if (item[fieldName].indexOf(path) === -1) {
                item[fieldName].push(path);

                item.save(cb);
            }

        } else if (item[fieldName] !== path) {
            item[fieldName] = path;

            item.save(cb);

        } else {

            cb(null);
        }
    }


    _unlinkFileFromItem(item, fieldName, path, cb) {

        // console.log(`!!!--- _unlinkFileFromItem (${fieldName}, ${path}`);

        if (item[fieldName] && Array.isArray(item[fieldName])) {
            // console.log('--- removing ' + path + ' from ', item[fieldName]);
            var i = item[fieldName].indexOf(path);
            if (i !== -1) {
                item[fieldName].splice(i, 1);

                item.save(cb);
            }

        } else if (item[fieldName] === path) {
            item[fieldName] = '';

            item.save(cb);

        } else {

            cb(null);
        }
    }
};
