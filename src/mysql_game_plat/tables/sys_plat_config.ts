import { Instance } from "sequelize";
import sequelize = require("sequelize");
import { TABLE_NAME } from "../../mysql_define/MySqlDefine";
import { defColumnOpts, defSyncOpts } from "../../database/mysqlDao/MySqlClient";

export var tableName: string = TABLE_NAME.sys_plat_config;
export interface ISysPlatConfigDAOAtt {
    id?: number;
    plat_id?: number;                   //平台名称
    game_id?: number;                   //游戏id
    game_name?: string;                 //游戏的名字
    config?: string;                    //发到客户端的配置
    server_config?: string;             //服务端的配置
    power?: number;                  //充值比率计费点         
    openPresent?: number;               //赠送的限额
    status?: number;                    //状态：{1：开启，0：关闭}
    mode?:number;                       //当前模式{0：测试，1：审核，2：已发布}
    create_time?: number;               //创建时间
    modify_time?: number;               //修改时间
}

export interface ISysPlatConfigDAO extends sequelize.Instance<ISysPlatConfigDAOAtt>, ISysPlatConfigDAOAtt { }
export var column: sequelize.DefineAttributes = {
    id: { type: sequelize.INTEGER, primaryKey: true, allowNull: false, autoIncrement: true },
    plat_id: { type: sequelize.SMALLINT(6) },
    game_id: { type: sequelize.SMALLINT(6) },
    game_name: { type: sequelize.STRING(20) },
    config: { type: sequelize.STRING(1000) },
    server_config: { type: sequelize.STRING(1000) },
    power: { type: sequelize.INTEGER(6) },
    openPresent: { type: sequelize.INTEGER(6) },
    status: { type: sequelize.INTEGER(1) },
    create_time: {
        type: sequelize.DATE, defaultValue: new Date(), get() {
            return new Date(this.getDataValue("create_time")).getTime()
        }
    },
    modify_time: {
        type: sequelize.DATE, defaultValue: new Date(), get() {
            return new Date(this.getDataValue("modify_time")).getTime()
        }
    },
    mode: { type: sequelize.TINYINT(1), defaultValue: 1 }
}

export var opts: sequelize.DefineOptions<ISysPlatConfigDAO> = defColumnOpts;
export var sync_opt: sequelize.SyncOptions = defSyncOpts;