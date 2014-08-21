module.exports = (grunt) ->
  grunt.initConfig
    jade:
      compile:
        files:
          'build/index.html': ['index.jade']

    connect:
      server:
        options:
          port: 5000
          base: 'build/'
          livereload: true

    watch:
      pages:
        files: ['index.jade']
        tasks: ['jade']
      scripts:
        files: ['index.coffee']
        tasks: ['coffee']
      styles:
        files: ['index.styl']
        tasks: ['stylus']
      build:
        files: ['build/**']
        options:
          livereload: true

    open:
      build:
        path: 'http://localhost:5000'

    coffee:
      main:
        files:
          'build/index.js': ['index.coffee']

    stylus:
      style:
        files:
          'build/index.css': ['index.styl']

  grunt.loadNpmTasks 'grunt-contrib-jade'
  grunt.loadNpmTasks 'grunt-contrib-connect'
  grunt.loadNpmTasks 'grunt-contrib-watch'
  grunt.loadNpmTasks 'grunt-open'
  grunt.loadNpmTasks 'grunt-contrib-coffee'
  grunt.loadNpmTasks 'grunt-contrib-stylus'

  grunt.registerTask 'default', ['jade', 'coffee', 'stylus', 'connect', 'open', 'watch']
