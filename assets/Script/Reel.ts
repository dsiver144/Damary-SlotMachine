import { MAX_REEL_SPEED, MAX_ROWS_PER_REEL, SPIN_SPEED_INCREASE_STEP, STOP_ANIMATION_DURATION, TARGET_FPS } from "./GameConfig";
import Symbol from "./Symbol";

const { ccclass, property } = cc._decorator;

class SymbolNode extends cc.Node {
    public stopping: boolean = false;
    public symbolComp: Symbol = null;
}

@ccclass
export default class Reel extends cc.Component {

    reelIndex: number = 0;

    @property(cc.Prefab)
    symbolPrefab: cc.Prefab = null;

    delayToSpinTime: number = 0;
    private delayToSpinCount: number = 0;
    private spinSpeed: number = 0;
    // Duration for reel to spin up a bit before spin down at the beginning.

    private symbols: cc.Node[] = [];
    private originalYPosition: number[] = [];
    private tailSymbol: cc.Node = null;

    private isSpinning: boolean = false;
    private isStopping: boolean = false;

    private symbolStopCount: number = 0;
    private stopBufferBetweenReelCount: number = 0;

    private finalSymbols: string[] = null;

    start() {
        // Create symbol and attach it to the reel.
        for (var i = 0; i < MAX_ROWS_PER_REEL + 1; i++) {
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
        this.node.height = this.symbols[0].height * MAX_ROWS_PER_REEL;
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
        this.delayToSpinCount = this.delayToSpinTime;

        this.isSpinning = true;
    }

    stop(finalSymbols: string[]) {
        this.isStopping = true;

        this.symbolStopCount = MAX_ROWS_PER_REEL + 1;
        this.stopBufferBetweenReelCount = this.delayToSpinTime;

        this.finalSymbols = finalSymbols;
    }

    protected update(dt: number): void {
        if (!this.isSpinning) return;
        this.symbols.forEach((symbol: SymbolNode) => {
            // This is for delaying the start between each reel.
            if (!this.isStopping && this.delayToSpinCount > 0) {
                this.delayToSpinCount -= dt;
                return;
            }
            if (this.stopBufferBetweenReelCount > 0) {
                this.stopBufferBetweenReelCount -= dt;
            }
            if (!symbol.stopping) {
                // Show blur sprite when spinning.
                if (!symbol.symbolComp.getBlur()) {
                    symbol.symbolComp.setBlur(true);
                }
                symbol.y -= this.spinSpeed * dt * TARGET_FPS;
            }
            // Slowly ncrease reel speed 
            this.spinSpeed += SPIN_SPEED_INCREASE_STEP * dt * TARGET_FPS;
            if (this.spinSpeed >= MAX_REEL_SPEED) this.spinSpeed = MAX_REEL_SPEED;
            if (!symbol.stopping && symbol.y <= -this.node.height - symbol.height / 2) {
                // If the symbol pass the below limit then reset it on top on tail node & set tail node to this symbol.
                symbol.y = this.tailSymbol.y + symbol.height;
                this.tailSymbol = symbol;
                // When recieve stop signal then set correct symbol, unblur the symbol and move the symbol to its final position
                // Wait until the symbol reach the bottom then tween it to correct position after x amount of seconds.
                if (this.isStopping && this.stopBufferBetweenReelCount <= 0 && !symbol.stopping) {
                    symbol.stopping = true;
                    symbol.symbolComp.setSymbol(this.finalSymbols.pop());
                    symbol.symbolComp.setBlur(false);

                    let targetYPosition = this.originalYPosition[this.symbolStopCount - 1];
                    if (this.symbolStopCount === MAX_ROWS_PER_REEL + 1) {
                        // If this is the first symbol to reach the bottom when get the stop signal then
                        // tween it on top of the highest symbol of the reel.
                        targetYPosition = this.originalYPosition[0] + symbol.height;
                        symbol.y = targetYPosition + symbol.height;
                    }
                    cc.tween(symbol).to(STOP_ANIMATION_DURATION, { y: targetYPosition }, { easing: 'backOut' })
                        .call(() => {
                            if (this.isStopping) {
                                this.isStopping = false;
                                this.isSpinning = false;
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
