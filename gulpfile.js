const gulp = require("gulp");

let workSpaceDir = __dirname;
gulp.task("cpDoc", function() {
    let docDir = `${workSpaceDir}/doc/*.*`;
    var stream = gulp.src(docDir);
    return stream.pipe(
        gulp.dest(`${workSpaceDir}/bin/`)
    );
});