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
      build:
        files: ['build/**']
        options:
          livereload: true

    open:
      build:
        path: 'http://localhost:5000'

  grunt.loadNpmTasks 'grunt-contrib-jade'
  grunt.loadNpmTasks 'grunt-contrib-connect'
  grunt.loadNpmTasks 'grunt-contrib-watch'
  grunt.loadNpmTasks 'grunt-open'

  grunt.registerTask 'default', ['jade', 'connect', 'open', 'watch']
