'use strict';
var util = require('util');
var path = require('path');
var yeoman = require('yeoman-generator');
var yosay = require('yosay');
var chalk = require('chalk');
var exec = require('child_process').exec;
var fse = require('fs-extra');

var ThemosisGenerator = yeoman.generators.Base.extend({
    init: function () {
        this.pkg = require('../package.json');

        this.on('end', function () {
            var self = this,
                assetsDir = 'htdocs/content/themes/' + self._.slugify(self.siteName) + '/app/assets/_toBuild';
            if (!this.options['skip-install']) {
                this.installDependencies({
                    callback: function () {
                        function performReplacement(regex, replacement, paths, include) {
                            replace({
                                regex: regex,
                                replacement: replacement,
                                paths: paths,
                                include: include,
                                recursive: true,
                                count: true
                            });
                        }

                        var projectDir = process.cwd(),
                            replace = require('replace');

                        fse.copy('htdocs/content/themes/naked-theme', 'htdocs/content/themes/' + self._.slugify(self.siteName), function(err) {
                            if (err) return console.error(err);

                            performReplacement(/('local'\s*=>\s')(.*)(')/g, '$1' + self.localHostName + '$3', [projectDir + '/config/environment.php']);
                            performReplacement(/('DB_NAME'\s*=>\s')(.*)(')/g, '$1' + self.localDbName + '$3', [projectDir + '/.env.local.php']);
                            performReplacement(/('DB_USER'\s*=>\s')(.*)(')/g, '$1' + self.localDbUsername + '$3', [projectDir + '/.env.local.php']);
                            performReplacement(/('DB_PASSWORD'\s*=>\s')(.*)(')/g, '$1' + self.localDbPassword + '$3', [projectDir + '/.env.local.php']);
                            performReplacement(/('WP_HOME'\s*=>\s')(.*)(')/g, '$1' + self.localUrl + '$3', [projectDir + '/.env.local.php']);
                            performReplacement(/('WP_SITEURL'\s*=>\s')(.*)(')/g, '$1' + self.localUrl + '/cms$3', [projectDir + '/.env.local.php']);

                            if (self.prodDetails) {
                                performReplacement(/('production'\s*=>\s')(.*)(')/g, '$1' + self.prodHostName + '$3', [projectDir + '/config/environment.php']);
                                performReplacement(/('DB_NAME'\s*=>\s')(.*)(')/g, '$1' + self.prodDbName + '$3', [projectDir + '/.env.production.php']);
                                performReplacement(/('DB_USER'\s*=>\s')(.*)(')/g, '$1' + self.prodDbUsername + '$3', [projectDir + '/.env.production.php']);
                                performReplacement(/('DB_PASSWORD'\s*=>\s')(.*)(')/g, '$1' + self.prodDbPassword + '$3', [projectDir + '/.env.production.php']);
                                performReplacement(/('WP_HOME'\s*=>\s')(.*)(')/g, '$1' + self.prodUrl + '$3', [projectDir + '/.env.production.php']);
                                performReplacement(/('WP_SITEURL'\s*=>\s')(.*)(')/g, '$1' + self.prodUrl + '/cms$3', [projectDir + '/.env.production.php']);
                            }

                            fse.move(projectDir + '/temp/sass', projectDir + '/' + assetsDir + '/sass', function(err) {
                                if (err) return console.error(err);

                                fse.move(projectDir + '/temp/_sprite-mixin.scss', projectDir + '/' + assetsDir + '/sass/templates/_sprite-mixin.scss', {clobber: true}, function(err) {
                                    if (err) return console.error(err);

                                    fse.removeSync('temp', function(err) {
                                        if (err) return console.error(err);
                                    });
                                });

                                fse.mkdirs(projectDir + '/' + assetsDir + '/images/sprites', function(err){
                                    if (err) return console.error(err);
                                });

                                fse.removeSync(projectDir + '/' + assetsDir + '/sass/components', function(err) {
                                    if (err) return console.error(err);
                                });

                                fse.removeSync(projectDir + '/' + assetsDir + '/sass/vendor', function(err) {
                                    if (err) return console.error(err);
                                });

                                fse.removeSync(projectDir + '/' + assetsDir + '/sass/live.scss', function(err) {
                                    if (err) return console.error(err);
                                });

                                fse.outputFile(projectDir + '/' + assetsDir + '/sass/lib/__lib.scss', '@import "normalize/_normalize.scss";\n@import "susy/sass/_susy.scss";\n@import "bourbon/dist/_bourbon.scss";', function(err) {
                                    if(err) console.log(err);
                                });

                                fse.outputFile(projectDir + '/' + assetsDir + '/sass/style.scss', '/*\nTheme Name: ' + self.siteName + '\nDescription: A theme for ' + self.siteName + '\nAuthor: ' + self.siteName + ' development team\nVersion: 0.0\n*/\n\n@import "base/__base";\n@import "lib/__lib";\n@import "project/__project";\n@import "specifics/__specifics";', function(err) {
                                        if(err) console.log(err);
                                });

                                exec('git clone git://github.com/themosis/framework.git htdocs/content/plugins/themosis-framework');

                                exec('git clone https://github.com/necolas/normalize.css.git ' + projectDir + '/' + assetsDir + '/sass/lib/normalize', function() {
                                    fse.move(projectDir + '/' + assetsDir + '/sass/lib/normalize/normalize.css', projectDir + '/' + assetsDir + '/sass/lib/normalize/_normalize.scss', {clobber: true}, function(err) {
                                        if (err) return console.log(err);
                                    });
                                });
                                exec('git clone git://github.com/ericam/susy.git ' + projectDir + '/' + assetsDir + '/sass/lib/susy');
                                exec('git clone https://github.com/thoughtbot/bourbon.git ' + projectDir + '/' + assetsDir + '/sass/lib/bourbon');
                            });

                            fse.remove('htdocs/content/themes/naked-theme', function(err) {
                                if (err) return console.error(err);
                            });
                        });

                    }
                });
            }
        });
    },

    askFor: function () {
        var done = this.async(),
            self = this;

        // Have Yeoman greet the user.
        this.log(yosay('Welcome to the marvelous Themosis generator!'));

        var prompts = [{
            name: 'siteName',
            message: 'What is the name of this site?'
        }, {
            type: 'input',
            name: 'localDbName',
            message: 'What is the local database name?',
            default: function (props) {
                return self._.slugify(props.siteName);
            }
        }, {
            type: 'input',
            name: 'localDbUsername',
            message: 'What is the local database username?',
            default: 'root'
        }, {
            type: 'input',
            name: 'localDbPassword',
            message: 'What is the local database password?',
            default: 'root'
        }, {
            type: 'input',
            name: 'localUrl',
            message: 'What is the local URL?',
            default: function (props) {
                return 'http://dev.' + self._.slugify(props.siteName);
            }
        }, {
            type: 'input',
            name: 'localHostName',
            message: 'What is the local hostname?',
            default: 'hel-tofimbp13.local'
        }, {
            type: 'confirm',
            name: 'prodDetails',
            message: 'Do you know the details for the production environment yet?',
            default: false
        }, {
            type: 'input',
            name: 'prodDbName',
            message: 'What is the production database name?',
            default: function (props) {
                return self._.slugify(props.siteName);
            },
            when: function (props) {
                return props.prodDetails;
            }
        }, {
            type: 'input',
            name: 'prodDbUsername',
            message: 'What is the production database username?',
            default: 'root',
            when: function (props) {
                return props.prodDetails;
            }
        }, {
            type: 'input',
            name: 'prodDbPassword',
            message: 'What is the production database password?',
            default: 'root',
            when: function (props) {
                return props.prodDetails;
            }
        }, {
            type: 'input',
            name: 'prodUrl',
            message: 'What is the production URL?',
            default: function (props) {
                return 'http://' + self._.slugify(props.siteName) + '.com';
            },
            when: function (props) {
                return props.prodDetails;
            }
        }, {
            type: 'input',
            name: 'prodHostName',
            message: 'What is the production hostname?',
            default: 'localhost',
            when: function (props) {
                return props.prodDetails;
            }
        }];

        this.prompt(prompts, function (props) {
            this.siteName = props.siteName;
            this.localDbName = props.localDbName;
            this.localDbUsername = props.localDbUsername;
            this.localDbPassword = props.localDbPassword;
            this.localUrl = props.localUrl;
            this.localHostName = props.localHostName;
            this.prodDetails = props.prodDetails;
            this.prodDbName = props.prodDbName;
            this.prodDbUsername = props.prodDbUsername;
            this.prodDbPassword = props.prodDbPassword;
            this.prodUrl = props.prodUrl;
            this.prodHostName = props.prodHostName;

            this.wordpress = false;
            this.verticalRhythm = false;
            this.ie8 = 'maybe';

            done();
        }.bind(this));
    },

    app: function () {
        this.copy('_package.json', 'package.json');
        this.copy('_bower.json', 'bower.json');
        this.copy('gulpfile.js', 'gulpfile.js');
        this.directory('/Users/fisu/Sites/generator-gulp-jack/app/templates/sass', 'temp/sass');
        this.copy('/Users/fisu/Sites/generator-gulp-jack/app/templates/_sprite-mixin.scss', 'temp/_sprite-mixin.scss');

        this.directory('/Users/fisu/Sites/naked', './');
    },

    projectfiles: function () {
        this.copy('editorconfig', '.editorconfig');
        this.copy('jshintrc', '.jshintrc');
    }
});

module.exports = ThemosisGenerator;