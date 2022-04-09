export const TARGET_FPS: number = 60;

export const MAX_REEL_SPEED: number = 50;
export const MAX_ROWS_PER_REEL: number = 3;
export const SPIN_SPEED_INCREASE_STEP: number = 1.0;
export const STOP_ANIMATION_DURATION: number = 0.4;

export const SYMBOLS_BUNBLE_NAME = 'symbols';

export enum GAME_EVENT {
    SPIN = 'Spin',
    READY = 'Ready',
    STOP = 'Stop',
    FINISH = 'Finish'
}

export const AVAILABLE_SYMBOLS = ['1', '2', '3', '4', '5', '6', '7', '8', 'K'];