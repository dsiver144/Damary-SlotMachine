window.__require=function t(e,o,n){function r(s,a){if(!o[s]){if(!e[s]){var p=s.split("/");if(p=p[p.length-1],!e[p]){var l="function"==typeof __require&&__require;if(!a&&l)return l(p,!0);if(i)return i(p,!0);throw new Error("Cannot find module '"+s+"'")}s=p}var c=o[s]={exports:{}};e[s][0].call(c.exports,function(t){return r(e[s][1][t]||t)},c,c.exports,t,e,o,n)}return o[s].exports}for(var i="function"==typeof __require&&__require,s=0;s<n.length;s++)r(n[s]);return r}({GameManager:[function(t,e,o){"use strict";cc._RF.push(e,"e1b90/rohdEk4SdmmEZANaD","GameManager");var n,r=this&&this.__extends||(n=function(t,e){return(n=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(t,e){t.__proto__=e}||function(t,e){for(var o in e)Object.prototype.hasOwnProperty.call(e,o)&&(t[o]=e[o])})(t,e)},function(t,e){function o(){this.constructor=t}n(t,e),t.prototype=null===e?Object.create(e):(o.prototype=e.prototype,new o)}),i=this&&this.__decorate||function(t,e,o,n){var r,i=arguments.length,s=i<3?e:null===n?n=Object.getOwnPropertyDescriptor(e,o):n;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)s=Reflect.decorate(t,e,o,n);else for(var a=t.length-1;a>=0;a--)(r=t[a])&&(s=(i<3?r(s):i>3?r(e,o,s):r(e,o))||s);return i>3&&s&&Object.defineProperty(e,o,s),s};Object.defineProperty(o,"__esModule",{value:!0}),o.GAME_EVENT=void 0;var s,a=t("./Reel"),p=t("./ReelManager"),l=t("./Server"),c=cc._decorator,u=c.ccclass,f=c.property;(function(t){t.SPIN="Spin",t.STOP="Stop",t.FINISH="Finish"})(s=o.GAME_EVENT||(o.GAME_EVENT={}));var y=function(t){function e(){var e=null!==t&&t.apply(this,arguments)||this;return e.spinButton=null,e.server=new l.default,e}var o;return r(e,t),o=e,e.getInstance=function(){return this.inst},e.prototype.onLoad=function(){o.inst=this},e.prototype.start=function(){this.server.registerDataRespondEvent(this.onSpinFinishResponse.bind(this)),cc.systemEvent.on(s.FINISH,this.onSpinAnimationFinish,this)},e.prototype.onSpinFinishResponse=function(t){cc.systemEvent.emit(s.STOP,t)},e.prototype.onSpinButton=function(){p.default.getInstance().isBusy()||this.spinButton.interactable&&(this.spinButton.interactable=!1,this.server.requestSpinData(),a.default.completedNumber=0,cc.systemEvent.emit(s.SPIN))},e.prototype.onSpinAnimationFinish=function(){this.spinButton.interactable=!0},e.inst=null,i([f(cc.Button)],e.prototype,"spinButton",void 0),o=i([u],e)}(cc.Component);o.default=y,cc._RF.pop()},{"./Reel":"Reel","./ReelManager":"ReelManager","./Server":"Server"}],ReelManager:[function(t,e,o){"use strict";cc._RF.push(e,"e6fd2FlvkJI0o2+VgFy3bLT","ReelManager");var n,r=this&&this.__extends||(n=function(t,e){return(n=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(t,e){t.__proto__=e}||function(t,e){for(var o in e)Object.prototype.hasOwnProperty.call(e,o)&&(t[o]=e[o])})(t,e)},function(t,e){function o(){this.constructor=t}n(t,e),t.prototype=null===e?Object.create(e):(o.prototype=e.prototype,new o)}),i=this&&this.__decorate||function(t,e,o,n){var r,i=arguments.length,s=i<3?e:null===n?n=Object.getOwnPropertyDescriptor(e,o):n;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)s=Reflect.decorate(t,e,o,n);else for(var a=t.length-1;a>=0;a--)(r=t[a])&&(s=(i<3?r(s):i>3?r(e,o,s):r(e,o))||s);return i>3&&s&&Object.defineProperty(e,o,s),s};Object.defineProperty(o,"__esModule",{value:!0});var s=t("./GameManager"),a=t("./Reel"),p=cc._decorator,l=p.ccclass,c=p.property,u=function(){function t(){this.delayTimeToSpin=0}return i([c()],t.prototype,"delayTimeToSpin",void 0),i([l("ReelConfig")],t)}(),f=function(t){function e(){var e=null!==t&&t.apply(this,arguments)||this;return e.reelLayout=null,e.loadingNode=null,e.reelPrefab=null,e.reelConfig=[],e.reels=[],e.isLoadingBundle=!1,e.symbolSpriteFrameCollection={},e}var o;return r(e,t),o=e,e.getInstance=function(){return this.inst},e.prototype.onLoad=function(){var t=this;o.inst=this,this.reelLayout.node.opacity=0,this.loadSymbolAssetBundle(function(){t.createReelNodes(),cc.tween(t.reelLayout.node).to(.25,{opacity:255}).start(),cc.tween(t.loadingNode).to(.25,{opacity:0}).start()}),cc.systemEvent.on(s.GAME_EVENT.SPIN,this.onSpin.bind(this),this),cc.systemEvent.on(s.GAME_EVENT.STOP,this.onBeginToStop.bind(this),this)},e.prototype.loadSymbolAssetBundle=function(t){var e=this;this.isLoadingBundle=!0,cc.assetManager.loadBundle("symbols",function(o,n){if(o)return alert("Error while loading symbol bundle, please retry later."),void location.reload();n.loadDir("/",cc.SpriteFrame,function(o,n){n.forEach(function(t){e.symbolSpriteFrameCollection[t.name]=t}),e.isLoadingBundle=!1,t&&t()})})},e.prototype.maxReels=function(){return this.reelConfig.length},e.prototype.createReelNodes=function(){for(var t=0;t<this.maxReels();t++){var e=cc.instantiate(this.reelPrefab);e.parent=this.reelLayout.node;var o=e.getComponent(a.default);o.delayToSpinTime=this.reelConfig[t].delayTimeToSpin,o.setReelIndex(t),this.reels.push(o)}this.reelLayout.updateLayout()},e.prototype.getSymbolSprite=function(t){return this.symbolSpriteFrameCollection[t]},e.prototype.onSpin=function(){this.reels.forEach(function(t){return t.startSpin()})},e.prototype.onBeginToStop=function(t){console.log({spinData:t}),this.reels.forEach(function(e){return e.stop(t)})},e.prototype.isBusy=function(){return this.isLoadingBundle},e.inst=null,i([c(cc.Layout)],e.prototype,"reelLayout",void 0),i([c(cc.Node)],e.prototype,"loadingNode",void 0),i([c(cc.Prefab)],e.prototype,"reelPrefab",void 0),i([c([u])],e.prototype,"reelConfig",void 0),o=i([l],e)}(cc.Component);o.default=f,cc._RF.pop()},{"./GameManager":"GameManager","./Reel":"Reel"}],Reel:[function(t,e,o){"use strict";cc._RF.push(e,"fdb7eJi9LBIB4j8KbYuqfWo","Reel");var n,r=this&&this.__extends||(n=function(t,e){return(n=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(t,e){t.__proto__=e}||function(t,e){for(var o in e)Object.prototype.hasOwnProperty.call(e,o)&&(t[o]=e[o])})(t,e)},function(t,e){function o(){this.constructor=t}n(t,e),t.prototype=null===e?Object.create(e):(o.prototype=e.prototype,new o)}),i=this&&this.__decorate||function(t,e,o,n){var r,i=arguments.length,s=i<3?e:null===n?n=Object.getOwnPropertyDescriptor(e,o):n;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)s=Reflect.decorate(t,e,o,n);else for(var a=t.length-1;a>=0;a--)(r=t[a])&&(s=(i<3?r(s):i>3?r(e,o,s):r(e,o))||s);return i>3&&s&&Object.defineProperty(e,o,s),s};Object.defineProperty(o,"__esModule",{value:!0});var s,a=t("./GameManager"),p=t("./ReelManager"),l=t("./Symbol"),c=cc._decorator,u=c.ccclass,f=c.property,y=(s=cc.Node,r(function(){var t=null!==s&&s.apply(this,arguments)||this;return t.stopping=!1,t.symbolComp=null,t},s),function(t){function e(){var e=null!==t&&t.apply(this,arguments)||this;return e.MAX_SPEED=25,e.MAX_ROWS=3,e.SPIN_SPEED_INCREASE_STEP=60,e.STOP_ANIMATION_DURATION=.75,e.symbolPrefab=null,e.delayToSpinTime=.25,e.reelIndex=0,e.delayToSpinCount=0,e.spinSpeed=0,e.symbols=[],e.originalYPosition=[],e.tailSymbol=null,e.isSpinning=!1,e.isStopping=!1,e.symbolStopCount=0,e.stopDelayDuration=2,e.delayToStopCount=0,e.stopBufferBetweenReelCount=0,e.targetSymbols=null,e}var o;return r(e,t),o=e,e.prototype.start=function(){for(var t=0;t<this.MAX_ROWS+1;t++){var e=cc.instantiate(this.symbolPrefab);e.x=0,e.stopping=!1,e.symbolComp=e.getComponent(l.default),e.y=-e.height/2-t*e.height,e.parent=this.node,e.symbolComp.setRandomSymbol(!1),this.symbols.push(e),this.originalYPosition.push(e.y)}this.node.height=this.symbols[0].height*this.MAX_ROWS,this.tailSymbol=this.symbols[0]},e.prototype.setReelIndex=function(t){this.reelIndex=t},e.prototype.isBusy=function(){return this.isSpinning||this.isStopping},e.prototype.startSpin=function(){this.spinSpeed=0,this.delayToSpinCount=this.delayToSpinTime,this.delayToStopCount=this.stopDelayDuration,this.isSpinning=!0},e.prototype.stop=function(t){this.isStopping=!0,this.symbolStopCount=this.MAX_ROWS+1,this.stopBufferBetweenReelCount=this.delayToSpinTime;var e=p.default.getInstance().maxReels();this.targetSymbols=[];for(var o=0;o<3;o++)this.targetSymbols.push(t[this.reelIndex+o*e]);this.targetSymbols.push("Random")},e.prototype.update=function(t){var e=this;this.isSpinning&&this.symbols.forEach(function(n){if(e.delayToSpinCount>0)e.delayToSpinCount-=t;else if(e.delayToStopCount>0&&(e.delayToStopCount-=t),e.stopBufferBetweenReelCount>0&&(e.stopBufferBetweenReelCount-=t),n.stopping||(n.symbolComp.getBlur()||n.symbolComp.setBlur(!0),n.y-=e.spinSpeed),e.spinSpeed+=e.SPIN_SPEED_INCREASE_STEP*t,e.spinSpeed>=e.MAX_SPEED&&(e.spinSpeed=e.MAX_SPEED),!n.stopping&&n.y<=-e.node.height-n.height/2&&(n.y=e.tailSymbol.y+n.height,e.tailSymbol=n,e.isStopping&&e.delayToStopCount<=0&&e.stopBufferBetweenReelCount<=0)){n.stopping=!0,n.symbolComp.setSymbol(e.targetSymbols.pop()),n.symbolComp.setBlur(!1);var r=e.originalYPosition[e.symbolStopCount-1];cc.tween(n).to(e.STOP_ANIMATION_DURATION,{y:r},{easing:"backOut"}).call(function(){e.isStopping&&(e.isStopping=!1,e.isSpinning=!1,o.completedNumber+=1,o.completedNumber==p.default.getInstance().maxReels()&&cc.systemEvent.emit(a.GAME_EVENT.FINISH)),n.stopping=!1}).start(),e.symbolStopCount-=1}})},e.completedNumber=0,i([f(cc.Prefab)],e.prototype,"symbolPrefab",void 0),i([f()],e.prototype,"delayToSpinTime",void 0),o=i([u],e)}(cc.Component));o.default=y,cc._RF.pop()},{"./GameManager":"GameManager","./ReelManager":"ReelManager","./Symbol":"Symbol"}],Server:[function(t,e,o){"use strict";cc._RF.push(e,"80dcbbgqylMar8eTAJ3kAPQ","Server"),Object.defineProperty(o,"__esModule",{value:!0});var n=[["1","2","3","4","5","6","7","K","1","2","3","4","5","6","7"],["1","2","6","2","1","6","4","K","5","2","8","3","3","3","3"],["1","2","6","3","4","7","K","K","K","1","3","5","2","4","2"],["1","2","3","4","3","5","3","8","3","1","5","3","4","5","7"],["2","7","3","2","3","8","7","3","K","1","5","3","4","6","5"],["2","7","3","K","6","8","5","2","K","1","5","3","4","5","8"]],r=function(){function t(){this._dataRespondCallbacks=[]}return t.prototype.registerDataRespondEvent=function(t){this._dataRespondCallbacks.push(t)},t.prototype.requestSpinData=function(){var t=this,e=this._randomRange(100,1500)+(Math.random()>.8?2e3:0);window.setTimeout(function(){var e=t._randomRange(0,n.length-1,!0),o=[];Object.assign(o,n[e]),t._dataRespondCallbacks.forEach(function(t){t(o)})},e)},t.prototype._randomRange=function(t,e,o){void 0===o&&(o=!1);var n=e-t,r=t+Math.random()*n;return o&&(r=Math.round(r)),r},t}();o.default=r,cc._RF.pop()},{}],Symbol:[function(t,e,o){"use strict";cc._RF.push(e,"cc515vj51VMN4B/g172SKXs","Symbol");var n,r=this&&this.__extends||(n=function(t,e){return(n=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(t,e){t.__proto__=e}||function(t,e){for(var o in e)Object.prototype.hasOwnProperty.call(e,o)&&(t[o]=e[o])})(t,e)},function(t,e){function o(){this.constructor=t}n(t,e),t.prototype=null===e?Object.create(e):(o.prototype=e.prototype,new o)}),i=this&&this.__decorate||function(t,e,o,n){var r,i=arguments.length,s=i<3?e:null===n?n=Object.getOwnPropertyDescriptor(e,o):n;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)s=Reflect.decorate(t,e,o,n);else for(var a=t.length-1;a>=0;a--)(r=t[a])&&(s=(i<3?r(s):i>3?r(e,o,s):r(e,o))||s);return i>3&&s&&Object.defineProperty(e,o,s),s};Object.defineProperty(o,"__esModule",{value:!0}),o.AVAILABLE_SYMBOLS=void 0;var s=t("./ReelManager"),a=cc._decorator,p=a.ccclass,l=a.property;o.AVAILABLE_SYMBOLS=["1","2","3","4","5","6","7","8","K"];var c=function(t){function e(){var e=null!==t&&t.apply(this,arguments)||this;return e.sprite=null,e.isBlur=!1,e.normalSpriteFrame=null,e.blurSpriteFrame=null,e}return r(e,t),e.prototype.getBlur=function(){return this.isBlur},e.prototype.setBlur=function(t){this.sprite.spriteFrame=t?this.blurSpriteFrame:this.normalSpriteFrame,this.isBlur=t},e.prototype.setSymbol=function(t){if("Random"===t)return this.setRandomSymbol(!1);var e=s.default.getInstance();this.normalSpriteFrame=e.getSymbolSprite("symbol_"+t),this.blurSpriteFrame=e.getSymbolSprite("symbol_"+t+"_blur")},e.prototype.setRandomSymbol=function(t){this.setSymbol(this.randomSymbol()),this.setBlur(t)},e.prototype.randomSymbol=function(){return o.AVAILABLE_SYMBOLS[Math.floor(Math.random()*o.AVAILABLE_SYMBOLS.length)]},i([l(cc.Sprite)],e.prototype,"sprite",void 0),i([p],e)}(cc.Component);o.default=c,cc._RF.pop()},{"./ReelManager":"ReelManager"}]},{},["GameManager","Reel","ReelManager","Server","Symbol"]);