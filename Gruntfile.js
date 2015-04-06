var properties = require('./src/js/game/properties.js');

module.exports = function (grunt) {

    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-browserify');
    grunt.loadNpmTasks('grunt-cache-bust');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-compress');
    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-connect-socket.io');
    grunt.loadNpmTasks('grunt-express-server');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-jade');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-stylus');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-open');
    grunt.loadNpmTasks('grunt-pngmin');
    grunt.loadNpmTasks('grunt-jsdoc');

    var productionBuild = !!(grunt.cli.tasks.length && grunt.cli.tasks[0] === 'build');

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        project: {
            src: 'src/js',
            js: '<%= project.src %>/game/{,*/}*.js',
            dest: 'build/js',
            bundle: 'build/js/app.min.js',
            port: properties.port,
            sources: ['Gruntfile.js'],
            banner: '/*!\n' +
                ' * <%= pkg.title %>\n' +
                ' * <%= pkg.description %>\n' +
                ' * <%= pkg.url %>\n' +
                ' * @author <%= pkg.author %>\n' +
                ' * @version <%= pkg.version %>\n' +
                ' * Copyright <%= pkg.author %>. <%= pkg.license %> licensed.\n' +
                ' * Made using Phaser Blank <https://github.com/lukewilde/phaser-blank/>\n' +
                ' */\n'
        },

        connect: {
            dev: {
                options: {
                    port: '<%= project.port %>',
                    base: './build'
                }
            },
            server: {
                options: {
                    port: 3000,
                    base: './build',
                    socketio: true,
                    keepalive: true
                }
            }
        },
        express: {
            options: {
                // Setting to `false` will effectively just run `node path/to/server.js`
                background: false,
                // Called when the spawned server throws errors
                fallback: function () {},
                // Override node env's PORT
                port: 3000,
            },
            dev: {
                options: {
                    script: './app.js'
                }
            },
            prod: {
                options: {
                    script: 'path/to/prod/app.js',
                    node_env: 'production'
                }
            }
        },
        jshint: {
            options: {
                jshintrc: '.jshintrc'
            }
        },
        watch: {
            options: {
                //livereload: productionBuild ? false : properties.liveReloadPort
                livereload: true
            },
            express: {
                files: ['**/*.js'],
                tasks: ['express:dev'],
                options: {
                    spawn: false // for grunt-contrib-watch v0.5.0+, "nospawn: true" for lower versions. Without this option specified express won't be reloaded
                }
            },
            gamesrc: {
                files: 'src/js/game/**/*.js',
                tasks: ['concat', 'uglify']
            },
            jslib: {
                files: '<%= project.dest %>/**/*.js',
                tasks: []
            },
            jade: {
                files: 'src/templates/*.jade',
                tasks: ['jade']
            },
            stylus: {
                files: 'src/style/*.styl',
                tasks: ['stylus']
            },
            images: {
                files: 'src/images/**/*',
                tasks: ['copy:images']
            },
            audio: {
                files: 'src/audio/**/*',
                tasks: ['copy:audio']
            }
        },

        browserify: {
            app: {
                src: ['<%= project.src %>/game/app.js'],
                dest: '<%= project.bundle %>',
                options: {
                    transform: ['browserify-shim'],
                    watch: true
                        //debug: !productionBuild
                }
            }
        },

        open: {
            server: {
                path: 'http://localhost:<%= project.port %>'
            }
        },

        cacheBust: {
            options: {
                encoding: 'utf8',
                algorithm: 'md5',
                length: 16,
                rename: true,
                jsonOutput: false,
                jsonOutputFilename: 'cachebuster.json'
            },
            assets: {
                files: [
                    {
                        src: [
                        'build/index.html',
                        '<%= project.bundle %>'
                        ]
                    }
                ]
            }
        },

        jade: {
            compile: {
                options: {
                    pretty: true,
                    data: {
                        properties: properties,
                        productionBuild: productionBuild
                    }
                },
                files: {
                    //'public/index.html': ['src/templates/index.jade'],
                    'build/index.html': ['src/templates/index.jade']
                }
            }
        },

        stylus: {
            compile: {
                files: {
                    'build/style/index.css': ['src/style/index.styl']
                },
                options: {
                    sourcemaps: !productionBuild
                }
            }
        },

        clean: ['./build/'],

        pngmin: {
            options: {
                ext: '.png',
                force: true
            },
            compile: {
                files: [
                    {
                        src: 'src/images/*.png',
                        dest: 'src/images/'
}
]
            }
        },

        copy: {
            images: {
                files: [
                    {
                        expand: true,
                        cwd: 'src/images/',
                        src: ['**'],
                        dest: 'build/images/'
                    }
                ]
            },
            audio: {
                files: [
                    {
                        expand: true,
                        cwd: 'src/audio/',
                        src: ['**'],
                        dest: 'build/audio/'
                    }
                ]
            },
            jslib: {
                files: [
                    {
                        expand: true,
                        cwd: 'src/js/lib',
                        src: ['**'],
                        dest: 'build/js/lib'
                    }
                ]
            },
            socketio: {
                files: [
                    {
                        expand: true,
                        cwd: 'node_modules/socket.io-client/',
                        src: ['socket.io.js'],
                        dest: 'src/js/lib/'
                    }
                ]
            }
        },
        concat: {
            jspublic: {
                src: ['build/js/app.min.js', 'src/js/lib/socket.io.js', 'src/js/game/client.js'],
                dest: 'public/javascripts/game.min.js'
            }
        },
        uglify: {
            options: {
                banner: '<%= project.banner %>',
                preserveComments: false,
                beautify: true,
                mangle: false
            },
            dist: {
                files: {
                    '<%= project.bundle %>': '<%= project.bundle %>'
                }
            }
        },
        jsdoc: {
            dist: {
                src: ['src/js/game/app.js'],
                jsdoc: './node_modules/.bin/jsdoc',
                options: {
                    destination: 'doc',
                    configure: './node_modules/jsdoc/conf.json',
                    template: './node_modules/ink-docstrap/template'
                }
            }
        },
        compress: {
            options: {
                archive: '<%= pkg.name %>.zip'
            },
            zip: {
                files: [{
                    expand: true,
                    cwd: 'build/',
                    src: ['**/*'],
                    dest: '<%= pkg.name %>/'
}]
            },
            cocoon: {
                files: [{
                    expand: true,
                    cwd: 'build/',
                    src: ['**/*']
}]
            }
        }
    });

    grunt.registerTask('default', [
        'clean',
        'browserify',
        'jade',
        'stylus',
        'concat',
        'uglify',
        //'replace', http://mandarin.no/article/javascript-game-development-with-nodejs-grunt-and-texture-packer/
        'copy',
        'cacheBust',
        'connect:dev',
        'express:dev',
        'open',
        'watch',
    ]);

    grunt.registerTask('build', [
        'jshint',
        'clean',
        'browserify',
        'jade',
        'stylus',
        'copy',
        'uglify',
        'concat',
        'cacheBust',
        'connect:dev',
        'express:dev',
        'open',
        'watch'
    ]);

    grunt.registerTask('docs', ['jsdoc']);
    grunt.registerTask('optimise', ['pngmin', 'copy:images']);
    grunt.registerTask('cocoon', ['compress:cocoon']);
    grunt.registerTask('zip', ['compress:zip']);
};