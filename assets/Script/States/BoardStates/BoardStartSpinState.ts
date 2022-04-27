import BoardManager from "../../BoardManager";
import { GameConfig } from "../../GameConfig";
import { State } from "../State";
import { BoardSpinningState } from "./BoardSpinningState";

export class BoardStartSpinState extends State<BoardManager> {

    onStart(): void {
        this.stateMachine.reels.forEach(reelHandler => {
            setTimeout(() => {
                reelHandler.startSpin();
            }, GameConfig.DELAY_TIME_ON_START[reelHandler.reelIndex] * 1000);
        });
        this.stateMachine.setState(new BoardSpinningState(this.stateMachine));
    }

    onUpdate(dt): void {
        // Do extra stuff here;
    }

    onExit(): void {
        // Do extra stuff here;
    }

}