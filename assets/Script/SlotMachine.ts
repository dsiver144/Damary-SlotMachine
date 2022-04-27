import BoardManager from "./BoardManager";
import { ResourceManager } from "./ResourceManager";
import Server from "./Server/Server";

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

    private server: Server = new Server();

    public currentSpinInfo: string[] = [];
    
    protected onLoad(): void {
        SlotMachine.inst = this;
        this.server.registerDataRespondEvent(this.onReceivedResponse.bind(this));
        // Wait for asset bundle to load before showing the reels.
        ResourceManager.loadSymbolAssetBundle().then(() => {
            BoardManager.getInstance().initReels();

            this.loadingNode.active = false;
            this.spinButton.interactable = true;
        })
    }

    onSpin() {
        this.server.requestSpinData();
        BoardManager.getInstance().spinReels();
        this.spinButton.interactable = false;
    }

    onReceivedResponse(spinInfo: string[]) {
        this.currentSpinInfo = spinInfo;
        BoardManager.getInstance().onReceivedResponse();
    }

}
