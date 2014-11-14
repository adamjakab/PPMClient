module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        uglify: {
            options: {
                banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
            },
            //build: {
            //    src: 'js/background/ChromeStorage.js',
            //    dest: 'build/js/background/ChromeStorage.js'
            //},
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

        copy: {
            main: {
                files: [
                    {expand: true, cwd: 'html', src: ['**/*.html'], dest: 'build/html'}
                ]
            }
        }

    });

    // Load the plugin that provides the "uglify" task.
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-copy');

    // Default task(s).
    grunt.registerTask('default', ['copy', 'uglify']);

};