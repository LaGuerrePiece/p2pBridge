import { defineStore } from "pinia";
import { state } from "./state";
import { TestActions, TestGetters, TestState } from "../../types/test";
import { twiceCounter } from "./getters";
import { increment } from "./actions";

export const useTestStore = defineStore("Test", {
  state: (): TestState => state,
  getters: {
      [TestGetters.Test]: twiceCounter
  },
  actions: {
      [TestActions.Increment]: increment
  },
});
