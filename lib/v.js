var path = require('path')
var fs = require('fs')
var fn = require('./fn')

var conf = global.conf
var confr = conf.release
var confDogR = conf.fedog.release
var dogConf = conf.fedog

var fromDir = conf.release.optimize ? conf.cacheO : conf.cacheC
var toDir = conf.cacheV

//版本对应表
var vtable = {}
//依赖表
var dtable = {}
//script|css|img
var reg1 = /(?:<script.*?src="(.*?)".*?><\/script>)|(?:<link.*?href="(.*?)".*?>)|(?:<img.*?src="(.*?)".*?>)/gi
//url()
var reg2 = /url\(['"]?(?!http:\/\/)([^)'"]+)/gi

//插入依赖表
function idtable(a, b){
    if (! (a in dtable)){
        dtable[a] = [b]
    }
    else {
        if (dtable[a].indexOf(b) == -1){
            dtable[a].push(b)
        }
    }
}

//f1当前文件，f2引用文件
function gPath(f1, f2){
    var f3
    if (f2[0] == '/'){
        f3 = path.join(fromDir, f2)
    }
    else {
        f3 = path.join(path.dirname(f1), f2)
    }

    return f3
}

function v(t){
    //先其他类型
    var ps = []
    t.other.forEach(_=>{
        ps.push(v1(_))
    })

    return Promise.all(ps).then(_=>{
        //再css
        t.css.forEach(_=>{
            v2(_)
        })
        //最后html
        t.html.forEach(_=>{
            v3(_)
        })
    })
}

//替换引用辅助函数
function vf(f, a, b){
    var bf = gPath(f, b)
    if (fs.existsSync(bf)){
        idtable(bf, f)

        var bo = path.parse(bf)

        var domain = confr.domain ? confDogR.domain : ''
        var project = confDogR.project ? '/' + confDogR.project : ''
        var version = confr.version && vtable[bf] ? `.${vtable[bf]}` : ''

        return a.replace(b, domain + project + path.join(bo.dir.replace(fromDir, ''), `${bo.name}${version}${bo.ext}`))
    }
    else {
        return a
    }
}

//处理非html,css文件
function v1(f){
    console.log(`version: ${f.replace(fromDir, '')}`)

    var fo = path.parse(f)
    var f2 = path.join(toDir, path.relative(fromDir, f))

    var v = ''
    if (confr.version){
        v = fn.getMd5(fn.getBody(f))
        vtable[f] = v
        v = `.${v}`
    }

    f2 = path.join(path.dirname(f2), `${fo.name}${v}${fo.ext}`)
    return fn.copy(f, f2)
}
//处理css文件
function v2(f){
    console.log(`version: ${f.replace(fromDir, '')}`)

    var fo = path.parse(f)
    var f2 = path.join(toDir, path.relative(fromDir, f))

    var body = fn.getBody(f).replace(reg2, (a, b)=>{
        if (b){
            return vf(f, a, b)
        }
        else {
            return a
        }
    })

    var v = ''
    if (confr.version){
        v = fn.getMd5(body)
        vtable[f] = v
        v = `.${v}`
    }

    fn.createF(path.join(path.dirname(f2), `${fo.name}${v}${fo.ext}`), body)
}
//处理html文件
function v3(f){
    console.log(`version: ${f.replace(fromDir, '')}`)

    var fo = path.parse(f)
    var f2 = path.join(toDir, path.relative(fromDir, f))

    var body = fn.getBody(f).replace(reg1, (a, b, c, d) => {
        b = b || c || d
        if (b){
            return vf(f, a, b)
        }
        else {
            return a
        }
    })

    fn.createF(f2, body)
}

function isHtml(ext){
    return ['.html', '.vm'].indexOf(ext) != -1
}

function iftable(f, ftable){
    var fo = path.parse(f)
    var ext = fo.ext

    if (isHtml(ext)){
        ftable.html.push(f)
    }
    else if (ext == '.css'){
        ftable.css.push(f)
    }
    else {
        ftable.other.push(f)
    }
}

//递归查询依赖
function findDep(f, ftable){
    iftable(f, ftable)

    var deps = dtable[f]
    if (!deps || deps.length == 0){
        return false
    }

    deps.forEach(_=>{
        findDep(_, ftable)
    })
}

//is only copy?
function isCopy(f){
    var rf = path.relative(fromDir, f)

    if (fn.match(dogConf.release.copy, rf)){
        console.log(`version.copy: ${rf}`)

        fn.createF(path.join(toDir, rf), fn.getBody(f))
        return true
    }
    else {
        return false
    }
}

function version(){
    console.log('\n##################################')
    console.log('version: start...')

    //得到文件表
    var ftable = {html:[], css:[], other:[]}

    fn.walk(fromDir, f=>{
        if (isCopy(f)){
        }
        else {
            iftable(f, ftable)
        }
    })

    return v(ftable)
}

function watch(){
    console.log('\n##################################')
    console.log('version watch: start...')

    fs.watch(fromDir, {recursive:true}, (event, f)=>{
        f = path.join(fromDir, f)

        if (!fs.existsSync(f) || fn.isDir(f)){
            return
        }

        if (isCopy(f)){
            return
        }

        var ftable = {html:[], css:[], other:[]}
        findDep(f, ftable)

        v(ftable)
    })
}

exports.version = version
exports.watch = watch
