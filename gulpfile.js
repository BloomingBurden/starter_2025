const gulp = require('gulp');
const sass = require('gulp-sass')(require('sass'));
const notify = require('gulp-notify');
const isRemote = process.argv.indexOf('--remote') !== -1;
const isSync = process.argv.indexOf('--sync') !== -1;
const isDev = process.argv.indexOf('--dev') !== -1;
const isProd = !isDev;
const version = +isProd && Date.now();
const cheerio = require('gulp-cheerio');
const htmlbeautify = require('gulp-html-beautify');

const $ = require('gulp-load-plugins')({
    pattern: ['*', '!sass']
});

const data = require('gulp-data');
const fs = require('fs');
const nunjucksRender = require('gulp-nunjucks-render');
const rename = require('gulp-rename');

const postcss = require('gulp-postcss');
const cssnano = require('cssnano');
const purgecss = require('gulp-purgecss');

let pckg = require('./package.json');
let webconf = {
    output: {
        filename: 'common.js'
    },
    module: {
        rules: [{
            test: /\.js$/,
            exclude: /(node_modules|bower_components)/,
            use: {
                loader: 'babel-loader',
                options: { presets: ['@babel/preset-env'] }
            }
        }]
    },
    mode: isDev ? 'development' : 'production',
    devtool: isDev ? 'eval-source-map' : false
};

let pth = {
    pbl: {
        root: './docs/',
        html: './docs/',
        js: './docs/',
        css: './docs/',
        img: './docs/img/',
        fnts: './docs/fonts/'
    },
    src: {
        root: './src/',
        html: './src/templates/pages/**/*.html',
        js: './src/js/common.js',
        css: './src/scss/style.scss',
        scss: './src/scss/lib/',
        img: './src/img/**',
        icn: './src/img/svg/**/*.svg',
        fnts: './src/fonts/**/*.*',
        tmpl: './src/templates/'
    },
    wtch: {
        html: './src/templates/**/*.+(html|json)',
        js: ['./src/js/**/*.js', './src/blocks/**/(*.js|*.json)'],
        css: ['./src/scss/**/*.scss', './src/blocks/**/*.scss'],
        img: ['./src/img/**', '!./src/img/svg/**'],
        icn: './src/img/svg/**/*.svg',
        fnts: './src/fonts/**/*.*'
    }
};

function swallowError(error) {
    notify.onError({
		title: 'Gulp Error',
		message: error.message
	})(error);
	console.log(error.toString());
	this.emit('end');
}

function clear() {
    return $.del(pth.pbl.root + '*');
}

function js() {
    return gulp.src(pth.src.js)
		.pipe($.plumber({ errorHandler: swallowError }))
        .pipe($.webpackStream(webconf))
        .pipe(gulp.dest(pth.pbl.js))
        .pipe($.if(isSync, $.browserSync.stream()))
        .on('end', function () {
            if (isRemote) deploy(true, 'js');
        });
}

function jslib() {
    let paths = [];
    if (Object.keys(pckg.externalJs).length !== 0) {
        Object.entries(pckg.externalJs).forEach(function ([key, value], index) {
            paths[index] = `node_modules/${key}/${value}`;
        });

        return gulp.src(paths)
            .pipe(gulp.dest(pth.pbl.js));
    }
    return gulp.src('.', { allowEmpty: true });
}

const path = require('path');

function imagesAlt() {
    return gulp.src('./docs/**/*.html')
        .pipe(cheerio({
            run: function ($) {
                $('img').each(function () {
                    let alt = $(this).attr('alt');
                    const src = $(this).attr('src');

                    if ((!alt || alt.trim() === '') && src && src.includes('/img/')) {
                        const filename = src.split('/').pop().split('.')[0];
                        const altText = filename.replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
                        $(this).attr('alt', altText);
                    }
                });
            },
            parserOptions: {
                decodeEntities: false
            }
        }))
        .pipe(gulp.dest('./docs/'));
}

function html() {
    return gulp.src(pth.src.html)
        .pipe(data(() => {
            const dataPath = path.resolve(__dirname, 'src/templates/data.json');
            return fs.existsSync(dataPath) ? JSON.parse(fs.readFileSync(dataPath)) : {};
        }))
        .pipe(nunjucksRender({
            path: [path.resolve(__dirname, 'src/templates')]
        }))
        .on('error', swallowError)
        .pipe(rename({ extname: '.html' }))
        .pipe($.replace(/(\.(css|js)\?v=)\d+\b/g, `$1${version}`))
        .pipe($.if(isProd, htmlbeautify({
            indent_size: 2,
            preserve_newlines: true,
            max_preserve_newlines: 1
        })))
        .pipe(gulp.dest(pth.pbl.html))
        .pipe($.if(isSync, $.browserSync.stream()));
}

function styles() {
    return gulp.src(pth.src.css)
        .pipe($.if(isDev, $.sourcemaps.init()))
        .pipe($.globSass())
        .pipe(sass())
        .on('error', swallowError)
        .pipe($.autoprefixer({
            overrideBrowserslist: ["last 4 version"],
            cascade: false,
            grid: true
        }))
        .pipe($.if(isProd, $.groupCssMediaQueries()))

        // Удаляем неиспользуемые стили
        .pipe($.if(isProd, purgecss({
            content: [
                './src/templates/**/*.html',
                './src/js/**/*.js'
            ],
            defaultExtractor: content => content.match(/[\w-/:]+(?<!:)/g) || []
        })))

        // Минификация через cssnano
        .pipe($.if(isProd, postcss([cssnano()])))

        .pipe($.if(isDev, $.sourcemaps.write()))
        .pipe(gulp.dest(pth.pbl.css))
        .pipe($.if(isSync, $.browserSync.stream()))
        .on('end', function () {
            if (isRemote) deploy(true, 'css');
        });
}

function images() {
    return gulp.src(pth.src.img)
        .pipe($.newer(pth.pbl.img))
        .pipe($.webp())
        .pipe(gulp.dest(pth.pbl.img))
        .pipe($.if(isSync, $.browserSync.stream()));
}

function icons() {
    return gulp.src(pth.src.icn)
        .pipe($.svgSprite({
            svg: {
                xmlDeclaration: false,
                rootAttributes: { class: 'sprite' }
            },
            shape: {
                transform: [{
                    svgo: {
                        plugins: [
                            { name: 'preset-default' },
                            { name: 'removeAttrs', params: { attrs: '*:(fill|data-*|id|class|style|stroke)' } },
                        ]
                    }
                }]
            },
            mode: {
                symbol: {
                    dest: './',
                    sprite: 'sprite.svg',
                    example: !isProd
                }
            }
        }))
        .on('error', swallowError)
    // .pipe(gulp.dest(pth.src.tmpl))
};

function fonts() {
    return gulp.src(pth.src.fnts)
        .pipe($.newer(pth.pbl.fnts))
        .pipe($.fonter({
            formats: ['woff', 'ttf'],
            compound2simple: true
        }))
        .pipe(gulp.dest(pth.pbl.fnts))
        .pipe($.ttf2woff2())
        .pipe(gulp.dest(pth.pbl.fnts))
        .pipe($.if(isSync, $.browserSync.stream()));
}

function deploy(e, ...args) {
    const conn = $.vinylFtp.create({
        host: pckg.ftp.host,
        user: pckg.ftp.user,
        password: pckg.ftp.password,
        parallel: 5,
        log: $.fancyLog
    });

    args = args.length ? args : ['js', 'css'];
    args.forEach(function (item, i) {
        this[i] = pth.pbl[item] + '*.' + item;
    }, args);

    if (process.argv.indexOf('--all') !== -1) {
        return gulp.src(pth.pbl.root + '**', { base: pth.pbl.root })
            .pipe(conn.newerOrDifferentSize(pckg.ftp.workdir))
            .pipe(conn.dest(pckg.ftp.workdir));
    } else {
        return gulp.src(args, { base: pth.pbl.root, buffer: false })
            .pipe(conn.newerOrDifferentSize(pckg.ftp.workdir))
            .pipe(conn.dest(pckg.ftp.workdir));
    }
}

function watch() {
    if (isSync) {
        $.browserSync.init({
            server: { baseDir: pth.pbl.root }
        });
    }
    gulp.watch(pth.wtch.js, js);
    gulp.watch(pth.wtch.html, html);
    gulp.watch(pth.wtch.css, styles);
    gulp.watch(pth.wtch.img, images);
    gulp.watch(pth.wtch.icn, icons);
    gulp.watch(pth.wtch.fnts, fonts);
}

const build = gulp.series(
    isProd ? clear : done => done(),
    gulp.parallel(html, js, jslib, styles, images, icons, fonts),
    isProd ? imagesAlt : done => done()
);

exports.build = build;
exports.watch = gulp.series(build, watch);
exports.deploy = gulp.series(build, deploy);