export class CacheMgr {
    
    private cacheMap:Map<String,CacheItem>;

    constructor() {
        this.cacheMap = new Map<String,CacheItem>();
    }

    set(key:string,val:any,second?:number) {

        let second_time:number = second || 0;   
        let expire_time:number = second_time > 0 ? Date.now() + second_time * 1000 : 0;

        if(this.cacheMap.has(key)) {
            let cache = this.cacheMap.get(key);
            cache.data = val;
            cache.expires = expire_time;
        }
        else {
            let cache = new CacheItem(val,expire_time);
            this.cacheMap.set(key,cache);
        }
    }

    get(key) {
        let cacheItem = this.cacheMap.get(key);
        return cacheItem.data;
    }

    expires(key:string,second:number):void {

        let second_time:number = second || 0;   
        let expire_time:number = second_time > 0 ? Date.now() + second_time * 1000 : 0;

        if(this.cacheMap.has(key)) {
            let cache = this.cacheMap.get(key);
            cache.expires = expire_time;
        }
    }

    exists(key:string):boolean {
        return this.cacheMap.has(key);
    }

    /**
     * 是否过期了
     * @param key 
     */
    isExpired(key):boolean {
        if(this.cacheMap.has(key)) {
            let item = this.cacheMap.get(key);
            return this.isExpires(item);
        }
        return true;
    }

    delete(key:string) {
        if(this.cacheMap.has(key)) {
            this.cacheMap.delete(key);
        }
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
