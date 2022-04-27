import BoardManager from "../../BoardManager";
import SlotMachine from "../../SlotMachine";
import { State } from "../State";
import { BoardIdleState } from "./BoardIdleState";

export class BoardStoppedState extends State<BoardManager> {

    onStart(): void {
        SlotMachine.getInstance().spinButton.interactable = true;
        this.stateMachine.setState(new BoardIdleState(this.stateMachine));
    }

    onUpdate(dt): void {
        // Do extra stuff here;
        
    }

    onExit(): void {
        // Do extra stuff here;
        
    }
}