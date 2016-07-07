var fs = require('fs')
var path = require('path')
var crypto = require('crypto')
var markdown = require('markdown').markdown
var fn = require('../fn')
var conf = global.conf
var colors = require('colors')

var fromDir = conf.root
var toDir = conf.cacheC

function isMarkdown(f){
    return ['.md'].indexOf(path.extname(f)) != -1
}

function compileMarkdown(f){
    if (!fs.existsSync(f)){
        return
    }

    if (!isMarkdown(f)){
        return
    }

    console.log(`compile: ${f.replace(fromDir, '')}`)

    try{
        var body = markdown.toHTML(fn.getBody(f))
        var f2 = path.join(toDir, f.replace(fromDir, '')).replace(/\.(md)/, '.html')

        fn.createF(f2, body)
    }
    catch (ex){
        console.error(colors.red(ex))
    }
}

function compile(){
    fn.walk(fromDir, f => {
        compileMarkdown(f)
    })
}

function watch(){
    fs.watch(fromDir, {recursive:true}, (event, f) => {
        if (!isMarkdown(f)){
            return false
        }

        f = path.join(fromDir, f)
        compileMarkdown(f)
    })
}

exports.compile = compile
exports.watch = watch
