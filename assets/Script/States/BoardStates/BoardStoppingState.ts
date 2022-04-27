import BoardManager from "../../BoardManager";
import { State } from "../State";
import { BoardStoppedState } from "./BoardStoppedState";

export class BoardStoppingState extends State<BoardManager> {

    onStart(): void {
        // Do extra stuff here;
    }

    onUpdate(dt): void {
        if (!this.stateMachine.areAllReelsIdling()) return;
        this.stateMachine.setState(new BoardStoppedState(this.stateMachine));
    }

    onExit(): void {
        // Do extra stuff here;
    }
}