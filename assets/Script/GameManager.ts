import Reel from "./Reel";
import Server from "./Server";

const { ccclass, property } = cc._decorator;


export enum GAME_EVENT {
    SPIN = 'Spin',
    STOP = 'Stop',
    FINISH = 'Finish'
}

@ccclass
export default class GameManager extends cc.Component {

    private static inst: GameManager = null;
    public static getInstance() {
        return this.inst;
    }

    @property(cc.Button)
    spinButton: cc.Button = null;

    protected onLoad(): void {
        GameManager.inst = this;
    }

    private server: Server = new Server();
    start() {
        this.server.registerDataRespondEvent(this.onSpinFinishResponse.bind(this));
        cc.systemEvent.on(GAME_EVENT.FINISH, this.onSpinAnimationFinish, this);
    }

    onSpinFinishResponse(spinData: string[]) {
        cc.systemEvent.emit(GAME_EVENT.STOP, spinData);
    }

    onSpinButton() {
        if (!this.spinButton.interactable) return;
        this.spinButton.interactable = false;
        this.server.requestSpinData();
        Reel.completedNumber = 0;
        cc.systemEvent.emit(GAME_EVENT.SPIN);
    }

    onSpinAnimationFinish() {
        this.spinButton.interactable = true;
    }

}
