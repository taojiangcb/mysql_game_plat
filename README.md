# 小游戏平台中间件集成服务



# TypeScript Node 环境的搭建


首先我们需要安装typescript的tsc编译器，tsc能够把ts转换为js，因为node的解释器是不认ts的，因此在运行node应用之前需要把ts转换为js。

```
npm install --save typescript
```

等待安装完毕之后

```
tsc -v
Vesion 2.6.1
```

创建一个typescript node 项目
```
mkdir node_project
cd node_project
npm init
... //这里是nodejs app 的初始化 会有一些相关的询问设置
tsc.init
```

npm init 是把该项目初始化为一个npm 项目,之后执行tsc init 是为了帮助我们创建tsconfig.json文件,tsconfig 是 tsc 每次编译的都会去检查的配置文件

```
{
  "compilerOptions": {
    /* Basic Options */
    "target": "es5",                          /* Specify ECMAScript target version: 'ES3' (default), 'ES5', 'ES2015', 'ES2016', 'ES2017', or 'ESNEXT'. */
    "module": "commonjs",                     /* Specify module code generation: 'none', 'commonjs', 'amd', 'system', 'umd', 'es2015', or 'ESNext'. */
    // "lib": [],                             /* Specify library files to be included in the compilation:  */
    // "allowJs": true,                       /* Allow javascript files to be compiled. */
    // "checkJs": true,                       /* Report errors in .js files. */
    // "jsx": "preserve",                     /* Specify JSX code generation: 'preserve', 'react-native', or 'react'. */
    // "declaration": true,                   /* Generates corresponding '.d.ts' file. */
    // "sourceMap": true,                     /* Generates corresponding '.map' file. */
    // "outFile": "./",                       /* Concatenate and emit output to single file. */
    "outDir": "./dist",                        /* Redirect output structure to the directory. */
    "rootDir": "./src",                       /* Specify the root directory of input files. Use to control the output directory structure with --outDir. */
    // "removeComments": true,                /* Do not emit comments to output. */
    // "noEmit": true,                        /* Do not emit outputs. */
    // "importHelpers": true,                 /* Import emit helpers from 'tslib'. */
    // "downlevelIteration": true,            /* Provide full support for iterables in 'for-of', spread, and destructuring when targeting 'ES5' or 'ES3'. */
    // "isolatedModules": true,               /* Transpile each file as a separate module (similar to 'ts.transpileModule'). */

    /* Strict Type-Checking Options */
    "strict": true,                            /* Enable all strict type-checking options. */
    // "noImplicitAny": true,                 /* Raise error on expressions and declarations with an implied 'any' type. */
    // "strictNullChecks": true,              /* Enable strict null checks. */
    // "strictFunctionTypes": true,           /* Enable strict checking of function types. */
    // "noImplicitThis": true,                /* Raise error on 'this' expressions with an implied 'any' type. */
    // "alwaysStrict": true,                  /* Parse in strict mode and emit "use strict" for each source file. */

    /* Additional Checks */
    // "noUnusedLocals": true,                /* Report errors on unused locals. */
    // "noUnusedParameters": true,            /* Report errors on unused parameters. */
    // "noImplicitReturns": true,             /* Report error when not all code paths in function return a value. */
    // "noFallthroughCasesInSwitch": true,    /* Report errors for fallthrough cases in switch statement. */

    /* Module Resolution Options */
    // "moduleResolution": "node",            /* Specify module resolution strategy: 'node' (Node.js) or 'classic' (TypeScript pre-1.6). */
    // "baseUrl": "./",                       /* Base directory to resolve non-absolute module names. */
    // "paths": {},                           /* A series of entries which re-map imports to lookup locations relative to the 'baseUrl'. */
    // "rootDirs": [],                        /* List of root folders whose combined content represents the structure of the project at runtime. */
    // "typeRoots": [],                       /* List of folders to include type definitions from. */
    // "types": [],                           /* Type declaration files to be included in compilation. */
    // "allowSyntheticDefaultImports": true,  /* Allow default imports from modules with no default export. This does not affect code emit, just typechecking. */
    // "preserveSymlinks": true,              /* Do not resolve the real path of symlinks. */

    /* Source Map Options */
    // "sourceRoot": "./",                    /* Specify the location where debugger should locate TypeScript files instead of source locations. */
    // "mapRoot": "./",                       /* Specify the location where debugger should locate map files instead of generated locations. */
    // "inlineSourceMap": true,               /* Emit a single file with source maps instead of having a separate file. */
    // "inlineSources": true,                 /* Emit the source alongside the sourcemaps within a single file; requires '--inlineSourceMap' or '--sourceMap' to be set. */

    /* Experimental Options */
    "experimentalDecorators": true        /* Enables experimental support for ES7 decorators. */
    // "emitDecoratorMetadata": true,         /* Enables experimental support for emitting type metadata for decorators. */
  }
}
```

这里只需关注一下outDir和rootDir。outDir是tsc编译后输出的js文件的目录，这里我把它输出在dist目录，rootDir是源文件的目录，也就是需要被tsc编译的目录。

# Koa环境的简历

### Step 1 创建基础和安装依赖
```
mkdir <project-name>
cd <project-name>
git init // 初始化 git 配置文件
mkdir src

// 安装依赖
npm init // 初始化 package.json
npm i koa koa-router
npm i --save-dev typescript ts-node nodemon
npm i --save-dev @types/koa @types/koa-router

```

### Step 2 修改编译配置
添加 tsconfig.json 配置，为了使用原生的 Async/Await，我们将编译的目标版本设置为 es2017:

```
{
    "compilerOptions": {
        "module": "commonjs",
        "target": "es2017",
        "noImplicitAny": true,
        "moduleResolution": "node",
        "sourceMap": true,
        "outDir": "dist",  // TS文件编译后会放入到此文件夹内
        "baseUrl": ".",
        "paths": {
            "*": [
                "node_modules/*",
                "src/types/*"
            ]
        }
    },
    "include": [
        "src/**/*"
    ]
}

```

### Step 3 创建 koa 应用
我们在根目录下面创建 app.ts

```
import * as Koa from "koa";
import * as Router from "koa-router";
import * as fs from "fs";

let app = new Koa();
let router = new Router();

/**
 * 当node 进程崩溃的时候处理
 */
process.addListener("uncaughtException",(err:Error)=>{
    if(err.message) {
        console.log(err.message);
    }
    if(err.stack) {
        console.log(err.stack);
    }
})

/**
 * 当node 进程退出时候处理
 */
process.addListener("exit",(code:number)=>{
    console.log("exit code" + code);
});


/**
 * hello world
 */
router.get("/*",async(ctx)=>{
    ctx.body = "hello world";
});

app.use(router.routes);
app.listen(3000);
console.log("server runing on port 3000");
```

如果服务堆在一个app.ts里 那也是可以的，不过我这里学到一个高级一点的方法，创建servers目录，在servers里创建一个LoginServer.ts

```
//LoginServer.ts


async function login(ctx,next) {
    console.log("the call login function")
    var body = ctx.request.body;        //接收post 请求参数
    console.log(body);

    return ctx.response.body = body;
}

async function login_get(ctx,netx) {
    console.log("the call login_get function")
    var query = ctx.request.querty;     //接收get 请求参数
    console.log(query);

    //返回
    return ctx.response.body = query;
}

/**
 * 导出接口
 */
module.exports = {
    'POST /login/login':login,
    'GET /login/login_get':login_get
}

```

然后修改app.ts 添加 initServers方法

```
import * as Koa from "koa";
import * as Router from "koa-router";
import { EventEmitter } from "events";
import { eventNames } from "cluster";
import * as fs from "fs";

let app = new Koa();
let router = new Router();

function initServers():void {
    var server_files:string[];
    var files = fs.readdirSync(__dirname + "/servers");
    server_files = files.filter((f)=>{
        return f.endsWith(".js");
    },this);
    
    server_files.forEach(f => {
        let mapping = require(__dirname + "/servers/" + f);
        for(var url in mapping) {
            if(url.startsWith("GET")) {
                let funs:string[] = url.split(/\s+/i);
                console.log(funs);
                router.get(funs[0],mapping[url]);
            } else if(url.startsWith("POST")) {
                let funs:string[] = url.split(/\s+/i);
                console.log(funs);
                router.post(funs[0],mapping[url]);
            } else {
                console.log("未知服务:" + url);
            }
        }
    });
}

initServers();
/**
 * 当node 进程崩溃的时候处理
 */
process.addListener("uncaughtException",(err:Error)=>{
    if(err.message) {
        console.log(err.message);
    }
    if(err.stack) {
        console.log(err.stack);
    }
})

/**
 * 当node 进程退出时候处理
 */
process.addListener("exit",(code:number)=>{
    console.log("exit code" + code);
});

/**
 * hello world
 */
router.get("/*",async(ctx)=>{
    ctx.body = "hello world";
});


app.use(router.routes);
app.listen(3000);
console.log("server runing on port 3000");
```
