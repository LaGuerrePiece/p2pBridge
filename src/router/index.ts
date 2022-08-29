// import {
//   RouteRecordRaw,
//   Router,
//   createRouter,
//   createWebHashHistory,
// } from "vue-router";

// export const RouteNames = {
//   BridgeTokens: "BridgeTokens",
//   ProvideBridge: "ProvideBridge",
// };

// let routes: RouteRecordRaw[] = [
//   { path: "/", redirect: { name: RouteNames.BridgeTokensRequest } },
//   {
//     path: "/bridgeTokens",
//     component: () =>
//       import(
//         /* webpackPreload: true */ "../component/Pages/BridgeTokens/BridgeTokens.vue"
//       ),
//     name: RouteNames.BridgeTokens,
//     meta: { title: "New Request" },
//     children: [
//       {
//         path: "",
//         component: () =>
//           import(
//             /* webpackPreload: true */ "../component/Pages/BridgeTokens/BridgeRequest/BridgeRequest.vue"
//           ),
//         name: RouteNames.BridgeTokensRequest,
//         meta: { title: "New Request" },
//       },
//       {
//         path: "myrequest/:id",
//         component: () =>
//           import(
//             /* webpackPreload: true */ "../component/Pages/BridgeTokens/MyBridgeRequests/DisplayMyBrigeRequest.vue"
//           ),
//         name: RouteNames.BridgeTokensDisplayRequest,
//         props: true,
//         meta: { title: "My Requests" },
//       },
//     ],
//   },
//   {
//     path: "/provideBridge",
//     component: () =>
//       import(
//         /* webpackPreload: true */ "../component/Pages/ProvideBridge/ProvideBridge.vue"
//       ),
//     name: RouteNames.ProvideBridge,
//     meta: { title: "Provide Bridge" },
//   },
// ];

// const router: Router = createRouter({
//   history: createWebHashHistory(),
//   routes,
// });

// router.beforeEach((to, from) => {
//   document.title = `Bridge Dex | ${String(to.meta.title)}`;
// });

// export default router;
