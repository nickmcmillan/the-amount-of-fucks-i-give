'use strict';

module.exports = function (grunt) {
    // show elapsed time at the end
    require('time-grunt')(grunt);
    // load all grunt tasks
    require('load-grunt-tasks')(grunt);
    grunt.loadNpmTasks('assemble');
    // configurable paths
    var settingsConfig = {
        src: '.',
        dist: !!grunt.option('out') ? grunt.option('out') : '../dist',
        spriteFolder: 'sprites',
        retinaSpriteFolder: 'retinasprites',
        iisHostname: '' // the hostname of your IIS website e.g. mysite.local
    };
    grunt.initConfig({
        settings: settingsConfig,
        pkg: grunt.file.readJSON('package.json'),
        //fire up livereload and open site in browser
        browserSync: {
            templates: {
                bsFiles: {
                    src: '<%= settings.dist %>/**/*'
                },
                options: {
                    watchTask: true,
                    debugInfo: true,
                    host: '0.0.0.0',
                    server: {
                        baseDir: settingsConfig.dist
                    }
                }
            },
            iis: {
                bsFiles: {
                    src: '<%= settings.dist %>/**/*'
                },
                options: {
                    proxy: settingsConfig.iisHostname,
                    watchTask: true,
                    debugInfo: true,
                    host: '0.0.0.0'
                }
            }
        },
        // watch files for changes
        watch: {
            sass: {
                files: '<%= settings.src %>/css/**/*.scss',
                tasks: ['styles']
            },
            scripts: {
                files: ['<%= settings.src %>/js/**/*.js'],
                tasks: ['scripts'],
                options: {
                    spawn: false
                }
            },
            sprites: {
                files: [
                    '<%= settings.src %>/img/<%= settings.spriteFolder %>/*.png'
                ],
                tasks: ['images', 'styles'],
                options: {
                    spawn: false
                }
            },
            images: {
                files: [
                    '<%= settings.src %>/img/**/*.{png,jpg,gif}',
                    '!<%= settings.src %>/img/<%= settings.spriteFolder %>/*.png'
                ],
                tasks: ['copy:images'],
                options: {
                    spawn: false
                }
            },
            html: {
                files: [
                    '<%= settings.src %>/templates/**/*'
                ],
                tasks: ['html'],
                options: {
                    spawn: false
                }
            },
            livereload: {
                options: {
                    livereload: true
                },
                files: [
                    '<%= settings.src %>/js/**/*.js',
                    '<%= settings.src %>/css/**/*.scss',
                    '<%= settings.src %>/img/**/*.{png,jpg,gif}',
                    '<%= settings.src %>/templates/**/*',
                ]
            }
        },
        // Sass options
        sass: {
            dist: {
                options: {
					outputStyle: 'expanded',
					sourceComments: 'normal'
                },
                files: {
                    // 'destination': 'source'
                    '<%= settings.dist %>/css/style.css': '<%= settings.src %>/css/style.scss'
                }
            }
        },
        // Post process cross-browser prefixes for css rules
        autoprefixer: {
            options: {
                browsers: ['last 2 version', 'ie 8', 'ie 9']
            },
            // prefix the specified file
            single_file: {
                expand: true,
                flatten: true,
                src: '<%= settings.dist %>/css/style.css',
                dest: '<%= settings.dist %>/css/'
            }
        },
        //minify css
        cssmin: {
            options: {
                banner: '/*! <%= pkg.name %> stylesheet <%= grunt.template.today("yyyy-mm-dd") %> */',
                report: 'min'
            },
            minify: {
                expand: true,
                cwd: '<%= settings.dist %>/css',
                src: ['*.css', '!*.min.css'],
                dest: '<%= settings.dist %>/css/',
                ext: '.min.css'
            }
        },
        // optimise images
        imagemin: {
            dynamic: {
                options: {
                    optimizationLevel: 7,
                    progressive: true
                },
                files: [{
                    expand: true,
                    cwd: '<%= settings.src %>/img/',
                    src: [
                        '**/*.{png,jpg,gif}',
                        '!<%= settings.spriteFolder %>/*.png'
                    ],
                    dest: '<%= settings.dist %>/img/'
                }]
            }
        },
        // create spritesheets
        sprite: {
            dist: {
                src: ['<%= settings.src %>/img/<%= settings.spriteFolder %>/*.png'],
                destImg: '<%= settings.dist %>/img/<%= settings.spriteFolder %>.png',
                destCSS: '<%= settings.src %>/css/_sprites.scss',
                cssFormat: 'scss',
                imgPath: '../img/<%= settings.spriteFolder %>.png'
            },
            retina: {
                src: ['<%= settings.src %>/img/<%= settings.retinaSpriteFolder %>/*.png'],
                destImg: '<%= settings.dist %>/img/<%= settings.retinaSpriteFolder %>.png',
                destCSS: '<%= settings.src %>/css/_retinasprites.scss',
                cssFormat: 'scss',
                imgPath: '../img/<%= settings.retinaSpriteFolder %>.png'
            }
        },
        // Lint JS files for errors
        jshint: {
            options: {
                jshintrc: '.jshintrc'
            },
            main: [
                '<%= settings.src %>/js/src/*.js'
            ]
        },
        rig: {
            core: {
                files: {
                    '<%= settings.dist %>/js/main.js': ['<%= settings.src %>/js/main.js']
                }
            },
            src: {
                files: {
                    '<%= settings.dist %>/js/src.js': ['<%= settings.src %>/js/src.js']
                }
            },
            plugins: {
                files: {
                    '<%= settings.dist %>/js/plugins.js': ['<%= settings.src %>/js/plugins.js']
                }
            }
        },
        // concat plugins and devscripts into one almighty!!!
        concat: {
            options: {
                separator: ';'
            },
            dist: {
                src: [
                    '<%= settings.dist %>/js/plugins.js',
                    '<%= settings.dist %>/js/src.js',
                    '<%= settings.dist %>/js/main.js'
                ],
                dest: '<%= settings.dist %>/js/scripts.js'
            }
        },
        // minify js
        uglify: {
            dist: {
                options: {
                    banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
                },
                files: {
                    '<%= settings.dist %>/js/scripts.min.js': '<%= settings.dist %>/js/scripts.js'
                }
            }
        },
        assemble: {
            options: {
                production: grunt.cli.tasks.length === 0 || grunt.cli.tasks[0] === 'build',
                partials: ['<%= settings.src %>/templates/partials/*.hbs'],
                layout: ['<%= settings.src %>/templates/layouts/layout.hbs'],
                data: ['<%= settings.src %>/templates/data/*.json'],
                helpers: ['<%= settings.src %>/templates/helpers/*.js']
            },
            pages: {
                src: [
                    '<%= settings.src %>/templates/pages/**/*.hbs'
                ],
                dest: '<%= settings.dist %>'
            }
        },
        // cleanup production assets
        clean: {
            options: {
                force: true
            },
            all: {
                src: ['<%= settings.dist %>/*','<%= settings.src %>/css/_sprites.scss','<%= settings.src %>/css/_retinasprites.scss']
            },
            styles: {
                src: ['<%= settings.dist %>/css/*','<%= settings.src %>/css/_sprites.scss','<%= settings.src %>/css/_retinasprites.scss']
            },
            scripts: {
                src: ['<%= settings.dist %>/js/*']
            },
            images: {
                src: ['<%= settings.dist %>/img/*']
            },
            tempHtml: {
                src: ['<%= settings.dist %>/templates']
            },
            html: {
                src: ['<%= settings.dist %>/*.html']
            }
        },
        // Copy libs files and fonts to production location - main script and stylesheets as well as optimised images are moved during watch and imagemin tasks respectively
        copy: {
            fonts: {
                files: [{
                    expand: true,
                    dot: true,
                    cwd: '<%= settings.src %>/fonts',
                    dest: '<%= settings.dist %>/css/fonts/',
                    src: [
                        '**/*' // copy all font types within font directory
                    ]
                }]
            },
            images: {
                files: [{
                    expand: true,
                    dot: true,
                    cwd: '<%= settings.src %>/img',
                    dest: '<%= settings.dist %>/img',
                    src: [
                        '{,*/}*.*', // copy all image types within img directory
                        '!<%= settings.spriteFolder %>/*.png',
                        '!<%= settings.retinaSpriteFolder %>/*.png'
                    ]
                }]
            },
            scriptLibs: {
                files: [{
                    expand: true,
                    dot: true,
                    cwd: '<%= settings.src %>/js/libs',
                    dest: '<%= settings.dist %>/js/libs/',
                    src: '*.min.js' // ONLY copy minified lib files.
                }]
            },
            excanvas: {
                files: [{
                    expand: true,
                    dot: true,
                    cwd: '<%= settings.src %>/js/libs',
                    dest: '<%= settings.dist %>/js/libs/',
                    src: '*.js'
                }]
            },
            html: {
                files: [{
                    expand: true,
                    dot: true,
                    cwd: '<%= settings.dist %>/templates/pages',
                    dest: '<%= settings.dist %>',
                    src: '**/*.html'
                }]
            }
        },
        search: {
            noExtend: {
                files: {
                    src: ['<%= settings.src %>/css/**/*.scss']
                },
                options: {
                    searchString: /^\s+@extend\s+\S+;/g,
                    logFormat: 'console',
                    failOnMatch: false,
                    onComplete: function (matches) {
                        if (matches.numMatches > 0) {
                            grunt.log.error("You're using an @extend but libsass doesn't like them.");
                            grunt.log.error("Replace extends with mixins or switch to Ruby SASS.");
                            grunt.fail.fatal('@extend is not allowed', 1);
                        }
                    }
                }
            },
            evenSizedRetinaSprites: {
                files: {
                    src: ['<%= settings.src %>/css/_<%= settings.retinaSpriteFolder %>.scss']
                },
                options: {
                    searchString: /^(.(?!total-(width|height)))*-(?:width|height): \d*[13579]px;/g,
                    logFormat: 'console',
                    failOnMatch: false,
                    onComplete: function (matches) {
                        if (matches.numMatches > 0) {
                            grunt.log.error("One or more of your retina sprites doesn't have even dimensions. Make sure your retina sprite dimensions are exactly twice those of your regular sprites.");
                            grunt.fail.fatal('Retina sprites are odd dimensions', 1);
                        }
                    }
                }
            }
        },
        jasmine: {
            test: {
                src: [
                    '<%= settings.dist %>/js/plugins.js',
                    '<%= settings.dist %>/js/src.js'
                ],
                options: {
                    vendor: [
                        '<%= settings.dist %>/js/libs/jquery.min.js',
                        '<%= settings.src %>/test/lib/jasmine-jquery.js'
                    ],
                    specs: '<%= settings.src %>/test/spec/*Spec.js'
                }
            }
        }
    });
    grunt.registerTask('serve', function () {
        grunt.task.run([
            'devbuild',
            'browserSync:templates',
            'watch'
        ]);
    });
    grunt.registerTask('server', function () {
        grunt.log.warn('The `server` task has been deprecated. Next time, use `grunt serve` to start a server. Now running grunt serve...');
        grunt.task.run(['serve']);
    });

    // do a build but don't minify images cause it takes too long
    grunt.registerTask('devbuild', [
        'clean:all',
        'scripts',
        'images',
        'styles',
        'fonts',
        'html'
    ]);

    // do a production build
    grunt.registerTask('build', [
        // 'test',
        'devbuild',
        // minification and concatenation tasks
        'imagemin:dynamic',
        'cssmin',
        'concat',
        'uglify'
    ]);

    grunt.registerTask('serve-iis', ['devbuild', 'browserSync:iis', 'watch']);
    grunt.registerTask('scripts', ['copy:scriptLibs', 'copy:excanvas', 'rig']);
    grunt.registerTask('styles', ['search:noExtend', 'sass', 'autoprefixer']);
    grunt.registerTask('fonts', ['copy:fonts']);
    grunt.registerTask('images', ['sprite', 'search:evenSizedRetinaSprites', 'copy:images']);
    grunt.registerTask('html', ['assemble', 'copy:html', 'clean:tempHtml']);
    grunt.registerTask('test', ['clean:scripts', 'scripts', 'jasmine']);
    grunt.registerTask('default', ['build']);
};
