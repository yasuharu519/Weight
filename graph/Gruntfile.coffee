module.exports = (grunt) ->
  grunt.initConfig
    pug:
      compile:
        files:
          'build/index.html': ['index.pug']

    connect:
      server:
        options:
          port: 5000
          base: 'build/'
          livereload: true

    watch:
      pages:
        files: ['index.pug']
        tasks: ['pug']
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

    clean:
      debuild: ['build/', '.grunt/']

    'gh-pages':
      options:
        base: 'build/'
      src: ['**']

  grunt.loadNpmTasks 'grunt-contrib-pug'
  grunt.loadNpmTasks 'grunt-contrib-connect'
  grunt.loadNpmTasks 'grunt-contrib-watch'
  grunt.loadNpmTasks 'grunt-open'
  grunt.loadNpmTasks 'grunt-contrib-coffee'
  grunt.loadNpmTasks 'grunt-contrib-stylus'
  grunt.loadNpmTasks 'grunt-contrib-clean'
  grunt.loadNpmTasks 'grunt-gh-pages'

  grunt.registerTask 'default', ['pug', 'coffee', 'stylus', 'connect', 'open', 'watch']
  grunt.registerTask 'deploy',  ['clean', 'pug', 'coffee', 'stylus', 'gh-pages']
  grunt.registerTask 'ci',  ['clean', 'pug', 'coffee', 'stylus']
