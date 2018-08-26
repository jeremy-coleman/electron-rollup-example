var fs = require('fs')
var path = require('path')
var electron = require('electron')
var cp = require('child_process')
var del = require('del')

const gulp = require('gulp')
const livereload = require('gulp-livereload')
const rename = require('gulp-rename')
var gulpRollup = require('gulp-rollup-stream')
const rollupStream = require('rollup-vinyl-stream2');

const commonjs = require('rollup-plugin-commonjs')
const nodeResolve = require('rollup-plugin-node-resolve')
const autoExternal = require('rollup-plugin-auto-external');

const typescript = require('rollup-plugin-typescript2');
const tsConfigPaths = require('rollup-plugin-ts-paths');
const {terser} = require('rollup-plugin-terser');
const filesize = require("rollup-plugin-filesize");

const postcss = require('rollup-plugin-postcss')
var purgecss = require('@fullhuman/postcss-purgecss')


import { PKG_EXTERNALS, getFileSize, PATHS } from './tools'

const BROWSER_TARGET_PLUGINS = [
      tsConfigPaths(),
      nodeResolve(),
      commonjs({exclude: "node_modules/**/*"}),
      postcss({
      plugins: [
             require('postcss-omit-import-tilde')(),
             require('postcss-easy-import')(),
             require("postcss-url")(({url: 'inline'})),
             //require("postcss-url")(({url: 'rebase'})),
             require('postcss-preset-env')({ browsers: 'last 2 Chrome versions' }),
             require('postcss-inline-svg')(),
             require('postcss-svgo')(),
             require('postcss-font-smoothing')(),
             purgecss({
                    content: [
                      'src/**/*.html',
                      'src/**/*.tsx',
                      'src/**/*.ts',
                      'src/**/*.hbs',
                      'src/**/*.js']
             }),
             require('postcss-csso')({ restructure: true }),
             require('postcss-discard-duplicates'),
      ]
      }),
      typescript({
        typescript: require('typescript'),
        cacheRoot: '.cache/.rpt2_cache',
        tsconfigOverride: {compilerOptions: { module: 'esnext' }}
        }),
      terser({warnings: true, ecma: 8}),
      //filesize() 
]

const ELECTRON_TARGET_PLUGINS = [
      typescript({
      typescript: require('typescript'),
      cacheRoot: '.cache/.rpt2_cache',
      tsconfigOverride: {compilerOptions: { module: 'esnext' }}
      
      }),
      autoExternal(),
      terser({warnings: true, ecma: 8}),
]


//see https://github.com/fabiosantoscode/terser#minify-options for a markdown doc of all terser options

gulp.task('clean:dist', function () {
  return del(['dist/'])
})

//----------------------client--------------------//

gulp.task('rollup:client', function() {
		return gulp.src('src/client/main.tsx')
			.pipe(gulpRollup({
				  external: PKG_EXTERNALS,
          plugins: BROWSER_TARGET_PLUGINS,  
          format: 'cjs',
          globals: {
            'react': 'React',
            'react-dom': 'ReactDOM',
          },
          name: 'coglite',
          sourcemap: false,
          experimentalCodeSplitting: true,
          inlineDynamicImports: true,
			}))
      .pipe(rename('main.js'))
			.pipe(gulp.dest('dist/client'))
      .pipe(livereload())
	});



gulp.task('rollup:desktop', function() {
 return rollupStream(   
   {
    input: './src/desktop/main.ts',
    external: PKG_EXTERNALS.concat(['electron']),
    plugins: ELECTRON_TARGET_PLUGINS,
    output:{
    globals: {},
    format: 'cjs',
    name: 'main',
    sourcemap: false,
  },
    experimentalCodeSplitting: true,
    inlineDynamicImports: true,
  }
  //,{input: '' --example of multi input here}
  )
  .pipe(gulp.dest('./dist/desktop'))
});



gulp.task('start:electron', async () => {
   console.log(`BUNDLE SIZE: ${getFileSize('dist/client/main.js')}`)
   cp.spawn(electron, ["."], { stdio: "inherit" })
      .on("close", () => {
        process.exit(0)
      })
  })
  

gulp.task('watch', async () => {
  livereload.listen();
  gulp.watch(PATHS.client.src, gulp.series('rollup:client'))
})


gulp.task('start', gulp.series(
  'clean:dist',
  gulp.parallel('rollup:desktop', 'rollup:client'),
  gulp.parallel('start:electron', 'watch')
))


//for some reason this is way slower

// gulp.task('build:client', function () {
//  return rollupStream(   
//    {
//     input: './src/client/main.tsx',
//     external: PKG_EXTERNALS,
//     plugins: BROWSER_TARGET_PLUGINS,  
//     output:{
//       globals: {
//       'react': 'React',
//       'react-dom': 'ReactDOM',
//     },
//     format: 'cjs',
//     name: 'coglite',
//     sourcemap: false,
//   },
//     experimentalCodeSplitting: true,
//     inlineDynamicImports: true,
//   })
//   .pipe(size())
//   .pipe(gulp.dest('./dist/client'))
//   .pipe(livereload())
// });

// //gulp.task('build:client', buildClient)