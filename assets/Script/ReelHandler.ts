import { GameConfig } from "./GameConfig";
import SlotMachine from "./SlotMachine";
import SymbolHandler from "./SymbolHandler";

const { ccclass, property } = cc._decorator;

enum ReelState {
    IDLE,
    SPINNING,
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
        symbolHanlder.setSymbol(this.getRandomSymbol());
        symbolNode.parent = this.node;
        symbolNode.x = 0;
        symbolNode.y = this.getSymbolYByIndex(symbolNode, symbolIndex);
        return symbolHanlder;
    }

    getSymbolYByIndex(symbolNode: cc.Node, symbolIndexInReel: number) {
        return -symbolNode.height / 2 - symbolIndexInReel * symbolNode.height;
    }

    setReelIndex(index) {
        this.reelIndex = index;
    }

    getRandomSymbol() {
        return GameConfig.AVAILABLE_SYMBOLS[Math.floor(Math.random() * GameConfig.AVAILABLE_SYMBOLS.length)];
    }

    isIdle() {
        return this.currentReelState === ReelState.IDLE;
    }

    isSpinning() {
        return this.currentReelState === ReelState.SPINNING;
    }

    startSpin() {
        this.spinSpeed = 0;
        this.currentReelState = ReelState.SPINNING;
    }

    stopSpin() {
        this.mapSymbols();
        this.currentReelState = ReelState.STOP_SPIN;
    }

    mapSymbols() {
        const displaySymbols = this.getResultSymbols();
        this.reservedSymbols.forEach((symbol: SymbolHandler, index: number) => {
            symbol.setSymbol(displaySymbols[index]);
        });
    }

    getResultSymbols() {
        const spinData = SlotMachine.getInstance().currentSpinInfo;
        const maxReels = GameConfig.NUM_VISIBLE_REELS;
        const symbols = [];
        for (var i = 0; i < GameConfig.NUM_SYMBOLS_PER_REEL; i++) {
            symbols.push(spinData[this.reelIndex + i * maxReels]);
        }
        return symbols;
    }

    protected update(dt: number): void {
        this.updateReelState(dt);
    }

    updateReelState(dt: number) {
        switch(this.currentReelState) {
            case ReelState.SPINNING:
                this.onUpdateSpin(dt);
                break;
            case ReelState.STOP_SPIN:
                this.onStopSpin();
                this.currentReelState = ReelState.STOPPING;
                setTimeout(() => {
                    // Wait for animation to finish then change to Idle state.
                    this.swapActiveAndReservedSymbols();
                    this.currentReelState = ReelState.IDLE;
                }, GameConfig.STOP_ANIMATION_DURATION);
                break;
            case ReelState.STOPPING:
                // Do stuff when stopping
                break;
            case ReelState.IDLE:
                // Do stuff when idling
                break;
        }
    }

    onUpdateSpin(dt) {
        const newSymbols = [...this.symbols];
        this.symbols.forEach((symbol: SymbolHandler) => {
            if (this.spinSpeed === GameConfig.MAX_REEL_SPEED) {
                symbol.getComponent(SymbolHandler).setBlur(true);
            }
            symbol.node.y -= this.spinSpeed * dt * GameConfig.TARGET_FPS;
            if (symbol.node.y <= -this.node.height - symbol.node.height / 2) {
                symbol.node.y = this.symbols[0].node.y + symbol.node.height;
                symbol.setSymbol(this.getRandomSymbol());
                newSymbols.unshift(newSymbols.pop());
            }
        });
        this.symbols = newSymbols;
        
        this.spinSpeed += GameConfig.SPIN_SPEED_INCREASE_STEP * dt * GameConfig.TARGET_FPS;
        if (this.spinSpeed >= GameConfig.MAX_REEL_SPEED) this.spinSpeed = GameConfig.MAX_REEL_SPEED;
    }

    onStopSpin() {
        // Tween the symbols to correct positions on the reel.
        this.symbols.forEach((symbol: SymbolHandler, index: number) => {
            symbol.setBlur(false);
            var targetY = this.getSymbolYByIndex(symbol.node, index + GameConfig.NUM_SYMBOLS_PER_REEL);
            cc.tween(symbol.node).to(GameConfig.STOP_ANIMATION_DURATION, {y: targetY}, {easing: 'backOut'}).start();
        });
        this.reservedSymbols.forEach((symbol: SymbolHandler, index: number) => {
            symbol.setBlur(false);
            var targetY = this.getSymbolYByIndex(symbol.node, index);
            symbol.node.y = targetY + GameConfig.NUM_SYMBOLS_PER_REEL * symbol.node.height;
            symbol.node.opacity = 255;
            cc.tween(symbol.node).to(GameConfig.STOP_ANIMATION_DURATION, {y: targetY}, {easing: 'backOut'}).start();
        });
    }

    swapActiveAndReservedSymbols() {
        // Swap active symbols & reserved symbols array for next spin.
        const lastSymbolOnReel = this.symbols.pop();
        const activeSymbols = [...this.symbols];

        this.symbols = this.reservedSymbols;
        this.symbols.push(lastSymbolOnReel);

        this.reservedSymbols = activeSymbols;
        this.reservedSymbols.forEach((symbol, index) => {
            symbol.symbolIndex = index;
            symbol.node.opacity = 0;
        });
    }

}
