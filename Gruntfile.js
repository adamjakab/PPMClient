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
                        src: 'src/bower/angular-ui-bootstrap/dist/ui-bootstrap-tpls-0.12.0.js',
                        dest: 'PPMClient/vendor/js/ui-bootstrap-tpls.js'
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
                            'underscore/underscore.js'
                        ],
                        dest: 'PPMClient/vendor/js/'
                    },
                    {
                        expand: true,
                        flatten: true,
                        cwd: 'src/vendor',
                        src: [
                            'mustard/*',
                            'aesctr.js',
                            'md5.js'
                        ],
                        dest: 'PPMClient/vendor/js/'
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
                        dest: 'PPMClient/vendor/css/'
                    },
                    {
                        expand: true,
                        flatten: true,
                        cwd: 'src/bower',
                        src: [
                            'bootstrap-css-only/fonts/*'
                        ],
                        dest: 'PPMClient/vendor/fonts/'
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
        }
    });

    // Load the plugin that provides the "uglify" task.
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-copy');




    grunt.registerTask("setup-project", "Setup Project files and folders", function() {
        grunt.task.run('copy:project');
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