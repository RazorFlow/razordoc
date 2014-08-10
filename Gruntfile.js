var articlesGen = require('./src/articlesGen');

module.exports = function (grunt) {
    grunt.initConfig({
        apiMeta: {
            core: {
                options: {
                    src: ["../jsrf/src/js/components/*.js"],
                    out: "build/apiMeta.json"
                }
            }
        },
        api: {
            core: {
                options: {
                    src: "build/apiMeta.json",
                    outPath: "build/docs/dashboard/js/api",
                    relativeLinkPath: "/docs/dashboard/js/api",
                    linkPrefix: "",
                    suffix: "html",
                    apiTemplates: "fixture/templates"
                }
            }
        },
        articles: {            
            fixture: {
                options: require('./config/articlesConfig')
            }
        }
    });

    grunt.loadTasks('./tasks');
};