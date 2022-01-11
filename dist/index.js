/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./node_modules/atoa/atoa.js":
/*!***********************************!*\
  !*** ./node_modules/atoa/atoa.js ***!
  \***********************************/
/***/ ((module) => {

module.exports = function atoa (a, n) { return Array.prototype.slice.call(a, n); }


/***/ }),

/***/ "./node_modules/contra/debounce.js":
/*!*****************************************!*\
  !*** ./node_modules/contra/debounce.js ***!
  \*****************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var ticky = __webpack_require__(/*! ticky */ "./node_modules/ticky/ticky-browser.js");

module.exports = function debounce (fn, args, ctx) {
  if (!fn) { return; }
  ticky(function run () {
    fn.apply(ctx || null, args || []);
  });
};


/***/ }),

/***/ "./node_modules/contra/emitter.js":
/*!****************************************!*\
  !*** ./node_modules/contra/emitter.js ***!
  \****************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var atoa = __webpack_require__(/*! atoa */ "./node_modules/atoa/atoa.js");
var debounce = __webpack_require__(/*! ./debounce */ "./node_modules/contra/debounce.js");

module.exports = function emitter (thing, options) {
  var opts = options || {};
  var evt = {};
  if (thing === undefined) { thing = {}; }
  thing.on = function (type, fn) {
    if (!evt[type]) {
      evt[type] = [fn];
    } else {
      evt[type].push(fn);
    }
    return thing;
  };
  thing.once = function (type, fn) {
    fn._once = true; // thing.off(fn) still works!
    thing.on(type, fn);
    return thing;
  };
  thing.off = function (type, fn) {
    var c = arguments.length;
    if (c === 1) {
      delete evt[type];
    } else if (c === 0) {
      evt = {};
    } else {
      var et = evt[type];
      if (!et) { return thing; }
      et.splice(et.indexOf(fn), 1);
    }
    return thing;
  };
  thing.emit = function () {
    var args = atoa(arguments);
    return thing.emitterSnapshot(args.shift()).apply(this, args);
  };
  thing.emitterSnapshot = function (type) {
    var et = (evt[type] || []).slice(0);
    return function () {
      var args = atoa(arguments);
      var ctx = this || thing;
      if (type === 'error' && opts.throws !== false && !et.length) { throw args.length === 1 ? args[0] : args; }
      et.forEach(function emitter (listen) {
        if (opts.async) { debounce(listen, args, ctx); } else { listen.apply(ctx, args); }
        if (listen._once) { thing.off(type, listen); }
      });
      return thing;
    };
  };
  return thing;
};


/***/ }),

/***/ "./node_modules/crossvent/src/crossvent.js":
/*!*************************************************!*\
  !*** ./node_modules/crossvent/src/crossvent.js ***!
  \*************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var customEvent = __webpack_require__(/*! custom-event */ "./node_modules/custom-event/index.js");
var eventmap = __webpack_require__(/*! ./eventmap */ "./node_modules/crossvent/src/eventmap.js");
var doc = __webpack_require__.g.document;
var addEvent = addEventEasy;
var removeEvent = removeEventEasy;
var hardCache = [];

if (!__webpack_require__.g.addEventListener) {
  addEvent = addEventHard;
  removeEvent = removeEventHard;
}

module.exports = {
  add: addEvent,
  remove: removeEvent,
  fabricate: fabricateEvent
};

function addEventEasy (el, type, fn, capturing) {
  return el.addEventListener(type, fn, capturing);
}

function addEventHard (el, type, fn) {
  return el.attachEvent('on' + type, wrap(el, type, fn));
}

function removeEventEasy (el, type, fn, capturing) {
  return el.removeEventListener(type, fn, capturing);
}

function removeEventHard (el, type, fn) {
  var listener = unwrap(el, type, fn);
  if (listener) {
    return el.detachEvent('on' + type, listener);
  }
}

function fabricateEvent (el, type, model) {
  var e = eventmap.indexOf(type) === -1 ? makeCustomEvent() : makeClassicEvent();
  if (el.dispatchEvent) {
    el.dispatchEvent(e);
  } else {
    el.fireEvent('on' + type, e);
  }
  function makeClassicEvent () {
    var e;
    if (doc.createEvent) {
      e = doc.createEvent('Event');
      e.initEvent(type, true, true);
    } else if (doc.createEventObject) {
      e = doc.createEventObject();
    }
    return e;
  }
  function makeCustomEvent () {
    return new customEvent(type, { detail: model });
  }
}

function wrapperFactory (el, type, fn) {
  return function wrapper (originalEvent) {
    var e = originalEvent || __webpack_require__.g.event;
    e.target = e.target || e.srcElement;
    e.preventDefault = e.preventDefault || function preventDefault () { e.returnValue = false; };
    e.stopPropagation = e.stopPropagation || function stopPropagation () { e.cancelBubble = true; };
    e.which = e.which || e.keyCode;
    fn.call(el, e);
  };
}

function wrap (el, type, fn) {
  var wrapper = unwrap(el, type, fn) || wrapperFactory(el, type, fn);
  hardCache.push({
    wrapper: wrapper,
    element: el,
    type: type,
    fn: fn
  });
  return wrapper;
}

function unwrap (el, type, fn) {
  var i = find(el, type, fn);
  if (i) {
    var wrapper = hardCache[i].wrapper;
    hardCache.splice(i, 1); // free up a tad of memory
    return wrapper;
  }
}

function find (el, type, fn) {
  var i, item;
  for (i = 0; i < hardCache.length; i++) {
    item = hardCache[i];
    if (item.element === el && item.type === type && item.fn === fn) {
      return i;
    }
  }
}


/***/ }),

/***/ "./node_modules/crossvent/src/eventmap.js":
/*!************************************************!*\
  !*** ./node_modules/crossvent/src/eventmap.js ***!
  \************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var eventmap = [];
var eventname = '';
var ron = /^on/;

for (eventname in __webpack_require__.g) {
  if (ron.test(eventname)) {
    eventmap.push(eventname.slice(2));
  }
}

module.exports = eventmap;


/***/ }),

/***/ "./node_modules/custom-event/index.js":
/*!********************************************!*\
  !*** ./node_modules/custom-event/index.js ***!
  \********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {


var NativeCustomEvent = __webpack_require__.g.CustomEvent;

function useNative () {
  try {
    var p = new NativeCustomEvent('cat', { detail: { foo: 'bar' } });
    return  'cat' === p.type && 'bar' === p.detail.foo;
  } catch (e) {
  }
  return false;
}

/**
 * Cross-browser `CustomEvent` constructor.
 *
 * https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent.CustomEvent
 *
 * @public
 */

module.exports = useNative() ? NativeCustomEvent :

// IE >= 9
'undefined' !== typeof document && 'function' === typeof document.createEvent ? function CustomEvent (type, params) {
  var e = document.createEvent('CustomEvent');
  if (params) {
    e.initCustomEvent(type, params.bubbles, params.cancelable, params.detail);
  } else {
    e.initCustomEvent(type, false, false, void 0);
  }
  return e;
} :

// IE <= 8
function CustomEvent (type, params) {
  var e = document.createEventObject();
  e.type = type;
  if (params) {
    e.bubbles = Boolean(params.bubbles);
    e.cancelable = Boolean(params.cancelable);
    e.detail = params.detail;
  } else {
    e.bubbles = false;
    e.cancelable = false;
    e.detail = void 0;
  }
  return e;
}


/***/ }),

/***/ "./node_modules/dragula/classes.js":
/*!*****************************************!*\
  !*** ./node_modules/dragula/classes.js ***!
  \*****************************************/
/***/ ((module) => {

"use strict";


var cache = {};
var start = '(?:^|\\s)';
var end = '(?:\\s|$)';

function lookupClass (className) {
  var cached = cache[className];
  if (cached) {
    cached.lastIndex = 0;
  } else {
    cache[className] = cached = new RegExp(start + className + end, 'g');
  }
  return cached;
}

function addClass (el, className) {
  var current = el.className;
  if (!current.length) {
    el.className = className;
  } else if (!lookupClass(className).test(current)) {
    el.className += ' ' + className;
  }
}

function rmClass (el, className) {
  el.className = el.className.replace(lookupClass(className), ' ').trim();
}

module.exports = {
  add: addClass,
  rm: rmClass
};


/***/ }),

/***/ "./node_modules/dragula/dragula.js":
/*!*****************************************!*\
  !*** ./node_modules/dragula/dragula.js ***!
  \*****************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var emitter = __webpack_require__(/*! contra/emitter */ "./node_modules/contra/emitter.js");
var crossvent = __webpack_require__(/*! crossvent */ "./node_modules/crossvent/src/crossvent.js");
var classes = __webpack_require__(/*! ./classes */ "./node_modules/dragula/classes.js");
var doc = document;
var documentElement = doc.documentElement;

function dragula (initialContainers, options) {
  var len = arguments.length;
  if (len === 1 && Array.isArray(initialContainers) === false) {
    options = initialContainers;
    initialContainers = [];
  }
  var _mirror; // mirror image
  var _source; // source container
  var _item; // item being dragged
  var _offsetX; // reference x
  var _offsetY; // reference y
  var _moveX; // reference move x
  var _moveY; // reference move y
  var _initialSibling; // reference sibling when grabbed
  var _currentSibling; // reference sibling now
  var _copy; // item used for copying
  var _renderTimer; // timer for setTimeout renderMirrorImage
  var _lastDropTarget = null; // last container item was over
  var _grabbed; // holds mousedown context until first mousemove

  var o = options || {};
  if (o.moves === void 0) { o.moves = always; }
  if (o.accepts === void 0) { o.accepts = always; }
  if (o.invalid === void 0) { o.invalid = invalidTarget; }
  if (o.containers === void 0) { o.containers = initialContainers || []; }
  if (o.isContainer === void 0) { o.isContainer = never; }
  if (o.copy === void 0) { o.copy = false; }
  if (o.copySortSource === void 0) { o.copySortSource = false; }
  if (o.revertOnSpill === void 0) { o.revertOnSpill = false; }
  if (o.removeOnSpill === void 0) { o.removeOnSpill = false; }
  if (o.direction === void 0) { o.direction = 'vertical'; }
  if (o.ignoreInputTextSelection === void 0) { o.ignoreInputTextSelection = true; }
  if (o.mirrorContainer === void 0) { o.mirrorContainer = doc.body; }

  var drake = emitter({
    containers: o.containers,
    start: manualStart,
    end: end,
    cancel: cancel,
    remove: remove,
    destroy: destroy,
    canMove: canMove,
    dragging: false
  });

  if (o.removeOnSpill === true) {
    drake.on('over', spillOver).on('out', spillOut);
  }

  events();

  return drake;

  function isContainer (el) {
    return drake.containers.indexOf(el) !== -1 || o.isContainer(el);
  }

  function events (remove) {
    var op = remove ? 'remove' : 'add';
    touchy(documentElement, op, 'mousedown', grab);
    touchy(documentElement, op, 'mouseup', release);
  }

  function eventualMovements (remove) {
    var op = remove ? 'remove' : 'add';
    touchy(documentElement, op, 'mousemove', startBecauseMouseMoved);
  }

  function movements (remove) {
    var op = remove ? 'remove' : 'add';
    crossvent[op](documentElement, 'selectstart', preventGrabbed); // IE8
    crossvent[op](documentElement, 'click', preventGrabbed);
  }

  function destroy () {
    events(true);
    release({});
  }

  function preventGrabbed (e) {
    if (_grabbed) {
      e.preventDefault();
    }
  }

  function grab (e) {
    _moveX = e.clientX;
    _moveY = e.clientY;

    var ignore = whichMouseButton(e) !== 1 || e.metaKey || e.ctrlKey;
    if (ignore) {
      return; // we only care about honest-to-god left clicks and touch events
    }
    var item = e.target;
    var context = canStart(item);
    if (!context) {
      return;
    }
    _grabbed = context;
    eventualMovements();
    if (e.type === 'mousedown') {
      if (isInput(item)) { // see also: https://github.com/bevacqua/dragula/issues/208
        item.focus(); // fixes https://github.com/bevacqua/dragula/issues/176
      } else {
        e.preventDefault(); // fixes https://github.com/bevacqua/dragula/issues/155
      }
    }
  }

  function startBecauseMouseMoved (e) {
    if (!_grabbed) {
      return;
    }
    if (whichMouseButton(e) === 0) {
      release({});
      return; // when text is selected on an input and then dragged, mouseup doesn't fire. this is our only hope
    }

    // truthy check fixes #239, equality fixes #207, fixes #501
    if ((e.clientX !== void 0 && Math.abs(e.clientX - _moveX) <= (o.slideFactorX || 0)) &&
      (e.clientY !== void 0 && Math.abs(e.clientY - _moveY) <= (o.slideFactorY || 0))) {
      return;
    }

    if (o.ignoreInputTextSelection) {
      var clientX = getCoord('clientX', e) || 0;
      var clientY = getCoord('clientY', e) || 0;
      var elementBehindCursor = doc.elementFromPoint(clientX, clientY);
      if (isInput(elementBehindCursor)) {
        return;
      }
    }

    var grabbed = _grabbed; // call to end() unsets _grabbed
    eventualMovements(true);
    movements();
    end();
    start(grabbed);

    var offset = getOffset(_item);
    _offsetX = getCoord('pageX', e) - offset.left;
    _offsetY = getCoord('pageY', e) - offset.top;

    classes.add(_copy || _item, 'gu-transit');
    renderMirrorImage();
    drag(e);
  }

  function canStart (item) {
    if (drake.dragging && _mirror) {
      return;
    }
    if (isContainer(item)) {
      return; // don't drag container itself
    }
    var handle = item;
    while (getParent(item) && isContainer(getParent(item)) === false) {
      if (o.invalid(item, handle)) {
        return;
      }
      item = getParent(item); // drag target should be a top element
      if (!item) {
        return;
      }
    }
    var source = getParent(item);
    if (!source) {
      return;
    }
    if (o.invalid(item, handle)) {
      return;
    }

    var movable = o.moves(item, source, handle, nextEl(item));
    if (!movable) {
      return;
    }

    return {
      item: item,
      source: source
    };
  }

  function canMove (item) {
    return !!canStart(item);
  }

  function manualStart (item) {
    var context = canStart(item);
    if (context) {
      start(context);
    }
  }

  function start (context) {
    if (isCopy(context.item, context.source)) {
      _copy = context.item.cloneNode(true);
      drake.emit('cloned', _copy, context.item, 'copy');
    }

    _source = context.source;
    _item = context.item;
    _initialSibling = _currentSibling = nextEl(context.item);

    drake.dragging = true;
    drake.emit('drag', _item, _source);
  }

  function invalidTarget () {
    return false;
  }

  function end () {
    if (!drake.dragging) {
      return;
    }
    var item = _copy || _item;
    drop(item, getParent(item));
  }

  function ungrab () {
    _grabbed = false;
    eventualMovements(true);
    movements(true);
  }

  function release (e) {
    ungrab();

    if (!drake.dragging) {
      return;
    }
    var item = _copy || _item;
    var clientX = getCoord('clientX', e) || 0;
    var clientY = getCoord('clientY', e) || 0;
    var elementBehindCursor = getElementBehindPoint(_mirror, clientX, clientY);
    var dropTarget = findDropTarget(elementBehindCursor, clientX, clientY);
    if (dropTarget && ((_copy && o.copySortSource) || (!_copy || dropTarget !== _source))) {
      drop(item, dropTarget);
    } else if (o.removeOnSpill) {
      remove();
    } else {
      cancel();
    }
  }

  function drop (item, target) {
    var parent = getParent(item);
    if (_copy && o.copySortSource && target === _source) {
      parent.removeChild(_item);
    }
    if (isInitialPlacement(target)) {
      drake.emit('cancel', item, _source, _source);
    } else {
      drake.emit('drop', item, target, _source, _currentSibling);
    }
    cleanup();
  }

  function remove () {
    if (!drake.dragging) {
      return;
    }
    var item = _copy || _item;
    var parent = getParent(item);
    if (parent) {
      parent.removeChild(item);
    }
    drake.emit(_copy ? 'cancel' : 'remove', item, parent, _source);
    cleanup();
  }

  function cancel (revert) {
    if (!drake.dragging) {
      return;
    }
    var reverts = arguments.length > 0 ? revert : o.revertOnSpill;
    var item = _copy || _item;
    var parent = getParent(item);
    var initial = isInitialPlacement(parent);
    if (initial === false && reverts) {
      if (_copy) {
        if (parent) {
          parent.removeChild(_copy);
        }
      } else {
        _source.insertBefore(item, _initialSibling);
      }
    }
    if (initial || reverts) {
      drake.emit('cancel', item, _source, _source);
    } else {
      drake.emit('drop', item, parent, _source, _currentSibling);
    }
    cleanup();
  }

  function cleanup () {
    var item = _copy || _item;
    ungrab();
    removeMirrorImage();
    if (item) {
      classes.rm(item, 'gu-transit');
    }
    if (_renderTimer) {
      clearTimeout(_renderTimer);
    }
    drake.dragging = false;
    if (_lastDropTarget) {
      drake.emit('out', item, _lastDropTarget, _source);
    }
    drake.emit('dragend', item);
    _source = _item = _copy = _initialSibling = _currentSibling = _renderTimer = _lastDropTarget = null;
  }

  function isInitialPlacement (target, s) {
    var sibling;
    if (s !== void 0) {
      sibling = s;
    } else if (_mirror) {
      sibling = _currentSibling;
    } else {
      sibling = nextEl(_copy || _item);
    }
    return target === _source && sibling === _initialSibling;
  }

  function findDropTarget (elementBehindCursor, clientX, clientY) {
    var target = elementBehindCursor;
    while (target && !accepted()) {
      target = getParent(target);
    }
    return target;

    function accepted () {
      var droppable = isContainer(target);
      if (droppable === false) {
        return false;
      }

      var immediate = getImmediateChild(target, elementBehindCursor);
      var reference = getReference(target, immediate, clientX, clientY);
      var initial = isInitialPlacement(target, reference);
      if (initial) {
        return true; // should always be able to drop it right back where it was
      }
      return o.accepts(_item, target, _source, reference);
    }
  }

  function drag (e) {
    if (!_mirror) {
      return;
    }
    e.preventDefault();

    var clientX = getCoord('clientX', e) || 0;
    var clientY = getCoord('clientY', e) || 0;
    var x = clientX - _offsetX;
    var y = clientY - _offsetY;

    _mirror.style.left = x + 'px';
    _mirror.style.top = y + 'px';

    var item = _copy || _item;
    var elementBehindCursor = getElementBehindPoint(_mirror, clientX, clientY);
    var dropTarget = findDropTarget(elementBehindCursor, clientX, clientY);
    var changed = dropTarget !== null && dropTarget !== _lastDropTarget;
    if (changed || dropTarget === null) {
      out();
      _lastDropTarget = dropTarget;
      over();
    }
    var parent = getParent(item);
    if (dropTarget === _source && _copy && !o.copySortSource) {
      if (parent) {
        parent.removeChild(item);
      }
      return;
    }
    var reference;
    var immediate = getImmediateChild(dropTarget, elementBehindCursor);
    if (immediate !== null) {
      reference = getReference(dropTarget, immediate, clientX, clientY);
    } else if (o.revertOnSpill === true && !_copy) {
      reference = _initialSibling;
      dropTarget = _source;
    } else {
      if (_copy && parent) {
        parent.removeChild(item);
      }
      return;
    }
    if (
      (reference === null && changed) ||
      reference !== item &&
      reference !== nextEl(item)
    ) {
      _currentSibling = reference;
      dropTarget.insertBefore(item, reference);
      drake.emit('shadow', item, dropTarget, _source);
    }
    function moved (type) { drake.emit(type, item, _lastDropTarget, _source); }
    function over () { if (changed) { moved('over'); } }
    function out () { if (_lastDropTarget) { moved('out'); } }
  }

  function spillOver (el) {
    classes.rm(el, 'gu-hide');
  }

  function spillOut (el) {
    if (drake.dragging) { classes.add(el, 'gu-hide'); }
  }

  function renderMirrorImage () {
    if (_mirror) {
      return;
    }
    var rect = _item.getBoundingClientRect();
    _mirror = _item.cloneNode(true);
    _mirror.style.width = getRectWidth(rect) + 'px';
    _mirror.style.height = getRectHeight(rect) + 'px';
    classes.rm(_mirror, 'gu-transit');
    classes.add(_mirror, 'gu-mirror');
    o.mirrorContainer.appendChild(_mirror);
    touchy(documentElement, 'add', 'mousemove', drag);
    classes.add(o.mirrorContainer, 'gu-unselectable');
    drake.emit('cloned', _mirror, _item, 'mirror');
  }

  function removeMirrorImage () {
    if (_mirror) {
      classes.rm(o.mirrorContainer, 'gu-unselectable');
      touchy(documentElement, 'remove', 'mousemove', drag);
      getParent(_mirror).removeChild(_mirror);
      _mirror = null;
    }
  }

  function getImmediateChild (dropTarget, target) {
    var immediate = target;
    while (immediate !== dropTarget && getParent(immediate) !== dropTarget) {
      immediate = getParent(immediate);
    }
    if (immediate === documentElement) {
      return null;
    }
    return immediate;
  }

  function getReference (dropTarget, target, x, y) {
    var horizontal = o.direction === 'horizontal';
    var reference = target !== dropTarget ? inside() : outside();
    return reference;

    function outside () { // slower, but able to figure out any position
      var len = dropTarget.children.length;
      var i;
      var el;
      var rect;
      for (i = 0; i < len; i++) {
        el = dropTarget.children[i];
        rect = el.getBoundingClientRect();
        if (horizontal && (rect.left + rect.width / 2) > x) { return el; }
        if (!horizontal && (rect.top + rect.height / 2) > y) { return el; }
      }
      return null;
    }

    function inside () { // faster, but only available if dropped inside a child element
      var rect = target.getBoundingClientRect();
      if (horizontal) {
        return resolve(x > rect.left + getRectWidth(rect) / 2);
      }
      return resolve(y > rect.top + getRectHeight(rect) / 2);
    }

    function resolve (after) {
      return after ? nextEl(target) : target;
    }
  }

  function isCopy (item, container) {
    return typeof o.copy === 'boolean' ? o.copy : o.copy(item, container);
  }
}

function touchy (el, op, type, fn) {
  var touch = {
    mouseup: 'touchend',
    mousedown: 'touchstart',
    mousemove: 'touchmove'
  };
  var pointers = {
    mouseup: 'pointerup',
    mousedown: 'pointerdown',
    mousemove: 'pointermove'
  };
  var microsoft = {
    mouseup: 'MSPointerUp',
    mousedown: 'MSPointerDown',
    mousemove: 'MSPointerMove'
  };
  if (__webpack_require__.g.navigator.pointerEnabled) {
    crossvent[op](el, pointers[type], fn);
  } else if (__webpack_require__.g.navigator.msPointerEnabled) {
    crossvent[op](el, microsoft[type], fn);
  } else {
    crossvent[op](el, touch[type], fn);
    crossvent[op](el, type, fn);
  }
}

function whichMouseButton (e) {
  if (e.touches !== void 0) { return e.touches.length; }
  if (e.which !== void 0 && e.which !== 0) { return e.which; } // see https://github.com/bevacqua/dragula/issues/261
  if (e.buttons !== void 0) { return e.buttons; }
  var button = e.button;
  if (button !== void 0) { // see https://github.com/jquery/jquery/blob/99e8ff1baa7ae341e94bb89c3e84570c7c3ad9ea/src/event.js#L573-L575
    return button & 1 ? 1 : button & 2 ? 3 : (button & 4 ? 2 : 0);
  }
}

function getOffset (el) {
  var rect = el.getBoundingClientRect();
  return {
    left: rect.left + getScroll('scrollLeft', 'pageXOffset'),
    top: rect.top + getScroll('scrollTop', 'pageYOffset')
  };
}

function getScroll (scrollProp, offsetProp) {
  if (typeof __webpack_require__.g[offsetProp] !== 'undefined') {
    return __webpack_require__.g[offsetProp];
  }
  if (documentElement.clientHeight) {
    return documentElement[scrollProp];
  }
  return doc.body[scrollProp];
}

function getElementBehindPoint (point, x, y) {
  point = point || {};
  var state = point.className || '';
  var el;
  point.className += ' gu-hide';
  el = doc.elementFromPoint(x, y);
  point.className = state;
  return el;
}

function never () { return false; }
function always () { return true; }
function getRectWidth (rect) { return rect.width || (rect.right - rect.left); }
function getRectHeight (rect) { return rect.height || (rect.bottom - rect.top); }
function getParent (el) { return el.parentNode === doc ? null : el.parentNode; }
function isInput (el) { return el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT' || isEditable(el); }
function isEditable (el) {
  if (!el) { return false; } // no parents were editable
  if (el.contentEditable === 'false') { return false; } // stop the lookup
  if (el.contentEditable === 'true') { return true; } // found a contentEditable element in the chain
  return isEditable(getParent(el)); // contentEditable is set to 'inherit'
}

function nextEl (el) {
  return el.nextElementSibling || manually();
  function manually () {
    var sibling = el;
    do {
      sibling = sibling.nextSibling;
    } while (sibling && sibling.nodeType !== 1);
    return sibling;
  }
}

function getEventHost (e) {
  // on touchend event, we have to use `e.changedTouches`
  // see http://stackoverflow.com/questions/7192563/touchend-event-properties
  // see https://github.com/bevacqua/dragula/issues/34
  if (e.targetTouches && e.targetTouches.length) {
    return e.targetTouches[0];
  }
  if (e.changedTouches && e.changedTouches.length) {
    return e.changedTouches[0];
  }
  return e;
}

function getCoord (coord, e) {
  var host = getEventHost(e);
  var missMap = {
    pageX: 'clientX', // IE8
    pageY: 'clientY' // IE8
  };
  if (coord in missMap && !(coord in host) && missMap[coord] in host) {
    coord = missMap[coord];
  }
  return host[coord];
}

module.exports = dragula;


/***/ }),

/***/ "./node_modules/ticky/ticky-browser.js":
/*!*********************************************!*\
  !*** ./node_modules/ticky/ticky-browser.js ***!
  \*********************************************/
/***/ ((module) => {

var si = typeof setImmediate === 'function', tick;
if (si) {
  tick = function (fn) { setImmediate(fn); };
} else {
  tick = function (fn) { setTimeout(fn, 0); };
}

module.exports = tick;

/***/ }),

/***/ "./ts/EventListener.ts":
/*!*****************************!*\
  !*** ./ts/EventListener.ts ***!
  \*****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "EventListener": () => (/* binding */ EventListener)
/* harmony export */ });
class EventListener {
    constructor() {
        this.listeners = {};
    }
    add(listenerID, event, element, handler) {
        this.listeners[listenerID] = {
            event,
            element,
            handler,
        };
        element.addEventListener(event, handler);
    }
    remove(listenerId) {
        const listener = this.listeners[listenerId];
        if (!listener) {
            return;
        }
        listener.element.removeEventListener(listener.event, listener.handler);
        delete this.listeners[listenerId];
    }
}


/***/ }),

/***/ "./ts/Task.ts":
/*!********************!*\
  !*** ./ts/Task.ts ***!
  \********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "statusMap": () => (/* binding */ statusMap),
/* harmony export */   "Task": () => (/* binding */ Task)
/* harmony export */ });
/* harmony import */ var uuid__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! uuid */ "./node_modules/uuid/dist/esm-browser/v4.js");
/* harmony import */ var uuid__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! uuid */ "./node_modules/uuid/dist/esm-browser/validate.js");

const statusMap = {
    todo: 'Todo',
    doing: 'Doing',
    done: 'Done',
};
class Task {
    constructor(properties) {
        this.id = properties.id || (0,uuid__WEBPACK_IMPORTED_MODULE_0__["default"])();
        this.title = properties.title;
        this.status = properties.status || statusMap.todo;
    }
    update(properties) {
        this.title = properties.title || this.title;
        this.status = properties.status || this.status;
    }
    static validate(value) {
        if (!value)
            return false;
        if (!(0,uuid__WEBPACK_IMPORTED_MODULE_1__["default"])(value.id))
            return false;
        if (!value.title)
            return false;
        if (!Object.values(statusMap).includes(value.status))
            return false;
        return true;
    }
}


/***/ }),

/***/ "./ts/TaskCollection.ts":
/*!******************************!*\
  !*** ./ts/TaskCollection.ts ***!
  \******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "TaskCollection": () => (/* binding */ TaskCollection)
/* harmony export */ });
/* harmony import */ var _Task__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./Task */ "./ts/Task.ts");

const STORAGE_KEY = 'TASKS';
class TaskCollection {
    constructor() {
        this.tasks = [];
        this.storage = localStorage;
        this.tasks = this.getStoredTasks();
    }
    add(task) {
        this.tasks.push(task);
        this.updateStorage();
    }
    delete(task) {
        this.tasks = this.tasks.filter(t => t.id !== task.id);
        this.updateStorage();
    }
    find(id) {
        return this.tasks.find(t => t.id === id) || null;
    }
    update(task) {
        this.tasks = this.tasks.map((item) => {
            if (item.id === task.id) {
                return task;
            }
            return item;
        });
    }
    filter(filterStatus) {
        return this.tasks.filter(({ status }) => status === filterStatus);
    }
    updateStorage() {
        this.storage.setItem(STORAGE_KEY, JSON.stringify(this.tasks));
    }
    getStoredTasks() {
        const jsonString = this.storage.getItem(STORAGE_KEY);
        if (!jsonString)
            return [];
        try {
            const storedTasks = JSON.parse(jsonString);
            assertIsTaskObjects(storedTasks);
            const tasks = storedTasks.map(t => new _Task__WEBPACK_IMPORTED_MODULE_0__.Task(t));
            return tasks;
        }
        catch (e) {
            this.storage.removeItem(STORAGE_KEY);
            return [];
        }
    }
}
function assertIsTaskObjects(value) {
    if (!Array.isArray(value) || !value.every((item) => _Task__WEBPACK_IMPORTED_MODULE_0__.Task.validate(item))) {
        throw new Error('引数「value」は TaskObject[] 型と一致しません。');
    }
}


/***/ }),

/***/ "./ts/TaskRenderer.ts":
/*!****************************!*\
  !*** ./ts/TaskRenderer.ts ***!
  \****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "TaskRenderer": () => (/* binding */ TaskRenderer)
/* harmony export */ });
/* harmony import */ var dragula__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! dragula */ "./node_modules/dragula/dragula.js");
/* harmony import */ var dragula__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(dragula__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _Task__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./Task */ "./ts/Task.ts");


class TaskRenderer {
    constructor(todoList, doingList, doneList) {
        this.todoList = todoList;
        this.doingList = doingList;
        this.doneList = doneList;
    }
    append(task) {
        const { taskEl, deleteButtonEl } = this.render(task);
        this.todoList.append(taskEl);
        return { deleteButtonEl };
    }
    renderAll(taskCollection) {
        const todoTasks = this.renderList(taskCollection.filter(_Task__WEBPACK_IMPORTED_MODULE_1__.statusMap.todo), this.todoList);
        const doingTasks = this.renderList(taskCollection.filter(_Task__WEBPACK_IMPORTED_MODULE_1__.statusMap.doing), this.doingList);
        const doneTasks = this.renderList(taskCollection.filter(_Task__WEBPACK_IMPORTED_MODULE_1__.statusMap.done), this.doneList);
        return [...todoTasks, ...doingTasks, ...doneTasks];
    }
    render(task) {
        // <div class="taskItem">
        //   <span>タイトル</span>
        //   <button>削除</button>
        // </div>
        const taskEl = document.createElement('div');
        const spanEl = document.createElement('span');
        const deleteButtonEl = document.createElement('button');
        taskEl.id = task.id;
        taskEl.classList.add('task-item');
        spanEl.textContent = task.title;
        deleteButtonEl.textContent = '削除';
        taskEl.append(spanEl, deleteButtonEl);
        return { taskEl, deleteButtonEl };
    }
    renderList(tasks, listEl) {
        if (tasks.length === 0)
            return [];
        const taskList = [];
        tasks.forEach((task) => {
            const { taskEl, deleteButtonEl } = this.render(task);
            listEl.append(taskEl);
            taskList.push({ task, deleteButtonEl });
        });
        return taskList;
    }
    remove(task) {
        const taskEl = document.getElementById(task.id);
        if (!taskEl) {
            return;
        }
        if (task.status === _Task__WEBPACK_IMPORTED_MODULE_1__.statusMap.todo) {
            this.todoList.removeChild(taskEl);
        }
        if (task.status === _Task__WEBPACK_IMPORTED_MODULE_1__.statusMap.doing) {
            this.doingList.removeChild(taskEl);
        }
        if (task.status === _Task__WEBPACK_IMPORTED_MODULE_1__.statusMap.done) {
            this.doneList.removeChild(taskEl);
        }
    }
    subscribeDragAndDrop(onDrop) {
        dragula__WEBPACK_IMPORTED_MODULE_0___default()([this.todoList, this.doingList, this.doneList])
            .on('drop', (el, target, _source, sibling) => {
            let newStatus = _Task__WEBPACK_IMPORTED_MODULE_1__.statusMap.todo;
            if (target.id === 'doingList')
                newStatus = _Task__WEBPACK_IMPORTED_MODULE_1__.statusMap.doing;
            if (target.id === 'doneList')
                newStatus = _Task__WEBPACK_IMPORTED_MODULE_1__.statusMap.done;
            onDrop(el, sibling, newStatus);
        });
    }
    getId(el) {
        return el.id;
    }
}


/***/ }),

/***/ "./node_modules/uuid/dist/esm-browser/regex.js":
/*!*****************************************************!*\
  !*** ./node_modules/uuid/dist/esm-browser/regex.js ***!
  \*****************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (/^(?:[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}|00000000-0000-0000-0000-000000000000)$/i);

/***/ }),

/***/ "./node_modules/uuid/dist/esm-browser/rng.js":
/*!***************************************************!*\
  !*** ./node_modules/uuid/dist/esm-browser/rng.js ***!
  \***************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ rng)
/* harmony export */ });
// Unique ID creation requires a high quality random # generator. In the browser we therefore
// require the crypto API and do not support built-in fallback to lower quality random number
// generators (like Math.random()).
var getRandomValues;
var rnds8 = new Uint8Array(16);
function rng() {
  // lazy load so that environments that need to polyfill have a chance to do so
  if (!getRandomValues) {
    // getRandomValues needs to be invoked in a context where "this" is a Crypto implementation. Also,
    // find the complete implementation of crypto (msCrypto) on IE11.
    getRandomValues = typeof crypto !== 'undefined' && crypto.getRandomValues && crypto.getRandomValues.bind(crypto) || typeof msCrypto !== 'undefined' && typeof msCrypto.getRandomValues === 'function' && msCrypto.getRandomValues.bind(msCrypto);

    if (!getRandomValues) {
      throw new Error('crypto.getRandomValues() not supported. See https://github.com/uuidjs/uuid#getrandomvalues-not-supported');
    }
  }

  return getRandomValues(rnds8);
}

/***/ }),

/***/ "./node_modules/uuid/dist/esm-browser/stringify.js":
/*!*********************************************************!*\
  !*** ./node_modules/uuid/dist/esm-browser/stringify.js ***!
  \*********************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _validate_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./validate.js */ "./node_modules/uuid/dist/esm-browser/validate.js");

/**
 * Convert array of 16 byte values to UUID string format of the form:
 * XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX
 */

var byteToHex = [];

for (var i = 0; i < 256; ++i) {
  byteToHex.push((i + 0x100).toString(16).substr(1));
}

function stringify(arr) {
  var offset = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
  // Note: Be careful editing this code!  It's been tuned for performance
  // and works in ways you may not expect. See https://github.com/uuidjs/uuid/pull/434
  var uuid = (byteToHex[arr[offset + 0]] + byteToHex[arr[offset + 1]] + byteToHex[arr[offset + 2]] + byteToHex[arr[offset + 3]] + '-' + byteToHex[arr[offset + 4]] + byteToHex[arr[offset + 5]] + '-' + byteToHex[arr[offset + 6]] + byteToHex[arr[offset + 7]] + '-' + byteToHex[arr[offset + 8]] + byteToHex[arr[offset + 9]] + '-' + byteToHex[arr[offset + 10]] + byteToHex[arr[offset + 11]] + byteToHex[arr[offset + 12]] + byteToHex[arr[offset + 13]] + byteToHex[arr[offset + 14]] + byteToHex[arr[offset + 15]]).toLowerCase(); // Consistency check for valid UUID.  If this throws, it's likely due to one
  // of the following:
  // - One or more input array values don't map to a hex octet (leading to
  // "undefined" in the uuid)
  // - Invalid input values for the RFC `version` or `variant` fields

  if (!(0,_validate_js__WEBPACK_IMPORTED_MODULE_0__["default"])(uuid)) {
    throw TypeError('Stringified UUID is invalid');
  }

  return uuid;
}

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (stringify);

/***/ }),

/***/ "./node_modules/uuid/dist/esm-browser/v4.js":
/*!**************************************************!*\
  !*** ./node_modules/uuid/dist/esm-browser/v4.js ***!
  \**************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _rng_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./rng.js */ "./node_modules/uuid/dist/esm-browser/rng.js");
/* harmony import */ var _stringify_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./stringify.js */ "./node_modules/uuid/dist/esm-browser/stringify.js");



function v4(options, buf, offset) {
  options = options || {};
  var rnds = options.random || (options.rng || _rng_js__WEBPACK_IMPORTED_MODULE_0__["default"])(); // Per 4.4, set bits for version and `clock_seq_hi_and_reserved`

  rnds[6] = rnds[6] & 0x0f | 0x40;
  rnds[8] = rnds[8] & 0x3f | 0x80; // Copy bytes to buffer, if provided

  if (buf) {
    offset = offset || 0;

    for (var i = 0; i < 16; ++i) {
      buf[offset + i] = rnds[i];
    }

    return buf;
  }

  return (0,_stringify_js__WEBPACK_IMPORTED_MODULE_1__["default"])(rnds);
}

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (v4);

/***/ }),

/***/ "./node_modules/uuid/dist/esm-browser/validate.js":
/*!********************************************************!*\
  !*** ./node_modules/uuid/dist/esm-browser/validate.js ***!
  \********************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _regex_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./regex.js */ "./node_modules/uuid/dist/esm-browser/regex.js");


function validate(uuid) {
  return typeof uuid === 'string' && _regex_js__WEBPACK_IMPORTED_MODULE_0__["default"].test(uuid);
}

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (validate);

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/global */
/******/ 	(() => {
/******/ 		__webpack_require__.g = (function() {
/******/ 			if (typeof globalThis === 'object') return globalThis;
/******/ 			try {
/******/ 				return this || new Function('return this')();
/******/ 			} catch (e) {
/******/ 				if (typeof window === 'object') return window;
/******/ 			}
/******/ 		})();
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be in strict mode.
(() => {
"use strict";
/*!*********************!*\
  !*** ./ts/index.ts ***!
  \*********************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _EventListener__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./EventListener */ "./ts/EventListener.ts");
/* harmony import */ var _Task__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./Task */ "./ts/Task.ts");
/* harmony import */ var _TaskCollection__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./TaskCollection */ "./ts/TaskCollection.ts");
/* harmony import */ var _TaskRenderer__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./TaskRenderer */ "./ts/TaskRenderer.ts");




class Application {
    constructor() {
        this.eventListener = new _EventListener__WEBPACK_IMPORTED_MODULE_0__.EventListener();
        this.taskCollection = new _TaskCollection__WEBPACK_IMPORTED_MODULE_2__.TaskCollection();
        this.taskRenderer = new _TaskRenderer__WEBPACK_IMPORTED_MODULE_3__.TaskRenderer(document.getElementById('todoList'), document.getElementById('doingList'), document.getElementById('doneList'));
        this.executeDeleteTask = (task) => {
            this.eventListener.remove(task.id);
            this.taskCollection.delete(task);
            this.taskRenderer.remove(task);
        };
        this.handleSubmit = (e) => {
            e.preventDefault();
            const titleInput = document.getElementById('title');
            if (!titleInput.value) {
                return;
            }
            const task = new _Task__WEBPACK_IMPORTED_MODULE_1__.Task({ title: titleInput.value });
            this.taskCollection.add(task);
            const { deleteButtonEl } = this.taskRenderer.append(task);
            this.eventListener.add(task.id, 'click', deleteButtonEl, () => this.handleClickDeleteTask(task));
            titleInput.value = '';
        };
        this.handleClickDeleteTask = (task) => {
            if (!window.confirm(`「${task.title}」を削除しますか？`)) {
                return;
            }
            this.executeDeleteTask(task);
        };
        this.handleDropAndDrop = (el, sibling, newStatus) => {
            const taskId = this.taskRenderer.getId(el);
            if (!taskId) {
                return;
            }
            const task = this.taskCollection.find(taskId);
            if (!task) {
                return;
            }
            task.update({ status: newStatus });
            this.taskCollection.update(task);
            console.log(sibling);
        };
        this.handleClickDeletedAllDoneTasks = () => {
            if (!window.confirm('DONE のタスクをすべて削除しますか？')) {
                return;
            }
            const doneTasks = this.taskCollection.filter(_Task__WEBPACK_IMPORTED_MODULE_1__.statusMap.done);
            doneTasks.forEach((task) => this.executeDeleteTask(task));
        };
    }
    start() {
        const taskItems = this.taskRenderer.renderAll(this.taskCollection);
        const createForm = document.getElementById('createForm');
        const deleteAllDoneTaskButton = document.getElementById('deleteAllDoneTask');
        taskItems.forEach(({ task, deleteButtonEl }) => {
            this.eventListener.add(task.id, 'click', deleteButtonEl, () => this.handleClickDeleteTask(task));
        });
        this.eventListener.add('submit-handler', 'submit', createForm, this.handleSubmit);
        this.eventListener.add('click-handler', 'click', deleteAllDoneTaskButton, this.handleClickDeletedAllDoneTasks);
        this.taskRenderer.subscribeDragAndDrop(this.handleDropAndDrop);
    }
}
window.addEventListener('load', () => {
    const app = new Application();
    app.start();
});

})();

/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsY0FBYztBQUNkO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDhCQUE4QjtBQUM5QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQU07QUFDTjtBQUNBLE1BQU07QUFDTjtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxNQUFNO0FBQ047QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsUUFBUTtBQUNSO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxNQUFNO0FBQ047QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQU07QUFDTjtBQUNBLE1BQU07QUFDTjtBQUNBO0FBQ0E7QUFDQTs7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Q0FBQyxjQUFjLENBQUM7UUFDbEUsTUFBTSxVQUFVLEdBQUcsUUFBUSxDQUFDLGNBQWMsQ0FBQyxZQUFZLENBQW9CO1FBQzNFLE1BQU0sdUJBQXVCLEdBQUcsUUFBUSxDQUFDLGNBQWMsQ0FBQyxtQkFBbUIsQ0FBc0I7UUFFakcsU0FBUyxDQUFDLE9BQU8sQ0FBQyxDQUFDLEVBQUUsSUFBSSxFQUFFLGNBQWMsRUFBRSxFQUFFLEVBQUU7WUFDN0MsSUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUUsRUFBRSxPQUFPLEVBQUUsY0FBYyxFQUNyRCxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMscUJBQXFCLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDM0MsQ0FBQyxDQUFDO1FBRUYsSUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsZ0JBQWdCLEVBQUUsUUFBUSxFQUFFLFVBQVUsRUFBRSxJQUFJLENBQUMsWUFBWSxDQUFDO1FBQ2pGLElBQUksQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLGVBQWUsRUFBRSxPQUFPLEVBQUUsdUJBQXVCLEVBQUUsSUFBSSxDQUFDLDhCQUE4QixDQUFDO1FBRTlHLElBQUksQ0FBQyxZQUFZLENBQUMsb0JBQW9CLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDO0lBQ2hFLENBQUM7Q0FpREY7QUFFRCxNQUFNLENBQUMsZ0JBQWdCLENBQUMsTUFBTSxFQUFFLEdBQUcsRUFBRTtJQUNuQyxNQUFNLEdBQUcsR0FBRyxJQUFJLFdBQVcsRUFBRSxDQUFDO0lBQzlCLEdBQUcsQ0FBQyxLQUFLLEVBQUUsQ0FBQztBQUNkLENBQUMsQ0FBQyIsInNvdXJjZXMiOlsid2VicGFjazovL2Jyb3dzZXItYXBwLy4vbm9kZV9tb2R1bGVzL2F0b2EvYXRvYS5qcyIsIndlYnBhY2s6Ly9icm93c2VyLWFwcC8uL25vZGVfbW9kdWxlcy9jb250cmEvZGVib3VuY2UuanMiLCJ3ZWJwYWNrOi8vYnJvd3Nlci1hcHAvLi9ub2RlX21vZHVsZXMvY29udHJhL2VtaXR0ZXIuanMiLCJ3ZWJwYWNrOi8vYnJvd3Nlci1hcHAvLi9ub2RlX21vZHVsZXMvY3Jvc3N2ZW50L3NyYy9jcm9zc3ZlbnQuanMiLCJ3ZWJwYWNrOi8vYnJvd3Nlci1hcHAvLi9ub2RlX21vZHVsZXMvY3Jvc3N2ZW50L3NyYy9ldmVudG1hcC5qcyIsIndlYnBhY2s6Ly9icm93c2VyLWFwcC8uL25vZGVfbW9kdWxlcy9jdXN0b20tZXZlbnQvaW5kZXguanMiLCJ3ZWJwYWNrOi8vYnJvd3Nlci1hcHAvLi9ub2RlX21vZHVsZXMvZHJhZ3VsYS9jbGFzc2VzLmpzIiwid2VicGFjazovL2Jyb3dzZXItYXBwLy4vbm9kZV9tb2R1bGVzL2RyYWd1bGEvZHJhZ3VsYS5qcyIsIndlYnBhY2s6Ly9icm93c2VyLWFwcC8uL25vZGVfbW9kdWxlcy90aWNreS90aWNreS1icm93c2VyLmpzIiwid2VicGFjazovL2Jyb3dzZXItYXBwLy4vdHMvRXZlbnRMaXN0ZW5lci50cyIsIndlYnBhY2s6Ly9icm93c2VyLWFwcC8uL3RzL1Rhc2sudHMiLCJ3ZWJwYWNrOi8vYnJvd3Nlci1hcHAvLi90cy9UYXNrQ29sbGVjdGlvbi50cyIsIndlYnBhY2s6Ly9icm93c2VyLWFwcC8uL3RzL1Rhc2tSZW5kZXJlci50cyIsIndlYnBhY2s6Ly9icm93c2VyLWFwcC8uL25vZGVfbW9kdWxlcy91dWlkL2Rpc3QvZXNtLWJyb3dzZXIvcmVnZXguanMiLCJ3ZWJwYWNrOi8vYnJvd3Nlci1hcHAvLi9ub2RlX21vZHVsZXMvdXVpZC9kaXN0L2VzbS1icm93c2VyL3JuZy5qcyIsIndlYnBhY2s6Ly9icm93c2VyLWFwcC8uL25vZGVfbW9kdWxlcy91dWlkL2Rpc3QvZXNtLWJyb3dzZXIvc3RyaW5naWZ5LmpzIiwid2VicGFjazovL2Jyb3dzZXItYXBwLy4vbm9kZV9tb2R1bGVzL3V1aWQvZGlzdC9lc20tYnJvd3Nlci92NC5qcyIsIndlYnBhY2s6Ly9icm93c2VyLWFwcC8uL25vZGVfbW9kdWxlcy91dWlkL2Rpc3QvZXNtLWJyb3dzZXIvdmFsaWRhdGUuanMiLCJ3ZWJwYWNrOi8vYnJvd3Nlci1hcHAvd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vYnJvd3Nlci1hcHAvd2VicGFjay9ydW50aW1lL2NvbXBhdCBnZXQgZGVmYXVsdCBleHBvcnQiLCJ3ZWJwYWNrOi8vYnJvd3Nlci1hcHAvd2VicGFjay9ydW50aW1lL2RlZmluZSBwcm9wZXJ0eSBnZXR0ZXJzIiwid2VicGFjazovL2Jyb3dzZXItYXBwL3dlYnBhY2svcnVudGltZS9nbG9iYWwiLCJ3ZWJwYWNrOi8vYnJvd3Nlci1hcHAvd2VicGFjay9ydW50aW1lL2hhc093blByb3BlcnR5IHNob3J0aGFuZCIsIndlYnBhY2s6Ly9icm93c2VyLWFwcC93ZWJwYWNrL3J1bnRpbWUvbWFrZSBuYW1lc3BhY2Ugb2JqZWN0Iiwid2VicGFjazovL2Jyb3dzZXItYXBwLy4vdHMvaW5kZXgudHMiXSwic291cmNlc0NvbnRlbnQiOlsibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBhdG9hIChhLCBuKSB7IHJldHVybiBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhLCBuKTsgfVxuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgdGlja3kgPSByZXF1aXJlKCd0aWNreScpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGRlYm91bmNlIChmbiwgYXJncywgY3R4KSB7XG4gIGlmICghZm4pIHsgcmV0dXJuOyB9XG4gIHRpY2t5KGZ1bmN0aW9uIHJ1biAoKSB7XG4gICAgZm4uYXBwbHkoY3R4IHx8IG51bGwsIGFyZ3MgfHwgW10pO1xuICB9KTtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBhdG9hID0gcmVxdWlyZSgnYXRvYScpO1xudmFyIGRlYm91bmNlID0gcmVxdWlyZSgnLi9kZWJvdW5jZScpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGVtaXR0ZXIgKHRoaW5nLCBvcHRpb25zKSB7XG4gIHZhciBvcHRzID0gb3B0aW9ucyB8fCB7fTtcbiAgdmFyIGV2dCA9IHt9O1xuICBpZiAodGhpbmcgPT09IHVuZGVmaW5lZCkgeyB0aGluZyA9IHt9OyB9XG4gIHRoaW5nLm9uID0gZnVuY3Rpb24gKHR5cGUsIGZuKSB7XG4gICAgaWYgKCFldnRbdHlwZV0pIHtcbiAgICAgIGV2dFt0eXBlXSA9IFtmbl07XG4gICAgfSBlbHNlIHtcbiAgICAgIGV2dFt0eXBlXS5wdXNoKGZuKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaW5nO1xuICB9O1xuICB0aGluZy5vbmNlID0gZnVuY3Rpb24gKHR5cGUsIGZuKSB7XG4gICAgZm4uX29uY2UgPSB0cnVlOyAvLyB0aGluZy5vZmYoZm4pIHN0aWxsIHdvcmtzIVxuICAgIHRoaW5nLm9uKHR5cGUsIGZuKTtcbiAgICByZXR1cm4gdGhpbmc7XG4gIH07XG4gIHRoaW5nLm9mZiA9IGZ1bmN0aW9uICh0eXBlLCBmbikge1xuICAgIHZhciBjID0gYXJndW1lbnRzLmxlbmd0aDtcbiAgICBpZiAoYyA9PT0gMSkge1xuICAgICAgZGVsZXRlIGV2dFt0eXBlXTtcbiAgICB9IGVsc2UgaWYgKGMgPT09IDApIHtcbiAgICAgIGV2dCA9IHt9O1xuICAgIH0gZWxzZSB7XG4gICAgICB2YXIgZXQgPSBldnRbdHlwZV07XG4gICAgICBpZiAoIWV0KSB7IHJldHVybiB0aGluZzsgfVxuICAgICAgZXQuc3BsaWNlKGV0LmluZGV4T2YoZm4pLCAxKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaW5nO1xuICB9O1xuICB0aGluZy5lbWl0ID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciBhcmdzID0gYXRvYShhcmd1bWVudHMpO1xuICAgIHJldHVybiB0aGluZy5lbWl0dGVyU25hcHNob3QoYXJncy5zaGlmdCgpKS5hcHBseSh0aGlzLCBhcmdzKTtcbiAgfTtcbiAgdGhpbmcuZW1pdHRlclNuYXBzaG90ID0gZnVuY3Rpb24gKHR5cGUpIHtcbiAgICB2YXIgZXQgPSAoZXZ0W3R5cGVdIHx8IFtdKS5zbGljZSgwKTtcbiAgICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgICAgdmFyIGFyZ3MgPSBhdG9hKGFyZ3VtZW50cyk7XG4gICAgICB2YXIgY3R4ID0gdGhpcyB8fCB0aGluZztcbiAgICAgIGlmICh0eXBlID09PSAnZXJyb3InICYmIG9wdHMudGhyb3dzICE9PSBmYWxzZSAmJiAhZXQubGVuZ3RoKSB7IHRocm93IGFyZ3MubGVuZ3RoID09PSAxID8gYXJnc1swXSA6IGFyZ3M7IH1cbiAgICAgIGV0LmZvckVhY2goZnVuY3Rpb24gZW1pdHRlciAobGlzdGVuKSB7XG4gICAgICAgIGlmIChvcHRzLmFzeW5jKSB7IGRlYm91bmNlKGxpc3RlbiwgYXJncywgY3R4KTsgfSBlbHNlIHsgbGlzdGVuLmFwcGx5KGN0eCwgYXJncyk7IH1cbiAgICAgICAgaWYgKGxpc3Rlbi5fb25jZSkgeyB0aGluZy5vZmYodHlwZSwgbGlzdGVuKTsgfVxuICAgICAgfSk7XG4gICAgICByZXR1cm4gdGhpbmc7XG4gICAgfTtcbiAgfTtcbiAgcmV0dXJuIHRoaW5nO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIGN1c3RvbUV2ZW50ID0gcmVxdWlyZSgnY3VzdG9tLWV2ZW50Jyk7XG52YXIgZXZlbnRtYXAgPSByZXF1aXJlKCcuL2V2ZW50bWFwJyk7XG52YXIgZG9jID0gZ2xvYmFsLmRvY3VtZW50O1xudmFyIGFkZEV2ZW50ID0gYWRkRXZlbnRFYXN5O1xudmFyIHJlbW92ZUV2ZW50ID0gcmVtb3ZlRXZlbnRFYXN5O1xudmFyIGhhcmRDYWNoZSA9IFtdO1xuXG5pZiAoIWdsb2JhbC5hZGRFdmVudExpc3RlbmVyKSB7XG4gIGFkZEV2ZW50ID0gYWRkRXZlbnRIYXJkO1xuICByZW1vdmVFdmVudCA9IHJlbW92ZUV2ZW50SGFyZDtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIGFkZDogYWRkRXZlbnQsXG4gIHJlbW92ZTogcmVtb3ZlRXZlbnQsXG4gIGZhYnJpY2F0ZTogZmFicmljYXRlRXZlbnRcbn07XG5cbmZ1bmN0aW9uIGFkZEV2ZW50RWFzeSAoZWwsIHR5cGUsIGZuLCBjYXB0dXJpbmcpIHtcbiAgcmV0dXJuIGVsLmFkZEV2ZW50TGlzdGVuZXIodHlwZSwgZm4sIGNhcHR1cmluZyk7XG59XG5cbmZ1bmN0aW9uIGFkZEV2ZW50SGFyZCAoZWwsIHR5cGUsIGZuKSB7XG4gIHJldHVybiBlbC5hdHRhY2hFdmVudCgnb24nICsgdHlwZSwgd3JhcChlbCwgdHlwZSwgZm4pKTtcbn1cblxuZnVuY3Rpb24gcmVtb3ZlRXZlbnRFYXN5IChlbCwgdHlwZSwgZm4sIGNhcHR1cmluZykge1xuICByZXR1cm4gZWwucmVtb3ZlRXZlbnRMaXN0ZW5lcih0eXBlLCBmbiwgY2FwdHVyaW5nKTtcbn1cblxuZnVuY3Rpb24gcmVtb3ZlRXZlbnRIYXJkIChlbCwgdHlwZSwgZm4pIHtcbiAgdmFyIGxpc3RlbmVyID0gdW53cmFwKGVsLCB0eXBlLCBmbik7XG4gIGlmIChsaXN0ZW5lcikge1xuICAgIHJldHVybiBlbC5kZXRhY2hFdmVudCgnb24nICsgdHlwZSwgbGlzdGVuZXIpO1xuICB9XG59XG5cbmZ1bmN0aW9uIGZhYnJpY2F0ZUV2ZW50IChlbCwgdHlwZSwgbW9kZWwpIHtcbiAgdmFyIGUgPSBldmVudG1hcC5pbmRleE9mKHR5cGUpID09PSAtMSA/IG1ha2VDdXN0b21FdmVudCgpIDogbWFrZUNsYXNzaWNFdmVudCgpO1xuICBpZiAoZWwuZGlzcGF0Y2hFdmVudCkge1xuICAgIGVsLmRpc3BhdGNoRXZlbnQoZSk7XG4gIH0gZWxzZSB7XG4gICAgZWwuZmlyZUV2ZW50KCdvbicgKyB0eXBlLCBlKTtcbiAgfVxuICBmdW5jdGlvbiBtYWtlQ2xhc3NpY0V2ZW50ICgpIHtcbiAgICB2YXIgZTtcbiAgICBpZiAoZG9jLmNyZWF0ZUV2ZW50KSB7XG4gICAgICBlID0gZG9jLmNyZWF0ZUV2ZW50KCdFdmVudCcpO1xuICAgICAgZS5pbml0RXZlbnQodHlwZSwgdHJ1ZSwgdHJ1ZSk7XG4gICAgfSBlbHNlIGlmIChkb2MuY3JlYXRlRXZlbnRPYmplY3QpIHtcbiAgICAgIGUgPSBkb2MuY3JlYXRlRXZlbnRPYmplY3QoKTtcbiAgICB9XG4gICAgcmV0dXJuIGU7XG4gIH1cbiAgZnVuY3Rpb24gbWFrZUN1c3RvbUV2ZW50ICgpIHtcbiAgICByZXR1cm4gbmV3IGN1c3RvbUV2ZW50KHR5cGUsIHsgZGV0YWlsOiBtb2RlbCB9KTtcbiAgfVxufVxuXG5mdW5jdGlvbiB3cmFwcGVyRmFjdG9yeSAoZWwsIHR5cGUsIGZuKSB7XG4gIHJldHVybiBmdW5jdGlvbiB3cmFwcGVyIChvcmlnaW5hbEV2ZW50KSB7XG4gICAgdmFyIGUgPSBvcmlnaW5hbEV2ZW50IHx8IGdsb2JhbC5ldmVudDtcbiAgICBlLnRhcmdldCA9IGUudGFyZ2V0IHx8IGUuc3JjRWxlbWVudDtcbiAgICBlLnByZXZlbnREZWZhdWx0ID0gZS5wcmV2ZW50RGVmYXVsdCB8fCBmdW5jdGlvbiBwcmV2ZW50RGVmYXVsdCAoKSB7IGUucmV0dXJuVmFsdWUgPSBmYWxzZTsgfTtcbiAgICBlLnN0b3BQcm9wYWdhdGlvbiA9IGUuc3RvcFByb3BhZ2F0aW9uIHx8IGZ1bmN0aW9uIHN0b3BQcm9wYWdhdGlvbiAoKSB7IGUuY2FuY2VsQnViYmxlID0gdHJ1ZTsgfTtcbiAgICBlLndoaWNoID0gZS53aGljaCB8fCBlLmtleUNvZGU7XG4gICAgZm4uY2FsbChlbCwgZSk7XG4gIH07XG59XG5cbmZ1bmN0aW9uIHdyYXAgKGVsLCB0eXBlLCBmbikge1xuICB2YXIgd3JhcHBlciA9IHVud3JhcChlbCwgdHlwZSwgZm4pIHx8IHdyYXBwZXJGYWN0b3J5KGVsLCB0eXBlLCBmbik7XG4gIGhhcmRDYWNoZS5wdXNoKHtcbiAgICB3cmFwcGVyOiB3cmFwcGVyLFxuICAgIGVsZW1lbnQ6IGVsLFxuICAgIHR5cGU6IHR5cGUsXG4gICAgZm46IGZuXG4gIH0pO1xuICByZXR1cm4gd3JhcHBlcjtcbn1cblxuZnVuY3Rpb24gdW53cmFwIChlbCwgdHlwZSwgZm4pIHtcbiAgdmFyIGkgPSBmaW5kKGVsLCB0eXBlLCBmbik7XG4gIGlmIChpKSB7XG4gICAgdmFyIHdyYXBwZXIgPSBoYXJkQ2FjaGVbaV0ud3JhcHBlcjtcbiAgICBoYXJkQ2FjaGUuc3BsaWNlKGksIDEpOyAvLyBmcmVlIHVwIGEgdGFkIG9mIG1lbW9yeVxuICAgIHJldHVybiB3cmFwcGVyO1xuICB9XG59XG5cbmZ1bmN0aW9uIGZpbmQgKGVsLCB0eXBlLCBmbikge1xuICB2YXIgaSwgaXRlbTtcbiAgZm9yIChpID0gMDsgaSA8IGhhcmRDYWNoZS5sZW5ndGg7IGkrKykge1xuICAgIGl0ZW0gPSBoYXJkQ2FjaGVbaV07XG4gICAgaWYgKGl0ZW0uZWxlbWVudCA9PT0gZWwgJiYgaXRlbS50eXBlID09PSB0eXBlICYmIGl0ZW0uZm4gPT09IGZuKSB7XG4gICAgICByZXR1cm4gaTtcbiAgICB9XG4gIH1cbn1cbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIGV2ZW50bWFwID0gW107XG52YXIgZXZlbnRuYW1lID0gJyc7XG52YXIgcm9uID0gL15vbi87XG5cbmZvciAoZXZlbnRuYW1lIGluIGdsb2JhbCkge1xuICBpZiAocm9uLnRlc3QoZXZlbnRuYW1lKSkge1xuICAgIGV2ZW50bWFwLnB1c2goZXZlbnRuYW1lLnNsaWNlKDIpKTtcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGV2ZW50bWFwO1xuIiwiXG52YXIgTmF0aXZlQ3VzdG9tRXZlbnQgPSBnbG9iYWwuQ3VzdG9tRXZlbnQ7XG5cbmZ1bmN0aW9uIHVzZU5hdGl2ZSAoKSB7XG4gIHRyeSB7XG4gICAgdmFyIHAgPSBuZXcgTmF0aXZlQ3VzdG9tRXZlbnQoJ2NhdCcsIHsgZGV0YWlsOiB7IGZvbzogJ2JhcicgfSB9KTtcbiAgICByZXR1cm4gICdjYXQnID09PSBwLnR5cGUgJiYgJ2JhcicgPT09IHAuZGV0YWlsLmZvbztcbiAgfSBjYXRjaCAoZSkge1xuICB9XG4gIHJldHVybiBmYWxzZTtcbn1cblxuLyoqXG4gKiBDcm9zcy1icm93c2VyIGBDdXN0b21FdmVudGAgY29uc3RydWN0b3IuXG4gKlxuICogaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvQVBJL0N1c3RvbUV2ZW50LkN1c3RvbUV2ZW50XG4gKlxuICogQHB1YmxpY1xuICovXG5cbm1vZHVsZS5leHBvcnRzID0gdXNlTmF0aXZlKCkgPyBOYXRpdmVDdXN0b21FdmVudCA6XG5cbi8vIElFID49IDlcbid1bmRlZmluZWQnICE9PSB0eXBlb2YgZG9jdW1lbnQgJiYgJ2Z1bmN0aW9uJyA9PT0gdHlwZW9mIGRvY3VtZW50LmNyZWF0ZUV2ZW50ID8gZnVuY3Rpb24gQ3VzdG9tRXZlbnQgKHR5cGUsIHBhcmFtcykge1xuICB2YXIgZSA9IGRvY3VtZW50LmNyZWF0ZUV2ZW50KCdDdXN0b21FdmVudCcpO1xuICBpZiAocGFyYW1zKSB7XG4gICAgZS5pbml0Q3VzdG9tRXZlbnQodHlwZSwgcGFyYW1zLmJ1YmJsZXMsIHBhcmFtcy5jYW5jZWxhYmxlLCBwYXJhbXMuZGV0YWlsKTtcbiAgfSBlbHNlIHtcbiAgICBlLmluaXRDdXN0b21FdmVudCh0eXBlLCBmYWxzZSwgZmFsc2UsIHZvaWQgMCk7XG4gIH1cbiAgcmV0dXJuIGU7XG59IDpcblxuLy8gSUUgPD0gOFxuZnVuY3Rpb24gQ3VzdG9tRXZlbnQgKHR5cGUsIHBhcmFtcykge1xuICB2YXIgZSA9IGRvY3VtZW50LmNyZWF0ZUV2ZW50T2JqZWN0KCk7XG4gIGUudHlwZSA9IHR5cGU7XG4gIGlmIChwYXJhbXMpIHtcbiAgICBlLmJ1YmJsZXMgPSBCb29sZWFuKHBhcmFtcy5idWJibGVzKTtcbiAgICBlLmNhbmNlbGFibGUgPSBCb29sZWFuKHBhcmFtcy5jYW5jZWxhYmxlKTtcbiAgICBlLmRldGFpbCA9IHBhcmFtcy5kZXRhaWw7XG4gIH0gZWxzZSB7XG4gICAgZS5idWJibGVzID0gZmFsc2U7XG4gICAgZS5jYW5jZWxhYmxlID0gZmFsc2U7XG4gICAgZS5kZXRhaWwgPSB2b2lkIDA7XG4gIH1cbiAgcmV0dXJuIGU7XG59XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBjYWNoZSA9IHt9O1xudmFyIHN0YXJ0ID0gJyg/Ol58XFxcXHMpJztcbnZhciBlbmQgPSAnKD86XFxcXHN8JCknO1xuXG5mdW5jdGlvbiBsb29rdXBDbGFzcyAoY2xhc3NOYW1lKSB7XG4gIHZhciBjYWNoZWQgPSBjYWNoZVtjbGFzc05hbWVdO1xuICBpZiAoY2FjaGVkKSB7XG4gICAgY2FjaGVkLmxhc3RJbmRleCA9IDA7XG4gIH0gZWxzZSB7XG4gICAgY2FjaGVbY2xhc3NOYW1lXSA9IGNhY2hlZCA9IG5ldyBSZWdFeHAoc3RhcnQgKyBjbGFzc05hbWUgKyBlbmQsICdnJyk7XG4gIH1cbiAgcmV0dXJuIGNhY2hlZDtcbn1cblxuZnVuY3Rpb24gYWRkQ2xhc3MgKGVsLCBjbGFzc05hbWUpIHtcbiAgdmFyIGN1cnJlbnQgPSBlbC5jbGFzc05hbWU7XG4gIGlmICghY3VycmVudC5sZW5ndGgpIHtcbiAgICBlbC5jbGFzc05hbWUgPSBjbGFzc05hbWU7XG4gIH0gZWxzZSBpZiAoIWxvb2t1cENsYXNzKGNsYXNzTmFtZSkudGVzdChjdXJyZW50KSkge1xuICAgIGVsLmNsYXNzTmFtZSArPSAnICcgKyBjbGFzc05hbWU7XG4gIH1cbn1cblxuZnVuY3Rpb24gcm1DbGFzcyAoZWwsIGNsYXNzTmFtZSkge1xuICBlbC5jbGFzc05hbWUgPSBlbC5jbGFzc05hbWUucmVwbGFjZShsb29rdXBDbGFzcyhjbGFzc05hbWUpLCAnICcpLnRyaW0oKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIGFkZDogYWRkQ2xhc3MsXG4gIHJtOiBybUNsYXNzXG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgZW1pdHRlciA9IHJlcXVpcmUoJ2NvbnRyYS9lbWl0dGVyJyk7XG52YXIgY3Jvc3N2ZW50ID0gcmVxdWlyZSgnY3Jvc3N2ZW50Jyk7XG52YXIgY2xhc3NlcyA9IHJlcXVpcmUoJy4vY2xhc3NlcycpO1xudmFyIGRvYyA9IGRvY3VtZW50O1xudmFyIGRvY3VtZW50RWxlbWVudCA9IGRvYy5kb2N1bWVudEVsZW1lbnQ7XG5cbmZ1bmN0aW9uIGRyYWd1bGEgKGluaXRpYWxDb250YWluZXJzLCBvcHRpb25zKSB7XG4gIHZhciBsZW4gPSBhcmd1bWVudHMubGVuZ3RoO1xuICBpZiAobGVuID09PSAxICYmIEFycmF5LmlzQXJyYXkoaW5pdGlhbENvbnRhaW5lcnMpID09PSBmYWxzZSkge1xuICAgIG9wdGlvbnMgPSBpbml0aWFsQ29udGFpbmVycztcbiAgICBpbml0aWFsQ29udGFpbmVycyA9IFtdO1xuICB9XG4gIHZhciBfbWlycm9yOyAvLyBtaXJyb3IgaW1hZ2VcbiAgdmFyIF9zb3VyY2U7IC8vIHNvdXJjZSBjb250YWluZXJcbiAgdmFyIF9pdGVtOyAvLyBpdGVtIGJlaW5nIGRyYWdnZWRcbiAgdmFyIF9vZmZzZXRYOyAvLyByZWZlcmVuY2UgeFxuICB2YXIgX29mZnNldFk7IC8vIHJlZmVyZW5jZSB5XG4gIHZhciBfbW92ZVg7IC8vIHJlZmVyZW5jZSBtb3ZlIHhcbiAgdmFyIF9tb3ZlWTsgLy8gcmVmZXJlbmNlIG1vdmUgeVxuICB2YXIgX2luaXRpYWxTaWJsaW5nOyAvLyByZWZlcmVuY2Ugc2libGluZyB3aGVuIGdyYWJiZWRcbiAgdmFyIF9jdXJyZW50U2libGluZzsgLy8gcmVmZXJlbmNlIHNpYmxpbmcgbm93XG4gIHZhciBfY29weTsgLy8gaXRlbSB1c2VkIGZvciBjb3B5aW5nXG4gIHZhciBfcmVuZGVyVGltZXI7IC8vIHRpbWVyIGZvciBzZXRUaW1lb3V0IHJlbmRlck1pcnJvckltYWdlXG4gIHZhciBfbGFzdERyb3BUYXJnZXQgPSBudWxsOyAvLyBsYXN0IGNvbnRhaW5lciBpdGVtIHdhcyBvdmVyXG4gIHZhciBfZ3JhYmJlZDsgLy8gaG9sZHMgbW91c2Vkb3duIGNvbnRleHQgdW50aWwgZmlyc3QgbW91c2Vtb3ZlXG5cbiAgdmFyIG8gPSBvcHRpb25zIHx8IHt9O1xuICBpZiAoby5tb3ZlcyA9PT0gdm9pZCAwKSB7IG8ubW92ZXMgPSBhbHdheXM7IH1cbiAgaWYgKG8uYWNjZXB0cyA9PT0gdm9pZCAwKSB7IG8uYWNjZXB0cyA9IGFsd2F5czsgfVxuICBpZiAoby5pbnZhbGlkID09PSB2b2lkIDApIHsgby5pbnZhbGlkID0gaW52YWxpZFRhcmdldDsgfVxuICBpZiAoby5jb250YWluZXJzID09PSB2b2lkIDApIHsgby5jb250YWluZXJzID0gaW5pdGlhbENvbnRhaW5lcnMgfHwgW107IH1cbiAgaWYgKG8uaXNDb250YWluZXIgPT09IHZvaWQgMCkgeyBvLmlzQ29udGFpbmVyID0gbmV2ZXI7IH1cbiAgaWYgKG8uY29weSA9PT0gdm9pZCAwKSB7IG8uY29weSA9IGZhbHNlOyB9XG4gIGlmIChvLmNvcHlTb3J0U291cmNlID09PSB2b2lkIDApIHsgby5jb3B5U29ydFNvdXJjZSA9IGZhbHNlOyB9XG4gIGlmIChvLnJldmVydE9uU3BpbGwgPT09IHZvaWQgMCkgeyBvLnJldmVydE9uU3BpbGwgPSBmYWxzZTsgfVxuICBpZiAoby5yZW1vdmVPblNwaWxsID09PSB2b2lkIDApIHsgby5yZW1vdmVPblNwaWxsID0gZmFsc2U7IH1cbiAgaWYgKG8uZGlyZWN0aW9uID09PSB2b2lkIDApIHsgby5kaXJlY3Rpb24gPSAndmVydGljYWwnOyB9XG4gIGlmIChvLmlnbm9yZUlucHV0VGV4dFNlbGVjdGlvbiA9PT0gdm9pZCAwKSB7IG8uaWdub3JlSW5wdXRUZXh0U2VsZWN0aW9uID0gdHJ1ZTsgfVxuICBpZiAoby5taXJyb3JDb250YWluZXIgPT09IHZvaWQgMCkgeyBvLm1pcnJvckNvbnRhaW5lciA9IGRvYy5ib2R5OyB9XG5cbiAgdmFyIGRyYWtlID0gZW1pdHRlcih7XG4gICAgY29udGFpbmVyczogby5jb250YWluZXJzLFxuICAgIHN0YXJ0OiBtYW51YWxTdGFydCxcbiAgICBlbmQ6IGVuZCxcbiAgICBjYW5jZWw6IGNhbmNlbCxcbiAgICByZW1vdmU6IHJlbW92ZSxcbiAgICBkZXN0cm95OiBkZXN0cm95LFxuICAgIGNhbk1vdmU6IGNhbk1vdmUsXG4gICAgZHJhZ2dpbmc6IGZhbHNlXG4gIH0pO1xuXG4gIGlmIChvLnJlbW92ZU9uU3BpbGwgPT09IHRydWUpIHtcbiAgICBkcmFrZS5vbignb3ZlcicsIHNwaWxsT3Zlcikub24oJ291dCcsIHNwaWxsT3V0KTtcbiAgfVxuXG4gIGV2ZW50cygpO1xuXG4gIHJldHVybiBkcmFrZTtcblxuICBmdW5jdGlvbiBpc0NvbnRhaW5lciAoZWwpIHtcbiAgICByZXR1cm4gZHJha2UuY29udGFpbmVycy5pbmRleE9mKGVsKSAhPT0gLTEgfHwgby5pc0NvbnRhaW5lcihlbCk7XG4gIH1cblxuICBmdW5jdGlvbiBldmVudHMgKHJlbW92ZSkge1xuICAgIHZhciBvcCA9IHJlbW92ZSA/ICdyZW1vdmUnIDogJ2FkZCc7XG4gICAgdG91Y2h5KGRvY3VtZW50RWxlbWVudCwgb3AsICdtb3VzZWRvd24nLCBncmFiKTtcbiAgICB0b3VjaHkoZG9jdW1lbnRFbGVtZW50LCBvcCwgJ21vdXNldXAnLCByZWxlYXNlKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGV2ZW50dWFsTW92ZW1lbnRzIChyZW1vdmUpIHtcbiAgICB2YXIgb3AgPSByZW1vdmUgPyAncmVtb3ZlJyA6ICdhZGQnO1xuICAgIHRvdWNoeShkb2N1bWVudEVsZW1lbnQsIG9wLCAnbW91c2Vtb3ZlJywgc3RhcnRCZWNhdXNlTW91c2VNb3ZlZCk7XG4gIH1cblxuICBmdW5jdGlvbiBtb3ZlbWVudHMgKHJlbW92ZSkge1xuICAgIHZhciBvcCA9IHJlbW92ZSA/ICdyZW1vdmUnIDogJ2FkZCc7XG4gICAgY3Jvc3N2ZW50W29wXShkb2N1bWVudEVsZW1lbnQsICdzZWxlY3RzdGFydCcsIHByZXZlbnRHcmFiYmVkKTsgLy8gSUU4XG4gICAgY3Jvc3N2ZW50W29wXShkb2N1bWVudEVsZW1lbnQsICdjbGljaycsIHByZXZlbnRHcmFiYmVkKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGRlc3Ryb3kgKCkge1xuICAgIGV2ZW50cyh0cnVlKTtcbiAgICByZWxlYXNlKHt9KTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHByZXZlbnRHcmFiYmVkIChlKSB7XG4gICAgaWYgKF9ncmFiYmVkKSB7XG4gICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gZ3JhYiAoZSkge1xuICAgIF9tb3ZlWCA9IGUuY2xpZW50WDtcbiAgICBfbW92ZVkgPSBlLmNsaWVudFk7XG5cbiAgICB2YXIgaWdub3JlID0gd2hpY2hNb3VzZUJ1dHRvbihlKSAhPT0gMSB8fCBlLm1ldGFLZXkgfHwgZS5jdHJsS2V5O1xuICAgIGlmIChpZ25vcmUpIHtcbiAgICAgIHJldHVybjsgLy8gd2Ugb25seSBjYXJlIGFib3V0IGhvbmVzdC10by1nb2QgbGVmdCBjbGlja3MgYW5kIHRvdWNoIGV2ZW50c1xuICAgIH1cbiAgICB2YXIgaXRlbSA9IGUudGFyZ2V0O1xuICAgIHZhciBjb250ZXh0ID0gY2FuU3RhcnQoaXRlbSk7XG4gICAgaWYgKCFjb250ZXh0KSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIF9ncmFiYmVkID0gY29udGV4dDtcbiAgICBldmVudHVhbE1vdmVtZW50cygpO1xuICAgIGlmIChlLnR5cGUgPT09ICdtb3VzZWRvd24nKSB7XG4gICAgICBpZiAoaXNJbnB1dChpdGVtKSkgeyAvLyBzZWUgYWxzbzogaHR0cHM6Ly9naXRodWIuY29tL2JldmFjcXVhL2RyYWd1bGEvaXNzdWVzLzIwOFxuICAgICAgICBpdGVtLmZvY3VzKCk7IC8vIGZpeGVzIGh0dHBzOi8vZ2l0aHViLmNvbS9iZXZhY3F1YS9kcmFndWxhL2lzc3Vlcy8xNzZcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTsgLy8gZml4ZXMgaHR0cHM6Ly9naXRodWIuY29tL2JldmFjcXVhL2RyYWd1bGEvaXNzdWVzLzE1NVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIHN0YXJ0QmVjYXVzZU1vdXNlTW92ZWQgKGUpIHtcbiAgICBpZiAoIV9ncmFiYmVkKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGlmICh3aGljaE1vdXNlQnV0dG9uKGUpID09PSAwKSB7XG4gICAgICByZWxlYXNlKHt9KTtcbiAgICAgIHJldHVybjsgLy8gd2hlbiB0ZXh0IGlzIHNlbGVjdGVkIG9uIGFuIGlucHV0IGFuZCB0aGVuIGRyYWdnZWQsIG1vdXNldXAgZG9lc24ndCBmaXJlLiB0aGlzIGlzIG91ciBvbmx5IGhvcGVcbiAgICB9XG5cbiAgICAvLyB0cnV0aHkgY2hlY2sgZml4ZXMgIzIzOSwgZXF1YWxpdHkgZml4ZXMgIzIwNywgZml4ZXMgIzUwMVxuICAgIGlmICgoZS5jbGllbnRYICE9PSB2b2lkIDAgJiYgTWF0aC5hYnMoZS5jbGllbnRYIC0gX21vdmVYKSA8PSAoby5zbGlkZUZhY3RvclggfHwgMCkpICYmXG4gICAgICAoZS5jbGllbnRZICE9PSB2b2lkIDAgJiYgTWF0aC5hYnMoZS5jbGllbnRZIC0gX21vdmVZKSA8PSAoby5zbGlkZUZhY3RvclkgfHwgMCkpKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKG8uaWdub3JlSW5wdXRUZXh0U2VsZWN0aW9uKSB7XG4gICAgICB2YXIgY2xpZW50WCA9IGdldENvb3JkKCdjbGllbnRYJywgZSkgfHwgMDtcbiAgICAgIHZhciBjbGllbnRZID0gZ2V0Q29vcmQoJ2NsaWVudFknLCBlKSB8fCAwO1xuICAgICAgdmFyIGVsZW1lbnRCZWhpbmRDdXJzb3IgPSBkb2MuZWxlbWVudEZyb21Qb2ludChjbGllbnRYLCBjbGllbnRZKTtcbiAgICAgIGlmIChpc0lucHV0KGVsZW1lbnRCZWhpbmRDdXJzb3IpKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB2YXIgZ3JhYmJlZCA9IF9ncmFiYmVkOyAvLyBjYWxsIHRvIGVuZCgpIHVuc2V0cyBfZ3JhYmJlZFxuICAgIGV2ZW50dWFsTW92ZW1lbnRzKHRydWUpO1xuICAgIG1vdmVtZW50cygpO1xuICAgIGVuZCgpO1xuICAgIHN0YXJ0KGdyYWJiZWQpO1xuXG4gICAgdmFyIG9mZnNldCA9IGdldE9mZnNldChfaXRlbSk7XG4gICAgX29mZnNldFggPSBnZXRDb29yZCgncGFnZVgnLCBlKSAtIG9mZnNldC5sZWZ0O1xuICAgIF9vZmZzZXRZID0gZ2V0Q29vcmQoJ3BhZ2VZJywgZSkgLSBvZmZzZXQudG9wO1xuXG4gICAgY2xhc3Nlcy5hZGQoX2NvcHkgfHwgX2l0ZW0sICdndS10cmFuc2l0Jyk7XG4gICAgcmVuZGVyTWlycm9ySW1hZ2UoKTtcbiAgICBkcmFnKGUpO1xuICB9XG5cbiAgZnVuY3Rpb24gY2FuU3RhcnQgKGl0ZW0pIHtcbiAgICBpZiAoZHJha2UuZHJhZ2dpbmcgJiYgX21pcnJvcikge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBpZiAoaXNDb250YWluZXIoaXRlbSkpIHtcbiAgICAgIHJldHVybjsgLy8gZG9uJ3QgZHJhZyBjb250YWluZXIgaXRzZWxmXG4gICAgfVxuICAgIHZhciBoYW5kbGUgPSBpdGVtO1xuICAgIHdoaWxlIChnZXRQYXJlbnQoaXRlbSkgJiYgaXNDb250YWluZXIoZ2V0UGFyZW50KGl0ZW0pKSA9PT0gZmFsc2UpIHtcbiAgICAgIGlmIChvLmludmFsaWQoaXRlbSwgaGFuZGxlKSkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBpdGVtID0gZ2V0UGFyZW50KGl0ZW0pOyAvLyBkcmFnIHRhcmdldCBzaG91bGQgYmUgYSB0b3AgZWxlbWVudFxuICAgICAgaWYgKCFpdGVtKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICB9XG4gICAgdmFyIHNvdXJjZSA9IGdldFBhcmVudChpdGVtKTtcbiAgICBpZiAoIXNvdXJjZSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBpZiAoby5pbnZhbGlkKGl0ZW0sIGhhbmRsZSkpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB2YXIgbW92YWJsZSA9IG8ubW92ZXMoaXRlbSwgc291cmNlLCBoYW5kbGUsIG5leHRFbChpdGVtKSk7XG4gICAgaWYgKCFtb3ZhYmxlKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgcmV0dXJuIHtcbiAgICAgIGl0ZW06IGl0ZW0sXG4gICAgICBzb3VyY2U6IHNvdXJjZVxuICAgIH07XG4gIH1cblxuICBmdW5jdGlvbiBjYW5Nb3ZlIChpdGVtKSB7XG4gICAgcmV0dXJuICEhY2FuU3RhcnQoaXRlbSk7XG4gIH1cblxuICBmdW5jdGlvbiBtYW51YWxTdGFydCAoaXRlbSkge1xuICAgIHZhciBjb250ZXh0ID0gY2FuU3RhcnQoaXRlbSk7XG4gICAgaWYgKGNvbnRleHQpIHtcbiAgICAgIHN0YXJ0KGNvbnRleHQpO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIHN0YXJ0IChjb250ZXh0KSB7XG4gICAgaWYgKGlzQ29weShjb250ZXh0Lml0ZW0sIGNvbnRleHQuc291cmNlKSkge1xuICAgICAgX2NvcHkgPSBjb250ZXh0Lml0ZW0uY2xvbmVOb2RlKHRydWUpO1xuICAgICAgZHJha2UuZW1pdCgnY2xvbmVkJywgX2NvcHksIGNvbnRleHQuaXRlbSwgJ2NvcHknKTtcbiAgICB9XG5cbiAgICBfc291cmNlID0gY29udGV4dC5zb3VyY2U7XG4gICAgX2l0ZW0gPSBjb250ZXh0Lml0ZW07XG4gICAgX2luaXRpYWxTaWJsaW5nID0gX2N1cnJlbnRTaWJsaW5nID0gbmV4dEVsKGNvbnRleHQuaXRlbSk7XG5cbiAgICBkcmFrZS5kcmFnZ2luZyA9IHRydWU7XG4gICAgZHJha2UuZW1pdCgnZHJhZycsIF9pdGVtLCBfc291cmNlKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGludmFsaWRUYXJnZXQgKCkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGVuZCAoKSB7XG4gICAgaWYgKCFkcmFrZS5kcmFnZ2luZykge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB2YXIgaXRlbSA9IF9jb3B5IHx8IF9pdGVtO1xuICAgIGRyb3AoaXRlbSwgZ2V0UGFyZW50KGl0ZW0pKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHVuZ3JhYiAoKSB7XG4gICAgX2dyYWJiZWQgPSBmYWxzZTtcbiAgICBldmVudHVhbE1vdmVtZW50cyh0cnVlKTtcbiAgICBtb3ZlbWVudHModHJ1ZSk7XG4gIH1cblxuICBmdW5jdGlvbiByZWxlYXNlIChlKSB7XG4gICAgdW5ncmFiKCk7XG5cbiAgICBpZiAoIWRyYWtlLmRyYWdnaW5nKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHZhciBpdGVtID0gX2NvcHkgfHwgX2l0ZW07XG4gICAgdmFyIGNsaWVudFggPSBnZXRDb29yZCgnY2xpZW50WCcsIGUpIHx8IDA7XG4gICAgdmFyIGNsaWVudFkgPSBnZXRDb29yZCgnY2xpZW50WScsIGUpIHx8IDA7XG4gICAgdmFyIGVsZW1lbnRCZWhpbmRDdXJzb3IgPSBnZXRFbGVtZW50QmVoaW5kUG9pbnQoX21pcnJvciwgY2xpZW50WCwgY2xpZW50WSk7XG4gICAgdmFyIGRyb3BUYXJnZXQgPSBmaW5kRHJvcFRhcmdldChlbGVtZW50QmVoaW5kQ3Vyc29yLCBjbGllbnRYLCBjbGllbnRZKTtcbiAgICBpZiAoZHJvcFRhcmdldCAmJiAoKF9jb3B5ICYmIG8uY29weVNvcnRTb3VyY2UpIHx8ICghX2NvcHkgfHwgZHJvcFRhcmdldCAhPT0gX3NvdXJjZSkpKSB7XG4gICAgICBkcm9wKGl0ZW0sIGRyb3BUYXJnZXQpO1xuICAgIH0gZWxzZSBpZiAoby5yZW1vdmVPblNwaWxsKSB7XG4gICAgICByZW1vdmUoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgY2FuY2VsKCk7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gZHJvcCAoaXRlbSwgdGFyZ2V0KSB7XG4gICAgdmFyIHBhcmVudCA9IGdldFBhcmVudChpdGVtKTtcbiAgICBpZiAoX2NvcHkgJiYgby5jb3B5U29ydFNvdXJjZSAmJiB0YXJnZXQgPT09IF9zb3VyY2UpIHtcbiAgICAgIHBhcmVudC5yZW1vdmVDaGlsZChfaXRlbSk7XG4gICAgfVxuICAgIGlmIChpc0luaXRpYWxQbGFjZW1lbnQodGFyZ2V0KSkge1xuICAgICAgZHJha2UuZW1pdCgnY2FuY2VsJywgaXRlbSwgX3NvdXJjZSwgX3NvdXJjZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGRyYWtlLmVtaXQoJ2Ryb3AnLCBpdGVtLCB0YXJnZXQsIF9zb3VyY2UsIF9jdXJyZW50U2libGluZyk7XG4gICAgfVxuICAgIGNsZWFudXAoKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHJlbW92ZSAoKSB7XG4gICAgaWYgKCFkcmFrZS5kcmFnZ2luZykge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB2YXIgaXRlbSA9IF9jb3B5IHx8IF9pdGVtO1xuICAgIHZhciBwYXJlbnQgPSBnZXRQYXJlbnQoaXRlbSk7XG4gICAgaWYgKHBhcmVudCkge1xuICAgICAgcGFyZW50LnJlbW92ZUNoaWxkKGl0ZW0pO1xuICAgIH1cbiAgICBkcmFrZS5lbWl0KF9jb3B5ID8gJ2NhbmNlbCcgOiAncmVtb3ZlJywgaXRlbSwgcGFyZW50LCBfc291cmNlKTtcbiAgICBjbGVhbnVwKCk7XG4gIH1cblxuICBmdW5jdGlvbiBjYW5jZWwgKHJldmVydCkge1xuICAgIGlmICghZHJha2UuZHJhZ2dpbmcpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdmFyIHJldmVydHMgPSBhcmd1bWVudHMubGVuZ3RoID4gMCA/IHJldmVydCA6IG8ucmV2ZXJ0T25TcGlsbDtcbiAgICB2YXIgaXRlbSA9IF9jb3B5IHx8IF9pdGVtO1xuICAgIHZhciBwYXJlbnQgPSBnZXRQYXJlbnQoaXRlbSk7XG4gICAgdmFyIGluaXRpYWwgPSBpc0luaXRpYWxQbGFjZW1lbnQocGFyZW50KTtcbiAgICBpZiAoaW5pdGlhbCA9PT0gZmFsc2UgJiYgcmV2ZXJ0cykge1xuICAgICAgaWYgKF9jb3B5KSB7XG4gICAgICAgIGlmIChwYXJlbnQpIHtcbiAgICAgICAgICBwYXJlbnQucmVtb3ZlQ2hpbGQoX2NvcHkpO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBfc291cmNlLmluc2VydEJlZm9yZShpdGVtLCBfaW5pdGlhbFNpYmxpbmcpO1xuICAgICAgfVxuICAgIH1cbiAgICBpZiAoaW5pdGlhbCB8fCByZXZlcnRzKSB7XG4gICAgICBkcmFrZS5lbWl0KCdjYW5jZWwnLCBpdGVtLCBfc291cmNlLCBfc291cmNlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgZHJha2UuZW1pdCgnZHJvcCcsIGl0ZW0sIHBhcmVudCwgX3NvdXJjZSwgX2N1cnJlbnRTaWJsaW5nKTtcbiAgICB9XG4gICAgY2xlYW51cCgpO1xuICB9XG5cbiAgZnVuY3Rpb24gY2xlYW51cCAoKSB7XG4gICAgdmFyIGl0ZW0gPSBfY29weSB8fCBfaXRlbTtcbiAgICB1bmdyYWIoKTtcbiAgICByZW1vdmVNaXJyb3JJbWFnZSgpO1xuICAgIGlmIChpdGVtKSB7XG4gICAgICBjbGFzc2VzLnJtKGl0ZW0sICdndS10cmFuc2l0Jyk7XG4gICAgfVxuICAgIGlmIChfcmVuZGVyVGltZXIpIHtcbiAgICAgIGNsZWFyVGltZW91dChfcmVuZGVyVGltZXIpO1xuICAgIH1cbiAgICBkcmFrZS5kcmFnZ2luZyA9IGZhbHNlO1xuICAgIGlmIChfbGFzdERyb3BUYXJnZXQpIHtcbiAgICAgIGRyYWtlLmVtaXQoJ291dCcsIGl0ZW0sIF9sYXN0RHJvcFRhcmdldCwgX3NvdXJjZSk7XG4gICAgfVxuICAgIGRyYWtlLmVtaXQoJ2RyYWdlbmQnLCBpdGVtKTtcbiAgICBfc291cmNlID0gX2l0ZW0gPSBfY29weSA9IF9pbml0aWFsU2libGluZyA9IF9jdXJyZW50U2libGluZyA9IF9yZW5kZXJUaW1lciA9IF9sYXN0RHJvcFRhcmdldCA9IG51bGw7XG4gIH1cblxuICBmdW5jdGlvbiBpc0luaXRpYWxQbGFjZW1lbnQgKHRhcmdldCwgcykge1xuICAgIHZhciBzaWJsaW5nO1xuICAgIGlmIChzICE9PSB2b2lkIDApIHtcbiAgICAgIHNpYmxpbmcgPSBzO1xuICAgIH0gZWxzZSBpZiAoX21pcnJvcikge1xuICAgICAgc2libGluZyA9IF9jdXJyZW50U2libGluZztcbiAgICB9IGVsc2Uge1xuICAgICAgc2libGluZyA9IG5leHRFbChfY29weSB8fCBfaXRlbSk7XG4gICAgfVxuICAgIHJldHVybiB0YXJnZXQgPT09IF9zb3VyY2UgJiYgc2libGluZyA9PT0gX2luaXRpYWxTaWJsaW5nO1xuICB9XG5cbiAgZnVuY3Rpb24gZmluZERyb3BUYXJnZXQgKGVsZW1lbnRCZWhpbmRDdXJzb3IsIGNsaWVudFgsIGNsaWVudFkpIHtcbiAgICB2YXIgdGFyZ2V0ID0gZWxlbWVudEJlaGluZEN1cnNvcjtcbiAgICB3aGlsZSAodGFyZ2V0ICYmICFhY2NlcHRlZCgpKSB7XG4gICAgICB0YXJnZXQgPSBnZXRQYXJlbnQodGFyZ2V0KTtcbiAgICB9XG4gICAgcmV0dXJuIHRhcmdldDtcblxuICAgIGZ1bmN0aW9uIGFjY2VwdGVkICgpIHtcbiAgICAgIHZhciBkcm9wcGFibGUgPSBpc0NvbnRhaW5lcih0YXJnZXQpO1xuICAgICAgaWYgKGRyb3BwYWJsZSA9PT0gZmFsc2UpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuXG4gICAgICB2YXIgaW1tZWRpYXRlID0gZ2V0SW1tZWRpYXRlQ2hpbGQodGFyZ2V0LCBlbGVtZW50QmVoaW5kQ3Vyc29yKTtcbiAgICAgIHZhciByZWZlcmVuY2UgPSBnZXRSZWZlcmVuY2UodGFyZ2V0LCBpbW1lZGlhdGUsIGNsaWVudFgsIGNsaWVudFkpO1xuICAgICAgdmFyIGluaXRpYWwgPSBpc0luaXRpYWxQbGFjZW1lbnQodGFyZ2V0LCByZWZlcmVuY2UpO1xuICAgICAgaWYgKGluaXRpYWwpIHtcbiAgICAgICAgcmV0dXJuIHRydWU7IC8vIHNob3VsZCBhbHdheXMgYmUgYWJsZSB0byBkcm9wIGl0IHJpZ2h0IGJhY2sgd2hlcmUgaXQgd2FzXG4gICAgICB9XG4gICAgICByZXR1cm4gby5hY2NlcHRzKF9pdGVtLCB0YXJnZXQsIF9zb3VyY2UsIHJlZmVyZW5jZSk7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gZHJhZyAoZSkge1xuICAgIGlmICghX21pcnJvcikge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICB2YXIgY2xpZW50WCA9IGdldENvb3JkKCdjbGllbnRYJywgZSkgfHwgMDtcbiAgICB2YXIgY2xpZW50WSA9IGdldENvb3JkKCdjbGllbnRZJywgZSkgfHwgMDtcbiAgICB2YXIgeCA9IGNsaWVudFggLSBfb2Zmc2V0WDtcbiAgICB2YXIgeSA9IGNsaWVudFkgLSBfb2Zmc2V0WTtcblxuICAgIF9taXJyb3Iuc3R5bGUubGVmdCA9IHggKyAncHgnO1xuICAgIF9taXJyb3Iuc3R5bGUudG9wID0geSArICdweCc7XG5cbiAgICB2YXIgaXRlbSA9IF9jb3B5IHx8IF9pdGVtO1xuICAgIHZhciBlbGVtZW50QmVoaW5kQ3Vyc29yID0gZ2V0RWxlbWVudEJlaGluZFBvaW50KF9taXJyb3IsIGNsaWVudFgsIGNsaWVudFkpO1xuICAgIHZhciBkcm9wVGFyZ2V0ID0gZmluZERyb3BUYXJnZXQoZWxlbWVudEJlaGluZEN1cnNvciwgY2xpZW50WCwgY2xpZW50WSk7XG4gICAgdmFyIGNoYW5nZWQgPSBkcm9wVGFyZ2V0ICE9PSBudWxsICYmIGRyb3BUYXJnZXQgIT09IF9sYXN0RHJvcFRhcmdldDtcbiAgICBpZiAoY2hhbmdlZCB8fCBkcm9wVGFyZ2V0ID09PSBudWxsKSB7XG4gICAgICBvdXQoKTtcbiAgICAgIF9sYXN0RHJvcFRhcmdldCA9IGRyb3BUYXJnZXQ7XG4gICAgICBvdmVyKCk7XG4gICAgfVxuICAgIHZhciBwYXJlbnQgPSBnZXRQYXJlbnQoaXRlbSk7XG4gICAgaWYgKGRyb3BUYXJnZXQgPT09IF9zb3VyY2UgJiYgX2NvcHkgJiYgIW8uY29weVNvcnRTb3VyY2UpIHtcbiAgICAgIGlmIChwYXJlbnQpIHtcbiAgICAgICAgcGFyZW50LnJlbW92ZUNoaWxkKGl0ZW0pO1xuICAgICAgfVxuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB2YXIgcmVmZXJlbmNlO1xuICAgIHZhciBpbW1lZGlhdGUgPSBnZXRJbW1lZGlhdGVDaGlsZChkcm9wVGFyZ2V0LCBlbGVtZW50QmVoaW5kQ3Vyc29yKTtcbiAgICBpZiAoaW1tZWRpYXRlICE9PSBudWxsKSB7XG4gICAgICByZWZlcmVuY2UgPSBnZXRSZWZlcmVuY2UoZHJvcFRhcmdldCwgaW1tZWRpYXRlLCBjbGllbnRYLCBjbGllbnRZKTtcbiAgICB9IGVsc2UgaWYgKG8ucmV2ZXJ0T25TcGlsbCA9PT0gdHJ1ZSAmJiAhX2NvcHkpIHtcbiAgICAgIHJlZmVyZW5jZSA9IF9pbml0aWFsU2libGluZztcbiAgICAgIGRyb3BUYXJnZXQgPSBfc291cmNlO1xuICAgIH0gZWxzZSB7XG4gICAgICBpZiAoX2NvcHkgJiYgcGFyZW50KSB7XG4gICAgICAgIHBhcmVudC5yZW1vdmVDaGlsZChpdGVtKTtcbiAgICAgIH1cbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgaWYgKFxuICAgICAgKHJlZmVyZW5jZSA9PT0gbnVsbCAmJiBjaGFuZ2VkKSB8fFxuICAgICAgcmVmZXJlbmNlICE9PSBpdGVtICYmXG4gICAgICByZWZlcmVuY2UgIT09IG5leHRFbChpdGVtKVxuICAgICkge1xuICAgICAgX2N1cnJlbnRTaWJsaW5nID0gcmVmZXJlbmNlO1xuICAgICAgZHJvcFRhcmdldC5pbnNlcnRCZWZvcmUoaXRlbSwgcmVmZXJlbmNlKTtcbiAgICAgIGRyYWtlLmVtaXQoJ3NoYWRvdycsIGl0ZW0sIGRyb3BUYXJnZXQsIF9zb3VyY2UpO1xuICAgIH1cbiAgICBmdW5jdGlvbiBtb3ZlZCAodHlwZSkgeyBkcmFrZS5lbWl0KHR5cGUsIGl0ZW0sIF9sYXN0RHJvcFRhcmdldCwgX3NvdXJjZSk7IH1cbiAgICBmdW5jdGlvbiBvdmVyICgpIHsgaWYgKGNoYW5nZWQpIHsgbW92ZWQoJ292ZXInKTsgfSB9XG4gICAgZnVuY3Rpb24gb3V0ICgpIHsgaWYgKF9sYXN0RHJvcFRhcmdldCkgeyBtb3ZlZCgnb3V0Jyk7IH0gfVxuICB9XG5cbiAgZnVuY3Rpb24gc3BpbGxPdmVyIChlbCkge1xuICAgIGNsYXNzZXMucm0oZWwsICdndS1oaWRlJyk7XG4gIH1cblxuICBmdW5jdGlvbiBzcGlsbE91dCAoZWwpIHtcbiAgICBpZiAoZHJha2UuZHJhZ2dpbmcpIHsgY2xhc3Nlcy5hZGQoZWwsICdndS1oaWRlJyk7IH1cbiAgfVxuXG4gIGZ1bmN0aW9uIHJlbmRlck1pcnJvckltYWdlICgpIHtcbiAgICBpZiAoX21pcnJvcikge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB2YXIgcmVjdCA9IF9pdGVtLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgIF9taXJyb3IgPSBfaXRlbS5jbG9uZU5vZGUodHJ1ZSk7XG4gICAgX21pcnJvci5zdHlsZS53aWR0aCA9IGdldFJlY3RXaWR0aChyZWN0KSArICdweCc7XG4gICAgX21pcnJvci5zdHlsZS5oZWlnaHQgPSBnZXRSZWN0SGVpZ2h0KHJlY3QpICsgJ3B4JztcbiAgICBjbGFzc2VzLnJtKF9taXJyb3IsICdndS10cmFuc2l0Jyk7XG4gICAgY2xhc3Nlcy5hZGQoX21pcnJvciwgJ2d1LW1pcnJvcicpO1xuICAgIG8ubWlycm9yQ29udGFpbmVyLmFwcGVuZENoaWxkKF9taXJyb3IpO1xuICAgIHRvdWNoeShkb2N1bWVudEVsZW1lbnQsICdhZGQnLCAnbW91c2Vtb3ZlJywgZHJhZyk7XG4gICAgY2xhc3Nlcy5hZGQoby5taXJyb3JDb250YWluZXIsICdndS11bnNlbGVjdGFibGUnKTtcbiAgICBkcmFrZS5lbWl0KCdjbG9uZWQnLCBfbWlycm9yLCBfaXRlbSwgJ21pcnJvcicpO1xuICB9XG5cbiAgZnVuY3Rpb24gcmVtb3ZlTWlycm9ySW1hZ2UgKCkge1xuICAgIGlmIChfbWlycm9yKSB7XG4gICAgICBjbGFzc2VzLnJtKG8ubWlycm9yQ29udGFpbmVyLCAnZ3UtdW5zZWxlY3RhYmxlJyk7XG4gICAgICB0b3VjaHkoZG9jdW1lbnRFbGVtZW50LCAncmVtb3ZlJywgJ21vdXNlbW92ZScsIGRyYWcpO1xuICAgICAgZ2V0UGFyZW50KF9taXJyb3IpLnJlbW92ZUNoaWxkKF9taXJyb3IpO1xuICAgICAgX21pcnJvciA9IG51bGw7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gZ2V0SW1tZWRpYXRlQ2hpbGQgKGRyb3BUYXJnZXQsIHRhcmdldCkge1xuICAgIHZhciBpbW1lZGlhdGUgPSB0YXJnZXQ7XG4gICAgd2hpbGUgKGltbWVkaWF0ZSAhPT0gZHJvcFRhcmdldCAmJiBnZXRQYXJlbnQoaW1tZWRpYXRlKSAhPT0gZHJvcFRhcmdldCkge1xuICAgICAgaW1tZWRpYXRlID0gZ2V0UGFyZW50KGltbWVkaWF0ZSk7XG4gICAgfVxuICAgIGlmIChpbW1lZGlhdGUgPT09IGRvY3VtZW50RWxlbWVudCkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIHJldHVybiBpbW1lZGlhdGU7XG4gIH1cblxuICBmdW5jdGlvbiBnZXRSZWZlcmVuY2UgKGRyb3BUYXJnZXQsIHRhcmdldCwgeCwgeSkge1xuICAgIHZhciBob3Jpem9udGFsID0gby5kaXJlY3Rpb24gPT09ICdob3Jpem9udGFsJztcbiAgICB2YXIgcmVmZXJlbmNlID0gdGFyZ2V0ICE9PSBkcm9wVGFyZ2V0ID8gaW5zaWRlKCkgOiBvdXRzaWRlKCk7XG4gICAgcmV0dXJuIHJlZmVyZW5jZTtcblxuICAgIGZ1bmN0aW9uIG91dHNpZGUgKCkgeyAvLyBzbG93ZXIsIGJ1dCBhYmxlIHRvIGZpZ3VyZSBvdXQgYW55IHBvc2l0aW9uXG4gICAgICB2YXIgbGVuID0gZHJvcFRhcmdldC5jaGlsZHJlbi5sZW5ndGg7XG4gICAgICB2YXIgaTtcbiAgICAgIHZhciBlbDtcbiAgICAgIHZhciByZWN0O1xuICAgICAgZm9yIChpID0gMDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICAgIGVsID0gZHJvcFRhcmdldC5jaGlsZHJlbltpXTtcbiAgICAgICAgcmVjdCA9IGVsLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgICAgICBpZiAoaG9yaXpvbnRhbCAmJiAocmVjdC5sZWZ0ICsgcmVjdC53aWR0aCAvIDIpID4geCkgeyByZXR1cm4gZWw7IH1cbiAgICAgICAgaWYgKCFob3Jpem9udGFsICYmIChyZWN0LnRvcCArIHJlY3QuaGVpZ2h0IC8gMikgPiB5KSB7IHJldHVybiBlbDsgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gaW5zaWRlICgpIHsgLy8gZmFzdGVyLCBidXQgb25seSBhdmFpbGFibGUgaWYgZHJvcHBlZCBpbnNpZGUgYSBjaGlsZCBlbGVtZW50XG4gICAgICB2YXIgcmVjdCA9IHRhcmdldC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICAgIGlmIChob3Jpem9udGFsKSB7XG4gICAgICAgIHJldHVybiByZXNvbHZlKHggPiByZWN0LmxlZnQgKyBnZXRSZWN0V2lkdGgocmVjdCkgLyAyKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiByZXNvbHZlKHkgPiByZWN0LnRvcCArIGdldFJlY3RIZWlnaHQocmVjdCkgLyAyKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiByZXNvbHZlIChhZnRlcikge1xuICAgICAgcmV0dXJuIGFmdGVyID8gbmV4dEVsKHRhcmdldCkgOiB0YXJnZXQ7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gaXNDb3B5IChpdGVtLCBjb250YWluZXIpIHtcbiAgICByZXR1cm4gdHlwZW9mIG8uY29weSA9PT0gJ2Jvb2xlYW4nID8gby5jb3B5IDogby5jb3B5KGl0ZW0sIGNvbnRhaW5lcik7XG4gIH1cbn1cblxuZnVuY3Rpb24gdG91Y2h5IChlbCwgb3AsIHR5cGUsIGZuKSB7XG4gIHZhciB0b3VjaCA9IHtcbiAgICBtb3VzZXVwOiAndG91Y2hlbmQnLFxuICAgIG1vdXNlZG93bjogJ3RvdWNoc3RhcnQnLFxuICAgIG1vdXNlbW92ZTogJ3RvdWNobW92ZSdcbiAgfTtcbiAgdmFyIHBvaW50ZXJzID0ge1xuICAgIG1vdXNldXA6ICdwb2ludGVydXAnLFxuICAgIG1vdXNlZG93bjogJ3BvaW50ZXJkb3duJyxcbiAgICBtb3VzZW1vdmU6ICdwb2ludGVybW92ZSdcbiAgfTtcbiAgdmFyIG1pY3Jvc29mdCA9IHtcbiAgICBtb3VzZXVwOiAnTVNQb2ludGVyVXAnLFxuICAgIG1vdXNlZG93bjogJ01TUG9pbnRlckRvd24nLFxuICAgIG1vdXNlbW92ZTogJ01TUG9pbnRlck1vdmUnXG4gIH07XG4gIGlmIChnbG9iYWwubmF2aWdhdG9yLnBvaW50ZXJFbmFibGVkKSB7XG4gICAgY3Jvc3N2ZW50W29wXShlbCwgcG9pbnRlcnNbdHlwZV0sIGZuKTtcbiAgfSBlbHNlIGlmIChnbG9iYWwubmF2aWdhdG9yLm1zUG9pbnRlckVuYWJsZWQpIHtcbiAgICBjcm9zc3ZlbnRbb3BdKGVsLCBtaWNyb3NvZnRbdHlwZV0sIGZuKTtcbiAgfSBlbHNlIHtcbiAgICBjcm9zc3ZlbnRbb3BdKGVsLCB0b3VjaFt0eXBlXSwgZm4pO1xuICAgIGNyb3NzdmVudFtvcF0oZWwsIHR5cGUsIGZuKTtcbiAgfVxufVxuXG5mdW5jdGlvbiB3aGljaE1vdXNlQnV0dG9uIChlKSB7XG4gIGlmIChlLnRvdWNoZXMgIT09IHZvaWQgMCkgeyByZXR1cm4gZS50b3VjaGVzLmxlbmd0aDsgfVxuICBpZiAoZS53aGljaCAhPT0gdm9pZCAwICYmIGUud2hpY2ggIT09IDApIHsgcmV0dXJuIGUud2hpY2g7IH0gLy8gc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9iZXZhY3F1YS9kcmFndWxhL2lzc3Vlcy8yNjFcbiAgaWYgKGUuYnV0dG9ucyAhPT0gdm9pZCAwKSB7IHJldHVybiBlLmJ1dHRvbnM7IH1cbiAgdmFyIGJ1dHRvbiA9IGUuYnV0dG9uO1xuICBpZiAoYnV0dG9uICE9PSB2b2lkIDApIHsgLy8gc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9qcXVlcnkvanF1ZXJ5L2Jsb2IvOTllOGZmMWJhYTdhZTM0MWU5NGJiODljM2U4NDU3MGM3YzNhZDllYS9zcmMvZXZlbnQuanMjTDU3My1MNTc1XG4gICAgcmV0dXJuIGJ1dHRvbiAmIDEgPyAxIDogYnV0dG9uICYgMiA/IDMgOiAoYnV0dG9uICYgNCA/IDIgOiAwKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBnZXRPZmZzZXQgKGVsKSB7XG4gIHZhciByZWN0ID0gZWwuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gIHJldHVybiB7XG4gICAgbGVmdDogcmVjdC5sZWZ0ICsgZ2V0U2Nyb2xsKCdzY3JvbGxMZWZ0JywgJ3BhZ2VYT2Zmc2V0JyksXG4gICAgdG9wOiByZWN0LnRvcCArIGdldFNjcm9sbCgnc2Nyb2xsVG9wJywgJ3BhZ2VZT2Zmc2V0JylcbiAgfTtcbn1cblxuZnVuY3Rpb24gZ2V0U2Nyb2xsIChzY3JvbGxQcm9wLCBvZmZzZXRQcm9wKSB7XG4gIGlmICh0eXBlb2YgZ2xvYmFsW29mZnNldFByb3BdICE9PSAndW5kZWZpbmVkJykge1xuICAgIHJldHVybiBnbG9iYWxbb2Zmc2V0UHJvcF07XG4gIH1cbiAgaWYgKGRvY3VtZW50RWxlbWVudC5jbGllbnRIZWlnaHQpIHtcbiAgICByZXR1cm4gZG9jdW1lbnRFbGVtZW50W3Njcm9sbFByb3BdO1xuICB9XG4gIHJldHVybiBkb2MuYm9keVtzY3JvbGxQcm9wXTtcbn1cblxuZnVuY3Rpb24gZ2V0RWxlbWVudEJlaGluZFBvaW50IChwb2ludCwgeCwgeSkge1xuICBwb2ludCA9IHBvaW50IHx8IHt9O1xuICB2YXIgc3RhdGUgPSBwb2ludC5jbGFzc05hbWUgfHwgJyc7XG4gIHZhciBlbDtcbiAgcG9pbnQuY2xhc3NOYW1lICs9ICcgZ3UtaGlkZSc7XG4gIGVsID0gZG9jLmVsZW1lbnRGcm9tUG9pbnQoeCwgeSk7XG4gIHBvaW50LmNsYXNzTmFtZSA9IHN0YXRlO1xuICByZXR1cm4gZWw7XG59XG5cbmZ1bmN0aW9uIG5ldmVyICgpIHsgcmV0dXJuIGZhbHNlOyB9XG5mdW5jdGlvbiBhbHdheXMgKCkgeyByZXR1cm4gdHJ1ZTsgfVxuZnVuY3Rpb24gZ2V0UmVjdFdpZHRoIChyZWN0KSB7IHJldHVybiByZWN0LndpZHRoIHx8IChyZWN0LnJpZ2h0IC0gcmVjdC5sZWZ0KTsgfVxuZnVuY3Rpb24gZ2V0UmVjdEhlaWdodCAocmVjdCkgeyByZXR1cm4gcmVjdC5oZWlnaHQgfHwgKHJlY3QuYm90dG9tIC0gcmVjdC50b3ApOyB9XG5mdW5jdGlvbiBnZXRQYXJlbnQgKGVsKSB7IHJldHVybiBlbC5wYXJlbnROb2RlID09PSBkb2MgPyBudWxsIDogZWwucGFyZW50Tm9kZTsgfVxuZnVuY3Rpb24gaXNJbnB1dCAoZWwpIHsgcmV0dXJuIGVsLnRhZ05hbWUgPT09ICdJTlBVVCcgfHwgZWwudGFnTmFtZSA9PT0gJ1RFWFRBUkVBJyB8fCBlbC50YWdOYW1lID09PSAnU0VMRUNUJyB8fCBpc0VkaXRhYmxlKGVsKTsgfVxuZnVuY3Rpb24gaXNFZGl0YWJsZSAoZWwpIHtcbiAgaWYgKCFlbCkgeyByZXR1cm4gZmFsc2U7IH0gLy8gbm8gcGFyZW50cyB3ZXJlIGVkaXRhYmxlXG4gIGlmIChlbC5jb250ZW50RWRpdGFibGUgPT09ICdmYWxzZScpIHsgcmV0dXJuIGZhbHNlOyB9IC8vIHN0b3AgdGhlIGxvb2t1cFxuICBpZiAoZWwuY29udGVudEVkaXRhYmxlID09PSAndHJ1ZScpIHsgcmV0dXJuIHRydWU7IH0gLy8gZm91bmQgYSBjb250ZW50RWRpdGFibGUgZWxlbWVudCBpbiB0aGUgY2hhaW5cbiAgcmV0dXJuIGlzRWRpdGFibGUoZ2V0UGFyZW50KGVsKSk7IC8vIGNvbnRlbnRFZGl0YWJsZSBpcyBzZXQgdG8gJ2luaGVyaXQnXG59XG5cbmZ1bmN0aW9uIG5leHRFbCAoZWwpIHtcbiAgcmV0dXJuIGVsLm5leHRFbGVtZW50U2libGluZyB8fCBtYW51YWxseSgpO1xuICBmdW5jdGlvbiBtYW51YWxseSAoKSB7XG4gICAgdmFyIHNpYmxpbmcgPSBlbDtcbiAgICBkbyB7XG4gICAgICBzaWJsaW5nID0gc2libGluZy5uZXh0U2libGluZztcbiAgICB9IHdoaWxlIChzaWJsaW5nICYmIHNpYmxpbmcubm9kZVR5cGUgIT09IDEpO1xuICAgIHJldHVybiBzaWJsaW5nO1xuICB9XG59XG5cbmZ1bmN0aW9uIGdldEV2ZW50SG9zdCAoZSkge1xuICAvLyBvbiB0b3VjaGVuZCBldmVudCwgd2UgaGF2ZSB0byB1c2UgYGUuY2hhbmdlZFRvdWNoZXNgXG4gIC8vIHNlZSBodHRwOi8vc3RhY2tvdmVyZmxvdy5jb20vcXVlc3Rpb25zLzcxOTI1NjMvdG91Y2hlbmQtZXZlbnQtcHJvcGVydGllc1xuICAvLyBzZWUgaHR0cHM6Ly9naXRodWIuY29tL2JldmFjcXVhL2RyYWd1bGEvaXNzdWVzLzM0XG4gIGlmIChlLnRhcmdldFRvdWNoZXMgJiYgZS50YXJnZXRUb3VjaGVzLmxlbmd0aCkge1xuICAgIHJldHVybiBlLnRhcmdldFRvdWNoZXNbMF07XG4gIH1cbiAgaWYgKGUuY2hhbmdlZFRvdWNoZXMgJiYgZS5jaGFuZ2VkVG91Y2hlcy5sZW5ndGgpIHtcbiAgICByZXR1cm4gZS5jaGFuZ2VkVG91Y2hlc1swXTtcbiAgfVxuICByZXR1cm4gZTtcbn1cblxuZnVuY3Rpb24gZ2V0Q29vcmQgKGNvb3JkLCBlKSB7XG4gIHZhciBob3N0ID0gZ2V0RXZlbnRIb3N0KGUpO1xuICB2YXIgbWlzc01hcCA9IHtcbiAgICBwYWdlWDogJ2NsaWVudFgnLCAvLyBJRThcbiAgICBwYWdlWTogJ2NsaWVudFknIC8vIElFOFxuICB9O1xuICBpZiAoY29vcmQgaW4gbWlzc01hcCAmJiAhKGNvb3JkIGluIGhvc3QpICYmIG1pc3NNYXBbY29vcmRdIGluIGhvc3QpIHtcbiAgICBjb29yZCA9IG1pc3NNYXBbY29vcmRdO1xuICB9XG4gIHJldHVybiBob3N0W2Nvb3JkXTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBkcmFndWxhO1xuIiwidmFyIHNpID0gdHlwZW9mIHNldEltbWVkaWF0ZSA9PT0gJ2Z1bmN0aW9uJywgdGljaztcbmlmIChzaSkge1xuICB0aWNrID0gZnVuY3Rpb24gKGZuKSB7IHNldEltbWVkaWF0ZShmbik7IH07XG59IGVsc2Uge1xuICB0aWNrID0gZnVuY3Rpb24gKGZuKSB7IHNldFRpbWVvdXQoZm4sIDApOyB9O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHRpY2s7IiwidHlwZSBMaXN0ZW5lcnMgPSB7XG4gIFtpZDogc3RyaW5nXToge1xuICAgIGV2ZW50OiBzdHJpbmdcbiAgICBlbGVtZW50OiBIVE1MRWxlbWVudFxuICAgIGhhbmRsZXI6IChldmVudDogRXZlbnQpID0+IHZvaWRcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgRXZlbnRMaXN0ZW5lciB7XG4gIHByaXZhdGUgcmVhZG9ubHkgbGlzdGVuZXJzOiBMaXN0ZW5lcnMgPSB7fVxuXG4gIGFkZChsaXN0ZW5lcklEOiBzdHJpbmcsIGV2ZW50OiBzdHJpbmcsIGVsZW1lbnQ6IEhUTUxFbGVtZW50LCBoYW5kbGVyOiAoZTogRXZlbnQpID0+IHZvaWQpIHtcbiAgICB0aGlzLmxpc3RlbmVyc1tsaXN0ZW5lcklEXSA9IHtcbiAgICAgIGV2ZW50LFxuICAgICAgZWxlbWVudCxcbiAgICAgIGhhbmRsZXIsXG4gICAgfVxuICAgIGVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihldmVudCwgaGFuZGxlcilcbiAgfVxuXG4gIHJlbW92ZShsaXN0ZW5lcklkOiBzdHJpbmcpIHtcbiAgICBjb25zdCBsaXN0ZW5lciA9IHRoaXMubGlzdGVuZXJzW2xpc3RlbmVySWRdXG4gICAgaWYgKCFsaXN0ZW5lcikge1xuICAgICAgcmV0dXJuXG4gICAgfVxuICAgIGxpc3RlbmVyLmVsZW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcihsaXN0ZW5lci5ldmVudCwgbGlzdGVuZXIuaGFuZGxlcilcbiAgICBkZWxldGUgdGhpcy5saXN0ZW5lcnNbbGlzdGVuZXJJZF1cbiAgfVxufSIsImltcG9ydCB7IHY0IGFzIHV1aWQsIHZhbGlkYXRlIH0gZnJvbSAndXVpZCdcblxuZXhwb3J0IGNvbnN0IHN0YXR1c01hcCA9IHtcbiAgdG9kbzogJ1RvZG8nLFxuICBkb2luZzogJ0RvaW5nJyxcbiAgZG9uZTogJ0RvbmUnLFxufSBhcyBjb25zdFxuZXhwb3J0IHR5cGUgU3RhdHVzID0gdHlwZW9mIHN0YXR1c01hcFtrZXlvZiB0eXBlb2Ygc3RhdHVzTWFwXVxuXG5leHBvcnQgdHlwZSBUYXNrT2JqZWN0ID0ge1xuICBpZDogc3RyaW5nXG4gIHRpdGxlOiBzdHJpbmdcbiAgc3RhdHVzOiBTdGF0dXNcbn1cbmV4cG9ydCBjbGFzcyBUYXNrIHtcbiAgcmVhZG9ubHkgaWRcbiAgdGl0bGVcbiAgc3RhdHVzXG5cbiAgY29uc3RydWN0b3IocHJvcGVydGllczogeyBpZD86IHN0cmluZywgdGl0bGU6IHN0cmluZywgc3RhdHVzPzogU3RhdHVzIH0pIHtcbiAgICB0aGlzLmlkID0gcHJvcGVydGllcy5pZCB8fCB1dWlkKClcbiAgICB0aGlzLnRpdGxlID0gcHJvcGVydGllcy50aXRsZVxuICAgIHRoaXMuc3RhdHVzID0gcHJvcGVydGllcy5zdGF0dXMgfHwgc3RhdHVzTWFwLnRvZG9cbiAgfVxuXG4gIHVwZGF0ZShwcm9wZXJ0aWVzOiB7IHRpdGxlPzogc3RyaW5nOyBzdGF0dXM/OiBTdGF0dXMgfSkge1xuICAgICAgdGhpcy50aXRsZSA9IHByb3BlcnRpZXMudGl0bGUgfHwgdGhpcy50aXRsZVxuICAgICAgdGhpcy5zdGF0dXMgPSBwcm9wZXJ0aWVzLnN0YXR1cyB8fCB0aGlzLnN0YXR1c1xuICB9XG5cbiAgc3RhdGljIHZhbGlkYXRlKHZhbHVlOiBhbnkpIHtcbiAgICBpZighdmFsdWUpIHJldHVybiBmYWxzZVxuICAgIGlmKCF2YWxpZGF0ZSh2YWx1ZS5pZCkpIHJldHVybiBmYWxzZVxuICAgIGlmKCF2YWx1ZS50aXRsZSkgcmV0dXJuIGZhbHNlXG4gICAgaWYoIU9iamVjdC52YWx1ZXMoc3RhdHVzTWFwKS5pbmNsdWRlcyh2YWx1ZS5zdGF0dXMpKSByZXR1cm4gZmFsc2VcbiAgICByZXR1cm4gdHJ1ZVxuICB9XG59IiwiaW1wb3J0IHsgU3RhdHVzLCBUYXNrLCBUYXNrT2JqZWN0IH0gZnJvbSAnLi9UYXNrJ1xuXG5jb25zdCBTVE9SQUdFX0tFWSA9ICdUQVNLUydcbmV4cG9ydCBjbGFzcyBUYXNrQ29sbGVjdGlvbiB7XG4gIHByaXZhdGUgcmVhZG9ubHkgc3RvcmFnZVxuICBwcml2YXRlIHRhc2tzOiBUYXNrW10gPSBbXVxuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMuc3RvcmFnZSA9IGxvY2FsU3RvcmFnZVxuICAgIHRoaXMudGFza3MgPSB0aGlzLmdldFN0b3JlZFRhc2tzKClcbiAgfVxuXG4gIGFkZCh0YXNrOiBUYXNrKSB7XG4gICAgdGhpcy50YXNrcy5wdXNoKHRhc2spXG4gICAgdGhpcy51cGRhdGVTdG9yYWdlKClcbiAgfVxuXG4gIGRlbGV0ZSh0YXNrOiBUYXNrKSB7XG4gICAgdGhpcy50YXNrcyA9IHRoaXMudGFza3MuZmlsdGVyKHQgPT4gdC5pZCAhPT0gdGFzay5pZClcbiAgICB0aGlzLnVwZGF0ZVN0b3JhZ2UoKVxuICB9XG5cbiAgZmluZChpZDogc3RyaW5nKTogVGFzayB8IG51bGwge1xuICAgIHJldHVybiB0aGlzLnRhc2tzLmZpbmQodCA9PiB0LmlkID09PSBpZCkgfHwgbnVsbFxuICB9XG5cbiAgdXBkYXRlKHRhc2s6IFRhc2spIHtcbiAgICB0aGlzLnRhc2tzID0gdGhpcy50YXNrcy5tYXAoKGl0ZW0pID0+IHtcbiAgICAgIGlmIChpdGVtLmlkID09PSB0YXNrLmlkKSB7XG4gICAgICAgIHJldHVybiB0YXNrXG4gICAgICB9XG4gICAgICByZXR1cm4gaXRlbVxuICAgIH0pXG4gIH1cblxuICBmaWx0ZXIoZmlsdGVyU3RhdHVzOiBTdGF0dXMpIHtcbiAgICByZXR1cm4gdGhpcy50YXNrcy5maWx0ZXIoKHsgc3RhdHVzIH0pID0+IHN0YXR1cyA9PT0gZmlsdGVyU3RhdHVzKVxuICB9XG5cbiAgcHJpdmF0ZSB1cGRhdGVTdG9yYWdlKCkge1xuICAgIHRoaXMuc3RvcmFnZS5zZXRJdGVtKFNUT1JBR0VfS0VZLCBKU09OLnN0cmluZ2lmeSh0aGlzLnRhc2tzKSlcbiAgfVxuXG4gIHByaXZhdGUgZ2V0U3RvcmVkVGFza3MoKTogVGFza1tdIHtcbiAgICBjb25zdCBqc29uU3RyaW5nID0gdGhpcy5zdG9yYWdlLmdldEl0ZW0oU1RPUkFHRV9LRVkpXG4gICAgaWYgKCFqc29uU3RyaW5nKSByZXR1cm4gW11cbiAgICB0cnl7XG4gICAgICBjb25zdCBzdG9yZWRUYXNrcyA9IEpTT04ucGFyc2UoanNvblN0cmluZylcblxuICAgICAgYXNzZXJ0SXNUYXNrT2JqZWN0cyhzdG9yZWRUYXNrcylcblxuICAgICAgY29uc3QgdGFza3MgPSBzdG9yZWRUYXNrcy5tYXAodCA9PiBuZXcgVGFzayh0KSlcbiAgICAgIHJldHVybiB0YXNrc1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIHRoaXMuc3RvcmFnZS5yZW1vdmVJdGVtKFNUT1JBR0VfS0VZKVxuICAgICAgcmV0dXJuIFtdXG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIGFzc2VydElzVGFza09iamVjdHModmFsdWU6IGFueSk6IGFzc2VydHMgdmFsdWUgaXMgVGFza09iamVjdFtdIHtcbiAgaWYoIUFycmF5LmlzQXJyYXkodmFsdWUpIHx8ICF2YWx1ZS5ldmVyeSgoaXRlbSkgPT4gVGFzay52YWxpZGF0ZShpdGVtKSkpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ+W8leaVsOOAjHZhbHVl44CN44GvIFRhc2tPYmplY3RbXSDlnovjgajkuIDoh7TjgZfjgb7jgZvjgpPjgIInKVxuICB9XG59XG4iLCJpbXBvcnQgZHJhZ3VsYSBmcm9tICdkcmFndWxhJ1xuXG5pbXBvcnQgeyBTdGF0dXMsIFRhc2ssIHN0YXR1c01hcCB9IGZyb20gJy4vVGFzaydcbmltcG9ydCB7IFRhc2tDb2xsZWN0aW9uIH0gZnJvbSAnLi9UYXNrQ29sbGVjdGlvbidcblxuZXhwb3J0IGNsYXNzIFRhc2tSZW5kZXJlciB7XG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgcmVhZG9ubHkgdG9kb0xpc3Q6IEhUTUxFbGVtZW50LFxuICAgIHByaXZhdGUgcmVhZG9ubHkgZG9pbmdMaXN0OiBIVE1MRWxlbWVudCxcbiAgICBwcml2YXRlIHJlYWRvbmx5IGRvbmVMaXN0OiBIVE1MRWxlbWVudCkge1xuICB9XG5cbiAgYXBwZW5kKHRhc2s6IFRhc2spIHtcbiAgICBjb25zdCB7dGFza0VsLCBkZWxldGVCdXR0b25FbH0gPSB0aGlzLnJlbmRlcih0YXNrKVxuXG4gICAgdGhpcy50b2RvTGlzdC5hcHBlbmQodGFza0VsKVxuICAgIHJldHVybiB7IGRlbGV0ZUJ1dHRvbkVsIH1cbiAgfVxuXG4gIHJlbmRlckFsbCh0YXNrQ29sbGVjdGlvbjogVGFza0NvbGxlY3Rpb24pIHtcbiAgICBjb25zdCB0b2RvVGFza3MgPSB0aGlzLnJlbmRlckxpc3QodGFza0NvbGxlY3Rpb24uZmlsdGVyKHN0YXR1c01hcC50b2RvKSwgdGhpcy50b2RvTGlzdClcbiAgICBjb25zdCBkb2luZ1Rhc2tzID0gdGhpcy5yZW5kZXJMaXN0KHRhc2tDb2xsZWN0aW9uLmZpbHRlcihzdGF0dXNNYXAuZG9pbmcpLCB0aGlzLmRvaW5nTGlzdClcbiAgICBjb25zdCBkb25lVGFza3MgPSB0aGlzLnJlbmRlckxpc3QodGFza0NvbGxlY3Rpb24uZmlsdGVyKHN0YXR1c01hcC5kb25lKSwgdGhpcy5kb25lTGlzdClcblxuICAgIHJldHVybiBbLi4udG9kb1Rhc2tzLCAuLi5kb2luZ1Rhc2tzLCAuLi5kb25lVGFza3NdXG4gIH1cblxuICBwcml2YXRlIHJlbmRlcih0YXNrOiBUYXNrKSB7XG4gICAgLy8gPGRpdiBjbGFzcz1cInRhc2tJdGVtXCI+XG4gICAgLy8gICA8c3Bhbj7jgr/jgqTjg4jjg6s8L3NwYW4+XG4gICAgLy8gICA8YnV0dG9uPuWJiumZpDwvYnV0dG9uPlxuICAgIC8vIDwvZGl2PlxuXG4gICAgY29uc3QgdGFza0VsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JylcbiAgICBjb25zdCBzcGFuRWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzcGFuJylcbiAgICBjb25zdCBkZWxldGVCdXR0b25FbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2J1dHRvbicpXG5cbiAgICB0YXNrRWwuaWQgPSB0YXNrLmlkXG4gICAgdGFza0VsLmNsYXNzTGlzdC5hZGQoJ3Rhc2staXRlbScpXG4gICAgc3BhbkVsLnRleHRDb250ZW50ID0gdGFzay50aXRsZVxuICAgIGRlbGV0ZUJ1dHRvbkVsLnRleHRDb250ZW50ID0gJ+WJiumZpCdcbiAgICB0YXNrRWwuYXBwZW5kKHNwYW5FbCwgZGVsZXRlQnV0dG9uRWwpXG5cbiAgICByZXR1cm4ge3Rhc2tFbCwgZGVsZXRlQnV0dG9uRWx9XG4gIH1cblxuICBwcml2YXRlIHJlbmRlckxpc3QodGFza3M6IFRhc2tbXSwgbGlzdEVsOiBIVE1MRWxlbWVudCkge1xuICAgIGlmKHRhc2tzLmxlbmd0aCA9PT0gMCkgcmV0dXJuW11cbiAgICBjb25zdCB0YXNrTGlzdDogQXJyYXk8e1xuICAgICAgdGFzazogVGFzayxcbiAgICAgIGRlbGV0ZUJ1dHRvbkVsOiBIVE1MQnV0dG9uRWxlbWVudFxuICAgIH0+ID0gW11cblxuICAgIHRhc2tzLmZvckVhY2goKHRhc2spID0+IHtcbiAgICAgIGNvbnN0IHt0YXNrRWwsIGRlbGV0ZUJ1dHRvbkVsfSA9IHRoaXMucmVuZGVyKHRhc2spXG5cbiAgICAgIGxpc3RFbC5hcHBlbmQodGFza0VsKVxuICAgICAgdGFza0xpc3QucHVzaCh7dGFzaywgZGVsZXRlQnV0dG9uRWx9KVxuICAgIH0pXG5cbiAgICByZXR1cm4gdGFza0xpc3RcbiAgfVxuXG4gIHJlbW92ZSh0YXNrOiBUYXNrKSB7XG4gICAgY29uc3QgdGFza0VsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQodGFzay5pZClcbiAgICBpZiAoIXRhc2tFbCkge1xuICAgICAgcmV0dXJuXG4gICAgfVxuICAgIGlmKHRhc2suc3RhdHVzID09PSBzdGF0dXNNYXAudG9kbykge1xuICAgICAgdGhpcy50b2RvTGlzdC5yZW1vdmVDaGlsZCh0YXNrRWwpXG4gICAgfVxuICAgIGlmKHRhc2suc3RhdHVzID09PSBzdGF0dXNNYXAuZG9pbmcpIHtcbiAgICAgIHRoaXMuZG9pbmdMaXN0LnJlbW92ZUNoaWxkKHRhc2tFbClcbiAgICB9XG4gICAgaWYodGFzay5zdGF0dXMgPT09IHN0YXR1c01hcC5kb25lKSB7XG4gICAgICB0aGlzLmRvbmVMaXN0LnJlbW92ZUNoaWxkKHRhc2tFbClcbiAgICB9XG4gIH1cblxuICBzdWJzY3JpYmVEcmFnQW5kRHJvcChvbkRyb3A6IChlbDogRWxlbWVudCwgc2libGluZzogRWxlbWVudCB8IG51bGwsIG5ld1N0YXR1czogU3RhdHVzKSA9PiB2b2lkKSB7XG4gICAgZHJhZ3VsYShbdGhpcy50b2RvTGlzdCwgdGhpcy5kb2luZ0xpc3QsIHRoaXMuZG9uZUxpc3RdKVxuICAgICAgLm9uKCdkcm9wJywgKGVsLCB0YXJnZXQsIF9zb3VyY2UsIHNpYmxpbmcpID0+IHtcbiAgICAgICAgbGV0IG5ld1N0YXR1czogU3RhdHVzID0gc3RhdHVzTWFwLnRvZG9cbiAgICAgICAgaWYgKHRhcmdldC5pZCA9PT0gJ2RvaW5nTGlzdCcpIG5ld1N0YXR1cyA9IHN0YXR1c01hcC5kb2luZ1xuICAgICAgICBpZiAodGFyZ2V0LmlkID09PSAnZG9uZUxpc3QnKSBuZXdTdGF0dXMgPSBzdGF0dXNNYXAuZG9uZVxuXG4gICAgICAgIG9uRHJvcChlbCwgc2libGluZywgbmV3U3RhdHVzKVxuICAgICAgfSlcbiAgfVxuXG4gIGdldElkKGVsOiBFbGVtZW50KSB7XG4gICAgcmV0dXJuIGVsLmlkXG4gIH1cbn1cbiIsImV4cG9ydCBkZWZhdWx0IC9eKD86WzAtOWEtZl17OH0tWzAtOWEtZl17NH0tWzEtNV1bMC05YS1mXXszfS1bODlhYl1bMC05YS1mXXszfS1bMC05YS1mXXsxMn18MDAwMDAwMDAtMDAwMC0wMDAwLTAwMDAtMDAwMDAwMDAwMDAwKSQvaTsiLCIvLyBVbmlxdWUgSUQgY3JlYXRpb24gcmVxdWlyZXMgYSBoaWdoIHF1YWxpdHkgcmFuZG9tICMgZ2VuZXJhdG9yLiBJbiB0aGUgYnJvd3NlciB3ZSB0aGVyZWZvcmVcbi8vIHJlcXVpcmUgdGhlIGNyeXB0byBBUEkgYW5kIGRvIG5vdCBzdXBwb3J0IGJ1aWx0LWluIGZhbGxiYWNrIHRvIGxvd2VyIHF1YWxpdHkgcmFuZG9tIG51bWJlclxuLy8gZ2VuZXJhdG9ycyAobGlrZSBNYXRoLnJhbmRvbSgpKS5cbnZhciBnZXRSYW5kb21WYWx1ZXM7XG52YXIgcm5kczggPSBuZXcgVWludDhBcnJheSgxNik7XG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBybmcoKSB7XG4gIC8vIGxhenkgbG9hZCBzbyB0aGF0IGVudmlyb25tZW50cyB0aGF0IG5lZWQgdG8gcG9seWZpbGwgaGF2ZSBhIGNoYW5jZSB0byBkbyBzb1xuICBpZiAoIWdldFJhbmRvbVZhbHVlcykge1xuICAgIC8vIGdldFJhbmRvbVZhbHVlcyBuZWVkcyB0byBiZSBpbnZva2VkIGluIGEgY29udGV4dCB3aGVyZSBcInRoaXNcIiBpcyBhIENyeXB0byBpbXBsZW1lbnRhdGlvbi4gQWxzbyxcbiAgICAvLyBmaW5kIHRoZSBjb21wbGV0ZSBpbXBsZW1lbnRhdGlvbiBvZiBjcnlwdG8gKG1zQ3J5cHRvKSBvbiBJRTExLlxuICAgIGdldFJhbmRvbVZhbHVlcyA9IHR5cGVvZiBjcnlwdG8gIT09ICd1bmRlZmluZWQnICYmIGNyeXB0by5nZXRSYW5kb21WYWx1ZXMgJiYgY3J5cHRvLmdldFJhbmRvbVZhbHVlcy5iaW5kKGNyeXB0bykgfHwgdHlwZW9mIG1zQ3J5cHRvICE9PSAndW5kZWZpbmVkJyAmJiB0eXBlb2YgbXNDcnlwdG8uZ2V0UmFuZG9tVmFsdWVzID09PSAnZnVuY3Rpb24nICYmIG1zQ3J5cHRvLmdldFJhbmRvbVZhbHVlcy5iaW5kKG1zQ3J5cHRvKTtcblxuICAgIGlmICghZ2V0UmFuZG9tVmFsdWVzKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ2NyeXB0by5nZXRSYW5kb21WYWx1ZXMoKSBub3Qgc3VwcG9ydGVkLiBTZWUgaHR0cHM6Ly9naXRodWIuY29tL3V1aWRqcy91dWlkI2dldHJhbmRvbXZhbHVlcy1ub3Qtc3VwcG9ydGVkJyk7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGdldFJhbmRvbVZhbHVlcyhybmRzOCk7XG59IiwiaW1wb3J0IHZhbGlkYXRlIGZyb20gJy4vdmFsaWRhdGUuanMnO1xuLyoqXG4gKiBDb252ZXJ0IGFycmF5IG9mIDE2IGJ5dGUgdmFsdWVzIHRvIFVVSUQgc3RyaW5nIGZvcm1hdCBvZiB0aGUgZm9ybTpcbiAqIFhYWFhYWFhYLVhYWFgtWFhYWC1YWFhYLVhYWFhYWFhYWFhYWFxuICovXG5cbnZhciBieXRlVG9IZXggPSBbXTtcblxuZm9yICh2YXIgaSA9IDA7IGkgPCAyNTY7ICsraSkge1xuICBieXRlVG9IZXgucHVzaCgoaSArIDB4MTAwKS50b1N0cmluZygxNikuc3Vic3RyKDEpKTtcbn1cblxuZnVuY3Rpb24gc3RyaW5naWZ5KGFycikge1xuICB2YXIgb2Zmc2V0ID0gYXJndW1lbnRzLmxlbmd0aCA+IDEgJiYgYXJndW1lbnRzWzFdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMV0gOiAwO1xuICAvLyBOb3RlOiBCZSBjYXJlZnVsIGVkaXRpbmcgdGhpcyBjb2RlISAgSXQncyBiZWVuIHR1bmVkIGZvciBwZXJmb3JtYW5jZVxuICAvLyBhbmQgd29ya3MgaW4gd2F5cyB5b3UgbWF5IG5vdCBleHBlY3QuIFNlZSBodHRwczovL2dpdGh1Yi5jb20vdXVpZGpzL3V1aWQvcHVsbC80MzRcbiAgdmFyIHV1aWQgPSAoYnl0ZVRvSGV4W2FycltvZmZzZXQgKyAwXV0gKyBieXRlVG9IZXhbYXJyW29mZnNldCArIDFdXSArIGJ5dGVUb0hleFthcnJbb2Zmc2V0ICsgMl1dICsgYnl0ZVRvSGV4W2FycltvZmZzZXQgKyAzXV0gKyAnLScgKyBieXRlVG9IZXhbYXJyW29mZnNldCArIDRdXSArIGJ5dGVUb0hleFthcnJbb2Zmc2V0ICsgNV1dICsgJy0nICsgYnl0ZVRvSGV4W2FycltvZmZzZXQgKyA2XV0gKyBieXRlVG9IZXhbYXJyW29mZnNldCArIDddXSArICctJyArIGJ5dGVUb0hleFthcnJbb2Zmc2V0ICsgOF1dICsgYnl0ZVRvSGV4W2FycltvZmZzZXQgKyA5XV0gKyAnLScgKyBieXRlVG9IZXhbYXJyW29mZnNldCArIDEwXV0gKyBieXRlVG9IZXhbYXJyW29mZnNldCArIDExXV0gKyBieXRlVG9IZXhbYXJyW29mZnNldCArIDEyXV0gKyBieXRlVG9IZXhbYXJyW29mZnNldCArIDEzXV0gKyBieXRlVG9IZXhbYXJyW29mZnNldCArIDE0XV0gKyBieXRlVG9IZXhbYXJyW29mZnNldCArIDE1XV0pLnRvTG93ZXJDYXNlKCk7IC8vIENvbnNpc3RlbmN5IGNoZWNrIGZvciB2YWxpZCBVVUlELiAgSWYgdGhpcyB0aHJvd3MsIGl0J3MgbGlrZWx5IGR1ZSB0byBvbmVcbiAgLy8gb2YgdGhlIGZvbGxvd2luZzpcbiAgLy8gLSBPbmUgb3IgbW9yZSBpbnB1dCBhcnJheSB2YWx1ZXMgZG9uJ3QgbWFwIHRvIGEgaGV4IG9jdGV0IChsZWFkaW5nIHRvXG4gIC8vIFwidW5kZWZpbmVkXCIgaW4gdGhlIHV1aWQpXG4gIC8vIC0gSW52YWxpZCBpbnB1dCB2YWx1ZXMgZm9yIHRoZSBSRkMgYHZlcnNpb25gIG9yIGB2YXJpYW50YCBmaWVsZHNcblxuICBpZiAoIXZhbGlkYXRlKHV1aWQpKSB7XG4gICAgdGhyb3cgVHlwZUVycm9yKCdTdHJpbmdpZmllZCBVVUlEIGlzIGludmFsaWQnKTtcbiAgfVxuXG4gIHJldHVybiB1dWlkO1xufVxuXG5leHBvcnQgZGVmYXVsdCBzdHJpbmdpZnk7IiwiaW1wb3J0IHJuZyBmcm9tICcuL3JuZy5qcyc7XG5pbXBvcnQgc3RyaW5naWZ5IGZyb20gJy4vc3RyaW5naWZ5LmpzJztcblxuZnVuY3Rpb24gdjQob3B0aW9ucywgYnVmLCBvZmZzZXQpIHtcbiAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG4gIHZhciBybmRzID0gb3B0aW9ucy5yYW5kb20gfHwgKG9wdGlvbnMucm5nIHx8IHJuZykoKTsgLy8gUGVyIDQuNCwgc2V0IGJpdHMgZm9yIHZlcnNpb24gYW5kIGBjbG9ja19zZXFfaGlfYW5kX3Jlc2VydmVkYFxuXG4gIHJuZHNbNl0gPSBybmRzWzZdICYgMHgwZiB8IDB4NDA7XG4gIHJuZHNbOF0gPSBybmRzWzhdICYgMHgzZiB8IDB4ODA7IC8vIENvcHkgYnl0ZXMgdG8gYnVmZmVyLCBpZiBwcm92aWRlZFxuXG4gIGlmIChidWYpIHtcbiAgICBvZmZzZXQgPSBvZmZzZXQgfHwgMDtcblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgMTY7ICsraSkge1xuICAgICAgYnVmW29mZnNldCArIGldID0gcm5kc1tpXTtcbiAgICB9XG5cbiAgICByZXR1cm4gYnVmO1xuICB9XG5cbiAgcmV0dXJuIHN0cmluZ2lmeShybmRzKTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgdjQ7IiwiaW1wb3J0IFJFR0VYIGZyb20gJy4vcmVnZXguanMnO1xuXG5mdW5jdGlvbiB2YWxpZGF0ZSh1dWlkKSB7XG4gIHJldHVybiB0eXBlb2YgdXVpZCA9PT0gJ3N0cmluZycgJiYgUkVHRVgudGVzdCh1dWlkKTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgdmFsaWRhdGU7IiwiLy8gVGhlIG1vZHVsZSBjYWNoZVxudmFyIF9fd2VicGFja19tb2R1bGVfY2FjaGVfXyA9IHt9O1xuXG4vLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcblx0dmFyIGNhY2hlZE1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF07XG5cdGlmIChjYWNoZWRNb2R1bGUgIT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybiBjYWNoZWRNb2R1bGUuZXhwb3J0cztcblx0fVxuXHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuXHR2YXIgbW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXSA9IHtcblx0XHQvLyBubyBtb2R1bGUuaWQgbmVlZGVkXG5cdFx0Ly8gbm8gbW9kdWxlLmxvYWRlZCBuZWVkZWRcblx0XHRleHBvcnRzOiB7fVxuXHR9O1xuXG5cdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuXHRfX3dlYnBhY2tfbW9kdWxlc19fW21vZHVsZUlkXShtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuXHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuXHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG59XG5cbiIsIi8vIGdldERlZmF1bHRFeHBvcnQgZnVuY3Rpb24gZm9yIGNvbXBhdGliaWxpdHkgd2l0aCBub24taGFybW9ueSBtb2R1bGVzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLm4gPSAobW9kdWxlKSA9PiB7XG5cdHZhciBnZXR0ZXIgPSBtb2R1bGUgJiYgbW9kdWxlLl9fZXNNb2R1bGUgP1xuXHRcdCgpID0+IChtb2R1bGVbJ2RlZmF1bHQnXSkgOlxuXHRcdCgpID0+IChtb2R1bGUpO1xuXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQoZ2V0dGVyLCB7IGE6IGdldHRlciB9KTtcblx0cmV0dXJuIGdldHRlcjtcbn07IiwiLy8gZGVmaW5lIGdldHRlciBmdW5jdGlvbnMgZm9yIGhhcm1vbnkgZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5kID0gKGV4cG9ydHMsIGRlZmluaXRpb24pID0+IHtcblx0Zm9yKHZhciBrZXkgaW4gZGVmaW5pdGlvbikge1xuXHRcdGlmKF9fd2VicGFja19yZXF1aXJlX18ubyhkZWZpbml0aW9uLCBrZXkpICYmICFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywga2V5KSkge1xuXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIGtleSwgeyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGRlZmluaXRpb25ba2V5XSB9KTtcblx0XHR9XG5cdH1cbn07IiwiX193ZWJwYWNrX3JlcXVpcmVfXy5nID0gKGZ1bmN0aW9uKCkge1xuXHRpZiAodHlwZW9mIGdsb2JhbFRoaXMgPT09ICdvYmplY3QnKSByZXR1cm4gZ2xvYmFsVGhpcztcblx0dHJ5IHtcblx0XHRyZXR1cm4gdGhpcyB8fCBuZXcgRnVuY3Rpb24oJ3JldHVybiB0aGlzJykoKTtcblx0fSBjYXRjaCAoZSkge1xuXHRcdGlmICh0eXBlb2Ygd2luZG93ID09PSAnb2JqZWN0JykgcmV0dXJuIHdpbmRvdztcblx0fVxufSkoKTsiLCJfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSAob2JqLCBwcm9wKSA9PiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwgcHJvcCkpIiwiLy8gZGVmaW5lIF9fZXNNb2R1bGUgb24gZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5yID0gKGV4cG9ydHMpID0+IHtcblx0aWYodHlwZW9mIFN5bWJvbCAhPT0gJ3VuZGVmaW5lZCcgJiYgU3ltYm9sLnRvU3RyaW5nVGFnKSB7XG5cdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFN5bWJvbC50b1N0cmluZ1RhZywgeyB2YWx1ZTogJ01vZHVsZScgfSk7XG5cdH1cblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywgeyB2YWx1ZTogdHJ1ZSB9KTtcbn07IiwiaW1wb3J0IHsgRXZlbnRMaXN0ZW5lciB9IGZyb20gJy4vRXZlbnRMaXN0ZW5lcidcbmltcG9ydCB7IFN0YXR1cywgVGFzaywgc3RhdHVzTWFwIH0gZnJvbSAnLi9UYXNrJ1xuaW1wb3J0IHsgVGFza0NvbGxlY3Rpb24gfSBmcm9tICcuL1Rhc2tDb2xsZWN0aW9uJ1xuaW1wb3J0IHsgVGFza1JlbmRlcmVyIH0gZnJvbSAnLi9UYXNrUmVuZGVyZXInXG5cbmNsYXNzIEFwcGxpY2F0aW9uIHtcblxuICBwcml2YXRlIHJlYWRvbmx5IGV2ZW50TGlzdGVuZXIgPSBuZXcgRXZlbnRMaXN0ZW5lcigpXG4gIHByaXZhdGUgcmVhZG9ubHkgdGFza0NvbGxlY3Rpb24gPSBuZXcgVGFza0NvbGxlY3Rpb24oKVxuICBwcml2YXRlIHJlYWRvbmx5IHRhc2tSZW5kZXJlciA9IG5ldyBUYXNrUmVuZGVyZXIoXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3RvZG9MaXN0JykgYXMgSFRNTEVsZW1lbnQsXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2RvaW5nTGlzdCcpIGFzIEhUTUxFbGVtZW50LFxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdkb25lTGlzdCcpIGFzIEhUTUxFbGVtZW50XG4gIClcbiAgcHJpdmF0ZSBleGVjdXRlRGVsZXRlVGFzayA9ICh0YXNrOiBUYXNrKSA9PiB7XG4gICAgdGhpcy5ldmVudExpc3RlbmVyLnJlbW92ZSh0YXNrLmlkKVxuICAgIHRoaXMudGFza0NvbGxlY3Rpb24uZGVsZXRlKHRhc2spXG4gICAgdGhpcy50YXNrUmVuZGVyZXIucmVtb3ZlKHRhc2spXG4gIH1cblxuICBzdGFydCgpIHtcbiAgICBjb25zdCB0YXNrSXRlbXMgPSB0aGlzLnRhc2tSZW5kZXJlci5yZW5kZXJBbGwodGhpcy50YXNrQ29sbGVjdGlvbilcbiAgICBjb25zdCBjcmVhdGVGb3JtID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NyZWF0ZUZvcm0nKSBhcyBIVE1MRm9ybUVsZW1lbnRcbiAgICBjb25zdCBkZWxldGVBbGxEb25lVGFza0J1dHRvbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdkZWxldGVBbGxEb25lVGFzaycpIGFzIEhUTUxCdXR0b25FbGVtZW50XG5cbiAgICB0YXNrSXRlbXMuZm9yRWFjaCgoeyB0YXNrLCBkZWxldGVCdXR0b25FbCB9KSA9PiB7XG4gICAgICB0aGlzLmV2ZW50TGlzdGVuZXIuYWRkKHRhc2suaWQsICdjbGljaycsIGRlbGV0ZUJ1dHRvbkVsLFxuICAgICAgICAoKSA9PiB0aGlzLmhhbmRsZUNsaWNrRGVsZXRlVGFzayh0YXNrKSlcbiAgICB9KVxuXG4gICAgdGhpcy5ldmVudExpc3RlbmVyLmFkZCgnc3VibWl0LWhhbmRsZXInLCAnc3VibWl0JywgY3JlYXRlRm9ybSwgdGhpcy5oYW5kbGVTdWJtaXQpXG4gICAgdGhpcy5ldmVudExpc3RlbmVyLmFkZCgnY2xpY2staGFuZGxlcicsICdjbGljaycsIGRlbGV0ZUFsbERvbmVUYXNrQnV0dG9uLCB0aGlzLmhhbmRsZUNsaWNrRGVsZXRlZEFsbERvbmVUYXNrcylcblxuICAgIHRoaXMudGFza1JlbmRlcmVyLnN1YnNjcmliZURyYWdBbmREcm9wKHRoaXMuaGFuZGxlRHJvcEFuZERyb3ApXG4gIH1cblxuICBwcml2YXRlIGhhbmRsZVN1Ym1pdCA9IChlOiBFdmVudCkgPT4ge1xuICAgIGUucHJldmVudERlZmF1bHQoKVxuICAgIGNvbnN0IHRpdGxlSW5wdXQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndGl0bGUnKSBhcyBIVE1MSW5wdXRFbGVtZW50XG4gICAgaWYoIXRpdGxlSW5wdXQudmFsdWUpIHtcbiAgICAgIHJldHVyblxuICAgIH1cbiAgICBjb25zdCB0YXNrID0gbmV3IFRhc2soeyB0aXRsZTogdGl0bGVJbnB1dC52YWx1ZSB9KVxuICAgIHRoaXMudGFza0NvbGxlY3Rpb24uYWRkKHRhc2spXG5cbiAgICBjb25zdCB7IGRlbGV0ZUJ1dHRvbkVsIH0gPSB0aGlzLnRhc2tSZW5kZXJlci5hcHBlbmQodGFzaylcbiAgICB0aGlzLmV2ZW50TGlzdGVuZXIuYWRkKFxuICAgICAgdGFzay5pZCxcbiAgICAgICdjbGljaycsXG4gICAgICBkZWxldGVCdXR0b25FbCxcbiAgICAgICgpID0+IHRoaXMuaGFuZGxlQ2xpY2tEZWxldGVUYXNrKHRhc2spLFxuICAgIClcbiAgICB0aXRsZUlucHV0LnZhbHVlID0gJydcbiAgfVxuXG4gIHByaXZhdGUgaGFuZGxlQ2xpY2tEZWxldGVUYXNrID0gKHRhc2s6IFRhc2spID0+IHtcbiAgICBpZighd2luZG93LmNvbmZpcm0oYOOAjCR7dGFzay50aXRsZX3jgI3jgpLliYrpmaTjgZfjgb7jgZnjgYvvvJ9gKSkge1xuICAgICAgcmV0dXJuXG4gICAgfVxuICAgIHRoaXMuZXhlY3V0ZURlbGV0ZVRhc2sodGFzaylcbiAgfVxuXG4gIHByaXZhdGUgaGFuZGxlRHJvcEFuZERyb3AgPSAoZWw6IEVsZW1lbnQsIHNpYmxpbmc6IEVsZW1lbnQgfCBudWxsLCBuZXdTdGF0dXM6IFN0YXR1cykgPT4ge1xuICAgIGNvbnN0IHRhc2tJZCA9IHRoaXMudGFza1JlbmRlcmVyLmdldElkKGVsKVxuICAgIGlmICghdGFza0lkKSB7XG4gICAgICByZXR1cm5cbiAgICB9XG4gICAgY29uc3QgdGFzayA9IHRoaXMudGFza0NvbGxlY3Rpb24uZmluZCh0YXNrSWQpXG4gICAgaWYgKCF0YXNrKSB7XG4gICAgICByZXR1cm5cbiAgICB9XG4gICAgdGFzay51cGRhdGUoeyBzdGF0dXM6IG5ld1N0YXR1cyB9KVxuICAgIHRoaXMudGFza0NvbGxlY3Rpb24udXBkYXRlKHRhc2spXG4gICAgY29uc29sZS5sb2coc2libGluZylcbiAgfVxuXG4gIHByaXZhdGUgaGFuZGxlQ2xpY2tEZWxldGVkQWxsRG9uZVRhc2tzID0gKCkgPT4ge1xuICAgIGlmKCF3aW5kb3cuY29uZmlybSgnRE9ORSDjga7jgr/jgrnjgq/jgpLjgZnjgbnjgabliYrpmaTjgZfjgb7jgZnjgYvvvJ8nKSkge1xuICAgICAgcmV0dXJuXG4gICAgfVxuICAgIGNvbnN0IGRvbmVUYXNrcyA9IHRoaXMudGFza0NvbGxlY3Rpb24uZmlsdGVyKHN0YXR1c01hcC5kb25lKVxuICAgIGRvbmVUYXNrcy5mb3JFYWNoKCh0YXNrKSA9PiB0aGlzLmV4ZWN1dGVEZWxldGVUYXNrKHRhc2spKVxuICB9XG59XG5cbndpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdsb2FkJywgKCkgPT4ge1xuICBjb25zdCBhcHAgPSBuZXcgQXBwbGljYXRpb24oKTtcbiAgYXBwLnN0YXJ0KCk7XG59KVxuXG4iXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=