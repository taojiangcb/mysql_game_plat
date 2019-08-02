import { Instance } from "sequelize";
import sequelize = require("sequelize");
import { TABLE_NAME } from "../../mysql_define/MySqlDefine";
import { defColumnOpts, defSyncOpts } from "../../database/mysqlDao/MySqlClient";

export var tableName:string = TABLE_NAME.sys_order;

export interface sys_order_attrs {
    order_id?:string;                   //订单id
    user_id?:string;                    //用户id
    plat_id?:string;                    //平台id
    game_id?:string;                    //游戏id
    money?:number;                      //支付的金额
    rechare?:number;                    //充值的点数
    shopDesc?:string;                   //购买时支付的商品信息
    params?:string;                     //下单时的穿透参数
    create_time?:number;                //下单的创建的时间
    pay_time?:number;                   //支付的时间
    deliver_release_time?:number;       //发货的时间
}

/*** sequelize define 之后操作的对象 的类型定义 */
export interface sys_order_table extends Instance<sys_order_attrs>,sys_order_attrs {}

export var column:sequelize.DefineAttributes = {
    order_id: { type: sequelize.STRING(32), primaryKey: true, allowNull: false },
    user_id: { type: sequelize.STRING(64), allowNull: false },
    plat_id: { type: sequelize.INTEGER(11), allowNull: false },
    game_id: { type: sequelize.INTEGER(11), allowNull: false },
    money: { type: sequelize.DECIMAL(10), defaultValue: 0 },
    rechare: { type: sequelize.DECIMAL(10), defaultValue: 0 },
    shopDesc: { type: sequelize.STRING(255) },
    params: { type: sequelize.STRING(255) },
    create_time: { type: sequelize.DATE, defaultValue: new Date(),get(){
        return new Date(this.getDataValue("create_time")).getTime();
    }},
    pay_time: { type: sequelize.DATE, defaultValue: new Date(),get(){
        return new Date(this.getDataValue("pay_time")).getTime();
    }},
    deliver_release_time: { type: sequelize.DATE, defaultValue: new Date(),get(){
        return new Date(this.getDataValue("deliver_release_time")).getTime();
    }},
}

export var opts:sequelize.DefineOptions<sys_order_table> = defColumnOpts;
export var sync_opt:sequelize.SyncOptions = defSyncOpts;