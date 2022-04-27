import BoardManager from "../../BoardManager";
import { GameConfig } from "../../GameConfig";
import { State } from "../State";
import { BoardStoppingState } from "./BoardStoppingState";

export class BoardStopState extends State<BoardManager> {

    isStopped: boolean = false;

    onStart(): void {
        // Do extra stuff here;
    }

    onUpdate(dt): void {
        if (!this.stateMachine.areAllReelsSpinning()) return;
        this.stateMachine.reels.forEach(reelHandler => {
            setTimeout(() => {
                reelHandler.stopSpin();
            }, GameConfig.DELAY_TIME_ON_STOP[reelHandler.reelIndex] * 1000);
        });
        this.stateMachine.setState(new BoardStoppingState(this.stateMachine));
        // Do nothing here.
    }

    onExit(): void {
        // Do extra stuff here;
    }
}