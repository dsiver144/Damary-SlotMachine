import { GameConfig } from "./GameConfig";
import ReelHandler from "./ReelHandler";
import SlotMachine from "./SlotMachine";

const { ccclass, property } = cc._decorator;

@ccclass("ReelConfig")
class ReelConfig {
    @property()
    delayTimeToSpin: number = 0;
}

enum BoardState {
    SPIN,
    SPINING,
    STOP,
    STOPPING,
    IDLE,
}

@ccclass
export default class BoardManager extends cc.Component {

    private static inst: BoardManager = null;
    public static getInstance() {
        return this.inst;
    }

    @property(cc.Layout)
    reelLayout: cc.Layout = null;

    @property(cc.Prefab)
    reelPrefab: cc.Prefab = null;

    @property([ReelConfig])
    reelConfig: ReelConfig[] = [];

    private reels: ReelHandler[] = [];
    private state: BoardState = BoardState.IDLE;
    
    private currentSpinData: string[] = [];

    protected onLoad(): void {
        BoardManager.inst = this;
    }

    initReels() {
        for (let i = 0; i < this.maxReels(); i++) {
            const reelNode = cc.instantiate(this.reelPrefab);
            reelNode.parent = this.reelLayout.node;
            const reelComp = reelNode.getComponent(ReelHandler);
            reelComp.delayToSpinTime = this.reelConfig[i].delayTimeToSpin;
            reelComp.setReelIndex(i);
            this.reels.push(reelComp);
        }
        this.reelLayout.updateLayout();
        
        cc.tween(this.reelLayout.node).to(0.25, {opacity: 255}).start();
    }

    maxReels() {
        return this.reelConfig.length;
    }

    spinReels() {
        console.log("Spin Reels");
        this.state = BoardState.SPIN;
    }

    stopReels(slotData: string[]) {
        console.log("Stop Reels");
        this.currentSpinData = slotData;
        this.state = BoardState.STOP;
    }

    isAllReelSpinning() {
        return this.reels.every(reel => reel.isFullySpinning());
    }

    update(dt: number): void {
        switch(this.state) {
            case BoardState.SPIN:
                this.reels.forEach(reelHandler => reelHandler.startSpin());
                this.state = BoardState.SPINING;
                break;
            case BoardState.SPINING:
                break;
            case BoardState.STOP:
                if (this.isAllReelSpinning()) {
                    this.reels.forEach(reelHandler => {
                        reelHandler.stop(this.getSymbolsForReel(this.currentSpinData, reelHandler.reelIndex));
                    });
                    this.state = BoardState.STOPPING;
                }
                break;
            case BoardState.STOPPING:
                if (this.reels.every(reel => reel.isReady())) {
                    this.state = BoardState.IDLE;
                    SlotMachine.getInstance().spinButton.interactable = true;
                }
                break;
            case BoardState.IDLE:
                break;
        }
    }

    getSymbolsForReel(spinData: string[], reelIndex: number) {
        const maxReels = this.maxReels();
        const symbols = [];
        for (var i = 0; i < 3; i++) {
            symbols.push(spinData[reelIndex + i * maxReels]);
        }
        symbols.push("Random");
        return symbols;
    }

    randomSymbol() {
        return GameConfig.AVAILABLE_SYMBOLS[Math.floor(Math.random() * GameConfig.AVAILABLE_SYMBOLS.length)];
    }

}