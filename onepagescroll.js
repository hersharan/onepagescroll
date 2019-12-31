/*
 * onepagescroll.js v1.0.0
 * Athuor : Mystika
 * Fork this script on github https://github.com/mystika/onepagescroll
 * http://mystika.me
*/

export default function onepagescroll(selector, options) {
  const pages = [];
  let currentPage = 1;
  let isPageChanging = false;
  const keyUp = { 38: 1, 33: 1 };
  const keyDown = { 40: 1, 34: 1 };

  const def = {
    pageContainer: 'section',
    animationType: 'ease-in-out',
    animationTime: 500,
    infinite: true,
    pagination: true,
    keyboard: true,
    direction: 'vertical',
  };

  /* dected transitions completion for block duplicated scrolling */
  function detectTransitionEnd() {
    let t;
    const el = document.createElement('fakeelement');
    const transitions = {
      transition: 'transitionend',
      OTransition: 'oTransitionEnd',
      MozTransition: 'transitionend',
      WebkitTransition: 'webkitTransitionEnd',
    };

    for (t in transitions) {
      if (el.style[t] !== undefined) { return transitions[t]; }
    }
    return true;
  }


  /* css setter */
  function css(obj, styles) {
    for (let _style in styles) {
      if (obj.style[_style] !== undefined) {
        obj.style[_style] = styles[_style];
      }
    }
  }

  /* extend function for user customization */
  function extend() {
    for (let i = 1; i < arguments.length; i++) {
      for (let key in arguments[i]) {
        if (arguments[i].hasOwnProperty(key)) {
          arguments[0][key] = arguments[i][key];
        }
      }
    }
    return arguments[0];
  }

  const setting = extend({}, def, options);

  // function for page transition
  function changePage(compare, edge, increase) {
    if (isPageChanging) return;

    if (currentPage === compare) {
      if (setting.infinite) {
        currentPage = edge;
      } else return;
    } else {
      currentPage += increase;
    }

    if (setting.animationTime) isPageChanging = true;

    if (setting.pagination) {
      document.querySelector('a.active[data-targetindex]').classList.remove('active');
      document.querySelector(`a[data-targetindex="${currentPage}"]`).classList.add('active');
    }
    if (setting.direction === 'vertical') {
      css(document.querySelector(selector), {
        transform: `translate3d(0,${-(currentPage - 1) * 100}%,0)`,
      });
    } else if (setting.direction === 'horizontal') {
      css(document.querySelector(selector), {
        transform: `translate3d(${-(currentPage - 1) * 100}%,0,0)`,
      });
    }
  }

  /* swipe */
  let fpos = 0;
  let lpos = 0;
  const n = 90;

  // bind touch
  document.addEventListener('touchstart', (e) => {
    e.preventDefault();
    if (e.type === 'touchstart' || e.type === 'touchmove' || e.type === 'touchend' || e.type === 'touchcancel') {
      const touch = e.touches[0] || e.changedTouches[0];
      if (setting.direction === 'vertical') {
        fpos = touch.pageY;
      } else if (setting.direction === 'horizontal') {
        fpos = touch.pageX;
      }
    }
  });

  document.addEventListener('touchend', (e) => {
    e.preventDefault();
    if (e.type === 'touchstart' || e.type === 'touchmove' || e.type === 'touchend' || e.type === 'touchcancel') {
      const touch = e.touches[0] || e.changedTouches[0];
      if (setting.direction === 'vertical') {
        lpos = touch.pageY;
      } else if (setting.direction === 'horizontal') {
        lpos = touch.pageX;
      }
    }
    if (fpos + n < lpos) {
      changePage(1, pages.length, -1);
    } else if (fpos > lpos + n) {
      changePage(pages.length, 1, 1);
    }
  });

  /* wheel event handler */
  function onScrollEventHandler(e) {
    if (e.wheelDelta > 0) {
      changePage(1, pages.length, -1);
    } else {
      changePage(pages.length, 1, 1);
    }
  }

  /* initialization */
  function init() {
    window.addEventListener('wheel', onScrollEventHandler);

    css(document.querySelector(selector), {
      transition: `transform ${setting.animationTime}ms ${setting.animationType}`,
    });

    // allow keyboard input
    if (setting.keyboard) {
      window.addEventListener('keydown', (e) => {
        if (keyUp[e.keyCode]) {
          changePage(1, pages.length, -1);
        } else if (keyDown[e.keyCode]) {
          changePage(pages.length, 1, 1);
        }
      });
    }

    document.querySelector(selector).classList.add('ops-container');

    detectTransitionEnd() && document.querySelector(selector).addEventListener(detectTransitionEnd(), () => {
      isPageChanging = false;
    });

    let bulletListContainer = null;
    /* create navigation bullets */
    if (setting.pagination) {
      bulletListContainer = document.createElement('ul');
      bulletListContainer.classList.add('ops-navigation');
    }

    let index = 1;
    [].forEach.call(document.querySelectorAll(`${selector} > ${setting.pageContainer}`), (obj) => {
      if (setting.pagination) {
        const bulletList = document.createElement('li');
        const bullet = document.createElement('a');
        bullet.setAttribute('data-targetindex', index);
        bullet.href = '#';
        bulletList.appendChild(bullet);
        bulletListContainer.appendChild(bulletList);
      }

      obj.classList.add('ops-page');

      if (setting.direction === 'horizontal') {
        css(obj, {
          left: `${(index - 1) * 100}%`,
          position: 'absolute',
        });
      }

      pages.push(obj);
      obj.setAttribute('data-pageindex', index++);
    });

    if (setting.pagination) {
      document.body.appendChild(bulletListContainer);
      document.querySelector(`a[data-targetindex="${currentPage}"]`).classList.add('active');
    }


  }
  /* check documents ready statement and do init() */
  if (document.readyState === 'complete') { init(); } else { window.addEventListener('onload', init(), false); }
}
