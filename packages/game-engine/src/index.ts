import type { GameDefinition } from "@family-playground/types";

export function defineGame<TState, TEvent>(
  definition: GameDefinition<TState, TEvent>,
): GameDefinition<TState, TEvent> {
  return definition;
}
