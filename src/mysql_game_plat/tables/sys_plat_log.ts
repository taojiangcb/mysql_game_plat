import { Instance } from "sequelize";
import sequelize = require("sequelize");
import { TABLE_NAME } from "../../mysql_define/MySqlDefine";
import { defColumnOpts, defSyncOpts } from "../../database/mysqlDao/MySqlClient";

export var tableName:string = TABLE_NAME.sys_plat_log
export interface iSys_plat_log_atts {
    id?:number;
    identity?:string;
    log?:string;
    create_time?:number;
}

export interface iSys_plat_log_table extends Instance<iSys_plat_log_atts>,iSys_plat_log_atts {}
export var column:sequelize.DefineAttributes = {
    id:{type:sequelize.INTEGER(11),primaryKey:true},
    identity:{type:sequelize.STRING(60),allowNull:true},
    log:{type:sequelize.TEXT,allowNull:true},
    createTime:{type:sequelize.DATE,get(){
        return new Date(this.getDataValue("createTime")).getTime();
    }},
}

export var opts:sequelize.DefineOptions<iSys_plat_log_table> = defColumnOpts;
export var sync_opt:sequelize.SyncOptions = defSyncOpts;