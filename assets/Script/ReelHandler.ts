import BoardManager from "./BoardManager";
import { GameConfig } from "./GameConfig";
import SlotMachine from "./SlotMachine";
import SymbolHandler from "./SymbolHandler";

const { ccclass, property } = cc._decorator;

enum ReelState {
    IDLE,
    START_SPIN,
    SPINNING,
    MAP_SYMBOL,
    STOP_SPIN,
    STOPPING,
}

@ccclass
export default class ReelHandler extends cc.Component {

    @property(cc.Prefab)
    symbolPrefab: cc.Prefab = null;
    
    public reelIndex: number = 0;

    private spinSpeed: number = 0;

    private symbols: SymbolHandler[] = [];
    private reservedSymbols: SymbolHandler[] = [];

    private currentReelState: ReelState = ReelState.IDLE;

    init(reelIndex: number) {
        this.reelIndex = reelIndex;
        // Create symbols and attach them to the reel.
        for (var i = 0; i < GameConfig.NUM_SYMBOLS_PER_REEL + 1; i++) {
            const symbol = this.createSymbol(i);
            this.symbols.push(symbol);
        }
        for (var i = 0; i < GameConfig.NUM_SYMBOLS_PER_REEL; i++) {
            const symbol = this.createSymbol(i);
            symbol.node.opacity = 0;
            this.reservedSymbols.push(symbol);
        }
        this.node.height = this.symbols[0].node.height * GameConfig.NUM_SYMBOLS_PER_REEL;
    }

    createSymbol(symbolIndex: number) {
        const symbolNode = cc.instantiate(this.symbolPrefab);
        const symbolHanlder = symbolNode.getComponent(SymbolHandler);
        symbolHanlder.init(symbolIndex);
        symbolNode.parent = this.node;
        return symbolHanlder;
    }

    setSymbolYByIndex(symbol: cc.Node, symbolIndex: number) {
        symbol.y = -symbol.height / 2 - symbolIndex * symbol.height;
    }

    setReelIndex(index) {
        this.reelIndex = index;
    }

    isIdle() {
        return this.currentReelState === ReelState.IDLE;
    }

    isFullySpinning() {
        return this.currentReelState === ReelState.SPINNING;
    }

    startSpin() {
        this.spinSpeed = 0;
        this.currentReelState = ReelState.START_SPIN;
    }

    stopSpin() {
        this.currentReelState = ReelState.MAP_SYMBOL;
    }

    getResultSymbols() {
        const maxReels = BoardManager.getInstance().maxReels();
        const spinData = SlotMachine.getInstance().currentSpinInfo;
        const symbols = [];
        for (var i = 0; i < 3; i++) {
            symbols.push(spinData[this.reelIndex + i * maxReels]);
        }
        return symbols;
    }

    protected update(dt: number): void {
        this.updateSpin(dt);
    }

    updateSpin(dt: number) {
        switch(this.currentReelState) {
            case ReelState.START_SPIN:
                setTimeout(() => {
                    this.currentReelState = ReelState.SPINNING;
                }, GameConfig.DELAY_TIME_ON_START[this.reelIndex] * 1000);
                break;
            case ReelState.SPINNING:
                const newSymbols = [...this.symbols];
                this.symbols.forEach((symbol: SymbolHandler) => {
                    if (this.spinSpeed === GameConfig.MAX_REEL_SPEED) {
                        symbol.getComponent(SymbolHandler).setBlur(true);
                    }
                    symbol.node.y -= this.spinSpeed * dt * GameConfig.TARGET_FPS;
                    if (symbol.node.y <= -this.node.height - symbol.node.height / 2) {
                        symbol.node.y = this.symbols[0].node.y + symbol.node.height;
                        newSymbols.unshift(newSymbols.pop());
                    }
                });
                this.symbols = newSymbols;
                
                this.spinSpeed += GameConfig.SPIN_SPEED_INCREASE_STEP * dt * GameConfig.TARGET_FPS;
                if (this.spinSpeed >= GameConfig.MAX_REEL_SPEED) this.spinSpeed = GameConfig.MAX_REEL_SPEED;
                break;
            case ReelState.MAP_SYMBOL:
                console.log("Map Symbols");
                const displaySymbols = this.getResultSymbols();
                this.reservedSymbols.forEach((symbol: SymbolHandler, index: number) => {
                    symbol.setSymbol(displaySymbols[index]);
                });
                // Keep spinning until the delay time is over.
                this.currentReelState = ReelState.SPINNING;
                setTimeout(() => {
                    this.currentReelState = ReelState.STOP_SPIN;
                }, GameConfig.DELAY_TIME_ON_STOP[this.reelIndex] * 1000);
                break;
            case ReelState.STOP_SPIN:
                // Tween the symbols to correct positions on the reel.
                this.symbols.forEach((symbol: SymbolHandler, index: number) => {
                    symbol.setBlur(false);
                    var targetY = symbol.getSymbolYByIndex(index + GameConfig.NUM_SYMBOLS_PER_REEL);
                    cc.tween(symbol.node).to(GameConfig.STOP_ANIMATION_DURATION, {y: targetY}, {easing: 'backOut'}).start();
                });
                this.reservedSymbols.forEach((symbol: SymbolHandler, index: number) => {
                    symbol.setBlur(false);
                    var targetY = symbol.getSymbolYByIndex(index);
                    symbol.node.y = targetY + GameConfig.NUM_SYMBOLS_PER_REEL * symbol.node.height;
                    symbol.node.opacity = 255;
                    cc.tween(symbol.node).to(GameConfig.STOP_ANIMATION_DURATION, {y: targetY}, {easing: 'backOut'}).start();
                });
                // Wait for animation to finish.
                this.currentReelState = ReelState.STOPPING;
                setTimeout(() => {
                    // Swap active symbols & reserved symbols array for next spin.
                    const lastSymbolOnReel = this.symbols.pop();
                    const currentSymbols = [...this.symbols];

                    this.symbols = this.reservedSymbols;
                    this.symbols.push(lastSymbolOnReel);

                    this.reservedSymbols = currentSymbols;
                    this.reservedSymbols.forEach((symbol, index) => {
                        symbol.symbolIndex = index;
                        symbol.node.opacity = 0;
                    });

                    this.currentReelState = ReelState.IDLE;

                }, GameConfig.STOP_ANIMATION_DURATION * 1000);
                break;
            case ReelState.STOPPING:
                // Do stuff when stopping
                break;
            case ReelState.IDLE:
                // Do stuff when idling
                break;
        }
    }

}
