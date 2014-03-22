var path = require('path');
var fs = require('fs');
var articlesGenerator = require('./razordoc/articlesgen');
var fileparser = require('./razordoc/fileparser');
var objectifyTree = require('./razordoc/objectifyTree');
var docgen = require('./razordoc/docgen');
var _ = require('underscore');

module.exports = function(grunt) {

    // process.on('error', function(err) {
    //     console.log('err' + err);
    // });
  grunt.registerMultiTask('razordoc', 'RazorDoc', function() {
    grunt.log.writeln("Starting RazorDoc...");
    var options = this.options({

    });


    // var options = {
    //     articles: {
    //         root: 'src/content'
    //     },
    //     examples: {
    //         'js': {
    //             src: "src/examples/js/",
    //             srcSuffix: ".js",
    //             imagePrefix: "http://samples.razorflow.com/_assets/images/js/",
    //             imageSuffix: ".png",
    //             thumbPrefix: "http://samples.razorflow.com/_assets/images/js/thumbs/",
    //             thumbSuffix: ".png",
    //             livePrefix: "http://samples.razorflow.com/js/",
    //             liveSuffix: ".html"
    //         },
    //         'php': {
    //             src: "src/examples/php/",
    //             srcSuffix: ".js",
    //             imagePrefix: "http://samples.razorflow.com/_assets/images/php/",
    //             imageSuffix: ".png",
    //             thumbPrefix: "http://samples.razorflow.com/_assets/images/php/thumbs/",
    //             thumbSuffix: ".png",
    //             livePrefix: "http://samples.razorflow.com/php/",
    //             liveSuffix: ".html"
    //         }
    //     },
    //     api: {
    //         "js": {
    //             src: ["../jsrf/src/js/components/*.js"],
    //             out: "build/docs/api/js",
    //             relativeLinkPath: "api/js/"
    //         },
    //         "php": {
    //             src: ["../phprf/src/lib/components/*.php"],
    //             out: "build/docs/api/php",
    //             relativeLinkPath: "api/php/"
    //         }
    //     },
    //     linkPrefix: "",
    //     out: "build/docs",
    //     suffix: "html",
    //     /*
    //     base.ejs
    //     article.ejs
    //     api.ejs

    //     ... all other remaining EJS files
    //      */
    //     template: "src/templates/default/article_layout",
    //     apiTemplates: "src/templates/default"
    // };
    // 
    try {

    var configDir = process.cwd();
    // var configDir = path.resolve('.', '../docsrf');
    var articlesDir = configDir + '/' + options.articles.root;
    var linkPrefix = options.linkPrefix;
    var outputDir = path.resolve(configDir, options.out);
    var outputExt = options.suffix;
    var templates = options.template;
    var articles = [];
    var articleStruct = null;
    var apiConfig = {};

    // api configs

    for(var key in options.api) {
        apiConfig[key] = {
            src: path.resolve(configDir, options.api[key].src[0]),
            linkPath: options.api[key].relativeLinkPath
        }
        var filenames = options.api[key].src;
        var files = [];
        for(var i=0; i<filenames.length; i++) {
            var filename = filenames[i],
                file = path.basename(filename);

            // Check for a wildcard
            if(file.match(/\*/g)) {
                var fileRegex = new RegExp(file.replace('*', '[a-zA-Z\\-]*').replace('.', '\\.')),
                    dir = path.resolve(configDir, path.dirname(filename)),
                    filesInDir = fs.readdirSync(dir);

                for(var j=0; j<filesInDir.length; j++) {
                    var f = filesInDir[j];
                    if(fileRegex.test(f)) {
                        files.push(dir + '/' + f);
                    }
                }
            } else {
                files.push(path.resolve(configDir, filename));
            }
        }
        
        var tree = {classes:[], namespace: key};

        templateDir = path.resolve(configDir, options.apiTemplates);
        apiOutput = path.resolve(configDir, options.api[key].out);

        
        for(var i=0; i<files.length; i++) {
            var file = files[i];

            if(!fs.existsSync(file)) {
                console.error(file + ' file not found!');
                process.exit(-1);
            }

            var fileContents = fs.readFileSync(file, 'utf-8');

            fileparser.parse(fileContents, tree);
        }
        
        tree = objectifyTree(tree);
        console.info("START Generating API Documentation")
        var showInheritedMethods =  true;
        docgen.generate(tree, templateDir, apiOutput, outputExt, showInheritedMethods);    
        console.info("END Generating API Documentation. SUCCESS")
        
    }



    // Article configs
    var articleStruct = folderWalker(fs.readdirSync(articlesDir), articlesDir, articles, articlesDir);

    var articleTree = {
        articles: articles,
        articleStruct: articleStruct,
        partials: []
    };
    var apiTree = {};
    var exampleTree = {};
    
    var examplesDir = '';
    var apiOutput = '';
    var examplesExt = '';
    var articleTemplatesDir = path.resolve(configDir, options.template);
    var examplesImagesDir = '';
    var examplesLinkPath = '';
    var exampleImagesLinkPath = '';
    var exampleLiveLinkPath = '';


    // Construct the example tree

    for(var key in options.examples) {
        examplesDir = path.resolve(configDir, options.examples[key].src);
        examplesExt = options.examples[key].srcSuffix;
        var examples = _.map(fs.readdirSync(examplesDir), function(item) {
            return item.replace(examplesExt, '');
        });
        exampleTree[key] = {
            src: path.resolve(configDir, options.examples[key].src),
            srcSuffix: options.examples[key].srcSuffix,
            imagePrefix: options.examples[key].imagePrefix,
            imageSuffix: options.examples[key].imageSuffix,
            thumbPrefix: options.examples[key].thumbPrefix,
            thumbSuffix: options.examples[key].thumbSuffix,
            livePrefix: options.examples[key].livePrefix,
            liveSuffix: options.examples[key].liveSuffix,
            content: examples
        }
    }

    articlesGenerator.generate({
        namespaces: ['js', 'php'],
        articleTree: articleTree, 
        apiConfig: apiConfig,
        apiTree: apiTree, 
        exampleTree: exampleTree,
        articlesDir: articlesDir,
        examplesDir: examplesDir,
        outputDir: outputDir,
        articlesOutput: outputDir, 
        apiOutput: apiOutput,
        examplesExt: examplesExt,
        outputFileExt: outputExt,
        articleTemplatesDir: articleTemplatesDir,
        outputLinkPath: linkPrefix,
        examplesImagesDir: examplesImagesDir,
        examplesLinkPath: examplesLinkPath,
        exampleImagesLinkPath: exampleImagesLinkPath,
        exampleLiveLinkPath: exampleLiveLinkPath
    });

    } catch (e) {
        grunt.fail.warn(e);
    }

    grunt.log.ok("RazorDoc Finished");

    function folderWalker(dirArray, dirPath, articles, rootPath) {
        var dirList = [];
        for(var i=0; i<dirArray.length; i++) {
            var item = dirArray[i];
            var itemPath = dirPath + '/' + item;
            var stats = fs.statSync(itemPath);
            if(stats.isDirectory()) {
                dirList.push({
                    'name': item,
                    'path': itemPath.replace(rootPath, '').replace(/\/*/, ''),
                    'type': 'directory',
                    'content': folderWalker(fs.readdirSync(itemPath), itemPath, articles, rootPath)
                });
                
                // dirList.push(folderWalker(fs.readdirSync(itemPath), itemPath));
            } else if(stats.isFile()) {

              // Check for hidden files, if there exists: ignore it
              if(!item.match(/^\./)){
                  dirList.push({
                      'name': item,
                      'path': itemPath.replace(rootPath, '').replace(/\/*/, ''),
                      'type': 'file',
                  });
                  articles.push({
                      'name': item,
                      'path': itemPath.replace(rootPath, '').replace(/\/*/, '')
                  });
              }
            }
        }

        return dirList;
    }
  });
};
