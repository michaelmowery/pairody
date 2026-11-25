// Pairody inside the iOS or Android app (Capacitor) instead of a browser tab.
// Loaded first on every page. In the app it:
//   - adds class "native" to <html>, so CSS can hide web-only bits (.web-only) and show
//     app-only ones (.native-only): no Your music beta, no "Check for updates" (the App Store
//     does that), no "flip off silent mode" tip;
//   - also adds "ios" or "android", so .ios-only / .android-only pick between the two apps;
//   - sets window.PairodyNative = true and window.PairodyPlatform ('ios' or 'android') for the
//     other scripts (update.js, analytics.js, plus.js);
//   - asks WebKit to treat the page's audio as playback, so the pads are heard with the
//     ring/silent switch on (the app's AppDelegate sets the same thing natively).
// In a browser it does nothing.
(function(){
  const C = window.Capacitor;
  const native = !!(C && typeof C.isNativePlatform === 'function' && C.isNativePlatform());
  window.PairodyNative = native;
  window.PairodyPlatform = native ? (C.getPlatform && C.getPlatform()) || 'ios' : 'web';
  if (!native) return;
  document.documentElement.classList.add('native', window.PairodyPlatform);
  try { if (navigator.audioSession) navigator.audioSession.type = 'playback'; } catch(e){ /* older iOS */ }
})();
