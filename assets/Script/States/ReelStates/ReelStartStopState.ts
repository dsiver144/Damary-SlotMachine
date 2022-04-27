import ReelHandler from "../../ReelHandler";
import { State } from "../State";
import { ReelStoppingState } from "./ReelStoppingState";

export class ReelStartStopState extends State<ReelHandler> {

    onStart(): void {
        // Do extra stuff here;
        this.stateMachine.onStopSpin();
        this.stateMachine.setState(new ReelStoppingState(this.stateMachine));
    }

    onUpdate(dt): void {
        // Do extra stuff here;
    }

    onExit(): void {
        // Do extra stuff here;
    }
}