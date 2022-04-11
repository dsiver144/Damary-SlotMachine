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

    private spinStartTime: number = 0;
    
    protected onLoad(): void {
        BoardManager.inst = this;
    }

    initReels() {
        for (let reelIndex = 0; reelIndex < GameConfig.NUM_VISIBLE_REELS; reelIndex++) {
            const reelNode = cc.instantiate(this.reelPrefab);
            reelNode.parent = this.reelLayout.node;
            const reelComp = reelNode.getComponent(ReelHandler);
            reelComp.init(reelIndex);
            this.reels.push(reelComp);
        }
        this.reelLayout.updateLayout();
        
        cc.tween(this.reelLayout.node).to(0.25, {opacity: 255}).start();
    }

    onReceivedResponse() {
        const elapsedTime = Date.now() - this.spinStartTime;
        const onStopSpin = () => {
            this.currentBoardState = BoardState.STOP_SPIN;
        }
        if (elapsedTime >= GameConfig.STOP_DELAY_WHEN_RECIEVE_RESPONSE) {
            onStopSpin();
        } else {
            setTimeout(() => {
                onStopSpin();
            }, GameConfig.STOP_DELAY_WHEN_RECIEVE_RESPONSE - elapsedTime);
        }
    }

    spinReels() {
        this.spinStartTime = Date.now();
        this.currentBoardState = BoardState.START_SPIN;
    }

    areAllReelsSpinning() {
        return this.reels.every(reel => reel.isSpinning());
    }

    areAllReelsIdling() {
        return this.reels.every(reel => reel.isIdle());
    }

    updateBoardState() {
        switch(this.currentBoardState) {
            case BoardState.START_SPIN:
                this.reels.forEach(reelHandler => {
                    setTimeout(() => {
                        reelHandler.startSpin();
                    }, GameConfig.DELAY_TIME_ON_START[reelHandler.reelIndex] * 1000);
                });
                this.currentBoardState = BoardState.SPINNING;
                break;
            case BoardState.SPINNING:
                // Do stuff when spinning
                break;
            case BoardState.STOP_SPIN:
                if (this.areAllReelsSpinning()) {
                    this.reels.forEach(reelHandler => {
                        setTimeout(() => {
                            reelHandler.stopSpin();
                        }, GameConfig.DELAY_TIME_ON_STOP[reelHandler.reelIndex] * 1000);
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

}