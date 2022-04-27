import ReelHandler from "../../ReelHandler";
import { State } from "../State";
import { ReelIdleState } from "./ReelIdleState";

export class ReelStopppedState extends State<ReelHandler> {

    onStart(): void {
        // Do extra stuff here;
        this.stateMachine.setState(new ReelIdleState(this.stateMachine));
    }

    onUpdate(dt): void {
        // Do extra stuff here;
    }

    onExit(): void {
        // Do extra stuff here;
    }
}