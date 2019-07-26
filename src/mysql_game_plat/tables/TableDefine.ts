import { Instance } from "sequelize";
import sequelize = require("sequelize");
import { TABLE_NAME } from "../../mysql_define/MySqlDefine";
import { defColumnOpts, defSyncOpts } from "../../database/mysqlDao/MySqlClient";

/**
 * mySql 数据表的名称
 */
export var tableName:string = "sys_test";

/**
 * 数据表格对应的字段
 */
export interface ITableAttrs {
    title?:string;
}

/**
 * sequelize define 之后操作的对象 的类型定义
 */
export interface ITableInstant extends Instance<ITableAttrs>,ITableAttrs {}

/**
 * mySql 中定义的字段类型
 */
export var column:sequelize.DefineAttributes = {
    title:{type:sequelize.STRING},
}

/**
 * Hook（也称为生命周期事件）是执行 sequelize 调用之前和之后调用的函数。 例如，如果要在保存模型之前始终设置值，可以添加一个 beforeUpdate hook。
 */
var hooks:sequelize.HooksDefineOptions<ITableInstant> = {}

/**定义 mysql表中相关的默认配置 */
export var opts:sequelize.DefineOptions<ITableInstant> = defColumnOpts;

export var sync_opt:sequelize.SyncOptions = defSyncOpts;