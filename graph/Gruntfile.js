/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
module.exports = function(grunt) {
  grunt.initConfig({
    pug: {
      compile: {
        files: {
          'build/index.html': ['index.pug']
        }
      }
    },

    connect: {
      server: {
        options: {
          port: 5000,
          base: 'build/',
          livereload: true
        }
      }
    },

    watch: {
      pages: {
        files: ['index.pug'],
        tasks: ['pug']
      },
      scripts: {
        files: ['index.js'],
        tasks: ['babel']
      },
      styles: {
        files: ['index.styl'],
        tasks: ['stylus']
      },
      build: {
        files: ['build/**'],
        options: {
          livereload: true
        }
      }
    },

    open: {
      build: {
        path: 'http://localhost:5000'
      }
    },

    babel: {
      options: {
        sourceMap: true
      },
      dist: {
        files: {
          "./build/index.js": "./index.js"
        }
      }
    },

    stylus: {
      style: {
        files: {
          'build/index.css': ['index.styl']
        }
      }
    },

    clean: {
      debuild: ['build/', '.grunt/']
    },

    'gh-pages': {
      options: {
        base: 'build/'
      },
      src: ['**']
    }});

  grunt.loadNpmTasks('grunt-babel');
  grunt.loadNpmTasks('grunt-contrib-pug');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-open');
  grunt.loadNpmTasks('grunt-contrib-stylus');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-gh-pages');

  grunt.registerTask('default', ['pug', 'babel', 'stylus', 'connect', 'open', 'watch']);
  grunt.registerTask('deploy',  ['clean', 'pug', 'babel', 'stylus', 'gh-pages']);
  return grunt.registerTask('build',  ['clean', 'pug', 'babel', 'stylus']);
};
