import { GAME_EVENT } from "./GameManager";
import ReelManager from "./ReelManager";
import Symbol from "./Symbol";

const {ccclass, property} = cc._decorator;

class SymbolNode extends cc.Node {
    public stopping: boolean = false;
    public symbolComp: Symbol = null;
}

@ccclass
export default class Reel extends cc.Component {

    public static completedNumber: number = 0;

    readonly MAX_SPEED: number = 45;
    readonly MAX_ROWS: number = 3;

    readonly SPIN_SPEED_INCREASE_STEP: number = 60;
    // Take x amount of seconds to finish the stop animation.
    readonly STOP_ANIMATION_DURATION: number = 0.3; 

    @property(cc.Prefab)
    symbolPrefab: cc.Prefab = null;

    @property()
    delayToSpinTime: number = 0.25;

    private reelIndex: number = 0;

    private delayToSpinCount: number = 0;
    
    private spinSpeed: number = 0;
    // Duration for reel to spin up a bit before spin down at the beginning.
    private backSpinDuration: number = 0.25;
    private backSpinCount: number = 0;

    private symbols: cc.Node[] = [];
    private originalYPosition: number[] = [];

    private tailSymbol: cc.Node = null;

    private isSpinning: boolean = false;
    private isStopping: boolean = false;

    private symbolStopCount: number = 0;

    private stopDelayDuration: number = 2;
    private delayToStopCount: number = 0;

    private stopBufferBetweenReelCount: number = 0;

    start () {
        // Create symbol and attach it to the reel.
        for (var i = 0; i < this.MAX_ROWS + 1; i++) {
            const symbol = cc.instantiate(this.symbolPrefab) as SymbolNode;
            symbol.x = 0;
            symbol.stopping = false;
            symbol.symbolComp = symbol.getComponent(Symbol);
            symbol.y = -symbol.height / 2 - i * symbol.height;
            symbol.parent = this.node;
            symbol.symbolComp.setRandomSymbol(false);
            this.symbols.push(symbol);
            // Save the original position for stop animation.
            this.originalYPosition.push(symbol.y);
        }
        this.node.height = this.symbols[0].height * this.MAX_ROWS;
        this.tailSymbol = this.symbols[0];
    }

    setReelIndex(index) {
        this.reelIndex = index;
    }

    public isBusy() {
        return this.isSpinning || this.isStopping;
    }

    startSpin() {
        this.spinSpeed = 0;
        this.backSpinCount = this.backSpinDuration;
        this.delayToSpinCount = this.delayToSpinTime;
        this.delayToStopCount = this.stopDelayDuration;

        this.isSpinning = true;
    }
    
    private targetSymbols: string[] = null;
    stop(spinData: string[]) {
        this.isStopping = true;
        this.symbolStopCount = this.MAX_ROWS + 1;
        this.stopBufferBetweenReelCount = this.delayToSpinTime;

        const maxReels = ReelManager.getInstance().maxReels();
        this.targetSymbols = [];
        for (var i = 0; i < 3; i++) {
            this.targetSymbols.push(spinData[this.reelIndex + i * maxReels]);
        }
        this.targetSymbols.push("Random");
    }

    protected update(dt: number): void {
        if (!this.isSpinning) return;
        this.symbols.forEach((symbol: SymbolNode) => {
            // This is for delaying the start between each reel.
            if (this.delayToSpinCount > 0) {
                this.delayToSpinCount -= dt;
                return;
            }
            // Wait at least stopDelayDuration (2s) before change to stop phase
            // no matter how fast you receive the message from server.
            if (this.delayToStopCount > 0) {
                this.delayToStopCount -= dt;
            }
            if (this.stopBufferBetweenReelCount > 0) {
                this.stopBufferBetweenReelCount -= dt;
            }
            if (!symbol.stopping) {
                // Show blur sprite when spinning.
                if (!symbol.symbolComp.getBlur()) {
                    symbol.symbolComp.setBlur(true);
                }
                if (this.backSpinCount > 0) {
                    this.backSpinCount -= dt;
                }
                symbol.y -= this.backSpinCount >= 0 ? -this.spinSpeed : this.spinSpeed;
            }
            // Slowly ncrease reel speed 
            this.spinSpeed += this.SPIN_SPEED_INCREASE_STEP * dt;
            if (this.spinSpeed >= this.MAX_SPEED) this.spinSpeed = this.MAX_SPEED;
            if (!symbol.stopping && symbol.y <= -this.node.height - symbol.height / 2) {
                // If the symbol pass the below limit then reset it on top on tail node & set tail node to this symbol.
                symbol.y = this.tailSymbol.y + symbol.height;
                this.tailSymbol = symbol;
                if (this.isStopping && this.delayToStopCount <= 0 && this.stopBufferBetweenReelCount <= 0) {
                    symbol.stopping = true;
                    symbol.symbolComp.setSymbol(this.targetSymbols.pop());
                    symbol.symbolComp.setBlur(false);
                    // When recieve stop signal then move the symbol to its final position
                    // Wait until the symbol reach the bottom then tween it to correct position after x amount of seconds.
                    const targetYPosition = this.originalYPosition[this.symbolStopCount - 1];
                    cc.tween(symbol).to(this.STOP_ANIMATION_DURATION, {y: targetYPosition}, {easing: 'backOut'})
                        .call(() => {
                            if (this.isStopping) {
                                // Reset back to normal state & send finish event.
                                this.isStopping = false;
                                this.isSpinning = false;
                                // Call on spin animation complete when all reel is completely stop.
                                Reel.completedNumber += 1;
                                if (Reel.completedNumber == ReelManager.getInstance().maxReels()) {
                                    cc.systemEvent.emit(GAME_EVENT.FINISH);
                                }
                            }
                            symbol.stopping = false;
                        }
                    ).start();
                    this.symbolStopCount -= 1;
                }
            }
        })
    }

}
