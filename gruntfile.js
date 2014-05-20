/*global module:false, require:false, __dirname:false*/

module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    concat: {
      js: {
        src: [ 'libs/jquery.js', 'libs/jquery.pjax.js', 'libs/vakata.js', 'libs/jstree.js', 'libs/jstree.sort.js', 'libs/jstree.state.js', 'libs/jstree.wholerow.js', 'src/octotree-vakata.js' ],
        dest: 'dist/data/octotree-vakata.js'
      },
      css: {
        src: [ 'libs/jstree.css', 'src/octotree-vakata.css' ],
        dest: 'dist/data/octotree-vakata.css'
      }
    },
    uglify: {
      options: {
        preserveComments: false,
        report: "min",
        beautify: {
          ascii_only: true
        },
        compress: {
          hoist_funs: false,
          loops: false,
          unused: false
        }
      },
      dist: {
        src: ['dist/data/octotree-vakata.js'],
        dest: 'dist/data/octotree-vakata.js'
      }
    },
    jshint: {
      options: {
        'curly' : true,
        'eqeqeq' : true,
        'latedef' : true,
        'newcap' : true,
        'noarg' : true,
        'sub' : true,
        'undef' : true,
        'boss' : true,
        'eqnull' : true,
        'browser' : true,
        'trailing' : true,
        'globals' : {
          'console' : true,
          'jQuery' : true,
          'browser' : true,
          'XSLTProcessor' : true,
          'ActiveXObject' : true
        }
      },
      src: [ 'libs/vakata.js', 'libs/jstree.js', 'libs/jstree.sort.js', 'libs/jstree.state.js', 'libs/jstree.wholerow.js', 'src/octotree-vakata.js' ]
    },
    cssmin: {
      dist: {
        src: ['dist/data/octotree-vakata.css'],
        dest: 'dist/data/octotree-vakata.css'
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-jshint');


  // Default task.
  grunt.registerTask('default', ['concat','jshint:src','uglify','cssmin']);
};
