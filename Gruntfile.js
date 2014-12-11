module.exports = function (grunt) {

    // Default task(s).
    grunt.registerTask('default', [
        'angular-ui-bootstrap-build',
        'setup-project'
    ]);

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

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
        }
    });

    /* ------------------------------------------- PLUGINS ---------------------------------------------------------- */
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-requirejs');

    /* ----------------------------------------- MAIN TASKS --------------------------------------------------------- */
    grunt.registerTask("setup-project", "Setup Project files and folders", function () {
        //what to do
    });

    grunt.registerTask("build-project", "Build Project files", function () {
        grunt.task.run('requirejs:prepaire');
        grunt.task.run('requirejs:build_background');
        grunt.task.run('requirejs:build_popup');
    });

    /* ----------------------------------------- SUB TASKS ---------------------------------------------------------- */
    /**
     * angular-ui-bootstrap
     */
    grunt.registerTask("angular-ui-bootstrap-install-dependencies", function () {
        var done = this.async();
        grunt.util.spawn({
            grunt: false,
            cmd: 'npm',
            args: ['install'],
            opts: {
                cwd: 'PPMClient/vendor/bower/angular-ui-bootstrap'
            }
        }, function (err, result, code) {
            console.log(result.stdout);
            done();
        });
    });

    grunt.registerTask("angular-ui-bootstrap-build-dist", function () {
        var done = this.async();
        grunt.util.spawn({
            grunt: true,
            args: ['after-test'],
            opts: {
                cwd: 'PPMClient/vendor/bower/angular-ui-bootstrap'
            }
        }, function (err, result, code) {
            console.log(result.stdout);
            done();
        });
    });

    grunt.registerTask("angular-ui-bootstrap-build", "build Angular-ui-bootstrap", function () {
        grunt.task.run('angular-ui-bootstrap-install-dependencies');
        grunt.task.run('angular-ui-bootstrap-build-dist');
    });
};