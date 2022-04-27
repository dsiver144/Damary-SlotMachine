import ReelHandler from "../../ReelHandler";
import { State } from "../State";
import { ReelSpinningState } from "./ReelSpinningState";

export class ReelStartSpinState extends State<ReelHandler> {

    onStart(): void {
        this.stateMachine.setState(new ReelSpinningState(this.stateMachine));
    }

    onUpdate(dt): void {
        // Do extra stuff here;
    }

    onExit(): void {
        // Do extra stuff here;
    }
}