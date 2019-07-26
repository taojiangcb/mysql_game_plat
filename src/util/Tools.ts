/**
 * Created by liyimpc on 2017/10/16.
 */

// 文件读取中间件
var fs = require('fs');
// hash计算工具
const fnv = require('fnv-plus');
import Shell = require("shelljs");

class SysTool {

    /**
     * 创建文件夹
     * @param file
     * @returns {Function}
     */
    static mkdir(file) {
        return function (fn) { fs.mkdir(file, fn); }
    }

    /**
     * 写入文件
     * @param {*} file
     */
    static writeFile(file, context) {
        return function (fn) { fs.writeFile(file, context, fn); }
    }

    /**
     * 追加数据
     * @param {*} file
     */
    static appendFile(file, context) {
        return function (fn) {
            fs.appendFile(file, context, fn);
        }
    }

    /**
     * 读文件
     * @param {*} file
     */
    static readFile(file) {
        return function (fn) {
            fs.readFile(file, fn);
        }
    }

    /**
     * kill进程
     * @param pids
     */
    static async kill(pids) {
        if (pids) {
            var pid_str = '';
            for (var i in pids) {
                pid_str += pids[i] + ' ';
            }
            await Shell.exec('kill -9 ' + pid_str);
        }
    }

    /**
     * 根据用户ID计算hash，分配对应的表
     * @param {*} id
     * @param {*} table_name
     */
    static getTableName(id, table_name, len) {
        var result = "";
        if (id && table_name && len) {
            var id_hash_val = Number(fnv.hash(id, 32).dec()) % len + 1;
            result = [table_name, id_hash_val].join('_');
        } else { result = table_name; }
        return result;
    }

    /**
     * 根据用户ID计算hash
     * @param id 
     * @param len 
     */
    static getHashIndex(id, len) {
        var index = 0;
        if (id && len) { index = Number(fnv.hash(id, 32).dec()) % len + 1; }
        return index;
    }

    /**
     * 获取客户端ip地址
     * @param ctx 
     */
    static getClientIp(ctx) {
        var ip = ctx.request.header['remoteip'] 
            ? ctx.request.header['remoteip'] 
            : ctx.request.header['x-forwarded-for'];
        return ip;
    }

    /**
     * 生成用户ID
     * @param {*} openId
     */
    static getUserId(openId) {
        return "weixin_" + openId;
    }

    /**
     * 根据ip查询所属区域
     * @param ip 
     */
    static ip2Long(ip:string) {
        if (!ip) {
            return 0;
        } else {
            let digits = ip.split(`.`);
            let temp:Array<number> = null;
            let invalid:boolean = true;
            if (digits.length == 4) {
                temp = [Number(digits[0]), Number(digits[1]), Number(digits[2]), Number(digits[3])];
                invalid = temp[0] <= 0 || temp[0] > 255 || temp[1] < 0 || temp[1] > 255 || temp[2] < 0 || temp[2] > 255 || temp[3] < 0 || temp[3] > 255;
            }
            if (!invalid) {
                temp[0] <<= 24;
                temp[1] <<= 16;
                temp[2] <<= 8;
                return (temp[0] | temp[1] | temp[2] | temp[3]) >>> 0;
            }
        }
    }
}

export { SysTool }