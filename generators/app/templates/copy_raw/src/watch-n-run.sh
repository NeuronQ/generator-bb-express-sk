#!/usr/bin/env bash

gulp --cwd assets

# use --raw to keep the colors from debug(...) logging
concurrently -p index --kill-others --raw \
    "nodemon debug --debug --use_strict ../bin/www" \
    "gulp --cwd assets watch"
