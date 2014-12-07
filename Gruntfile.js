module.exports = function (grunt) {

    // Default task(s).
    grunt.registerTask('default', [
        'setup-angular-ui-bootstrap',
        'setup-project'
    ]);

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        copy: {
            project: {
                files: [
                    {
                        src: 'src/bower/angular-ui-bootstrap/dist/ui-bootstrap-0.12.0.js',
                        dest: 'PPMClient/app/vendor/js/ui-bootstrap.js'
                    },
                    {
                        expand: true,
                        flatten: true,
                        cwd: 'src/bower',
                        src: [
                            'angular/angular.js',
                            'angular-ui-router/release/angular-ui-router.js',
                            'bluebird/js/browser/bluebird.js',
                            'prototypejs/dist/prototype.js',
                            'requirejs/require.js',
                            'requirejs-domready/domReady.js',
                            'underscore/underscore.js'
                        ],
                        dest: 'PPMClient/app/vendor/js/'
                    },
                    {
                        expand: true,
                        flatten: true,
                        cwd: 'src/vendor',
                        src: [
                            '**/*.js'
                        ],
                        dest: 'PPMClient/app/vendor/js/'
                    },
                    {
                        expand: true,
                        flatten: true,
                        cwd: 'src/bower',
                        src: [
                            'angular/angular-csp.css',
                            'bootstrap-css-only/css/bootstrap.css',
                            'bootstrap-css-only/css/bootstrap.css.map',
                            'bootstrap-css-only/css/bootstrap-theme.css',
                            'bootstrap-css-only/css/bootstrap-theme.css.map'
                        ],
                        dest: 'PPMClient/app/vendor/css/'
                    },
                    {
                        expand: true,
                        flatten: true,
                        cwd: 'src/bower',
                        src: [
                            'bootstrap-css-only/fonts/*'
                        ],
                        dest: 'PPMClient/app/vendor/fonts/'
                    }
                ]
            },
            build: {
                files: [
                    {
                        expand: true,
                        cwd: './',
                        src: 'PPMClient/**',
                        dest: 'build'
                    }
                ]
            }
        },

        requirejs: {
            options: {
                removeCombined: false,
                optimize: 'none'
            },
            /*
            prepaire: {
                options: {
                    baseUrl: 'PPMClient',
                    dir: "build/PPMClient",
                    optimize : 'uglify2',
                    inlineText: true,
                    preserveLicenseComments: false
                }
            },
            build_background: {
                options: {
                    baseUrl: 'build/PPMClient/app/background/',
                    name: 'background.bootstrap',
                    mainConfigFile: 'build/PPMClient/app/background/background.bootstrap.js',
                    paths: {
                        requireLib: '../vendor/js/require'
                    },
                    include: [
                        'requireLib'
                    ],
                    out: 'build/PPMClient/app/background.js',
                    optimize: 'uglify',
                    preserveLicenseComments: false,
                    inlineText: true
                }
            },*/
            build_popup: {
                options: {
                    baseUrl: 'PPMClient/app/popup/',
                    name: 'bootstrap',
                    mainConfigFile: 'PPMClient/app/popup/requirejs.config.js',
                    paths: {
                        requireLib: '../vendor/js/require'
                    },
                    include: [
                        'requireLib'
                    ],
                    out: 'build/popup.js',
                    optimize: 'none'
                    /*preserveLicenseComments: false,
                    inlineText: true*/
                }
            }

            /*
             popup: {
             options: {
             baseUrl: "PPMClient/app/popup/",
             paths: {
             requireLib: '../vendor/js/require'
             },
             include: 'requireLib',
             mainConfigFile: 'PPMClient/app/popup/requirejs.config.js',
             name: "bootstrap",
             out: "build/popup.min.js",
             optimize: 'none'
             }
             }
             */
        }
    });

    // Load the plugin that provides the "uglify" task.
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-requirejs');


    grunt.registerTask("setup-project", "Setup Project files and folders", function () {
        grunt.task.run('copy:project');
    });

    grunt.registerTask("build-project", "Build Project files", function () {
        grunt.task.run('requirejs:prepaire');
        grunt.task.run('requirejs:build_background');
        grunt.task.run('requirejs:build_popup');
    });


    /**
     * angular-ui-bootstrap
     */
    grunt.registerTask("prepare-angular-ui-bootstrap", function () {
        var done = this.async();
        grunt.util.spawn({
            grunt: false,
            cmd: 'npm',
            args: ['install'],
            opts: {
                cwd: 'src/bower/angular-ui-bootstrap'
            }
        }, function (err, result, code) {
            console.log(result.stdout);
            done();
        });
    });

    grunt.registerTask("build-angular-ui-bootstrap", function () {
        var done = this.async();
        grunt.util.spawn({
            grunt: true,
            args: ['after-test'],
            opts: {
                cwd: 'src/bower/angular-ui-bootstrap'
            }
        }, function (err, result, code) {
            console.log(result.stdout);
            done();
        });
    });

    grunt.registerTask("setup-angular-ui-bootstrap", "setup Angular-ui-bootstrap", function () {
        grunt.task.run('prepare-angular-ui-bootstrap');
        grunt.task.run('build-angular-ui-bootstrap');
    });
};