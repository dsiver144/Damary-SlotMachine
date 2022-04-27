import { State } from "./State";

const { ccclass, property } = cc._decorator;

@ccclass
export abstract class FSM extends cc.Component {
    
    protected currentState: State<any>;

    setState(state: State<any>) {
        if (this.currentState) {
            this.currentState.onExit();
        }
        this.currentState = state;
        this.currentState.onStart();
    }

    protected update(dt: number): void {
        this.currentState?.onUpdate(dt);
    }
}