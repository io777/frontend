'use strict';

var gulp = require('gulp'),
    watch = require('gulp-watch'),
    prefixer = require('gulp-autoprefixer'),
    uglify = require('gulp-uglify'),
    sass = require('gulp-sass'),
    sourcemaps = require('gulp-sourcemaps'),
    rigger = require('gulp-rigger'),
    cssmin = require('gulp-minify-css'),
    imagemin = require('gulp-imagemin'),
    pngquant = require('imagemin-pngquant'),
    rimraf = require('rimraf'),
    browserSync = require("browser-sync"),
    babel = require('gulp-babel'),
    spritesmith = require('gulp.spritesmith'),         
    sassGlob = require('gulp-sass-glob'),

    reload = browserSync.reload;

var path = {
  build: { //Тут мы укажем куда складывать готовые после сборки файлы
      html: 'build/',
      js: 'build/js/',
      css: 'build/css/',
      img: 'build/img/',
      svg: 'build/svg/',
      fonts: 'build/fonts/',
      audio: 'build/audio/'
  },
  src: { //Пути откуда брать исходники
      html: 'src/*.html', //Синтаксис src/*.html говорит gulp что мы хотим взять все файлы с расширением .html
      js: 'src/js/main.js',//В стилях и скриптах нам понадобятся только main файлы
      style: 'src/scss/main.scss',
      svg: 'src/svg/**/*.*',
      img: 'src/img/img/**/*.*', //Синтаксис img/**/*.* означает - взять все файлы всех расширений из папки и из вложенных каталогов
      fonts: 'src/fonts/**/*.*',
      audio: 'src/audio/**/*.*'
  },
  watch: { //Тут мы укажем, за изменением каких файлов мы хотим наблюдать
      html: 'src/**/*.html',
      js: 'src/js/**/*.js',
      style: 'src/scss/**/*.scss',
      svg: 'src/svg/**/*.*',
      img: 'src/img/**/*.*',
      fonts: 'src/fonts/**/*.*'
  },
  clean: './build'
};

var config = {
    server: {
        baseDir: "./build"
    },
    open: false,
    tunnel: true,
    host: 'localhost',
    port: 9000,
    logPrefix: "Frontend_Rusov",
    notify: false 
};

gulp.task('image:sprite', function () {
  var spriteData = gulp.src('src/img/sprite/**/*').pipe(spritesmith({
    imgName: 'sprite.png',
    cssName: 'sprite.css',
    imgPath: '../img/sprite.png',
    algorithm:'top-down',
    algorithmOpts: {sort: false}
  }));

  var cssStream = spriteData.css
  .pipe(gulp.dest('src/scss/partials/'));

  var imgStream = spriteData.img
  .pipe(gulp.dest('src/img/img/'));    

});

gulp.task('html:build', function () {
    gulp.src(path.src.html) //Выберем файлы по нужному пути
        .pipe(rigger()) //Прогоним через rigger
        .pipe(gulp.dest(path.build.html)) //Выплюнем их в папку build
        .pipe(reload({stream: true})); //И перезагрузим наш сервер для обновлений
});

gulp.task('audio:build', function () {
    gulp.src(path.src.audio) //Выберем файлы по нужному пути
        .pipe(gulp.dest(path.build.audio)) //Выплюнем их в папку build
        .pipe(reload({stream: true})); //И перезагрузим наш сервер для обновлений
});

gulp.task('js:build', function () {
    gulp.src(path.src.js) //Найдем наш main файл
        .pipe(rigger()) //Прогоним через rigger
        .pipe(babel({"presets": [[ "es2015", { "modules": false } ]]}))
        // .pipe(sourcemaps.init()) //Инициализируем sourcemap
        // .pipe(uglify()) //Сожмем наш js
        // .pipe(sourcemaps.write()) //Пропишем карты
        .pipe(gulp.dest(path.build.js)) //Выплюнем готовый файл в build
        .pipe(reload({stream: true})); //И перезагрузим сервер
});

gulp.task('style:build', function () {
    gulp.src(path.src.style) //Выберем наш main.scss
        // .pipe(sourcemaps.init()) //То же самое что и с js
        .pipe(sassGlob())
        .pipe(sass()) //Скомпилируем
        .pipe(prefixer()) //Добавим вендорные префиксы
        .pipe(cssmin()) //Сожмем
        // .pipe(sourcemaps.write())
        .pipe(gulp.dest(path.build.css)) //И в build
        .pipe(reload({stream: true}));
});

gulp.task('image:build', function () {
    gulp.src(path.src.img) //Выберем наши картинки
        .pipe(imagemin({ //Сожмем их
            progressive: true,
            svgoPlugins: [{removeViewBox: false}],
            use: [pngquant()],
            interlaced: true
        }))
        .pipe(gulp.dest(path.build.img)) //И бросим в build
        .pipe(reload({stream: true}));
});

gulp.task('svg:build', function () {
    gulp.src(path.src.svg) //Выберем наши svg
        .pipe(gulp.dest(path.build.svg)) //И бросим в build
        .pipe(reload({stream: true}));
});

gulp.task('webserver', function () {
    browserSync(config);
});

gulp.task('clean', function (cb) {
    rimraf(path.clean, cb);
});

gulp.task('fonts:build', function() {
    gulp.src(path.src.fonts)
        .pipe(gulp.dest(path.build.fonts))
});

gulp.task('watch', function(){
    watch([path.watch.html], function(event, cb) {
        gulp.start('html:build');
    });
    // watch([path.watch.img], function(event, cb) {
    //     gulp.start('image:sprite');
    // });
    watch([path.watch.style], function(event, cb) {
        gulp.start('style:build');
    });
    watch([path.watch.js], function(event, cb) {
        gulp.start('js:build');
    });
    watch([path.watch.img], function(event, cb) {
        gulp.start('image:build');
    });
    watch([path.watch.svg], function(event, cb) {
        gulp.start('svg:build');
    });
    watch([path.watch.fonts], function(event, cb) {
        gulp.start('fonts:build');
    });
});

gulp.task('build', [
    'html:build',
    'js:build',
    'style:build',
    'fonts:build',
    'svg:build',
    'image:build',
    'audio:build'
]);

gulp.task('default', ['build', 'webserver', 'watch']);