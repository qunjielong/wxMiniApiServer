import Socket, {Pack} from "../common/Socket"

export default class MiniSocket extends Socket {
    public send(pack: Pack): void {
        // TODO
    }

    poll(): Promise<Pack[]> {
        // TODO
        return new Promise(() => {});
    }
}
