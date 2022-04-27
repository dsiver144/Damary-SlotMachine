import ReelHandler from "../../ReelHandler";
import { State } from "../State";

export class ReelSpinningState extends State<ReelHandler> {

    onStart(): void {
        // Do extra stuff here;
    }

    onUpdate(dt: number): void {
        this.stateMachine.onUpdateSpin(dt);
    }

    onExit(): void {
        // Do extra stuff here;
    }
}