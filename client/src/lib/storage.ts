import localforage from 'localforage';

export const userStore = localforage.createInstance({
  name: 'rakshak-sindoor',
  storeName: 'users',
});

export const messageStore = localforage.createInstance({
  name: 'rakshak-sindoor',
  storeName: 'messages',
});

export const communityStore = localforage.createInstance({
  name: 'rakshak-sindoor',
  storeName: 'communities',
});

export const markerStore = localforage.createInstance({
  name: 'rakshak-sindoor',
  storeName: 'markers',
});

export const settingsStore = localforage.createInstance({
  name: 'rakshak-sindoor',
  storeName: 'settings',
});
