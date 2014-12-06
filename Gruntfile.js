module.exports = function(grunt) {

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
            }
        },

        uglify: {
            options: {
                banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
            },
            dynamic_mappings: {
                files: [
                    {
                        expand: true,     // Enable dynamic expansion.
                        cwd: 'js/',      // Src matches are relative to this path.
                        src: [
                            'background/**/*.js',
                            'classes/**/*.js',
                            'interface/**/*.js',
                            'utils/**/*.js'
                        ], // Actual pattern(s) to match.
                        dest: 'build/js/',   // Destination path prefix.
                        ext: '.min.js',   // Dest filepaths will have this extension.
                        extDot: 'first'   // Extensions in filenames begin after the first dot
                    }
                ]
            }
        },

        requirejs: {
            options: {
                removeCombined: false,
                optimize: 'none'
            },
            background: {
                options: {
                    baseUrl: "PPMClient/app/background/",
                    paths: {},
                    mainConfigFile: 'PPMClient/app/background/background.bootstrap.js',
                    name: "background.bootstrap",
                    out: "build/background.min.js",
                    optimize: 'none'
                }
            },
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
        }
    });

    // Load the plugin that provides the "uglify" task.
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-requirejs');




    grunt.registerTask("setup-project", "Setup Project files and folders", function() {
        grunt.task.run('copy:project');
    });

    grunt.registerTask("build-project", "Build Project files", function() {
        grunt.task.run('requirejs:background');
        grunt.task.run('requirejs:popup');
    });






    /**
     * angular-ui-bootstrap
     */
    grunt.registerTask("prepare-angular-ui-bootstrap", function() {
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

    grunt.registerTask("build-angular-ui-bootstrap", function() {
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

    grunt.registerTask("setup-angular-ui-bootstrap", "setup Angular-ui-bootstrap", function() {
        grunt.task.run('prepare-angular-ui-bootstrap');
        grunt.task.run('build-angular-ui-bootstrap');
    });
};