jQuery(document).ready(function ($) {
    'use strict';

    setTimeout(function() {
        $('#main').html(
            Handlebars.templates.welcome({
                renderer: 'browser'
            })
        );
    }, 3000);
});
