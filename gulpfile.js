const gulp = require("gulp");
const shell = require("shelljs");

let workSpaceDir = __dirname;
gulp.task("cpDoc", function() {
    let docDir = `${workSpaceDir}/doc/*.*`;
    var stream = gulp.src(docDir);
    return stream.pipe(
        gulp.dest(`${workSpaceDir}/bin/`)
    );
});

gulp.task('tsc', function() {
    return exec('tsc -p ./tsconfig.json');
})

gulp.task("pb_dev", function(done) {
    return pb();
})

async function pb() {
    await exec("tsc -p ./tsconfig.json"); //编译
    await exec("gulp cpDoc"); //拷贝配置文件
    await exec("mkdir -p temp_bp"); //创建打包目录
    await exec("zip -q -r -o ./temp_bp/temp.zip ./bin/"); //压缩zip 
}

async function exec(cmd) {
    let t = Date.now();
    return new Promise((resolve, reject) => {
        shell.exec(cmd, (code, stdout, stderr) => {
            if (stderr) {
                console.log(stderr);
                resolve(stderr);
            }
            console.log(`执行成功:${cmd} 耗时:${Date.now() - t} 毫秒`);
            resolve(stderr);
        });
    });
}