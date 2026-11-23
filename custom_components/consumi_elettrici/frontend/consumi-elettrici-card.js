var ie=Object.defineProperty;var oe=Object.getOwnPropertyDescriptor;var g=(o,t,e,s)=>{for(var i=s>1?void 0:s?oe(t,e):t,n=o.length-1,r;n>=0;n--)(r=o[n])&&(i=(s?r(t,e,i):r(i))||i);return s&&i&&ie(t,e,i),i};var Q=globalThis,tt=Q.ShadowRoot&&(Q.ShadyCSS===void 0||Q.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,dt=Symbol(),Et=new WeakMap,D=class{constructor(t,e,s){if(this._$cssResult$=!0,s!==dt)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=t,this.t=e}get styleSheet(){let t=this.o,e=this.t;if(tt&&t===void 0){let s=e!==void 0&&e.length===1;s&&(t=Et.get(e)),t===void 0&&((this.o=t=new CSSStyleSheet).replaceSync(this.cssText),s&&Et.set(e,t))}return t}toString(){return this.cssText}},Ct=o=>new D(typeof o=="string"?o:o+"",void 0,dt),E=(o,...t)=>{let e=o.length===1?o[0]:t.reduce((s,i,n)=>s+(r=>{if(r._$cssResult$===!0)return r.cssText;if(typeof r=="number")return r;throw Error("Value passed to 'css' function must be a 'css' function result: "+r+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(i)+o[n+1],o[0]);return new D(e,o,dt)},Mt=(o,t)=>{if(tt)o.adoptedStyleSheets=t.map(e=>e instanceof CSSStyleSheet?e:e.styleSheet);else for(let e of t){let s=document.createElement("style"),i=Q.litNonce;i!==void 0&&s.setAttribute("nonce",i),s.textContent=e.cssText,o.appendChild(s)}},pt=tt?o=>o:o=>o instanceof CSSStyleSheet?(t=>{let e="";for(let s of t.cssRules)e+=s.cssText;return Ct(e)})(o):o;var{is:ne,defineProperty:re,getOwnPropertyDescriptor:ae,getOwnPropertyNames:le,getOwnPropertySymbols:ce,getPrototypeOf:de}=Object,et=globalThis,Pt=et.trustedTypes,pe=Pt?Pt.emptyScript:"",he=et.reactiveElementPolyfillSupport,q=(o,t)=>o,W={toAttribute(o,t){switch(t){case Boolean:o=o?pe:null;break;case Object:case Array:o=o==null?o:JSON.stringify(o)}return o},fromAttribute(o,t){let e=o;switch(t){case Boolean:e=o!==null;break;case Number:e=o===null?null:Number(o);break;case Object:case Array:try{e=JSON.parse(o)}catch{e=null}}return e}},st=(o,t)=>!ne(o,t),Rt={attribute:!0,type:String,converter:W,reflect:!1,useDefault:!1,hasChanged:st};Symbol.metadata??=Symbol("metadata"),et.litPropertyMetadata??=new WeakMap;var C=class extends HTMLElement{static addInitializer(t){this._$Ei(),(this.l??=[]).push(t)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(t,e=Rt){if(e.state&&(e.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(t)&&((e=Object.create(e)).wrapped=!0),this.elementProperties.set(t,e),!e.noAccessor){let s=Symbol(),i=this.getPropertyDescriptor(t,s,e);i!==void 0&&re(this.prototype,t,i)}}static getPropertyDescriptor(t,e,s){let{get:i,set:n}=ae(this.prototype,t)??{get(){return this[e]},set(r){this[e]=r}};return{get:i,set(r){let a=i?.call(this);n?.call(this,r),this.requestUpdate(t,a,s)},configurable:!0,enumerable:!0}}static getPropertyOptions(t){return this.elementProperties.get(t)??Rt}static _$Ei(){if(this.hasOwnProperty(q("elementProperties")))return;let t=de(this);t.finalize(),t.l!==void 0&&(this.l=[...t.l]),this.elementProperties=new Map(t.elementProperties)}static finalize(){if(this.hasOwnProperty(q("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(q("properties"))){let e=this.properties,s=[...le(e),...ce(e)];for(let i of s)this.createProperty(i,e[i])}let t=this[Symbol.metadata];if(t!==null){let e=litPropertyMetadata.get(t);if(e!==void 0)for(let[s,i]of e)this.elementProperties.set(s,i)}this._$Eh=new Map;for(let[e,s]of this.elementProperties){let i=this._$Eu(e,s);i!==void 0&&this._$Eh.set(i,e)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(t){let e=[];if(Array.isArray(t)){let s=new Set(t.flat(1/0).reverse());for(let i of s)e.unshift(pt(i))}else t!==void 0&&e.push(pt(t));return e}static _$Eu(t,e){let s=e.attribute;return s===!1?void 0:typeof s=="string"?s:typeof t=="string"?t.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(t=>this.enableUpdating=t),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(t=>t(this))}addController(t){(this._$EO??=new Set).add(t),this.renderRoot!==void 0&&this.isConnected&&t.hostConnected?.()}removeController(t){this._$EO?.delete(t)}_$E_(){let t=new Map,e=this.constructor.elementProperties;for(let s of e.keys())this.hasOwnProperty(s)&&(t.set(s,this[s]),delete this[s]);t.size>0&&(this._$Ep=t)}createRenderRoot(){let t=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return Mt(t,this.constructor.elementStyles),t}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(t=>t.hostConnected?.())}enableUpdating(t){}disconnectedCallback(){this._$EO?.forEach(t=>t.hostDisconnected?.())}attributeChangedCallback(t,e,s){this._$AK(t,s)}_$ET(t,e){let s=this.constructor.elementProperties.get(t),i=this.constructor._$Eu(t,s);if(i!==void 0&&s.reflect===!0){let n=(s.converter?.toAttribute!==void 0?s.converter:W).toAttribute(e,s.type);this._$Em=t,n==null?this.removeAttribute(i):this.setAttribute(i,n),this._$Em=null}}_$AK(t,e){let s=this.constructor,i=s._$Eh.get(t);if(i!==void 0&&this._$Em!==i){let n=s.getPropertyOptions(i),r=typeof n.converter=="function"?{fromAttribute:n.converter}:n.converter?.fromAttribute!==void 0?n.converter:W;this._$Em=i;let a=r.fromAttribute(e,n.type);this[i]=a??this._$Ej?.get(i)??a,this._$Em=null}}requestUpdate(t,e,s,i=!1,n){if(t!==void 0){let r=this.constructor;if(i===!1&&(n=this[t]),s??=r.getPropertyOptions(t),!((s.hasChanged??st)(n,e)||s.useDefault&&s.reflect&&n===this._$Ej?.get(t)&&!this.hasAttribute(r._$Eu(t,s))))return;this.C(t,e,s)}this.isUpdatePending===!1&&(this._$ES=this._$EP())}C(t,e,{useDefault:s,reflect:i,wrapped:n},r){s&&!(this._$Ej??=new Map).has(t)&&(this._$Ej.set(t,r??e??this[t]),n!==!0||r!==void 0)||(this._$AL.has(t)||(this.hasUpdated||s||(e=void 0),this._$AL.set(t,e)),i===!0&&this._$Em!==t&&(this._$Eq??=new Set).add(t))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(e){Promise.reject(e)}let t=this.scheduleUpdate();return t!=null&&await t,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(let[i,n]of this._$Ep)this[i]=n;this._$Ep=void 0}let s=this.constructor.elementProperties;if(s.size>0)for(let[i,n]of s){let{wrapped:r}=n,a=this[i];r!==!0||this._$AL.has(i)||a===void 0||this.C(i,void 0,n,a)}}let t=!1,e=this._$AL;try{t=this.shouldUpdate(e),t?(this.willUpdate(e),this._$EO?.forEach(s=>s.hostUpdate?.()),this.update(e)):this._$EM()}catch(s){throw t=!1,this._$EM(),s}t&&this._$AE(e)}willUpdate(t){}_$AE(t){this._$EO?.forEach(e=>e.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(t)),this.updated(t)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(t){return!0}update(t){this._$Eq&&=this._$Eq.forEach(e=>this._$ET(e,this[e])),this._$EM()}updated(t){}firstUpdated(t){}};C.elementStyles=[],C.shadowRootOptions={mode:"open"},C[q("elementProperties")]=new Map,C[q("finalized")]=new Map,he?.({ReactiveElement:C}),(et.reactiveElementVersions??=[]).push("2.1.2");var _t=globalThis,Tt=o=>o,it=_t.trustedTypes,zt=it?it.createPolicy("lit-html",{createHTML:o=>o}):void 0,Lt="$lit$",M=`lit$${Math.random().toFixed(9).slice(2)}$`,Ft="?"+M,ue=`<${Ft}>`,z=document,V=()=>z.createComment(""),K=o=>o===null||typeof o!="object"&&typeof o!="function",xt=Array.isArray,me=o=>xt(o)||typeof o?.[Symbol.iterator]=="function",ht=`[ 	
\f\r]`,B=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,Ot=/-->/g,Nt=/>/g,R=RegExp(`>|${ht}(?:([^\\s"'>=/]+)(${ht}*=${ht}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`,"g"),Ut=/'/g,Ht=/"/g,jt=/^(?:script|style|textarea|title)$/i,vt=o=>(t,...e)=>({_$litType$:o,strings:t,values:e}),p=vt(1),Ie=vt(2),Le=vt(3),O=Symbol.for("lit-noChange"),h=Symbol.for("lit-nothing"),It=new WeakMap,T=z.createTreeWalker(z,129);function Dt(o,t){if(!xt(o)||!o.hasOwnProperty("raw"))throw Error("invalid template strings array");return zt!==void 0?zt.createHTML(t):t}var fe=(o,t)=>{let e=o.length-1,s=[],i,n=t===2?"<svg>":t===3?"<math>":"",r=B;for(let a=0;a<e;a++){let l=o[a],d,f,u=-1,b=0;for(;b<l.length&&(r.lastIndex=b,f=r.exec(l),f!==null);)b=r.lastIndex,r===B?f[1]==="!--"?r=Ot:f[1]!==void 0?r=Nt:f[2]!==void 0?(jt.test(f[2])&&(i=RegExp("</"+f[2],"g")),r=R):f[3]!==void 0&&(r=R):r===R?f[0]===">"?(r=i??B,u=-1):f[1]===void 0?u=-2:(u=r.lastIndex-f[2].length,d=f[1],r=f[3]===void 0?R:f[3]==='"'?Ht:Ut):r===Ht||r===Ut?r=R:r===Ot||r===Nt?r=B:(r=R,i=void 0);let m=r===R&&o[a+1].startsWith("/>")?" ":"";n+=r===B?l+ue:u>=0?(s.push(d),l.slice(0,u)+Lt+l.slice(u)+M+m):l+M+(u===-2?a:m)}return[Dt(o,n+(o[e]||"<?>")+(t===2?"</svg>":t===3?"</math>":"")),s]},G=class o{constructor({strings:t,_$litType$:e},s){let i;this.parts=[];let n=0,r=0,a=t.length-1,l=this.parts,[d,f]=fe(t,e);if(this.el=o.createElement(d,s),T.currentNode=this.el.content,e===2||e===3){let u=this.el.content.firstChild;u.replaceWith(...u.childNodes)}for(;(i=T.nextNode())!==null&&l.length<a;){if(i.nodeType===1){if(i.hasAttributes())for(let u of i.getAttributeNames())if(u.endsWith(Lt)){let b=f[r++],m=i.getAttribute(u).split(M),c=/([.?@])?(.*)/.exec(b);l.push({type:1,index:n,name:c[2],strings:m,ctor:c[1]==="."?mt:c[1]==="?"?ft:c[1]==="@"?gt:I}),i.removeAttribute(u)}else u.startsWith(M)&&(l.push({type:6,index:n}),i.removeAttribute(u));if(jt.test(i.tagName)){let u=i.textContent.split(M),b=u.length-1;if(b>0){i.textContent=it?it.emptyScript:"";for(let m=0;m<b;m++)i.append(u[m],V()),T.nextNode(),l.push({type:2,index:++n});i.append(u[b],V())}}}else if(i.nodeType===8)if(i.data===Ft)l.push({type:2,index:n});else{let u=-1;for(;(u=i.data.indexOf(M,u+1))!==-1;)l.push({type:7,index:n}),u+=M.length-1}n++}}static createElement(t,e){let s=z.createElement("template");return s.innerHTML=t,s}};function H(o,t,e=o,s){if(t===O)return t;let i=s!==void 0?e._$Co?.[s]:e._$Cl,n=K(t)?void 0:t._$litDirective$;return i?.constructor!==n&&(i?._$AO?.(!1),n===void 0?i=void 0:(i=new n(o),i._$AT(o,e,s)),s!==void 0?(e._$Co??=[])[s]=i:e._$Cl=i),i!==void 0&&(t=H(o,i._$AS(o,t.values),i,s)),t}var ut=class{constructor(t,e){this._$AV=[],this._$AN=void 0,this._$AD=t,this._$AM=e}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(t){let{el:{content:e},parts:s}=this._$AD,i=(t?.creationScope??z).importNode(e,!0);T.currentNode=i;let n=T.nextNode(),r=0,a=0,l=s[0];for(;l!==void 0;){if(r===l.index){let d;l.type===2?d=new Y(n,n.nextSibling,this,t):l.type===1?d=new l.ctor(n,l.name,l.strings,this,t):l.type===6&&(d=new bt(n,this,t)),this._$AV.push(d),l=s[++a]}r!==l?.index&&(n=T.nextNode(),r++)}return T.currentNode=z,i}p(t){let e=0;for(let s of this._$AV)s!==void 0&&(s.strings!==void 0?(s._$AI(t,s,e),e+=s.strings.length-2):s._$AI(t[e])),e++}},Y=class o{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(t,e,s,i){this.type=2,this._$AH=h,this._$AN=void 0,this._$AA=t,this._$AB=e,this._$AM=s,this.options=i,this._$Cv=i?.isConnected??!0}get parentNode(){let t=this._$AA.parentNode,e=this._$AM;return e!==void 0&&t?.nodeType===11&&(t=e.parentNode),t}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(t,e=this){t=H(this,t,e),K(t)?t===h||t==null||t===""?(this._$AH!==h&&this._$AR(),this._$AH=h):t!==this._$AH&&t!==O&&this._(t):t._$litType$!==void 0?this.$(t):t.nodeType!==void 0?this.T(t):me(t)?this.k(t):this._(t)}O(t){return this._$AA.parentNode.insertBefore(t,this._$AB)}T(t){this._$AH!==t&&(this._$AR(),this._$AH=this.O(t))}_(t){this._$AH!==h&&K(this._$AH)?this._$AA.nextSibling.data=t:this.T(z.createTextNode(t)),this._$AH=t}$(t){let{values:e,_$litType$:s}=t,i=typeof s=="number"?this._$AC(t):(s.el===void 0&&(s.el=G.createElement(Dt(s.h,s.h[0]),this.options)),s);if(this._$AH?._$AD===i)this._$AH.p(e);else{let n=new ut(i,this),r=n.u(this.options);n.p(e),this.T(r),this._$AH=n}}_$AC(t){let e=It.get(t.strings);return e===void 0&&It.set(t.strings,e=new G(t)),e}k(t){xt(this._$AH)||(this._$AH=[],this._$AR());let e=this._$AH,s,i=0;for(let n of t)i===e.length?e.push(s=new o(this.O(V()),this.O(V()),this,this.options)):s=e[i],s._$AI(n),i++;i<e.length&&(this._$AR(s&&s._$AB.nextSibling,i),e.length=i)}_$AR(t=this._$AA.nextSibling,e){for(this._$AP?.(!1,!0,e);t!==this._$AB;){let s=Tt(t).nextSibling;Tt(t).remove(),t=s}}setConnected(t){this._$AM===void 0&&(this._$Cv=t,this._$AP?.(t))}},I=class{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(t,e,s,i,n){this.type=1,this._$AH=h,this._$AN=void 0,this.element=t,this.name=e,this._$AM=i,this.options=n,s.length>2||s[0]!==""||s[1]!==""?(this._$AH=Array(s.length-1).fill(new String),this.strings=s):this._$AH=h}_$AI(t,e=this,s,i){let n=this.strings,r=!1;if(n===void 0)t=H(this,t,e,0),r=!K(t)||t!==this._$AH&&t!==O,r&&(this._$AH=t);else{let a=t,l,d;for(t=n[0],l=0;l<n.length-1;l++)d=H(this,a[s+l],e,l),d===O&&(d=this._$AH[l]),r||=!K(d)||d!==this._$AH[l],d===h?t=h:t!==h&&(t+=(d??"")+n[l+1]),this._$AH[l]=d}r&&!i&&this.j(t)}j(t){t===h?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,t??"")}},mt=class extends I{constructor(){super(...arguments),this.type=3}j(t){this.element[this.name]=t===h?void 0:t}},ft=class extends I{constructor(){super(...arguments),this.type=4}j(t){this.element.toggleAttribute(this.name,!!t&&t!==h)}},gt=class extends I{constructor(t,e,s,i,n){super(t,e,s,i,n),this.type=5}_$AI(t,e=this){if((t=H(this,t,e,0)??h)===O)return;let s=this._$AH,i=t===h&&s!==h||t.capture!==s.capture||t.once!==s.once||t.passive!==s.passive,n=t!==h&&(s===h||i);i&&this.element.removeEventListener(this.name,this,s),n&&this.element.addEventListener(this.name,this,t),this._$AH=t}handleEvent(t){typeof this._$AH=="function"?this._$AH.call(this.options?.host??this.element,t):this._$AH.handleEvent(t)}},bt=class{constructor(t,e,s){this.element=t,this.type=6,this._$AN=void 0,this._$AM=e,this.options=s}get _$AU(){return this._$AM._$AU}_$AI(t){H(this,t)}};var ge=_t.litHtmlPolyfillSupport;ge?.(G,Y),(_t.litHtmlVersions??=[]).push("3.3.3");var qt=(o,t,e)=>{let s=e?.renderBefore??t,i=s._$litPart$;if(i===void 0){let n=e?.renderBefore??null;s._$litPart$=i=new Y(t.insertBefore(V(),n),n,void 0,e??{})}return i._$AI(o),i};var yt=globalThis,y=class extends C{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){let t=super.createRenderRoot();return this.renderOptions.renderBefore??=t.firstChild,t}update(t){let e=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(t),this._$Do=qt(e,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return O}};y._$litElement$=!0,y.finalized=!0,yt.litElementHydrateSupport?.({LitElement:y});var be=yt.litElementPolyfillSupport;be?.({LitElement:y});(yt.litElementVersions??=[]).push("4.2.2");var _e={attribute:!0,type:String,converter:W,reflect:!1,hasChanged:st},xe=(o=_e,t,e)=>{let{kind:s,metadata:i}=e,n=globalThis.litPropertyMetadata.get(i);if(n===void 0&&globalThis.litPropertyMetadata.set(i,n=new Map),s==="setter"&&((o=Object.create(o)).wrapped=!0),n.set(e.name,o),s==="accessor"){let{name:r}=e;return{set(a){let l=t.get.call(this);t.set.call(this,a),this.requestUpdate(r,l,o,!0,a)},init(a){return a!==void 0&&this.C(r,void 0,o,a),a}}}if(s==="setter"){let{name:r}=e;return function(a){let l=this[r];t.call(this,a),this.requestUpdate(r,l,o,!0,a)}}throw Error("Unsupported decorator location: "+s)};function _(o){return(t,e)=>typeof e=="object"?xe(o,t,e):((s,i,n)=>{let r=i.hasOwnProperty(n);return i.constructor.createProperty(n,s),r?Object.getOwnPropertyDescriptor(i,n):void 0})(o,t,e)}function x(o){return _({...o,state:!0,attribute:!1})}var w="_meter",N="_unmonitored",L=[{id:"now",label:"Adesso"},{id:"today",label:"Oggi"},{id:"week",label:"Settimana"},{id:"month",label:"Mese"},{id:"year",label:"Anno"}],J={today:{period:"yesterday",label:"Ieri"},week:{period:"last_week",label:"Settimana scorsa"},month:{period:"last_month",label:"Mese scorso"},year:{period:"last_year",label:"Anno scorso"}};function A(o,t=1){if(o==null||!Number.isFinite(o))return"\u2013";let[e,s]=o.toFixed(t).split("."),i=e.replace(/\B(?=(\d{3})+(?!\d))/g,".");return s?`${i},${s}`:i}function F(o){return o==null||!Number.isFinite(o)?"\u2013":Math.abs(o)>=1e3?`${A(o/1e3,2)} kW`:`${Math.round(o)} W`}function v(o){return o==null||!Number.isFinite(o)?"\u2013":`${A(o,o<10?2:o<100?1:0)} kWh`}function $(o){return o==null||!Number.isFinite(o)?"\u2013":`${A(o,2)} \u20AC`}function $t(o){if(o===null||!Number.isFinite(o))return"";let t=o*100;return t>0&&t<1?"<1%":`${Math.round(t)}%`}function Vt(o){return`${A(o,o<.1?4:3).replace(/0$/,"")} \u20AC/kWh`}var ve=["dom","lun","mar","mer","gio","ven","sab"],Wt=["gen","feb","mar","apr","mag","giu","lug","ago","set","ott","nov","dic"],Kt=["gennaio","febbraio","marzo","aprile","maggio","giugno","luglio","agosto","settembre","ottobre","novembre","dicembre"];function nt(o,t=!1){let[e,s,i]=o.split("-").map(Number);if(!i)return t?`${Kt[s-1]} ${e}`:Wt[s-1];if(!t)return`${i}`;let n=new Date(Date.UTC(e,s-1,i)).getUTCDay();return`${ve[n]} ${i} ${Wt[s-1]}`}function X(o,t=0){let e=new Date(o),s=(((Number.isNaN(e.getTime())?0:e.getMonth())+t)%12+12)%12;return Kt[s]}var ye=["#2a78d6","#eb6834","#1baf7a","#eda100","#e87ba4","#008300","#6250d6","#e34948"],$e=["#3987e5","#d95926","#199e70","#c98500","#d55181","#0ca30c","#9085e9","#e66767"],we="#8a8a86",ke="#8d8d88",Ae="#c9c8c2",Se="#55554f";function wt(o,t){let e=t?$e:ye;return o>=0&&o<e.length?e[o]:t?ke:we}function rt(o,t){let e=parseInt(o.slice(1),16);return`rgba(${e>>16&255}, ${e>>8&255}, ${e&255}, ${t})`}var Ee=1e5;function Bt(o){if(!o)return null;let t=Number(o.state);if(o.state===""||!Number.isFinite(t))return null;let e=String(o.attributes.unit_of_measurement??"W").toLowerCase(),s=e==="kw"?t*1e3:e==="mw"?t*1e6:t;return Math.abs(s)<=Ee?s:null}function at(o,t){return o.consumers.filter(e=>e.parent===t).map(e=>e.key)}function kt(o,t){let e=o.meter.power_entities.map(a=>Bt(t[a])).filter(a=>a!==null),s=e.length?e.reduce((a,l)=>a+l,0):o.meter.power,i={},n=0;for(let a of o.consumers){let l=a.power_entity?Bt(t[a.power_entity]):null,d=a.power_entity?l??(t[a.power_entity]?null:a.power):null;i[a.key]=d,d!==null&&a.parent===w&&(n+=d)}let r={};for(let a of o.consumers){let l=at(o,a.key);if(!l.length)continue;let d=i[a.key];r[a.key]=d===null?null:Math.max(d-l.reduce((f,u)=>f+(i[u]??0),0),0)}return{meter:s,unmonitored:s===null?null:Math.max(s-n,0),consumers:i,rest:r}}function At(o,t,e,s,i={},n=!1){let r=t==="now",a=r?e.meter:o.meter.periods[t].k,l=r?null:o.meter.periods[t].c,d=o.consumers.map((c,U)=>{let j=at(o,c.key).length>0,ct=r?j?e.rest[c.key]:e.consumers[c.key]:j&&c.rest?c.rest.periods[t].k:c.periods[t].k,se=r?null:j&&c.rest?c.rest.periods[t].c:c.periods[t].c;return{key:c.key,name:j?`${c.name} \xB7 resto`:c.name,icon:c.icon||"mdi:power-plug",color:wt(U,s),value:ct,cost:se,share:c.in_meter&&ct!==null&&a?Math.min(ct/a,1):null,bar:0,kind:"consumer",outside:!c.in_meter,rest:j}}),f=r?e.unmonitored:o.unmonitored.periods[t].k;o.consumers.some(c=>c.in_meter)&&d.push({key:N,name:"Non monitorato",icon:"mdi:help-circle-outline",color:s?Se:Ae,value:f,cost:r?null:o.unmonitored.periods[t].c,share:f!==null&&a?Math.min(f/a,1):null,bar:0,kind:"unmonitored",outside:!1,rest:!1}),d.sort((c,U)=>(U.value??-1)-(c.value??-1)||c.name.localeCompare(U.name));let u=Math.max(0,...d.map(c=>c.value??0));for(let c of d)c.bar=u>0&&c.value?Math.max(c.value/u,0):0;let b=d;r&&i.hide_idle&&!n&&(b=d.filter(c=>c.kind==="unmonitored"||(c.value??0)>=1));let m=!n&&i.max_rows&&i.max_rows>0?i.max_rows:b.length;return{total:a,totalCost:l,rows:b.slice(0,m),hidden:Math.max(b.length-m,0)+(d.length-b.length)}}function Gt(o){let t=o.filter(s=>!s.outside&&(s.value??0)>0),e=t.reduce((s,i)=>s+(i.value??0),0);return e<=0?[]:t.map(s=>({key:s.key,name:s.name,color:s.color,pct:(s.value??0)/e*100,hatched:s.kind==="unmonitored"})).filter(s=>s.pct>=1)}function Yt(o,t,e,s){if(o===null||!(t>0))return null;let i=t*1e3,n=Math.max(e*1e3,i),r=n,a=s>=2||o>n?"critical":s>=1||o>i?"warning":"ok",l=a==="critical"?`Oltre la potenza disponibile (${A(e,1)} kW)`:a==="warning"?`Oltre il contratto di ${A(t,1)} kW`:`${Math.round(o/i*100)}% di ${A(t,1)} kW`;return{pct:Math.min(Math.max(o/r*100,0),100),mark:i/r*100,level:a,text:l}}function Jt(o){return o==="year"?{granularity:"month",count:12}:o==="month"?{granularity:"day",count:30}:{granularity:"day",count:14}}function Xt(o){if(!(o>0))return 1;let t=Math.pow(10,Math.floor(Math.log10(o))),e=o/t;return([1,2,3,4,5,6,8,10].find(i=>e<=i+1e-9)??10)*t}function St(o){return A(o,o>=10||Number.isInteger(o)?0:o>=1?1:2)}function Zt(o,t=5){if(o<=t)return Array.from({length:o},(s,i)=>i);let e=[];for(let s=0;s<t;s++)e.push(Math.round(s*(o-1)/(t-1)));return[...new Set(e)]}function Qt(o,t,e,s){return Math.ceil(((s?56:0)+150+o*56+(t?190:0)+(e?70:0))/50)}var P=class extends y{constructor(){super(...arguments);this.labels=[];this.values=[];this.costs=[];this.color="#2a78d6";this._selected=null}willUpdate(e){e.has("labels")&&(this._selected=null)}render(){let e=this.labels.length;if(!e)return p`<div class="empty">Nessun dato</div>`;let s=this._selected!==null&&this._selected<e?this._selected:e-1,i=Xt(Math.max(...this.values,0)),n=new Set(Zt(e,e>14?6:5));return p`
      <div class="readout">
        <span class="when">${nt(this.labels[s],!0)}</span>
        <span class="val">${v(this.values[s]??0)}</span>
        <span class="cost">${$(this.costs[s]??0)}</span>
      </div>
      <div class="plot" role="group" aria-label="Consumo per periodo, in kWh">
        <div class="grid" aria-hidden="true">
          <span class="line" style="bottom:100%"><i>${St(i)}</i></span>
          <span class="line" style="bottom:50%"><i>${St(i/2)}</i></span>
          <span class="line base" style="bottom:0"></span>
        </div>
        <div class="cols">
          ${this.labels.map((r,a)=>{let l=this.values[a]??0,d=l>0?Math.max(l/i*100,1.5):0;return p`<button
              class="col ${a===s?"on":""}"
              aria-label="${nt(r,!0)}: ${v(l)}, ${$(this.costs[a]??0)}"
              aria-pressed=${a===s}
              @click=${()=>this._selected=a}
              @pointerenter=${f=>f.pointerType==="mouse"&&(this._selected=a)}
            >
              <span class="bar" style="height:${d}%;background:${this.color}"></span>
            </button>`})}
        </div>
      </div>
      <div class="axis" aria-hidden="true">${this.labels.map((r,a)=>p`<span class="tick">${n.has(a)?p`<i>${nt(r)}</i>`:h}</span>`)}</div>
    `}static{this.styles=E`
    :host { display: block; }
    .empty { color: var(--secondary-text-color, #727272); font-size: 13px; padding: 16px 0; text-align: center; }
    .readout { display: flex; align-items: baseline; gap: 10px; font-size: 13px; color: var(--secondary-text-color, #727272); margin-bottom: 10px; flex-wrap: wrap; }
    .readout .val { color: var(--primary-text-color, #212121); font-weight: 600; font-size: 15px; font-variant-numeric: tabular-nums; }
    .readout .cost { font-variant-numeric: tabular-nums; }
    .plot { position: relative; height: 120px; margin-left: 30px; }
    .grid { position: absolute; inset: 0; pointer-events: none; }
    .line { position: absolute; left: 0; right: 0; height: 1px; background: var(--divider-color, #e0e0e0); opacity: 0.7; }
    .line.base { opacity: 1; }
    .line i { position: absolute; right: 100%; margin-right: 6px; top: -7px; font-style: normal; font-size: 11px; line-height: 14px; color: var(--secondary-text-color, #727272); font-variant-numeric: tabular-nums; white-space: nowrap; }
    .cols { position: absolute; inset: 0; display: flex; align-items: stretch; }
    .col { flex: 1 1 0; min-width: 0; padding: 0 1px; margin: 0; border: 0; background: transparent; display: flex; align-items: flex-end; justify-content: center; cursor: pointer; -webkit-tap-highlight-color: transparent; }
    .col:focus-visible { outline: 2px solid var(--primary-color, #03a9f4); outline-offset: -2px; border-radius: 4px; }
    .bar { display: block; width: 100%; max-width: 24px; border-radius: 4px 4px 0 0; opacity: 0.45; transition: opacity 0.15s; }
    .col.on .bar { opacity: 1; }
    .axis { display: flex; margin: 4px 0 0 30px; height: 16px; }
    .tick { flex: 1 1 0; min-width: 0; position: relative; }
    .tick i { position: absolute; left: 50%; transform: translateX(-50%); font-style: normal; font-size: 11px; line-height: 16px; color: var(--secondary-text-color, #727272); white-space: nowrap; font-variant-numeric: tabular-nums; }
    @media (prefers-reduced-motion: reduce) { .bar { transition: none; } }
  `}};g([_({attribute:!1})],P.prototype,"labels",2),g([_({attribute:!1})],P.prototype,"values",2),g([_({attribute:!1})],P.prototype,"costs",2),g([_()],P.prototype,"color",2),g([x()],P.prototype,"_selected",2);customElements.get("consumi-bars")||customElements.define("consumi-bars",P);var Ce=["title","header","default_tab","max_rows","hide_idle","show_chart","show_bands","show_bill","color"],Me={title:"Titolo",header:"Mostra titolo, fascia e prezzo",default_tab:"Scheda aperta all'inizio",max_rows:"Consumatori visibili (0 = tutti)",hide_idle:"In \xABAdesso\xBB nascondi i consumatori fermi",show_chart:"Mostra il grafico",show_bands:"Mostra i kWh per fascia",show_bill:"Mostra la bolletta stimata",color:"Colore della scheda"},Pe={max_rows:"Gli altri si vedono con \xABMostra tutti\xBB.",show_bill:"Compare solo se la stima \xE8 attiva nelle opzioni dell'integrazione.",color:"Tinge lo sfondo e il bordo della scheda, come un blocco colorato della plancia. Nessuno lascia l'aspetto del tema."},Z=class extends y{constructor(){super(...arguments);this._config={type:"custom:consumi-elettrici-card"}}setConfig(e){this._config={...e}}_schema(){return[{name:"title",selector:{text:{}}},{name:"header",selector:{boolean:{}}},{name:"default_tab",selector:{select:{mode:"dropdown",options:L.map(e=>({value:e.id,label:e.label}))}}},{name:"max_rows",selector:{number:{min:0,max:30,step:1,mode:"box"}}},{name:"hide_idle",selector:{boolean:{}}},{name:"show_chart",selector:{boolean:{}}},{name:"show_bands",selector:{boolean:{}}},{name:"show_bill",selector:{boolean:{}}},{name:"color",selector:{ui_color:{include_none:!0}}}]}_onForm(e){e.stopPropagation();let s=e.detail.value,i={...this._config};for(let r of Ce)delete i[r];typeof s.title=="string"&&s.title.trim()&&(i.title=s.title.trim()),s.header===!1&&(i.header=!1),typeof s.default_tab=="string"&&s.default_tab!=="now"&&L.some(r=>r.id===s.default_tab)&&(i.default_tab=s.default_tab);let n=Math.round(Number(s.max_rows));Number.isFinite(n)&&n>0&&(i.max_rows=Math.min(n,30)),s.hide_idle===!0&&(i.hide_idle=!0),s.show_chart===!1&&(i.show_chart=!1),s.show_bands===!1&&(i.show_bands=!1),s.show_bill===!1&&(i.show_bill=!1),typeof s.color=="string"&&s.color.trim()&&s.color!=="none"&&(i.color=s.color.trim()),this._config=i,this.dispatchEvent(new CustomEvent("config-changed",{detail:{config:i},bubbles:!0,composed:!0}))}render(){if(!this.hass)return h;let e=this._config,s={title:e.title??"",header:e.header!==!1,default_tab:e.default_tab??"now",max_rows:e.max_rows??0,hide_idle:e.hide_idle===!0,show_chart:e.show_chart!==!1,show_bands:e.show_bands!==!1,show_bill:e.show_bill!==!1,color:typeof e.color=="string"&&e.color!=="none"?e.color:""};return p`
      <ha-form
        .hass=${this.hass}
        .data=${s}
        .schema=${this._schema()}
        .computeLabel=${i=>Me[i.name]??i.name}
        .computeHelper=${i=>Pe[i.name]??""}
        @value-changed=${i=>this._onForm(i)}
      ></ha-form>
      <p class="hint">
        Contatore, tariffa, bolletta, avvisi e l'elenco dei consumatori si gestiscono in
        <a href="/config/integrations/integration/consumi_elettrici">Impostazioni → Dispositivi e servizi → Consumi elettrici</a>: valgono per tutte le schede.
      </p>
    `}static{this.styles=E`
    :host { display: block; }
    .hint { font-size: 13px; line-height: 1.4; color: var(--secondary-text-color, #727272); margin: 16px 0 0; }
    a { color: var(--primary-color, #03a9f4); }
  `}};g([_({attribute:!1})],Z.prototype,"hass",2),g([x()],Z.prototype,"_config",2);customElements.get("consumi-elettrici-card-editor")||customElements.define("consumi-elettrici-card-editor",Z);var te={red:"#f44336",pink:"#e91e63",purple:"#926bc7","deep-purple":"#6e41ab",indigo:"#3f51b5",blue:"#2196f3","light-blue":"#03a9f4",cyan:"#00bcd4",teal:"#009688",green:"#4caf50","light-green":"#8bc34a",lime:"#cddc39",yellow:"#ffeb3b",amber:"#ffc107",orange:"#ff9800","deep-orange":"#ff6f22",brown:"#795548","light-grey":"#bdbdbd",grey:"#9e9e9e","dark-grey":"#606060","blue-grey":"#607d8b",black:"#000000",white:"#ffffff"};function ee(o){if(typeof o!="string")return;let t=o.trim().toLowerCase();if(!(!t||t==="none"||t==="default")){if(t==="primary"||t==="accent")return`var(--${t}-color)`;if(te[t])return`var(--${t}-color, ${te[t]})`;if(/^#([0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/.test(t)||/^(rgb|hsl)a?\([0-9\s.,%/]+\)$/.test(t))return t}}var k=class extends y{constructor(){super(...arguments);this.target=w;this.color="#2a78d6";this.power=null;this._granularity="day";this._stats=null;this._billPeriod="month";this._loadedFor="";this._onKey=e=>{e.key==="Escape"&&this._close()}}connectedCallback(){super.connectedCallback(),window.addEventListener("keydown",this._onKey)}disconnectedCallback(){super.disconnectedCallback(),window.removeEventListener("keydown",this._onKey)}_close(){this.dispatchEvent(new CustomEvent("closed")),this.remove()}updated(){this.target!=="bill"&&this.hass&&this._loadedFor!==this._granularity&&this._load()}async _load(){let e=this._granularity;this._loadedFor=e;try{this._stats=await this.hass.callWS({type:"consumi_elettrici/stats",entry_id:this.info.entry_id,granularity:e,count:e==="day"?30:12})}catch{this._stats=null}}_source(){let e=this.info;if(this.target===w)return{data:e.meter,name:"Tutta la casa",icon:"mdi:home-lightning-bolt-outline",entity:e.meter.power_entities[0]??e.meter.energy_entities[0]??null};if(this.target===N)return{data:e.unmonitored,name:"Non monitorato",icon:"mdi:help-circle-outline",entity:null};let s=e.consumers.find(i=>i.key===this.target)??e.consumers[0];return{data:s,name:s.name,icon:s.icon,entity:s.power_entity??s.energy_entity}}_renderSource(){let{data:e,name:s,icon:i,entity:n}=this._source(),r=["today","week","month","year"],a={today:"Oggi",week:"Settimana",month:"Mese",year:"Anno"},l=this._stats?.series[this.target],d=this.target===w?this.info.meter.bands.month:void 0,f=d?d.reduce((m,c)=>m+c,0):0,u=this.info.consumers.find(m=>m.key===this.target),b=u?this.info.consumers.filter(m=>at(this.info,u.key).includes(m.key)):[];return p`
      <div class="head">
        <span class="shape" style="background:${rt(this.color,.2)};color:${this.color}"><ha-icon .icon=${i}></ha-icon></span>
        <div class="title">${s}</div>
        <button class="x" aria-label="Chiudi" @click=${()=>this._close()}>✕</button>
      </div>
      <div class="body">
        ${this.power!==null?p`<div class="now"><span class="big">${F(this.power)}</span><span class="sub">adesso</span></div>`:h}
        ${this.target===N?p`<p class="note">È quello che il contatore misura e nessun consumatore spiega: luci, prese senza sensore, apparecchi in attesa. Per ridurlo aggiungi altri consumatori.</p>`:h}
        <div class="tiles">
          ${r.map(m=>p`<div class="tile">
              <div class="label">${a[m]}</div>
              <div class="value">${v(e.periods[m].k)}</div>
              <div class="cost">${$(e.periods[m].c)}</div>
              <div class="prev">${J[m].label}: ${v(e.periods[J[m].period].k)}</div>
            </div>`)}
        </div>
        ${d&&f>0?p`<div class="sec">Fasce del mese</div>
              <div class="bands">
                ${d.map((m,c)=>p`<div class="band"><span class="label">F${c+1}</span><span class="value">${v(m)}</span><span class="prev">${Math.round(m/f*100)}%</span></div>`)}
              </div>`:h}
        ${u&&b.length?p`<div class="sec">Dentro questa linea, questo mese</div>
              <div class="table">
                ${b.map(m=>p`<div class="line"><span>${m.name}</span><span>${v(m.periods.month.k)}</span></div>`)}
                <div class="line"><span>Resto della linea</span><span>${v(u.rest?.periods.month.k)}</span></div>
              </div>`:h}
        ${this.target===w&&this.info.peak.w?p`<div class="line"><span>Picco di oggi</span><span>${F(this.info.peak.w)}${this.info.peak.at?` alle ${this.info.peak.at}`:""}</span></div>`:h}
        <div class="sec row">
          <span>Andamento</span>
          <span class="seg" role="group" aria-label="Intervallo del grafico">
            <button class=${this._granularity==="day"?"on":""} aria-pressed=${this._granularity==="day"} @click=${()=>this._granularity="day"}>30 giorni</button>
            <button class=${this._granularity==="month"?"on":""} aria-pressed=${this._granularity==="month"} @click=${()=>this._granularity="month"}>12 mesi</button>
          </span>
        </div>
        ${l&&this._stats?p`<consumi-bars .labels=${this._stats.labels} .values=${l.k} .costs=${l.c} .color=${this.color}></consumi-bars>`:p`<div class="note">Carico…</div>`}
        ${n&&this.moreInfo?p`<div class="foot"><button class="btn" @click=${()=>{this.moreInfo?.(n),this._close()}}>Apri il sensore</button></div>`:h}
      </div>
    `}_renderBill(){let e=this.info.bill,s=[{id:"month",label:X(this.info.now)},{id:"last_month",label:X(this.info.now,-1)},{id:"year",label:"Anno"}],i=e[this._billPeriod],n=i?[["Energia",i.energia],["Trasporto e contatore",i.trasporto],["Oneri di sistema",i.oneri],["Accise",i.accise],...i.altro?[["Altre partite",i.altro]]:[],["IVA",i.iva]]:[];return p`
      <div class="head">
        <span class="shape neutral"><ha-icon icon="mdi:receipt-text-outline"></ha-icon></span>
        <div class="title">Bolletta stimata</div>
        <button class="x" aria-label="Chiudi" @click=${()=>this._close()}>✕</button>
      </div>
      <div class="body">
        <span class="seg wide" role="group" aria-label="Periodo">
          ${s.map(r=>p`<button class=${this._billPeriod===r.id?"on":""} aria-pressed=${this._billPeriod===r.id} @click=${()=>this._billPeriod=r.id}>${r.label.charAt(0).toUpperCase()+r.label.slice(1)}</button>`)}
        </span>
        ${i?p`<div class="now"><span class="big">${$(i.totale)}</span><span class="sub">${v(i.kwh)}</span></div>
              <div class="table">
                ${n.map(([r,a])=>p`<div class="line"><span>${r}</span><span>${$(a)}</span></div>`)}
                <div class="line total"><span>Totale</span><span>${$(i.totale)}</span></div>
              </div>`:h}
        ${this._billPeriod==="month"&&e.forecast?p`<p class="note">A questo ritmo il mese chiude a circa <b>${$(e.forecast.totale)}</b> (${A(e.forecast.kwh,0)} kWh).</p>`:h}
        <p class="note">Stima fatta con le voci inserite nelle opzioni dell'integrazione: le quote fisse contano per un mese intero${this._billPeriod==="year"?" per ogni mese iniziato":""}.</p>
      </div>
    `}render(){return this.info?p`<div class="backdrop" @click=${e=>e.target===e.currentTarget&&this._close()}>
      <div class="panel" role="dialog" aria-modal="true">${this.target==="bill"?this._renderBill():this._renderSource()}</div>
    </div>`:h}static{this.styles=E`
    :host { position: fixed; inset: 0; z-index: 10000; color: var(--primary-text-color, #212121); font-family: var(--paper-font-body1_-_font-family, Roboto, Helvetica, Arial, sans-serif); }
    .backdrop { position: absolute; inset: 0; background: rgba(0, 0, 0, 0.55); display: flex; align-items: center; justify-content: center; padding: 12px; box-sizing: border-box; }
    .panel { background: var(--card-background-color, #fff); border-radius: 16px; width: 100%; max-width: 520px; max-height: min(90vh, 780px); display: flex; flex-direction: column; overflow: hidden; box-shadow: 0 12px 40px rgba(0, 0, 0, 0.4); }
    .head { display: flex; align-items: center; gap: 12px; padding: 12px 12px 12px 16px; border-bottom: 1px solid var(--divider-color, #e0e0e0); }
    .title { flex: 1; min-width: 0; font-size: 17px; font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .shape { width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex: none; --mdc-icon-size: 22px; }
    .shape.neutral { background: rgba(127, 127, 127, 0.18); color: var(--primary-text-color, #212121); }
    .x { border: 0; background: transparent; color: inherit; font-size: 18px; cursor: pointer; width: 44px; height: 44px; border-radius: 50%; flex: none; }
    .x:active { background: var(--secondary-background-color, #f0f0f0); }
    .body { overflow: auto; padding: 14px 16px 18px; -webkit-overflow-scrolling: touch; }
    .now { display: flex; align-items: baseline; gap: 8px; margin: 2px 0 12px; }
    .big { font-size: 30px; font-weight: 600; font-variant-numeric: tabular-nums; letter-spacing: -0.01em; }
    .sub { font-size: 13px; color: var(--secondary-text-color, #727272); }
    .tiles { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; }
    .tile, .band { background: var(--secondary-background-color, #f5f5f5); border-radius: 12px; padding: 10px 12px; min-width: 0; }
    .label { font-size: 12px; color: var(--secondary-text-color, #727272); }
    .value { font-size: 17px; font-weight: 600; font-variant-numeric: tabular-nums; margin-top: 2px; }
    .cost { font-size: 13px; font-variant-numeric: tabular-nums; }
    .prev { font-size: 11.5px; color: var(--secondary-text-color, #727272); margin-top: 4px; font-variant-numeric: tabular-nums; }
    .bands { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px; }
    .band { display: flex; flex-direction: column; }
    .band .value { font-size: 14px; }
    .band .prev { margin-top: 0; }
    .sec { font-size: 12px; font-weight: 600; letter-spacing: 0.05em; text-transform: uppercase; color: var(--secondary-text-color, #727272); margin: 18px 0 8px; }
    .sec.row { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
    .seg { display: inline-flex; background: var(--secondary-background-color, #f0f0f0); border-radius: 10px; padding: 3px; text-transform: none; letter-spacing: 0; }
    .seg.wide { display: flex; margin-bottom: 12px; }
    .seg button { flex: 1; border: 0; background: transparent; color: var(--secondary-text-color, #727272); font: inherit; font-size: 13px; font-weight: 500; padding: 8px 12px; min-height: 36px; border-radius: 8px; cursor: pointer; white-space: nowrap; }
    .seg button.on { background: var(--card-background-color, #fff); color: var(--primary-text-color, #212121); box-shadow: 0 1px 3px rgba(0, 0, 0, 0.18); }
    .line { display: flex; justify-content: space-between; gap: 12px; padding: 9px 0; font-size: 14px; border-bottom: 1px solid var(--divider-color, #e0e0e0); font-variant-numeric: tabular-nums; }
    .line.total { font-weight: 600; border-bottom: 0; }
    .table { margin-top: 4px; }
    .note { font-size: 13px; line-height: 1.4; color: var(--secondary-text-color, #727272); margin: 10px 0 0; }
    .foot { display: flex; justify-content: flex-end; margin-top: 14px; }
    .btn { border: 0; background: var(--secondary-background-color, #f0f0f0); color: var(--primary-text-color, #212121); font: inherit; font-size: 14px; font-weight: 500; padding: 0 16px; min-height: 44px; border-radius: 12px; cursor: pointer; }
    @media (max-width: 420px) { .big { font-size: 26px; } }
  `}};g([_({attribute:!1})],k.prototype,"hass",2),g([_({attribute:!1})],k.prototype,"info",2),g([_()],k.prototype,"target",2),g([_()],k.prototype,"color",2),g([_({attribute:!1})],k.prototype,"power",2),g([_({attribute:!1})],k.prototype,"moreInfo",2),g([x()],k.prototype,"_granularity",2),g([x()],k.prototype,"_stats",2),g([x()],k.prototype,"_billPeriod",2);customElements.get("consumi-detail-dialog")||customElements.define("consumi-detail-dialog",k);var Re=3e4,Te=5*6e4,S=class extends y{constructor(){super(...arguments);this._config={type:"custom:consumi-elettrici-card"};this._info=null;this._stats=null;this._error="";this._tab="now";this._expanded=!1;this._infoAt=0;this._statsAt=0;this._statsFor="";this._loading=!1;this._loadingStats=!1}setConfig(e){this._config={...e},this._tab=e.default_tab&&L.some(i=>i.id===e.default_tab)?e.default_tab:"now",this._info=null,this._infoAt=0;let s=ee(e.color);this.toggleAttribute("tinted",s!==void 0),s!==void 0?this.style.setProperty("--ce-tint",s):this.style.removeProperty("--ce-tint")}getCardSize(){let e=this._config.max_rows&&this._config.max_rows>0?this._config.max_rows:(this._info?.consumers.length??4)+1;return Qt(e,this._config.show_chart!==!1,this._config.show_bill!==!1&&!!this._info?.bill.enabled,this._config.header!==!1)}getGridOptions(){return{columns:12,rows:"auto",min_columns:6,min_rows:3}}static getStubConfig(){return{type:"custom:consumi-elettrici-card"}}static getConfigElement(){return document.createElement("consumi-elettrici-card-editor")}connectedCallback(){super.connectedCallback(),this._timer=window.setInterval(()=>this.requestUpdate(),1e4)}disconnectedCallback(){super.disconnectedCallback(),this._timer&&window.clearInterval(this._timer)}updated(){if(!this.hass)return;let e=Date.now();if(!this._loading&&e-this._infoAt>Re&&this._loadInfo(),this._info&&this._tab!=="now"&&this._config.show_chart!==!1){let s=Jt(this._tab),i=`${s.granularity}:${s.count}`;!this._loadingStats&&(this._statsFor!==i||e-this._statsAt>Te)&&this._loadStats(i,s)}this._dialog?.isConnected&&this._info&&(this._dialog.hass=this.hass,this._dialog.info=this._info,this._dialog.power=this._powerOf(this._dialog.target))}_message(e){return e instanceof Error?e.message:e?.message??String(e)}async _loadInfo(){this._loading=!0;try{let e={type:"consumi_elettrici/info"};this._config.entry_id&&(e.entry_id=this._config.entry_id),this._info=await this.hass.callWS(e),this._error=""}catch(e){this._error=`Consumi elettrici non \xE8 configurato o l'integrazione non \xE8 caricata (${this._message(e)}).`}finally{this._infoAt=Date.now(),this._loading=!1}}async _loadStats(e,s){this._loadingStats=!0;try{this._stats=await this.hass.callWS({type:"consumi_elettrici/stats",entry_id:this._info?.entry_id,...s})}catch{this._stats=null}finally{this._statsFor=e,this._statsAt=Date.now(),this._loadingStats=!1}}get _dark(){return!!this.hass?.themes?.darkMode}_powerOf(e){if(!this._info||e==="bill")return null;let s=kt(this._info,this.hass.states);return e===w?s.meter:e===N?s.unmonitored:s.consumers[e]??null}_colorOf(e){let s=this._info?.consumers.findIndex(i=>i.key===e)??-1;return e===w?this._dark?"#3987e5":"#2a78d6":e===N?this._dark?"#8d8d88":"#8a8a86":wt(s,this._dark)}_open(e){if(!this._info)return;this._dialog?.remove();let s=document.createElement("consumi-detail-dialog");s.hass=this.hass,s.info=this._info,s.target=e,s.color=this._colorOf(e),s.power=this._powerOf(e),s.moreInfo=i=>this.dispatchEvent(new CustomEvent("hass-more-info",{detail:{entityId:i},bubbles:!0,composed:!0})),s.addEventListener("closed",()=>this._dialog=void 0),document.body.appendChild(s),this._dialog=s}_setTab(e){this._tab=e,this._expanded=!1}_row(e,s){let i=s&&(e.value??0)<1,n=s?e.value===null?"Senza sensore di potenza":e.outside?"Fuori dal contatore":i?"Fermo":`${$t(e.share)} del totale`:[$(e.cost),e.outside?"fuori dal contatore":$t(e.share)].filter(Boolean).join(" \xB7 ");return p`<button class="row ${i?"idle":""}" @click=${()=>this._open(e.key)}>
      <span class="shape" style="background:${rt(e.color,e.kind==="unmonitored"?.35:.2)};color:${e.kind==="unmonitored"?"var(--secondary-text-color)":e.color}"><ha-icon .icon=${e.icon}></ha-icon></span>
      <span class="main">
        <span class="top"><span class="name">${e.name}</span><span class="value">${s?F(e.value):v(e.value)}</span></span>
        <span class="secondary">${n}</span>
        <span class="track"><span class="fill ${e.kind==="unmonitored"?"hatched":""}" style="width:${e.bar*100}%;background-color:${e.color}"></span></span>
      </span>
    </button>`}render(){if(!this.hass)return h;let e=this._info;if(!e)return p`<ha-card><div class="pad msg">${this._error||"Carico i consumi\u2026"}</div></ha-card>`;let s=this._config,i=this._tab==="now",n=kt(e,this.hass.states),r=At(e,this._tab,n,this._dark,s,this._expanded),a=At(e,this._tab,n,this._dark).rows,l=Gt(a),d=Yt(n.meter,e.contract_kw,e.available_kw,e.overload),f=i?null:e.meter.periods[this._tab],u=i?null:J[this._tab],b=!i&&s.show_bands!==!1?e.meter.bands[this._tab]:void 0,m=this._stats?.series[w];return p`<ha-card>
      ${s.header!==!1?p`<div class="header">
            <span class="shape accent"><ha-icon icon="mdi:lightning-bolt"></ha-icon></span>
            <span class="htitle">${s.title||"Consumi elettrici"}</span>
            <span class="chip" title="Fascia oraria e prezzo dell'energia"><b>F${e.tariff.band}</b>${Vt(e.tariff.price)}</span>
          </div>`:h}

      <button class="hero" @click=${()=>this._open(w)} aria-label="Dettaglio di tutta la casa">
        ${i?p`<span class="big">${F(n.meter)}</span><span class="sub">in questo momento</span>`:p`<span class="big">${v(f.k)}</span><span class="sub">${$(f.c)}<span class="dot">·</span>${u.label.toLowerCase()} ${v(e.meter.periods[u.period].k)}</span>`}
        ${i&&d?p`<span class="meter ${d.level}">
                <span class="mtrack"><span class="mfill" style="width:${d.pct}%"></span><span class="mmark" style="left:${d.mark}%"></span></span>
                <span class="mtext">${d.level!=="ok"?p`<ha-icon icon="mdi:alert"></ha-icon>`:h}${d.text}</span>
              </span>`:h}
      </button>

      <div class="tabs" role="tablist">
        ${L.map(c=>p`<button role="tab" aria-selected=${this._tab===c.id} class=${this._tab===c.id?"on":""} @click=${()=>this._setTab(c.id)}>${c.label}</button>`)}
      </div>

      ${l.length>1?p`<div class="segbar" role="img" aria-label="Ripartizione: ${l.map(c=>`${c.name} ${Math.round(c.pct)}%`).join(", ")}">
            ${l.map(c=>p`<span class="segpart ${c.hatched?"hatched":""}" style="flex-grow:${c.pct};background-color:${c.color}"></span>`)}
          </div>`:h}

      <div class="rows">
        ${e.consumers.length===0?p`<div class="msg">Nessun consumatore: aggiungili da Impostazioni → Dispositivi e servizi → Consumi elettrici.</div>`:r.rows.map(c=>this._row(c,i))}
        ${r.hidden>0||this._expanded?p`<button class="more" @click=${()=>this._expanded=!this._expanded}>${this._expanded?"Mostra meno":`Mostra tutti (${r.hidden} in pi\xF9)`}</button>`:h}
      </div>

      ${b&&b.some(c=>c>0)?p`<div class="bands">${b.map((c,U)=>p`<span><b>F${U+1}</b>${v(c)}</span>`)}</div>`:h}

      ${!i&&s.show_chart!==!1?p`<div class="block">
            <div class="btitle">${this._tab==="year"?"Ultimi 12 mesi":this._tab==="month"?"Ultimi 30 giorni":"Ultimi 14 giorni"}</div>
            ${m&&this._stats?p`<consumi-bars .labels=${this._stats.labels} .values=${m.k} .costs=${m.c} .color=${this._colorOf(w)}></consumi-bars>`:p`<div class="msg">Carico…</div>`}
          </div>`:h}

      ${s.show_bill!==!1&&e.bill.enabled&&e.bill.month?p`<button class="bill" @click=${()=>this._open("bill")}>
            <span class="shape neutral"><ha-icon icon="mdi:receipt-text-outline"></ha-icon></span>
            <span class="main">
              <span class="top"><span class="name">Bolletta stimata di ${X(e.now)}</span><span class="value">${$(e.bill.month.totale)}</span></span>
              <span class="secondary">${e.bill.forecast?`A questo ritmo ${$(e.bill.forecast.totale)} a fine mese`:""}</span>
            </span>
          </button>`:h}
    </ha-card>`}static{this.styles=E`
    :host { display: block; }
    ha-card { padding: 12px; display: flex; flex-direction: column; gap: 12px; overflow: hidden; color: var(--primary-text-color, #212121); }
    /* opzione color: la tinta si mescola allo sfondo della scheda del tema (vale uguale su tema chiaro e scuro) */
    :host([tinted]) ha-card { background: color-mix(in srgb, var(--ce-tint) 30%, var(--ha-card-background, var(--card-background-color, #fff))); border: 1px solid color-mix(in srgb, var(--ce-tint) 55%, transparent); }
    button { font: inherit; color: inherit; -webkit-tap-highlight-color: transparent; }
    .pad { padding: 8px; }
    .msg { color: var(--secondary-text-color, #727272); font-size: 14px; line-height: 1.4; padding: 8px 4px; }
    .shape { width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex: none; --mdc-icon-size: 20px; }
    .shape.accent { background: rgba(var(--rgb-primary-color, 3, 169, 244), 0.2); color: var(--primary-color, #03a9f4); }
    .shape.neutral { background: rgba(127, 127, 127, 0.18); color: var(--primary-text-color, #212121); }

    .header { display: flex; align-items: center; gap: 12px; }
    .htitle { flex: 1; min-width: 0; font-size: 16px; font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .chip { display: inline-flex; align-items: center; gap: 6px; height: 32px; padding: 0 12px; border-radius: 16px; border: 1px solid var(--divider-color, #e0e0e0); font-size: 12.5px; font-variant-numeric: tabular-nums; color: var(--secondary-text-color, #727272); white-space: nowrap; }
    .chip b { color: var(--primary-text-color, #212121); font-weight: 600; }

    .hero { border: 0; background: transparent; text-align: left; padding: 4px; margin: 0; cursor: pointer; display: flex; flex-direction: column; gap: 2px; border-radius: 12px; }
    .hero:active { background: var(--secondary-background-color, #f5f5f5); }
    .big { font-size: 40px; line-height: 1.1; font-weight: 600; letter-spacing: -0.02em; font-variant-numeric: tabular-nums; }
    .sub { font-size: 14px; color: var(--secondary-text-color, #727272); font-variant-numeric: tabular-nums; }
    .dot { margin: 0 6px; }
    .meter { display: flex; flex-direction: column; gap: 6px; margin-top: 10px; --level: var(--primary-color, #03a9f4); }
    .meter.warning { --level: var(--warning-color, #ffa600); }
    .meter.critical { --level: var(--error-color, #db4437); }
    .mtrack { position: relative; height: 8px; border-radius: 4px; background: rgba(127, 127, 127, 0.2); }
    .mfill { position: absolute; left: 0; top: 0; bottom: 0; border-radius: 4px; background: var(--level); transition: width 0.4s; }
    .mmark { position: absolute; top: -3px; bottom: -3px; width: 2px; margin-left: -1px; background: var(--primary-text-color, #212121); opacity: 0.55; border-radius: 1px; }
    .mtext { display: flex; align-items: center; gap: 4px; font-size: 12.5px; color: var(--secondary-text-color, #727272); --mdc-icon-size: 16px; }
    .meter.warning .mtext ha-icon, .meter.critical .mtext ha-icon { color: var(--level); }
    .meter.warning .mtext, .meter.critical .mtext { color: var(--primary-text-color, #212121); font-weight: 500; }

    .tabs { display: flex; background: var(--secondary-background-color, #f0f0f0); border-radius: 12px; padding: 4px; gap: 2px; overflow-x: auto; scrollbar-width: none; }
    .tabs::-webkit-scrollbar { display: none; }
    .tabs button { flex: 1 0 auto; border: 0; background: transparent; color: var(--secondary-text-color, #727272); font-size: 13.5px; font-weight: 500; min-height: 40px; padding: 0 10px; border-radius: 9px; cursor: pointer; white-space: nowrap; }
    .tabs button.on { background: var(--card-background-color, #fff); color: var(--primary-text-color, #212121); box-shadow: 0 1px 3px rgba(0, 0, 0, 0.18); }

    .segbar { display: flex; gap: 2px; height: 12px; }
    .segpart { flex: 1 1 0; min-width: 2px; border-radius: 3px; }
    .hatched { background-image: repeating-linear-gradient(135deg, rgba(255, 255, 255, 0.45) 0 2px, transparent 2px 6px); }

    .rows { display: grid; grid-template-columns: repeat(auto-fill, minmax(min(100%, 300px), 1fr)); gap: 2px 20px; }
    .rows .msg, .rows .more { grid-column: 1 / -1; }
    .row, .bill { display: flex; align-items: center; gap: 12px; width: 100%; border: 0; background: transparent; text-align: left; padding: 8px 4px; border-radius: 12px; cursor: pointer; min-height: 56px; }
    .row:active, .bill:active { background: var(--secondary-background-color, #f5f5f5); }
    .main { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 1px; }
    .top { display: flex; align-items: baseline; justify-content: space-between; gap: 10px; }
    .name { font-size: 14px; font-weight: 500; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; min-width: 0; }
    .value { font-size: 14px; font-weight: 600; font-variant-numeric: tabular-nums; white-space: nowrap; }
    .secondary { font-size: 12px; color: var(--secondary-text-color, #727272); font-variant-numeric: tabular-nums; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; min-height: 15px; }
    .track { display: block; height: 4px; border-radius: 2px; background: rgba(127, 127, 127, 0.16); margin-top: 5px; overflow: hidden; }
    .fill { display: block; height: 100%; border-radius: 2px; transition: width 0.4s; }
    .row.idle .name, .row.idle .value { color: var(--secondary-text-color, #727272); font-weight: 400; }
    .row.idle .shape { opacity: 0.55; }
    .more { border: 0; background: transparent; color: var(--primary-color, #03a9f4); font-size: 14px; font-weight: 500; min-height: 44px; border-radius: 12px; cursor: pointer; }
    .more:active { background: var(--secondary-background-color, #f5f5f5); }

    .bands { display: flex; gap: 8px; }
    .bands span { flex: 1; min-width: 0; display: flex; flex-direction: column; background: var(--secondary-background-color, #f5f5f5); border-radius: 10px; padding: 8px 10px; font-size: 13px; font-variant-numeric: tabular-nums; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .bands b { font-size: 11.5px; font-weight: 500; color: var(--secondary-text-color, #727272); }

    .block { border-top: 1px solid var(--divider-color, #e0e0e0); padding: 12px 4px 0; }
    .btitle { font-size: 12px; font-weight: 600; letter-spacing: 0.05em; text-transform: uppercase; color: var(--secondary-text-color, #727272); margin-bottom: 8px; }
    .bill { border-top: 1px solid var(--divider-color, #e0e0e0); border-radius: 0 0 12px 12px; padding-top: 12px; }

    @media (prefers-reduced-motion: reduce) { .mfill, .fill { transition: none; } }
  `}};g([_({attribute:!1})],S.prototype,"hass",2),g([x()],S.prototype,"_config",2),g([x()],S.prototype,"_info",2),g([x()],S.prototype,"_stats",2),g([x()],S.prototype,"_error",2),g([x()],S.prototype,"_tab",2),g([x()],S.prototype,"_expanded",2);customElements.get("consumi-elettrici-card")||customElements.define("consumi-elettrici-card",S);var lt=window;lt.customCards=lt.customCards??[];lt.customCards.some(o=>o.type==="consumi-elettrici-card")||lt.customCards.push({type:"consumi-elettrici-card",name:"Consumi elettrici",description:"Potenza di adesso, classifica dei consumatori, energia e costo per periodo, bolletta stimata.",preview:!1});export{S as ConsumiElettriciCard};
/*! Bundled license information:

@lit/reactive-element/css-tag.js:
  (**
   * @license
   * Copyright 2019 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

@lit/reactive-element/reactive-element.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

lit-html/lit-html.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

lit-element/lit-element.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

lit-html/is-server.js:
  (**
   * @license
   * Copyright 2022 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

@lit/reactive-element/decorators/custom-element.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

@lit/reactive-element/decorators/property.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

@lit/reactive-element/decorators/state.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

@lit/reactive-element/decorators/event-options.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

@lit/reactive-element/decorators/base.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

@lit/reactive-element/decorators/query.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

@lit/reactive-element/decorators/query-all.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

@lit/reactive-element/decorators/query-async.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

@lit/reactive-element/decorators/query-assigned-elements.js:
  (**
   * @license
   * Copyright 2021 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

@lit/reactive-element/decorators/query-assigned-nodes.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)
*/
