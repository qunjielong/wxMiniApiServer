
export default class EventEmitter {
    public listeners: any = {}

    addListener(eventName: string, fn: Function) {
        this.listeners[eventName] = this.listeners[eventName] || [];
        this.listeners[eventName].push(fn);
        return this;
    }

    on(eventName: string, fn: Function) {
        return this.addListener(eventName, fn);
    }

    once(eventName: string, fn: Function) {
        this.listeners[eventName] = this.listeners[eventName] || [];
        const onceWrapper = () => {
            fn();
            this.off(eventName, onceWrapper);
        }
        this.listeners[eventName].push(onceWrapper);
        return this;
    }

    off(eventName: string, fn: Function) {
        return this.removeListener(eventName, fn);
    }

    removeListener (eventName: string, fn: Function) {
        let lis = this.listeners[eventName];
        if (!lis) return this;
        for(let i = lis.length; i > 0; i--) {
            if (lis[i] === fn) {
                lis.splice(i,1);
                break;
            }
        }
        return this;
    }

    emit(eventName: string, ...args: any[]) {
        let fns = this.listeners[eventName];
        if (!fns) return false;
        fns.forEach((f: Function) => {
            f(...args);
        });
        return true;
    }

    listenerCount(eventName: string) {
        let fns = this.listeners[eventName] || [];
        return fns.length;
    }

    rawListeners(eventName: string) {
        return this.listeners[eventName];
    }
}