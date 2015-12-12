var gulp = require('gulp');
var rename = require('gulp-rename');
var concat = require('gulp-concat');
var del = require('del');
var jshint = require('gulp-jshint');
var uglify = require('gulp-uglify');
var angularFilesort = require('gulp-angular-filesort');
var ngAnnotate = require('gulp-ng-annotate');
var header = require('gulp-header');
var karma = require('karma');
var pkg = require('./package.json');
var browserSync = require('browser-sync').create();

var banner = ['/**',
  ' * ng-user-auth <%= pkg.version %>',
  ' * (c) 2015 <%= pkg.author.name %>',
  ' * License: <%= pkg.license %>',
  ' */',
  ''].join('\n');

function runTests(singleRun, done, coverage) {
  new karma.Server({
    configFile: __dirname + '/karma.conf.js',
    singleRun: singleRun,
    autoWatch: !singleRun,
    preprocessors: coverage ? {'src/*.js': ['coverage']} : {}
  }, done).start();
}

gulp.task('minify', function () {
  return gulp.src([
      'src/*.js',
      '!src/*.mock.js',
      '!src/*.spec.js'
    ])
    .pipe(angularFilesort())
    .pipe(ngAnnotate())
    .pipe(concat('ng-user-auth.js'))
    .pipe(uglify())
    .pipe(header(banner, {pkg: pkg}))
    .pipe(rename({suffix: '.min'}))
    .pipe(gulp.dest('dist'));
});

gulp.task('testscripts', function () {
  return gulp.src([
      'src/*.js'
    ])
    .pipe(jshint());
});

gulp.task('watch', function () {
  gulp.watch('src/*.js', function () {
    gulp.start('testscripts');
  });
});

gulp.task('serve',  function() {
  browserSync.init({
    server: {
      baseDir: './'
    }
  });
});

gulp.task('clean', function (done) {
  del('dist/*.js', done);
});

gulp.task('test', ['clean', 'testscripts'], function (done) {
  runTests(true, done, true);
});

gulp.task('test:auto', ['watch'], function (done) {
  runTests(false, done, false);
});

gulp.task('default', ['clean', 'minify']);
