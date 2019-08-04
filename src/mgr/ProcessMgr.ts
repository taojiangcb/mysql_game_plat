import cp = require("child_process");
import { Define } from "../config/Define";
import { Log } from "../log/Log";
import path = require("path");


type child_opts = {
    auto_restart:boolean,                           //是否自动重启    
    receive_mess_call:(message:string)=>void        //收到消息时的回调处理
}

interface ref_childProcess extends cp.ChildProcess {
    callRef?:number,     //被send 的次数引用
    jsName?:string,      //fork 的 js文件名称
    isBad?:boolean,      //child_process 是否出错了。
}

export class ProcessMgr {
    
    /** */
    private process_map:Map<string,cp.ChildProcess[]>;

    private child_opts_map:Map<string,child_opts>;

    constructor(){
        this.process_map = new Map();
        this.child_opts_map = new Map();
    }

    fork(jsPath:string,child_opts:child_opts,args?:string[],forkOpts?:cp.ForkOptions) {

        let pase_dir = path.parse(jsPath);
        let worker_name:string = pase_dir.name;

        var ref_child_process:ref_childProcess = cp.fork(jsPath,args,forkOpts);   
        ref_child_process.callRef = 0;
        ref_child_process.jsName = worker_name;
        ref_child_process.isBad = false;

        this.child_opts_map.set(worker_name,child_opts);

        if(this.process_map.has(worker_name)) {
            let workers = this.process_map.get(worker_name);
            workers.push(ref_child_process);
        }
        else {
            this.process_map.set(worker_name,[ref_child_process]);
        }

        Log.log(`fork child_process pid${ref_child_process.pid},jsName:${ref_child_process.jsName}`)
        this.listenerProcess(ref_child_process);
    }

    send(jsPath:string,message:string,callBack?:(err:Error)=>void) {
        let pase_dir = path.parse(jsPath);
        let worker_name:string = pase_dir.name;
        if(this.process_map.has(worker_name)) {
            let workers = this.process_map.get(worker_name);
            let min_ref_child = this.find_min_ref(workers);
            if(!min_ref_child.isBad && min_ref_child.connected) {
                min_ref_child.send(message,callBack);
            }
        }
    }

    /**
     * 杀掉进程 
     * @param jsPath 
     * @param count 如果count = 0 则杀掉相关的所有进程
     * @param signal //
     */
    kill(jsPath:string,count:number = 1,signal?:string) {
        let pase_dir = path.parse(jsPath);
        let worker_name:string = pase_dir.name;
        if(this.process_map.has(worker_name)) {
            let workers = this.process_map.get(worker_name);
            let len = count == 0 ? workers.length : Math.min(count,workers.length);
            for(var i = 0; i < len; i++) {
                workers[i].kill(signal);
            }
        }
    }

    killAll() {
        for(const [key,val] of this.process_map) {
            for(var i = 0; i < val.length;) {
                val[i].kill();
            }
        }
    }

    /**
     * 找出调用次数最少的进程
     * @param workers 
     */
    private find_min_ref(workers:ref_childProcess[]):ref_childProcess {
        if(workers && workers.length === 1) return workers[0];
        if(workers && workers.length > 1) {
            let ref_count:number = workers[0].callRef || 0;
            let min_ref_child = workers[0];
            let len = workers.length;
            for(let i = 1; i < len; i++) {
                let i_ref_count = workers[i].callRef || 0;
                if(i_ref_count < workers[i].callRef) {
                    min_ref_child = workers[i];
                    ref_count = i_ref_count;
                }
            }
            return min_ref_child;
        }
        return null;
    }

    private remove_child_process(ref:ref_childProcess){
        for(const [key,val] of this.process_map) {
            for(var i = 0; i < val.length;) {
                if(val[i] == ref) val.splice(i,1);
            }
        }
    }

    listenerProcess(ref_childProcess:ref_childProcess):void {
        ref_childProcess.on("error",err=>{
            Log.errorLog(err.message);
            Log.errorLog(err.stack);
            ref_childProcess.isBad = true;

            Log.errorLog(`child_process is bad pid:${ref_childProcess.pid},jsName:${ref_childProcess.jsName}`);

            let opts = this.child_opts_map.get(ref_childProcess.jsName);
            if(opts.auto_restart) {
                ref_childProcess.unref();
                ref_childProcess.ref();
            }
        })
    
        ref_childProcess.on("exit",(code,signal)=>{
            Log.log(`exit code:${code},signal:${signal}`);
            this.remove_child_process(ref_childProcess);
        })

        ref_childProcess.on("disconnect",()=>{
            Log.log(`disconnect pid:${ref_childProcess.pid} jsName:${ref_childProcess.jsName}`);
        })
    
        ref_childProcess.on("close",(code,signal)=>{
            Log.log(`close code:${code},signal:${signal}`);
        })
    
        ref_childProcess.on("message",(message,server)=>{
            let opts = this.child_opts_map.get(ref_childProcess.jsName);
            if(opts) {
                opts.receive_mess_call && opts.receive_mess_call(message);
            }
        })
    }
}