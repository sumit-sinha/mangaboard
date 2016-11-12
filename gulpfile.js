const gulp = require("gulp");
const del = require("del");
const fs = require("fs");
const typescript = require("gulp-typescript");
const tslint = require('gulp-tslint');
const uglify = require('gulp-uglify');
const cleanCSS = require('gulp-clean-css');
const pako = require('gulp-pako');

const browserSync = require('browser-sync');
const reload = browserSync.reload;

const paths = {
  dist: 'dist',
  distFiles: 'dist/**/*',
  srcFiles: 'src/**/*',
  srcTsFiles: 'src/**/*.ts',
}

gulp.task('clean', function () {
  return del(paths.distFiles);
});

gulp.task('copy:assets', ['clean'], function() {
  return gulp.src([paths.srcFiles, '!' + paths.srcTsFiles])
    .pipe(gulp.dest(paths.dist))
});

gulp.task('copy:libs', ['clean'], function() {
  return gulp.src([
      'node_modules/@angular/platform-browser-dynamic/bundles/platform-browser-dynamic.umd.js',
      'node_modules/@angular/platform-browser/bundles/platform-browser.umd.js',
      'node_modules/@angular/core/bundles/core.umd.js',
      'node_modules/@angular/http/bundles/http.umd.js',
      'node_modules/@angular/router/bundles/router.umd.js',
      'node_modules/@angular/compiler/bundles/compiler.umd.js',
      'node_modules/@angular/common/bundles/common.umd.js',
      'node_modules/systemjs/dist/system.src.js',
      'node_modules/zone.js/dist/zone.min.js',
      'node_modules/reflect-metadata/Reflect.js',
      'node_modules/rxjs/util/*.js',
      'node_modules/rxjs/symbol/*.js',
      'node_modules/rxjs/operator/*.js',
      'node_modules/rxjs/observable/*.js',
      'node_modules/rxjs/add/operator/map.js',
      'node_modules/rxjs/add/operator/catch.js',
      'node_modules/rxjs/add/observable/throw.js',
      'node_modules/rxjs/*.js'
    ])
    .pipe(gulp.dest(function(file) {
      return "dist/" + file.path.substring(file.path.indexOf("node_modules"), file.path.lastIndexOf("/"));
    }));
});

gulp.task('compile', ['clean'], function () {
  const tscConfig = JSON.parse(fs.readFileSync('./tsconfig.json', 'UTF8'));
  return gulp
    .src(tscConfig.files)
    .pipe(typescript(tscConfig.compilerOptions))
    .pipe(gulp.dest(paths.dist + '/app'));
});

gulp.task('tslint', function(){
  return gulp.src(paths.srcTsFiles)
    .pipe(tslint())
    .pipe(tslint.report('verbose'));
});

gulp.task('minifycss', ['prepare'], function(){
  return gulp
    .src(paths.distFiles + ".css")
    .pipe(cleanCSS({compatibility: 'ie8'}))
    .pipe(gulp.dest(paths.dist));
});

gulp.task('minifyjs', ['prepare'], function(cb) {
  return gulp
    .src(paths.distFiles + ".js")
    .pipe(uglify())
    .pipe(gulp.dest(paths.dist));
});

gulp.task('serve', ['build'], function() {
  browserSync({
    server: {
      baseDir: paths.dist
    }
  });

  gulp.watch(paths.srcFiles, ['buildAndReload']);
});

gulp.task('build', ['minifycss', 'minifyjs']);
gulp.task('prepare', ['tslint', 'clean', 'compile', 'copy:libs', 'copy:assets']);
gulp.task('buildAndReload', ['build'], reload);
gulp.task('default', ['build']);
