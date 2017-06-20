var express = require('express');
var router = express.Router();
var multer  = require('multer');
var upload = multer({ dest: 'uploads/' });


// router.use('/products', (function () {
//     var r = express.Router();
//     var Products = require('../controllers/products');

//     r.get('/', Products.handler('index'));
//     r.post('/', global.ensureAuthenticated, Products.handler('create'));
//     r.get('/:id', Products.handler('read'));
//     r.put('/:id', global.ensureAuthenticated, Products.handler('updateReplace'));
//     r.patch('/:id', global.ensureAuthenticated, Products.handler('updatePatch'));
//     r.delete('/:id', global.ensureAuthenticated, Products.handler('remove'));

//     var uploadFields = upload.fields([
//         { name: 'pics', maxCount: 1 },
//         { name: 'main_pic', maxCount: 1 },
//     ]);
//     r.post('/:id/upload', global.ensureAuthenticated, uploadFields, Products.handler('upload'));
//     r.delete('/:id/:fieldName/delete-file', global.ensureAuthenticated, Products.handler('deleteFile'));

//     return r;
// })());


module.exports = router;
