var gulp = require('gulp');
var rename = require('gulp-rename');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var plumber = require('gulp-plumber');
var complexity = require('gulp-complexity');
var header = require('gulp-header');
var pkg = require('./package.json');

var banner = ['/**',
  ' * ng-user-auth <%= pkg.version %>',
  ' * (c) 2015 <%= pkg.author.name %>',
  ' * License: <%= pkg.license %>',
  ' */',
  ''].join('\n');

gulp.task('minify', function() {
  return gulp.src([
      'src/*.js',
      '!src/*.mock.js',
      '!src/*.spec.js'
    ])
    .pipe(plumber())
    .pipe(concat('ng-user-auth.js'))
    .pipe(uglify())
    .pipe(header(banner, { pkg: pkg }))
    .pipe(rename({ suffix: '.min' }))
    .pipe(gulp.dest('dist'));
});

gulp.task('complexity', function() {
  return gulp.src('src/*.js')
    .pipe(complexity());
});

gulp.task('watch', function() {
  gulp.watch('src/*.js', ['minify']);
});

gulp.task('default', ['watch']);
