import {IAction, IInvoker, ModelStream} from "../model.stream";
import {Observable, shareReplay, tap} from "@hypertype/core";
import {StateLogger} from "@hypertype/infr";

export class DevToolModelStream<TState, TActions> extends ModelStream<TState, TActions> {
    private lastState: TState;
    public State$: Observable<TState> = this.stream.State$.pipe(
        tap(state => {
            this.lastState = state;
            this.stateLogger.send({type: 'domain.new-state', payload: null}, state);
        }),
        shareReplay(1)
    );

    constructor(private stream: ModelStream<TState, TActions>, private stateLogger: StateLogger) {
        super();
    }

    public Action: IInvoker<TActions> = async (action: IAction<TActions>) => {
        const result = await this.stream.Action(action);
        this.stateLogger.send({
            type: [
                ...action.path,
                action.method
            ].join(':'),
            payload: action.args
        }, result || this.lastState);
        return result;
    };


}
