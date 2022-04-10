import { GameConfig } from "./GameConfig";

interface symbolSpriteFrameCollection {
    [id: string] : cc.SpriteFrame
}

export class ResourceManager {

    public static symbolSpriteFrameCollection: symbolSpriteFrameCollection = {};
       
    public static loadSymbolAssetBundle() {
        return new Promise<void>((resolve, reject) => {
            cc.assetManager.loadBundle(GameConfig.SYMBOLS_BUNDLE_NAME, (err: Error, bundle: cc.AssetManager.Bundle) => {
                if (err) {
                    alert("Error while loading symbol bundle, please retry later.");
                    location.reload();
                    reject();
                }
                bundle.loadDir("/", cc.SpriteFrame, (err: Error, assets: cc.SpriteFrame[]) => {
                    assets.forEach((spriteFrame: cc.SpriteFrame) => {
                        this.symbolSpriteFrameCollection[spriteFrame.name] = spriteFrame;
                    })
                    resolve();
                })
            })
        })
    }

    public static getSymbolSprite(symbolName: string) {
        return this.symbolSpriteFrameCollection[symbolName];
    }
    
}