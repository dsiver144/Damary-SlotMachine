import { GameConfig } from "./GameConfig";
import SlotMachine from "./SlotMachine";
import { FSM } from "./States/FSM";
import { ReelIdleState } from "./States/ReelStates/ReelIdleState";
import { ReelSpinningState } from "./States/ReelStates/ReelSpinningState";
import { ReelStartStopState } from "./States/ReelStates/ReelStartStopState";
import SymbolHandler from "./SymbolHandler";

const { ccclass, property } = cc._decorator;

@ccclass
export default class ReelHandler extends FSM {

    @property(cc.Prefab)
    symbolPrefab: cc.Prefab = null;

    public reelIndex: number = 0;

    private spinSpeed: number = 0;

    private symbols: SymbolHandler[] = [];
    private reservedSymbols: SymbolHandler[] = [];

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
        return this.currentState instanceof ReelIdleState;
    }

    isSpinning() {
        return this.currentState instanceof ReelSpinningState;
    }

    startSpin() {
        this.spinSpeed = 0;
        this.setState(new ReelSpinningState(this));
    }

    stopSpin() {
        this.setState(new ReelStartStopState(this));
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
        this.mapSymbols();
        // Tween the symbols to correct positions on the reel.
        this.symbols.forEach((symbol: SymbolHandler, index: number) => {
            symbol.setBlur(false);
            var targetY = this.getSymbolYByIndex(symbol.node, index + GameConfig.NUM_SYMBOLS_PER_REEL);
            cc.tween(symbol.node).to(GameConfig.STOP_ANIMATION_DURATION, { y: targetY }, { easing: 'backOut' }).start();
        });
        this.reservedSymbols.forEach((symbol: SymbolHandler, index: number) => {
            symbol.setBlur(false);
            var targetY = this.getSymbolYByIndex(symbol.node, index);
            symbol.node.y = targetY + GameConfig.NUM_SYMBOLS_PER_REEL * symbol.node.height;
            symbol.node.opacity = 255;
            cc.tween(symbol.node).to(GameConfig.STOP_ANIMATION_DURATION, { y: targetY }, { easing: 'backOut' }).start();
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
