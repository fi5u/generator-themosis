'use strict';
var util = require('util');
var path = require('path');
var yeoman = require('yeoman-generator');
var yosay = require('yosay');
var chalk = require('chalk');

var appDir = 'app';


var ThemosisGenerator = yeoman.generators.Base.extend({
    init: function () {
        this.pkg = require('../package.json');

        this.on('end', function () {
            if (!this.options['skip-install']) {
                this.installDependencies();
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
        }];

        this.prompt(prompts, function (props) {
            this.siteName = props.siteName;
            this.localDbName = props.localDbName;
            this.localDbUsername = props.localDbUsername;
            this.localDbPassword = props.localDbPassword;
            this.localUrl = props.localUrl;
            this.localHostName = props.localHostName;

            done();
        }.bind(this));
    },

    app: function () {
        this.directory('/Users/fisu/Sites/naked', './');

        this.copy('_package.json', 'package.json');
        this.copy('_bower.json', 'bower.json');
    },

    projectfiles: function () {
        this.copy('editorconfig', '.editorconfig');
        this.copy('jshintrc', '.jshintrc');
    }
});

module.exports = ThemosisGenerator;
