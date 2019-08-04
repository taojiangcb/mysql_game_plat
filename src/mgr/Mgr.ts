import { CacheMgr } from "./CacheMgr";
import { PlatMgr } from "./PlatMgr";
import { ProcessMgr } from "./ProcessMgr";

/**
 * 管理类初始化
 */
export function managerInit():void {
    cacheMgr = new CacheMgr();
    platMgr = new PlatMgr();
    childProcessMgr = new ProcessMgr();
}

export var cacheMgr:CacheMgr;
export var platMgr:PlatMgr;
export var childProcessMgr:ProcessMgr;