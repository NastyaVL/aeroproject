const gulp = require('gulp');
const plumber = require('gulp-plumber');
const gulpIf = require('gulp-if');

const autoprefixer = require('gulp-autoprefixer');
const del = require('del');
const pug = require('gulp-pug');
const sass = require('gulp-sass');
const sourcemaps = require('gulp-sourcemaps'); //зачем???????????
const cleanCSS = require('gulp-clean-css');
const imagemin = require('gulp-imagemin');
const browserSync = require('browser-sync').create();

const webpack = require("webpack");
const gulpWebpack = require("webpack-stream");
const webpackConfig = require("./webpack.config.js");

//svg-sprite
const svgSprite = require("gulp-svg-sprite");
const svgmin = require("gulp-svgmin");

const isProduction = process.env.NODE_ENV === "production";

//объект 
const PATHS = {
    app: "./app",
    dist: "./dist"
};

gulp.task('clear', () => del(PATHS.dist));

gulp.task("templates", () => {
    return gulp
    .src(`${PATHS.app}/pages/*.pug`)
    .pipe(plumber())//в каждый метод записываем пламбер для исправления ошибок
    .pipe(pug({
        pretty: true //добавить пробелы в виде красивых отступов (по умолчанию false)
    }))
    .pipe(gulp.dest(`${PATHS.dist}`)); //ПОЧЕМУ сюда шаблоны выводим???
});

//задача - компиляция scss в css (с добавлнием автопрефиксов для браузеров)
gulp.task("styles", () => {
    return gulp
    .src(`${PATHS.app}/common/styles/app.scss`)
    .pipe(plumber())
    .pipe(gulpIf(!isProduction, sourcemaps.init()))// зачем ????
    .pipe(sass()) //компиляция sass в css
    .pipe(autoprefixer())
    .pipe(gulpIf(isProduction, cleanCSS()))
    .pipe(gulpIf(!isProduction, sourcemaps.write()))
    .pipe(gulp.dest(`${PATHS.dist}/assets/styles`));
});

//сборка скриптов в общий бандл
gulp.task("scripts", () => {
	return gulp
		.src(`${PATHS.app}/common/scripts/*.js`)
        .pipe(plumber())
        .pipe(gulpWebpack(webpackConfig, webpack))
		.pipe(gulp.dest(`${PATHS.dist}/assets/scripts`));
});

gulp.task("images", () => {
	return gulp
		.src(`${PATHS.app}/common/images/**/*.+(png|jpg|jpeg|gif|svg|ico)`)
		.pipe(plumber())
		.pipe(gulpIf(isProduction, imagemin()))
		.pipe(gulp.dest(`${PATHS.dist}/assets/images`));
});
//копирует из папки в папку???!!!
gulp.task("copy", () => {
    return gulp
        .src (`${PATHS.app}/common/fonts/**/*`)
        .pipe(plumber())
        .pipe(gulp.dest(`${PATHS.dist}/assets/fonts`));
});

gulp.task("server", () => {
	browserSync.init({
		server: PATHS.dist
	});
	browserSync.watch(PATHS.dist + "/**/*.*").on("change", browserSync.reload);
});

//тут вроде есть ошибка ?????????????????? !!!!!!!!!!!!!!!!!!!11
gulp.task("watch", () => {
	gulp.watch(`${PATHS.app}/**/*.pug`, gulp.series("templates"));//series - последовательное выполнение тасков
	gulp.watch(`${PATHS.app}/**/*.scss`, gulp.series("styles"));
	gulp.watch(`${PATHS.app}/**/*.js`, gulp.series("scripts"));
	gulp.watch(
		`${PATHS.app}/common/images/**/*.+(png|jpg|jpeg|gif|svg|ico)`,
		gulp.series("images")
	);
});

//SVG
gulp.task("icons", () => {
	return gulp
	  .src(`${PATHS.app}/common/icons/**/*.svg`)
	  .pipe(plumber())
	  .pipe(svgmin({
		js2svg: {
		  pretty: true
		}
	  }))
	  .pipe(
		svgSprite({
		  mode: {
			symbol: {
			  sprite: "../dist/assets/images/icons/sprite.svg",
			  render: {
				scss: {
				  dest:'../app/common/styles/helpers/sprites.scss',
				  template: './app/common/styles/helpers/sprite-template.scss'
				}
			  }
			}
		  }
		})
	  )
	  .pipe(gulp.dest('./'));
  });

gulp.task("default", gulp.series(
		gulp.parallel("templates", "icons", "styles", "scripts", "images", "copy"),
		gulp.parallel("watch", "server")
	)
);

gulp.task("production", gulp.series(
		"clear",
		gulp.parallel("templates", "icons", "styles", "scripts", "images")
	)
);