'use strict';
var util = require('util');
var path = require('path');
var yeoman = require('yeoman-generator');
var yosay = require('yosay');
var chalk = require('chalk');
var exec = require('child_process').exec;
var fs = require('fs');
var ncp = require('ncp').ncp;
var assetsDir;

var ThemosisGenerator = yeoman.generators.Base.extend({
    init: function () {
        //this.pkg = require('../package.json');

        this.on('end', function () {
            var self = this;
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


            /*performReplacement(/('local'\s*=>\s')(.*)(')/g, '$1' + self.localHostName + '$3', [projectDir + '/config/environment.php']);
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
            }*/

            /*fs.rename(projectDir + '/htdocs/content/themes/naked-theme', projectDir + '/htdocs/content/themes/' + self._.slugify(self.siteName), function (err) {
                if (err) throw err;
            });*/

/*            if (!this.options['skip-install']) {
                this.installDependencies({
                    callback: function () {

                    }
                });
            }*/
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
        var self = this,
            projectDir = process.cwd(),
            nakedDir = process.chdir('/Users/fisu/Sites/naked');
        //assetsDir = 'htdocs/content/themes/' + this._.slugify(this.siteName) + '/app/assets';

        //this.directory('/Users/fisu/Sites/naked', './');

        ncp('/Users/fisu/Sites/naked', './', function (err) {
            if (err) throw err;
            /*fs.rename(projectDir + '/htdocs/content/themes/naked-theme', projectDir + '/htdocs/content/themes/' + self._.slugify(self.siteName), function (err) {
                if (err) throw err;
                console.log('FILES COPIED');
            });*/
        });

        //fs.rename('htdocs/content/themes/naked-theme', 'htdocs/content/themes/' + self._.slugify(self.siteName), function() {

        /*fs.rename('htdocs/content/themes/naked-theme', 'htdocs/content/themes/' + self._.slugify(self.siteName), function() {

        }), function (err) {
            if (err) throw err;
        });*/

            //self.directory('/Users/fisu/Sites/generator-gulp-jack/app/templates/sass/base', assetsDir + '/sass/base');
            //self.directory('/Users/fisu/Sites/generator-gulp-jack/app/templates/sass/project', assetsDir + '/sass/project');
            //self.directory('/Users/fisu/Sites/generator-gulp-jack/app/templates/sass/specifics', assetsDir + '/sass/specifics');
//
            //self.copy('_package.json', 'package.json');
            //self.copy('_bower.json', 'bower.json');
//
            //exec('git clone git://github.com/themosis/framework.git htdocs/content/plugins/themosis-framework');
//
            //exec('git clone https://github.com/necolas/normalize.css.git ' + assetsDir + '/sass/lib/normalize');
            //exec('git clone git://github.com/ericam/susy.git ' + assetsDir + '/sass/lib/susy');
            //exec('git clone https://github.com/thoughtbot/bourbon.git ' + assetsDir + '/sass/lib/bourbon');

/*        fs.rename('htdocs/content/themes/naked-theme', 'htdocs/content/themes/' + this._.slugify(this.siteName), function (err) {
            if (err) throw err;
        });*/


    },

//    writeFilesSass: function () {
//        fs.writeFile(assetsDir + '/sass/lib/__lib.scss', '@import "normalize/_normalize.scss";\n@import "susy/_susy.scss";\n@import "bourbon/dist/_bourbon.scss";', function(err) {
//            if(err) console.log(err);
//        });
//
//        fs.writeFile(assetsDir + '/sass/style.scss', '/*\nTheme Name: ' + this.siteName + '\nDescription: A theme for ' + this.siteName + '\nAuthor: ' + this.siteName + ' development team\nVersion: 0.0\n*/\n\n@import "base/__base";\n@import "lib/__lib";\n@import "project/__project";\n@import "specifics/__specifics";', function(err) {
//                if(err) console.log(err);
//        });
//    },

    /*renameDirectories: function () {
        fs.rename('htdocs/content/themes/naked-theme', 'htdocs/content/themes/' + this._.slugify(this.siteName), function (err) {
            if (err) throw err;
        });
    },*/

    projectfiles: function () {
        this.copy('editorconfig', '.editorconfig');
        this.copy('jshintrc', '.jshintrc');
    }
});

module.exports = ThemosisGenerator;
