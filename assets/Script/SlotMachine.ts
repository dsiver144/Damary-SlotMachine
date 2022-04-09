import BoardManager from "./BoardManager";
import { GameConfig } from "./GameConfig";
import { ResourceManager } from "./ResourceManager";
import Server from "./Server";

const { ccclass, property } = cc._decorator;

@ccclass
export default class SlotMachine extends cc.Component {

    private static inst: SlotMachine = null;
    public static getInstance() {
        return this.inst;
    }

    @property(cc.Node)
    loadingNode: cc.Node = null;

    @property(cc.Button)
    spinButton: cc.Button = null;

    private startTime: number = 0;
    private server: Server = new Server();
    
    protected onLoad(): void {
        SlotMachine.inst = this;
        this.server.registerDataRespondEvent(this.onSpinFinishResponse.bind(this));
        // Wait for asset bundle to load before showing the reels.
        ResourceManager.loadSymbolAssetBundle().then(() => {
            BoardManager.getInstance().initReels();

            this.loadingNode.active = false;
            this.spinButton.interactable = true;
        })
    }

    onSpin() {
        this.startTime = Date.now();
        this.server.requestSpinData();
        BoardManager.getInstance().spinReels();
        this.spinButton.interactable = false;
    }

    onSpinFinishResponse(spinData: string[]) {
        const delay = Date.now() - this.startTime;
        const onStopReels = () => {
            BoardManager.getInstance().stopReels(spinData);
        }
        if (delay >= GameConfig.DELAY_TIME) {
            onStopReels();
        } else {
            setTimeout(() => {
                onStopReels();
            }, GameConfig.DELAY_TIME - delay);
        }
    }


}
