var gulp = require("gulp");
var gutil = require('gulp-util');
var inject = require("gulp-inject");
var livereload = require("gulp-livereload");
var clean = require("gulp-clean");
var es = require('event-stream');
var concat = require('gulp-concat');
var bower = require('main-bower-files');
var uglify = require('gulp-uglify');

var SERVER_PORT = 4000;
var SERVER_ROOT = __dirname + "/app";
var LIVERELOAD_PORT = 35729;
var lr_script = "<script>document.write('<script src=\"http://' + (location.host || 'localhost').split(':')[0] + ':"+LIVERELOAD_PORT +"/livereload.js?snipver=1\"></' + 'script>')</script>";

gulp.task("server",function(){
  var express = require('express');
  var server = express();
  server.use(require('connect-livereload')() );
  server.use(express.static( SERVER_ROOT ) );
  return server.listen(SERVER_PORT);
});

gulp.task("live",['makeIndex','server'],function()
{
  server = livereload.listen(LIVERELOAD_PORT, {silent:false});
  var app_change = gulp.watch( ["app/**/*.*",'!./index.html'], ["makeIndex"]);

  var server_watch = gulp.watch(SERVER_ROOT + '/index.html');

  server_watch.on('change', function(evt){
    gutil.log("Build updated.");
    livereload.changed(evt.path, server);
  });
  return server_watch;
});

gulp.task('makeIndex', function(){
  return gulp.src('./app/index.html')
    .pipe(inject(gulp.src(['./app/**/*.js','./app/**/*.css','!./app/bower_components/**']),{ignorePath:'/app/'}))
    .pipe(gulp.dest('./app'));
});

gulp.task('less', function(){
  return gulp.src('./**/*.less');
});

gulp.task('cleanDist', function(){
  return gulp.src('./dist',{read:false})
    .pipe(clean());
});

gulp.task('concatFiles',['cleanDist'], function(){

  var appJS = gulp.src('./app/scripts/*.js')
    .pipe(concat('websiteapp.js'))
    .pipe(gulp.dest('./dist'));

  var appJS = gulp.src('./app/styles/*.css')
    .pipe(concat('websiteapp.css'))
    .pipe(gulp.dest('./dist'));

  var templates = gulp.src('./app/scripts/*.mustache')
    .pipe(gulp.dest('./dist'));

  var models = gulp.src('./app/scripts/*.json')
    .pipe(gulp.dest('./dist'));

  var bowerCSS = gulp.src(bower({filter:function(a){
      if (a.indexOf('.js')===-1){
        return a
      }
    }}))
    .pipe(concat('deps.css'))
    .pipe(gulp.dest('./dist'));

  return gulp.src(bower({filter:function(a){
      if (a.indexOf('.css')===-1){
        return a
      }
    }}))
    .pipe(concat('deps.js'))
    .pipe(uglify())
    .pipe(gulp.dest('./dist'));
});

gulp.task('build', ['cleanDist','concatFiles'],function () {
  gutil.log("Building Application");

  return gulp.src('./app/index.html')
    .pipe(inject(gulp.src(['./dist/*.js','./dist/*.css']),{ignorePath:'/dist/'}))
    .pipe(gulp.dest('./dist'));
});
