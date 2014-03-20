module.exports = function(grunt) {

  grunt.registerMultiTask('razordoc', 'RazorDoc', function() {
    grunt.log.writeln("Starting RazorDoc...");
    var options = this.options({

    });

    grunt.log.writeln("The prefix is" + options.linkPrefix);

    

    grunt.log.ok("RazorDoc Finished");
  });
};
