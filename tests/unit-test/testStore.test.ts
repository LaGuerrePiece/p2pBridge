import { assert } from "chai";
import { createPinia, setActivePinia } from "pinia";
import { useTestStore } from "../../src/store/test";
import { TestActions, TestGetters } from "../../src/types/test";

setActivePinia(createPinia());
const testStore = useTestStore();

describe("Tests suite for the defense store contracts communication", () => {
  it("Checks the getter functions work well", async () => {
    const counter = testStore[TestGetters.Test];
    assert.equal(counter, 18, "The counter should be initially 9");
  });

  it("Checks the increment function works well", async () => {
    testStore[TestActions.Increment]();
    const counter = testStore[TestGetters.Test];

    assert.equal(
      counter,
      testStore.test * 2,
      "The getter should always point to the test field *2"
    );
    assert.equal(
      testStore.test,
      10,
      "After the increment action the store should be updated"
    );
  });
});
