import { ResourceManager } from "./ResourceManager";

const {ccclass, property} = cc._decorator;

@ccclass
export default class SymbolHandler extends cc.Component {

    @property(cc.Sprite)
    sprite: cc.Sprite = null;

    symbolIndex: number = -1;

    private isBlur: boolean = false;
    private normalSpriteFrame: cc.SpriteFrame = null;
    private blurSpriteFrame: cc.SpriteFrame = null;

    init(symbolIndex: number) {
        this.symbolIndex = symbolIndex;
    }

    setSymbol(symbol: string) {
        this.normalSpriteFrame = ResourceManager.getSymbolSprite(`symbol_${symbol}`);
        this.blurSpriteFrame = ResourceManager.getSymbolSprite(`symbol_${symbol}_blur`);
        this.updateSpriteFrame();
    }

    setBlur(status: boolean, refreshSprite: boolean = true) {
        if (this.isBlur === status) {
            return;
        }
        this.isBlur = status;
        refreshSprite && this.updateSpriteFrame();
    }

    updateSpriteFrame() {
        this.sprite.spriteFrame = this.isBlur ? this.blurSpriteFrame : this.normalSpriteFrame;
    }

}

