function __extends(e,t){function o(){this.constructor=e}extendStatics(e,t),e.prototype=null===t?Object.create(t):(o.prototype=t.prototype,new o)}var extendStatics=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(e,t){e.__proto__=t}||function(e,t){for(var o in t)t.hasOwnProperty(o)&&(e[o]=t[o])},__assign=Object.assign||function(e){for(var t,o=1,n=arguments.length;o<n;o++){t=arguments[o];for(var s in t)Object.prototype.hasOwnProperty.call(t,s)&&(e[s]=t[s])}return e},SELECTION_EVENT="selection",Selection=function(){function e(e){this.elements=new Set(e)}return Object.defineProperty(e.prototype,"size",{get:function(){return this.elements.size},enumerable:!0,configurable:!0}),e.prototype.values=function(){return this.elements.values()},e.prototype.add=function(e){var t=this.elements.has(e);return this.elements.add(e),t||this.notify(e,!0),this},e.prototype.delete=function(e){return this.elements.delete(e)&&!this.notify(e,!1)},e.prototype.has=function(e){return this.elements.has(e)},e.prototype.clear=function(){var e=this;this.elements.forEach(function(t){return e.delete(t)})},e.prototype.toggle=function(e,t){return void 0===t?!this.delete(e)&&!!this.add(e):(t?this.add(e):this.delete(e),t)},e.prototype.intersect=function(e){var t=this;return this.elements.forEach(function(o){return!e.has(o)&&t.delete(o)}),this},e.prototype.notify=function(e,t){e.dispatchEvent(new CustomEvent(SELECTION_EVENT,{bubbles:!0,detail:{selected:t}}))},e}(),matches=Element.prototype.matches||Element.prototype.msMatchesSelector,defaults$1={tick:".selekter-tick"},MouseSelector=function(){function e(e){var t=this;this.options=e,this.onClick=function(e){var o=e.target.closest(t.area.options.selectable);if(o){var n=t.area.getSelection();(n.size||matches.call(e.target,t.options.tick))&&(n.toggle(o),e.stopPropagation())}},this.options=__assign({},defaults$1,e)}return e.prototype.connect=function(e){var t=this;return this.area=e,this.area.root.addEventListener("click",this.onClick,!0),function(){return t.area.root.removeEventListener("click",t.onClick)}},e}(),Rect=function(){function e(e,t,o,n){void 0===e&&(e=0),void 0===t&&(t=0),void 0===o&&(o=0),void 0===n&&(n=0),this.left=e,this.top=t,this.width=o,this.height=n}return e.from=function(t){return new e(t.left,t.top,t.width,t.height)},e.prototype.intersects=function(e){return this.left<=e.left+e.width&&e.left<=this.left+this.width&&this.top<=e.top+e.height&&e.top<=this.top+this.height},e}(),defaults$2={lassoClass:"selekter-lasso",threshold:10,boundary:function(e){return e.getBoundingClientRect()}},RectSelector=function(e){function t(t){var o=e.call(this)||this;return o.options=t,o.onMouseDown=function(e){0===e.button&&e.target===o.area.root&&(o.origin=o.offset({top:e.clientY,left:e.clientX},o.relativeTo(o.area.root)),o.preservedSelection=e.ctrlKey||e.metaKey?new Set(o.area.getSelection().values()):null,document.addEventListener("mousemove",o.onMouseMove),document.addEventListener("mouseup",o.onMouseUp),e.preventDefault())},o.onMouseMove=function(e){e.preventDefault();var t=o.offset({top:e.clientY,left:e.clientX},o.relativeTo(o.area.root));o.top=Math.min(o.origin.top,t.top),o.left=Math.min(o.origin.left,t.left),o.width=Math.abs(o.origin.left-t.left),o.height=Math.abs(o.origin.top-t.top),o.setVisible(o.lasso,o.doesEdgePassThreshold())&&(o.lasso||(o.lasso=(o.options.appendTo||o.area.root).appendChild(o.createLassoElement())),o.requestRender()),o.update()},o.onMouseUp=function(e){o.cancelRender(),o.update(),o.width=o.height=0,o.setVisible(o.lasso,!1),document.removeEventListener("mousemove",o.onMouseMove),document.removeEventListener("mouseup",o.onMouseUp)},o.update=function(){var e=o.relativeTo(o.area.root),t=o.area.getSelection();o.area.getSelectables().forEach(function(n){return t.toggle(n,o.preservedSelection&&o.preservedSelection.has(n)||o.doesEdgePassThreshold()&&o.intersects(o.boundary(n,e)))})},o.render=function(){var e=o.lasso.style;e.top=o.top+"px",e.left=o.left+"px",e.width=o.width+"px",e.height=o.height+"px",o.pendingRenderID=0},o.destroy=function(){o.cancelRender(),o.lasso&&(o.lasso.parentElement.removeChild(o.lasso),o.lasso=null),document.removeEventListener("mousedown",o.onMouseDown)},o.options=__assign({},defaults$2,t),o}return __extends(t,e),t.prototype.connect=function(e){return this.area=e,document.addEventListener("mousedown",this.onMouseDown),this.destroy},t.prototype.boundary=function(e,t){return this.offset(Rect.from(this.options.boundary(e)),t)},t.prototype.requestRender=function(){this.pendingRenderID||(this.pendingRenderID=requestAnimationFrame(this.render))},t.prototype.cancelRender=function(){this.pendingRenderID&&(cancelAnimationFrame(this.pendingRenderID),this.pendingRenderID=0)},t.prototype.setVisible=function(e,t){return e&&(e.style.display=t?"":"none"),t},t.prototype.doesEdgePassThreshold=function(){return this.width>=this.options.threshold||this.height>=this.options.threshold},t.prototype.relativeTo=function(e){var t=e.getBoundingClientRect();return{top:e.scrollTop-t.top,left:e.scrollLeft-t.left}},t.prototype.offset=function(e,t){return e.top+=t.top,e.left+=t.left,e},t.prototype.createLassoElement=function(){var e=document.createElement("div");return e.className=this.options.lassoClass,e},t}(Rect),createDefaultSelectors=function(){return[new MouseSelector,new RectSelector]},defaults={selectable:".selekter-selectable",selectionClass:"selekter-selection",selectedClass:"selekter-selected"},Area=function(){function e(e,t,o){void 0===o&&(o=createDefaultSelectors());var n=this;this.root=e,this.options=t,this.selection=new Selection,this.rootDirty=!0,this.onSelection=function(e){n.root.classList.toggle(n.options.selectionClass,n.selection.size>0),e.target.classList.toggle(n.options.selectedClass,e.detail.selected)},this.options=__assign({},defaults,t),this.selectorDestroyers=this.lastUniqueByConstructor(o).map(function(e){return e.connect(n)}),MutationObserver&&(this.observer=new MutationObserver(function(){return n.rootDirty=!0}),this.observer.observe(e,{childList:!0,subtree:!0})),e.addEventListener(SELECTION_EVENT,this.onSelection)}return e.prototype.getSelection=function(){return this.rootDirty&&(this.selection.intersect(this.getSelectables()),this.rootDirty=!this.observer),this.selection},e.prototype.setSelection=function(e){this.selection.intersect(e),this.selection=e},e.prototype.getSelectables=function(){return this.rootDirty&&(this.selectables=new Set(Array.prototype.slice.call(this.root.querySelectorAll(this.options.selectable)).slice()),this.rootDirty=!this.observer),this.selectables},e.prototype.destroy=function(){this.observer&&this.observer.disconnect(),this.selectorDestroyers.forEach(function(e){return e()}),this.root.removeEventListener(SELECTION_EVENT,this.onSelection)},e.prototype.lastUniqueByConstructor=function(e){return e.reduceRight(function(e,t){return!e.some(function(e){return e.constructor===t.constructor})&&e.push(t),e},[])},e}();export{createDefaultSelectors,Area,MouseSelector,Rect,RectSelector,SELECTION_EVENT,Selection};
