// Based on https://gist.github.com/martinwolf/b7e2c380c70e48782925

var gulp = require('gulp'),
    del = require('del'),
	sync = require('browser-sync'),
	cp = require('child_process'),
	concat = require('gulp-concat'),
	sass = require('gulp-sass')
	uglify = require('gulp-uglify'),
	rename = require('gulp-rename'),
	runSequence = require('run-sequence'),
	merge = require('merge-stream');

var config = {
	bowerDir: 'bower_components',
	dest: '_site',
	src: 'src'
}

gulp.task('js', function() {
	return gulp.src(config.src + '/_js/**/*.js')
    	.pipe(concat('scripts.js'))
    	.pipe(rename({suffix: '.min'}))
    	.pipe(uglify())
    	.pipe(gulp.dest(config.dest + '/js'));
});

gulp.task('css', function() {
    return gulp.src(config.src + '/_scss/main.scss')
    	.pipe(sass().on('error', sass.logError))
        .pipe(gulp.dest(config.dest + '/css'))
		.pipe(sync.reload({stream:true}));
});

gulp.task('copy-libs', ['copy-fonts']);

gulp.task('copy-fonts', function() {
    return gulp.src(config.bowerDir + '/mdi/fonts/**/*.*')
        .pipe(gulp.dest(config.dest + '/lib/fonts/'))
		.pipe(sync.reload({stream:true}));
});

gulp.task('clean', function (cb) {
  del(config.dest, cb);
});

gulp.task('build', function(callback) {
	runSequence('jekyll-build',
		'css',
		'js',
        'copy-libs',
		'reload',
		callback);
});

gulp.task('jekyll-build', function (done) {
    return cp.spawn('jekyll', ['build', '--source', config.src, '--destination', config.dest], {stdio: 'inherit'})
    	.on('close', done);
});

gulp.task('reload', function () {
    sync.reload();
});

gulp.task('browser-sync', ['build'], function() {
	sync({
		server: {
			baseDir: config.dest,
			routes: {
				"/pencil-stencils": config.dest + "/"
			}
		},
		host: "localhost"
	});
});

gulp.task('watch', ['browser-sync'], function() {
  // Watch .js files
  gulp.watch(config.src + '/_js/**/*.js', ['js']);
  // Watch .scss files
  gulp.watch(config.src + '/**/*.scss', ['css']);
  // Watch anything Jekyll handles
  gulp.watch([config.src + '/**/*.html', config.src + '/**/*.md'], ['build']);
});
