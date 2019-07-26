import { Instance } from "sequelize";
import sequelize = require("sequelize");
import { TABLE_NAME } from "../../mysql_define/MySqlDefine";
import { defColumnOpts, defSyncOpts } from "../../database/mysqlDao/MySqlClient";

export var tableName:string = TABLE_NAME.sys_promotion;

export interface ISysPromotionAttr {
    id?: number,
    game_id?: number,
    plat_id?: number,
    url?:string,
    name?: string,
    icon?:string,
    rate?: number,
    index?:number,
    banner?:string,
    appId?: number,
    button?: string,
    channels?: string,
    games?: string,
    showtype?: number,
    page?: string
}

export interface ISysPromotion extends Instance<ISysPromotionAttr>, ISysPromotionAttr { }

export var column:sequelize.DefineAttributes = {
    id:{type:sequelize.INTEGER(6),primaryKey:true},
    game_id:{type:sequelize.INTEGER},
    plat_id: {type:sequelize.INTEGER},
    name: {type:sequelize.STRING(20)},
    rate: {type:sequelize.INTEGER},
    appId: {type:sequelize.STRING(50)},
    button: {type:sequelize.STRING(200)},
    channels: {type:sequelize.STRING(200)},
    games: {type:sequelize.STRING(50)},
    showtype: {type:sequelize.INTEGER},
    page: {type:sequelize.STRING(100)},
}

export var opts:sequelize.DefineOptions<ISysPromotion> = defColumnOpts;
export var sync_opt:sequelize.SyncOptions = defSyncOpts;