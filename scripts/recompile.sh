#!/usr/bin/env bash

if [[ ! -d node_modules ]]; then
	echo 'Installing compiler tools...'
	sleep 1
	npm install
fi

echo 'Compiling hotcache...'

node_modules/coffee-script/bin/coffee -c src/*.coffee
rm lib/*.js
mv src/*.js lib/
node_modules/browserify/bin/cmd.js lib/index.js > hotcache.js
node_modules/uglify-js/bin/uglifyjs hotcache.js -o hotcache.min.js

echo 'Done!'

