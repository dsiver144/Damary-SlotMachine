import { GameConfig } from "../../GameConfig";
import ReelHandler from "../../ReelHandler";
import { State } from "../State";
import { ReelStopppedState } from "./ReelStopppedState";

export class ReelStoppingState extends State<ReelHandler> {

    onStart(): void {
        setTimeout(() => {
            this.stateMachine.swapActiveAndReservedSymbols();
            this.stateMachine.setState(new ReelStopppedState(this.stateMachine));
        }, GameConfig.STOP_ANIMATION_DURATION * 1000);
    }

    onUpdate(dt): void {
        // Do extra stuff here;
    }

    onExit(): void {
        // Do extra stuff here;
    }
}