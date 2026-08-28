import { useEffect, useRef } from 'react';
import './NativeAdBanner.css';

// Adsterra Native Banner (4:1 widget).
// The provider's invoke.js scans the DOM for the matching container id and
// fills it with native ad cards, so we render the container and append the
// script inside a React-rendered wrapper:
//   - on unmount React removes the wrapper (script + container go with it),
//   - on the next mount a fresh script tag is appended, so ads re-render
//     correctly after client-side route changes,
//   - the presence check keeps React StrictMode's double-invoked effects
//     from injecting the script twice in development.
const AD_SCRIPT_SRC =
  'https://pl31067654.profitableratecpmnetwork.com/798e2ad51ed0e4acc4feeaf9ab04726c/invoke.js';
const AD_CONTAINER_ID = 'container-798e2ad51ed0e4acc4feeaf9ab04726c';

const NativeAdBanner = ({ className = '' }) => {
  const wrapRef = useRef(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap || wrap.querySelector('script[data-native-ad]')) return;

    const script = document.createElement('script');
    script.src = AD_SCRIPT_SRC;
    script.async = true;
    // Keep Cloudflare Rocket Loader from re-deferring the ad script.
    script.setAttribute('data-cfasync', 'false');
    script.setAttribute('data-native-ad', 'true');
    wrap.appendChild(script);
  }, []);

  return (
    <aside ref={wrapRef} className={`native-ad ${className}`.trim()}>
      <span className="native-ad__label">Advertisement</span>
      <div id={AD_CONTAINER_ID} className="native-ad__container" />
    </aside>
  );
};

export default NativeAdBanner;