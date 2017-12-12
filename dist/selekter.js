!function(e,t){"object"==typeof exports&&"undefined"!=typeof module?t(exports):"function"==typeof define&&define.amd?define(["exports"],t):t(e.selekter={})}(this,function(e){"use strict";class t{constructor(e){this.elements=new Set(e)}get size(){return this.elements.size}values(){return this.elements.values()}add(e){let t=this.elements.has(e);return this.elements.add(e),t||this.notify(e,!0),this}delete(e){return this.elements.delete(e)&&!this.notify(e,!1)}has(e){return this.elements.has(e)}clear(){this.elements.forEach(e=>this.delete(e))}toggle(e,t){return void 0===t?!this.delete(e)&&!!this.add(e):(t?this.add(e):this.delete(e),t)}intersect(e){return this.elements.forEach(t=>!e.has(t)&&this.delete(t)),this}notify(e,t){e.dispatchEvent(new CustomEvent("selection",{bubbles:!0,detail:{selected:t}}))}}const s=Element.prototype.matches||Element.prototype.msMatchesSelector,i={tick:".selekter-tick"};class o{constructor(e){this.options=e,this.onClick=(e=>{let t=e.target.closest(this.area.options.selectable);if(t){let i=this.area.getSelection();(i.size>0||s.call(e.target,this.options.tick))&&i.toggle(t)}}),this.options=Object.assign({},i,e)}connect(e){return this.area=e,this.area.root.addEventListener("click",this.onClick),()=>this.area.root.removeEventListener("click",this.onClick)}}class n{constructor(e=0,t=0,s=0,i=0){this.left=e,this.top=t,this.width=s,this.height=i}static from(e){return new n(e.left,e.top,e.width,e.height)}intersects(e){return this.left<=e.left+e.width&&e.left<=this.left+this.width&&this.top<=e.top+e.height&&e.top<=this.top+this.height}}const r={lassoClass:"selekter-lasso",threshold:10,appendTo:document.body,boundary:e=>e.getBoundingClientRect()};class h extends n{constructor(e){super(),this.options=e,this.onMouseDown=(e=>{0===e.button&&e.target===this.area.root&&(this.origin=this.offset({left:e.clientX,top:e.clientY},this.area.root),this.preservedSelection=e.ctrlKey||e.metaKey?new Set(this.area.getSelection().values()):null,document.addEventListener("mousemove",this.onMouseMove),document.addEventListener("mouseup",this.onMouseUp),e.preventDefault())}),this.onMouseMove=(e=>{e.preventDefault();let t=this.offset({left:e.clientX,top:e.clientY},this.area.root);this.top=Math.min(this.origin.top,t.top),this.left=Math.min(this.origin.left,t.left),this.width=Math.abs(this.origin.left-t.left),this.height=Math.abs(this.origin.top-t.top),this.setVisible(this.lasso,this.doesEdgePassThreshold())&&(this.lasso||(this.lasso=this.options.appendTo.appendChild(this.createLassoElement())),this.requestRender()),this.update()}),this.onMouseUp=(e=>{this.cancelRender(),this.update(),this.width=this.height=0,this.setVisible(this.lasso,!1),document.removeEventListener("mousemove",this.onMouseMove),document.removeEventListener("mouseup",this.onMouseUp)}),this.update=(()=>{let e=this.area.getSelection();this.area.getSelectables().forEach(t=>e.toggle(t,this.preservedSelection&&this.preservedSelection.has(t)||this.doesEdgePassThreshold()&&this.intersects(this.boundary(t))))}),this.render=(()=>{let e=this.lasso.style;e.left=this.left+"px",e.top=this.top+"px",e.width=this.width+"px",e.height=this.height+"px",this.pendingRenderID=0}),this.options=Object.assign({},r,e)}connect(e){return this.area=e,document.addEventListener("mousedown",this.onMouseDown),()=>document.removeEventListener("mousedown",this.onMouseDown)}boundary(e){return this.offset(n.from(this.options.boundary(e)),this.area.root)}requestRender(){this.pendingRenderID||(this.pendingRenderID=requestAnimationFrame(this.render))}cancelRender(){this.pendingRenderID&&(cancelAnimationFrame(this.pendingRenderID),this.pendingRenderID=0)}setVisible(e,t){return e&&(e.style.display=t?"":"none"),t}doesEdgePassThreshold(){return this.width>=this.options.threshold||this.height>=this.options.threshold}offset(e,t){return e.top+=t.scrollTop-t.offsetTop+(pageYOffset||document.documentElement.scrollTop),e.left+=t.scrollLeft-t.offsetLeft+(pageXOffset||document.documentElement.scrollLeft),e}createLassoElement(){let e=document.createElement("div");return e.className=this.options.lassoClass,e}}const l=[new o,new h],c={selectable:".selekter-selectable",selectionClass:"selekter-selection",selectedClass:"selekter-selected"};class a{constructor(e,s,i=l){this.root=e,this.options=s,this.selection=new t,this.rootDirty=!0,this.onSelection=(e=>{this.root.classList.toggle(this.options.selectionClass,this.selection.size>0),e.target.classList.toggle(this.options.selectedClass,e.detail.selected)}),this.options=Object.assign({},c,s),this.selectorDestroyers=this.lastUniqueByConstructor(i).map(e=>e.connect(this)),MutationObserver&&(this.observer=new MutationObserver(()=>this.rootDirty=!0),this.observer.observe(e,{childList:!0,subtree:!0})),e.addEventListener("selection",this.onSelection)}getSelection(){return this.rootDirty&&(this.selection.intersect(this.getSelectables()),this.rootDirty=!this.observer),this.selection}getSelectables(){return this.rootDirty&&(this.selectables=new Set([...this.root.querySelectorAll(this.options.selectable)]),this.rootDirty=!this.observer),this.selectables}destroy(){this.observer&&this.observer.disconnect(),this.selectorDestroyers.forEach(e=>e()),this.root.removeEventListener("selection",this.onSelection)}lastUniqueByConstructor(e){return e.reduceRight((e,t)=>(!e.some(e=>e.constructor===t.constructor)&&e.push(t),e),[])}}e.defaultSelectors=l,e.Area=a,e.MouseSelector=o,e.Rect=n,e.RectSelector=h,e.SELECTION_EVENT="selection",e.Selection=t,Object.defineProperty(e,"__esModule",{value:!0})});
