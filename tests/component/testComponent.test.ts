// /**
//  * @jest-environment jsdom
//  */

// import { render, fireEvent, waitFor } from "@testing-library/vue";
// import { expect as chaiExpect } from "chai";
// import { createTestingPinia } from "@pinia/testing";
// import { useTestStore } from "../../src/store/test";
// import TestComponentVue from "../../src/component/TestComponent.vue";

// const pinia = createTestingPinia({ stubActions: false });

// const testStore = useTestStore();

// describe("Testing the test component", () => {
//   it("Checks the component displays the state well", async () => {
//     const { getByTestId } = render(TestComponentVue, {
//       global: { plugins: [pinia] },
//     });
//     expect(getByTestId("counter")).toHaveTextContent("Counter value : 9");
//   });

//   it("Checks the component displays the state well", async () => {
//     const { getByTestId } = render(TestComponentVue, {
//       global: { plugins: [pinia] },
//     });
//     expect(getByTestId("getter")).toHaveTextContent("Getter value : 18");
//   });

//   it("Checks clicking the increment button increments the state", async () => {
//     const { getByTestId } = render(TestComponentVue, {
//       global: { plugins: [pinia] },
//     });

//     await fireEvent.click(getByTestId("increment"));
//     await waitFor(() => {
//       expect(getByTestId("counter")).toHaveTextContent("Counter value : 10");
//     });
//     await waitFor(() => {
//       expect(getByTestId("getter")).toHaveTextContent("Getter value : 20");
//     });
//   });
// });
