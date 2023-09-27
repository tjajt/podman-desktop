"use strict";(self.webpackChunkdocs=self.webpackChunkdocs||[]).push([[7239],{35318:(e,t,n)=>{n.d(t,{Zo:()=>d,kt:()=>b});var r=n(27378);function o(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function a(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function i(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?a(Object(n),!0).forEach((function(t){o(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):a(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function s(e,t){if(null==e)return{};var n,r,o=function(e,t){if(null==e)return{};var n,r,o={},a=Object.keys(e);for(r=0;r<a.length;r++)n=a[r],t.indexOf(n)>=0||(o[n]=e[n]);return o}(e,t);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);for(r=0;r<a.length;r++)n=a[r],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(o[n]=e[n])}return o}var l=r.createContext({}),u=function(e){var t=r.useContext(l),n=t;return e&&(n="function"==typeof e?e(t):i(i({},t),e)),n},d=function(e){var t=u(e.components);return r.createElement(l.Provider,{value:t},e.children)},p={inlineCode:"code",wrapper:function(e){var t=e.children;return r.createElement(r.Fragment,{},t)}},c=r.forwardRef((function(e,t){var n=e.components,o=e.mdxType,a=e.originalType,l=e.parentName,d=s(e,["components","mdxType","originalType","parentName"]),c=u(n),b=o,k=c["".concat(l,".").concat(b)]||c[b]||p[b]||a;return n?r.createElement(k,i(i({ref:t},d),{},{components:n})):r.createElement(k,i({ref:t},d))}));function b(e,t){var n=arguments,o=t&&t.mdxType;if("string"==typeof e||o){var a=n.length,i=new Array(a);i[0]=c;var s={};for(var l in t)hasOwnProperty.call(t,l)&&(s[l]=t[l]);s.originalType=e,s.mdxType="string"==typeof e?e:o,i[1]=s;for(var u=2;u<a;u++)i[u]=n[u];return r.createElement.apply(null,i)}return r.createElement.apply(null,n)}c.displayName="MDXCreateElement"},83385:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>l,contentTitle:()=>i,default:()=>p,frontMatter:()=>a,metadata:()=>s,toc:()=>u});var r=n(25773),o=(n(27378),n(35318));const a={sidebar_position:3,title:"Kubernetes",description:"To run Kubernetes workloads with Kubernetes, set up at least one Kubernetes context.",tags:["podman-desktop","onboarding"],keywords:["podman desktop","kubernetes","onboarding"]},i="Onboarding for Kubernetes workloads",s={unversionedId:"onboarding/kubernetes/index",id:"onboarding/kubernetes/index",title:"Kubernetes",description:"To run Kubernetes workloads with Kubernetes, set up at least one Kubernetes context.",source:"@site/docs/onboarding/kubernetes/index.md",sourceDirName:"onboarding/kubernetes",slug:"/onboarding/kubernetes/",permalink:"/docs/onboarding/kubernetes/",draft:!1,editUrl:"https://github.com/containers/podman-desktop/tree/main/website/docs/onboarding/kubernetes/index.md",tags:[{label:"podman-desktop",permalink:"/docs/tags/podman-desktop"},{label:"onboarding",permalink:"/docs/tags/onboarding"}],version:"current",sidebarPosition:3,frontMatter:{sidebar_position:3,title:"Kubernetes",description:"To run Kubernetes workloads with Kubernetes, set up at least one Kubernetes context.",tags:["podman-desktop","onboarding"],keywords:["podman desktop","kubernetes","onboarding"]},sidebar:"mySidebar",previous:{title:"Custom Lima instance",permalink:"/docs/onboarding/containers/creating-a-lima-instance-with-podman-desktop"},next:{title:"Developer Sandbox",permalink:"/docs/onboarding/kubernetes/developer-sandbox/"}},l={},u=[{value:"Procedure",id:"procedure",level:4},{value:"Next steps",id:"next-steps",level:4}],d={toc:u};function p(e){let{components:t,...n}=e;return(0,o.kt)("wrapper",(0,r.Z)({},d,n,{components:t,mdxType:"MDXLayout"}),(0,o.kt)("h1",{id:"onboarding-for-kubernetes-workloads"},"Onboarding for Kubernetes workloads"),(0,o.kt)("p",null,"To run Kubernetes workloads, set up at least one Kubernetes context."),(0,o.kt)("p",null,"Podman Desktop does not automatically set up Kubernetes resources that you might not need."),(0,o.kt)("h4",{id:"procedure"},"Procedure"),(0,o.kt)("ul",null,(0,o.kt)("li",{parentName:"ul"},(0,o.kt)("p",{parentName:"li"},"Setup at least one Kubernetes context:"),(0,o.kt)("ul",{parentName:"li"},(0,o.kt)("li",{parentName:"ul"},(0,o.kt)("a",{parentName:"li",href:"/docs/onboarding/kubernetes/developer-sandbox"},"Red Hat Developer Sandbox")),(0,o.kt)("li",{parentName:"ul"},(0,o.kt)("a",{parentName:"li",href:"/docs/onboarding/kubernetes/existing-kubernetes"},"Existing Kubernetes")),(0,o.kt)("li",{parentName:"ul"},(0,o.kt)("a",{parentName:"li",href:"/docs/onboarding/kubernetes/kind"},"Kind")),(0,o.kt)("li",{parentName:"ul"},(0,o.kt)("a",{parentName:"li",href:"/docs/onboarding/kubernetes/lima"},"Lima")),(0,o.kt)("li",{parentName:"ul"},(0,o.kt)("a",{parentName:"li",href:"/docs/onboarding/kubernetes/minikube"},"Minikube")),(0,o.kt)("li",{parentName:"ul"},(0,o.kt)("a",{parentName:"li",href:"/docs/onboarding/kubernetes/openshift-local"},"Red Hat OpenShift Local"))))),(0,o.kt)("h4",{id:"next-steps"},"Next steps"),(0,o.kt)("ol",null,(0,o.kt)("li",{parentName:"ol"},(0,o.kt)("a",{parentName:"li",href:"/docs/kubernetes/viewing-and-selecting-current-kubernete-context"},"Select the current Kubernetes context based on your Kube config"),"."),(0,o.kt)("li",{parentName:"ol"},(0,o.kt)("a",{parentName:"li",href:"/docs/kubernetes"},"Migrate containers to Kubernetes"),".")))}p.isMDXComponent=!0}}]);