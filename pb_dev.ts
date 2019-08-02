

import shell = require("shelljs")
async function pb_dev() {
    // mergePromise([
        await exec("tsc -p ./tsconfig.json");
        await exec("gulp cpDoc");
        await exec("mkdir -p temp_bp");
        await exec("zip -q -r -o ./temp_bp/temp.zip ./bin/");
    // ])
}

async function exec(cmd) {
    let t = Date.now();
    return new Promise((resolve, reject) => {
        shell.exec(cmd, (code, stdout, stderr) => {
            if (stderr) {
                console.log(stderr);
                resolve(stderr);
            }
            resolve(stderr);
            console.log(`执行成功:${cmd} 耗时:${Date.now() - t} 毫秒`);
        });
    });
}

var mergePromise = async function mergePromise(arr) {
    var mergePromise = async function mergePromise(arr) {
        var mergedAjax = Promise.resolve()
        var data = [];
        for (let promise of arr) {
            mergedAjax = mergedAjax.then(() => {
                return promise().then(val => {
                    data.push(val)
                })
            })
        }
        return mergedAjax.then(() => {
            return data
        })
    };
};

pb_dev();