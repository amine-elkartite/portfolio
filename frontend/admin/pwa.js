(() => {
  if (!('serviceWorker' in navigator)) return;

  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/admin/sw.js', { scope: '/admin/' }).catch((error) => {
      console.warn('Admin PWA service worker registration failed:', error);
    });
  });
})();
