export class CacheMgr {
    
    private cacheMap:Map<String,CacheItem>;

    constructor() {
        this.cacheMap = new Map<String,CacheItem>();
    }

    set(key:string,val:any,second?:number) {
        if(this.cacheMap.has(key)) {
            let cache = this.cacheMap.get(key);
            cache.data = val;
        }
        else {
            let cache = new CacheItem(val,Date.now() + second * 1000);
            this.cacheMap.set(key,cache);
        }
    }

    get(key) {
        return this.exists(key) 
            ? this.cacheMap.get(key).data 
            : null;
    }

    expires(key:string,second:number):void {
        if(this.cacheMap.has(key)) {
            let cache = this.cacheMap.get(key);
            cache.expires = Date.now() + second * 1000;
        }
    }

    exists(key:string):boolean {
        if(this.cacheMap.has(key)) {
            let item = this.cacheMap.get(key);
            if(item) {
                if(item.expires === 0) return true;
                if(Date.now() < item.expires) return true;
                this.cacheMap.delete(key);
                return false;
            }
        }
        return false;
    }

    sizeAndClear():number {
        let del:string[] = [];
        this.cacheMap.forEach((cacheItem,key:string)=>{
            if(this.isExpires(cacheItem)) del.push(key);
        })
        let len = del.length;
        while(--len && len > -1) {
            this.cacheMap.delete(del[len]);
        }
        return this.cacheMap.size;
    }

    private isExpires(item:CacheItem):boolean {
        if(item) {
            if(item.expires === 0) return false;
            if(Date.now() < item.expires) return false;
            return true;
        }
    }
}

class CacheItem {
    data:any;
    expires:number;
    constructor(data?:any,expires?:number) {
        this.data = data;
        this.expires = expires || 0;
    }
}
