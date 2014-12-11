module.exports = function (grunt) {
    /* ----------------------------------------- MAIN TASKS --------------------------------------------------------- */
    // Default task(s).
    grunt.registerTask('default', [
        'setup-project'
    ]);

    //setup project ready for development
    grunt.registerTask("setup-project", "Setup Project files and folders", function () {
        grunt.task.run('angular-ui-bootstrap-build');
    });

    //build project in 'build/tmp' ready to be packed
    grunt.registerTask("build-project", "Build Project files", function () {
        grunt.task.run('clean:build_before');
        grunt.task.run('copy:build');
        grunt.task.run('requirejs:build_background');
        grunt.task.run('requirejs:build_popup');
        grunt.task.run('replace:build_background');
        grunt.task.run('replace:build_popup');
    });

    //build project from 'build/tmp' to Google Chrome installable crx package
    grunt.registerTask("pack-project", "Build Project files", function () {
        //
    });


    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        clean: {
            build_before: ['build'],
            build_after: ['build/tmp/xxx']
        },
        copy: {
            build: {
                files: [
                    {
                        expand: true,
                        flatten: false,
                        cwd: 'PPMClient',
                        src: ['**/*', '!**/node_modules/**'],
                        dest: 'build/tmp'
                    }
                ]
            }
        },
        requirejs: {
            options: {
                optimize: 'none'
            },
            build_background: {
                options: {
                    baseUrl: 'build/tmp/app/background/',
                    name: 'bootstrap',
                    mainConfigFile: 'build/tmp/app/background/requirejs.config.js',
                    paths: {
                        requireLib: '../..//vendor/bower/requirejs/require'
                    },
                    include: [
                        'requireLib'
                    ],
                    out: 'build/tmp/app/background.min.js',
                    optimize: 'uglify',
                    preserveLicenseComments: false,
                    inlineText: true
                }
            },
            build_popup: {
                options: {
                    baseUrl: 'build/tmp/app/popup/',
                    name: 'bootstrap',
                    mainConfigFile: 'build/tmp/app/popup/requirejs.config.js',
                    paths: {
                        requireLib: '../..//vendor/bower/requirejs/require'
                    },
                    include: [
                        'requireLib'
                    ],
                    out: 'build/tmp/app/popup.min.js',
                    /*optimize: 'uglify2',*/
                    preserveLicenseComments: false,
                    inlineText: true
                }
            }
        },
        replace: {
            build_background: {
                options: {
                    patterns: [
                        {
                            match: /<script.*data-main.*<\/script>/g,
                            replacement: '<script src="background.min.js"></script>'
                        }
                    ]
                },
                files: [
                    {
                        src: 'build/tmp/app/background.html',
                        dest: 'build/tmp/app/background.html'
                    }
                ]
            },
            build_popup: {
                options: {
                    patterns: [
                        {
                            match: /<script.*data-main.*<\/script>/g,
                            replacement: '<script src="popup.min.js"></script>'
                        }
                    ]
                },
                files: [
                    {
                        src: 'build/tmp/app/popup.html',
                        dest: 'build/tmp/app/popup.html'
                    }
                ]
            }
        }
    });

    /* ------------------------------------------- PLUGINS ---------------------------------------------------------- */
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-replace');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-requirejs');



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