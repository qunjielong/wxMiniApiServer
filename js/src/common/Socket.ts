import EventEmitter from "./EventEmitter"
import {curry} from "./utils";
import {wxApiHost} from "./wxApis";

declare var wx: any;

export type Callback<T> = (data: T) => void
export type Pack = { eventId: string, name: string, ack?: boolean, data: any }
const tidUrl = curry((tid: string, url: string) => `${wxApiHost}/api/${tid}${url}`)

export default class Socket {
    public token: string = "";
    public emitter = new EventEmitter();
    public eventId = Math.floor(Math.random() * 100)
    public pendingEmitCallbacks = new Map<string, Callback<any>>()

    constructor(public clientType: string) {
    }

    public on<T = any>(event: string, callback: Callback<T>): void {
        this.emitter.on(event, async (pack: Pack) => {
            const ret = await callback(pack.data)
            if (ret === undefined) { return }
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
        this.send({ name: event, eventId, data })
    }

    public async connect() {
        this.reconnect()
        this.heartbeat()
    }

    public async send(pack: Pack) {
        await this.getToken();
        wx.request({
            url: tidUrl(this.token, `/to-${this.clientType}`),
            method: "POST",
            data: pack,
        })
    }

    public poll(): Promise<Pack[]> {
        return new Promise((resolve, reject) => {
            wx.request({
                url: tidUrl(this.token, `/longpull/${this.clientType}`),
                success: (data: any) => {
                    resolve(data.data)
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
                success: (data: any) => {
                    resolve(data.data)
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
        setInterval(() => {
            wx.request({
                url: tidUrl(this.token, "/heart-beat"),
                method: "POST",
            })
        }, 3000)
    }

    private async reconnect() {
        try {
            const packs = await this.poll()
            for (const ret of packs) {
                if (!ret.ack) {
                    this.emitter.emit(ret.name, ret.data)
                } else {
                    const callback = this.pendingEmitCallbacks.get(ret.eventId)
                    if (callback) {
                        callback(ret.data)
                    }
                }
            }
        } catch (err) {
            console.log('Error ->', err, ' reconnect...')
            this.reconnect()
        }
    }

    private getToken(): Promise<string> {
        return new Promise((resolve, reject) => {
            if (this.token) {
                resolve(this.token)
            } else {
                wx.request({
                    url: tidUrl(this.token, `/apply-token`),
                    method: "POST",
                    success: (data: { data: string }) => {
                        this.token = data.data
                        resolve(this.token)
                    },
                })
            }
        })
    }
}
