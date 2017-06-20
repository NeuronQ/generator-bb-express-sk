'use strict';

var gulp = require('gulp');
var sass = require('gulp-sass');
var sourcemaps = require('gulp-sourcemaps');
var autoprefixer = require('gulp-autoprefixer');
var merge = require('merge-stream');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var rename = require("gulp-rename");
var path = require('path');


const TARGET_DIR = '../public';
console.log(`    ~~ target: ${TARGET_DIR} ~~`);


/*
 * Default
 * IMPORTANT: run 'assemble-materialize-scripts' manually before this,
 * after making tweaks to materialize core scripts, because these need to be built
 * before concat/minif.
 */
gulp.task('default', [
    'common-scripts-copy',
    'scripts-copy',
    'scripts-concat',
    'libs-scripts-copy',
    'libs-scripts-concat',
    'sass',
    'sass-compressed',
    'images-copy',
    'misc-copy',
]);


/*
 * Watch
 */
gulp.task('watch', function () {
    gulp.watch('./sass/**/*.scss', ['sass', 'sass-compressed']);
    gulp.watch('./scripts/**/*', ['scripts-copy']);
    gulp.watch('./scripts/libs/materialize/**/*', ['assemble-materialize-scripts']);
    gulp.watch(['./images/**/*', './icons/**/*'], ['images-copy']);
    gulp.watch('./*', ['misc-copy']);
});


/*
 * Scripts
 */
gulp.task('scripts-copy', function() {
    return gulp.src('./scripts/**/*', {base: '.'})
        .pipe(gulp.dest(TARGET_DIR));
});
gulp.task('scripts-concat', function() {
    return gulp.src([
            './scripts/main.js',
        ])
        .pipe(concat('all-app.js'))
        .pipe(gulp.dest(TARGET_DIR + '/scripts'))
        .pipe(rename('all-app.min.js'))
        .pipe(uglify({
            // do not mangle variable names
            mangle: false,
            // compressor options: http://lisperator.net/uglifyjs/compress
            compress: {}
        }))
        .pipe(gulp.dest(TARGET_DIR + '/scripts'));
});
var libsScripts = [
    '../public/scripts/libs/materialize.tweaked.min.js',
    './node_modules/handlebars/dist/handlebars.runtime.min.js',
]
gulp.task('libs-scripts-copy', function() {
    return gulp.src(libsScripts.concat([
            // these scripts are to be copied, but not included included
            // in concat/minification, most likely because they can also
            // be served from CDN in live mode
            './node_modules/jquery/dist/jquery.min.js'
        ]))
        .pipe(gulp.dest(TARGET_DIR + '/scripts/libs'));
});
gulp.task('libs-scripts-concat', function() {
    return gulp.src(libsScripts)
        .pipe(concat('all-libs.js'))
        .pipe(gulp.dest(TARGET_DIR + '/scripts/libs'))
        .pipe(rename('all-libs.min.js'))
        .pipe(uglify({
            // do not mangle variable names
            mangle: false,
            // compressor options: http://lisperator.net/uglifyjs/compress
            compress: {}
        }))
        .pipe(gulp.dest(TARGET_DIR + '/scripts/libs'));
});


/*
 * Materialize scripts
 */
var materializeScripts = [
    // required 3rd party libs
    "./node_modules/materialize-css/js/jquery.easing.1.3.js",
    "./node_modules/materialize-css/js/velocity.min.js",
    "./node_modules/materialize-css/js/hammer.min.js",
    "./node_modules/materialize-css/js/jquery.hammer.js",
    // "./node_modules/materialize-css/js/jquery.timeago.min.js",
    // "./node_modules/materialize-css/js/date_picker/picker.js",
    // "./node_modules/materialize-css/js/date_picker/picker.date.js",

    "./node_modules/materialize-css/js/initial.js",
    "./node_modules/materialize-css/js/global.js",

    "./node_modules/materialize-css/js/animation.js",
    "./node_modules/materialize-css/js/pushpin.js",

    "./node_modules/materialize-css/js/collapsible.js",
    "./node_modules/materialize-css/js/dropdown.js",
    "./node_modules/materialize-css/js/leanModal.js",
    "./node_modules/materialize-css/js/modal.js",
    "./node_modules/materialize-css/js/materialbox.js",
    "./node_modules/materialize-css/js/parallax.js",
    "./node_modules/materialize-css/js/tabs.js",
    "./node_modules/materialize-css/js/tooltip.js",
    "./node_modules/materialize-css/js/waves.js",
    "./node_modules/materialize-css/js/toasts.js",

    // "./node_modules/materialize-css/js/sideNav.js",
    "./scripts/libs/materialize/sideNav.tweaked.js", // tweaked

    "./node_modules/materialize-css/js/scrollspy.js",
    "./node_modules/materialize-css/js/forms.js",

    // "./node_modules/materialize-css/js/slider.js",
    // "./node_modules/materialize-css/js/carousel.js",
    // "./node_modules/materialize-css/js/cards.js",
];
gulp.task('assemble-materialize-scripts', function() {
    return gulp.src(materializeScripts)
        .pipe(concat('materialize.tweaked.js'))
        .pipe(gulp.dest(TARGET_DIR + '/scripts/libs'))
        .pipe(rename('materialize.tweaked.min.js'))
        .pipe(uglify({
            // do not mangle variable names
            mangle: false,
            // compressor options: http://lisperator.net/uglifyjs/compress
            compress: {}
        }))
        .pipe(gulp.dest(TARGET_DIR + '/scripts/libs'));
});


/*
 * Styles
 */
var sass_options = {
    sourceComments: true
};
gulp.task('sass', function () {
    // SASS compilation + autoprefixer
    var sassStream = gulp.src('./sass/**/*.scss')
        .pipe(sourcemaps.init())
        .pipe(sass(sass_options).on('error', sass.logError))
        .pipe(autoprefixer('last 2 version'))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(TARGET_DIR + '/css/'));

    // additional css files
    // var cssStream = gulp.src([
    //     './node_modules/rateYo/src/jquery.rateyo.css'
    // ]);

    // concat plain css + SASS compiled
    // return merge(cssStream, sassStream)
    //     .pipe(gulp.dest(TARGET_DIR + '/css/'));
});
gulp.task('sass-compressed', function () {
    // SASS compilation + autoprefixer
    var sassStream = gulp.src('./sass/**/*.scss')
        .pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError))
        .pipe(autoprefixer('last 2 version'))
        .pipe(rename('all-app.min.css'))
        .pipe(gulp.dest(TARGET_DIR + '/css/'));

    // additional css files
    // var cssStream = gulp.src([
    //     './node_modules/rateYo/src/jquery.rateyo.css'
    // ]);

    // concat plain css + SASS compiled
    // return merge(cssStream, sassStream)
    //     .pipe(gulp.dest(TARGET_DIR + '/css/'));
});


/*
 * Images
 */
gulp.task('images-copy', function () {
    return gulp.src(
        [
            './images/**/*',
            './icons/**/*'
        ],
        {base: '.'}
    ).pipe(gulp.dest(TARGET_DIR));
});


/*
 * Misc.
 */
gulp.task('misc-copy', function () {
    return gulp.src(
        [
            './sitemap.xml',
            './favicon.ico',
            './browserconfig.xml',
            './robots.txt'
        ],
        {base: '.'}
    ).pipe(gulp.dest(TARGET_DIR));
});


/*
 * Common Scripts - this code can run both on server and in browser!!!
 */
gulp.task('common-scripts-copy', function () {
    return gulp.src('../common/**/*', {base: '../common/'})
    .pipe(gulp.dest(`${TARGET_DIR}/scripts/common`));
});
