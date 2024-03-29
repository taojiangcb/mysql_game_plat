import sequelize = require("sequelize");
import { MySqlClient } from "./MySqlClient";
import { connect } from "tls";
import { Log } from "../../log/Log";

class MySqlDBMgr {

    /**
     * 连接的配置管理
     */
    private configs:{[key:string]:sequelize.Options} = {};

    /**
     *  连接的客户端管理
     */
    private clients:{[key:string]:MySqlClient} = {};
    
    constructor(){}

    async createMySql(connectCfg:sequelize.Options) {
        var mySqlClient:MySqlClient = new MySqlClient();
        try {
            await mySqlClient.connection(connectCfg);
        } 
        catch(e) {
            var msg:string = `mySql 链接失败:${connectCfg.host}:${connectCfg.port}`; 
            Log.errorLog(msg);
            throw new Error(msg);
        }

        this.configs[connectCfg.host] = connectCfg;
        this.clients[connectCfg.host] = mySqlClient;
        return mySqlClient;
    }

    async getMySqlClient(host:string){
        return this.clients[host] || null;
    }
}

export var mySqlMgr = new MySqlDBMgr();