import Reel from "./Reel";
import Server from "./Server";

const { ccclass, property } = cc._decorator;

@ccclass
export default class ReelManager extends cc.Component {

    private static inst: ReelManager = null;
    public static getInstance() {
        return this.inst;
    }

    @property([Reel])
    reels: Reel[] = [];
    
    protected onLoad(): void {
        ReelManager.inst = this;
    }

    start() {

    }

    isBusy() {
        return this.reels.some(r => r.isBusy());
    }


}
