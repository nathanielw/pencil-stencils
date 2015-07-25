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
	merge = require('merge-stream'),
	responsive = require('gulp-responsive');

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

gulp.task('images', function() {
	return gulp.src([config.src + '/img/bg.jpg'])
		.pipe(responsive(
			[
				{
					name: 'bg.jpg',
					width: 1920,
					rename: 'bg-1920px.jpg'
				},{
					name: 'bg.jpg',
					width: '100%',
					rename: 'bg@2x.jpg'
				},{
					name: 'bg.jpg',
					width: 960,
					rename: 'bg-960px.jpg'
				},{
					name: 'bg.jpg',
					width: 480,
					rename: 'bg-480px.jpg'
				}
			]
		)).pipe(gulp.dest(config.dest + '/img'));
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
		'images',
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
		host: "localhost",
		open: false
	});
});

gulp.task('watch', ['browser-sync'], function() {
  // Watch .js files
  gulp.watch(config.src + '/_js/**/*.js', ['js']);
  // Watch .scss files
  gulp.watch(config.src + '/**/*.scss', ['css']);
  // Watch images
  gulp.watch(config.src + '/img/**/*.*', ['images']);
  // Watch anything Jekyll handles
  gulp.watch([config.src + '/**/*.html', config.src + '/**/*.md'], ['build']);
});
