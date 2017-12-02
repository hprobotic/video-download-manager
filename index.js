#!/usr/bin/env node
'use strict';

var commander 	= require('commander');
var download 	= require('./download');

commander
  .command('dl <url> <isDelete>')
  .description('Download Videos Of Particular Course')
  .action(function(url, isDelete) {
    download.boot(url, isDelete);
});

commander.parse(process.argv);
