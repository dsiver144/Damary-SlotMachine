export abstract class State<T> {

    protected stateMachine: T;

    constructor(stateMachine) {
        this.stateMachine = stateMachine;
    } 

    abstract onStart(): void;
    abstract onUpdate(dt: number): void;
    abstract onExit(): void;

}