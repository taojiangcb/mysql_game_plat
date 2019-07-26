import { Instance } from "sequelize";
import sequelize = require("sequelize");
import { TABLE_NAME } from "../../mysql_define/MySqlDefine";
import { defColumnOpts, defSyncOpts } from "../../database/mysqlDao/MySqlClient";


export var tableName:string = TABLE_NAME.sys_ios_app;

export interface iSys_ios_app_attrs {
    app_id?:string;
    app_name?:string;
    secret?:string;
    mch_id?:string;
    sign_key?:string;
    app_index?:number;
    state?:number;
    create_time?:number;
}

/*** sequelize define 之后操作的对象 的类型定义 */
export interface iSys_ios_app_table extends Instance<iSys_ios_app_attrs>,iSys_ios_app_attrs {}

export var column:sequelize.DefineAttributes = {
    app_id:{type:sequelize.STRING(50),primaryKey:true,allowNull:false},
    app_name:{type:sequelize.STRING(50)},
    secret:{type:sequelize.STRING(50)},
    mch_id:{type:sequelize.STRING(50)},
    sign_key:{type:sequelize.STRING(50)},
    app_index:{type:sequelize.TINYINT(2)},
    state:{type:sequelize.TINYINT(2)},
    create_time:{type:sequelize.DATE,get(){
        return new Date(this.getDataValue("create_time").getTime());
    }},
}

export var opts:sequelize.DefineOptions<iSys_ios_app_table> = defColumnOpts;
export var sync_opt:sequelize.SyncOptions = defSyncOpts;