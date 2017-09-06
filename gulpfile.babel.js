import gulp from 'gulp';
import babel from 'gulp-babel';
import sourcemaps from 'gulp-sourcemaps';
import util from './util.js';
import rename from 'gulp-rename';
import clean from 'gulp-clean';
import runSequence from 'run-sequence';
import inquirer from 'inquirer';
import replace from 'gulp-replace';
import fs from 'fs';
import webpack from 'webpack';
import webpackStream from 'webpack-stream';
import _ from 'lodash';
import uglify from 'gulp-uglify';		          // js压缩混淆
import minifyHtml from 'gulp-minify-html';		// html压缩
import minifyCss from 'gulp-minify-css';		  // css压缩
import rev from 'swg-gulp-rev';		                // 修改文件名增加md5，并生成rev-md5.json
import revCollector from 'swg-gulp-rev-collector';// 根据rev-md5.json对html中引用的静态资源路径做替换
import autoprefixer from 'gulp-autoprefixer';		// 自动添加css前缀
import sass from 'gulp-sass';			// sass预编译
import size from 'gulp-size';		// 显示gulp.dest输出到磁盘上的文件尺寸
import imagemin from 'gulp-imagemin';		// 图片压缩
import fileInclude from 'gulp-file-include';		// 为html引入tpl模板
import glob from 'glob';
import minimist from 'minimist';
import WebpackConfig from './webpack.config.js';   // 新版前后端分离webpack配置
import DeveloperConfig from './developer.config.js';  // 开发者配置文件
import liveReload from 'gulp-livereload';		// 文件变化时自动刷新浏览器，chrome需要安装LiveReload插件
import mergeStream from 'merge-stream';		// 合并流然后返回给run-sequence保证任务顺序执行
import path from 'path';		// 路径解析模块
import spritesmith from 'gulp.spritesmith';		// 精灵图

// 命令行参数
let argv = minimist(process.argv);

// 结合开发者文件的参数
let BuildArg = {
  env_stage: argv.env_stage || DeveloperConfig.env_stage || 'prod',
  env_num: argv.env_num || DeveloperConfig.env_num || '',
  page: argv.page || DeveloperConfig.page || '*',
  webpack: argv.webpack !== undefined ? argv.webpack : (DeveloperConfig.webpack !== undefined ? DeveloperConfig.webpack : true),
};
// npm run dev 和 npm run build 是给服务端使用，强制编译所有页面。
if (argv._[2] === 'build:dev' || argv._[2] === 'build:dist') {
  BuildArg.page = '*';
  BuildArg.webpack = true;
}

// 项目路径配置
let config = {
  html: `src/page/${BuildArg.page}/*.html`,
  css: `src/*page/${BuildArg.page}/css/*.scss`,
  js: `src/page/${BuildArg.page}/js/*.js`,
  img: `src/*page/${BuildArg.page}/img/*`,
  iconDir: `src/page/${BuildArg.page}/img/icon*`,
  temp: `.temp`,
};

// 替换表
let replacer = {
  '[[env_stage]]': '',
  '[[env_num]]': '',
  '[[static]]': '',
  '[[vendor]]': '//cdn-ws.davdian.com',
  // '[[v]]': '',
};
let replacerRegExp = null;

// 询问编译参数
function promptBuildArg(build, buidType) {
  let promptArray = [];

  /*// env_stage
   if (BuildArg.env_stage === undefined) {
   promptArray.push({
   type: 'rawlist',
   name: 'env_stage',
   message: 'please choose environment env_stage:',
   choices: ['dev', 'beta', 'gray', 'prod']
   });
   }

   // env_num
   if (BuildArg.env_num === undefined) {
   promptArray.push({
   type: 'rawlist',
   name: 'env_num',
   message: 'please choose environment env_num:',
   choices: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']
   });
   }*/

  // 开始询问
  inquirer.prompt(promptArray).then((answer) => {

    // 询问的结果
    // BuildArg.env_stage = BuildArg.env_stage || answer.env_stage;
    // BuildArg.env_num = BuildArg.env_num !== undefined ? BuildArg.env_num : answer.env_num;

    // 检查env_stage
    let domain = 'domain';
    if (BuildArg.env_stage == 'dev') {
      domain = 'fe.bravetime.net';
    } else if (BuildArg.env_stage == 'beta') {
      domain = 'fe.vyohui.cn';
    } else if (BuildArg.env_stage == 'gray' || BuildArg.env_stage == 'prod') {
      domain = 'fe-ws.davdian.com';
    } else {
      // throw new Error(`env_stage参数不正确: ${BuildArg.env_stage}`);
      let errorValue = BuildArg.env_stage;
      BuildArg.env_stage = 'prod';
      console.log(`env_stage参数值不正确: ${errorValue}。已设置为默认值：${BuildArg.env_stage}`);
      domain = 'fe-ws.davdian.com';
    }

    // 检查env_num
    if (BuildArg.env_num === '' || parseInt(BuildArg.env_num) >= 1 && parseInt(BuildArg.env_num) <= 20) {
    } else {
      // throw new Error(`env_num参数不正确: ${BuildArg.env_num}`);
      let errorValue = BuildArg.env_num;
      BuildArg.env_num = '';
      console.log(`env_num参数值不正确: ${errorValue}。已设置为默认值：'${BuildArg.env_num}'`);
    }

    // 设置替换表
    replacer['[[env_stage]]'] = BuildArg.env_stage;
    replacer['[[env_num]]'] = BuildArg.env_num;
    replacer['[[static]]'] = `//${domain}/wap/static${BuildArg.env_num || ''}/dist/static`;
    // if (buidType == 'default' || buidType == 'dev') {
    //   replacer['[[v]]'] = `?v=${util.getTimeFormatVersion()}`;
    // } else {
    //   replacer['[[v]]'] = ``;
    // }
    replacerRegExp = function () {
      let arr = [];
      for (let i in replacer) {
        let key = i.replace(/\[/g, '\\[');
        arr.push(key);
      }
      console.log(arr);
      return new RegExp(arr.join('|'), 'g');
    }();

    // 打印编译数据
    console.log(`argv: ${util.stringifyFormat(argv)}`);
    console.log(`BuildArg: ${util.stringifyFormat(BuildArg)}`);
    console.log(`replacer: ${util.stringifyFormat(replacer)}`);

    // 执行build任务
    return build();
  });
}

/************************************ 创建新模块(npm run create) ************************************/
gulp.task('create', () => {
  console.log(`>>>>>>>>>>>>>>> 开始创建新页面。${util.getNow()}`);
  inquirer.prompt([
    {
      type: 'input',
      name: 'name',
      message: 'please input page\'s name ?',
      validate: function (input) {
        return input ? true : false;
      }
    },
    {
      type: 'input',
      name: 'title',
      message: 'please input page\'s title ?'
    }
  ]).then((answer) => {
    console.log(JSON.stringify(answer, ' ', 2));
    let sourcePath = 'creator/**/*.*';
    let destPath = `src/page/${answer.name}`;
    gulp.src(sourcePath)
      .pipe(rename({
        basename: answer.name
      }))
      .pipe(replace('{{name}}', answer.name))
      .pipe(replace('${{title}}', answer.title || ''))
      .pipe(gulp.dest(destPath))
      .on('end', function () {
        setTimeout(function () {
          fs.mkdirSync(destPath + '/img');
          fs.mkdirSync(destPath + '/vue');
        }, 1000);
      })
    ;
    console.log(`>>>>>>>>>>>>>>> ${answer.name}页面已创建完毕。${util.getNow()}`);
  });
});

/************************************ 目录清理 ************************************/

// 开发环境目录清理
gulp.task('clean:dev', () => {
  console.log(`>>>>>>>>>>>>>>> 开发环境目录开始清理。${util.getNow()}`);
  return gulp.src('dev').pipe(clean());
});

// 生产环境目录清理
gulp.task('clean:dist', () => {
  console.log(`>>>>>>>>>>>>>>> 生产环境目录开始清理。${util.getNow()}`);
  return gulp.src('dist').pipe(clean());
});

// 编译过程临时目录清理
gulp.task('clean:temp', () => {
  console.log(`>>>>>>>>>>>>>>> 编译过程临时目录开始清理。${util.getNow()}`);
  return gulp.src(config.temp).pipe(clean());
});


/************************************ 合成精灵图 ************************************/

gulp.task('create_sprite', () => {
  console.log(`>>>>>>>>>>>>>>> 开始合成精灵图。${util.getNow()}`);
  let merged = mergeStream();

  // 遍历icon*名称的目录
  glob.sync(path.normalize(config.iconDir)).forEach(function (iconDir) {
    if (!fs.statSync(iconDir).isDirectory()) return;

    // 生成文件的basename
    let dirName = iconDir.split('/').pop();

    let stream = gulp.src(iconDir + '/*')
      .pipe(spritesmith({
        cssTemplate: `./spritesmith.hbs`,
        padding: 10,
        layout: 'top-down',
        imgName: `${dirName}.png`,
        cssName: `../css/_${dirName}.scss`,
        // 取相对路径即可,因为css和img是部署在一起的
        imgPath: `../img/${dirName}.png`,
        cssVarMap: function (sprite) {
          sprite.mixinName = `i-${sprite.name}`;
        }
      }));

    merged.add(stream.img.pipe(gulp.dest(iconDir + '/..')));
    merged.add(stream.css.pipe(gulp.dest(iconDir + '/..')));
  });
  return merged.isEmpty() ? null : merged;  // 保证顺序执行
});


/************************************ 编译JS ************************************/

// JS公共编译方法
function compileJs() {
  console.log(`>>>>>>>>>>>>>>> js文件开始编译。${util.getNow()}`);

  // 编译并返回流
  return gulp.src('')
    .pipe(webpackStream(WebpackConfig(config.js, replacer['[[static]]']), webpack, function (err, stats) {
      // console.log('webpackStream执行完毕');
    }))
    // 替换环境变量
    .pipe(replace(replacerRegExp, function (match) {
      return replacer[match];
    }));
}

// 开发环境JS编译
gulp.task('js:dev', () => {
  return compileJs()
  // 显示文件体积
    .pipe(size({showFiles: true}))
    // 输出
    .pipe(gulp.dest('dist'));
});

// 生产环境JS编译
gulp.task('js:dist', () => {
  return compileJs()
    .pipe(uglify())
    // 收集JS文件的MD5
    .pipe(rev())
    // 显示文件体积
    .pipe(size({showFiles: true}))
    // 输出JS
    .pipe(gulp.dest('dist'))
    // 记录MD5
    .pipe(rev.manifest('rev-md5/js.json'))
    // 输出MD5
    .pipe(gulp.dest(config.temp));
});


/************************************ 编译CSS ************************************/

// CSS公共编译方法
function compileCss() {
  console.log(`>>>>>>>>>>>>>>> CSS文件开始编译。${util.getNow()}`);

  return gulp.src(config.css)
  // 替换环境变量
    .pipe(replace(replacerRegExp, function (match) {
      return replacer[match];
    }))
    .pipe(sourcemaps.init())
    .pipe(sass({
      outputStyle: 'uncompressed'
    }))
    .pipe(sourcemaps.write({
      includeContent: false
    }))
    .pipe(autoprefixer())
}

// 开发环境CSS编译
gulp.task('css:dev', () => {
  return compileCss()
    .pipe(sourcemaps.write('./'))
    // 显示文件体积
    .pipe(size({showFiles: true}))
    .pipe(gulp.dest('dist/static'));
});

// 生产环境CSS编译
gulp.task('css:dist', () => {
  return compileCss()
    .pipe(minifyCss())
    .pipe(rev())
    // 显示文件体积
    .pipe(size({showFiles: true}))
    .pipe(gulp.dest('dist/static'))
    .pipe(rev.manifest('rev-md5/css.json'))
    .pipe(gulp.dest(config.temp))
    ;
});


/************************************ 编译图片 ************************************/

// 图片公共编译方法
function compileImg() {
  console.log(`>>>>>>>>>>>>>>> 图片文件开始编译。${util.getNow()}`);

  return gulp.src(config.img);
}

// 开发环境图片编译
gulp.task('img:dev', () => {
  return compileImg()
  // 显示文件体积
    .pipe(size({showFiles: true}))
    .pipe(gulp.dest('dist/static'));
});

// 生产环境图片编译
gulp.task('img:dist', () => {
  return compileImg()
  // .pipe(imagemin())
  // 显示文件体积
    .pipe(size({showFiles: true}))
    .pipe(gulp.dest('dist/static'));
});


/************************************ 收集旧静态资源的md5信息 ************************************/

gulp.task('old:rev', () => {
  console.log(`>>>>>>>>>>>>>>> 图片文件开始编译。${util.getNow()}`);
  return gulp.src([
    `stylesheet/base.css`,
    `stylesheet/model.css`,
    `javascript/tongji.js`,
    `javascript/units.js`,
    `javascript/base.js`,
    `javascript/model.js`,
  ])
    .pipe(rev())
    .pipe(rev.manifest('rev-md5/old:rev.json'))
    .pipe(gulp.dest(config.temp))
    ;
});


/************************************ 编译HTML ************************************/

// HTML编译公共方法
function compileHtml(production) {
  console.log(`>>>>>>>>>>>>>>> html文件开始编译。${util.getNow()}`);

  // 源文件路径
  let src = [config.html];

  // 生产环境源文件路径增加MD5记录文件
  if (production) {
    src.push('.temp/rev-md5/*.json');
  }

  // 编译并返回流
  return gulp.src(src)
    .pipe(fileInclude({
      prefix: '@@',
      basepath: __dirname + '/src/common/include/'
    }))
    // 替换环境变量
    .pipe(replace(replacerRegExp, function (match) {
      return replacer[match];
    }))
    .pipe(rename({
      dirname: ''
    }))
}

// 开发环境HTML编译
gulp.task('html:dev', function () {
  return compileHtml()
  // 替换版本号
    .pipe(replace('[[v]]', `?v=${util.getTimeFormatVersion()}`))
    // 显示文件体积
    .pipe(size({showFiles: true}))
    // 输出
    .pipe(gulp.dest('dist'))
    ;
});

// 生产环境HTML编译
gulp.task('html:dist', function () {
  return compileHtml(true)
  // 替换版本号
    .pipe(replace('[[v]]', ``))
    // 增加MD5戳
    .pipe(revCollector())
    // 压缩HTML
    .pipe(minifyHtml())
    // 显示文件体积
    .pipe(size({showFiles: true}))
    // 输出
    .pipe(gulp.dest('dist'))
    ;
});



/************************************ 构建开发环境(带文件监听) ************************************/
gulp.task('default', () => {
  promptBuildArg(function () {
    return runSequence(
      ['clean:dist'],
      // ['create_sprite'],
      ['js:dev'],
      ['css:dev'],
      ['img:dev'],
      ['html:dev'],
      // ['webpack:default'],
      function () {
        // gulp.watch([`src/**/img/icon*/*`], ['create_sprite', 'img:dev', 'js:dev', 'html:dev']);
        // 监视js变化
        gulp.watch([`src/**/*.{js,vue,json,es6}`], ['js:dev', 'html:dev']);
        // 监视旧的js变化
        gulp.watch([`{javascript,module,source,utils}/**/*.{js,vue,json,es6}`], ['js:dev', 'html:dev']);
        // 监视css变化
        gulp.watch([`src/**/*.scss`], ['css:dev', 'html:dev']);
        // 监视图片变化
        gulp.watch([`src/**/img/*.{png,jpg,gif,jpeg}`], ['img:dev', 'js:dev', 'html:dev']);
        // 监视html变化
        gulp.watch([`src/**/*.{html,include}`], ['html:dev']);
        // 开启liveReload
        liveReload.listen();
        // 监听开发目录变化，触发liveReload刷新浏览器
        gulp.watch([`dist/**/*`], function (file) {
          liveReload.changed(file.path);
        });
        console.log(`>>>>>>>>>>>>>>> gulp开始监听src目录文件变化...${util.getNow()}`);
      }
    );
  }, 'default');
});

/************************************ 构建开发环境(不带文件监听) ************************************/
gulp.task('build:dev', () => {
  promptBuildArg(function () {
    return runSequence(
      // ['clean:dist'],
      // ['sprite'],
      ['js:dev'],
      ['css:dev'],
      ['img:dev'],
      ['html:dev'],
      ['webpack:dev'],
      function () {
        console.log(`>>>>>>>>>>>>>>> gulp编译开发环境全部任务执行完毕。${util.getNow()}`);
      }
    );
  }, 'dev');
});

/************************************ 构建线上环境 ************************************/
gulp.task('build:dist', () => {
  promptBuildArg(function () {
    return runSequence(
      // ['clean:dist'],
      // ['sprite'],
      ['js:dist'],
      ['css:dist'],
      ['img:dist'],
      ['old:rev'],
      ['html:dist'],
      ['clean:temp'],
      ['webpack:dist'],
      function () {
        console.log(`>>>>>>>>>>>>>>> gulp编译生产环境全部任务执行完毕。${util.getNow()}`);
      }
    );
  }, 'dist');
});
