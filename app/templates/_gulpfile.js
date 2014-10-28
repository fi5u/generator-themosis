var gulp = require('gulp');
var sass = require('gulp-ruby-sass');
var sassdoc = require('gulp-sassdoc');
var minifyCSS = require('gulp-minify-css');
var imagemin = require('gulp-imagemin');
var svgSprite = require("gulp-svg-sprites");
var svg2png = require('gulp-svg2png');
var gulpif = require('gulp-if');
var filter = require('gulp-filter');
var plumber = require('gulp-plumber');
var gutil = require('gulp-util');
var newer = require('gulp-newer');
var http = require('http');
var lr = require('tiny-lr');
var lrserver = lr();
var refresh = require('gulp-livereload');
var embedlr = require('gulp-embedlr');
var ecstatic = require('ecstatic');
var insert = require('gulp-insert');
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');

var appRoute = '<% if (!jekyll) { %>app<% } else { %>.<% } %>',
    destRoute = '<% if (wpShared) { %>/Users/fisu/Sites/wordpress/wp-content/themes/<%= _.slugify(siteName) %><% } else { %>dist<% } %>',
    livereloadport = 35729,
    serverport = 5001;

var paths = {
    app: appRoute,
    html: appRoute + '/*{,*/*}.html',<% if (wordpress) { %>
    php: appRoute + '/*{,*/*}.php',<% } %>
    assets: appRoute + '<% if (!wordpress) { %>/assets<% } %>',
    sass: appRoute + '/<% if (!wordpress) { %>assets/<% } %>sass/*{,*/*}.scss',
    fonts: appRoute + '/<% if (!wordpress) { %>assets/<% } %>fonts/**',
    jsAll: appRoute + '/<% if (!wordpress) { %>assets/<% } %>js/*{,*/*}.js',
    js: appRoute + '/<% if (!wordpress) { %>assets/<% } %>js/*.js',
    jsLib: appRoute + '/<% if (!wordpress) { %>assets/<% } %>js/lib/*.js',
    jsVendor: appRoute + '/assets/js/vendor/*.js',
    img: appRoute + '/<% if (!wordpress) { %>assets/<% } %>images/**/*',
    sprites: appRoute + '/<% if (!wordpress) { %>assets/<% } %>images/sprites/*.svg',
    spritesDir: appRoute + '/<% if (!wordpress) { %>assets/<% } %>sass/project',
    dest: destRoute<% if (wordpress && !wpShared) { %> + '/wp-content/themes/<%= _.slugify(siteName) %>'<% } %>,
    destCSS: destRoute<% if (wordpress) { %><% if (!wpShared) { %> + '/wp-content/themes/<%= _.slugify(siteName) %>'<% } %><% } else { %> + '/assets/css'<% } %>,
    destFonts: destRoute + <% if (wordpress) { %><% if (!wpShared) { %>'/wp-content/themes/<%= _.slugify(siteName) %>/fonts'<% } else { %>'/fonts'<% } %><% } else { %>'/assets/fonts'<% } %>,
    destJS: destRoute + <% if (wordpress) { %><% if (!wpShared) { %>'/wp-content/themes/<%= _.slugify(siteName) %>/js'<% } else { %>'/js'<% } %><% } else { %>'/assets/js'<% } %>,
    destJSLib: destRoute + <% if (wordpress) { %><% if (!wpShared) { %>'/wp-content/themes/<%= _.slugify(siteName) %>/js/lib'<% } else { %>'/js/lib'<% } %><% } else { %>'/assets/js/lib'<% } %>,
    destImg: destRoute + <% if (wordpress) { %><% if (!wpShared) { %>'/wp-content/themes/<%= _.slugify(siteName) %>/images'<% } else { %>'/images'<% } %><% } else { %>'/assets/images'<% } %>
};

var spriteConfig = {
    cssFile: 'sass/project/_sprites.scss',
    preview: false,
    svg: {sprite: 'images/sprite.svg'},
    templates: {
        css: require("fs").readFileSync("./templates/_sprite-mixin.scss", "utf-8")
    }
};

var onError = function (err) {
    gutil.beep();
    console.log(err);
};


<% if (!browserify) { %>gulp.task('customScripts', function () {
    return gulp.src([paths.js])<% if (!wordpress) { %>
        .pipe(newer(paths.destJS + '/script.js'))
        .pipe(concat('script.js'))<% } %>
        .pipe(gulp.dest(paths.destJS))
        .pipe(refresh(lrserver));
});


<% if (!wordpress) { %>gulp.task('vendorScripts', function () {
    return gulp.src([paths.jsVendor])
        .pipe(newer(paths.destJS + '/vendor.js'))
        .pipe(concat('vendor.js'))
        .pipe(uglify())
        .pipe(insert.wrap('(function (window, document, $, undefined) {', '})(window, document, jQuery);'))
        .pipe(gulp.dest(paths.destJS));
});


<% } %><% } %>gulp.task('libScripts', function () {
    return gulp.src([paths.jsLib])
        <% if (browserify) { %>.pipe(filter(['**/modernizr.js', '**/picturefill.min.js'<% if (ie8 != 'no') { %>, '**/respond.min.js', '**/selectivizr.js', '**/nwmatcher-1.2.5.js'<% } %>]))
        <% } %>.pipe(gulp.dest(paths.destJSLib));
});


gulp.task('sass', ['sassdoc'], function () {
    return gulp.src(paths.sass)
        .pipe(plumber(onError))
        .pipe(sass({
            loadPath: require('node-bourbon').includePaths,
            'sourcemap=none': true
        }))
        .pipe(gulp.dest(paths.destCSS))
        .pipe(refresh(lrserver));
});


gulp.task('sassdoc', function() {
    return gulp
        .src(paths.assets + '/sass')
        .pipe(sassdoc({
            dest: './documentation/sass'
        }));
});


gulp.task('fonts', function () {
    return gulp.src([paths.fonts])
        .pipe(gulp.dest(paths.destFonts));
});


gulp.task('sprites', function () {
    return gulp.src(paths.sprites)
        .pipe(newer(paths.assets))
        .pipe(svgSprite(spriteConfig))
        .pipe(gulp.dest(paths.assets))
        .pipe(filter('**/*.svg'))
        <% if (ie8 != 'no') { %>.pipe(svg2png())
        <% } %>.pipe(gulp.dest(paths.assets))
});


<% if (ie8 != 'no') { %>gulp.task('toPng', function () {
    gulp.src([paths.assets + '/images/**/*.svg', '!' + paths.assets + '/images/svg-sprite.svg', '!' + paths.assets + '/images/sprites/**'])
        .pipe(svg2png())
        .pipe(imagemin({
            progressive: true,
            interlaced: true
        }))
        .pipe(gulp.dest(paths.destImg));
});


<% } %>gulp.task('images', <% if (ie8 != 'no') { %>['toPng'], <% } %>function () {
    return gulp.src([paths.img, '!' + paths.app + '/**/images/sprites{,/**}'])
        .pipe(newer(paths.destImg))
        .pipe(imagemin({
            progressive: true,
            interlaced: true
        }))
        .pipe(gulp.dest(paths.destImg))
        .pipe(refresh(lrserver));
});


<% if (!jekyll) { %>gulp.task('clean', require('del').bind(null, ['.tmp', paths.dest]<% if (wpShared) { %>, {force: true}<% } %>));


<% } /* end not jekyll */ %>gulp.task('serve', function () {
    http.createServer(ecstatic({ root: __dirname + '/' + paths.dest })).listen(serverport);<% if (!wordpress) { %>
    require('opn')('http://localhost:' + serverport + '/index.html');<% } /* end not wp */ else { /* is wp */ %>require('opn')('<%= localUrl %>');<% } /* end is wp */ %>
    lrserver.listen(livereloadport);
});

<% if (jekyll) { %>gulp.task('jekyll', function () {
    var spawn = require('child_process').spawn,
        jekyll = spawn('jekyll', ['build']);

    jekyll.on('exit', function (code) {
        console.log('-- Finished Jekyll Build --')
    })
});<% } %><% if (wordpress) { %>gulp.task('php', function () {
    return gulp.src(paths.php)
        .pipe(newer(paths.dest))
        .pipe(embedlr())
        .pipe(gulp.dest(paths.dest))
        .pipe(refresh(lrserver));
});<% } /* end is wp */ else { /* not wp */ %><% if (!jekyll) { /* not wp && not jekyll */ %>gulp.task('html', function () {
    return gulp.src([paths.html, '!' + paths.app + '/assets/sass/**/*.html'])
        .pipe(newer(paths.dest))
        .pipe(embedlr())
        .pipe(gulp.dest(paths.dest))
        .pipe(refresh(lrserver));
});<% } /* end not wp && not jekyll */ %><% } /* end not wp */ %>


<% if (ie8 != 'no') { %>gulp.task('filesCopy', function () {
    gulp.src([paths.app + '/backgroundsize.min.htc'])
        .pipe(gulp.dest(paths.dest));
});


<% } %><% if (browserify) { %>gulp.task('watchMain', function() {
    var bundler = watchify(browserify('./' + paths.assets + '/js/script.js', {debug: !compress}));
    bundler.on('update', rebundle);

    function rebundle() {
        return bundler.bundle()
        .on('error', gutil.log.bind(gutil, 'Browserify Error'))
        .pipe(source('script.js'))
        .pipe(gulpif(compress, buffer()))
        .pipe(gulpif(compress, uglify()))
        .pipe(gulp.dest(paths.destJS))
        .pipe(refresh(lrserver));
    }

    return rebundle();
});


<% } %>gulp.task('watch', function () {
    <% if (!browserify) { %>gulp.watch(paths.js, ['customScripts']);
    gulp.watch(paths.jsLib, ['libScripts']);
    <% } %>gulp.watch(paths.sass, ['sass']);
    <% if (!jekyll && !wordpress) { %>gulp.watch(paths.html, ['html']);
    <% } %>gulp.watch([paths.img, '!' + paths.app + '/**/images/sprites{,/**}'], ['images']);
    gulp.watch(paths.sprites, ['sprites']);<% if (wordpress) { %>
    gulp.watch(paths.php, ['php']);<% } %><% if (jekyll) { %>
    gulp.watch([paths.html, './**/*.yml', '!./dist/**', '!./dist/*/**'], ['jekyll']);

    gulp.watch([paths.dest + '/**/*.html']).on('change', function (file) {
        return gulp.src(paths.dest)
            .pipe(refresh(lrserver));
    });
    <% } %>
});


gulp.task('scripts', [<% if (!wordpress) { %><% if (!browserify) { %>'vendorScripts', <% } %><% } %>'libScripts'<% if (!browserify) { %>, 'customScripts'<% } %>]);


gulp.task('styles', ['sprites'], function() {
    gulp.start('sass');
});


gulp.task('visual', ['images'], function() {
    gulp.start('styles');
});

<% if (browserify) { %>gulp.task('watchJS', ['watchMain']);
<% } %>gulp.task('build', ['scripts', 'visual', 'fonts'<% if (wordpress) { %>, 'php'<% } else if (!jekyll) { %>, 'html'<% } %><% if (jekyll) { %>, 'jekyll'<% } %><% if (ie8 != 'no') { %>, 'filesCopy'<% } %>]);


gulp.task('server', ['build'], function() {
    gulp.start('serve');
    <% if (browserify) { %>gulp.start('watchJS');
    <% } %>gulp.start('watch');
});


gulp.task('default', <% if (!jekyll) { %>['clean'],<% } %> function () {
    gulp.start('server');
});