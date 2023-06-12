"use strict";(self.webpackChunkdocs=self.webpackChunkdocs||[]).push([[1021],{5318:(e,t,n)=>{n.d(t,{Zo:()=>c,kt:()=>m});var r=n(7378);function i(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function a(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function o(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?a(Object(n),!0).forEach((function(t){i(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):a(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function l(e,t){if(null==e)return{};var n,r,i=function(e,t){if(null==e)return{};var n,r,i={},a=Object.keys(e);for(r=0;r<a.length;r++)n=a[r],t.indexOf(n)>=0||(i[n]=e[n]);return i}(e,t);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);for(r=0;r<a.length;r++)n=a[r],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(i[n]=e[n])}return i}var u=r.createContext({}),s=function(e){var t=r.useContext(u),n=t;return e&&(n="function"==typeof e?e(t):o(o({},t),e)),n},c=function(e){var t=s(e.components);return r.createElement(u.Provider,{value:t},e.children)},p={inlineCode:"code",wrapper:function(e){var t=e.children;return r.createElement(r.Fragment,{},t)}},k=r.forwardRef((function(e,t){var n=e.components,i=e.mdxType,a=e.originalType,u=e.parentName,c=l(e,["components","mdxType","originalType","parentName"]),k=s(n),m=i,b=k["".concat(u,".").concat(m)]||k[m]||p[m]||a;return n?r.createElement(b,o(o({ref:t},c),{},{components:n})):r.createElement(b,o({ref:t},c))}));function m(e,t){var n=arguments,i=t&&t.mdxType;if("string"==typeof e||i){var a=n.length,o=new Array(a);o[0]=k;var l={};for(var u in t)hasOwnProperty.call(t,u)&&(l[u]=t[u]);l.originalType=e,l.mdxType="string"==typeof e?e:i,o[1]=l;for(var s=2;s<a;s++)o[s]=n[s];return r.createElement.apply(null,o)}return r.createElement.apply(null,n)}k.displayName="MDXCreateElement"},569:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>u,contentTitle:()=>o,default:()=>p,frontMatter:()=>a,metadata:()=>l,toc:()=>s});var r=n(5773),i=(n(7378),n(5318));const a={sidebar_position:4,title:"Creating a Minikube cluster",description:"Creating a local Minikube-powered Kubernetes cluster.",keywords:["podman desktop","podman","containers","migrating","kubernetes","minikube"],tags:["migrating-to-kubernetes","minikube"]},o="Creating a local Minikube-powered Kubernetes cluster",l={unversionedId:"kubernetes/minikube/creating-a-minikube-cluster",id:"kubernetes/minikube/creating-a-minikube-cluster",title:"Creating a Minikube cluster",description:"Creating a local Minikube-powered Kubernetes cluster.",source:"@site/docs/kubernetes/minikube/creating-a-minikube-cluster.md",sourceDirName:"kubernetes/minikube",slug:"/kubernetes/minikube/creating-a-minikube-cluster",permalink:"/docs/kubernetes/minikube/creating-a-minikube-cluster",draft:!1,editUrl:"https://github.com/containers/podman-desktop/tree/main/website/docs/kubernetes/minikube/creating-a-minikube-cluster.md",tags:[{label:"migrating-to-kubernetes",permalink:"/docs/tags/migrating-to-kubernetes"},{label:"minikube",permalink:"/docs/tags/minikube"}],version:"current",sidebarPosition:4,frontMatter:{sidebar_position:4,title:"Creating a Minikube cluster",description:"Creating a local Minikube-powered Kubernetes cluster.",keywords:["podman desktop","podman","containers","migrating","kubernetes","minikube"],tags:["migrating-to-kubernetes","minikube"]},sidebar:"mySidebar",previous:{title:"Configuring Podman for Minikube",permalink:"/docs/kubernetes/minikube/configuring-podman-for-minikube-on-windows"},next:{title:"Working with your Minikube cluster",permalink:"/docs/kubernetes/minikube/working-with-your-local-minikube-cluster"}},u={},s=[{value:"Prerequisites",id:"prerequisites",level:4},{value:"Procedure",id:"procedure",level:4},{value:"Verification",id:"verification",level:4}],c={toc:s};function p(e){let{components:t,...n}=e;return(0,i.kt)("wrapper",(0,r.Z)({},c,n,{components:t,mdxType:"MDXLayout"}),(0,i.kt)("h1",{id:"creating-a-local-minikube-powered-kubernetes-cluster"},"Creating a local Minikube-powered Kubernetes cluster"),(0,i.kt)("p",null,"You can create multiple local Minikube-powered Kubernetes clusters."),(0,i.kt)("h4",{id:"prerequisites"},"Prerequisites"),(0,i.kt)("ul",null,(0,i.kt)("li",{parentName:"ul"},(0,i.kt)("a",{parentName:"li",href:"installing-minikube"},"You installed Minikube"),"."),(0,i.kt)("li",{parentName:"ul"},(0,i.kt)("a",{parentName:"li",href:"configuring-podman-for-minikube-on-windows"},"On Windows, you configured Podman"),".")),(0,i.kt)("h4",{id:"procedure"},"Procedure"),(0,i.kt)("ol",null,(0,i.kt)("li",{parentName:"ol"},(0,i.kt)("p",{parentName:"li"},"Go to ",(0,i.kt)("strong",{parentName:"p"},(0,i.kt)("icon",{icon:"fa-solid fa-cog",size:"lg"})," Settings > Resources"))),(0,i.kt)("li",{parentName:"ol"},(0,i.kt)("p",{parentName:"li"},"In the Minikube tile, click on the ",(0,i.kt)("strong",{parentName:"p"},"Create new ...")," button.")),(0,i.kt)("li",{parentName:"ol"},(0,i.kt)("p",{parentName:"li"},"Choose your options, and click the ",(0,i.kt)("strong",{parentName:"p"},"Create")," button."),(0,i.kt)("p",{parentName:"li"},"The defaults are:"),(0,i.kt)("ul",{parentName:"li"},(0,i.kt)("li",{parentName:"ul"},"Name: ",(0,i.kt)("inlineCode",{parentName:"li"},"minikube")),(0,i.kt)("li",{parentName:"ul"},"Driver: ",(0,i.kt)("inlineCode",{parentName:"li"},"podman")),(0,i.kt)("li",{parentName:"ul"},"Container runtime: ",(0,i.kt)("inlineCode",{parentName:"li"},"cri-o")))),(0,i.kt)("li",{parentName:"ol"},(0,i.kt)("p",{parentName:"li"},"(Optionally) Click the ",(0,i.kt)("strong",{parentName:"p"},"Show logs")," button to display the logs.")),(0,i.kt)("li",{parentName:"ol"},(0,i.kt)("p",{parentName:"li"},"After successful creation, click on the ",(0,i.kt)("strong",{parentName:"p"},"Go back to resources")," button"))),(0,i.kt)("h4",{id:"verification"},"Verification"),(0,i.kt)("ol",null,(0,i.kt)("li",{parentName:"ol"},"In ",(0,i.kt)("strong",{parentName:"li"},(0,i.kt)("icon",{icon:"fa-solid fa-cog",size:"lg"})," Settings > Resources"),", in the ",(0,i.kt)("strong",{parentName:"li"},"Minikube")," tile, your ",(0,i.kt)("inlineCode",{parentName:"li"},"<minikube>")," instance is running."),(0,i.kt)("li",{parentName:"ol"},"In the Podman Desktop tray, open the ",(0,i.kt)("strong",{parentName:"li"},"Kubernetes")," menu, you can set the context to your Minikube cluster: ",(0,i.kt)("inlineCode",{parentName:"li"},"minikube"),".")))}p.isMDXComponent=!0}}]);