var gulp = require('gulp');
var sass = require('gulp-ruby-sass');
var imagemin = require('gulp-imagemin');
var svgSprite = require("gulp-svg-sprites");
var svg2png = require('gulp-svg2png');
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

var theme = 'htdocs/content/themes/<%= _.slugify(siteName) %>/app';
    livereloadport = 35729,
    serverport = 5001;

var paths = {
    php: theme + '/**/*.php',
    assets: theme + '/assets',
    sass: theme + '/assets/sass/**/*.scss',
    sassDir: theme + '/assets/sass',
    css: theme + '/assets/css',
    img: theme + '/assets/images/**/*',
    imgDir: theme + '/assets/images',
    sprites: theme + '/assets/images/sprites/*.svg',
    spritesDir: theme + '/assets/sass/project'
};

var spriteConfig = {
    cssFile: 'sass/project/_sprites.scss',
    preview: false,
    svg: {sprite: 'images/sprite.svg'},
    templates: {
        css: require("fs").readFileSync(paths.assets + '/sass/templates/_sprite-mixin.scss', 'utf-8')
    }
};

var onError = function (err) {
    gutil.beep();
    console.log(err);
};


gulp.task('sass', function () {
    return gulp.src([paths.sass, '!' + paths.sassDir + '/lib/*/**'])
        .pipe(plumber(onError))
        .pipe(sass({
            loadPath: require('node-bourbon').includePaths,
            'sourcemap=none': true
        }))
        .pipe(gulp.dest(paths.css))
        .pipe(refresh(lrserver));
});


gulp.task('sprites', function () {
    return gulp.src(paths.sprites)
        .pipe(newer(paths.imgDir))
        .pipe(svgSprite(spriteConfig))
        .pipe(gulp.dest(paths.imgDir))
        .pipe(filter('**/*.svg'))
        .pipe(svg2png())
        .pipe(gulp.dest(paths.imgDir))
});


gulp.task('toPng', function () {
    gulp.src([paths.imgDir + '/**/*.svg', '!' + paths.imgDir + '/svg-sprite.svg', '!' + paths.imgDir + '/sprites/**'])
        .pipe(svg2png())
        .pipe(gulp.dest(paths.imgDir));
});


gulp.task('images', ['toPng'], function () {
    return gulp.src([paths.img, '!' + paths.sprites])
        .pipe(newer(paths.img))
        .pipe(imagemin({
            progressive: true,
            interlaced: true
        }))
        .pipe(gulp.dest(paths.img))
        .pipe(refresh(lrserver));
});


gulp.task('php', function () {
    return gulp.src(paths.php)
        .pipe(refresh(lrserver))
});


gulp.task('serve', function () {
    http.createServer(ecstatic({ root: __dirname })).listen(serverport);
    require('opn')('<%= localUrl %>');
    lrserver.listen(livereloadport);
});


gulp.task('watch', function () {
    gulp.watch([paths.sass, '!' + paths.sassDir + '/lib/*/**'], ['sass']);
    gulp.watch([paths.img, '!' + paths.imgDir + '/sprites{,/**}'], ['images']);
    gulp.watch(paths.sprites, ['sprites']);
    gulp.watch(paths.php, ['php']);
});


gulp.task('styles', ['sprites'], function() {
    gulp.start('sass');
});


gulp.task('visual', ['images'], function() {
    gulp.start('styles');
});


gulp.task('build', ['visual']);


gulp.task('server', ['build'], function() {
    gulp.start('serve');
    gulp.start('watch');
});


gulp.task('default', function () {
    gulp.start('server');
});