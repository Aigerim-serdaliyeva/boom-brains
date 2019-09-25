var gulp         = require('gulp'),
    sass         = require('gulp-sass'),
    browserSync  = require('browser-sync'),
    concat       = require('gulp-concat'),
    uglify       = require('gulp-uglify-es').default,
    cleancss     = require('gulp-clean-css'),
    autoprefixer = require('gulp-autoprefixer'),
    rsync        = require('gulp-rsync'),
    rename       = require('gulp-rename'),
    del          = require('del');

// Local Server
gulp.task('browser-sync', function() {
	browserSync({
		server: {
			baseDir: 'app'
		},
		notify: false,
		// online: false, // Work offline without internet connection
		// tunnel: true, tunnel: 'projectname', // Demonstration page: http://projectname.localtunnel.me
	})
});
function bsReload(done) { browserSync.reload(); done(); };

gulp.task('sass', function () {
  return gulp.src('app/sass/**/*.+(sass|scss)')
    .pipe(sass({ outputStyle: 'expand' }))
    .pipe(rename({ suffix: '.min', prefix: '' }))
    .pipe(autoprefixer({
      grid: true,
  		overrideBrowserslist: ['last 10 versions']
    }))
    // .pipe(cleancss({level: { 1: { specialComments: 0 } } })) // Опционально, закомментировать при отладке
    .pipe(gulp.dest('app/css'))
    .pipe(browserSync.stream())
});

gulp.task('libs-css', function () {
  return gulp.src([
  ])
  .pipe(cleancss({level: { 1: { specialComments: 0 } } })) // Опционально, закомментировать при отладке
  .pipe(concat('libs.min.css'))
  .pipe(gulp.dest('app/css'));
});

// Скрипты проекта

gulp.task('main-js', function () {
  return gulp.src([
    'app/js/main.js',
  ])
    .pipe(concat('main.min.js'))
    .pipe(uglify()) // Минифицирует js
    .pipe(gulp.dest('app/js'))
    .pipe(browserSync.reload({ stream: true }));
});

gulp.task('libs-js', function () {
  return gulp.src([
   'node_modules/jquery/dist/jquery.min.js',  
  ])
    .pipe(concat('libs.min.js'))
    .pipe(uglify()) // Минимизировать весь js (на выбор)
    .pipe(gulp.dest('app/js'));
});

// Code & Reload
gulp.task('code', function() {
	return gulp.src('app/**/*.html')
	.pipe(browserSync.reload({ stream: true }))
});

gulp.task('imagemin', function () {
  return gulp.src('app/img/**/*')
    .pipe(gulp.dest('dist/img'));
});

gulp.task('removedist', function () { return del(['dist'], { force: true })   });

gulp.task('watch', function () {
  gulp.watch('app/sass/**/*.+(sass|scss)', gulp.parallel('sass'));
  gulp.watch('app/js/main.js', gulp.parallel('main-js'));
  gulp.watch(['app/*.html'], gulp.parallel('code'));
});

gulp.task('build', gulp.parallel('removedist', 'imagemin', 'sass', 'libs-js', 'main-js'), function () {

  var buildFiles = gulp.src([
    'app/*.html',
    'app/*.php',
    'app/*.txt',
    'app/.htaccess'
  ]).pipe(gulp.dest('dist'));

  var buildVideos = gulp.src([
    'app/videos/*'
  ]).pipe(gulp.dest('dist/videos'));

  var buildFilesFold = gulp.src([
    'app/files/*'
  ]).pipe(gulp.dest('dist/files'));

  var buildCss = gulp.src([
    'app/css/libs.min.css',
    'app/css/main.min.css'
  ]).pipe(gulp.dest('dist/css'));

  var buildJs = gulp.src([
    'app/js/libs.min.js',
    'app/js/main.min.js',
  ]).pipe(gulp.dest('dist/js'));

  var buildFonts = gulp.src([
    'app/fonts/**/*',
  ]).pipe(gulp.dest('dist/fonts'));

  var buildAdmin = gulp.src([
    'app/admin/*',
    'app/admin/.htaccess'
  ]).pipe(gulp.dest('dist/admin'));

});

gulp.task('rsync', function() {
	return gulp.src('app/**')
	.pipe(rsync({
		root: 'app/',
		hostname: 'username@yousite.com',
		destination: 'yousite/public_html/',
		// include: ['*.htaccess'], // Includes files to deploy
		exclude: ['**/Thumbs.db', '**/*.DS_Store'], // Excludes files from deploy
		recursive: true,
		archive: true,
		silent: false,
		compress: true
	}))
});

gulp.task('default', gulp.parallel('sass', 'libs-js', 'main-js', 'browser-sync', 'watch'));
