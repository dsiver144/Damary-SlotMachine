
const {ccclass, property} = cc._decorator;

@ccclass
export default class Reel extends cc.Component {

    @property(cc.Prefab)
    symbolPrefab: cc.Prefab = null;

    @property()
    delayTime: number = 0.25;

    private delayCount: number = 0;
    
    readonly MAX_SPEED: number = 45;
    readonly MAX_ROWS: number = 3;

    private symbols: cc.Node[] = [];
    private originalYPosition: number[] = [];

    private tailSymbol: cc.Node = null;

    private isSpinning: boolean = false;
    private isStopping: boolean = false;
    private stopCount: number = 0;

    private spinSpeed: number = 0;

    start () {
        // Create symbol and attach it to the reel.
        for (var i = 0; i < this.MAX_ROWS + 1; i++) {
            const symbol = cc.instantiate(this.symbolPrefab);
            symbol.x = 0;
            symbol.y = -symbol.height / 2 - i * symbol.height;
            symbol.parent = this.node;
            this.symbols.push(symbol);
            // Save the original position for stop animation.
            this.originalYPosition.push(symbol.y);
        }
        this.node.height = this.symbols[0].height * this.MAX_ROWS;
        this.tailSymbol = this.symbols[0];

        cc.systemEvent.on("Spin", this.onSpin, this);
        cc.systemEvent.on("Finish", this.onFinishSpin, this);
    }

    public isBusy() {
        return this.isSpinning || this.isStopping;
    }

    private onSpin() {
        if (this.isSpinning) return;
        this.isSpinning = true;
        this.spinSpeed = 0;
    }
    
    private onFinishSpin(spinData) {
        this.isStopping = true;
        this.stopCount = this.MAX_ROWS + 1;
    }

    protected update(dt: number): void {
        this.symbols.forEach(symbol => {
            // if (this.isStopping && this.stopCount <= 0) return;
            if (!this.isSpinning) return;
            if (this.delayCount < this.delayTime) {
                this.delayCount += dt;
                return;
            }
            if (!symbol['stop']) {
                symbol.y -= this.spinSpeed;
            }
            // Slowly ncrease reel speed 
            this.spinSpeed += 60 * dt;
            if (this.spinSpeed >= this.MAX_SPEED) this.spinSpeed = this.MAX_SPEED;
            if (!symbol['stop'] && symbol.y <= -this.node.height - symbol.height / 2) {
                // If the symbol pass the below limit then reset it on top on tail node.
                symbol.y = this.tailSymbol.y + symbol.height;
                this.tailSymbol = symbol;
                if (this.isStopping) {
                    symbol['stop'] = true;
                    // When recieve stop signal then move the symbol to its final position
                    // Todo: Update correct sprite base on data got from server.
                    cc.tween(symbol).to(0.75, {y: this.originalYPosition[this.stopCount - 1]}, {easing: 'backOut'}).delay(0.25).call(() => {
                        if (this.isStopping) {
                            this.isStopping = false;
                            this.isSpinning = false;
                            this.stopCount = 4;
                        }
                        symbol['stop'] = false;
                        this.delayCount = 0;
                    }).start();
                    this.stopCount -= 1;
                }
            }
        })
    }

}
