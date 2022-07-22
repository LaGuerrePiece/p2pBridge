import { DefineComponent } from "vue"
declare module "vue" {
  function withAsyncContext(...args: any): any
}