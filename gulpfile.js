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
var server = require('gulp-develop-server');
var browserSync = require('browser-sync');
var karmaParseConfig = require('karma/lib/config').parseConfig;

var banner = ['/**',
  ' * ng-user-auth <%= pkg.version %>',
  ' * (c) 2016 <%= pkg.author.name %>',
  ' * License: <%= pkg.license %>',
  ' */',
  ''].join('\n');

function runKarma(configFileName, options, done) {
  var config = karmaParseConfig(__dirname + '/' + configFileName, {});

  Object.keys(options).forEach(function (key) {
    config[key] = options[key];
  });

  new karma.Server(config, function (exitCode) {
    done();
    process.exit(exitCode);
  }).start();
}

var options = {
  server: {
    path: './sample/server/server.js',
    execArgv: ['--harmony']
  },
  browserSync: {
    proxy: 'http://localhost:3000'
  }
};

gulp.task('server:start', function () {
  server.listen(options.server, function (error) {
    if (!error) {
      browserSync(options.browserSync);
    }
  });
});

// If server scripts change, restart the server and then browser-reload.
gulp.task('server:restart', function () {
  server.restart(function (error) {
    if (!error) {
      browserSync.reload();
    }
  });
});

gulp.task('serve', ['server:start'], function () {
  gulp.watch([options.server.path], ['server:restart']);
});

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

gulp.task('clean', function (done) {
  del(['dist/*.js', 'coverage'], done);
});

/** single run */
gulp.task('test', function (done) {
  runKarma('karma.conf.js', {
    autoWatch: false,
    singleRun: true,
    preprocessors: {'src/*.js': ['coverage']}
  }, done);
});

/** continuous ... using karma to watch */
gulp.task('test:auto', function (done) {
  runKarma('karma.conf.js', {
    autoWatch: true,
    singleRun: false,
    preprocessors: {}
  }, done);
});

gulp.task('default', ['clean', 'minify']);
