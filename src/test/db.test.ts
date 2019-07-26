import supertest = require("supertest");
var app = require("../../bin/app");

describe('test db',function(){
    it("test sys_user",function(done){
        this.timeout(10000);
        let callback = ()=>{
            supertest(app)
                .post("/platServer/getPlatInfo")
                .set('Content-Type','application/json')
                .send({
                    platId:1100,
                    gameId:10000
                })
                .expect(204) //断言希望得到返回http状态码
                .end(function(err, res) {
                    console.info(res.body);//得到返回我们可以用2.2中的断言对返回结果进行判断。
                    done();
                });
        }
        setTimeout(callback,7000);
    })
})