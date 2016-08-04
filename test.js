var fn = require('./lib/fn')
var minimatch = require("minimatch")
//
// //console.log(fn.match(['tsconfig.json','config.rb'], 'tsconfig.json'))
// //console.log(fn.match(["**/*.min.js"], 'static/script/a.min.js'))
//
// console.log(fn.match(["static/script/copy/**/*"], 'static/script/copy/b.js'))

//
// var markdown = require('markdown').markdown
// console.log(markdown.toHTML('hello *world*!'))

// console.log(fn.match(["static/script/libs/**/*.js"], 'static/scripts/libs/select2/js/select2.full.min.js'))
// console.log(fn.match(["static/script/libs/**/*"], 'static/scripts/libs/select2/js/select2.full.min.js'))


console.log(minimatch('static/scripts/libs/select2/js/select2.full.min.js', 'static/scripts/libs/**/*'))
