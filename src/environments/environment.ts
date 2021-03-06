// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  gateway: 'ws://irc.network.org:8091/webirc/websocket/',
  saveLastMessages: localStorage.getItem('logSize') ? parseInt(localStorage.getItem('logSize')) : 50 // -50 last 50, https://developer.mozilla.org/es/docs/Web/JavaScript/Referencia/Objetos_globales/Array/slice
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
