module.exports = function(grunt) {

  'use strict';

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    jshint: {
      options: {
        curly: true,
        eqeqeq: true,
        eqnull: true,
        browser: true,
        strict: true,
        undef: true,
        unused: true,
        bitwise: true,
        forin: true,
        freeze: true,
        latedef: true,
        noarg: true,
        nocomma: true,
        nonbsp: true,
        nonew: true,
        notypeof: true,
        jasmine: true,
        jquery: true,
        globals: {
          module: false, require: false, // for Gruntfile.js
          exports: false, // for protractor.conf.js
          inject: false, // testing angular
          angular: false,
          console: false,
          browser: false, element: false, by: false, // Protractor
        },
      },
      all: ['Gruntfile.js', 'karma.conf.js', 'protractor.conf.js', 'src/*.js', 'languages/*.js']
    },
    karma: {
      unit: {
        configFile: 'karma.conf.js',
        singleRun: true
      }
    },
    // Run karma and watch files using:
    // grunt karma:unit:start watch
    watch: {
      files: ['src/*.js'],
      tasks: ['jshint', 'karma:unit:run']
    },
    concat: {
      options: {
        separator: ';',
      },
      dist: {
        // Order is important! gameLogic.js must be first because it defines the myApp angular module.
        src: ['src/gameLogic.js', 'src/game.js'],
        dest: 'dist/everything.js',
      },
    },
    uglify: {
      options: {
        sourceMap: true,
      },
      my_target: {
        files: {
          'dist/everything.min.js': ['dist/everything.js']
        }
      }
    },
    processhtml: {
      dist: {
        files: {
          'game.min.html': ['game.html']
        }
      }
    },
    manifest: {
      generate: {
        options: {
          basePath: '.',
          cache: [
            'http://ajax.googleapis.com/ajax/libs/angularjs/1.3.8/angular.min.js',
            'http://ajax.googleapis.com/ajax/libs/angularjs/1.3.8/angular-touch.min.js',
            'http://orzzzl.github.io/StaticFileHost/create.js',
            'http://cdnjs.cloudflare.com/ajax/libs/angular-ui-bootstrap/0.12.1/ui-bootstrap-tpls.min.js',
            'http://maxcdn.bootstrapcdn.com/bootstrap/3.3.1/css/bootstrap.min.css',
            'http://fonts.googleapis.com/css?family=Shadows+Into+Light',
            'http://fonts.gstatic.com/s/shadowsintolight/v6/clhLqOv7MXn459PTh0gXYKkG_nMAIv3PPZbC2XDns-o.woff2',
            'http://maxcdn.bootstrapcdn.com/bootstrap/3.3.1/fonts/glyphicons-halflings-regular.woff',
            'http://maxcdn.bootstrapcdn.com/bootstrap/3.3.1/fonts/glyphicons-halflings-regular.ttf',
            'http://yoav-zibin.github.io/emulator/dist/turnBasedServices.2.min.js',
            'http://yoav-zibin.github.io/emulator/main.css',
            'dist/everything.min.js',
            'imgs/cards/0.png',
            'imgs/cards/1.png',
            'imgs/cards/2.png',
            'imgs/cards/3.png',
            'imgs/cards/4.png',
            'imgs/cards/5.png',
            'imgs/cards/6.png',
            'imgs/cards/7.png',
            'imgs/cards/8.png',
            'imgs/cards/9.png',
            'imgs/cards/10.png',
            'imgs/cards/11.png',
            'imgs/cards/12.png',
            'imgs/cards/13.png',
            'imgs/cards/14.png',
            'imgs/cards/15.png',
            'imgs/cards/16.png',
            'imgs/cards/17.png',
            'imgs/cards/18.png',
            'imgs/cards/19.png',
            'imgs/cards/20.png',
            'imgs/cards/21.png',
            'imgs/cards/22.png',
            'imgs/cards/23.png',
            'imgs/cards/24.png',
            'imgs/cards/25.png',
            'imgs/cards/26.png',
            'imgs/cards/27.png',
            'imgs/cards/28.png',
            'imgs/cards/29.png',
            'imgs/cards/30.png',
            'imgs/cards/31.png',
            'imgs/cards/32.png',
            'imgs/cards/33.png',
            'imgs/cards/34.png',
            'imgs/cards/35.png',
            'imgs/cards/36.png',
            'imgs/cards/37.png',
            'imgs/cards/38.png',
            'imgs/cards/39.png',
            'imgs/cards/40.png',
            'imgs/cards/41.png',
            'imgs/cards/42.png',
            'imgs/cards/43.png',
            'imgs/cards/44.png',
            'imgs/cards/45.png',
            'imgs/cards/46.png',
            'imgs/cards/47.png',
            'imgs/cards/48.png',
            'imgs/cards/49.png',
            'imgs/cards/50.png',
            'imgs/cards/51.png',
            'imgs/cards/qb1fh.png',
            'imgs/cards/qb1fv.png',
            'imgs/slides/slide2.png',
            'imgs/slides/slide3.png',
            'imgs/slides/slide4.png',
            'imgs/board.jpg',
            'game.css'
          ],
          network: [
            'languages/zh.js',
            'languages/en.js',
            'dist/everything.min.js.map',
            'dist/everything.js'
          ],
          timestamp: true
        },
        dest: 'game.appcache',
        src: []
      }
    },
    'http-server': {
        'dev': {
            // the server root directory
            root: '.',
            port: 9000,
            host: "0.0.0.0",
            cache: 1,
            showDir : true,
            autoIndex: true,
            // server default file extension
            ext: "html",
            // run in parallel with other tasks
            runInBackground: true
        }
    },
    protractor: {
      options: {
        configFile: "protractor.conf.js", // Default config file
        keepAlive: true, // If false, the grunt process stops when the test fails.
        noColor: false, // If true, protractor will not use colors in its output.
        args: {
          // Arguments passed to the command
        }
      },
      all: {}
    },
  });

  require('load-grunt-tasks')(grunt);

  // Default task(s).
  grunt.registerTask('default', [
     // 'jshint', 'karma',
      'concat', 'uglify',
      'processhtml', 'manifest',
      //'http-server', 'protractor'
  ]);

};
