module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        copy: {
            project: {
                files: [
                    {
                        expand: true,
                        flatten: true,
                        cwd: 'bower_components',
                        src: [
                            'angular/angular.js',
                            'angular-ui-bootstrap/dist/ui-bootstrap-tpls-0.12.0.js',
                            'bluebird/js/browser/bluebird.js',
                            'prototypejs/dist/prototype.js',
                            'requirejs/require.js',
                            'underscore/underscore.js'
                        ],
                        dest: 'app/vendor/js'
                    },
                    {
                        expand: true,
                        flatten: true,
                        cwd: 'bower_components',
                        src: [
                            'angular/angular-csp.css',
                            'bootstrap/dist/css/bootstrap.css',
                            'bootstrap/dist/css/bootstrap-theme.css'
                        ],
                        dest: 'app/vendor/css'
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



    // Default task(s).
    grunt.registerTask('default', ['setup-project']);
};