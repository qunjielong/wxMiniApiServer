import EventEmitter from "./EventEmitter"

export type Callback<T> = (data: T) => void
export type Pack = { eventId: string, name: string, ack?: boolean, data: any }

export default abstract class Socket {
    public emitter = new EventEmitter();
    public eventId = Math.floor(Math.random() * 100)
    public pendingEmitCallbacks = new Map<string, Callback<any>>()

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

    public async emit<T = any>(event: string, data: any, callback?: Callback<T>) {
        const eventId = String(this.eventId++)
        if (callback) {
            this.pendingEmitCallbacks.set(eventId, callback)
        }
        return this.send({ name: event, eventId, data })
    }

    public async connect() {
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
            this.connect()
        }
    }

    public abstract send(pack: Pack, callback?: Callback<any>): void
    public abstract poll(): Promise<Pack[]>
}
