var fn = require('./lib/fn')

//console.log(fn.match(['tsconfig.json','config.rb'], 'tsconfig.json'))
//console.log(fn.match(["**/*.min.js"], 'static/script/a.min.js'))

console.log(fn.match(["static/script/copy/**/*"], 'static/script/copy/b.js'))
