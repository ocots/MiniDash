export const PlayerStates = Object.freeze({
    DISABLED: 'disabled',
    GROUNDED: 'grounded',
    JUMP_RISING: 'jump_rising',
    FALLING: 'falling',
    DYING: 'dying'
});

export class PlayerStateMachine {
    constructor(initialState = PlayerStates.DISABLED) {
        this._currentState = initialState;
        this._previousState = null;
    }

    get current() {
        return this._currentState;
    }

    get previous() {
        return this._previousState;
    }

    is(state) {
        return this._currentState === state;
    }

    transitionTo(newState) {
        if (this._currentState === newState) return;
        const oldState = this._currentState;
        this._previousState = oldState;
        this._currentState = newState;
    }
}
