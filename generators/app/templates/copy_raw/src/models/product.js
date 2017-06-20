'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Mixed = Schema.Types.Mixed;
var mongoosePaginate = require('mongoose-paginate');


var productSchema = new Schema(
    {
        // product name
        name: String,
        // product description
        desc: String,
        // main product picture
        main_pic: String,
        // product pics
        pics: [String],
        // url
        url: String,
        // price - mininum if many (amount, like "8.99")
        price: String,
        // price currency (3-letter-code like "USD")
        price_curr: String,
        // tags
        tags: [String],
        hidden: Boolean,
    },
    {
         timestamps: {
            createdAt: 'created_at',
            updatedAt: 'updated_at'
        }
    }
);
productSchema.plugin(mongoosePaginate);
productSchema.set('toObject', { virtuals: true });
productSchema.set('toJSON', { virtuals: true });

var Model = mongoose.model('Product', productSchema);
Model.fileFields = {
    main_pic: 'single',
    pics: 'multiple'
};
Model.searchableFeatures = [
    'sex',
    'color'
];

module.exports = Model;
