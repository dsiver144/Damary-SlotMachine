import { AVAILABLE_SYMBOLS } from "./GameConfig";
import SlotMachine from "./SlotMachine";

const {ccclass, property} = cc._decorator;

@ccclass
export default class Symbol extends cc.Component {

    @property(cc.Sprite)
    sprite: cc.Sprite = null;

    private isBlur: boolean = false;
    private normalSpriteFrame: cc.SpriteFrame = null;
    private blurSpriteFrame: cc.SpriteFrame = null;

    getBlur() {
        return this.isBlur;
    }

    setBlur(status: boolean) {
        this.sprite.spriteFrame = status ? this.blurSpriteFrame : this.normalSpriteFrame;
        this.isBlur = status;
    }

    setSymbol(symbol: string) {
        if (symbol === "Random") return this.setRandomSymbol(false);

        const reelManager = SlotMachine.getInstance();
        this.normalSpriteFrame = reelManager.getSymbolSprite(`symbol_${symbol}`);
        this.blurSpriteFrame = reelManager.getSymbolSprite(`symbol_${symbol}_blur`);
    }

    setRandomSymbol(blur: boolean) {
        this.setSymbol(this.randomSymbol());
        this.setBlur(blur);
    }

    randomSymbol() {
        return AVAILABLE_SYMBOLS[Math.floor(Math.random() * AVAILABLE_SYMBOLS.length)];
    }

}