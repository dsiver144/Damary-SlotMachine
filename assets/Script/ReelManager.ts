import { GAME_EVENT } from "./GameManager";
import Reel from "./Reel";
import Server from "./Server";

const { ccclass, property } = cc._decorator;

const symbolsBundleName = 'symbols';

@ccclass("ReelConfig")
class ReelConfig {
    @property()
    delayTimeToSpin: number = 0;
}

interface symbolSpriteFrameCollection {
    [id: string] : cc.SpriteFrame
}

@ccclass
export default class ReelManager extends cc.Component {

    private static inst: ReelManager = null;
    public static getInstance() {
        return this.inst;
    }

    @property(cc.Layout)
    reelLayout: cc.Layout = null;

    @property(cc.Node)
    loadingNode: cc.Node = null;

    @property(cc.Prefab)
    reelPrefab: cc.Prefab = null;

    @property([ReelConfig])
    reelConfig: ReelConfig[] = [];

    private reels: Reel[] = [];
    private isLoadingBundle: boolean = false;
    private symbolSpriteFrameCollection: symbolSpriteFrameCollection = {};
    
    protected onLoad(): void {
        ReelManager.inst = this;
        this.reelLayout.node.opacity = 0;
        // Wait for asset bundle to load before showing the reels.
        this.loadSymbolAssetBundle(() => {
            this.createReelNodes();
            cc.tween(this.reelLayout.node).to(0.25, {opacity: 255}).start();
            cc.tween(this.loadingNode).to(0.25, {opacity: 0}).start();
        });
        cc.systemEvent.on(GAME_EVENT.SPIN, this.onSpin.bind(this), this);
        cc.systemEvent.on(GAME_EVENT.STOP, this.onBeginToStop.bind(this), this);
    }

    loadSymbolAssetBundle(callback: Function) {
        this.isLoadingBundle = true;
        cc.assetManager.loadBundle(symbolsBundleName, (err: Error, bundle: cc.AssetManager.Bundle) => {
            if (err) {
                alert("Error while loading symbol bundle, please retry later.");
                location.reload();
                return;
            }
            bundle.loadDir("/", cc.SpriteFrame, (err: Error, assets: cc.SpriteFrame[]) => {
                assets.forEach((spriteFrame: cc.SpriteFrame) => {
                    this.symbolSpriteFrameCollection[spriteFrame.name] = spriteFrame;
                })
                this.isLoadingBundle = false;
                callback && callback();
            })
        })
    }

    maxReels() {
        return this.reelConfig.length;
    }

    createReelNodes() {
        for (let i = 0; i < this.maxReels(); i++) {
            const reelNode = cc.instantiate(this.reelPrefab);
            reelNode.parent = this.reelLayout.node;
            const reelComp = reelNode.getComponent(Reel);
            reelComp.delayToSpinTime = this.reelConfig[i].delayTimeToSpin;
            reelComp.setReelIndex(i);
            this.reels.push(reelComp);
        }
        this.reelLayout.updateLayout();
    }

    getSymbolSprite(symbolName: string) {
        return this.symbolSpriteFrameCollection[symbolName];
    }

    onSpin() {
        this.reels.forEach(reel => reel.startSpin());
    }

    onBeginToStop(spinData: string[]) {
        console.log({spinData});
        this.reels.forEach(reel => reel.stop(spinData));
    }

    isBusy() {
        return this.isLoadingBundle;
    }

}
