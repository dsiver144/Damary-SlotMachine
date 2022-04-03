import ReelManager from "./ReelManager";
import Server from "./Server";

const { ccclass, property } = cc._decorator;

@ccclass
export default class GameManager extends cc.Component {

    private server: Server = new Server();
    start() {
        this.server.registerDataRespondEvent(this.onSpinFinishResponse.bind(this));
    }

    onSpinFinishResponse(spinData) {
        console.log({ spinData });
        cc.systemEvent.emit("Finish", spinData);
    }

    onSpinButton() {
        if (ReelManager.getInstance().isBusy()) return;
        cc.systemEvent.emit("Spin");
        this.server.requestSpinData();
    }
}
