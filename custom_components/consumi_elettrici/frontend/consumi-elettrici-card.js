var ee=Object.defineProperty;var se=Object.getOwnPropertyDescriptor;var g=(o,e,t,s)=>{for(var i=s>1?void 0:s?se(e,t):e,n=o.length-1,r;n>=0;n--)(r=o[n])&&(i=(s?r(e,t,i):r(i))||i);return s&&i&&ee(e,t,i),i};var Q=globalThis,tt=Q.ShadowRoot&&(Q.ShadyCSS===void 0||Q.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,dt=Symbol(),Et=new WeakMap,q=class{constructor(e,t,s){if(this._$cssResult$=!0,s!==dt)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=e,this.t=t}get styleSheet(){let e=this.o,t=this.t;if(tt&&e===void 0){let s=t!==void 0&&t.length===1;s&&(e=Et.get(t)),e===void 0&&((this.o=e=new CSSStyleSheet).replaceSync(this.cssText),s&&Et.set(t,e))}return e}toString(){return this.cssText}},Ct=o=>new q(typeof o=="string"?o:o+"",void 0,dt),E=(o,...e)=>{let t=o.length===1?o[0]:e.reduce((s,i,n)=>s+(r=>{if(r._$cssResult$===!0)return r.cssText;if(typeof r=="number")return r;throw Error("Value passed to 'css' function must be a 'css' function result: "+r+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(i)+o[n+1],o[0]);return new q(t,o,dt)},Mt=(o,e)=>{if(tt)o.adoptedStyleSheets=e.map(t=>t instanceof CSSStyleSheet?t:t.styleSheet);else for(let t of e){let s=document.createElement("style"),i=Q.litNonce;i!==void 0&&s.setAttribute("nonce",i),s.textContent=t.cssText,o.appendChild(s)}},pt=tt?o=>o:o=>o instanceof CSSStyleSheet?(e=>{let t="";for(let s of e.cssRules)t+=s.cssText;return Ct(t)})(o):o;var{is:ie,defineProperty:oe,getOwnPropertyDescriptor:ne,getOwnPropertyNames:re,getOwnPropertySymbols:ae,getPrototypeOf:le}=Object,et=globalThis,Pt=et.trustedTypes,ce=Pt?Pt.emptyScript:"",de=et.reactiveElementPolyfillSupport,D=(o,e)=>o,W={toAttribute(o,e){switch(e){case Boolean:o=o?ce:null;break;case Object:case Array:o=o==null?o:JSON.stringify(o)}return o},fromAttribute(o,e){let t=o;switch(e){case Boolean:t=o!==null;break;case Number:t=o===null?null:Number(o);break;case Object:case Array:try{t=JSON.parse(o)}catch{t=null}}return t}},st=(o,e)=>!ie(o,e),Rt={attribute:!0,type:String,converter:W,reflect:!1,useDefault:!1,hasChanged:st};Symbol.metadata??=Symbol("metadata"),et.litPropertyMetadata??=new WeakMap;var C=class extends HTMLElement{static addInitializer(e){this._$Ei(),(this.l??=[]).push(e)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(e,t=Rt){if(t.state&&(t.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(e)&&((t=Object.create(t)).wrapped=!0),this.elementProperties.set(e,t),!t.noAccessor){let s=Symbol(),i=this.getPropertyDescriptor(e,s,t);i!==void 0&&oe(this.prototype,e,i)}}static getPropertyDescriptor(e,t,s){let{get:i,set:n}=ne(this.prototype,e)??{get(){return this[t]},set(r){this[t]=r}};return{get:i,set(r){let a=i?.call(this);n?.call(this,r),this.requestUpdate(e,a,s)},configurable:!0,enumerable:!0}}static getPropertyOptions(e){return this.elementProperties.get(e)??Rt}static _$Ei(){if(this.hasOwnProperty(D("elementProperties")))return;let e=le(this);e.finalize(),e.l!==void 0&&(this.l=[...e.l]),this.elementProperties=new Map(e.elementProperties)}static finalize(){if(this.hasOwnProperty(D("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(D("properties"))){let t=this.properties,s=[...re(t),...ae(t)];for(let i of s)this.createProperty(i,t[i])}let e=this[Symbol.metadata];if(e!==null){let t=litPropertyMetadata.get(e);if(t!==void 0)for(let[s,i]of t)this.elementProperties.set(s,i)}this._$Eh=new Map;for(let[t,s]of this.elementProperties){let i=this._$Eu(t,s);i!==void 0&&this._$Eh.set(i,t)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(e){let t=[];if(Array.isArray(e)){let s=new Set(e.flat(1/0).reverse());for(let i of s)t.unshift(pt(i))}else e!==void 0&&t.push(pt(e));return t}static _$Eu(e,t){let s=t.attribute;return s===!1?void 0:typeof s=="string"?s:typeof e=="string"?e.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(e=>this.enableUpdating=e),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(e=>e(this))}addController(e){(this._$EO??=new Set).add(e),this.renderRoot!==void 0&&this.isConnected&&e.hostConnected?.()}removeController(e){this._$EO?.delete(e)}_$E_(){let e=new Map,t=this.constructor.elementProperties;for(let s of t.keys())this.hasOwnProperty(s)&&(e.set(s,this[s]),delete this[s]);e.size>0&&(this._$Ep=e)}createRenderRoot(){let e=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return Mt(e,this.constructor.elementStyles),e}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(e=>e.hostConnected?.())}enableUpdating(e){}disconnectedCallback(){this._$EO?.forEach(e=>e.hostDisconnected?.())}attributeChangedCallback(e,t,s){this._$AK(e,s)}_$ET(e,t){let s=this.constructor.elementProperties.get(e),i=this.constructor._$Eu(e,s);if(i!==void 0&&s.reflect===!0){let n=(s.converter?.toAttribute!==void 0?s.converter:W).toAttribute(t,s.type);this._$Em=e,n==null?this.removeAttribute(i):this.setAttribute(i,n),this._$Em=null}}_$AK(e,t){let s=this.constructor,i=s._$Eh.get(e);if(i!==void 0&&this._$Em!==i){let n=s.getPropertyOptions(i),r=typeof n.converter=="function"?{fromAttribute:n.converter}:n.converter?.fromAttribute!==void 0?n.converter:W;this._$Em=i;let a=r.fromAttribute(t,n.type);this[i]=a??this._$Ej?.get(i)??a,this._$Em=null}}requestUpdate(e,t,s,i=!1,n){if(e!==void 0){let r=this.constructor;if(i===!1&&(n=this[e]),s??=r.getPropertyOptions(e),!((s.hasChanged??st)(n,t)||s.useDefault&&s.reflect&&n===this._$Ej?.get(e)&&!this.hasAttribute(r._$Eu(e,s))))return;this.C(e,t,s)}this.isUpdatePending===!1&&(this._$ES=this._$EP())}C(e,t,{useDefault:s,reflect:i,wrapped:n},r){s&&!(this._$Ej??=new Map).has(e)&&(this._$Ej.set(e,r??t??this[e]),n!==!0||r!==void 0)||(this._$AL.has(e)||(this.hasUpdated||s||(t=void 0),this._$AL.set(e,t)),i===!0&&this._$Em!==e&&(this._$Eq??=new Set).add(e))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(t){Promise.reject(t)}let e=this.scheduleUpdate();return e!=null&&await e,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(let[i,n]of this._$Ep)this[i]=n;this._$Ep=void 0}let s=this.constructor.elementProperties;if(s.size>0)for(let[i,n]of s){let{wrapped:r}=n,a=this[i];r!==!0||this._$AL.has(i)||a===void 0||this.C(i,void 0,n,a)}}let e=!1,t=this._$AL;try{e=this.shouldUpdate(t),e?(this.willUpdate(t),this._$EO?.forEach(s=>s.hostUpdate?.()),this.update(t)):this._$EM()}catch(s){throw e=!1,this._$EM(),s}e&&this._$AE(t)}willUpdate(e){}_$AE(e){this._$EO?.forEach(t=>t.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(e)),this.updated(e)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(e){return!0}update(e){this._$Eq&&=this._$Eq.forEach(t=>this._$ET(t,this[t])),this._$EM()}updated(e){}firstUpdated(e){}};C.elementStyles=[],C.shadowRootOptions={mode:"open"},C[D("elementProperties")]=new Map,C[D("finalized")]=new Map,de?.({ReactiveElement:C}),(et.reactiveElementVersions??=[]).push("2.1.2");var _t=globalThis,Tt=o=>o,it=_t.trustedTypes,zt=it?it.createPolicy("lit-html",{createHTML:o=>o}):void 0,Lt="$lit$",M=`lit$${Math.random().toFixed(9).slice(2)}$`,Ft="?"+M,pe=`<${Ft}>`,z=document,V=()=>z.createComment(""),K=o=>o===null||typeof o!="object"&&typeof o!="function",xt=Array.isArray,he=o=>xt(o)||typeof o?.[Symbol.iterator]=="function",ht=`[ 	
\f\r]`,B=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,Ot=/-->/g,Nt=/>/g,R=RegExp(`>|${ht}(?:([^\\s"'>=/]+)(${ht}*=${ht}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`,"g"),Ut=/'/g,Ht=/"/g,jt=/^(?:script|style|textarea|title)$/i,vt=o=>(e,...t)=>({_$litType$:o,strings:e,values:t}),p=vt(1),Oe=vt(2),Ne=vt(3),O=Symbol.for("lit-noChange"),h=Symbol.for("lit-nothing"),It=new WeakMap,T=z.createTreeWalker(z,129);function qt(o,e){if(!xt(o)||!o.hasOwnProperty("raw"))throw Error("invalid template strings array");return zt!==void 0?zt.createHTML(e):e}var ue=(o,e)=>{let t=o.length-1,s=[],i,n=e===2?"<svg>":e===3?"<math>":"",r=B;for(let a=0;a<t;a++){let l=o[a],d,f,u=-1,b=0;for(;b<l.length&&(r.lastIndex=b,f=r.exec(l),f!==null);)b=r.lastIndex,r===B?f[1]==="!--"?r=Ot:f[1]!==void 0?r=Nt:f[2]!==void 0?(jt.test(f[2])&&(i=RegExp("</"+f[2],"g")),r=R):f[3]!==void 0&&(r=R):r===R?f[0]===">"?(r=i??B,u=-1):f[1]===void 0?u=-2:(u=r.lastIndex-f[2].length,d=f[1],r=f[3]===void 0?R:f[3]==='"'?Ht:Ut):r===Ht||r===Ut?r=R:r===Ot||r===Nt?r=B:(r=R,i=void 0);let m=r===R&&o[a+1].startsWith("/>")?" ":"";n+=r===B?l+pe:u>=0?(s.push(d),l.slice(0,u)+Lt+l.slice(u)+M+m):l+M+(u===-2?a:m)}return[qt(o,n+(o[t]||"<?>")+(e===2?"</svg>":e===3?"</math>":"")),s]},G=class o{constructor({strings:e,_$litType$:t},s){let i;this.parts=[];let n=0,r=0,a=e.length-1,l=this.parts,[d,f]=ue(e,t);if(this.el=o.createElement(d,s),T.currentNode=this.el.content,t===2||t===3){let u=this.el.content.firstChild;u.replaceWith(...u.childNodes)}for(;(i=T.nextNode())!==null&&l.length<a;){if(i.nodeType===1){if(i.hasAttributes())for(let u of i.getAttributeNames())if(u.endsWith(Lt)){let b=f[r++],m=i.getAttribute(u).split(M),c=/([.?@])?(.*)/.exec(b);l.push({type:1,index:n,name:c[2],strings:m,ctor:c[1]==="."?mt:c[1]==="?"?ft:c[1]==="@"?gt:I}),i.removeAttribute(u)}else u.startsWith(M)&&(l.push({type:6,index:n}),i.removeAttribute(u));if(jt.test(i.tagName)){let u=i.textContent.split(M),b=u.length-1;if(b>0){i.textContent=it?it.emptyScript:"";for(let m=0;m<b;m++)i.append(u[m],V()),T.nextNode(),l.push({type:2,index:++n});i.append(u[b],V())}}}else if(i.nodeType===8)if(i.data===Ft)l.push({type:2,index:n});else{let u=-1;for(;(u=i.data.indexOf(M,u+1))!==-1;)l.push({type:7,index:n}),u+=M.length-1}n++}}static createElement(e,t){let s=z.createElement("template");return s.innerHTML=e,s}};function H(o,e,t=o,s){if(e===O)return e;let i=s!==void 0?t._$Co?.[s]:t._$Cl,n=K(e)?void 0:e._$litDirective$;return i?.constructor!==n&&(i?._$AO?.(!1),n===void 0?i=void 0:(i=new n(o),i._$AT(o,t,s)),s!==void 0?(t._$Co??=[])[s]=i:t._$Cl=i),i!==void 0&&(e=H(o,i._$AS(o,e.values),i,s)),e}var ut=class{constructor(e,t){this._$AV=[],this._$AN=void 0,this._$AD=e,this._$AM=t}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(e){let{el:{content:t},parts:s}=this._$AD,i=(e?.creationScope??z).importNode(t,!0);T.currentNode=i;let n=T.nextNode(),r=0,a=0,l=s[0];for(;l!==void 0;){if(r===l.index){let d;l.type===2?d=new Y(n,n.nextSibling,this,e):l.type===1?d=new l.ctor(n,l.name,l.strings,this,e):l.type===6&&(d=new bt(n,this,e)),this._$AV.push(d),l=s[++a]}r!==l?.index&&(n=T.nextNode(),r++)}return T.currentNode=z,i}p(e){let t=0;for(let s of this._$AV)s!==void 0&&(s.strings!==void 0?(s._$AI(e,s,t),t+=s.strings.length-2):s._$AI(e[t])),t++}},Y=class o{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(e,t,s,i){this.type=2,this._$AH=h,this._$AN=void 0,this._$AA=e,this._$AB=t,this._$AM=s,this.options=i,this._$Cv=i?.isConnected??!0}get parentNode(){let e=this._$AA.parentNode,t=this._$AM;return t!==void 0&&e?.nodeType===11&&(e=t.parentNode),e}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(e,t=this){e=H(this,e,t),K(e)?e===h||e==null||e===""?(this._$AH!==h&&this._$AR(),this._$AH=h):e!==this._$AH&&e!==O&&this._(e):e._$litType$!==void 0?this.$(e):e.nodeType!==void 0?this.T(e):he(e)?this.k(e):this._(e)}O(e){return this._$AA.parentNode.insertBefore(e,this._$AB)}T(e){this._$AH!==e&&(this._$AR(),this._$AH=this.O(e))}_(e){this._$AH!==h&&K(this._$AH)?this._$AA.nextSibling.data=e:this.T(z.createTextNode(e)),this._$AH=e}$(e){let{values:t,_$litType$:s}=e,i=typeof s=="number"?this._$AC(e):(s.el===void 0&&(s.el=G.createElement(qt(s.h,s.h[0]),this.options)),s);if(this._$AH?._$AD===i)this._$AH.p(t);else{let n=new ut(i,this),r=n.u(this.options);n.p(t),this.T(r),this._$AH=n}}_$AC(e){let t=It.get(e.strings);return t===void 0&&It.set(e.strings,t=new G(e)),t}k(e){xt(this._$AH)||(this._$AH=[],this._$AR());let t=this._$AH,s,i=0;for(let n of e)i===t.length?t.push(s=new o(this.O(V()),this.O(V()),this,this.options)):s=t[i],s._$AI(n),i++;i<t.length&&(this._$AR(s&&s._$AB.nextSibling,i),t.length=i)}_$AR(e=this._$AA.nextSibling,t){for(this._$AP?.(!1,!0,t);e!==this._$AB;){let s=Tt(e).nextSibling;Tt(e).remove(),e=s}}setConnected(e){this._$AM===void 0&&(this._$Cv=e,this._$AP?.(e))}},I=class{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(e,t,s,i,n){this.type=1,this._$AH=h,this._$AN=void 0,this.element=e,this.name=t,this._$AM=i,this.options=n,s.length>2||s[0]!==""||s[1]!==""?(this._$AH=Array(s.length-1).fill(new String),this.strings=s):this._$AH=h}_$AI(e,t=this,s,i){let n=this.strings,r=!1;if(n===void 0)e=H(this,e,t,0),r=!K(e)||e!==this._$AH&&e!==O,r&&(this._$AH=e);else{let a=e,l,d;for(e=n[0],l=0;l<n.length-1;l++)d=H(this,a[s+l],t,l),d===O&&(d=this._$AH[l]),r||=!K(d)||d!==this._$AH[l],d===h?e=h:e!==h&&(e+=(d??"")+n[l+1]),this._$AH[l]=d}r&&!i&&this.j(e)}j(e){e===h?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,e??"")}},mt=class extends I{constructor(){super(...arguments),this.type=3}j(e){this.element[this.name]=e===h?void 0:e}},ft=class extends I{constructor(){super(...arguments),this.type=4}j(e){this.element.toggleAttribute(this.name,!!e&&e!==h)}},gt=class extends I{constructor(e,t,s,i,n){super(e,t,s,i,n),this.type=5}_$AI(e,t=this){if((e=H(this,e,t,0)??h)===O)return;let s=this._$AH,i=e===h&&s!==h||e.capture!==s.capture||e.once!==s.once||e.passive!==s.passive,n=e!==h&&(s===h||i);i&&this.element.removeEventListener(this.name,this,s),n&&this.element.addEventListener(this.name,this,e),this._$AH=e}handleEvent(e){typeof this._$AH=="function"?this._$AH.call(this.options?.host??this.element,e):this._$AH.handleEvent(e)}},bt=class{constructor(e,t,s){this.element=e,this.type=6,this._$AN=void 0,this._$AM=t,this.options=s}get _$AU(){return this._$AM._$AU}_$AI(e){H(this,e)}};var me=_t.litHtmlPolyfillSupport;me?.(G,Y),(_t.litHtmlVersions??=[]).push("3.3.3");var Dt=(o,e,t)=>{let s=t?.renderBefore??e,i=s._$litPart$;if(i===void 0){let n=t?.renderBefore??null;s._$litPart$=i=new Y(e.insertBefore(V(),n),n,void 0,t??{})}return i._$AI(o),i};var yt=globalThis,y=class extends C{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){let e=super.createRenderRoot();return this.renderOptions.renderBefore??=e.firstChild,e}update(e){let t=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(e),this._$Do=Dt(t,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return O}};y._$litElement$=!0,y.finalized=!0,yt.litElementHydrateSupport?.({LitElement:y});var fe=yt.litElementPolyfillSupport;fe?.({LitElement:y});(yt.litElementVersions??=[]).push("4.2.2");var ge={attribute:!0,type:String,converter:W,reflect:!1,hasChanged:st},be=(o=ge,e,t)=>{let{kind:s,metadata:i}=t,n=globalThis.litPropertyMetadata.get(i);if(n===void 0&&globalThis.litPropertyMetadata.set(i,n=new Map),s==="setter"&&((o=Object.create(o)).wrapped=!0),n.set(t.name,o),s==="accessor"){let{name:r}=t;return{set(a){let l=e.get.call(this);e.set.call(this,a),this.requestUpdate(r,l,o,!0,a)},init(a){return a!==void 0&&this.C(r,void 0,o,a),a}}}if(s==="setter"){let{name:r}=t;return function(a){let l=this[r];e.call(this,a),this.requestUpdate(r,l,o,!0,a)}}throw Error("Unsupported decorator location: "+s)};function _(o){return(e,t)=>typeof t=="object"?be(o,e,t):((s,i,n)=>{let r=i.hasOwnProperty(n);return i.constructor.createProperty(n,s),r?Object.getOwnPropertyDescriptor(i,n):void 0})(o,e,t)}function x(o){return _({...o,state:!0,attribute:!1})}var w="_meter",N="_unmonitored",L=[{id:"now",label:"Adesso"},{id:"today",label:"Oggi"},{id:"week",label:"Settimana"},{id:"month",label:"Mese"},{id:"year",label:"Anno"}],J={today:{period:"yesterday",label:"Ieri"},week:{period:"last_week",label:"Settimana scorsa"},month:{period:"last_month",label:"Mese scorso"},year:{period:"last_year",label:"Anno scorso"}};function A(o,e=1){if(o==null||!Number.isFinite(o))return"\u2013";let[t,s]=o.toFixed(e).split("."),i=t.replace(/\B(?=(\d{3})+(?!\d))/g,".");return s?`${i},${s}`:i}function F(o){return o==null||!Number.isFinite(o)?"\u2013":Math.abs(o)>=1e3?`${A(o/1e3,2)} kW`:`${Math.round(o)} W`}function v(o){return o==null||!Number.isFinite(o)?"\u2013":`${A(o,o<10?2:o<100?1:0)} kWh`}function $(o){return o==null||!Number.isFinite(o)?"\u2013":`${A(o,2)} \u20AC`}function $t(o){if(o===null||!Number.isFinite(o))return"";let e=o*100;return e>0&&e<1?"<1%":`${Math.round(e)}%`}function Vt(o){return`${A(o,o<.1?4:3).replace(/0$/,"")} \u20AC/kWh`}var _e=["dom","lun","mar","mer","gio","ven","sab"],Wt=["gen","feb","mar","apr","mag","giu","lug","ago","set","ott","nov","dic"],Kt=["gennaio","febbraio","marzo","aprile","maggio","giugno","luglio","agosto","settembre","ottobre","novembre","dicembre"];function nt(o,e=!1){let[t,s,i]=o.split("-").map(Number);if(!i)return e?`${Kt[s-1]} ${t}`:Wt[s-1];if(!e)return`${i}`;let n=new Date(Date.UTC(t,s-1,i)).getUTCDay();return`${_e[n]} ${i} ${Wt[s-1]}`}function X(o,e=0){let t=new Date(o),s=(((Number.isNaN(t.getTime())?0:t.getMonth())+e)%12+12)%12;return Kt[s]}var xe=["#2a78d6","#eb6834","#1baf7a","#eda100","#e87ba4","#008300","#6250d6","#e34948"],ve=["#3987e5","#d95926","#199e70","#c98500","#d55181","#0ca30c","#9085e9","#e66767"],ye="#8a8a86",$e="#8d8d88",we="#c9c8c2",ke="#55554f";function wt(o,e){let t=e?ve:xe;return o>=0&&o<t.length?t[o]:e?$e:ye}function rt(o,e){let t=parseInt(o.slice(1),16);return`rgba(${t>>16&255}, ${t>>8&255}, ${t&255}, ${e})`}function Bt(o){if(!o)return null;let e=Number(o.state);if(o.state===""||!Number.isFinite(e))return null;let t=String(o.attributes.unit_of_measurement??"W").toLowerCase();return t==="kw"?e*1e3:t==="mw"?e*1e6:e}function at(o,e){return o.consumers.filter(t=>t.parent===e).map(t=>t.key)}function kt(o,e){let t=o.meter.power_entities.map(a=>Bt(e[a])).filter(a=>a!==null),s=t.length?t.reduce((a,l)=>a+l,0):o.meter.power,i={},n=0;for(let a of o.consumers){let l=a.power_entity?Bt(e[a.power_entity]):null,d=a.power_entity?l??(e[a.power_entity]?null:a.power):null;i[a.key]=d,d!==null&&a.parent===w&&(n+=d)}let r={};for(let a of o.consumers){let l=at(o,a.key);if(!l.length)continue;let d=i[a.key];r[a.key]=d===null?null:Math.max(d-l.reduce((f,u)=>f+(i[u]??0),0),0)}return{meter:s,unmonitored:s===null?null:Math.max(s-n,0),consumers:i,rest:r}}function At(o,e,t,s,i={},n=!1){let r=e==="now",a=r?t.meter:o.meter.periods[e].k,l=r?null:o.meter.periods[e].c,d=o.consumers.map((c,U)=>{let j=at(o,c.key).length>0,ct=r?j?t.rest[c.key]:t.consumers[c.key]:j&&c.rest?c.rest.periods[e].k:c.periods[e].k,te=r?null:j&&c.rest?c.rest.periods[e].c:c.periods[e].c;return{key:c.key,name:j?`${c.name} \xB7 resto`:c.name,icon:c.icon||"mdi:power-plug",color:wt(U,s),value:ct,cost:te,share:c.in_meter&&ct!==null&&a?Math.min(ct/a,1):null,bar:0,kind:"consumer",outside:!c.in_meter,rest:j}}),f=r?t.unmonitored:o.unmonitored.periods[e].k;o.consumers.some(c=>c.in_meter)&&d.push({key:N,name:"Non monitorato",icon:"mdi:help-circle-outline",color:s?ke:we,value:f,cost:r?null:o.unmonitored.periods[e].c,share:f!==null&&a?Math.min(f/a,1):null,bar:0,kind:"unmonitored",outside:!1,rest:!1}),d.sort((c,U)=>(U.value??-1)-(c.value??-1)||c.name.localeCompare(U.name));let u=Math.max(0,...d.map(c=>c.value??0));for(let c of d)c.bar=u>0&&c.value?Math.max(c.value/u,0):0;let b=d;r&&i.hide_idle&&!n&&(b=d.filter(c=>c.kind==="unmonitored"||(c.value??0)>=1));let m=!n&&i.max_rows&&i.max_rows>0?i.max_rows:b.length;return{total:a,totalCost:l,rows:b.slice(0,m),hidden:Math.max(b.length-m,0)+(d.length-b.length)}}function Gt(o){let e=o.filter(s=>!s.outside&&(s.value??0)>0),t=e.reduce((s,i)=>s+(i.value??0),0);return t<=0?[]:e.map(s=>({key:s.key,name:s.name,color:s.color,pct:(s.value??0)/t*100,hatched:s.kind==="unmonitored"})).filter(s=>s.pct>=1)}function Yt(o,e,t,s){if(o===null||!(e>0))return null;let i=e*1e3,n=Math.max(t*1e3,i),r=n,a=s>=2||o>n?"critical":s>=1||o>i?"warning":"ok",l=a==="critical"?`Oltre la potenza disponibile (${A(t,1)} kW)`:a==="warning"?`Oltre il contratto di ${A(e,1)} kW`:`${Math.round(o/i*100)}% di ${A(e,1)} kW`;return{pct:Math.min(Math.max(o/r*100,0),100),mark:i/r*100,level:a,text:l}}function Jt(o){return o==="year"?{granularity:"month",count:12}:o==="month"?{granularity:"day",count:30}:{granularity:"day",count:14}}function Xt(o){if(!(o>0))return 1;let e=Math.pow(10,Math.floor(Math.log10(o))),t=o/e;return([1,2,3,4,5,6,8,10].find(i=>t<=i+1e-9)??10)*e}function St(o){return A(o,o>=10||Number.isInteger(o)?0:o>=1?1:2)}function Zt(o,e=5){if(o<=e)return Array.from({length:o},(s,i)=>i);let t=[];for(let s=0;s<e;s++)t.push(Math.round(s*(o-1)/(e-1)));return[...new Set(t)]}function Qt(o,e,t,s){return Math.ceil(((s?56:0)+150+o*56+(e?190:0)+(t?70:0))/50)}var P=class extends y{constructor(){super(...arguments);this.labels=[];this.values=[];this.costs=[];this.color="#2a78d6";this._selected=null}willUpdate(t){t.has("labels")&&(this._selected=null)}render(){let t=this.labels.length;if(!t)return p`<div class="empty">Nessun dato</div>`;let s=this._selected!==null&&this._selected<t?this._selected:t-1,i=Xt(Math.max(...this.values,0)),n=new Set(Zt(t,t>14?6:5));return p`
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
  `}};g([_({attribute:!1})],P.prototype,"labels",2),g([_({attribute:!1})],P.prototype,"values",2),g([_({attribute:!1})],P.prototype,"costs",2),g([_()],P.prototype,"color",2),g([x()],P.prototype,"_selected",2);customElements.get("consumi-bars")||customElements.define("consumi-bars",P);var Ae={title:"Titolo",header:"Mostra titolo, fascia e prezzo",default_tab:"Scheda aperta all'inizio",max_rows:"Consumatori visibili (0 = tutti)",hide_idle:"In \xABAdesso\xBB nascondi i consumatori fermi",show_chart:"Mostra il grafico",show_bands:"Mostra i kWh per fascia",show_bill:"Mostra la bolletta stimata"},Se={max_rows:"Gli altri si vedono con \xABMostra tutti\xBB.",show_bill:"Compare solo se la stima \xE8 attiva nelle opzioni dell'integrazione."},Z=class extends y{constructor(){super(...arguments);this._config={type:"custom:consumi-elettrici-card"}}setConfig(t){this._config={...t}}_schema(){return[{name:"title",selector:{text:{}}},{name:"header",selector:{boolean:{}}},{name:"default_tab",selector:{select:{mode:"dropdown",options:L.map(t=>({value:t.id,label:t.label}))}}},{name:"max_rows",selector:{number:{min:0,max:30,step:1,mode:"box"}}},{name:"hide_idle",selector:{boolean:{}}},{name:"show_chart",selector:{boolean:{}}},{name:"show_bands",selector:{boolean:{}}},{name:"show_bill",selector:{boolean:{}}}]}_onForm(t){t.stopPropagation();let s=t.detail.value,i={type:this._config.type};this._config.entry_id&&(i.entry_id=this._config.entry_id),typeof s.title=="string"&&s.title.trim()&&(i.title=s.title.trim()),s.header===!1&&(i.header=!1),typeof s.default_tab=="string"&&s.default_tab!=="now"&&L.some(r=>r.id===s.default_tab)&&(i.default_tab=s.default_tab);let n=Math.round(Number(s.max_rows));Number.isFinite(n)&&n>0&&(i.max_rows=Math.min(n,30)),s.hide_idle===!0&&(i.hide_idle=!0),s.show_chart===!1&&(i.show_chart=!1),s.show_bands===!1&&(i.show_bands=!1),s.show_bill===!1&&(i.show_bill=!1),this._config=i,this.dispatchEvent(new CustomEvent("config-changed",{detail:{config:i},bubbles:!0,composed:!0}))}render(){if(!this.hass)return h;let t=this._config,s={title:t.title??"",header:t.header!==!1,default_tab:t.default_tab??"now",max_rows:t.max_rows??0,hide_idle:t.hide_idle===!0,show_chart:t.show_chart!==!1,show_bands:t.show_bands!==!1,show_bill:t.show_bill!==!1};return p`
      <ha-form
        .hass=${this.hass}
        .data=${s}
        .schema=${this._schema()}
        .computeLabel=${i=>Ae[i.name]??i.name}
        .computeHelper=${i=>Se[i.name]??""}
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
  `}};g([_({attribute:!1})],Z.prototype,"hass",2),g([x()],Z.prototype,"_config",2);customElements.get("consumi-elettrici-card-editor")||customElements.define("consumi-elettrici-card-editor",Z);var k=class extends y{constructor(){super(...arguments);this.target=w;this.color="#2a78d6";this.power=null;this._granularity="day";this._stats=null;this._billPeriod="month";this._loadedFor="";this._onKey=t=>{t.key==="Escape"&&this._close()}}connectedCallback(){super.connectedCallback(),window.addEventListener("keydown",this._onKey)}disconnectedCallback(){super.disconnectedCallback(),window.removeEventListener("keydown",this._onKey)}_close(){this.dispatchEvent(new CustomEvent("closed")),this.remove()}updated(){this.target!=="bill"&&this.hass&&this._loadedFor!==this._granularity&&this._load()}async _load(){let t=this._granularity;this._loadedFor=t;try{this._stats=await this.hass.callWS({type:"consumi_elettrici/stats",entry_id:this.info.entry_id,granularity:t,count:t==="day"?30:12})}catch{this._stats=null}}_source(){let t=this.info;if(this.target===w)return{data:t.meter,name:"Tutta la casa",icon:"mdi:home-lightning-bolt-outline",entity:t.meter.power_entities[0]??t.meter.energy_entities[0]??null};if(this.target===N)return{data:t.unmonitored,name:"Non monitorato",icon:"mdi:help-circle-outline",entity:null};let s=t.consumers.find(i=>i.key===this.target)??t.consumers[0];return{data:s,name:s.name,icon:s.icon,entity:s.power_entity??s.energy_entity}}_renderSource(){let{data:t,name:s,icon:i,entity:n}=this._source(),r=["today","week","month","year"],a={today:"Oggi",week:"Settimana",month:"Mese",year:"Anno"},l=this._stats?.series[this.target],d=this.target===w?this.info.meter.bands.month:void 0,f=d?d.reduce((m,c)=>m+c,0):0,u=this.info.consumers.find(m=>m.key===this.target),b=u?this.info.consumers.filter(m=>at(this.info,u.key).includes(m.key)):[];return p`
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
              <div class="value">${v(t.periods[m].k)}</div>
              <div class="cost">${$(t.periods[m].c)}</div>
              <div class="prev">${J[m].label}: ${v(t.periods[J[m].period].k)}</div>
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
    `}_renderBill(){let t=this.info.bill,s=[{id:"month",label:X(this.info.now)},{id:"last_month",label:X(this.info.now,-1)},{id:"year",label:"Anno"}],i=t[this._billPeriod],n=i?[["Energia",i.energia],["Trasporto e contatore",i.trasporto],["Oneri di sistema",i.oneri],["Accise",i.accise],["IVA",i.iva]]:[];return p`
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
        ${this._billPeriod==="month"&&t.forecast?p`<p class="note">A questo ritmo il mese chiude a circa <b>${$(t.forecast.totale)}</b> (${A(t.forecast.kwh,0)} kWh).</p>`:h}
        <p class="note">Stima fatta con le voci inserite nelle opzioni dell'integrazione: le quote fisse contano per un mese intero${this._billPeriod==="year"?" per ogni mese iniziato":""}.</p>
      </div>
    `}render(){return this.info?p`<div class="backdrop" @click=${t=>t.target===t.currentTarget&&this._close()}>
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
  `}};g([_({attribute:!1})],k.prototype,"hass",2),g([_({attribute:!1})],k.prototype,"info",2),g([_()],k.prototype,"target",2),g([_()],k.prototype,"color",2),g([_({attribute:!1})],k.prototype,"power",2),g([_({attribute:!1})],k.prototype,"moreInfo",2),g([x()],k.prototype,"_granularity",2),g([x()],k.prototype,"_stats",2),g([x()],k.prototype,"_billPeriod",2);customElements.get("consumi-detail-dialog")||customElements.define("consumi-detail-dialog",k);var Ee=3e4,Ce=5*6e4,S=class extends y{constructor(){super(...arguments);this._config={type:"custom:consumi-elettrici-card"};this._info=null;this._stats=null;this._error="";this._tab="now";this._expanded=!1;this._infoAt=0;this._statsAt=0;this._statsFor="";this._loading=!1;this._loadingStats=!1}setConfig(t){this._config={...t},this._tab=t.default_tab&&L.some(s=>s.id===t.default_tab)?t.default_tab:"now",this._info=null,this._infoAt=0}getCardSize(){let t=this._config.max_rows&&this._config.max_rows>0?this._config.max_rows:(this._info?.consumers.length??4)+1;return Qt(t,this._config.show_chart!==!1,this._config.show_bill!==!1&&!!this._info?.bill.enabled,this._config.header!==!1)}getGridOptions(){return{columns:12,rows:"auto",min_columns:6,min_rows:3}}static getStubConfig(){return{type:"custom:consumi-elettrici-card"}}static getConfigElement(){return document.createElement("consumi-elettrici-card-editor")}connectedCallback(){super.connectedCallback(),this._timer=window.setInterval(()=>this.requestUpdate(),1e4)}disconnectedCallback(){super.disconnectedCallback(),this._timer&&window.clearInterval(this._timer)}updated(){if(!this.hass)return;let t=Date.now();if(!this._loading&&t-this._infoAt>Ee&&this._loadInfo(),this._info&&this._tab!=="now"&&this._config.show_chart!==!1){let s=Jt(this._tab),i=`${s.granularity}:${s.count}`;!this._loadingStats&&(this._statsFor!==i||t-this._statsAt>Ce)&&this._loadStats(i,s)}this._dialog?.isConnected&&this._info&&(this._dialog.hass=this.hass,this._dialog.info=this._info,this._dialog.power=this._powerOf(this._dialog.target))}_message(t){return t instanceof Error?t.message:t?.message??String(t)}async _loadInfo(){this._loading=!0;try{let t={type:"consumi_elettrici/info"};this._config.entry_id&&(t.entry_id=this._config.entry_id),this._info=await this.hass.callWS(t),this._error=""}catch(t){this._error=`Consumi elettrici non \xE8 configurato o l'integrazione non \xE8 caricata (${this._message(t)}).`}finally{this._infoAt=Date.now(),this._loading=!1}}async _loadStats(t,s){this._loadingStats=!0;try{this._stats=await this.hass.callWS({type:"consumi_elettrici/stats",entry_id:this._info?.entry_id,...s})}catch{this._stats=null}finally{this._statsFor=t,this._statsAt=Date.now(),this._loadingStats=!1}}get _dark(){return!!this.hass?.themes?.darkMode}_powerOf(t){if(!this._info||t==="bill")return null;let s=kt(this._info,this.hass.states);return t===w?s.meter:t===N?s.unmonitored:s.consumers[t]??null}_colorOf(t){let s=this._info?.consumers.findIndex(i=>i.key===t)??-1;return t===w?this._dark?"#3987e5":"#2a78d6":t===N?this._dark?"#8d8d88":"#8a8a86":wt(s,this._dark)}_open(t){if(!this._info)return;this._dialog?.remove();let s=document.createElement("consumi-detail-dialog");s.hass=this.hass,s.info=this._info,s.target=t,s.color=this._colorOf(t),s.power=this._powerOf(t),s.moreInfo=i=>this.dispatchEvent(new CustomEvent("hass-more-info",{detail:{entityId:i},bubbles:!0,composed:!0})),s.addEventListener("closed",()=>this._dialog=void 0),document.body.appendChild(s),this._dialog=s}_setTab(t){this._tab=t,this._expanded=!1}_row(t,s){let i=s&&(t.value??0)<1,n=s?t.value===null?"Senza sensore di potenza":t.outside?"Fuori dal contatore":i?"Fermo":`${$t(t.share)} del totale`:[$(t.cost),t.outside?"fuori dal contatore":$t(t.share)].filter(Boolean).join(" \xB7 ");return p`<button class="row ${i?"idle":""}" @click=${()=>this._open(t.key)}>
      <span class="shape" style="background:${rt(t.color,t.kind==="unmonitored"?.35:.2)};color:${t.kind==="unmonitored"?"var(--secondary-text-color)":t.color}"><ha-icon .icon=${t.icon}></ha-icon></span>
      <span class="main">
        <span class="top"><span class="name">${t.name}</span><span class="value">${s?F(t.value):v(t.value)}</span></span>
        <span class="secondary">${n}</span>
        <span class="track"><span class="fill ${t.kind==="unmonitored"?"hatched":""}" style="width:${t.bar*100}%;background-color:${t.color}"></span></span>
      </span>
    </button>`}render(){if(!this.hass)return h;let t=this._info;if(!t)return p`<ha-card><div class="pad msg">${this._error||"Carico i consumi\u2026"}</div></ha-card>`;let s=this._config,i=this._tab==="now",n=kt(t,this.hass.states),r=At(t,this._tab,n,this._dark,s,this._expanded),a=At(t,this._tab,n,this._dark).rows,l=Gt(a),d=Yt(n.meter,t.contract_kw,t.available_kw,t.overload),f=i?null:t.meter.periods[this._tab],u=i?null:J[this._tab],b=!i&&s.show_bands!==!1?t.meter.bands[this._tab]:void 0,m=this._stats?.series[w];return p`<ha-card>
      ${s.header!==!1?p`<div class="header">
            <span class="shape accent"><ha-icon icon="mdi:lightning-bolt"></ha-icon></span>
            <span class="htitle">${s.title||"Consumi elettrici"}</span>
            <span class="chip" title="Fascia oraria e prezzo dell'energia"><b>F${t.tariff.band}</b>${Vt(t.tariff.price)}</span>
          </div>`:h}

      <button class="hero" @click=${()=>this._open(w)} aria-label="Dettaglio di tutta la casa">
        ${i?p`<span class="big">${F(n.meter)}</span><span class="sub">in questo momento</span>`:p`<span class="big">${v(f.k)}</span><span class="sub">${$(f.c)}<span class="dot">·</span>${u.label.toLowerCase()} ${v(t.meter.periods[u.period].k)}</span>`}
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
        ${t.consumers.length===0?p`<div class="msg">Nessun consumatore: aggiungili da Impostazioni → Dispositivi e servizi → Consumi elettrici.</div>`:r.rows.map(c=>this._row(c,i))}
        ${r.hidden>0||this._expanded?p`<button class="more" @click=${()=>this._expanded=!this._expanded}>${this._expanded?"Mostra meno":`Mostra tutti (${r.hidden} in pi\xF9)`}</button>`:h}
      </div>

      ${b&&b.some(c=>c>0)?p`<div class="bands">${b.map((c,U)=>p`<span><b>F${U+1}</b>${v(c)}</span>`)}</div>`:h}

      ${!i&&s.show_chart!==!1?p`<div class="block">
            <div class="btitle">${this._tab==="year"?"Ultimi 12 mesi":this._tab==="month"?"Ultimi 30 giorni":"Ultimi 14 giorni"}</div>
            ${m&&this._stats?p`<consumi-bars .labels=${this._stats.labels} .values=${m.k} .costs=${m.c} .color=${this._colorOf(w)}></consumi-bars>`:p`<div class="msg">Carico…</div>`}
          </div>`:h}

      ${s.show_bill!==!1&&t.bill.enabled&&t.bill.month?p`<button class="bill" @click=${()=>this._open("bill")}>
            <span class="shape neutral"><ha-icon icon="mdi:receipt-text-outline"></ha-icon></span>
            <span class="main">
              <span class="top"><span class="name">Bolletta stimata di ${X(t.now)}</span><span class="value">${$(t.bill.month.totale)}</span></span>
              <span class="secondary">${t.bill.forecast?`A questo ritmo ${$(t.bill.forecast.totale)} a fine mese`:""}</span>
            </span>
          </button>`:h}
    </ha-card>`}static{this.styles=E`
    :host { display: block; }
    ha-card { padding: 12px; display: flex; flex-direction: column; gap: 12px; overflow: hidden; color: var(--primary-text-color, #212121); }
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
