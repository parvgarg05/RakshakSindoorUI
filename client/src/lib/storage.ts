import localforage from 'localforage';

export const userStore = localforage.createInstance({
  name: 'rakshak-ResQ',
  storeName: 'users',
});

export const messageStore = localforage.createInstance({
  name: 'rakshak-ResQ',
  storeName: 'messages',
});

export const communityStore = localforage.createInstance({
  name: 'rakshak-ResQ',
  storeName: 'communities',
});

export const markerStore = localforage.createInstance({
  name: 'rakshak-ResQ',
  storeName: 'markers',
});

export const settingsStore = localforage.createInstance({
  name: 'rakshak-ResQ',
  storeName: 'settings',
});
