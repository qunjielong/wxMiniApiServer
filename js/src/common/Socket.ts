import EventEmitter from "./EventEmitter"
import {curry} from "./utils";
import {wxApiHost} from "./wxApis";

let host = wxApiHost

declare var wx: any;

export type Callback<T> = (data: T) => void
export type Pack = { eventId: string, name: string, ack?: boolean, data: any }
const tidUrl = curry((tid: string, url: string) => `${host}/api/tunnels/${tid}${url}`)

export default class Socket {
    public token: string = ""
    public emitter = new EventEmitter()
    public eventId = Math.floor(Math.random() * 100)
    public pendingEmitCallbacks = new Map<string, Callback<any>>()
    public failedCount = 0
    public isAlive: boolean = true

    constructor(public clientType: string) {
        if (this.clientType === "h5") {
            const cap = window.location.href.match(/h5token=([\w\-]+)/);
            if (cap) {
                this.token = cap[1]
            }
            host = ""
            console.log(this.token)
        }
    }

    public on<T = any>(event: string, callback: Callback<T>): void {
        console.log("listening...", event, "?")
        this.emitter.on(event, async (pack: Pack) => {
            console.log("catch...", event, pack)
            const ret = await callback(pack.data)
            if (ret === undefined) { return }
            console.log("Sending ack", pack, pack.eventId)
            this.send({
                name: pack.name,
                eventId: pack.eventId,
                ack: true,
                data: ret,
            })
        })
    }

    public emit<T = any>(event: string, data: any, callback?: Callback<T>) {
        const eventId = String(this.eventId++)
        if (callback) {
            this.pendingEmitCallbacks.set(eventId, callback)
        }
        console.log("Sending Event...", eventId)
        this.send({ name: event, eventId, data })
    }

    public async connect() {
        await this.getToken()
        this.reconnect()
        this.heartbeat()
    }

    public async send(pack: Pack) {
        await this.getToken();
        wx.request({
            url: tidUrl(this.token, `/to-${this.clientType === "h5" ? "mini" : "h5"}`),
            method: "POST",
            data: pack,
        })
    }

    public poll(): Promise<Pack[]> {
        return new Promise((resolve, reject) => {
            wx.request({
                url: tidUrl(this.token, `/long-pull/${this.clientType}`),
                method: "POST",
                success: (res: any) => {
                    console.log("===>", res.data)
                    resolve(res.data.data)
                },
                fail: (err: any) => {
                    reject(err)
                }
            })
        });
    }

    public getRemoteValue(key: string): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            wx.request({
                url: tidUrl(this.token, `/get-cache/${key}`),
                method: "POST",
                success: (res: any) => {
                    resolve(res.data.data)
                },
                fail: (err: any) => {
                    reject(err)
                }
            })
        })
    }

    public setRemoteValue(key: string, value: string): void {
        wx.request({
            url: tidUrl(this.token, `/set-cache/${key}`),
            method: "POST",
            data: value,
        })
    }

    public heartbeat(): void {
        const timer = setInterval(() => {
            if (!this.isAlive) {
                clearInterval(timer)
                return
            }
            wx.request({
                url: tidUrl(this.token, "/heart-beat"),
                method: "POST",
            })
        }, 3000)
    }

    private async reconnect() {
        try {
            const packs = await this.poll()
            console.log(packs)
            for (const ret of packs) {
                if (!ret.ack) {
                    console.log("Emitting...", ret, ret.name)
                    this.emitter.emit(ret.name, ret)
                } else {
                    console.log("receive ack", ret.eventId, ret)
                    const callback = this.pendingEmitCallbacks.get(ret.eventId)
                    if (callback) {
                        callback(ret.data)
                    }
                }
            }
            this.failedCount = 0
            this.reconnect()
        } catch (err) {
            console.log('Error ->', err, ' reconnect...')
            if (++this.failedCount <= 5) {
                this.isAlive = false
                this.reconnect()
            }
        }
    }

    private getToken(): Promise<string> {
        return new Promise((resolve, reject) => {
            if (this.clientType === "h5") {
                if (this.token) {
                    resolve(this.token)
                } else {
                    reject("外部没有传入 Token")
                }
                return
            }
            if (this.token) {
                resolve(this.token)
            } else {
                wx.request({
                    url: `${wxApiHost}/api/apply-token`,
                    method: "POST",
                    success: (res: { data: any }) => {
                        this.token = res.data.data
                        resolve(this.token)
                        wx.setStorageSync("h5-token", this.token)
                    },
                })
            }
        })
    }
}
