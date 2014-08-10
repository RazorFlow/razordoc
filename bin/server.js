var http = require('http');
var path = require('path');
var articlesGen = require('../src/articlesGen');
var options = require('../config/articlesConfig');
var configDir = path.resolve(process.cwd());
articlesGen.serve (options, configDir);