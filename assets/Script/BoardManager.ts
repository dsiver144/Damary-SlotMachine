import { GameConfig } from "./GameConfig";
import ReelHandler from "./ReelHandler";
import { BoardIdleState } from "./States/BoardStates/BoardIdleState";
import { BoardStartSpinState } from "./States/BoardStates/BoardStartSpinState";
import { BoardStopState } from "./States/BoardStates/BoardStartStopState";
import { FSM } from "./States/FSM";

const { ccclass, property } = cc._decorator;
@ccclass
export default class BoardManager extends FSM {

    private static inst: BoardManager = null;
    public static getInstance() {
        return this.inst;
    }

    @property(cc.Layout)
    reelLayout: cc.Layout = null;

    @property(cc.Prefab)
    reelPrefab: cc.Prefab = null;

    private _reels: ReelHandler[] = [];
    public get reels(): ReelHandler[] {
        return this._reels;
    }
    public set reels(value: ReelHandler[]) {
        this._reels = value;
    }

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
        cc.tween(this.reelLayout.node).to(0.25, { opacity: 255 }).start();

        this.setState(new BoardIdleState(this));
    }

    onReceivedResponse() {
        const elapsedTime = Date.now() - this.spinStartTime;
        const onStopSpin = () => {
            this.setState(new BoardStopState(this));
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
        this.setState(new BoardStartSpinState(this));
    }

    areAllReelsSpinning() {
        return this.reels.every(reel => reel.isSpinning());
    }

    areAllReelsIdling() {
        return this.reels.every(reel => reel.isIdle());
    }

}