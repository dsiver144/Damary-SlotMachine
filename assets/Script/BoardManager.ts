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
    START_SPIN,
    SPINNING,
    STOP_SPIN,
    STOPPING,
    STOPPED,
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

    private reels: ReelHandler[] = [];
    private currentBoardState: BoardState = BoardState.IDLE;
    
    protected onLoad(): void {
        BoardManager.inst = this;
    }

    initReels() {
        for (let reelIndex = 0; reelIndex < this.maxReels(); reelIndex++) {
            const reelNode = cc.instantiate(this.reelPrefab);
            reelNode.parent = this.reelLayout.node;
            const reelComp = reelNode.getComponent(ReelHandler);
            reelComp.init(reelIndex);
            this.reels.push(reelComp);
        }
        this.reelLayout.updateLayout();
        
        cc.tween(this.reelLayout.node).to(0.25, {opacity: 255}).start();
    }

    maxReels() {
        return GameConfig.NUM_VISIBLE_REELS;
    }

    spinReels() {
        console.log("Spin Reels");
        this.currentBoardState = BoardState.START_SPIN;
    }

    stopReels() {
        console.log("Stop Reels");
        this.currentBoardState = BoardState.STOP_SPIN;
    }

    areAllReelsFullySpinning() {
        return this.reels.every(reel => reel.isFullySpinning());
    }

    areAllReelsIdling() {
        return this.reels.every(reel => reel.isIdle());
    }

    updateBoardState() {
        switch(this.currentBoardState) {
            case BoardState.START_SPIN:
                this.reels.forEach(reelHandler => {
                    reelHandler.startSpin();
                });
                this.currentBoardState = BoardState.SPINNING;
                break;
            case BoardState.SPINNING:
                // Do stuff when spinning
                break;
            case BoardState.STOP_SPIN:
                if (this.areAllReelsFullySpinning()) {
                    this.reels.forEach(reelHandler => {
                        reelHandler.stopSpin();
                    });
                    this.currentBoardState = BoardState.STOPPING;
                }
                break;
            case BoardState.STOPPING:
                if (this.areAllReelsIdling()) {
                    this.currentBoardState = BoardState.STOPPED;
                }
                break;
            case BoardState.STOPPED:
                SlotMachine.getInstance().spinButton.interactable = true;
                this.currentBoardState = BoardState.IDLE;
                break;
            case BoardState.IDLE:
                // Do stuff when idling
                break;
        }
    }

    update(dt: number): void {
        this.updateBoardState();
    }

    randomSymbol() {
        return GameConfig.AVAILABLE_SYMBOLS[Math.floor(Math.random() * GameConfig.AVAILABLE_SYMBOLS.length)];
    }

}