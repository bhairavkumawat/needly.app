/**
 * Smoothly scrolls the window and any active app scroll containers to top.
 */
export const scrollToTop = () => {
  // 1. Standard window scroll
  try {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  } catch {
    window.scrollTo(0, 0);
  }

  // 2. document scrolling element (documentElement / body)
  const docEl = document.scrollingElement || document.documentElement || document.body;
  if (docEl) {
    try {
      docEl.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    } catch {
      docEl.scrollTop = 0;
    }
  }

  if (document.body && document.body !== docEl) {
    try {
      document.body.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    } catch {
      document.body.scrollTop = 0;
    }
  }

  // 3. App containers or specific screens
  const containerIds = [
    'needly-app-container',
    'root',
    'needly-home-screen',
    'needly-inbox-screen',
    'needly-requests-screen',
    'needly-profile-screen',
    'needly-create-screen'
  ];

  containerIds.forEach((id) => {
    const el = document.getElementById(id);
    if (el) {
      try {
        el.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
      } catch {
        el.scrollTop = 0;
      }
    }
  });

  const main = document.querySelector('main');
  if (main) {
    try {
      main.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    } catch {
      main.scrollTop = 0;
    }
  }
};
