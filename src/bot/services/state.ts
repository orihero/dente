import { UserState } from '../types.js';

// In-memory store for user states
class StateManager {
  private states: Map<number, UserState>;

  constructor() {
    this.states = new Map();
  }

  get(chatId: number): UserState | undefined {
    return this.states.get(chatId);
  }

  set(chatId: number, state: UserState): void {
    this.states.set(chatId, state);
  }

  delete(chatId: number): void {
    this.states.delete(chatId);
  }

  update(chatId: number, updates: Partial<UserState>): void {
    const currentState = this.states.get(chatId);
    if (currentState) {
      this.states.set(chatId, { ...currentState, ...updates });
    }
  }
}

export const stateManager = new StateManager();