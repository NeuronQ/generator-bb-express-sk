
'use strict';


module.exports = class Controller {
    /**
     * Create a function request handler that will handle the
     * request by creating a new instance of this controller and
     * calling this method on it.
     *
     * @param methodName
     * @returns {function(this:Controller, req, res)}
     */
    static handler(methodName) {
        var self = this;
        return function (req, res) {
            // create instance
            var instance = new self(req, res);
            if (!instance[methodName]) {
                throw new TypeError(`Method "${methodName}" not found on controller ${this.name}`);
            }
            // call instance's method with arguments req, res, [url params...]
            return instance[methodName].apply(
                instance,
                [req, res].concat( Object.keys(req.params).map(k => req.params[k]))
            );
        };
    }
};
