// Page transition: a dark curtain that wipes up to reveal each page on
// load, and wipes back down to cover the screen before navigating away —
// so moving between pages feels like one continuous motion.
(function(){
  const overlay = document.getElementById('pageTransition');
  if (!overlay) return;

  function revealPage(){
    requestAnimationFrame(() => {
      requestAnimationFrame(() => overlay.classList.add('is-open'));
    });
  }

  function coverThenRun(afterCovered){
    overlay.classList.remove('is-open');
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      overlay.removeEventListener('transitionend', onEnd);
      afterCovered();
    };
    const onEnd = (e) => { if (e.propertyName === 'transform') finish(); };
    overlay.addEventListener('transitionend', onEnd);
    // Safety net in case transitionend doesn't fire (reduced motion, etc.)
    setTimeout(finish, 750);
  }

  // Reveal the current page shortly after it loads.
  if (document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', () => setTimeout(revealPage, 120));
  } else {
    setTimeout(revealPage, 120);
  }

  // Used by custom navigation flows (e.g. the projects timeline) that
  // need to finish their own animation before the page actually changes.
  window.pageTransitionTo = function(href){
    coverThenRun(() => { window.location.href = href; });
  };

  // Intercept ordinary link clicks to other pages on this site so they
  // get the same wipe instead of a hard cut.
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a[href$=".html"]');
    if (!link) return;
    if (link.hasAttribute('data-no-transition')) return;
    if (link.target === '_blank' || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    if (link.origin !== window.location.origin) return;
    e.preventDefault();
    window.pageTransitionTo(link.href);
  });
})();
