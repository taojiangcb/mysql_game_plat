import { CacheMgr } from "./CacheMgr";
import { PlatMgr } from "./PlatMgr";

/**
 * 管理类初始化
 */
export function managerInit():void {
    cacheMgr = new CacheMgr();
    platMgr = new PlatMgr();
}

export var cacheMgr:CacheMgr;
export var platMgr:PlatMgr;