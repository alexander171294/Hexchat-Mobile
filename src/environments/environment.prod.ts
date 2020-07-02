export const environment = {
  production: true,
  gateway: 'ws://irc.tandilserver.com:8091/webirc/websocket/',
  saveLastMessages: localStorage.getItem('logSize') ? parseInt(localStorage.getItem('logSize')) : 50
};
