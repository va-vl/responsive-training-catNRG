"use strict";

// Раздел I. Подключение внешних плагинов
// I-1. Плагины для работы
// I-1-0. Подключение gulp и поддержка асинхронного выполнения задач
const gulp = require("gulp");
const { series, parallel } = require('gulp');
// I-1-1. Компиляция SCSS
const sass = require("gulp-sass");
// I-1-2. Расстановка вендор-префиксов
const postcss = require("gulp-postcss");
const autoprefixer = require("autoprefixer");
// I-1-3. Поддержка локального сервера и контроль ошибок через plumber
const plumber = require("gulp-plumber");
const server = require("browser-sync").create();

// I-2. Плагины для минификации изображений (выполняются один раз, до начала работы)
const imagemin = require("gulp-imagemin");
const webp = require("imagemin-webp");
const jpegoptim = require("imagemin-jpegoptim");
const svgstore = require("gulp-svgstore");

// I-3. Плагины для сборки
// I-3-1 Минификация кода (CSS, HTML, JS)
const csso = require("gulp-csso");
const sourcemap = require("gulp-sourcemaps");
const pipeline = require("readable-stream").pipeline;
const htmlmin = require("gulp-htmlmin");
const uglify = require("gulp-uglify");
// I-3-2 Шаблонизатор <include>
const posthtml = require("gulp-posthtml");
const include = require("posthtml-include");

// I-4. Служебные плагины (переименование файлов, замена расширений, удаление лишнего)
const rename = require("gulp-rename");
const extReplace = require("gulp-ext-replace");
const del = require("del");

// Раздел II. Описание функций препроцессора до сборки
// II-1. Рабочие функции (в работе постоянно)
// II-1-1. Компиляция SCSS кода
function style() {
  return gulp.src("./source/scss/**/*.scss")
    .pipe(plumber())
    .pipe(sass())
    .pipe(postcss([
      autoprefixer()
    ]))
    .pipe(gulp.dest("./source/css/"))
    .pipe(server.stream());
}
// II-1-2. Запуск локального сервера и автоматическая компиляция и перезагрузка при изменении SCSS кода, JS и HTML кода
function serve() {
  server.init({
    server: {
      baseDir: "./source/"
    }
  });
  gulp.watch("./source/scss/**/*.scss", style);
  gulp.watch("./source/js/**/*.js").on("change", server.reload);
  gulp.watch("./source/*.html").on("change", server.reload);
}

// II-2. Минификация изображений (один раз, до начала работы)
// II-2-1. Минификация изображений
function images() {
  return gulp.src("./source/img/**/*.{png,jpg,svg}")
    .pipe(imagemin([
      jpegoptim({
        max: 80,
        progressive: true
      }),
      imagemin.optipng({ optimizationLevel: 3 }),
      imagemin.svgo({
        plugins: [
          { removeViewBox: false },
          { removeTitle: true },
          { cleanupNumericValues: { floatPrecision: 0 } }
        ]
      })
    ]))
    .pipe(gulp.dest("./source/img/"));
}
// II-2-2. Создание webp версий растровых картинок
function createWebp() {
  return gulp.src("./source/img/**/*.{png,jpg}")
    .pipe(imagemin([
      webp({ quality: 75 })
    ]))
    .pipe(extReplace(".webp"))
    .pipe(gulp.dest("./source/img"));
}
// II-2-3. Сборка svg-спрайта
function sprite() {
  return gulp.src("./source/img/**/icon-*.svg")
    .pipe(svgstore({ inlineSvg: true }))
    .pipe(rename("sprite.svg"))
    .pipe(gulp.dest("./source/img/"));
}
//II-3. Экспорт рабочих функций для командной строки
exports.serve = serve;
exports.optimizeImages = series(images, createWebp, sprite);

// Раздел III. Описание функций препроцессора для сборки
// III-1. Компиляция и минификация CSS
function styleBuild() {
  return gulp.src("./source/scss/**/*.scss")
    .pipe(plumber())
    .pipe(sourcemap.init())
    .pipe(sass())
    .pipe(postcss([
      autoprefixer()
    ]))
    .pipe(csso())
    .pipe(rename("style.min.css"))
    .pipe(sourcemap.write("."))
    .pipe(gulp.dest("./build/css/"))
    .pipe(server.stream());
}
// III-2. Поддержка шаблонизатора <include>
function htmlInclude() {
  return gulp.src("./source/*.html")
    .pipe(posthtml([
      include()
    ]))
    .pipe(gulp.dest("./build/"));
}
// III-3. Минификация HTML
function htmlMinify() {
  return gulp.src("./build/*.html")
    .pipe(htmlmin({ collapseWhitespace: true }))
    .pipe(gulp.dest("./build/"));
}
// III-4. Сжатие JS
function jsCompress() {
  return pipeline(
    gulp.src("./source/**/*.js"),
    uglify(),
    gulp.dest("./build/")
  );
}
// III-5. Копирование файлов из source/ в build/
function copy() {
  return gulp.src([
    "./source/fonts/**/*.{woff,woff2}",
    "./source/js/**",
    "./source/*.ico",
    "./source/img/**/*"
  ], {
      base: "./source/"
    })
    .pipe(gulp.dest("./build/"));
}
// III-6. Удаление лишних файлов
function clean() {
  return del("./build/");
}
// III-7. Удаление отдельных svg-иконок, упакованных в спрайт
function cleanSvg() {
  return del("./build/img/**/icon-*.svg");
}
// III-8. Экспорт команды для сборки
exports.build = series(clean, copy, styleBuild, cleanSvg, htmlInclude, htmlMinify, jsCompress);

//Идея оказалась не совсем удачной. Сборку билда, как и рекомендовалось раньше, нужно выводить по-другому. В следующем проекте сделаю нормально.
