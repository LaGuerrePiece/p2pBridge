import {
  RouteRecordRaw,
  Router,
  createRouter,
  createWebHashHistory,
} from "vue-router";

export const RouteNames =  {
  BridgeTokens: "BridgeTokens",
  ProvideBridge: "ProvideBridge",
}

let routes: RouteRecordRaw[] = [
  { path: "/", redirect: { name: RouteNames.BridgeTokens }},
  {
    path: "/bridgeTokens",
    component: () =>
      import(
        /* webpackPreload: true */ "../component/Pages/BridgeTokens/BridgeTokens.vue"
      ),
    name: RouteNames.BridgeTokens,
  },
  {
    path: "/provideBridge",
    component: () =>
      import(
        /* webpackPreload: true */ "../component/Pages/ProvideBridge/ProvideBridge.vue"
      ),
    name: RouteNames.ProvideBridge,
  },
];

const router: Router = createRouter({
  history: createWebHashHistory(),
  routes,
});

router.beforeEach((to, from) => {
  document.title = `Bridge Dex | ${String(to.name)}`;
});

export default router;
