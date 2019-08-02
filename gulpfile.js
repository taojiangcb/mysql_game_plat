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

gulp.task("pb_dev", function(done) {
    return pb();
})

async function pb() {
    await exec("tsc -p ./tsconfig.json");
    await exec("gulp cpDoc");
    await exec("mkdir -p temp_bp");
    await exec("zip -q -r -o ./temp_bp/temp.zip ./bin/");
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