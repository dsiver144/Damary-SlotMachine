import Server from "./Server";
import { GAME_EVENT } from "./GameConfig";

const { ccclass, property } = cc._decorator;

@ccclass
export default class GameManager extends cc.Component {

    @property(cc.Button)
    spinButton: cc.Button = null;

    private server: Server = new Server();
    start() {
        this.server.registerDataRespondEvent(this.onSpinFinishResponse.bind(this));
        cc.systemEvent.on(GAME_EVENT.READY, this.onReadyToSpin, this);
        cc.systemEvent.on(GAME_EVENT.FINISH, this.onSpinAnimationFinish, this);
    }

    onSpinFinishResponse(spinData: string[]) {
        cc.systemEvent.emit(GAME_EVENT.STOP, spinData);
    }

    onReadyToSpin() {
        this.spinButton.interactable = true;
    }

    onSpinButton() {
        if (!this.spinButton.interactable) return;
        this.spinButton.interactable = false;
        this.server.requestSpinData();
        cc.systemEvent.emit(GAME_EVENT.SPIN);
    }

    onSpinAnimationFinish() {
        this.spinButton.interactable = true;
    }

}
