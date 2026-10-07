(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const s of document.querySelectorAll('link[rel="modulepreload"]'))a(s);new MutationObserver(s=>{for(const n of s)if(n.type==="childList")for(const r of n.addedNodes)r.tagName==="LINK"&&r.rel==="modulepreload"&&a(r)}).observe(document,{childList:!0,subtree:!0});function t(s){const n={};return s.integrity&&(n.integrity=s.integrity),s.referrerPolicy&&(n.referrerPolicy=s.referrerPolicy),s.crossOrigin==="use-credentials"?n.credentials="include":s.crossOrigin==="anonymous"?n.credentials="omit":n.credentials="same-origin",n}function a(s){if(s.ep)return;s.ep=!0;const n=t(s);fetch(s.href,n)}})();const Y="modulepreload",W=function(i){return"/"+i},C={},A=function(e,t,a){let s=Promise.resolve();if(t&&t.length>0){document.getElementsByTagName("link");const r=document.querySelector("meta[property=csp-nonce]"),o=(r==null?void 0:r.nonce)||(r==null?void 0:r.getAttribute("nonce"));s=Promise.allSettled(t.map(l=>{if(l=W(l),l in C)return;C[l]=!0;const d=l.endsWith(".css"),_=d?'[rel="stylesheet"]':"";if(document.querySelector(`link[href="${l}"]${_}`))return;const u=document.createElement("link");if(u.rel=d?"stylesheet":Y,d||(u.as="script"),u.crossOrigin="",u.href=l,o&&u.setAttribute("nonce",o),document.head.appendChild(u),d)return new Promise((w,G)=>{u.addEventListener("load",w),u.addEventListener("error",()=>G(new Error(`Unable to preload CSS for ${l}`)))})}))}function n(r){const o=new Event("vite:preloadError",{cancelable:!0});if(o.payload=r,window.dispatchEvent(o),!o.defaultPrevented)throw r}return s.then(r=>{for(const o of r||[])o.status==="rejected"&&n(o.reason);return e().catch(n)})},K=(i,e,t)=>{const a=i[e];return a?typeof a=="function"?a():Promise.resolve(a):new Promise((s,n)=>{(typeof queueMicrotask=="function"?queueMicrotask:setTimeout)(n.bind(null,new Error("Unknown variable dynamic import: "+e+(e.split("/").length!==t?". Note that variables only represent file names one level deep.":""))))})},J=[{href:"/",label:"Home"},{href:"/about",label:"About"},{href:"/training",label:"Training"},{href:"/achievements",label:"Achievements"},{href:"/facilities",label:"Facilities"},{href:"/coaches",label:"Coaches"},{href:"/gallery",label:"Gallery"},{href:"/contact",label:"Contact"}],X=[{label:"Pay & Play",variant:"secondary",href:"/pay-play"},{label:"Register Now",variant:"primary",href:"/register"}];class Q{constructor(e,t={}){this.container=e,this.options={currentPath:t.currentPath||"/",...t},this.isScrolled=!1,this.isMobileOpen=!1,this.init()}init(){this.render(),this.bindElements(),this.bindEvents(),this.setActiveLink(this.options.currentPath)}render(){const e=`
      <a href="/" class="navbar__brand" aria-label="Matsya Shooting Sports Academy - Home">
        <img src="/assets/shooting-logo.jpeg" alt="" class="navbar__logo" loading="lazy">
        <div class="navbar__brand-text">
          <span class="navbar__brand-name">MATSYA</span>
          <span class="navbar__brand-tagline">SHOOTING SPORTS ACADEMY</span>
        </div>
      </a>
    `,t=J.map(s=>`
      <li>
        <a href="${s.href}" class="navbar__link">${s.label}</a>
      </li>
    `).join(""),a=X.map(s=>`
      <a href="${s.href}" class="btn btn--${s.variant} navbar__btn">${s.label}</a>
    `).join("");this.container.innerHTML=`
      <nav class="navbar" role="navigation" aria-label="Main navigation">
        <div class="container navbar__container">
          ${e}
          <ul class="navbar__nav" id="navbar-nav">
            ${t}
            <li class="navbar__actions">${a}</li>
          </ul>
          <button class="navbar__mobile-toggle" aria-expanded="false" aria-controls="navbar-nav" aria-label="Toggle navigation menu">
            <span class="navbar__mobile-toggle-icon" aria-hidden="true"></span>
          </button>
        </div>
      </nav>
    `}bindElements(){this.navbarEl=this.container.querySelector(".navbar"),this.navEl=this.container.querySelector(".navbar__nav"),this.toggleBtn=this.container.querySelector(".navbar__mobile-toggle"),this.navLinks=this.container.querySelectorAll(".navbar__link")}bindEvents(){this.handleScroll=this.handleScroll.bind(this),this.handleToggleClick=this.handleToggleClick.bind(this),this.handleNavLinkClick=this.handleNavLinkClick.bind(this),this.handleKeydown=this.handleKeydown.bind(this),this.handleResize=this.handleResize.bind(this),window.addEventListener("scroll",this.handleScroll,{passive:!0}),this.toggleBtn.addEventListener("click",this.handleToggleClick),this.navLinks.forEach(e=>e.addEventListener("click",this.handleNavLinkClick)),document.addEventListener("keydown",this.handleKeydown),window.addEventListener("resize",this.handleResize)}handleScroll(){const e=window.scrollY>20;e!==this.isScrolled&&(this.isScrolled=e,this.navbarEl.classList.toggle("navbar--scrolled",e))}handleToggleClick(){this.isMobileOpen=!this.isMobileOpen,this.navEl.classList.toggle("navbar__nav--open",this.isMobileOpen),this.toggleBtn.setAttribute("aria-expanded",this.isMobileOpen),document.body.style.overflow=this.isMobileOpen?"hidden":""}handleNavLinkClick(){this.isMobileOpen&&this.closeMobileMenu()}handleKeydown(e){e.key==="Escape"&&this.isMobileOpen&&(this.closeMobileMenu(),this.toggleBtn.focus())}handleResize(){window.innerWidth>768&&this.isMobileOpen&&this.closeMobileMenu()}closeMobileMenu(){this.isMobileOpen=!1,this.navEl.classList.remove("navbar__nav--open"),this.toggleBtn.setAttribute("aria-expanded","false"),document.body.style.overflow=""}setActiveLink(e){this.navLinks.forEach(t=>{const a=t.getAttribute("href")===e;t.classList.toggle("navbar__link--active",a),a?t.setAttribute("aria-current","page"):t.removeAttribute("aria-current")})}updateCurrentPath(e){this.options.currentPath=e,this.setActiveLink(e)}destroy(){window.removeEventListener("scroll",this.handleScroll),this.toggleBtn.removeEventListener("click",this.handleToggleClick),this.navLinks.forEach(e=>e.removeEventListener("click",this.handleNavLinkClick)),document.removeEventListener("keydown",this.handleKeydown),window.removeEventListener("resize",this.handleResize),this.container.innerHTML=""}}function Z(i,e){return new Q(i,e)}class ee{constructor(e,t={}){this.container=e,this.options={intervalMin:t.intervalMin??2500,intervalMax:t.intervalMax??4e3,displayDuration:t.displayDuration??1200,...t},this.currentScore=null,this.timerId=null,this.isAnimating=!1,this.prefersReducedMotion=window.matchMedia("(prefers-reduced-motion: reduce)").matches,this.ringConfig={10:{ring:10,radius:0,cx:.5,cy:.5,maxOffset:.03},9:{ring:9,radius:.075,cx:.5,cy:.5,maxOffset:.02},8:{ring:8,radius:.125,cx:.5,cy:.5,maxOffset:.02}},this.init()}init(){this.render(),this.bindElements(),this.startAnimation(),this.setupReducedMotionListener()}render(){this.container.innerHTML=`
      <div class="shooting-target" role="img" aria-label="Shooting target with animated scoring">
        <svg class="shooting-target__svg" viewBox="0 0 500 500" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="targetGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stop-color="var(--color-emerald)" stop-opacity="0.1"/>
              <stop offset="100%" stop-color="var(--color-deep-charcoal)" stop-opacity="1"/>
            </radialGradient>
          </defs>
          
          <circle class="shooting-target__ring shooting-target__ring--1" cx="250" cy="250" r="250"/>
          <circle class="shooting-target__ring shooting-target__ring--2" cx="250" cy="250" r="225"/>
          <circle class="shooting-target__ring shooting-target__ring--3" cx="250" cy="250" r="200"/>
          <circle class="shooting-target__ring shooting-target__ring--4" cx="250" cy="250" r="175"/>
          <circle class="shooting-target__ring shooting-target__ring--5" cx="250" cy="250" r="150"/>
          <circle class="shooting-target__ring shooting-target__ring--6" cx="250" cy="250" r="125"/>
          <circle class="shooting-target__ring shooting-target__ring--7" cx="250" cy="250" r="100"/>
          <circle class="shooting-target__ring shooting-target__ring--8" cx="250" cy="250" r="75"/>
          <circle class="shooting-target__ring shooting-target__ring--9" cx="250" cy="250" r="50"/>
          <circle class="shooting-target__ring shooting-target__ring--10" cx="250" cy="250" r="25"/>
          
          <g class="shooting-target__impacts" aria-hidden="true">
            <circle class="shooting-target__impact" cx="250" cy="250" r="3"/>
            <circle class="shooting-target__impact" cx="265" cy="242" r="2"/>
            <circle class="shooting-target__impact" cx="240" cy="258" r="1.5"/>
            <circle class="shooting-target__impact" cx="258" cy="268" r="2.5"/>
            <circle class="shooting-target__impact" cx="232" cy="238" r="1.5"/>
          </g>
          
          <text class="shooting-target__score shooting-target__score--10" x="250" y="250" aria-hidden="true">10</text>
          <text class="shooting-target__score shooting-target__score--9" x="250" y="250" aria-hidden="true">9</text>
          <text class="shooting-target__score shooting-target__score--8" x="250" y="250" aria-hidden="true">8</text>
        </svg>
      </div>
    `}bindElements(){this.targetEl=this.container.querySelector(".shooting-target"),this.svgEl=this.container.querySelector(".shooting-target__svg"),this.scoreElements={10:this.container.querySelector(".shooting-target__score--10"),9:this.container.querySelector(".shooting-target__score--9"),8:this.container.querySelector(".shooting-target__score--8")},this.impactElements=this.container.querySelectorAll(".shooting-target__impact")}setupReducedMotionListener(){window.matchMedia("(prefers-reduced-motion: reduce)").addEventListener("change",t=>{this.prefersReducedMotion=t.matches,this.prefersReducedMotion?this.stopAnimation():this.startAnimation()})}getRandomScore(){const e=[8,9,10],t=[.4,.35,.25],a=Math.random();let s=0;for(let n=0;n<t.length;n++)if(s+=t[n],a<s)return e[n];return 10}getRandomAngle(){return Math.random()*Math.PI*2}getPositionInRing(e){const t=this.ringConfig[e],a=this.getRandomAngle(),s=Math.random()*t.maxOffset;return{x:t.cx+Math.cos(a)*(t.radius+s),y:t.cy+Math.sin(a)*(t.radius+s)}}showScore(e){this.currentScore!==null&&this.hideScore(this.currentScore),this.currentScore=e;const t=this.scoreElements[e],a=this.getPositionInRing(e);t.setAttribute("x",a.x*500),t.setAttribute("y",a.y*500),t.classList.add("shooting-target__score--visible");const s=Math.floor(Math.random()*this.impactElements.length),n=this.impactElements[s];n.setAttribute("cx",a.x*500),n.setAttribute("cy",a.y*500),n.classList.add("shooting-target__impact--visible"),setTimeout(()=>{n.classList.remove("shooting-target__impact--visible")},300)}hideScore(e){this.scoreElements[e].classList.remove("shooting-target__score--visible")}animate(){if(this.prefersReducedMotion)return;const e=this.getRandomScore();this.showScore(e),setTimeout(()=>{this.currentScore===e&&(this.hideScore(e),this.currentScore=null),this.scheduleNext()},this.options.displayDuration)}scheduleNext(){if(this.prefersReducedMotion)return;const e=this.options.intervalMin+Math.random()*(this.options.intervalMax-this.options.intervalMin);this.timerId=setTimeout(()=>{this.animate()},e)}startAnimation(){this.isAnimating||this.prefersReducedMotion||(this.isAnimating=!0,this.animate())}stopAnimation(){this.isAnimating=!1,this.timerId&&(clearTimeout(this.timerId),this.timerId=null),this.currentScore!==null&&(this.hideScore(this.currentScore),this.currentScore=null)}destroy(){this.stopAnimation(),this.container.innerHTML=""}}function te(i,e){return new ee(i,e)}class ie{constructor(e,t={}){this.container=e,this.options=t,this.shootingTarget=null,this.init()}init(){this.render(),this.bindElements(),this.initShootingTarget()}render(){this.container.innerHTML=`
      <section class="hero" aria-labelledby="hero-headline">
        <div class="container hero__container">
          <div class="hero__content">
            <div class="hero__badge badge" aria-label="Location">
              <span>ALWAR</span>
              <span class="hero__badge-divider" aria-hidden="true"></span>
              <span>RAJASTHAN</span>
            </div>
            <h1 id="hero-headline" class="hero__headline">
              Precision.<br>
              Discipline.<br>
              <span class="hero__headline-accent">Excellence.</span>
            </h1>
            <p class="hero__description">
              A professional shooting sports academy focused on developing precision, discipline, confidence and performance.
            </p>
            <div class="hero__actions" role="group" aria-label="Primary actions">
              <button class="btn btn--primary btn--large" data-action="register">
                Register Now
              </button>
              <button class="btn btn--secondary btn--large" data-action="explore">
                Explore Academy
              </button>
            </div>
          </div>
          <div class="hero__visual" aria-hidden="true">
            <div class="hero__target-wrapper">
              <div class="hero__target-float" id="shooting-target"></div>
            </div>
          </div>
        </div>
      </section>
    `}bindElements(){this.targetContainer=this.container.querySelector("#shooting-target"),this.registerBtn=this.container.querySelector('[data-action="register"]'),this.exploreBtn=this.container.querySelector('[data-action="explore"]'),this.registerBtn.addEventListener("click",()=>this.handleAction("register")),this.exploreBtn.addEventListener("click",()=>this.handleAction("explore"))}initShootingTarget(){this.targetContainer&&(this.shootingTarget=te(this.targetContainer,{intervalMin:2500,intervalMax:4e3,displayDuration:1200}))}handleAction(e){const t=new CustomEvent("hero:action",{detail:{action:e},bubbles:!0});this.container.dispatchEvent(t)}destroy(){this.shootingTarget&&(this.shootingTarget.destroy(),this.shootingTarget=null),this.container.innerHTML=""}}function ae(i,e){return new ie(i,e)}const se=[{icon:'<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',text:"Alwar's first RRA-certified academy",muted:!1},{icon:'<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>',text:"10m",muted:!1},{icon:'<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>',text:"25m",muted:!1},{icon:'<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>',text:"50m",muted:!1}];class ne{constructor(e,t={}){this.container=e,this.options={items:t.items||se,...t},this.init()}init(){this.render()}render(){const e=this.options.items.map(t=>`
      <li class="highlights__item">
        <span class="highlights__icon" aria-hidden="true">${t.icon}</span>
        <span class="highlights__text ${t.muted?"highlights__text--muted":""}">${t.text}</span>
      </li>
    `).join("");this.container.innerHTML=`
      <section class="highlights" aria-label="Academy highlights">
        <div class="container">
          <ul class="highlights__list" role="list">${e}</ul>
        </div>
      </section>
    `}destroy(){this.container.innerHTML=""}}function re(i,e){return new ne(i,e)}const oe=[{icon:'<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>',title:"Precision",description:"Developing exact aim and consistent shot placement through structured methodology."},{icon:'<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>',title:"Discipline",description:"Building mental fortitude and routine that translates beyond the range."},{icon:'<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>',title:"Confidence",description:"Empowering shooters with self-belief through measurable progress and achievement."},{icon:'<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>',title:"Performance",description:"Optimizing competitive readiness through data-driven training and expert coaching."}],le='<svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>';class ce{constructor(e,t={}){this.container=e,this.options={features:t.features||oe,ctaLabel:t.ctaLabel||"Explore Academy",ctaHref:t.ctaHref||"#about",imageSrc:t.imageSrc||null,imageAlt:t.imageAlt||"Academy training facility",...t},this.init()}init(){this.render()}render(){const e=this.options.features.map(a=>`
      <div class="about-preview__feature">
        <span class="about-preview__feature-icon" aria-hidden="true">${a.icon}</span>
        <h3 class="about-preview__feature-title">${a.title}</h3>
        <p class="about-preview__feature-desc">${a.description}</p>
      </div>
    `).join(""),t=this.options.imageSrc?`<img src="${this.options.imageSrc}" alt="${this.options.imageAlt}" class="about-preview__image" loading="lazy">`:`
        <div class="about-preview__placeholder" role="img" aria-label="Academy facility placeholder">
          <span class="about-preview__placeholder-icon" aria-hidden="true">${le}</span>
          <span class="about-preview__placeholder-text">Academy Facility Image</span>
        </div>
      `;this.container.innerHTML=`
      <section class="about-preview section" aria-labelledby="about-preview-title">
        <div class="container">
          <div class="about-preview__grid">
            <div class="about-preview__content">
              <div class="section-heading" style="text-align: left; margin-bottom: var(--spacing-6);">
                <p class="section-heading__pretitle">About Us</p>
                <h2 id="about-preview-title" class="section-heading__title">Where <span class="section-heading__title-accent">Precision</span> Meets Passion</h2>
                <p class="section-heading__subtitle">Established as Alwar's first RRA-certified academy, we provide world-class training across 10m, 25m, and 50m ranges under the guidance of certified coaches.</p>
              </div>
              <div class="about-preview__features" role="list">${e}</div>
              <div class="about-preview__cta">
                <a href="${this.options.ctaHref}" class="btn btn--primary btn--large">${this.options.ctaLabel}</a>
              </div>
            </div>
            <div class="about-preview__visual">${t}</div>
          </div>
        </div>
      </section>
    `}destroy(){this.container.innerHTML=""}}function de(i,e){return new ce(i,e)}const he=[{distance:"10m",discipline:"Air Pistol / Air Rifle",description:"Olympic-standard 10m range with electronic target systems. Ideal for precision training and competition preparation.",features:["Electronic scoring targets","Climate-controlled environment","Precision training programs","Beginner to elite levels"],icon:'<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>'},{distance:"25m",discipline:"Sport Pistol / Standard Pistol",description:"Professional 25m range for rapid fire and precision events. Equipped for ISSF-standard competitions.",features:["Turning target systems","Rapid fire capability","Competition-grade lighting","Coaching bay available"],icon:'<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>'},{distance:"50m",discipline:"Free Pistol / Rifle 3 Positions",description:"Full-length 50m outdoor range for rifle and free pistol disciplines. Meets international competition standards.",features:["Outdoor range with wind flags","Rifle 3-positions capable","Free pistol discipline","Tournament ready"],icon:'<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>'}],pe='<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>';class ge{constructor(e,t={}){this.container=e,this.options={cards:t.cards||he,ctaLabel:t.ctaLabel||"View Training",ctaHref:t.ctaHref||"#training",...t},this.init()}init(){this.render()}render(){const e=this.options.cards.map(t=>`
      <article class="training-card">
        <span class="training-card__icon" aria-hidden="true">${t.icon}</span>
        <h3 class="training-card__distance">${t.distance}</h3>
        <p class="training-card__discipline">${t.discipline}</p>
        <p class="training-card__description">${t.description}</p>
        <ul class="training-card__features" role="list">
          ${t.features.map(a=>`
            <li class="training-card__feature">
              <span class="training-card__feature-icon" aria-hidden="true">${pe}</span>
              <span>${a}</span>
            </li>
          `).join("")}
        </ul>
        <a href="${this.options.ctaHref}#${t.distance.toLowerCase()}" class="btn btn--secondary training-card__cta">Learn More</a>
      </article>
    `).join("");this.container.innerHTML=`
      <section class="training-preview section" aria-labelledby="training-preview-title">
        <div class="container">
          <div class="training-preview__header">
            <div class="section-heading">
              <p class="section-heading__pretitle">Training Programs</p>
              <h2 id="training-preview-title" class="section-heading__title">Ranges for Every <span class="section-heading__title-accent">Discipline</span></h2>
              <p class="section-heading__subtitle">Three dedicated ranges meeting international standards — from beginner air gun to elite 50m competition.</p>
            </div>
          </div>
          <div class="training-preview__cards" role="list">${e}</div>
          <div class="training-preview__cta">
            <a href="${this.options.ctaHref}" class="btn btn--primary btn--large">${this.options.ctaLabel}</a>
          </div>
        </div>
      </section>
    `}destroy(){this.container.innerHTML=""}}function ue(i,e){return new ge(i,e)}const ve=[{name:"Aman Choudhary",role:"Head Coach",bio:"NRAI-certified coach with extensive experience training national-level shooters in pistol and rifle disciplines.",imageSrc:null,imageAlt:"Coach Aman Choudhary"},{name:"Chaman Choudhary",role:"Senior Coach",bio:"Experienced shooting instructor specializing in precision techniques and mental conditioning for competitive athletes.",imageSrc:null,imageAlt:"Coach Chaman Choudhary"}],me='<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M20 21a8 8 0 0 0-16 0"/></svg>';class _e{constructor(e,t={}){this.container=e,this.options={coaches:t.coaches||ve,ctaLabel:t.ctaLabel||"Meet Our Coaches",ctaHref:t.ctaHref||"#coaches",...t},this.init()}init(){this.render()}render(){const e=this.options.coaches.map(t=>`
      <article class="coach-card">
        ${t.imageSrc?`<img src="${t.imageSrc}" alt="${t.imageAlt}" class="coach-card__image" loading="lazy">`:`
            <div class="coach-card__placeholder" role="img" aria-label="${t.name} photo placeholder">
              <span class="coach-card__placeholder-icon" aria-hidden="true">${me}</span>
              <span class="coach-card__placeholder-text">Coach Photo</span>
            </div>
          `}
        <div class="coach-card__content">
          <h3 class="coach-card__name">${t.name}</h3>
          <p class="coach-card__role">${t.role}</p>
          <p class="coach-card__bio">${t.bio}</p>
        </div>
      </article>
    `).join("");this.container.innerHTML=`
      <section class="coaches-preview section" aria-labelledby="coaches-preview-title">
        <div class="container">
          <div class="coaches-preview__header">
            <div class="section-heading">
              <p class="section-heading__pretitle">Our Coaches</p>
              <h2 id="coaches-preview-title" class="section-heading__title">Expert Guidance from <span class="section-heading__title-accent">Certified Coaches</span></h2>
              <p class="section-heading__subtitle">Led by NRAI-certified professionals dedicated to developing champions at every level.</p>
            </div>
          </div>
          <div class="coaches-preview__grid" role="list">${e}</div>
          <div class="coaches-preview__cta">
            <a href="${this.options.ctaHref}" class="btn btn--primary btn--large">${this.options.ctaLabel}</a>
          </div>
        </div>
      </section>
    `}destroy(){this.container.innerHTML=""}}function fe(i,e){return new _e(i,e)}const ye=[{event:"State Championship",discipline:"10m Air Pistol",athlete:"[Athlete Name]",year:"2024",medal:"gold"},{event:"District Tournament",discipline:"25m Sport Pistol",athlete:"[Athlete Name]",year:"2024",medal:"silver"},{event:"Regional Meet",discipline:"50m Rifle 3P",athlete:"[Athlete Name]",year:"2023",medal:"bronze"}],x={gold:'<svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>',silver:'<svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>',bronze:'<svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>'};class be{constructor(e,t={}){this.container=e,this.options={achievements:t.achievements||[],ctaLabel:t.ctaLabel||"View Achievements",ctaHref:t.ctaHref||"#achievements",...t},this.init()}init(){this.render()}render(){const e=this.options.achievements.length>0?this.options.achievements:ye;this.options.achievements.length===0?this.container.innerHTML=`
        <section class="achievements-preview section" aria-labelledby="achievements-preview-title">
          <div class="container">
            <div class="achievements-preview__header">
              <div class="section-heading">
                <p class="section-heading__pretitle">Achievements</p>
                <h2 id="achievements-preview-title" class="section-heading__title">Celebrating <span class="section-heading__title-accent">Excellence</span></h2>
                <p class="section-heading__subtitle">Our shooters consistently podium at state, national, and international competitions.</p>
              </div>
            </div>
            <div class="achievements-preview__grid" role="list">
              ${e.map(a=>`
                <article class="achievement-card" data-placeholder="true">
                  <span class="achievement-card__medal" aria-hidden="true">${x[a.medal]||x.gold}</span>
                  <h3 class="achievement-card__event">${a.event}</h3>
                  <div class="achievement-card__details">
                    <span class="achievement-card__discipline">${a.discipline}</span>
                    <span class="achievement-card__athlete">${a.athlete}</span>
                    <span class="achievement-card__year">${a.year}</span>
                  </div>
                </article>
              `).join("")}
            </div>
            <div class="achievements-preview__cta">
              <a href="${this.options.ctaHref}" class="btn btn--primary btn--large">${this.options.ctaLabel}</a>
            </div>
          </div>
        </section>
      `:this.container.innerHTML=`
        <section class="achievements-preview section" aria-labelledby="achievements-preview-title">
          <div class="container">
            <div class="achievements-preview__header">
              <div class="section-heading">
                <p class="section-heading__pretitle">Achievements</p>
                <h2 id="achievements-preview-title" class="section-heading__title">Celebrating <span class="section-heading__title-accent">Excellence</span></h2>
                <p class="section-heading__subtitle">Our shooters consistently podium at state, national, and international competitions.</p>
              </div>
            </div>
            <div class="achievements-preview__grid" role="list">
              ${e.map(a=>`
                <article class="achievement-card">
                  <span class="achievement-card__medal" aria-hidden="true">${x[a.medal]||x.gold}</span>
                  <h3 class="achievement-card__event">${a.event}</h3>
                  <div class="achievement-card__details">
                    <span class="achievement-card__discipline">${a.discipline}</span>
                    <span class="achievement-card__athlete">${a.athlete}</span>
                    <span class="achievement-card__year">${a.year}</span>
                  </div>
                </article>
              `).join("")}
            </div>
            <div class="achievements-preview__cta">
              <a href="${this.options.ctaHref}" class="btn btn--primary btn--large">${this.options.ctaLabel}</a>
            </div>
          </div>
        </section>
      `}updateAchievements(e){this.options.achievements=e,this.render()}destroy(){this.container.innerHTML=""}}function we(i,e){return new be(i,e)}const xe=[{name:"10m Indoor Range",description:"Climate-controlled 10m range with electronic target systems (SIUS/MEGALINK). 20 firing points for air pistol and air rifle.",imageSrc:null,imageAlt:"10m indoor shooting range"},{name:"25m Range",description:"Professional 25m range with turning target systems for rapid fire and precision events. ISSF competition compliant.",imageSrc:null,imageAlt:"25m shooting range"},{name:"50m Outdoor Range",description:"Full-length 50m outdoor range with wind flags and target carriers. Supports rifle 3-positions and free pistol.",imageSrc:null,imageAlt:"50m outdoor shooting range"}],ke={"10m Indoor Range":'<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 9h6v6H9z"/><circle cx="12" cy="12" r="2"/></svg>',"25m Range":'<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>',"50m Outdoor Range":'<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>'};class Ae{constructor(e,t={}){this.container=e,this.options={facilities:t.facilities||xe,ctaLabel:t.ctaLabel||"View Facilities",ctaHref:t.ctaHref||"#facilities",...t},this.init()}init(){this.render()}render(){const e=this.options.facilities.map(t=>`
      <article class="facility-card">
        ${t.imageSrc?`<img src="${t.imageSrc}" alt="${t.imageAlt}" class="facility-card__image" loading="lazy">`:`
            <div class="facility-card__placeholder" role="img" aria-label="${t.name} placeholder">
              <span class="facility-card__placeholder-icon" aria-hidden="true">${ke[t.name]||""}</span>
              <span class="facility-card__placeholder-text">Facility Image</span>
            </div>
          `}
        <div class="facility-card__content">
          <h3 class="facility-card__name">${t.name}</h3>
          <p class="facility-card__desc">${t.description}</p>
        </div>
      </article>
    `).join("");this.container.innerHTML=`
      <section class="facilities-preview section" aria-labelledby="facilities-preview-title">
        <div class="container">
          <div class="facilities-preview__header">
            <div class="section-heading">
              <p class="section-heading__pretitle">Facilities</p>
              <h2 id="facilities-preview-title" class="section-heading__title">World-Class <span class="section-heading__title-accent">Infrastructure</span></h2>
              <p class="section-heading__subtitle">Three dedicated ranges meeting international standards, designed for training excellence.</p>
            </div>
          </div>
          <div class="facilities-preview__grid" role="list">${e}</div>
          <div class="facilities-preview__cta">
            <a href="${this.options.ctaHref}" class="btn btn--primary btn--large">${this.options.ctaLabel}</a>
          </div>
        </div>
      </section>
    `}updateFacilities(e){this.options.facilities=e,this.render()}destroy(){this.container.innerHTML=""}}function Se(i,e){return new Ae(i,e)}const Ce=[{category:"Training",title:"10m Range Session",imageSrc:null,imageAlt:"Shooter at 10m range",featured:!0},{category:"Competition",title:"State Championship 2024",imageSrc:null,imageAlt:"Competition event",featured:!1},{category:"Facilities",title:"25m Range View",imageSrc:null,imageAlt:"25m range interior",featured:!1},{category:"Team",title:"Coach with Athletes",imageSrc:null,imageAlt:"Coaching session",featured:!1},{category:"Training",title:"50m Outdoor Practice",imageSrc:null,imageAlt:"Outdoor range training",featured:!1},{category:"Events",title:"Annual Awards Ceremony",imageSrc:null,imageAlt:"Awards ceremony",featured:!1}],$e='<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>';class Le{constructor(e,t={}){this.container=e,this.options={items:t.items||Ce,ctaLabel:t.ctaLabel||"View Gallery",ctaHref:t.ctaHref||"#gallery",...t},this.init()}init(){this.render()}render(){const e=this.options.items.map((t,a)=>`
      <article class="gallery-item ${t.featured?"gallery-item--featured":""}" style="--item-index: ${a};">
        ${t.imageSrc?`<img src="${t.imageSrc}" alt="${t.imageAlt}" class="gallery-item__image" loading="lazy">`:`
            <div class="gallery-item__placeholder" role="img" aria-label="${t.title} placeholder">
              <span class="gallery-item__placeholder-icon" aria-hidden="true">${$e}</span>
              <span class="gallery-item__placeholder-text">Gallery Image</span>
            </div>
          `}
        <div class="gallery-item__overlay">
          <div class="gallery-item__info">
            <span class="gallery-item__category">${t.category}</span>
            <h3 class="gallery-item__title">${t.title}</h3>
          </div>
        </div>
      </article>
    `).join("");this.container.innerHTML=`
      <section class="gallery-preview section" aria-labelledby="gallery-preview-title">
        <div class="container">
          <div class="gallery-preview__header">
            <div class="section-heading">
              <p class="section-heading__pretitle">Gallery</p>
              <h2 id="gallery-preview-title" class="section-heading__title">Moments of <span class="section-heading__title-accent">Focus</span></h2>
              <p class="section-heading__subtitle">Training sessions, competitions, and the daily pursuit of excellence at our academy.</p>
            </div>
          </div>
          <div class="gallery-preview__grid" role="list">${e}</div>
          <div class="gallery-preview__cta">
            <a href="${this.options.ctaHref}" class="btn btn--primary btn--large">${this.options.ctaLabel}</a>
          </div>
        </div>
      </section>
    `}updateItems(e){this.options.items=e,this.render()}destroy(){this.container.innerHTML=""}}function Ee(i,e){return new Le(i,e)}const Me='<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',Te='<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M20 21a8 8 0 0 0-16 0"/></svg>',Re='<svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>',Pe=[{rating:5,text:"Exceptional coaching and world-class facilities. The 10m range is the best I've trained at in North India.",author:"Rajesh K.",role:"State-level Shooter",avatar:null},{rating:5,text:"Aman sir's attention to technique transformed my shooting. Went from district to state level in one season.",author:"Priya S.",role:"Junior Nationalist",avatar:null},{rating:5,text:"Professional environment with genuine focus on athlete development. The 50m range is competition-ready.",author:"Vikram M.",role:"Senior Rifle Coach",avatar:null}];class Ie{constructor(e,t={}){this.container=e,this.options={reviews:t.reviews||[],ctaLabel:t.ctaLabel||"Read All Reviews",ctaHref:t.ctaHref||"#reviews",...t},this.init()}init(){this.render()}render(){const e=this.options.reviews.length>0?this.options.reviews:Pe;if(this.options.reviews.length===0)this.container.innerHTML=`
        <section class="reviews section" aria-labelledby="reviews-title">
          <div class="container">
            <div class="reviews__header">
              <div class="section-heading">
                <p class="section-heading__pretitle">Reviews</p>
                <h2 id="reviews-title" class="section-heading__title">Trusted by <span class="section-heading__title-accent">Champions</span></h2>
                <p class="section-heading__subtitle">Hear from athletes who trained at Alwar's premier shooting academy.</p>
              </div>
            </div>
            <div class="reviews__grid" role="list">
              <div class="reviews__empty" role="status">
                <span class="reviews__empty-icon" aria-hidden="true">${Re}</span>
                <h3 class="reviews__empty-title">No Reviews Yet</h3>
                <p class="reviews__empty-desc">Authentic reviews from our athletes will appear here once submitted.</p>
              </div>
            </div>
            <div class="reviews__cta">
              <a href="${this.options.ctaHref}" class="btn btn--primary btn--large">${this.options.ctaLabel}</a>
            </div>
          </div>
        </section>
      `;else{const a=e.map(s=>`
        <article class="review-card" role="listitem">
          <div class="review-card__rating" aria-label="${s.rating} out of 5 stars">
            ${Me.repeat(s.rating)}
          </div>
          <p class="review-card__text">"${s.text}"</p>
          <div class="review-card__author">
            <div class="review-card__avatar" aria-hidden="true">
              ${s.avatar?`<img src="${s.avatar}" alt="" class="review-card__avatar-img">`:`<div class="review-card__avatar-placeholder"><span class="review-card__avatar-icon">${Te}</span></div>`}
            </div>
            <div>
              <span class="review-card__name">${s.author}</span>
              <span class="review-card__role">${s.role}</span>
            </div>
          </div>
        </article>
      `).join("");this.container.innerHTML=`
        <section class="reviews section" aria-labelledby="reviews-title">
          <div class="container">
            <div class="reviews__header">
              <div class="section-heading">
                <p class="section-heading__pretitle">Reviews</p>
                <h2 id="reviews-title" class="section-heading__title">Trusted by <span class="section-heading__title-accent">Champions</span></h2>
                <p class="section-heading__subtitle">Hear from athletes who trained at Alwar's premier shooting academy.</p>
              </div>
            </div>
            <div class="reviews__grid" role="list">${a}</div>
            <div class="reviews__cta">
              <a href="${this.options.ctaHref}" class="btn btn--primary btn--large">${this.options.ctaLabel}</a>
            </div>
          </div>
        </section>
      `}}updateReviews(e){this.options.reviews=e,this.render()}destroy(){this.container.innerHTML=""}}function He(i,e){return new Ie(i,e)}const Oe=[{word:"Focus",number:"01"},{word:"Discipline",number:"02"},{word:"Precision",number:"03"},{word:"Consistency",number:"04"}];class qe{constructor(e,t={}){this.container=e,this.options={words:t.words||Oe,...t},this.init()}init(){this.render()}render(){const e=this.options.words.map((t,a)=>`
      <div class="motivational__item">
        <span class="motivational__number">${t.number}</span>
        <span class="motivational__word">${t.word}</span>
        ${a<this.options.words.length-1?'<span class="motivational__divider" aria-hidden="true"></span>':""}
      </div>
    `).join("");this.container.innerHTML=`
      <section class="motivational" aria-label="Core values">
        <div class="container">
          <div class="motivational__grid" role="list">${e}</div>
        </div>
      </section>
    `}destroy(){this.container.innerHTML=""}}function Be(i,e){return new qe(i,e)}class Ne{constructor(e,t={}){this.container=e,this.options={title:t.title||"Ready to Take Your First Shot?",titleAccent:t.titleAccent||"First Shot",description:t.description||"Join Alwar's first RRA-certified academy. World-class ranges, expert coaches, and a community dedicated to your growth.",primaryAction:t.primaryAction||{label:"Register Now",href:"#register"},secondaryAction:t.secondaryAction||{label:"Pay & Play",href:"/pay-play"},...t},this.init()}init(){this.render()}render(){const{title:e,titleAccent:t,description:a,primaryAction:s,secondaryAction:n}=this.options;let r=e;if(t){const o=e.toLowerCase().indexOf(t.toLowerCase());if(o>=0){const l=e.slice(0,o),d=e.slice(o,o+t.length),_=e.slice(o+t.length);r=`${l}<span class="final-cta__title-accent">${d}</span>${_}`}}this.container.innerHTML=`
      <section class="final-cta section" aria-labelledby="final-cta-title">
        <div class="container">
          <div class="final-cta__card">
            <h2 id="final-cta-title" class="final-cta__title">${r}</h2>
            <p class="final-cta__description">${a}</p>
            <div class="final-cta__actions" role="group" aria-label="Final actions">
              <a href="${s.href}" class="btn btn--primary btn--large final-cta__btn">${s.label}</a>
              <a href="${n.href}" class="btn btn--secondary btn--large final-cta__btn">${n.label}</a>
            </div>
          </div>
        </div>
      </section>
    `}destroy(){this.container.innerHTML=""}}function je(i,e){return new Ne(i,e)}const S={quickLinks:[{label:"Home",href:"#"},{label:"About",href:"#about"},{label:"Training",href:"#training"},{label:"Achievements",href:"#achievements"}],programs:[{label:"10m Range",href:"#training-10m"},{label:"25m Range",href:"#training-25m"},{label:"50m Range",href:"#training-50m"},{label:"Youth Programs",href:"#youth"}],facilities:[{label:"Shooting Ranges",href:"#facilities"},{label:"Equipment Rental",href:"#rental"},{label:"Pro Shop",href:"#shop"},{label:"Cafeteria",href:"#cafe"}]},Fe=[{label:"Register Now",variant:"primary",href:"#register"},{label:"Pay & Play",variant:"secondary",href:"/pay-play"}],De={address:{label:"Address",value:"[Academy Address Placeholder]",icon:"location"},phone:{label:"Phone",value:"[Phone Placeholder]",icon:"phone"},email:{label:"Email",value:"[Email Placeholder]",icon:"mail"}},ze={location:'<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>',phone:'<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>',mail:'<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>'};class Ve{constructor(e,t={}){this.container=e,this.options={contactData:t.contactData||De,...t},this.init()}init(){this.render()}render(){const e=`
      <div class="footer__brand">
        <img src="/assets/shooting-logo.jpeg" alt="" class="footer__logo" loading="lazy">
        <span class="footer__brand-name">MATSYA</span>
        <span class="footer__brand-tagline">SHOOTING SPORTS ACADEMY</span>
        <p class="footer__description">Alwar's first RRA-certified academy offering professional training across 10m, 25m, and 50m ranges.</p>
      </div>
    `,t=S.quickLinks.map(o=>`
      <li><a href="${o.href}" class="footer__link">${o.label}</a></li>
    `).join(""),a=S.programs.map(o=>`
      <li><a href="${o.href}" class="footer__link">${o.label}</a></li>
    `).join(""),s=S.facilities.map(o=>`
      <li><a href="${o.href}" class="footer__link">${o.label}</a></li>
    `).join(""),n=Fe.map(o=>`
      <a href="${o.href}" class="btn btn--${o.variant} footer__btn">${o.label}</a>
    `).join(""),r=Object.entries(this.options.contactData).map(([o,l])=>`
      <div class="footer__contact-item">
        <span class="footer__contact-icon" aria-hidden="true">${ze[l.icon]||""}</span>
        <span class="footer__contact-label">${l.label}</span>
        <span class="footer__contact-value">${l.value}</span>
      </div>
    `).join("");this.container.innerHTML=`
      <footer class="footer" role="contentinfo">
        <div class="container">
          <div class="footer__grid">
            ${e}

            <nav class="footer__nav" aria-label="Quick links">
              <h3 class="footer__section-title">Quick Links</h3>
              <ul class="footer__links">${t}</ul>
            </nav>

            <nav class="footer__nav" aria-label="Training Programs">
              <h3 class="footer__section-title">Training</h3>
              <ul class="footer__links">${a}</ul>
            </nav>

            <nav class="footer__nav" aria-label="Facilities">
              <h3 class="footer__section-title">Facilities</h3>
              <ul class="footer__links">${s}</ul>
            </nav>

            <div class="footer__ctas">
              <h3 class="footer__section-title">Get Started</h3>
              <div class="footer__cta-group">${n}</div>
              <div class="footer__contact">${r}</div>
            </div>
          </div>

          <hr class="footer__divider">

          <div class="footer__bottom">
            <p class="footer__copyright">&copy; 2025 Matsya Shooting Sports Academy. All rights reserved.</p>
            <nav class="footer__legal" aria-label="Legal links">
              <a href="#privacy" class="footer__legal-link">Privacy Policy</a>
              <a href="#terms" class="footer__legal-link">Terms of Service</a>
              <a href="#cookies" class="footer__legal-link">Cookie Policy</a>
            </nav>
          </div>
        </div>
      </footer>
    `}updateContactData(e){this.options.contactData={...this.options.contactData,...e},this.render()}destroy(){this.container.innerHTML=""}}function Ue(i,e){return new Ve(i,e)}const Ge={intro:{title:"Academy Introduction",content:"Matsya Shooting Sports Academy is Alwar's first RRA-certified academy, dedicated to developing precision, discipline, confidence, and performance in shooting sports. Located in Alwar, Rajasthan, we provide world-class training facilities across 10m, 25m, and 50m ranges under the guidance of certified coaches."},story:{title:"Our Story",content:"Established with a vision to bring professional shooting sports training to Alwar and the surrounding region, Matsya Shooting Sports Academy was founded to create a structured pathway for aspiring shooters. From beginners taking their first shot to competitive athletes preparing for state and national championships, our academy serves as a hub for excellence in shooting sports."},vision:{title:"Vision",content:"To be the premier shooting sports academy in Rajasthan, recognized for producing champions who embody precision, discipline, and sporting excellence at national and international levels."},mission:{title:"Mission",content:"To provide accessible, professional, and structured shooting sports training that develops technical mastery, mental fortitude, and competitive readiness in every athlete — regardless of their starting level."},philosophy:{title:"Coaching Philosophy",content:"Our coaching philosophy centers on four pillars: Precision, Discipline, Confidence, and Performance. We believe that technical excellence is built through systematic, data-driven training combined with mental conditioning. Every shooter receives individualized attention within a structured program that progresses from fundamentals to advanced competition preparation."},whyChooseUs:{title:"Why Choose Us",items:["Alwar's first RRA-certified academy","Three dedicated ranges: 10m, 25m, 50m","NRAI-certified coaches: Aman Choudhary & Chaman Choudhary","Electronic scoring systems (SIUS/MEGALINK) on 10m range","Structured programs for beginners, youth, and competitive athletes","Climate-controlled indoor facilities","Competition-grade outdoor 50m range with wind flags","Individualized coaching within group training structure"]},highlights:[{icon:'<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',title:"RRA Certified",desc:"Alwar's first and only RRA-certified shooting academy"},{icon:'<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>',title:"Three Ranges",desc:"10m indoor, 25m, and 50m outdoor ranges meeting ISSF standards"},{icon:'<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>',title:"Expert Coaching",desc:"Led by NRAI-certified coaches with national-level experience"}]},Ye='<svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>';class We{constructor(e,t={}){this.container=e,this.options={content:t.content||Ge,imageSrc:t.imageSrc||null,imageAlt:t.imageAlt||"Academy facility",...t},this.init()}init(){this.render()}render(){const{content:e,imageSrc:t,imageAlt:a}=this.options,s=t?`<img src="${t}" alt="${a}" class="about-page__image" loading="lazy">`:`
        <div class="about-page__placeholder" role="img" aria-label="Academy facility placeholder">
          <span class="about-page__placeholder-icon" aria-hidden="true">${Ye}</span>
          <span class="about-page__placeholder-text">Academy Facility Image</span>
        </div>
      `,n=e.whyChooseUs.items.map(o=>`
      <li style="display: flex; align-items: flex-start; gap: var(--spacing-3); margin-bottom: var(--spacing-3); padding-left: 0; list-style: none;">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink: 0; color: var(--color-accent-bright); margin-top: 2px;"><polyline points="20 6 9 17 4 12"/></svg>
        <span style="color: var(--color-text-secondary); line-height: var(--line-height-relaxed);">${o}</span>
      </li>
    `).join(""),r=e.highlights.map(o=>`
      <article class="about-page__highlight-card">
        <span class="about-page__highlight-icon" aria-hidden="true">${o.icon}</span>
        <h3 class="about-page__highlight-title">${o.title}</h3>
        <p class="about-page__highlight-desc">${o.desc}</p>
      </article>
    `).join("");this.container.innerHTML=`
      <section class="about-page" aria-labelledby="about-page-title">
        <div class="container">
          <header class="about-page__hero">
            <div class="about-page__hero-badge badge">ALWAR • RAJASTHAN</div>
            <h1 id="about-page-title" class="about-page__title">About <span class="about-page__title-accent">Matsya Shooting Sports Academy</span></h1>
            <p class="about-page__description">Alwar's first RRA-certified academy dedicated to professional shooting sports training across 10m, 25m, and 50m ranges.</p>
            <div class="about-page__visual">${s}</div>
          </header>

          <div class="about-page__section" id="introduction">
            <div class="about-page__section-header">
              <p class="about-page__section-pretitle">Introduction</p>
              <h2 class="about-page__section-title">${e.intro.title}</h2>
            </div>
            <div class="about-page__content-grid">
              <div class="about-page__content-block about-page__content-block--full">
                <p class="about-page__content-text">${e.intro.content}</p>
              </div>
            </div>
          </div>

          <div class="about-page__section" id="story">
            <div class="about-page__section-header">
              <p class="about-page__section-pretitle">Our Journey</p>
              <h2 class="about-page__section-title">${e.story.title}</h2>
            </div>
            <div class="about-page__content-grid">
              <div class="about-page__content-block about-page__content-block--full">
                <p class="about-page__content-text">${e.story.content}</p>
              </div>
            </div>
          </div>

          <div class="about-page__section" id="vision-mission">
            <div class="about-page__section-header">
              <p class="about-page__section-pretitle">Vision & Mission</p>
              <h2 class="about-page__section-title">Guiding <span class="about-page__section-title-accent">Principles</span></h2>
            </div>
            <div class="about-page__content-grid">
              <div class="about-page__content-block">
                <h3 class="about-page__content-title">${e.vision.title}</h3>
                <p class="about-page__content-text">${e.vision.content}</p>
              </div>
              <div class="about-page__content-block">
                <h3 class="about-page__content-title">${e.mission.title}</h3>
                <p class="about-page__content-text">${e.mission.content}</p>
              </div>
            </div>
          </div>

          <div class="about-page__section" id="philosophy">
            <div class="about-page__section-header">
              <p class="about-page__section-pretile">Approach</p>
              <h2 class="about-page__section-title">${e.philosophy.title}</h2>
            </div>
            <div class="about-page__content-grid">
              <div class="about-page__content-block about-page__content-block--full">
                <p class="about-page__content-text">${e.philosophy.content}</p>
              </div>
            </div>
          </div>

          <div class="about-page__section" id="why-choose">
            <div class="about-page__section-header">
              <p class="about-page__section-pretitle">Why Choose Us</p>
              <h2 class="about-page__section-title">The Matsya <span class="about-page__section-title-accent">Advantage</span></h2>
            </div>
            <div class="about-page__content-grid">
              <div class="about-page__content-block about-page__content-block--full">
                <ul style="list-style: none; padding: 0;">${n}</ul>
              </div>
            </div>
          </div>

          <div class="about-page__section" id="highlights">
            <div class="about-page__section-header">
              <p class="about-page__section-pretitle">Highlights</p>
              <h2 class="about-page__section-title">Academy <span class="about-page__section-title-accent">Highlights</span></h2>
            </div>
            <div class="about-page__highlights-grid" role="list">${r}</div>
          </div>

          <div class="about-page__cta-section">
            <div class="about-page__cta-actions" role="group" aria-label="About page actions">
              <a href="/register" class="btn btn--primary btn--large">Register Now</a>
              <a href="/contact" class="btn btn--secondary btn--large">Contact Academy</a>
            </div>
          </div>
        </div>
      </section>
    `}destroy(){this.container.innerHTML=""}}function Ke(i,e){return new We(i,e)}const Je=[{distance:"10m",discipline:"Air Pistol / Air Rifle",description:"Olympic-standard 10m indoor range with electronic target systems. Climate-controlled environment for precision training and competition preparation.",features:["Electronic scoring targets (SIUS/MEGALINK)","20 firing points","Climate-controlled","Beginner to elite programs"],icon:'<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>',placeholderIcon:'<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 9h6v6H9z"/><circle cx="12" cy="12" r="2"/></svg>'},{distance:"25m",discipline:"Sport Pistol / Standard Pistol",description:"Professional 25m range with turning target systems for rapid fire and precision events. ISSF competition compliant.",features:["Turning target systems","Rapid fire capability","Competition-grade lighting","Coaching bay available"],icon:'<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>',placeholderIcon:'<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>'},{distance:"50m",discipline:"Free Pistol / Rifle 3 Positions",description:"Full-length 50m outdoor range with wind flags and target carriers. Supports rifle 3-positions and free pistol disciplines.",features:["Outdoor range with wind flags","Rifle 3-positions capable","Free pistol discipline","Tournament ready"],icon:'<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>',placeholderIcon:'<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>'}],Xe=[{title:"Beginners",description:"Fundamentals of safety, stance, grip, and trigger control. Structured entry-level programs.",icon:'<svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>'},{title:"Kids / Youth",description:"Age-appropriate training with focus on safety, discipline, and fun. Junior development pathways.",icon:'<svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>'},{title:"Competitive Athletes",description:"Advanced training for state, national, and international competition. Data-driven performance optimization.",icon:'<svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>'},{title:"Recreational Shooters",description:"Flexible pay-and-play sessions for hobbyists. Skill-building at your own pace.",icon:'<svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>'}],Qe='<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>';class Ze{constructor(e,t={}){this.container=e,this.options={ranges:t.ranges||Je,audiences:t.audiences||Xe,...t},this.init()}init(){this.render()}render(){const{ranges:e,audiences:t}=this.options,a=e.map(n=>`
      <article class="training-range-card">
        <div class="training-range-card__visual">
          ${n.imageSrc?`<img src="${n.imageSrc}" alt="${n.distance} range" class="training-range-card__image" loading="lazy">`:`
              <div class="training-range-card__placeholder" role="img" aria-label="${n.distance} range placeholder">
                <span class="training-range-card__placeholder-icon" aria-hidden="true">${n.placeholderIcon}</span>
                <span class="training-range-card__placeholder-text">Range Image</span>
              </div>
            `}
        </div>
        <div class="training-range-card__content">
          <h3 class="training-range-card__distance">${n.distance}</h3>
          <p class="training-range-card__discipline">${n.discipline}</p>
          <p class="training-range-card__desc">${n.description}</p>
          <ul class="training-range-card__features" role="list">
            ${n.features.map(r=>`
              <li class="training-range-card__feature">
                <span class="training-range-card__feature-icon" aria-hidden="true">${Qe}</span>
                <span>${r}</span>
              </li>
            `).join("")}
          </ul>
          <a href="/training#${n.distance.toLowerCase()}" class="btn btn--secondary training-range-card__cta">Learn More</a>
        </div>
      </article>
    `).join(""),s=t.map(n=>`
      <article class="training-audience-card">
        <span class="training-audience-card__icon" aria-hidden="true">${n.icon}</span>
        <h3 class="training-audience-card__title">${n.title}</h3>
        <p class="training-audience-card__desc">${n.description}</p>
      </article>
    `).join("");this.container.innerHTML=`
      <section class="training-page" aria-labelledby="training-page-title">
        <div class="container">
          <header class="training-page__hero">
            <div class="training-page__hero-badge badge">ALWAR • RAJASTHAN</div>
            <h1 id="training-page-title" class="training-page__title">Training Programs & <span class="training-page__title-accent">Ranges</span></h1>
            <p class="training-page__description">Three dedicated ranges meeting international standards — from beginner air gun to elite 50m competition. Programs structured for every level.</p>
          </header>

          <div class="training-page__section" id="ranges">
            <div class="training-page__section-header">
              <p class="training-page__section-pretitle">Our Ranges</p>
              <h2 class="training-page__section-title">Three Ranges for Every <span class="training-page__section-title-accent">Discipline</span></h2>
            </div>
            <div class="training-page__ranges-grid" role="list">${a}</div>
          </div>

          <div class="training-page__section" id="audiences">
            <div class="training-page__section-header">
              <p class="training-page__section-pretitle">Who We Train</p>
              <h2 class="training-page__section-title">Programs for Every <span class="training-page__section-title-accent">Shooter</span></h2>
            </div>
            <div class="training-page__audiences-grid" role="list">${s}</div>
          </div>

          <div class="training-page__cta-section">
            <div class="training-page__cta-actions" role="group" aria-label="Training page actions">
              <a href="/register" class="btn btn--primary btn--large">Register Now</a>
              <a href="/contact" class="btn btn--secondary btn--large">Contact Academy</a>
            </div>
            <p class="training-page__note">Specific program schedules, fees, and enrollment details are managed through our registration system. Contact us for current availability.</p>
          </div>
        </div>
      </section>
    `}updateRanges(e){this.options.ranges=e,this.render()}updateAudiences(e){this.options.audiences=e,this.render()}destroy(){this.container.innerHTML=""}}function et(i,e){return new Ze(i,e)}const tt=[{id:"aman-choudhary",name:"Aman Choudhary",role:"Head Coach",photo:null,photoAlt:"Coach Aman Choudhary",qualifications:null,certifications:null,experience:null,bio:"NRAI-certified coach with extensive experience training national-level shooters in pistol and rifle disciplines. Dedicated to developing technical precision and mental fortitude in every athlete.",achievements:null,visible:!0,displayOrder:1},{id:"chaman-choudhary",name:"Chaman Choudhary",role:"Senior Coach",photo:null,photoAlt:"Coach Chaman Choudhary",qualifications:null,certifications:null,experience:null,bio:"Experienced shooting instructor specializing in precision techniques and mental conditioning for competitive athletes. Focuses on building strong fundamentals and competition readiness.",achievements:null,visible:!0,displayOrder:2}],it='<svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M20 21a8 8 0 0 0-16 0"/></svg>';function at(i){return[...i].filter(e=>e.visible!==!1).sort((e,t)=>(e.displayOrder||999)-(t.displayOrder||999))}class st{constructor(e,t={}){this.container=e,this.options={coaches:t.coaches||tt,...t},this.init()}init(){this.render()}render(){const t=at(this.options.coaches).map(a=>`
      <article class="coach-profile" data-coach-id="${a.id}">
        <div class="coach-profile__visual">
          ${a.photo?`<img src="${a.photo}" alt="${a.photoAlt}" class="coach-profile__image" loading="lazy">`:`
              <div class="coach-profile__placeholder" role="img" aria-label="${a.name} photo placeholder">
                <span class="coach-profile__placeholder-icon" aria-hidden="true">${it}</span>
                <span class="coach-profile__placeholder-text">Coach Photo</span>
              </div>
            `}
        </div>
        <div class="coach-profile__content">
          <header class="coach-profile__header">
            <h2 class="coach-profile__name">${a.name}</h2>
            <p class="coach-profile__role">${a.role}</p>
          </header>
          <div class="coach-profile__bio">
            <p>${a.bio}</p>
          </div>
          <div class="coach-profile__details">
            ${a.qualifications?`
              <div class="coach-detail">
                <span class="coach-detail__label">Qualifications</span>
                <span class="coach-detail__value">${a.qualifications}</span>
              </div>
            `:`
              <div class="coach-detail">
                <span class="coach-detail__label">Qualifications</span>
                <span class="coach-detail__value coach-detail__value--empty">[To be added via CMS]</span>
              </div>
            `}
            ${a.certifications?`
              <div class="coach-detail">
                <span class="coach-detail__label">Certifications</span>
                <span class="coach-detail__value">${a.certifications}</span>
              </div>
            `:`
              <div class="coach-detail">
                <span class="coach-detail__label">Certifications</span>
                <span class="coach-detail__value coach-detail__value--empty">[To be added via CMS]</span>
              </div>
            `}
            ${a.experience?`
              <div class="coach-detail">
                <span class="coach-detail__label">Experience</span>
                <span class="coach-detail__value">${a.experience}</span>
              </div>
            `:`
              <div class="coach-detail">
                <span class="coach-detail__label">Experience</span>
                <span class="coach-detail__value coach-detail__value--empty">[To be added via CMS]</span>
              </div>
            `}
            ${a.achievements?`
              <div class="coach-detail">
                <span class="coach-detail__label">Achievements</span>
                <span class="coach-detail__value">${a.achievements}</span>
              </div>
            `:""}
          </div>
          <div class="coach-profile__cta">
            <a href="/contact" class="btn btn--secondary">Contact Coach</a>
          </div>
        </div>
      </article>
    `).join("");this.container.innerHTML=`
      <section class="coaches-page" aria-labelledby="coaches-page-title">
        <div class="container">
          <header class="coaches-page__hero">
            <div class="coaches-page__hero-badge badge">ALWAR • RAJASTHAN</div>
            <h1 id="coaches-page-title" class="coaches-page__title">Our <span class="coaches-page__title-accent">Coaches</span></h1>
            <p class="coaches-page__description">Led by NRAI-certified professionals dedicated to developing champions at every level through precision training and mental conditioning.</p>
          </header>

          <div class="coaches-page__grid" role="list">${t}</div>

          <div class="coaches-page__cta-section">
            <div class="coaches-page__cta-actions" role="group" aria-label="Coaches page actions">
              <a href="/register" class="btn btn--primary btn--large">Register Now</a>
              <a href="/contact" class="btn btn--secondary btn--large">Contact Academy</a>
            </div>
          </div>
        </div>
      </section>
    `}updateCoaches(e){this.options.coaches=e,this.render()}destroy(){this.container.innerHTML=""}}function nt(i,e){return new st(i,e)}const rt=[{id:"10m-range",name:"10m Indoor Range",category:"Shooting Range",description:"Olympic-standard 10m indoor range with electronic target systems. Climate-controlled environment for precision training and competition preparation.",image:null,imageAlt:"10m indoor shooting range",specifications:null,equipment:null,capacity:null,features:["Electronic scoring targets (SIUS/MEGALINK)","20 firing points","Climate-controlled environment","Air pistol & air rifle disciplines"],visible:!0,displayOrder:1},{id:"25m-range",name:"25m Range",category:"Shooting Range",description:"Professional 25m range with turning target systems for rapid fire and precision events. ISSF competition compliant.",image:null,imageAlt:"25m shooting range",specifications:null,equipment:null,capacity:null,features:["Turning target systems","Rapid fire capability","Competition-grade lighting","Sport pistol & standard pistol disciplines"],visible:!0,displayOrder:2},{id:"50m-range",name:"50m Outdoor Range",category:"Shooting Range",description:"Full-length 50m outdoor range with wind flags and target carriers. Supports rifle 3-positions and free pistol disciplines.",image:null,imageAlt:"50m outdoor shooting range",specifications:null,equipment:null,capacity:null,features:["Outdoor range with wind flags","Rifle 3-positions capable","Free pistol discipline","Tournament ready"],visible:!0,displayOrder:3}],ot={"10m Indoor Range":'<svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 9h6v6H9z"/><circle cx="12" cy="12" r="2"/></svg>',"25m Range":'<svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>',"50m Outdoor Range":'<svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>'},lt='<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>';function ct(i){return[...i].filter(e=>e.visible!==!1).sort((e,t)=>(e.displayOrder||999)-(t.displayOrder||999))}class dt{constructor(e,t={}){this.container=e,this.options={facilities:t.facilities||rt,...t},this.init()}init(){this.render()}render(){const t=ct(this.options.facilities).map(a=>`
      <article class="facility-card" data-facility-id="${a.id}">
        <div class="facility-card__visual">
          ${a.image?`<img src="${a.image}" alt="${a.imageAlt}" class="facility-card__image" loading="lazy">`:`
              <div class="facility-card__placeholder" role="img" aria-label="${a.name} placeholder">
                <span class="facility-card__placeholder-icon" aria-hidden="true">${ot[a.name]||""}</span>
                <span class="facility-card__placeholder-text">Facility Image</span>
              </div>
            `}
        </div>
        <div class="facility-card__content">
          <header class="facility-card__header">
            <h2 class="facility-card__name">${a.name}</h2>
            <span class="facility-card__category">${a.category}</span>
          </header>
          <p class="facility-card__desc">${a.description}</p>
          <div class="facility-card__details">
            ${a.specifications?`
              <div class="facility-detail">
                <span class="facility-detail__label">Specifications</span>
                <span class="facility-detail__value">${a.specifications}</span>
              </div>
            `:`
              <div class="facility-detail">
                <span class="facility-detail__label">Specifications</span>
                <span class="facility-detail__value facility-detail__value--empty">[To be added via CMS]</span>
              </div>
            `}
            ${a.equipment?`
              <div class="facility-detail">
                <span class="facility-detail__label">Equipment</span>
                <span class="facility-detail__value">${a.equipment}</span>
              </div>
            `:`
              <div class="facility-detail">
                <span class="facility-detail__label">Equipment</span>
                <span class="facility-detail__value facility-detail__value--empty">[To be added via CMS]</span>
              </div>
            `}
            ${a.capacity?`
              <div class="facility-detail">
                <span class="facility-detail__label">Capacity</span>
                <span class="facility-detail__value">${a.capacity}</span>
              </div>
            `:""}
          </div>
          ${a.features&&a.features.length>0?`
            <ul class="facility-card__features" role="list" style="list-style: none; padding: 0; margin: 0 0 var(--spacing-6); display: flex; flex-direction: column; gap: var(--spacing-2);">
              ${a.features.map(s=>`
                <li style="display: flex; align-items: center; gap: var(--spacing-2); font-size: var(--font-size-sm); color: var(--color-text-secondary);">
                  <span aria-hidden="true">${lt}</span>
                  <span>${s}</span>
                </li>
              `).join("")}
            </ul>
          `:""}
          <a href="/contact" class="btn btn--secondary facility-card__cta">Enquire About This Facility</a>
        </div>
      </article>
    `).join("");this.container.innerHTML=`
      <section class="facilities-page" aria-labelledby="facilities-page-title">
        <div class="container">
          <header class="facilities-page__hero">
            <div class="facilities-page__hero-badge badge">ALWAR • RAJASTHAN</div>
            <h1 id="facilities-page-title" class="facilities-page__title">Our <span class="facilities-page__title-accent">Facilities</span></h1>
            <p class="facilities-page__description">Three dedicated ranges meeting international standards — from beginner air gun to elite 50m competition. Designed for training excellence.</p>
          </header>

          <div class="facilities-page__grid" role="list">${t}</div>

          <div class="facilities-page__cta-section">
            <div class="facilities-page__cta-actions" role="group" aria-label="Facilities page actions">
              <a href="/register" class="btn btn--primary btn--large">Register Now</a>
              <a href="/contact" class="btn btn--secondary btn--large">Contact Academy</a>
            </div>
          </div>
        </div>
      </section>
    `}updateFacilities(e){this.options.facilities=e,this.render()}destroy(){this.container.innerHTML=""}}function ht(i,e){return new dt(i,e)}const pt=[],$={gold:'<svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>',silver:'<svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>',bronze:'<svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>'},L={gold:"Gold",silver:"Silver",bronze:"Bronze"},E={gold:"medalist-card__medal-badge--gold",silver:"medalist-card__medal-badge--silver",bronze:"medalist-card__medal-badge--bronze"},gt='<svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>',ut='<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>';function vt(i){return[...i].filter(e=>e.visible!==!1).sort((e,t)=>e.featured&&!t.featured?-1:!e.featured&&t.featured?1:(e.displayOrder||999)-(t.displayOrder||999))}function mt(i,e){return e==="all"?i:i.filter(t=>t.medal===e)}class _t{constructor(e,t={}){this.container=e,this.options={achievements:t.achievements||pt,...t},this.currentFilter="all",this.init()}init(){this.render(),this.bindFilterEvents()}render(){const e=vt(this.options.achievements);if(e.length===0){this.renderEmptyState();return}const a=mt(e,this.currentFilter).map(s=>this.renderMedalistCard(s)).join("");this.container.innerHTML=`
      <section class="achievements-page" aria-labelledby="achievements-page-title">
        <div class="container">
          <header class="achievements-page__hero">
            <div class="achievements-page__hero-badge badge">ALWAR • RAJASTHAN</div>
            <h1 id="achievements-page-title" class="achievements-page__title">Achievements & <span class="achievements-page__title-accent">Medalists</span></h1>
            <p class="achievements-page__description">Celebrating the competitive success of our athletes across state, national, and international championships.</p>
          </header>

          <div class="achievements-page__filters" role="group" aria-label="Filter achievements by medal type">
            <button class="achievements-page__filter achievements-page__filter--active" data-filter="all">All</button>
            <button class="achievements-page__filter" data-filter="gold">Gold</button>
            <button class="achievements-page__filter" data-filter="silver">Silver</button>
            <button class="achievements-page__filter" data-filter="bronze">Bronze</button>
          </div>

          <div class="achievements-page__grid" role="list">${a}</div>

          <div class="achievements-page__cta-section">
            <div class="achievements-page__cta-actions" role="group" aria-label="Achievements page actions">
              <a href="/register" class="btn btn--primary btn--large">Register Now</a>
              <a href="/contact" class="btn btn--secondary btn--large">Contact Academy</a>
            </div>
          </div>
        </div>
      </section>
    `}renderMedalistCard(e){const t=e.medal||"gold",a=$[t]||$.gold,s=E[t]||E.gold,n=L[t]||L.gold;return`
      <article class="medalist-card" data-medal="${t}" role="listitem">
        <div class="medalist-card__visual">
          ${e.photo?`<img src="${e.photo}" alt="${e.athlete}" class="medalist-card__image" loading="lazy">`:`
              <div class="medalist-card__placeholder" role="img" aria-label="${e.athlete} photo placeholder">
                <span class="medalist-card__placeholder-icon" aria-hidden="true">${ut}</span>
                <span class="medalist-card__placeholder-text">Athlete Photo</span>
              </div>
            `}
          <span class="medalist-card__medal-badge ${s}" aria-label="${n} medal">
            <span class="medalist-card__medal-icon" aria-hidden="true">${a}</span>
          </span>
        </div>
        <div class="medalist-card__content">
          <header class="medalist-card__header">
            <h2 class="medalist-card__athlete">${e.athlete||"[Athlete Name]"}</h2>
            <span class="medalist-card__year">${e.year||"[Year]"}</span>
          </header>
          <p class="medalist-card__event">${e.event||"[Event]"}</p>
          <p class="medalist-card__competition">${e.competition||"[Competition]"}</p>
          <p class="medalist-card__discipline">${e.discipline||"[Discipline]"}</p>
          ${e.description?`
            <p class="medalist-card__description">${e.description}</p>
          `:""}
          <a href="/contact" class="btn btn--secondary medalist-card__cta">Enquire About This Achievement</a>
        </div>
      </article>
    `}renderEmptyState(){this.container.innerHTML=`
      <section class="achievements-page" aria-labelledby="achievements-page-title">
        <div class="container">
          <header class="achievements-page__hero">
            <div class="achievements-page__hero-badge badge">ALWAR • RAJASTHAN</div>
            <h1 id="achievements-page-title" class="achievements-page__title">Achievements & <span class="achievements-page__title-accent">Medalists</span></h1>
            <p class="achievements-page__description">Celebrating the competitive success of our athletes across state, national, and international championships.</p>
          </header>

          <div class="achievements-page__grid">
            <div class="achievements-page__empty" role="status">
              <span class="achievements-page__empty-icon" aria-hidden="true">${gt}</span>
              <h2 class="achievements-page__empty-title">No Achievements Yet</h2>
              <p class="achievements-page__empty-desc">Verified achievements and medalists will be displayed here once added through the CMS.</p>
            </div>
          </div>

          <div class="achievements-page__cta-section">
            <div class="achievements-page__cta-actions" role="group" aria-label="Achievements page actions">
              <a href="/register" class="btn btn--primary btn--large">Register Now</a>
              <a href="/contact" class="btn btn--secondary btn--large">Contact Academy</a>
            </div>
          </div>
        </div>
      </section>
    `}bindFilterEvents(){this.container.querySelectorAll(".achievements-page__filter").forEach(t=>{t.addEventListener("click",()=>{this.currentFilter=t.dataset.filter,this.updateFilterUI(),this.render()})})}updateFilterUI(){this.container.querySelectorAll(".achievements-page__filter").forEach(t=>{t.classList.toggle("achievements-page__filter--active",t.dataset.filter===this.currentFilter)})}updateAchievements(e){this.options.achievements=e,this.render(),this.bindFilterEvents()}destroy(){this.container.innerHTML=""}}function ft(i,e){return new _t(i,e)}const yt=[],M=[{id:"all",label:"All"},{id:"academy",label:"Academy"},{id:"training",label:"Training"},{id:"competitions",label:"Competitions"},{id:"events",label:"Events"},{id:"facilities",label:"Facilities"},{id:"achievements",label:"Achievements"}],bt='<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>',wt='<svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>',xt='<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>',kt='<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>',At='<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>';function St(i){return[...i].filter(e=>e.visible!==!1).sort((e,t)=>e.featured&&!t.featured?-1:!e.featured&&t.featured?1:(e.displayOrder||999)-(t.displayOrder||999))}function Ct(i,e){return e==="all"?i:i.filter(t=>t.category===e)}class $t{constructor(e,t={}){this.container=e,this.options={items:t.items||yt,...t},this.currentFilter="all",this.lightboxOpen=!1,this.currentIndex=0,this.filteredItems=[],this.init()}init(){this.render(),this.bindEvents()}render(){const e=St(this.options.items);if(e.length===0){this.renderEmptyState();return}this.filteredItems=Ct(e,this.currentFilter);const t=this.filteredItems.map((a,s)=>this.renderGalleryItem(a,s)).join("");this.container.innerHTML=`
      <section class="gallery-page" aria-labelledby="gallery-page-title">
        <div class="container">
          <header class="gallery-page__hero">
            <div class="gallery-page__hero-badge badge">ALWAR • RAJASTHAN</div>
            <h1 id="gallery-page-title" class="gallery-page__title">Photo <span class="gallery-page__title-accent">Gallery</span></h1>
            <p class="gallery-page__description">Training sessions, competitions, events, and daily life at Matsya Shooting Sports Academy.</p>
          </header>

          <div class="gallery-page__filters" role="group" aria-label="Filter gallery by category">
            ${M.map(a=>`
              <button class="gallery-page__filter ${a.id===this.currentFilter?"gallery-page__filter--active":""}" data-filter="${a.id}">${a.label}</button>
            `).join("")}
          </div>

          <div class="gallery-page__grid" role="list">${t}</div>

          <div class="gallery-page__cta-section">
            <div class="gallery-page__cta-actions" role="group" aria-label="Gallery page actions">
              <a href="/register" class="btn btn--primary btn--large">Register Now</a>
              <a href="/contact" class="btn btn--secondary btn--large">Contact Academy</a>
            </div>
          </div>

          <!-- Lightbox -->
          <div class="lightbox" id="gallery-lightbox" role="dialog" aria-modal="true" aria-label="Image viewer">
            <div class="lightbox__backdrop"></div>
            <div class="lightbox__container">
              <button class="lightbox__close" aria-label="Close lightbox">
                <span class="lightbox__close-icon" aria-hidden="true">${xt}</span>
              </button>
              <button class="lightbox__nav lightbox__nav--prev" aria-label="Previous image">
                <span class="lightbox__nav-icon" aria-hidden="true">${kt}</span>
              </button>
              <div class="lightbox__image-wrapper">
                <img class="lightbox__image" src="" alt="" loading="lazy">
              </div>
              <button class="lightbox__nav lightbox__nav--next" aria-label="Next image">
                <span class="lightbox__nav-icon" aria-hidden="true">${At}</span>
              </button>
              <div class="lightbox__caption">
                <div class="lightbox__caption-title"></div>
                <div class="lightbox__caption-desc"></div>
                <div class="lightbox__counter"></div>
              </div>
            </div>
          </div>
        </div>
      </section>
    `,this.bindLightboxEvents()}renderGalleryItem(e,t){var n;const a=e.featured?"gallery-item--featured":"",s=((n=M.find(r=>r.id===e.category))==null?void 0:n.label)||e.category||"Academy";return`
      <article class="gallery-item ${a}" role="listitem" data-index="${t}" data-category="${e.category||"academy"}" tabindex="0" aria-label="View ${e.title||"gallery image"}">
        ${e.image?`<img src="${e.image}" alt="${e.title||"Gallery image"}" class="gallery-item__image" loading="lazy">`:`
            <div class="gallery-item__placeholder" role="img" aria-label="${e.title||"Gallery image"} placeholder">
              <span class="gallery-item__placeholder-icon" aria-hidden="true">${bt}</span>
              <span class="gallery-item__placeholder-text">Gallery Image</span>
            </div>
          `}
        <div class="gallery-item__overlay">
          <div class="gallery-item__info">
            <span class="gallery-item__category">${s}</span>
            <h3 class="gallery-item__title">${e.title||"Untitled"}</h3>
          </div>
        </div>
      </article>
    `}renderEmptyState(){this.container.innerHTML=`
      <section class="gallery-page" aria-labelledby="gallery-page-title">
        <div class="container">
          <header class="gallery-page__hero">
            <div class="gallery-page__hero-badge badge">ALWAR • RAJASTHAN</div>
            <h1 id="gallery-page-title" class="gallery-page__title">Photo <span class="gallery-page__title-accent">Gallery</span></h1>
            <p class="gallery-page__description">Training sessions, competitions, events, and daily life at Matsya Shooting Sports Academy.</p>
          </header>

          <div class="gallery-page__grid">
            <div class="gallery-page__empty" role="status">
              <span class="gallery-page__empty-icon" aria-hidden="true">${wt}</span>
              <h2 class="gallery-page__empty-title">No Images Yet</h2>
              <p class="gallery-page__empty-desc">Academy photos will appear here once uploaded through the CMS.</p>
            </div>
          </div>

          <div class="gallery-page__cta-section">
            <div class="gallery-page__cta-actions" role="group" aria-label="Gallery page actions">
              <a href="/register" class="btn btn--primary btn--large">Register Now</a>
              <a href="/contact" class="btn btn--secondary btn--large">Contact Academy</a>
            </div>
          </div>
        </div>
      </section>
    `}bindEvents(){this.container.querySelectorAll(".gallery-page__filter").forEach(a=>{a.addEventListener("click",()=>{this.currentFilter=a.dataset.filter,this.updateFilterUI(),this.render()})}),this.container.querySelectorAll(".gallery-item").forEach((a,s)=>{a.addEventListener("click",()=>this.openLightbox(s)),a.addEventListener("keydown",n=>{(n.key==="Enter"||n.key===" ")&&(n.preventDefault(),this.openLightbox(s))})})}bindLightboxEvents(){const e=this.container.querySelector("#gallery-lightbox");if(!e)return;const t=e.querySelector(".lightbox__close"),a=e.querySelector(".lightbox__nav--prev"),s=e.querySelector(".lightbox__nav--next"),n=e.querySelector(".lightbox__backdrop");this.closeLightbox=this.closeLightbox.bind(this),this.openLightboxAtIndex=this.openLightboxAtIndex.bind(this),this.handleKeydown=this.handleKeydown.bind(this),t.addEventListener("click",this.closeLightbox),a.addEventListener("click",()=>this.openLightboxAtIndex(this.currentIndex-1)),s.addEventListener("click",()=>this.openLightboxAtIndex(this.currentIndex+1)),n.addEventListener("click",this.closeLightbox),document.addEventListener("keydown",this.handleKeydown)}unbindLightboxEvents(){document.removeEventListener("keydown",this.handleKeydown)}updateFilterUI(){this.container.querySelectorAll(".gallery-page__filter").forEach(t=>{t.classList.toggle("gallery-page__filter--active",t.dataset.filter===this.currentFilter)})}openLightbox(e){this.filteredItems.length!==0&&(this.currentIndex=e,this.showLightboxItem(),this.openLightboxUI())}openLightboxAtIndex(e){e<0||e>=this.filteredItems.length||(this.currentIndex=e,this.showLightboxItem())}showLightboxItem(){const e=this.filteredItems[this.currentIndex];if(!e)return;const t=this.container.querySelector("#gallery-lightbox"),a=t.querySelector(".lightbox__image"),s=t.querySelector(".lightbox__caption-title"),n=t.querySelector(".lightbox__caption-desc"),r=t.querySelector(".lightbox__counter"),o=t.querySelector(".lightbox__nav--prev"),l=t.querySelector(".lightbox__nav--next");e.image?(a.src=e.image,a.alt=e.title||"Gallery image"):(a.src="",a.alt=e.title||"Gallery image"),s.textContent=e.title||"Untitled",n.textContent=e.description||"",r.textContent=`${this.currentIndex+1} / ${this.filteredItems.length}`,o.disabled=this.currentIndex===0,l.disabled=this.currentIndex===this.filteredItems.length-1}openLightboxUI(){const e=this.container.querySelector("#gallery-lightbox");if(!e)return;this.lightboxOpen=!0,e.classList.add("lightbox--open"),document.body.style.overflow="hidden",e.querySelector(".lightbox__close").focus()}closeLightbox(){const e=this.container.querySelector("#gallery-lightbox");e&&(this.lightboxOpen=!1,e.classList.remove("lightbox--open"),document.body.style.overflow="",this.unbindLightboxEvents())}handleKeydown(e){if(this.lightboxOpen)switch(e.key){case"Escape":this.closeLightbox();break;case"ArrowLeft":this.currentIndex>0&&this.openLightboxAtIndex(this.currentIndex-1);break;case"ArrowRight":this.currentIndex<this.filteredItems.length-1&&this.openLightboxAtIndex(this.currentIndex+1);break}}updateItems(e){this.options.items=e,this.render()}destroy(){this.unbindLightboxEvents(),this.container.innerHTML=""}}function Lt(i,e){return new $t(i,e)}const Et=[],Mt='<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',Tt='<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M20 21a8 8 0 0 0-16 0"/></svg>',Rt='<svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>';function Pt(i){return[...i].filter(e=>e.visible!==!1).sort((e,t)=>e.featured&&!t.featured?-1:!e.featured&&t.featured?1:(e.displayOrder||999)-(t.displayOrder||999))}class It{constructor(e,t={}){this.container=e,this.options={reviews:t.reviews||Et,...t},this.init()}init(){this.render()}render(){const e=Pt(this.options.reviews);if(e.length===0){this.renderEmptyState();return}const t=e.map(a=>this.renderReviewCard(a)).join("");this.container.innerHTML=`
      <section class="reviews-page" aria-labelledby="reviews-page-title">
        <div class="container">
          <header class="reviews-page__hero">
            <div class="reviews-page__hero-badge badge">ALWAR • RAJASTHAN</div>
            <h1 id="reviews-page-title" class="reviews-page__title">Reviews & <span class="reviews-page__title-accent">Testimonials</span></h1>
            <p class="reviews-page__description">Authentic feedback from athletes who have trained at Matsya Shooting Sports Academy.</p>
          </header>

          <div class="reviews-page__grid" role="list">${t}</div>

          <div class="reviews-page__cta-section">
            <div class="reviews-page__cta-actions" role="group" aria-label="Reviews page actions">
              <a href="/register" class="btn btn--primary btn--large">Register Now</a>
              <a href="/contact" class="btn btn--secondary btn--large">Contact Academy</a>
            </div>
          </div>
        </div>
      </section>
    `}renderReviewCard(e){const t=e.rating||5,a=e.date&&e.date.trim()!=="";return`
      <article class="review-card" role="listitem">
        <div class="review-card__rating" aria-label="${t} out of 5 stars">
          ${Mt.repeat(Math.min(5,Math.max(1,t)))}
        </div>
        <p class="review-card__text">"${e.text||"[Review text]"}"</p>
        <footer class="review-card__author">
          <div class="review-card__avatar" aria-hidden="true">
            ${e.avatar?`<img src="${e.avatar}" alt="" class="review-card__avatar-img" loading="lazy">`:`<div class="review-card__avatar-placeholder"><span class="review-card__avatar-icon">${Tt}</span></div>`}
          </div>
          <div>
            ${e.author?`
              <span class="review-card__name">${e.author}</span>
              ${e.role?`<span class="review-card__role">${e.role}</span>`:""}
            `:""}
            ${a?`<span class="review-card__date">${e.date}</span>`:""}
          </div>
        </footer>
      </article>
    `}renderEmptyState(){this.container.innerHTML=`
      <section class="reviews-page" aria-labelledby="reviews-page-title">
        <div class="container">
          <header class="reviews-page__hero">
            <div class="reviews-page__hero-badge badge">ALWAR • RAJASTHAN</div>
            <h1 id="reviews-page-title" class="reviews-page__title">Reviews & <span class="reviews-page__title-accent">Testimonials</span></h1>
            <p class="reviews-page__description">Authentic feedback from athletes who have trained at Matsya Shooting Sports Academy.</p>
          </header>

          <div class="reviews-page__grid">
            <div class="reviews-page__empty" role="status">
              <span class="reviews-page__empty-icon" aria-hidden="true">${Rt}</span>
              <h2 class="reviews-page__empty-title">No Reviews Yet</h2>
              <p class="reviews-page__empty-desc">Authentic reviews from our athletes will appear here once submitted.</p>
            </div>
          </div>

          <div class="reviews-page__cta-section">
            <div class="reviews-page__cta-actions" role="group" aria-label="Reviews page actions">
              <a href="/register" class="btn btn--primary btn--large">Register Now</a>
              <a href="/contact" class="btn btn--secondary btn--large">Contact Academy</a>
            </div>
          </div>
        </div>
      </section>
    `}updateReviews(e){this.options.reviews=e,this.render()}destroy(){this.container.innerHTML=""}}function Ht(i,e){return new It(i,e)}const Ot={address:null,phone:null,whatsapp:null,email:null,hours:null,mapUrl:null,mapEmbed:null},b={address:'<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>',phone:'<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>',whatsapp:'<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>',email:'<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>',hours:'<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>'},qt='<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',Bt='<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>',Nt='<svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>';class jt{constructor(e,t={}){this.container=e,this.options={contact:t.contact||Ot,...t},this.formState="idle",this.init()}init(){this.render(),this.bindFormEvents()}render(){const{contact:e}=this.options,t=`
      <div class="contact-detail">
        <span class="contact-detail__icon" aria-hidden="true">${b.address}</span>
        <div class="contact-detail__content">
          <span class="contact-detail__label">Address</span>
          <span class="contact-detail__value ${e.address?"":"contact-detail__value--empty"}">
            ${e.address||"[Academy Address Placeholder]"}
          </span>
        </div>
      </div>
      <div class="contact-detail">
        <span class="contact-detail__icon" aria-hidden="true">${b.phone}</span>
        <div class="contact-detail__content">
          <span class="contact-detail__label">Phone</span>
          <span class="contact-detail__value ${e.phone?"":"contact-detail__value--empty"}">
            ${e.phone?`<a href="tel:${e.phone}" class="contact-detail__link">${e.phone}</a>`:"[Phone Placeholder]"}
          </span>
        </div>
      </div>
      <div class="contact-detail">
        <span class="contact-detail__icon" aria-hidden="true">${b.whatsapp}</span>
        <div class="contact-detail__content">
          <span class="contact-detail__label">WhatsApp</span>
          <span class="contact-detail__value ${e.whatsapp?"":"contact-detail__value--empty"}">
            ${e.whatsapp?`<a href="https://wa.me/${e.whatsapp.replace(/\D/g,"")}" class="contact-detail__link" target="_blank" rel="noopener">${e.whatsapp}</a>`:"[WhatsApp Placeholder]"}
          </span>
        </div>
      </div>
      <div class="contact-detail">
        <span class="contact-detail__icon" aria-hidden="true">${b.email}</span>
        <div class="contact-detail__content">
          <span class="contact-detail__label">Email</span>
          <span class="contact-detail__value ${e.email?"":"contact-detail__value--empty"}">
            ${e.email?`<a href="mailto:${e.email}" class="contact-detail__link">${e.email}</a>`:"[Email Placeholder]"}
          </span>
        </div>
      </div>
      ${e.hours?`
        <div class="contact-detail">
          <span class="contact-detail__icon" aria-hidden="true">${b.hours}</span>
          <div class="contact-detail__content">
            <span class="contact-detail__label">Opening Hours</span>
            <span class="contact-detail__value">${e.hours}</span>
          </div>
        </div>
      `:""}
    `,a=e.mapEmbed?`<iframe src="${e.mapEmbed}" width="100%" height="100%" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade" title="Academy Location"></iframe>`:`
        <div class="contact-page__map-placeholder" role="img" aria-label="Academy location map placeholder">
          <span class="contact-page__map-icon" aria-hidden="true">${Nt}</span>
          <p class="contact-page__map-text">Academy location map will be displayed here once the exact address is confirmed.</p>
        </div>
      `;this.container.innerHTML=`
      <section class="contact-page" aria-labelledby="contact-page-title">
        <div class="container">
          <header class="contact-page__hero">
            <div class="contact-page__hero-badge badge">ALWAR • RAJASTHAN</div>
            <h1 id="contact-page-title" class="contact-page__title">Get in <span class="contact-page__title-accent">Touch</span></h1>
            <p class="contact-page__description">Have questions? We'd love to hear from you. Reach out for admissions, inquiries, or to schedule a visit.</p>
          </header>

          <div class="contact-page__grid">
            <div class="contact-page__info">
              <h2 class="contact-page__info-title">Contact Information</h2>
              <div class="contact-details">${t}</div>
            </div>

            <div class="contact-page__form-wrapper">
              <h2 class="contact-form__title">Send Us a Message</h2>
              <form class="contact-form" id="contact-form" novalidate>
                <div class="contact-form__row">
                  <div class="form-group">
                    <label for="name">Name <span aria-hidden="true">*</span></label>
                    <input type="text" id="name" name="name" required autocomplete="name" placeholder="Your name">
                    <span class="form-group__error" id="name-error"></span>
                  </div>
                  <div class="form-group">
                    <label for="phone">Phone <span aria-hidden="true">*</span></label>
                    <input type="tel" id="phone" name="phone" required autocomplete="tel" placeholder="+91 XXXXX XXXXX">
                    <span class="form-group__error" id="phone-error"></span>
                  </div>
                </div>
                <div class="contact-form__row">
                  <div class="form-group">
                    <label for="email">Email <span aria-hidden="true">*</span></label>
                    <input type="email" id="email" name="email" required autocomplete="email" placeholder="you@example.com">
                    <span class="form-group__error" id="email-error"></span>
                  </div>
                  <div class="form-group">
                    <label for="subject">Subject</label>
                    <select id="subject" name="subject" autocomplete="off">
                      <option value="">Select a topic</option>
                      <option value="admissions">Admissions & Registration</option>
                      <option value="training">Training Programs</option>
                      <option value="facilities">Facilities & Ranges</option>
                      <option value="coaching">Coaching Inquiries</option>
                      <option value="general">General Inquiry</option>
                      <option value="other">Other</option>
                    </select>
                    <span class="form-group__error" id="subject-error"></span>
                  </div>
                </div>
                <div class="form-group">
                  <label for="message">Message <span aria-hidden="true">*</span></label>
                  <textarea id="message" name="message" rows="5" required placeholder="Tell us how we can help you..."></textarea>
                  <span class="form-group__error" id="message-error"></span>
                </div>
                <div class="form-group">
                  <button type="submit" class="btn btn--primary btn--large contact-form__submit-btn" id="submit-btn">Send Message</button>
                </div>
                <div class="contact-form__status contact-form__status--success" id="form-success" role="status" aria-live="polite">
                  <span class="contact-form__status-icon" aria-hidden="true">${qt}</span>
                  <span>Thank you! Your message has been sent successfully.</span>
                </div>
                <div class="contact-form__status contact-form__status--error" id="form-error" role="alert" aria-live="assertive">
                  <span class="contact-form__status-icon" aria-hidden="true">${Bt}</span>
                  <span id="form-error-text">Something went wrong. Please try again.</span>
                </div>
              </form>
            </div>
          </div>

          <div class="contact-page__map">
            <h2 class="contact-page__map-title">Find Us</h2>
            <div class="contact-page__map-container">${a}</div>
          </div>

          <div class="contact-page__cta-section">
            <div class="contact-page__cta-actions" role="group" aria-label="Contact page actions">
              <a href="/register" class="btn btn--primary btn--large">Register Now</a>
              <a href="/contact" class="btn btn--secondary btn--large">Contact Academy</a>
            </div>
          </div>
        </div>
      </section>
    `}bindFormEvents(){const e=this.container.querySelector("#contact-form");if(!e)return;e.addEventListener("submit",a=>this.handleSubmit(a)),e.querySelectorAll("input, select, textarea").forEach(a=>{a.addEventListener("blur",()=>this.validateField(a)),a.addEventListener("input",()=>{a.classList.contains("error")&&this.validateField(a)})})}validateField(e){const t=this.container.querySelector(`#${e.id}-error`);let a=!0,s="";return e.classList.remove("error"),e.required&&!e.value.trim()?(a=!1,s=`${e.name.charAt(0).toUpperCase()+e.name.slice(1)} is required.`):e.type==="email"&&e.value.trim()?/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.value.trim())||(a=!1,s="Please enter a valid email address."):e.type==="tel"&&e.value.trim()?/^[\+]?[0-9\s\-\(\)]{10,}$/.test(e.value.trim())||(a=!1,s="Please enter a valid phone number."):e.tagName==="SELECT"&&e.required&&!e.value&&(a=!1,s="Please select a subject."),a?t&&(t.textContent=""):(e.classList.add("error"),t&&(t.textContent=s)),a}validateForm(e){const t=e.querySelectorAll("input[required], select[required], textarea[required]");let a=!0;return t.forEach(s=>{this.validateField(s)||(a=!1)}),a}async handleSubmit(e){e.preventDefault();const t=e.target,a=t.querySelector("#submit-btn");if(t.querySelector("#form-success"),t.querySelector("#form-error"),t.querySelector("#form-error-text"),this.hideStatusMessages(t),!this.validateForm(t)){const r=t.querySelector(".error");r&&r.focus();return}this.setLoadingState(a,!0);const s=new FormData(t),n=Object.fromEntries(s.entries());try{await this.submitForm(n),this.showSuccess(t),t.reset()}catch(r){this.showError(t,r.message||"Something went wrong. Please try again.")}finally{this.setLoadingState(a,!1)}}async submitForm(e){const t=await fetch("/api/contact",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(e)});if(!t.ok){const a=await t.json().catch(()=>({}));throw new Error(a.message||"Failed to submit form")}return t.json()}setLoadingState(e,t){t?(e.disabled=!0,e.dataset.originalText=e.textContent,e.textContent="Sending..."):(e.disabled=!1,e.textContent=e.dataset.originalText||"Send Message")}showSuccess(e){const t=e.querySelector("#form-success");t&&(t.style.display="flex",t.focus())}showError(e,t){const a=e.querySelector("#form-error"),s=e.querySelector("#form-error-text");a&&s&&(s.textContent=t,a.style.display="flex",a.focus())}hideStatusMessages(e){const t=e.querySelector("#form-success"),a=e.querySelector("#form-error");t&&(t.style.display="none"),a&&(a.style.display="none")}updateContact(e){this.options.contact={...this.options.contact,...e},this.render(),this.bindFormEvents()}destroy(){this.container.innerHTML=""}}function Ft(i,e){return new jt(i,e)}const v={required:(i="This field is required")=>({validate:e=>e==null?!1:typeof e=="string"?e.trim().length>0:Array.isArray(e)?e.length>0:!0,message:i}),minLength:(i,e)=>({validate:t=>typeof t=="string"&&t.trim().length>=i,message:e||`Must be at least ${i} characters`}),maxLength:(i,e)=>({validate:t=>typeof t=="string"&&t.trim().length<=i,message:e||`Must be no more than ${i} characters`}),email:(i="Please enter a valid email address")=>({validate:e=>e?/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.trim()):!0,message:i}),phone:(i="Please enter a valid phone number")=>({validate:e=>e?/^[\+]?[0-9\s\-\(\)]{10,}$/.test(e.trim()):!0,message:i}),numeric:(i="Must be a number")=>({validate:e=>e===""||e===null||e===void 0?!0:!isNaN(Number(e)),message:i}),integer:(i="Must be a whole number")=>({validate:e=>{if(e===""||e===null||e===void 0)return!0;const t=Number(e);return!isNaN(t)&&Number.isInteger(t)},message:i}),min:(i,e)=>({validate:t=>t===""||t===null||t===void 0?!0:Number(t)>=i,message:e||`Must be at least ${i}`}),max:(i,e)=>({validate:t=>t===""||t===null||t===void 0?!0:Number(t)<=i,message:e||`Must be no more than ${i}`}),pattern:(i,e="Invalid format")=>({validate:t=>t?i.test(t.trim()):!0,message:e}),oneOf:(i,e="Invalid selection")=>({validate:t=>t===""||t===null||t===void 0?!0:i.includes(t),message:e}),custom:(i,e)=>({validate:i,message:e})},f={trim:i=>i.trim(),lowercase:i=>i.toLowerCase(),uppercase:i=>i.toUpperCase(),stripHtml:i=>i.replace(/<[^>]*>/g,""),escapeHtml:i=>i.replace(/&/g,"&").replace(/</g,"<").replace(/>/g,">").replace(/"/g,'"').replace(/'/g,"&#039;"),digitsOnly:i=>i.replace(/\D/g,""),alphanumeric:i=>i.replace(/[^a-zA-Z0-9]/g,"")},Dt={registrationForm:{full_name:{required:!0,rules:[v.minLength(2),v.maxLength(100)],sanitize:f.trim},age:{required:!1,rules:[v.integer(),v.min(5),v.max(100)]},phone:{required:!0,rules:[v.phone()],sanitize:f.digitsOnly},email:{required:!0,rules:[v.email()],sanitize:i=>f.trim(i).toLowerCase()},city:{required:!1,rules:[v.maxLength(100)],sanitize:f.trim},interested_range:{required:!1,rules:[v.oneOf(["10m","25m","50m",""])],sanitize:f.trim},experience_level:{required:!1,rules:[v.oneOf(["beginner","intermediate","advanced","competitive",""])],sanitize:f.trim},message:{required:!1,rules:[v.maxLength(5e3)],sanitize:f.trim}}};function zt(i,e){const t={};for(const a of e)if(a in i&&i[a]!==void 0){let s=i[a];typeof s=="string"&&(s=f.stripHtml(s)),t[a]=s}return t}function y(){return console.warn("Supabase configuration missing. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your environment."),{url:"",anonKey:""}}const B={ADMIN_USERS:"admin_users",ACADEMY_CONTENT:"academy_content",TRAINING_RANGES:"training_ranges",COACHES:"coaches",FACILITIES:"facilities",ACHIEVEMENTS:"achievements",GALLERY_IMAGES:"gallery_images",REVIEWS:"reviews",REGISTRATIONS:"registrations",PAY_PLAY_OPTIONS:"pay_play_options",MOTIVATIONAL_QUOTES:"motivational_quotes",CONTACT_SETTINGS:"contact_settings",SITE_SECTION_SETTINGS:"site_section_settings"},Vt=[{value:"10m",label:"10m — Air Pistol / Air Rifle"},{value:"25m",label:"25m — Sport Pistol / Standard Pistol"},{value:"50m",label:"50m — Free Pistol / Rifle 3 Positions"}],Ut=[{value:"beginner",label:"Beginner"},{value:"intermediate",label:"Intermediate"},{value:"experienced",label:"Experienced"}],Gt='<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',Yt='<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>',Wt='<svg class="btn__spinner" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a10 10 0 0 1 10 10"/></svg>';class Kt{constructor(e,t={}){this.container=e,this.options={...t},this.isSubmitting=!1,this.supabaseUrl=null,this.supabaseAnonKey=null,this.init()}async init(){this.loadSupabaseConfig(),this.render(),this.bindFormEvents()}loadSupabaseConfig(){const e=y();this.supabaseUrl=e.url,this.supabaseAnonKey=e.anonKey}render(){this.container.innerHTML=`
      <section class="registration-page" aria-labelledby="registration-page-title">
        <div class="container">
          <header class="registration-page__hero">
            <div class="registration-page__hero-badge badge">ALWAR • RAJASTHAN</div>
            <h1 id="registration-page-title" class="registration-page__title">Register <span class="registration-page__title-accent">Now</span></h1>
            <p class="registration-page__description">Join Alwar's first RRA-certified academy. Fill out the form below and our team will contact you within 24-48 hours to discuss your training goals.</p>
          </header>

          <div class="registration-page__form-wrapper">
            <h2 class="registration-form__title">Registration Form</h2>
            <p class="registration-form__subtitle">All fields marked with <span class="required-indicator" aria-hidden="true">*</span> are required.</p>

            <form class="registration-form" id="registration-form" novalidate>
              <div class="form-row">
                <div class="form-group">
                  <label for="full_name">Full Name <span class="required-indicator" aria-hidden="true">*</span></label>
                  <input type="text" id="full_name" name="full_name" required autocomplete="name" placeholder="Your full name" maxlength="100">
                  <span class="form-group__error" id="full_name-error"></span>
                </div>
                <div class="form-group">
                  <label for="age">Age</label>
                  <input type="number" id="age" name="age" min="5" max="100" autocomplete="off" placeholder="Your age (optional)">
                  <span class="form-group__error" id="age-error"></span>
                  <span class="form-group__hint">Optional. Minimum age 5 years.</span>
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label for="phone">Phone Number <span class="required-indicator" aria-hidden="true">*</span></label>
                  <input type="tel" id="phone" name="phone" required autocomplete="tel" placeholder="+91 XXXXX XXXXX" maxlength="20">
                  <span class="form-group__error" id="phone-error"></span>
                </div>
                <div class="form-group">
                  <label for="email">Email <span class="required-indicator" aria-hidden="true">*</span></label>
                  <input type="email" id="email" name="email" required autocomplete="email" placeholder="you@example.com" maxlength="254">
                  <span class="form-group__error" id="email-error"></span>
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label for="city">City</label>
                  <input type="text" id="city" name="city" autocomplete="address-level2" placeholder="Your city (optional)" maxlength="100">
                  <span class="form-group__error" id="city-error"></span>
                </div>
                <div class="form-group">
                  <label for="interested_range">Interested Range</label>
                  <select id="interested_range" name="interested_range" autocomplete="off">
                    <option value="">Select a range (optional)</option>
                    ${Vt.map(e=>`<option value="${e.value}">${e.label}</option>`).join("")}
                  </select>
                  <span class="form-group__error" id="interested_range-error"></span>
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label for="experience">Experience Level</label>
                  <select id="experience" name="experience" autocomplete="off">
                    <option value="">Select experience (optional)</option>
                    ${Ut.map(e=>`<option value="${e.value}">${e.label}</option>`).join("")}
                  </select>
                  <span class="form-group__error" id="experience-error"></span>
                </div>
              </div>

              <div class="form-group">
                <label for="message">Message</label>
                <textarea id="message" name="message" rows="4" placeholder="Tell us about your goals, previous experience, or any questions... (optional)" maxlength="5000"></textarea>
                <span class="form-group__error" id="message-error"></span>
                <span class="form-group__hint">Optional. Maximum 5000 characters.</span>
              </div>

              <div class="form-group registration-form__submit">
                <button type="submit" class="btn btn--primary btn--large registration-form__submit-btn" id="submit-btn" disabled>
                  ${Wt}
                  <span class="btn__text">Submit Registration</span>
                </button>
              </div>

              <div class="registration-form__status registration-form__status--success" id="form-success" role="status" aria-live="polite">
                <span class="registration-form__status-icon" aria-hidden="true">${Gt}</span>
                <div class="registration-form__status-text">
                  <strong>Registration Submitted Successfully</strong>
                  Your registration request has been submitted successfully. Our team will contact you within 24-48 hours to discuss your training goals.
                </div>
              </div>

              <div class="registration-form__status registration-form__status--error" id="form-error" role="alert" aria-live="assertive">
                <span class="registration-form__status-icon" aria-hidden="true">${Yt}</span>
                <div class="registration-form__status-text">
                  <strong>Something Went Wrong</strong>
                  <span id="form-error-text">Please try again or contact us directly if the problem persists.</span>
                </div>
              </div>
            </form>
          </div>

          <div class="registration-page__cta-section">
            <div class="registration-page__cta-actions" role="group" aria-label="Registration page actions">
              <a href="/contact" class="btn btn--secondary btn--large">Contact Academy</a>
            </div>
          </div>
        </div>
      </section>
    `}bindFormEvents(){const e=this.container.querySelector("#registration-form");if(!e)return;e.querySelectorAll("input, select, textarea").forEach(a=>{a.addEventListener("blur",()=>this.validateField(a)),a.addEventListener("input",()=>{a.classList.contains("error")&&this.validateField(a)}),a.addEventListener("input",()=>this.updateSubmitButtonState())}),e.addEventListener("submit",a=>this.handleSubmit(a))}validateField(e){const t=e.name;if(!t)return!0;const s=Dt.registrationForm[t];if(!s)return!0;const n=e.value;let r=!0,o="";if(s.required&&(!n||typeof n=="string"&&!n.trim()))r=!1,o=`${t.replace("_"," ").replace(/\b\w/g,d=>d.toUpperCase())} is required.`;else if(!s.required&&(!n||typeof n=="string"&&!n.trim()))r=!0;else for(const d of s.rules||[])if(!d.validate(n)){r=!1,o=d.message;break}const l=this.container.querySelector(`#${t}-error`);return r?(e.classList.remove("error"),l&&(l.textContent="")):(e.classList.add("error"),l&&(l.textContent=o)),r}validateForm(e){const t=e.querySelectorAll("input[required], select[required], textarea[required]");let a=!0;return t.forEach(s=>{this.validateField(s)||(a=!1)}),a}updateSubmitButtonState(){const e=this.container.querySelector("#registration-form");if(!e)return;const t=e.querySelectorAll("input[required], select[required], textarea[required]");let a=!0;t.forEach(n=>{(!n.value||typeof n.value=="string"&&!n.value.trim())&&(a=!1)});const s=e.querySelector("#submit-btn");s&&(s.disabled=!a||this.isSubmitting)}showStatus(e,t,a){this.hideStatus(e);const s=e.querySelector(t==="success"?"#form-success":"#form-error"),n=e.querySelector(t==="success"?"#form-success .registration-form__status-text":"#form-error-text");if(n&&a){const r=n.querySelector("strong");n.innerHTML="",r&&n.appendChild(r),n.appendChild(document.createTextNode(a))}s&&(s.style.display="flex",s.focus())}hideStatus(e){const t=e.querySelector("#form-success"),a=e.querySelector("#form-error");t&&(t.style.display="none"),a&&(a.style.display="none")}setLoadingState(e){this.isSubmitting=e;const t=this.container.querySelector("#submit-btn");t&&(t.disabled=e,t.classList.toggle("loading",e)),this.updateSubmitButtonState()}async handleSubmit(e){e.preventDefault();const t=e.target;if(this.hideStatus(t),!this.validateForm(t)){const o=t.querySelector(".error");o&&o.focus();return}this.setLoadingState(!0);const a=new FormData(t),s=Object.fromEntries(a.entries()),r=zt(s,["full_name","age","phone","email","city","interested_range","experience","message"]);r.age!==void 0&&r.age!==""?r.age=parseInt(r.age,10):delete r.age,r.status="new",r.source="website";try{const o=await this.submitToSupabase(r);this.setLoadingState(!1),o.success?(this.showStatus(t,"success","Your registration request has been submitted successfully. Our team will contact you within 24-48 hours to discuss your training goals."),t.reset(),this.updateSubmitButtonState()):this.showStatus(t,"error",o.error||"Failed to submit registration. Please try again.")}catch(o){this.setLoadingState(!1),console.error("Registration error:",o),this.showStatus(t,"error","An unexpected error occurred. Please try again later.")}}async submitToSupabase(e){if(!this.supabaseUrl||!this.supabaseAnonKey)return{success:!1,error:"Supabase not configured. Please contact the academy directly."};try{const t=await fetch(`${this.supabaseUrl}/rest/v1/${B.REGISTRATIONS}`,{method:"POST",headers:{"Content-Type":"application/json",apikey:this.supabaseAnonKey,Authorization:`Bearer ${this.supabaseAnonKey}`,Prefer:"return=minimal"},body:JSON.stringify(e)});if(!t.ok){const a=await t.text();return console.error("Supabase error:",t.status,a),t.status===429?{success:!1,error:"Too many requests. Please wait a moment and try again."}:{success:!1,error:"Failed to save registration. Please try again."}}return{success:!0}}catch(t){return console.error("Network error:",t),{success:!1,error:"Network error. Please check your connection and try again."}}}destroy(){this.container.innerHTML=""}}function Jt(i,e){return new Kt(i,e)}const Xt=[{id:"s1",name:"10m Air Rifle",duration:"30 min",price:800,includes:["Range time","Air rifle","Targets","Instructor guidance"]},{id:"s2",name:"10m Air Pistol",duration:"30 min",price:800,includes:["Range time","Air pistol","Targets","Instructor guidance"]},{id:"s3",name:"50m Rifle",duration:"1 hour",price:1200,includes:["Range time","Rifle","Targets","Instructor guidance"]},{id:"s4",name:"50m Pistol",duration:"1 hour",price:1200,includes:["Range time","Pistol","Targets","Instructor guidance"]}];class Qt{constructor(e,t={}){this.container=e,this.options={...t},this.init()}init(){this.render()}getSessionsHtml(){return Xt.map(e=>`
      <a href="/pay-play/${e.id}" class="pay-play-session" data-session-id="${e.id}">
        <div class="pay-play-session__header">
          <span class="pay-play-session__name">${e.name}</span>
          <span class="pay-play-session__duration">${e.duration}</span>
        </div>
        <div class="pay-play-session__price">
          ₹${e.price}
          <span class="pay-play-session__price-currency">per person</span>
        </div>
        <p class="pay-play-session__description">
          ${e.includes.join(", ")}
        </p>
      </a>
    `).join("")}render(){this.container.innerHTML=`
      <div class="pay-play-page">
        <div class="pay-play-page__hero">
          <div class="pay-play-page__hero-badge">
            <span>PAY & PLAY</span>
            <span>Book Your Session</span>
          </div>
          <h1 class="pay-play-page__title">
            <span class="pay-play-page__title-accent">Pay & Play</span>
            Shooting Experience
          </h1>
          <p class="pay-play-page__description">
            Choose a session below to view details and book your range time.
            All bookings are subject to admin verification.
          </p>
        </div>
        <div class="pay-play-page__sessions">
          ${this.getSessionsHtml()}
        </div>
      </div>
    `}destroy(){this.container.innerHTML=""}}function Zt(i,e){return new Qt(i,e)}const T=[{id:"s1",name:"10m Air Rifle",duration:"30 min",price:800,includes:["Range time","Air rifle","Targets","Instructor guidance"]},{id:"s2",name:"10m Air Pistol",duration:"30 min",price:800,includes:["Range time","Air pistol","Targets","Instructor guidance"]},{id:"s3",name:"50m Rifle",duration:"1 hour",price:1200,includes:["Range time","Rifle","Targets","Instructor guidance"]},{id:"s4",name:"50m Pistol",duration:"1 hour",price:1200,includes:["Range time","Pistol","Targets","Instructor guidance"]}];class ei{constructor(e,t={}){this.container=e,this.options={...t},this.sessionId=t.sessionId||"s1",this.session=T.find(a=>a.id===this.sessionId)||T[0],this.formData={full_name:"",phone:"",email:"",city:"",experience_level:"beginner",preferred_date:"",preferred_time:"",message:""},this.submitted=!1,this.submitting=!1,this.error="",this.init()}init(){this.render(),this.bindEvents()}getSessionDetailsHtml(){return`
      <div class="pay-play-session-detail">
        <div class="pay-play-session-detail__header">
          <h2 class="pay-play-session-detail__name">${this.session.name}</h2>
          <div class="pay-play-session-detail__meta">
            <span class="pay-play-session-detail__duration">${this.session.duration}</span>
            <span class="pay-play-session-detail__price">₹${this.session.price} / person</span>
          </div>
        </div>
        <div class="pay-play-session-detail__includes">
          <h3>Includes</h3>
          <ul>
            ${this.session.includes.map(e=>`<li>${e}</li>`).join("")}
          </ul>
        </div>
      </div>
    `}getFormHtml(){return this.submitted?`
        <div class="booking-success">
          <div class="booking-success__icon">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
          </div>
          <h3>Booking Request Submitted</h3>
          <p>Your booking request for <strong>${this.session.name}</strong> has been sent to our admin team for verification.</p>
          <p class="booking-success__note">You will receive a confirmation call/email within 24 hours.</p>
          <a href="/pay-play" class="btn btn--primary" style="margin-top: var(--spacing-6);">Browse Other Sessions</a>
        </div>
      `:`
      <form class="booking-form" id="pay-play-booking-form" novalidate>
        <div class="booking-form__section">
          <h3 class="booking-form__section-title">Your Details</h3>
          <div class="form-row">
            <div class="form-group">
              <label for="pp_full_name">Full Name <span class="required-indicator">*</span></label>
              <input type="text" id="pp_full_name" name="full_name" value="${this.formData.full_name}" required />
              <p class="form-group__error" id="pp_full_name-error">This field is required</p>
            </div>
            <div class="form-group">
              <label for="pp_phone">Phone <span class="required-indicator">*</span></label>
              <input type="tel" id="pp_phone" name="phone" value="${this.formData.phone}" required />
              <p class="form-group__error" id="pp_phone-error">This field is required</p>
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label for="pp_email">Email <span class="required-indicator">*</span></label>
              <input type="email" id="pp_email" name="email" value="${this.formData.email}" required />
              <p class="form-group__error" id="pp_email-error">This field is required</p>
            </div>
            <div class="form-group">
              <label for="pp_city">City <span class="required-indicator">*</span></label>
              <input type="text" id="pp_city" name="city" value="${this.formData.city}" required />
              <p class="form-group__error" id="pp_city-error">This field is required</p>
            </div>
          </div>
          <div class="form-group">
            <label for="pp_experience_level">Experience Level <span class="required-indicator">*</span></label>
            <select id="pp_experience_level" name="experience_level" required>
              <option value="beginner" ${this.formData.experience_level==="beginner"?"selected":""}>Beginner</option>
              <option value="intermediate" ${this.formData.experience_level==="intermediate"?"selected":""}>Intermediate</option>
              <option value="advanced" ${this.formData.experience_level==="advanced"?"selected":""}>Advanced</option>
            </select>
          </div>
        </div>

        <div class="booking-form__section">
          <h3 class="booking-form__section-title">Preferred Schedule</h3>
          <div class="form-row">
            <div class="form-group">
              <label for="pp_preferred_date">Preferred Date <span class="required-indicator">*</span></label>
              <input type="date" id="pp_preferred_date" name="preferred_date" value="${this.formData.preferred_date}" required min="${new Date().toISOString().split("T")[0]}" />
              <p class="form-group__error" id="pp_preferred_date-error">Please select a date</p>
            </div>
            <div class="form-group">
              <label for="pp_preferred_time">Preferred Time <span class="required-indicator">*</span></label>
              <select id="pp_preferred_time" name="preferred_time" required>
                <option value="">Select time</option>
                <option value="09:00" ${this.formData.preferred_time==="09:00"?"selected":""}>9:00 AM</option>
                <option value="10:00" ${this.formData.preferred_time==="10:00"?"selected":""}>10:00 AM</option>
                <option value="11:00" ${this.formData.preferred_time==="11:00"?"selected":""}>11:00 AM</option>
                <option value="14:00" ${this.formData.preferred_time==="14:00"?"selected":""}>2:00 PM</option>
                <option value="15:00" ${this.formData.preferred_time==="15:00"?"selected":""}>3:00 PM</option>
                <option value="16:00" ${this.formData.preferred_time==="16:00"?"selected":""}>4:00 PM</option>
              </select>
              <p class="form-group__error" id="pp_preferred_time-error">Please select a time</p>
            </div>
          </div>
        </div>

        <div class="booking-form__section">
          <h3 class="booking-form__section-title">Additional Information</h3>
          <div class="form-group">
            <label for="pp_message">Message (Optional)</label>
            <textarea id="pp_message" name="message" rows="3" placeholder="Any special requests, group booking details, or questions...">${this.formData.message}</textarea>
          </div>
        </div>

        ${this.error?`<div class="booking-form__error">${this.error}</div>`:""}

        <div class="booking-form__actions">
          <a href="/pay-play" class="btn btn--secondary">Back to Sessions</a>
          <button type="submit" class="btn btn--primary btn--large" ${this.submitting?"disabled":""}>
            ${this.submitting?'<span class="btn__spinner"></span>Submitting...':"Submit Booking Request"}
          </button>
        </div>
      </form>
    `}render(){this.container.innerHTML=`
      <div class="pay-play-session-page">
        <div class="pay-play-session-page__hero">
          <a href="/pay-play" class="pay-play-session-page__back" aria-label="Back to sessions">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5"/><polyline points="12 19 5 12 12 5"/></svg>
            <span>Back to Sessions</span>
          </a>
          <div class="pay-play-session-page__badge">PAY & PLAY</div>
          <h1 class="pay-play-session-page__title">${this.session.name}</h1>
        </div>

        <div class="pay-play-session-page__content">
          <div class="pay-play-session-page__sidebar">
            ${this.getSessionDetailsHtml()}
            <div class="pay-play-session-page__price-card">
              <div class="pay-play-session-page__price-amount">₹${this.session.price}</div>
              <div class="pay-play-session-page__price-label">per person / ${this.session.duration}</div>
            </div>
          </div>

          <div class="pay-play-session-page__main">
            ${this.getFormHtml()}
          </div>
        </div>
      </div>
    `}bindEvents(){const e=this.container.querySelector("#pay-play-booking-form");e&&(e.querySelectorAll("input, select, textarea").forEach(t=>{t.addEventListener("input",a=>{this.formData[a.target.name]=a.target.value;const s=this.container.querySelector(`#pp_${a.target.name}-error`);s&&(s.textContent="",a.target.classList.remove("error"))}),t.addEventListener("blur",a=>{this.validateField(a.target)})}),e.addEventListener("submit",t=>this.handleSubmit(t)))}validateField(e){if(!e.name)return!0;const t=e.value.trim();let a=!0,s="";e.hasAttribute("required")&&!t?(a=!1,s="This field is required"):e.name==="email"&&t&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(t)?(a=!1,s="Please enter a valid email address"):e.name==="phone"&&t&&!/^[\d\s\-\+\(\)]{10,}$/.test(t)&&(a=!1,s="Please enter a valid phone number");const n=this.container.querySelector(`#pp_${e.name}-error`);return a?(e.classList.remove("error"),n&&(n.textContent="")):(e.classList.add("error"),n&&(n.textContent=s)),a}validateForm(){const e=["full_name","phone","email","city","experience_level","preferred_date","preferred_time"];let t=!0;return e.forEach(a=>{const s=this.container.querySelector(`[name="${a}"]`);s&&!this.validateField(s)&&(t=!1)}),t}async handleSubmit(e){if(e.preventDefault(),!this.validateForm()){const t=this.container.querySelector(".error");t&&t.focus();return}this.submitting=!0,this.error="",this.render(),this.bindEvents();try{const t=y();if(!t.url||!t.anonKey)throw new Error("Supabase not configured");const a={full_name:this.formData.full_name,phone:this.formData.phone,email:this.formData.email,city:this.formData.city,experience_level:this.formData.experience_level,session_id:this.session.id,preferred_date:this.formData.preferred_date,preferred_time:this.formData.preferred_time,message:this.formData.message,amount:this.session.price,payment_status:"pending",booking_status:"pending"},s=await fetch(`${t.url}/rest/v1/${B.PAY_PLAY_BOOKINGS}`,{method:"POST",headers:{"Content-Type":"application/json",apikey:t.anonKey,Authorization:`Bearer ${t.anonKey}`,Prefer:"return=representation"},body:JSON.stringify(a)});if(!s.ok){const n=await s.text();throw console.error("Supabase error:",s.status,n),new Error("Failed to submit booking. Please try again.")}this.submitted=!0,this.submitting=!1,this.render(),this.bindEvents()}catch(t){console.error("Booking error:",t),this.submitting=!1,this.error=t.message||"An error occurred. Please try again.",this.render(),this.bindEvents()}}destroy(){this.container.innerHTML=""}}function ti(i,e){return new ei(i,e)}const N="matsya_admin_session";async function ii(i,e){throw y(),new Error("Supabase not configured")}async function ai(){k()&&y(),localStorage.removeItem(N)}async function k(){try{const i=localStorage.getItem(N);if(!i)return null;const e=JSON.parse(i);return Date.now()>e.expires_at-6e4?await si(e):e}catch{return null}}async function si(i){return y(),null}async function R(){const i=await k();if(!i)return null;const e=y();return{Authorization:`Bearer ${i.access_token}`,apikey:e.anonKey}}const ni='<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>';class j{constructor(e,t={}){this.container=e,this.options={...t},this.isLoading=!1,this.error="",this.init()}init(){if(k()){window.location.href="/admin/";return}this.render(),this.bindEvents()}render(){this.container.innerHTML=`
      <section class="admin-login-page" aria-labelledby="admin-login-title">
        <div class="admin-login-page__container">
          <div class="admin-login-page__card">
            <div class="admin-login-page__header">
              <div class="admin-login-page__logo">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
              </div>
              <h1 id="admin-login-title" class="admin-login-page__title">Admin Login</h1>
              <p class="admin-login-page__subtitle">Matsya Shooting Sports Academy</p>
            </div>

            ${this.error?`
              <div class="admin-login-page__error" role="alert">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
                <span>${this.error}</span>
              </div>
            `:""}

            <form class="admin-login-page__form" id="admin-login-form" novalidate>
              <div class="form-group">
                <label for="admin-email">Email</label>
                <input
                  type="email"
                  id="admin-email"
                  name="email"
                  autocomplete="email"
                  placeholder="admin@matsyaacademy.com"
                  required
                  ${this.isLoading?"disabled":""}
                />
              </div>

              <div class="form-group">
                <label for="admin-password">Password</label>
                <input
                  type="password"
                  id="admin-password"
                  name="password"
                  autocomplete="current-password"
                  placeholder="Enter your password"
                  required
                  ${this.isLoading?"disabled":""}
                />
              </div>

              <button type="submit" class="btn btn--primary btn--large admin-login-page__submit" ${this.isLoading?"disabled":""}>
                ${this.isLoading?`
                  <svg class="btn__spinner" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a10 10 0 0 1 10 10"/></svg>
                  <span>Signing in...</span>
                `:`
                  ${ni}
                  <span>Sign In</span>
                `}
              </button>
            </form>

            <div class="admin-login-page__footer">
              <p>Only authorized administrators can access this panel.</p>
              <a href="/" class="admin-login-page__back-link">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5"/><polyline points="12 19 5 12 12 5"/></svg>
                Back to Website
              </a>
            </div>
          </div>
        </div>
      </section>
    `}bindEvents(){const e=this.container.querySelector("#admin-login-form");e&&e.addEventListener("submit",t=>this.handleSubmit(t))}async handleSubmit(e){var n,r;e.preventDefault(),this.error="";const t=new FormData(e.target),a=(n=t.get("email"))==null?void 0:n.toString().trim(),s=(r=t.get("password"))==null?void 0:r.toString();if(!a||!s){this.error="Please enter both email and password",this.render(),this.bindEvents();return}this.isLoading=!0,this.render(),this.bindEvents();try{await ii(a,s),window.location.href="/admin/"}catch(o){this.isLoading=!1,this.error=o.message||"Login failed. Please check your credentials.",this.render(),this.bindEvents()}}destroy(){this.container.innerHTML=""}}function F(i,e){return new j(i,e)}const ri=Object.freeze(Object.defineProperty({__proto__:null,AdminLoginPage:j,createAdminLoginPage:F},Symbol.toStringTag,{value:"Module"})),oi=[{key:"dashboard",label:"Dashboard",icon:'<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>'},{key:"homepage",label:"Homepage",icon:'<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>'},{key:"training",label:"Training",icon:'<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>'},{key:"coaches",label:"Coaches",icon:'<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>'},{key:"facilities",label:"Facilities",icon:'<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>'},{key:"achievements",label:"Achievements",icon:'<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>'},{key:"gallery",label:"Gallery",icon:'<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>'},{key:"reviews",label:"Reviews",icon:'<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>'},{key:"registrations",label:"Registrations",icon:'<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>'},{key:"pay-play",label:"Pay & Play",icon:'<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>'},{key:"contact",label:"Contact Settings",icon:'<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>'},{key:"motivational",label:"Motivational Quotes",icon:'<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>'},{key:"sections",label:"Site Sections",icon:'<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>'},{key:"settings",label:"Settings",icon:'<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>'}];class D{constructor(e,t={}){this.container=e,this.options={...t},this.currentSection=t.initialSection||"dashboard",this.isSidebarOpen=!1,this.adminUser=null,this.init()}async init(){const e=k();e&&(this.adminUser=e.user),this.render(),this.bindEvents()}setSection(e){this.currentSection=e,this.isSidebarOpen=!1,this.updateActiveNav(),this.options.onSectionChange&&this.options.onSectionChange(e)}getMenuHtml(){return oi.map(e=>`
      <button
        class="admin-sidebar__item ${this.currentSection===e.key?"admin-sidebar__item--active":""}"
        data-section="${e.key}"
        aria-current="${this.currentSection===e.key?"page":"false"}"
      >
        <span class="admin-sidebar__icon">${e.icon}</span>
        <span class="admin-sidebar__label">${e.label}</span>
      </button>
    `).join("")}render(){var e,t,a,s,n,r,o,l,d,_,u,w;this.container.innerHTML=`
      <div class="admin-layout">
        <aside class="admin-sidebar" role="navigation" aria-label="Admin navigation">
          <div class="admin-sidebar__header">
            <div class="admin-sidebar__logo">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
              <span class="admin-sidebar__brand">Matsya Admin</span>
            </div>
            <button class="admin-sidebar__toggle" aria-label="Toggle sidebar" aria-expanded="false">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
            </button>
          </div>

          <nav class="admin-sidebar__nav">
            ${this.getMenuHtml()}
          </nav>

          <div class="admin-sidebar__footer">
            <div class="admin-sidebar__divider"></div>
            <button class="admin-sidebar__logout" data-action="logout">
              <span class="admin-sidebar__logout-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
              </span>
              <span class="admin-sidebar__logout-label">Logout</span>
            </button>
          </div>
        </aside>

        <div class="admin-sidebar__overlay" aria-hidden="true"></div>

        <div class="admin-main">
          <header class="admin-header">
            <div class="admin-header__left">
              <h1 class="admin-header__title" id="admin-section-title">Dashboard</h1>
            </div>
            <div class="admin-header__right">
              <div class="admin-header__user">
                <div class="admin-header__user-avatar" aria-hidden="true">
                  ${((s=(a=(t=(e=this.adminUser)==null?void 0:e.user_metadata)==null?void 0:t.full_name)==null?void 0:a.charAt(0))==null?void 0:s.toUpperCase())||((o=(r=(n=this.adminUser)==null?void 0:n.email)==null?void 0:r.charAt(0))==null?void 0:o.toUpperCase())||"A"}
                </div>
                <div class="admin-header__user-info">
                  <span class="admin-header__user-name">${((d=(l=this.adminUser)==null?void 0:l.user_metadata)==null?void 0:d.full_name)||((_=this.adminUser)==null?void 0:_.email)||"Administrator"}</span>
                  <span class="admin-header__user-role">${((w=(u=this.adminUser)==null?void 0:u.user_metadata)==null?void 0:w.role)||"Admin"}</span>
                </div>
              </div>
              <button class="admin-header__menu-toggle" aria-label="Open menu" aria-expanded="false">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
              </button>
            </div>
          </header>

          <main class="admin-content" id="admin-content" role="main">
          </main>
        </div>
      </div>
    `}bindEvents(){var e,t,a,s;this.container.querySelectorAll(".admin-sidebar__item").forEach(n=>{n.addEventListener("click",()=>{this.setSection(n.dataset.section)})}),(e=this.container.querySelector(".admin-sidebar__logout"))==null||e.addEventListener("click",async()=>{await ai(),window.location.href="/admin/login"}),(t=this.container.querySelector(".admin-sidebar__toggle"))==null||t.addEventListener("click",()=>{this.toggleSidebar()}),(a=this.container.querySelector(".admin-sidebar__overlay"))==null||a.addEventListener("click",()=>{this.closeSidebar()}),(s=this.container.querySelector(".admin-header__menu-toggle"))==null||s.addEventListener("click",()=>{this.toggleSidebar()})}toggleSidebar(){var a,s;this.isSidebarOpen=!this.isSidebarOpen,(a=this.container.querySelector(".admin-sidebar"))==null||a.classList.toggle("admin-sidebar--open",this.isSidebarOpen),(s=this.container.querySelector(".admin-sidebar__overlay"))==null||s.classList.toggle("admin-sidebar__overlay--visible",this.isSidebarOpen);const e=this.container.querySelector(".admin-sidebar__toggle");e&&e.setAttribute("aria-expanded",this.isSidebarOpen.toString());const t=this.container.querySelector(".admin-header__menu-toggle");t&&t.setAttribute("aria-expanded",this.isSidebarOpen.toString())}closeSidebar(){var a,s;this.isSidebarOpen=!1,(a=this.container.querySelector(".admin-sidebar"))==null||a.classList.remove("admin-sidebar--open"),(s=this.container.querySelector(".admin-sidebar__overlay"))==null||s.classList.remove("admin-sidebar__overlay--visible");const e=this.container.querySelector(".admin-sidebar__toggle");e&&e.setAttribute("aria-expanded","false");const t=this.container.querySelector(".admin-header__menu-toggle");t&&t.setAttribute("aria-expanded","false")}updateActiveNav(){this.container.querySelectorAll(".admin-sidebar__item").forEach(a=>{const s=a.dataset.section===this.currentSection;a.classList.toggle("admin-sidebar__item--active",s),a.setAttribute("aria-current",s?"page":"false")});const e={dashboard:"Dashboard",homepage:"Homepage Content",training:"Training Management",coaches:"Coach Management",facilities:"Facility Management",achievements:"Achievements Management",gallery:"Gallery Management",reviews:"Review Management",registrations:"Registrations","pay-play":"Pay & Play Management",contact:"Contact Settings",motivational:"Motivational Quotes",sections:"Site Section Visibility",settings:"Settings"},t=this.container.querySelector("#admin-section-title");t&&(t.textContent=e[this.currentSection]||"Dashboard")}destroy(){this.container.innerHTML=""}}function z(i,e){return new D(i,e)}const li=Object.freeze(Object.defineProperty({__proto__:null,AdminLayout:D,createAdminLayout:z},Symbol.toStringTag,{value:"Module"})),P=[{key:"registrations_total",label:"Total Registrations",icon:'<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>',color:"var(--color-accent-bright)"},{key:"registrations_new",label:"New Registrations",icon:'<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>',color:"var(--color-gold-score)"},{key:"pay_play_pending",label:"Pending Bookings",icon:'<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',color:"#f59e0b"},{key:"gallery_images",label:"Gallery Images",icon:'<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>',color:"#8b5cf6"},{key:"coaches",label:"Coaches",icon:'<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/></svg>',color:"#ec4899"},{key:"achievements",label:"Achievements",icon:'<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/></svg>',color:"#f97316"},{key:"reviews",label:"Reviews",icon:'<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/></svg>',color:"#06b6d4"},{key:"training_ranges",label:"Training Ranges",icon:'<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/></svg>',color:"#84cc16"}];class V{constructor(e,t={}){this.container=e,this.options={...t},this.stats={},this.recentActivity=[],this.init()}async init(){this.renderLoading(),await this.fetchStats(),await this.fetchRecentActivity(),this.render()}async fetchStats(){await R()&&y()}async fetchRecentActivity(){await R()&&y()}renderLoading(){this.container.innerHTML=`
      <div class="admin-dashboard">
        <div class="admin-dashboard__header">
          <h2 class="admin-dashboard__title">Dashboard</h2>
          <p class="admin-dashboard__subtitle">Overview of academy metrics</p>
        </div>
        <div class="admin-dashboard__stats">
          ${P.map(()=>`
            <div class="admin-stat-card admin-stat-card--loading">
              <div class="admin-stat-card__skeleton"></div>
              <div class="admin-stat-card__skeleton"></div>
              <div class="admin-stat-card__skeleton"></div>
            </div>
          `).join("")}
        </div>
        <div class="admin-dashboard__activity admin-activity--loading">
          <div class="admin-activity__skeleton"></div>
          <div class="admin-activity__skeleton"></div>
          <div class="admin-activity__skeleton"></div>
        </div>
      </div>
    `}render(){this.container.innerHTML=`
      <div class="admin-dashboard">
        <div class="admin-dashboard__header">
          <h2 class="admin-dashboard__title">Dashboard</h2>
          <p class="admin-dashboard__subtitle">Overview of academy metrics</p>
        </div>

        <div class="admin-dashboard__stats">
          ${P.map(e=>{const t=this.stats[e.key]||0;return`
              <div class="admin-stat-card" style="--stat-color: ${e.color};">
                <div class="admin-stat-card__icon" aria-hidden="true">
                  ${e.icon}
                </div>
                <div class="admin-stat-card__content">
                  <div class="admin-stat-card__value">${this.formatNumber(t)}</div>
                  <div class="admin-stat-card__label">${e.label}</div>
                </div>
              </div>
            `}).join("")}
        </div>

        <div class="admin-dashboard__activity">
          <h3 class="admin-dashboard__section-title">Recent Activity</h3>
          ${this.recentActivity.length>0?`
            <div class="admin-activity__list">
              ${this.recentActivity.map(e=>`
                <div class="admin-activity__item">
                  <div class="admin-activity__icon admin-activity__icon--${e.type}">
                    ${e.type==="registration"?'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>':'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>'}
                  </div>
                  <div class="admin-activity__content">
                    <div class="admin-activity__label">${e.label}</div>
                    <div class="admin-activity__details">${e.name} &middot; ${e.email}</div>
                  </div>
                  <time class="admin-activity__time" datetime="${e.time}">${this.formatRelativeTime(e.time)}</time>
                </div>
              `).join("")}
            </div>
          `:`
            <div class="admin-activity__empty">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              <p>No recent activity</p>
            </div>
          `}
        </div>
      </div>
    `}formatNumber(e){return e>=1e6?(e/1e6).toFixed(1)+"M":e>=1e3?(e/1e3).toFixed(1)+"K":e.toString()}formatRelativeTime(e){const t=new Date(e),s=new Date-t,n=Math.floor(s/6e4),r=Math.floor(s/36e5),o=Math.floor(s/864e5);return n<1?"Just now":n<60?`${n}m ago`:r<24?`${r}h ago`:o<7?`${o}d ago`:t.toLocaleDateString()}destroy(){this.container.innerHTML=""}}function U(i,e){return new V(i,e)}const ci=Object.freeze(Object.defineProperty({__proto__:null,AdminDashboard:V,createAdminDashboard:U},Symbol.toStringTag,{value:"Module"}));class di{constructor(){this.currentRoute=null,this.handlers=new Map,this.init()}init(){window.addEventListener("popstate",()=>this.handleRouteChange()),document.addEventListener("click",e=>{const t=e.target.closest('a[href^="/"]');t&&!t.hasAttribute("target")&&(e.preventDefault(),this.navigate(t.getAttribute("href")))}),this.handleRouteChange()}navigate(e){e!==this.currentRoute&&(window.history.pushState({},"",e),this.handleRouteChange())}handleRouteChange(){const e=window.location.pathname;this.currentRoute=e;const t=this.handlers.get(e)||this.handlers.get("*");t&&t(e)}on(e,t){this.handlers.set(e,t)}getCurrentRoute(){return this.currentRoute}}const h=new di,I=document.getElementById("app");let p=null,c=null,m=null;function H(){const e=window.location.pathname.startsWith("/admin");e?I.innerHTML=`
      <main id="main-content" role="main"></main>
    `:I.innerHTML=`
      <header id="navbar-container"></header>
      <main id="main-content" role="main"></main>
      <footer id="footer-container"></footer>
    `;const t=document.getElementById("main-content");if(e)p=null;else{const a=document.getElementById("navbar-container"),s=document.getElementById("footer-container");p=Z(a,{currentPath:window.location.pathname}),Ue(s)}hi(t),h.handleRouteChange()}function hi(i){h.on("/",()=>pi(i)),h.on("/about",()=>gi(i)),h.on("/training",()=>ui(i)),h.on("/coaches",()=>vi(i)),h.on("/facilities",()=>mi(i)),h.on("/achievements",()=>_i(i)),h.on("/gallery",()=>fi(i)),h.on("/reviews",()=>yi(i)),h.on("/contact",()=>bi(i)),h.on("/register",()=>wi(i)),h.on("/pay-play",()=>O(i)),h.on("/pay-play/",e=>{const t=e.split("/pay-play/")[1];t?xi(i,t):O(i)}),h.on("/admin/login",()=>ki(i)),h.on("/admin/",async()=>await q(i)),h.on("/admin/dashboard",async()=>await q(i)),h.on("*",()=>Si(i))}function g(i){c&&typeof c.destroy=="function"&&c.destroy(),m&&typeof m.destroy=="function"&&(m.destroy(),m=null),i.innerHTML="",c=null}function pi(i){g(i),p.updateCurrentPath("/");const e=document.createElement("div");i.appendChild(e),ae(e);const t=document.createElement("div");i.appendChild(t),re(t);const a=document.createElement("div");a.id="about",i.appendChild(a),de(a);const s=document.createElement("div");s.id="training",i.appendChild(s),ue(s);const n=document.createElement("div");n.id="coaches",i.appendChild(n),fe(n);const r=document.createElement("div");r.id="achievements",i.appendChild(r),we(r);const o=document.createElement("div");o.id="facilities",i.appendChild(o),Se(o);const l=document.createElement("div");l.id="gallery",i.appendChild(l),Ee(l);const d=document.createElement("div");d.id="reviews",i.appendChild(d),He(d);const _=document.createElement("div");i.appendChild(_),Be(_);const u=document.createElement("div");i.appendChild(u),je(u)}function gi(i){g(i),p.updateCurrentPath("/about");const e=document.createElement("div");i.appendChild(e),c=Ke(e)}function ui(i){g(i),p.updateCurrentPath("/training");const e=document.createElement("div");i.appendChild(e),c=et(e)}function vi(i){g(i),p.updateCurrentPath("/coaches");const e=document.createElement("div");i.appendChild(e),c=nt(e)}function mi(i){g(i),p.updateCurrentPath("/facilities");const e=document.createElement("div");i.appendChild(e),c=ht(e)}function _i(i){g(i),p.updateCurrentPath("/achievements");const e=document.createElement("div");i.appendChild(e),c=ft(e)}function fi(i){g(i),p.updateCurrentPath("/gallery");const e=document.createElement("div");i.appendChild(e),c=Lt(e)}function yi(i){g(i),p.updateCurrentPath("/reviews");const e=document.createElement("div");i.appendChild(e),c=Ht(e)}function bi(i){g(i),p.updateCurrentPath("/contact");const e=document.createElement("div");i.appendChild(e),c=Ft(e)}function wi(i){g(i),p.updateCurrentPath("/register");const e=document.createElement("div");i.appendChild(e),c=Jt(e)}function O(i){g(i),p.updateCurrentPath("/pay-play");const e=document.createElement("div");i.appendChild(e),c=Zt(e)}function xi(i,e){g(i),p.updateCurrentPath(`/pay-play/${e}`);const t=document.createElement("div");i.appendChild(t),c=ti(t,{sessionId:e})}function ki(i){g(i),m&&(m.destroy(),m=null);const e=document.createElement("div");i.appendChild(e),c=F(e)}async function q(i){const{isAdminAuthenticated:e}=require("./lib/admin-auth");if(!await e()){window.location.href="/admin/login";return}g(i);const t=document.createElement("div");i.appendChild(t),m=z(t,{initialSection:"dashboard",onSectionChange:s=>{Ai(i,s)}});const a=t.querySelector("#admin-content");a&&(c=U(a))}async function Ai(i,e){const{isAdminAuthenticated:t}=require("./lib/admin-auth");if(!await t()){window.location.href="/admin/login";return}if(!m)return;const a=m.container.querySelector("#admin-content");a&&(c&&typeof c.destroy=="function"&&c.destroy(),a.innerHTML="",K(Object.assign({"./components/AdminDashboard/index.js":()=>A(()=>Promise.resolve().then(()=>ci),void 0),"./components/AdminLayout/index.js":()=>A(()=>Promise.resolve().then(()=>li),void 0),"./components/AdminLoginPage/index.js":()=>A(()=>Promise.resolve().then(()=>ri),void 0)}),`./components/Admin${e.charAt(0).toUpperCase()+e.slice(1)}/index.js`,4).then(s=>{const n=s[`createAdmin${e.charAt(0).toUpperCase()+e.slice(1)}`];n&&(c=n(a))}).catch(()=>{a.innerHTML=`
        <div class="admin-coming-soon">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          <h3>${e.charAt(0).toUpperCase()+e.slice(1)} Management</h3>
          <p>Coming soon...</p>
        </div>
      `}))}function Si(i){g(i),p.updateCurrentPath(window.location.pathname),i.innerHTML=`
    <section class="not-found" style="padding: var(--spacing-20) 0; text-align: center;">
      <div class="container">
        <h1 style="font-family: var(--font-family-display); font-size: var(--font-size-5xl); font-weight: var(--font-weight-bold); color: var(--color-text-primary); margin-bottom: var(--spacing-4);">404</h1>
        <p style="font-size: var(--font-size-xl); color: var(--color-text-secondary); margin-bottom: var(--spacing-8);">Page Not Found</p>
        <a href="/" class="btn btn--primary btn--large">Return Home</a>
      </div>
    </section>
  `}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",H):H();
//# sourceMappingURL=main-DF3PU1SP.js.map
