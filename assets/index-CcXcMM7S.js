(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const i of document.querySelectorAll('link[rel="modulepreload"]'))s(i);new MutationObserver(i=>{for(const a of i)if(a.type==="childList")for(const r of a.addedNodes)r.tagName==="LINK"&&r.rel==="modulepreload"&&s(r)}).observe(document,{childList:!0,subtree:!0});function t(i){const a={};return i.integrity&&(a.integrity=i.integrity),i.referrerPolicy&&(a.referrerPolicy=i.referrerPolicy),i.crossOrigin==="use-credentials"?a.credentials="include":i.crossOrigin==="anonymous"?a.credentials="omit":a.credentials="same-origin",a}function s(i){if(i.ep)return;i.ep=!0;const a=t(i);fetch(i.href,a)}})();const v="modulepreload",f=function(h){return"/Storyboard/"+h},b={},m=function(e,t,s){let i=Promise.resolve();if(t&&t.length>0){let n=function(l){return Promise.all(l.map(c=>Promise.resolve(c).then(d=>({status:"fulfilled",value:d}),d=>({status:"rejected",reason:d}))))};document.getElementsByTagName("link");const r=document.querySelector("meta[property=csp-nonce]"),o=r?.nonce||r?.getAttribute("nonce");i=n(t.map(l=>{if(l=f(l),l in b)return;b[l]=!0;const c=l.endsWith(".css"),d=c?'[rel="stylesheet"]':"";if(document.querySelector(`link[href="${l}"]${d}`))return;const p=document.createElement("link");if(p.rel=c?"stylesheet":v,c||(p.as="script"),p.crossOrigin="",p.href=l,o&&p.setAttribute("nonce",o),document.head.appendChild(p),c)return new Promise((g,u)=>{p.addEventListener("load",g),p.addEventListener("error",()=>u(new Error(`Unable to preload CSS for ${l}`)))})}))}function a(r){const o=new Event("vite:preloadError",{cancelable:!0});if(o.payload=r,window.dispatchEvent(o),!o.defaultPrevented)throw r}return i.then(r=>{for(const o of r||[])o.status==="rejected"&&a(o.reason);return e().catch(a)})};class y{constructor({onLogin:e,onRegister:t}){this.onLogin=e,this.onRegister=t,this.mode="login"}render(){const e=document.createElement("div");e.className="auth-container";const t=document.createElement("div");return t.className="auth-card",t.innerHTML=`
            <div class="text-center mb-4">
                <div class="logo-icon" style="width: 4rem; height: 4rem; margin: 0 auto 1rem;">🎬</div>
                <h1 class="text-2xl font-black uppercase tracking-wider">StoryBoard</h1>
                <p class="text-gray text-xs mt-1">Develop by Ritesh Gupta</p>
            </div>

            <div class="tabs mb-4" style="justify-content: center;">
                <button class="tab ${this.mode==="login"?"active":""}" data-mode="login">Login</button>
                <button class="tab ${this.mode==="register"?"active":""}" data-mode="register">Register</button>
            </div>

            <form id="auth-form">
                <div class="form-group">
                    <label class="form-label">Username</label>
                    <input type="text" class="form-control" id="username" required>
                </div>

                ${this.mode==="register"?`
                    <div class="form-group">
                        <label class="form-label">Email</label>
                        <input type="email" class="form-control" id="email" required>
                    </div>
                `:""}

                <div class="form-group">
                    <label class="form-label">Password</label>
                    <input type="password" class="form-control" id="password" required>
                </div>

                ${this.mode==="register"?`
                    <div class="form-group">
                        <label class="form-label">Confirm Password</label>
                        <input type="password" class="form-control" id="confirm-password" required>
                    </div>
                `:""}

                <button type="submit" class="btn btn-primary w-full">
                    ${this.mode==="login"?"Login":"Register"}
                </button>
            </form>

            <p class="text-center text-gray text-xs mt-4">
                ${this.mode==="login"?"You're Welcome":"Create your account to start"}
            </p>
        `,t.querySelectorAll(".tab").forEach(i=>{i.addEventListener("click",()=>{this.mode=i.dataset.mode,e.innerHTML="",e.appendChild(this.render())})}),t.querySelector("#auth-form").addEventListener("submit",async i=>{i.preventDefault();const a=document.getElementById("username").value,r=document.getElementById("password").value;if(this.mode==="login")await this.onLogin(a,r);else{const o=document.getElementById("email").value,n=document.getElementById("confirm-password").value;if(r!==n){alert("Passwords do not match");return}await this.onRegister(a,r,o)}}),e.appendChild(t),e}}class x{constructor({state:e,onUpdate:t,onAnalyze:s,onRefImageChange:i,onCastImageChange:a}){this.state=e,this.onUpdate=t,this.onAnalyze=s,this.onRefImageChange=i,this.onCastImageChange=a}render(){const e=document.createElement("div");e.className="grid grid-2 gap-4 fade-in";const t=document.createElement("div");t.className="space-y-4";const s=document.createElement("div");if(s.className="flex gap-2 mb-4",s.innerHTML=`
            <button class="btn ${this.state.createSubTab==="SINGLE"?"btn-primary":"btn-secondary"}" data-subtab="SINGLE">Single Lead</button>
            <button class="btn ${this.state.createSubTab==="CAST"?"btn-primary":"btn-secondary"}" data-subtab="CAST">Cast Production</button>
        `,s.querySelectorAll("button").forEach(n=>{n.addEventListener("click",()=>{this.onUpdate({createSubTab:n.dataset.subtab})})}),t.appendChild(s),this.state.createSubTab==="SINGLE"){const n=document.createElement("div");n.className="grid grid-2 gap-4",n.innerHTML=`
                <div class="form-group">
                    <label class="form-label">Character Reference</label>
                    <div class="border-2 border-dashed border-border rounded-xl p-4 text-center cursor-pointer hover:border-primary transition-all" id="ref-image-upload">
                        ${this.state.refImage?`<img src="${this.state.refImage}" class="max-w-full h-32 mx-auto object-contain">`:`<div>
                                <div class="text-3xl mb-2">📷</div>
                                <div class="text-xs font-bold uppercase">Upload Face Reference</div>
                            </div>`}
                    </div>
                    <input type="file" id="ref-image-input" accept="image/*" style="display: none;">
                </div>

                <div class="space-y-4">
                    <div class="form-group">
                        <label class="form-label">Character DNA</label>
                        <textarea class="form-control" id="main-character" placeholder="Age, facial features, hair style, eye color...">${this.state.mainCharacter}</textarea>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Outfit DNA</label>
                        <textarea class="form-control" id="outfit-dna" placeholder="Clothing type, colors, style...">${this.state.outfitDNA}</textarea>
                    </div>
                </div>
            `,n.querySelector("#ref-image-upload").addEventListener("click",()=>{document.getElementById("ref-image-input").click()}),n.querySelector("#ref-image-input").addEventListener("change",l=>{l.target.files[0]&&this.onRefImageChange(l.target.files[0])}),n.querySelector("#main-character").addEventListener("input",l=>{this.onUpdate({mainCharacter:l.target.value})}),n.querySelector("#outfit-dna").addEventListener("input",l=>{this.onUpdate({outfitDNA:l.target.value})}),t.appendChild(n)}else{const n=document.createElement("div");n.className="grid grid-3 gap-4";const l=[{id:"hero",label:"Hero",icon:"👨"},{id:"heroine",label:"Heroine",icon:"👩"},{id:"father",label:"Father",icon:"👨"},{id:"mother",label:"Mother",icon:"👩"},{id:"sister",label:"Sister",icon:"👧"},{id:"dada",label:"Dada",icon:"👴"},{id:"dadi",label:"Dadi",icon:"👵"},{id:"neighbor",label:"Neighbor",icon:"🧔"},{id:"community",label:"Community",icon:"👥"}];n.innerHTML=l.map(c=>`
                <div class="form-group">
                    <label class="form-label">${c.label}</label>
                    <div class="border-2 border-dashed border-border rounded-xl p-2 text-center cursor-pointer hover:border-primary transition-all aspect-square flex flex-col items-center justify-center" id="cast-${c.id}">
                        ${this.state.castImages[c.id]?`<img src="${this.state.castImages[c.id]}" class="w-full h-full object-cover rounded-lg">`:`<div>
                                <div class="text-2xl mb-1">${c.icon}</div>
                                <div class="text-[8px] font-bold uppercase">Upload</div>
                            </div>`}
                    </div>
                    <input type="file" id="cast-input-${c.id}" accept="image/*" style="display: none;">
                </div>
            `).join(""),l.forEach(c=>{n.querySelector(`#cast-${c.id}`).addEventListener("click",()=>{document.getElementById(`cast-input-${c.id}`).click()}),n.querySelector(`#cast-input-${c.id}`).addEventListener("change",d=>{d.target.files[0]&&this.onCastImageChange(c.id,d.target.files[0])})}),t.appendChild(n)}const i=document.createElement("div");i.className="grid grid-2 gap-4 mt-4",i.innerHTML=`
            <div class="form-group">
                <label class="form-label">Environment DNA</label>
                <textarea class="form-control" id="global-setting" placeholder="World setting, atmosphere, time of day...">${this.state.globalSetting}</textarea>
            </div>
            <div class="form-group">
                <label class="form-label">Object DNA</label>
                <textarea class="form-control" id="key-objects" placeholder="Essential props, items...">${this.state.keyObjects}</textarea>
            </div>
        `,i.querySelector("#global-setting").addEventListener("input",n=>{this.onUpdate({globalSetting:n.target.value})}),i.querySelector("#key-objects").addEventListener("input",n=>{this.onUpdate({keyObjects:n.target.value})}),t.appendChild(i);const a=document.createElement("div");a.className="form-group mt-4",a.innerHTML=`
            <label class="form-label">Story Script</label>
            <textarea class="form-control" id="script" placeholder="Paste your story here..." style="min-height: 200px;">${this.state.script}</textarea>
        `,a.querySelector("#script").addEventListener("input",n=>{this.onUpdate({script:n.target.value})}),t.appendChild(a);const r=document.createElement("button");r.className="btn btn-primary w-full mt-4",r.innerHTML="<span>⚡</span> START PRODUCTION PIPELINE",r.addEventListener("click",this.onAnalyze),t.appendChild(r);const o=document.createElement("div");return o.className="space-y-4",o.innerHTML=`
            <div class="card">
                <h3 class="text-xs font-black uppercase tracking-wider text-gray mb-4">Global Configuration</h3>
                
                <div class="form-group">
                    <label class="form-label">Art Style</label>
                    <div class="grid grid-2 gap-2">
                        <button class="btn ${this.state.style==="REALISTIC"?"btn-primary":"btn-secondary"}" data-style="REALISTIC">3D Cinema</button>
                        <button class="btn ${this.state.style==="ANIMATED_3D"?"btn-primary":"btn-secondary"}" data-style="ANIMATED_3D">Pixar Style</button>
                    </div>
                </div>

                <div class="form-group">
                    <label class="form-label">Aspect Ratio</label>
                    <div class="grid grid-2 gap-2">
                        <button class="btn ${this.state.aspectRatio==="16:9"?"btn-primary":"btn-secondary"}" data-ratio="16:9">16:9 Wide</button>
                        <button class="btn ${this.state.aspectRatio==="9:16"?"btn-primary":"btn-secondary"}" data-ratio="9:16">9:16 Reels</button>
                    </div>
                </div>

                <div class="form-group">
                    <label class="form-label">Voice</label>
                    <div class="grid grid-3 gap-2">
                        <button class="btn ${this.state.voiceGender==="MALE"?"btn-primary":"btn-secondary"}" data-voice="MALE">Male</button>
                        <button class="btn ${this.state.voiceGender==="FEMALE"?"btn-primary":"btn-secondary"}" data-voice="FEMALE">Female</button>
                        <button class="btn ${this.state.voiceGender==="SILENCE"?"btn-primary":"btn-secondary"}" data-voice="SILENCE">🔇</button>
                    </div>
                </div>

                <div class="form-group">
                    <label class="form-label">Scene Count</label>
                    <select class="form-control" id="scene-count">
                        ${[10,15,20,25,30,40,50,60].map(n=>`<option value="${n}" ${this.state.sceneCount===n?"selected":""}>${n} Scenes</option>`).join("")}
                    </select>
                </div>

                ${this.state.user?.role!=="admin"&&this.state.user?.plan!=="pro"?`
                    <div class="mt-4 p-3 bg-warning/10 border border-warning/20 rounded-lg">
                        <p class="text-xs text-warning">
                            <span class="font-bold">Free Plan:</span> 3 scenes only
                        </p>
                    </div>
                `:this.state.user?.role==="admin"?`
                    <div class="mt-4 p-3 bg-success/10 border border-success/20 rounded-lg">
                        <p class="text-xs text-success">
                            <span class="font-bold">Admin Plan:</span> Unlimited scenes, no watermark
                        </p>
                    </div>
                `:this.state.user?.plan==="pro"?`
                    <div class="mt-4 p-3 bg-success/10 border border-success/20 rounded-lg">
                        <p class="text-xs text-success">
                            <span class="font-bold">Pro Plan:</span> Unlimited scenes, no watermark
                        </p>
                    </div>
                `:""}
            </div>
        `,o.querySelectorAll("[data-style]").forEach(n=>{n.addEventListener("click",()=>{this.onUpdate({style:n.dataset.style})})}),o.querySelectorAll("[data-ratio]").forEach(n=>{n.addEventListener("click",()=>{this.onUpdate({aspectRatio:n.dataset.ratio})})}),o.querySelectorAll("[data-voice]").forEach(n=>{n.addEventListener("click",()=>{this.onUpdate({voiceGender:n.dataset.voice})})}),o.querySelector("#scene-count").addEventListener("change",n=>{this.onUpdate({sceneCount:parseInt(n.target.value)})}),e.appendChild(t),e.appendChild(o),e}}class w{constructor({state:e,onUpdateScene:t,onAddScene:s,onRemoveScene:i,onStartProduction:a}){this.state=e,this.onUpdateScene=t,this.onAddScene=s,this.onRemoveScene=i,this.onStartProduction=a}render(){const e=document.createElement("div");e.className="space-y-4 fade-in";const t=document.createElement("div");t.className="card",t.innerHTML=`
            <div class="flex justify-between items-center mb-4">
                <h3 class="text-xs font-black uppercase tracking-wider text-primary">Master Visual Lock</h3>
                <div>
                    <span class="text-[9px] text-gray font-bold mr-2">${this.state.createSubTab==="CAST"?"Reference Images Active":"Text DNA Active"}</span>
                    ${this.state.user?.role==="admin"?`
                        <span class="text-[9px] bg-success/20 text-success px-2 py-1 rounded-full font-bold">ADMIN</span>
                    `:this.state.user?.plan==="pro"?`
                        <span class="text-[9px] bg-success/20 text-success px-2 py-1 rounded-full font-bold">PRO</span>
                    `:`
                        <span class="text-[9px] bg-warning/20 text-warning px-2 py-1 rounded-full font-bold">FREE (3/3)</span>
                    `}
                </div>
            </div>

            <!-- Rest of your DNA card content -->
            <div class="grid grid-4 gap-4">
                ${this.state.createSubTab==="SINGLE"?`
                    <div>
                        <label class="text-[9px] font-black text-primary uppercase block mb-2">Character</label>
                        <textarea class="form-control text-xs" id="main-character" style="min-height: 80px;">${this.state.mainCharacter}</textarea>
                    </div>
                    <div>
                        <label class="text-[9px] font-black text-primary uppercase block mb-2">Outfit</label>
                        <textarea class="form-control text-xs" id="outfit-dna" style="min-height: 80px;">${this.state.outfitDNA}</textarea>
                    </div>
                `:""}
                <div>
                    <label class="text-[9px] font-black text-success uppercase block mb-2">Environment</label>
                    <textarea class="form-control text-xs" id="global-setting" style="min-height: 80px;">${this.state.globalSetting}</textarea>
                </div>
                <div>
                    <label class="text-[9px] font-black text-success uppercase block mb-2">Objects</label>
                    <textarea class="form-control text-xs" id="key-objects" style="min-height: 80px;">${this.state.keyObjects}</textarea>
                </div>
            </div>

            <div class="mt-4">
                <label class="text-[9px] font-black text-warning uppercase block mb-2">Story Flow Plan</label>
                <textarea class="form-control text-xs" id="story-flow" style="min-height: 60px;">${this.state.storyFlowPlan}</textarea>
            </div>
        `,t.querySelector("#main-character")?.addEventListener("input",r=>{this.state.mainCharacter=r.target.value}),t.querySelector("#outfit-dna")?.addEventListener("input",r=>{this.state.outfitDNA=r.target.value}),t.querySelector("#global-setting").addEventListener("input",r=>{this.state.globalSetting=r.target.value}),t.querySelector("#key-objects").addEventListener("input",r=>{this.state.keyObjects=r.target.value}),t.querySelector("#story-flow").addEventListener("input",r=>{this.state.storyFlowPlan=r.target.value}),e.appendChild(t);const s=document.createElement("div");s.className="flex justify-between items-center",s.innerHTML=`
            <h2 class="text-2xl font-black text-white flex items-center gap-2">
                <span>✨</span> Storyboard Planning
            </h2>
            <button class="btn btn-primary" id="start-production">
                <span>✅</span> Finalize & Start Production
            </button>
        `,s.querySelector("#start-production").addEventListener("click",()=>{this.state.assets.length>0&&this.onStartProduction()}),e.appendChild(s);const i=document.createElement("div");i.className="space-y-4",this.state.assets.forEach(r=>{const o=this.createSceneCard(r);i.appendChild(o)});const a=document.createElement("button");return a.className="btn btn-secondary w-full py-8 border-2 border-dashed",a.innerHTML="<span>➕</span> ADD SCENE MANUALLY",a.addEventListener("click",this.onAddScene),i.appendChild(a),e.appendChild(i),e}createSceneCard(e){const t=document.createElement("div");t.className="scene-card",t.dataset.id=e.id;const s=i=>({hero:"👨",heroine:"👩",father:"👨",mother:"👩",sister:"👧",dada:"👴",dadi:"👵",neighbor:"🧔",community:"👥"})[i]||"👤";return t.innerHTML=`
            <div class="scene-media relative">
                <div class="scene-number">
                    SCENE ${e.sceneNumber}
                </div>
                ${this.state.createSubTab==="CAST"&&e.assignedCharacter&&e.assignedCharacter!=="none"?`
                    <div class="absolute top-1 right-1 bg-primary/20 border border-primary/30 rounded-full px-3 py-1 text-[9px] font-black uppercase flex items-center gap-1">
                        <span>${s(e.assignedCharacter)}</span>
                        <span>${e.assignedCharacter}</span>
                    </div>
                `:""}
            </div>

            <div class="scene-content">
                <div class="flex justify-between items-start mb-4">
                    <div class="text-xs font-black text-gray uppercase tracking-wider">Scene Details</div>
                    <button class="text-danger hover:text-danger/80" data-remove="${e.id}">
                        <span>🗑️</span>
                    </button>
                </div>

                <div class="grid grid-2 gap-4">
                    <div class="form-group">
                        <label class="form-label">Hindi Narration</label>
                        <textarea class="form-control text-sm" data-field="narration" data-id="${e.id}" style="min-height: 100px;">${e.narration||""}</textarea>
                    </div>

                    <div class="form-group">
                        <label class="form-label">Visual Description</label>
                        <textarea class="form-control text-sm" data-field="visualDescription" data-id="${e.id}" style="min-height: 100px;">${e.visualDescription||""}</textarea>
                    </div>
                </div>

                <div class="grid grid-2 gap-4 mt-2">
                    <div class="form-group">
                        <label class="form-label">Location</label>
                        <input type="text" class="form-control" data-field="locationName" data-id="${e.id}" value="${e.locationName||""}">
                    </div>

                    <div class="form-group">
                        <label class="form-label">Characters Present</label>
                        <input type="text" class="form-control" data-field="presentCharacters" data-id="${e.id}" value="${(e.presentCharacters||[]).join(", ")}" placeholder="hero, mother, etc">
                    </div>
                </div>

                <div class="form-group mt-2">
                    <label class="form-label">Continuity Notes</label>
                    <input type="text" class="form-control" data-field="continuityNotes" data-id="${e.id}" value="${e.continuityNotes||""}">
                </div>
            </div>
        `,t.querySelectorAll("[data-field]").forEach(i=>{i.addEventListener("input",a=>{const r=a.target.dataset.field;let o=a.target.value;r==="presentCharacters"&&(o=o.split(",").map(n=>n.trim()).filter(Boolean)),this.onUpdateScene(e.id,{[r]:o})})}),t.querySelector("[data-remove]")?.addEventListener("click",i=>{i.stopPropagation(),confirm("Are you sure you want to delete this scene?")&&this.onRemoveScene(e.id)}),t}}class E{constructor({state:e,onUpdateScene:t,onRegenerateImage:s}){this.state=e,this.onUpdateScene=t,this.onRegenerateImage=s}render(){const e=document.createElement("div");e.className="space-y-4 fade-in";const t=document.createElement("div");return t.className="flex justify-between items-center mb-4",t.innerHTML=`
            <h2 class="text-2xl font-black text-white flex items-center gap-2">
                <span>🎬</span> Production Pipeline
            </h2>
            <div class="text-sm font-bold text-primary">
                Progress: ${this.state.assets.filter(s=>s.imageUrl).length}/${this.state.assets.length}
            </div>
        `,e.appendChild(t),this.state.assets.forEach((s,i)=>{const a=this.createSceneCard(s,i);e.appendChild(a)}),e}createSceneCard(e,t){const s=document.createElement("div");s.className="scene-card",s.dataset.id=e.id;const i=a=>({hero:"👨",heroine:"👩",father:"👨",mother:"👩",sister:"👧",dada:"👴",dadi:"👵",neighbor:"🧔",community:"👥"})[a]||"👤";return s.innerHTML=`
            <div class="scene-media relative">
                <div class="scene-number">
                    SCENE ${e.sceneNumber}
                </div>

                ${e.isGeneratingImage?`
                    <div class="absolute inset-0 bg-darker flex flex-col items-center justify-center">
                        <div class="spinner mb-2"></div>
                        <div class="text-xs font-bold text-primary">Generating ${e.imageProgress}%</div>
                    </div>
                `:e.imageUrl?`
                    <img src="${e.imageUrl}" alt="Scene ${e.sceneNumber}">
                `:`
                    <div class="absolute inset-0 flex items-center justify-center text-gray">
                        <span>🖼️ No Image</span>
                    </div>
                `}

                ${this.state.createSubTab==="CAST"&&e.assignedCharacter&&e.assignedCharacter!=="none"?`
                    <div class="absolute top-1 right-1 bg-primary/20 border border-primary/30 rounded-full px-3 py-1 text-[9px] font-black uppercase flex items-center gap-1">
                        <span>${i(e.assignedCharacter)}</span>
                        <span>${e.assignedCharacter}</span>
                    </div>
                `:""}
            </div>

            <div class="scene-content">
                <div class="flex justify-between items-start mb-4">
                    <div>
                        <span class="text-xs font-black text-gray uppercase tracking-wider">Scene ${e.sceneNumber}</span>
                        <div class="text-sm text-gray mt-1">${e.locationName||"Unknown Location"}</div>
                    </div>
                    ${e.imageUrl?`
                        <button class="btn btn-secondary text-xs" data-regenerate="${e.id}">
                            <span>🔄</span> Regenerate
                        </button>
                    `:""}
                </div>

                <div class="space-y-4">
                    <div>
                        <label class="form-label">Narration</label>
                        <div class="text-lg italic">"${e.narration||"No narration"}"</div>
                    </div>

                    <div>
                        <label class="form-label">Visual Description</label>
                        <div class="text-xs text-gray bg-darker p-3 rounded-lg">${e.visualDescription||"No description"}</div>
                    </div>

                    ${e.imageUrl?`
                        <div class="form-group">
                            <label class="form-label">Feedback for Regeneration</label>
                            <textarea class="form-control" id="feedback-${e.id}" placeholder="e.g., Zoom in, change expression, add rain..." style="min-height: 60px;">${e.userFeedback||""}</textarea>
                        </div>
                    `:""}
                </div>
            </div>
        `,s.querySelector("[data-regenerate]")?.addEventListener("click",()=>{const a=document.getElementById(`feedback-${e.id}`)?.value;this.onRegenerateImage(e.id,a)}),s}}class S{constructor({state:e,onExportZip:t,onExportTxt:s,onPreview:i,onUpgrade:a}){this.state=e,this.onExportZip=t,this.onExportTxt=s,this.onPreview=i,this.onUpgrade=a}render(){const e=document.createElement("div");e.className="flex items-center justify-center min-h-[60vh] fade-in";const t=document.createElement("div");t.className="card",t.style.maxWidth="900px",t.style.width="100%";const s=this.state.assets.filter(a=>a.imageUrl).length,i=this.state.assets.length;return t.innerHTML=`
            <div class="flex gap-8">
                <div class="w-5/12">
                    <div class="aspect-square bg-darker rounded-2xl overflow-hidden border border-border">
                        ${this.state.thumbnailUrl?`<img src="${this.state.thumbnailUrl}" class="w-full h-full object-cover">`:`<div class="w-full h-full flex items-center justify-center text-gray">
                                <span class="text-6xl">🎬</span>
                            </div>`}
                    </div>
                </div>

                <div class="w-7/12 space-y-6">
                    <div>
                        <h3 class="text-3xl font-black uppercase tracking-tighter">${this.state.metadata?.title||"Story Project"}</h3>
                        <p class="text-gray text-sm mt-2">${this.state.metadata?.description||"Ready for export"}</p>
                    </div>

                    <div class="space-y-2">
                        <div class="text-xs font-bold text-primary">Hashtags</div>
                        <div class="text-sm">${this.state.metadata?.hashtags||"#storyboard #ai"}</div>
                    </div>

                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${s/i*100}%"></div>
                    </div>

                    <div class="text-xs text-gray">
                        ${s}/${i} scenes ready
                    </div>

                    ${this.state.user?.plan!=="pro"&&this.state.user?.role!=="admin"?`
                        <div class="p-3 bg-warning/10 border border-warning/20 rounded-lg">
                            <p class="text-xs text-warning">
                                <span class="font-bold">Free Version:</span> Watermark will be added
                            </p>
                            <button class="btn btn-primary w-full mt-2 text-xs" id="upgrade-btn">
                                Upgrade to Pro (₹99/month) - Remove Watermark
                            </button>
                        </div>
                    `:""}

                    <div class="space-y-3">
                        <button class="btn btn-primary w-full" id="export-zip">
                            <span>📦</span> Export All Files (ZIP)
                        </button>

                        <button class="btn btn-secondary w-full" id="export-txt">
                            <span>📄</span> Export Production Data (TXT)
                        </button>

                        ${s>0?`
                            <button class="btn btn-secondary w-full" id="preview">
                                <span>▶️</span> Preview Production
                            </button>
                        `:""}
                    </div>
                </div>
            </div>
        `,t.querySelector("#export-zip").addEventListener("click",this.onExportZip),t.querySelector("#export-txt").addEventListener("click",this.onExportTxt),t.querySelector("#preview")?.addEventListener("click",this.onPreview),t.querySelector("#upgrade-btn")?.addEventListener("click",this.onUpgrade),e.appendChild(t),e}}class C{constructor({onClose:e,onSuccess:t}){this.onClose=e,this.onSuccess=t}render(){const e=document.createElement("div");return e.className="fixed inset-0 z-[1000] flex items-center justify-center p-4",e.style.background="rgba(0, 0, 0, 0.9)",e.style.backdropFilter="blur(8px)",e.innerHTML=`
            <div class="glass" style="max-width: 900px; width: 100%; max-height: 80vh; overflow-y: auto;">
                <div class="p-6 border-b border-border flex justify-between items-center">
                    <h2 class="text-2xl font-black uppercase tracking-wider">🚀 Upgrade to Pro</h2>
                    <button class="text-gray hover:text-white text-2xl" id="close-modal">&times;</button>
                </div>

                <div class="p-6">
                    <div class="grid grid-2 gap-6 mb-8">
                        <div class="bg-darker p-6 rounded-xl border border-border">
                            <h3 class="text-lg font-black mb-4">FREE</h3>
                            <ul class="space-y-3">
                                <li class="flex items-center gap-2">
                                    <span class="text-success">✅</span>
                                    <span>3 scenes free</span>
                                </li>
                                <li class="flex items-center gap-2">
                                    <span class="text-success">✅</span>
                                    <span>Basic DNA system</span>
                                </li>
                                <li class="flex items-center gap-2">
                                    <span class="text-warning">⚠️</span>
                                    <span>Standard quality images</span>
                                </li>
                                <li class="flex items-center gap-2">
                                    <span class="text-warning">⚠️</span>
                                    <span>Watermarked exports</span>
                                </li>
                                <li class="flex items-center gap-2">
                                    <span class="text-danger">❌</span>
                                    <span>No Cast mode</span>
                                </li>
                            </ul>
                        </div>

                        <div class="bg-primary/10 p-6 rounded-xl border-2 border-primary relative">
                            <div class="absolute -top-3 right-4 bg-primary text-white px-3 py-1 rounded-full text-xs font-black">
                                POPULAR
                            </div>
                            <h3 class="text-lg font-black mb-4 text-primary">PRO</h3>
                            <ul class="space-y-3">
                                <li class="flex items-center gap-2">
                                    <span class="text-success">✅</span>
                                    <span><span class="font-bold">Unlimited scenes</span></span>
                                </li>
                                <li class="flex items-center gap-2">
                                    <span class="text-success">✅</span>
                                    <span>Advanced DNA + Cast mode</span>
                                </li>
                                <li class="flex items-center gap-2">
                                    <span class="text-success">✅</span>
                                    <span>HD/4K quality images</span>
                                </li>
                                <li class="flex items-center gap-2">
                                    <span class="text-success">✅</span>
                                    <span>No watermark</span>
                                </li>
                                <li class="flex items-center gap-2">
                                    <span class="text-success">✅</span>
                                    <span>Priority generation</span>
                                </li>
                            </ul>
                        </div>
                    </div>

                    <div class="grid grid-2 gap-6 mb-8">
                        <div class="text-center p-6 bg-darker rounded-xl">
                            <div class="text-4xl font-black">₹99</div>
                            <div class="text-gray text-sm">per month</div>
                            <button class="btn btn-primary w-full mt-4" data-plan="monthly">
                                Choose Monthly
                            </button>
                        </div>
                        <div class="text-center p-6 bg-darker rounded-xl border-2 border-primary">
                            <div class="text-4xl font-black">₹999</div>
                            <div class="text-gray text-sm">per year (save 16%)</div>
                            <button class="btn btn-primary w-full mt-4" data-plan="yearly">
                                Choose Yearly
                            </button>
                        </div>
                    </div>

                    <div class="text-center space-y-4">
                        <div class="text-sm text-gray">Payment Methods</div>
                        <div class="flex justify-center gap-4">
                            <span class="px-4 py-2 bg-white/5 rounded-lg">📱 UPI</span>
                            <span class="px-4 py-2 bg-white/5 rounded-lg">💳 Card</span>
                            <span class="px-4 py-2 bg-white/5 rounded-lg">🏦 NetBanking</span>
                        </div>
                        <p class="text-xs text-gray mt-4">
                            🔒 Secure payment via Razorpay<br>
                            Instant activation after payment
                        </p>
                    </div>
                </div>
            </div>
        `,e.querySelector("#close-modal").addEventListener("click",this.onClose),e.querySelector('[data-plan="monthly"]').addEventListener("click",()=>{this.initiatePayment("monthly")}),e.querySelector('[data-plan="yearly"]').addEventListener("click",()=>{this.initiatePayment("yearly")}),e}async initiatePayment(e){try{const s=await(await fetch("/api/payments/create-payment",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({plan:e})})).json(),i=document.createElement("div");i.className="fixed inset-0 z-[1001] flex items-center justify-center p-4",i.style.background="rgba(0,0,0,0.95)",i.innerHTML=`
                <div class="glass p-8 max-w-md">
                    <h3 class="text-xl font-black mb-4">Complete Payment</h3>
                    
                    <div class="space-y-4">
                        <a href="${s.link}" target="_blank" class="btn btn-primary w-full">
                            Pay Online (Card/UPI/NetBanking)
                        </a>
                        
                        <div class="text-center text-gray">OR</div>
                        
                        <div class="text-center">
                            <p class="mb-2">Scan QR code with any UPI app</p>
                            <div class="w-48 h-48 mx-auto bg-white p-2 rounded-lg flex items-center justify-center text-black">
                                [QR Code Placeholder]
                            </div>
                            <p class="text-sm mt-2">UPI ID: <strong>${s.upi.upiId}</strong></p>
                        </div>
                        
                        <div class="text-xs text-gray space-y-1">
                            ${s.instructions.map(a=>`<div>• ${a}</div>`).join("")}
                        </div>
                    </div>
                    
                    <button class="btn btn-secondary w-full mt-4" id="close-payment">Close</button>
                </div>
            `,i.querySelector("#close-payment").addEventListener("click",()=>{i.remove()}),document.body.appendChild(i)}catch{alert("Payment initiation failed. Please try again.")}}}class N{constructor({user:e}){this.user=e}render(){const e=document.createElement("div");return e.className="glass p-6 mb-4",e.innerHTML=`
            <div class="flex items-center gap-4">
                <div class="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center text-2xl">
                    👑
                </div>
                <div class="flex-1">
                    <div class="text-sm font-black text-primary uppercase tracking-wider">Admin Mode</div>
                    <div class="text-2xl font-black">${this.user.username}</div>
                </div>
                <div class="text-right">
                    <div class="text-xs text-gray">Your Status</div>
                    <div class="text-lg font-black text-success">UNLIMITED</div>
                    <div class="text-xs text-gray">No restrictions • No watermark • HD quality</div>
                </div>
            </div>

            <div class="grid grid-4 gap-4 mt-4 pt-4 border-t border-border">
                <div class="text-center">
                    <div class="text-2xl font-black text-primary">∞</div>
                    <div class="text-xs text-gray">Scenes</div>
                </div>
                <div class="text-center">
                    <div class="text-2xl font-black text-success">HD</div>
                    <div class="text-xs text-gray">Quality</div>
                </div>
                <div class="text-center">
                    <div class="text-2xl font-black text-indigo-400">✓</div>
                    <div class="text-xs text-gray">No Watermark</div>
                </div>
                <div class="text-center">
                    <div class="text-2xl font-black text-purple-400">👥</div>
                    <div class="text-xs text-gray">Cast Mode</div>
                </div>
            </div>
        `,e}}class L{constructor({onUpgrade:e}){this.onUpgrade=e}render(){const e=document.createElement("div");return e.className="bg-warning/10 border border-warning/20 rounded-xl p-4 mb-4 flex items-center gap-3",e.innerHTML=`
            <div class="text-warning text-2xl">ℹ️</div>
            <div class="flex-1">
                <div class="text-sm font-bold text-warning">Free Plan Active</div>
                <div class="text-xs text-gray">Your exports will have a subtle StoryBoard watermark</div>
            </div>
            <button class="btn btn-primary text-xs" id="upgrade-now">
                Upgrade to Remove
            </button>
        `,e.querySelector("#upgrade-now").addEventListener("click",this.onUpgrade),e}}class k{constructor(){this.state={authenticated:!1,user:null,activeTab:"CREATE",createSubTab:"SINGLE",script:"",refImage:null,castImages:{hero:null,heroine:null,father:null,mother:null,sister:null,dada:null,dadi:null,neighbor:null,community:null},mainCharacter:"",outfitDNA:"",globalSetting:"",keyObjects:"",style:"REALISTIC",aspectRatio:"16:9",voiceGender:"MALE",sceneCount:10,assets:[],storyFlowPlan:"",thumbnailUrl:null,metadata:null,loading:!1,error:null,showSettings:!1,showPreview:!1,showUpgrade:!1,showProfile:!1},this.container=document.getElementById("app"),this.init()}async init(){this.createStars(),await this.checkAuth(),this.render(),this.addEventListeners()}createStars(){const e=document.createElement("div");e.className="stars",e.style.cssText="position:fixed; top:0; left:0; width:100%; height:100%; pointer-events:none; z-index:-1;";for(let s=0;s<200;s++){const i=document.createElement("div");i.style.cssText=`
                position: absolute;
                width: ${Math.random()*2+1}px;
                height: ${Math.random()*2+1}px;
                background: white;
                border-radius: 50%;
                left: ${Math.random()*100}%;
                top: ${Math.random()*100}%;
                opacity: ${Math.random()*.5+.1};
                animation: twinkle ${Math.random()*3+2}s infinite;
            `,e.appendChild(i)}document.body.appendChild(e);const t=document.createElement("style");t.textContent=`
            @keyframes twinkle {
                0%, 100% { opacity: 0.1; transform: scale(0.5); }
                50% { opacity: 1; transform: scale(1.2); }
            }
        `,document.head.appendChild(t)}async checkAuth(){try{const t=await(await fetch("/api/auth/status")).json();this.state.authenticated=t.authenticated,this.state.user=t.user}catch(e){console.error("Auth check failed:",e)}}async login(e,t){try{const i=await(await fetch("/api/auth/login",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({username:e,password:t})})).json();return i.success?(this.state.authenticated=!0,this.state.user=i.user,this.render(),this.showToast("Login successful!","success")):this.showToast(i.error||"Login failed","error"),i}catch(s){console.error("Login error:",s),this.showToast("Login failed","error")}}async register(e,t,s){try{const a=await(await fetch("/api/auth/register",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({username:e,password:t,email:s})})).json();return a.success?(this.state.authenticated=!0,this.state.user=a.user,this.render(),this.showToast("Registration successful!","success")):this.showToast(a.error||"Registration failed","error"),a}catch(i){console.error("Registration error:",i),this.showToast("Registration failed","error")}}async logout(){try{await fetch("/api/auth/logout",{method:"POST"}),this.state.authenticated=!1,this.state.user=null,this.render(),this.showToast("Logged out successfully","success")}catch(e){console.error("Logout error:",e)}}showToast(e,t="info"){const s=document.createElement("div");s.className=`toast ${t}`,s.textContent=e,document.body.appendChild(s),setTimeout(()=>{s.remove()},3e3)}setLoading(e,t="Processing..."){if(this.state.loading=e,e){const s=document.createElement("div");s.className="loading-overlay",s.id="loading-overlay";const i=document.createElement("div");i.className="spinner";const a=document.createElement("div");a.className="mt-2 text-sm font-bold uppercase tracking-widest text-primary",a.textContent=t,s.appendChild(i),s.appendChild(a),document.body.appendChild(s)}else{const s=document.getElementById("loading-overlay");s&&s.remove()}}setError(e){this.state.error=e,e&&this.showToast(e,"error"),this.render()}showUpgradeModal(){const t=new C({onClose:()=>{document.getElementById("upgrade-modal")?.remove(),this.state.showUpgrade=!1},onSuccess:()=>{this.state.user.plan="pro",this.render()}}).render();t.id="upgrade-modal",document.body.appendChild(t),this.state.showUpgrade=!0}async analyzeScript(){if(!this.state.script.trim()){this.showToast("Please enter a script","warning");return}if(this.state.user?.plan!=="pro"&&this.state.user?.role!=="admin"&&this.state.assets.length>=3){this.showUpgradeModal();return}this.setLoading(!0,"Analyzing script...");try{const t=await(await fetch("/api/gemini/analyze",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({script:this.state.script,sceneCount:this.state.sceneCount,isCastMode:this.state.createSubTab==="CAST"})})).json();if(t.error)throw new Error(t.error);this.state.metadata={title:t.seoTitle,hashtags:t.seoHashtags,description:t.seoDescription,thumbnailPrompt:t.thumbnailPrompt},this.state.mainCharacter=t.mainCharacterDescription,this.state.outfitDNA=t.outfitDNA||"",this.state.globalSetting=t.globalSettingDescription,this.state.keyObjects=t.keyObjectsDescription,this.state.storyFlowPlan=t.storyFlowPlan||"",this.state.assets=t.scenes.map((s,i)=>({id:`scene-${i}-${Date.now()}`,...s,isGeneratingImage:!1,isGeneratingAudio:!1,isGeneratingVideo:!1,imageProgress:0,audioProgress:0})),this.state.activeTab="PLANNING",this.render(),this.showToast("Analysis complete!","success")}catch(e){console.error("Analysis error:",e),this.setError(e.message)}finally{this.setLoading(!1)}}async startProduction(){if(this.state.activeTab="PRODUCTION",this.render(),this.state.metadata?.thumbnailPrompt){this.setLoading(!0,"Creating thumbnail...");try{const t=await(await fetch("/api/gemini/image",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({prompt:this.state.metadata.thumbnailPrompt,style:this.state.style,aspectRatio:this.state.aspectRatio,charDNA:this.state.mainCharacter,outfitDNA:this.state.outfitDNA,settingDNA:this.state.globalSetting,keyObjectsDNA:this.state.keyObjects,spatialLayout:"Wide Shot"})})).json();t.image&&(this.state.thumbnailUrl=t.image,this.render())}catch(e){console.error("Thumbnail error:",e)}finally{this.setLoading(!1)}}for(let e=0;e<this.state.assets.length;e++){const t=this.state.assets[e];this.setLoading(!0,`Generating scene ${e+1}/${this.state.assets.length}...`);try{let s=this.state.refImage;this.state.createSubTab==="CAST"&&t.assignedCharacter&&t.assignedCharacter!=="none"&&(s=this.state.castImages[t.assignedCharacter]);const a=await(await fetch("/api/gemini/image",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({prompt:t.visualDescription,style:this.state.style,aspectRatio:this.state.aspectRatio,charDNA:this.state.createSubTab==="SINGLE"?this.state.mainCharacter:"",outfitDNA:this.state.createSubTab==="SINGLE"?this.state.outfitDNA:"",settingDNA:this.state.globalSetting,keyObjectsDNA:this.state.keyObjects,spatialLayout:t.spatialLayout,refImage:s,continuityNotes:t.continuityNotes,prevSceneVisual:e>0?this.state.assets[e-1].visualDescription:void 0,locationName:t.locationName,presentCharacters:t.presentCharacters})})).json();if(a.image&&(t.imageUrl=a.image,a.features?.watermark&&this.showToast("Free version: Watermark added","warning")),this.state.voiceGender!=="SILENCE"&&t.narration){const o=await(await fetch("/api/gemini/audio",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({text:t.narration,gender:this.state.voiceGender})})).json();o.audio&&(t.audioData=o.audio)}this.render(),await new Promise(r=>setTimeout(r,2e3))}catch(s){console.error(`Scene ${e+1} error:`,s),this.showToast(`Scene ${e+1} failed: ${s.message}`,"error")}}this.setLoading(!1),this.showToast("Production complete!","success")}addEventListeners(){window.addEventListener("click",e=>{this.state.showSettings&&!e.target.closest(".settings-modal")&&(this.state.showSettings=!1,this.render()),this.state.showProfile&&!e.target.closest(".profile-modal")&&(this.state.showProfile=!1,this.render())}),window.addEventListener("keydown",e=>{e.key==="Escape"&&(this.state.showSettings&&(this.state.showSettings=!1,this.render()),this.state.showPreview&&(this.state.showPreview=!1,this.render()),this.state.showProfile&&(this.state.showProfile=!1,this.render()),this.state.showUpgrade&&(document.getElementById("upgrade-modal")?.remove(),this.state.showUpgrade=!1))})}render(){if(!this.state.authenticated){this.container.innerHTML="";const a=new y({onLogin:(r,o)=>this.login(r,o),onRegister:(r,o,n)=>this.register(r,o,n)});this.container.appendChild(a.render());return}const e=document.createElement("div");e.className="main-app";const t=document.createElement("header");t.className="header";const s=["CREATE","PLANNING","PRODUCTION","METADATA"];if(this.state.user?.role==="admin"&&s.push("ADMIN"),t.innerHTML=`
            <div class="logo" style="cursor: pointer;" id="logo-btn">
                <div class="logo-icon">🎬</div>
                <div class="logo-text">StoryBoard Pro</div>
            </div>
            <div class="flex items-center gap-2">
                <div class="tabs">
                    ${s.map(a=>`
                        <button class="tab ${this.state.activeTab===a?"active":""}" data-tab="${a}">${a}</button>
                    `).join("")}
                </div>
                <button class="btn btn-secondary" id="profile-btn" title="Profile">
                    <span>👤</span>
                </button>
                <button class="btn btn-secondary" id="logout-btn" title="Logout">
                    <span>🚪</span>
                </button>
                <div class="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-1">
                    <span>${this.state.user?.username||"User"}</span>
                    ${this.state.user?.role==="admin"?'<span class="text-warning">👑</span>':""}
                    ${this.state.user?.plan==="pro"?'<span class="text-success">⭐</span>':""}
                </div>
            </div>
        `,e.appendChild(t),t.querySelector("#logo-btn").addEventListener("click",()=>{this.state.activeTab="CREATE",this.render()}),this.state.user?.role==="admin"&&this.state.activeTab!=="ADMIN"){const a=new N({user:this.state.user});e.appendChild(a.render())}if(this.state.user?.plan!=="pro"&&this.state.user?.role!=="admin"&&this.state.assets.length>0){const a=new L({onUpgrade:()=>this.showUpgradeModal()});e.appendChild(a.render())}const i=document.createElement("div");switch(i.className="container",this.state.activeTab){case"CREATE":const a=new x({state:this.state,onUpdate:l=>{Object.assign(this.state,l),this.render()},onAnalyze:()=>this.analyzeScript(),onRefImageChange:l=>{const c=new FileReader;c.onloadend=()=>{this.state.refImage=c.result,this.render()},c.readAsDataURL(l)},onCastImageChange:(l,c)=>{const d=new FileReader;d.onloadend=()=>{this.state.castImages[l]=d.result,this.render()},d.readAsDataURL(c)}});i.appendChild(a.render());break;case"PLANNING":const r=new w({state:this.state,onUpdateScene:(l,c)=>{const d=this.state.assets.find(p=>p.id===l);d&&(Object.assign(d,c),this.render())},onAddScene:()=>{const l=this.state.assets.length>0?Math.max(...this.state.assets.map(c=>c.sceneNumber))+1:1;this.state.assets.push({id:`manual-${Date.now()}`,sceneNumber:l,narration:"",visualDescription:"",spatialLayout:"Medium Shot",locationName:"Unknown",presentCharacters:[],videoGenPrompt:"",videoPromptHindi:"",continuityNotes:"Sequence from last shot",assignedCharacter:"none",isGeneratingImage:!1,isGeneratingAudio:!1,isGeneratingVideo:!1,imageProgress:0,audioProgress:0}),this.render()},onRemoveScene:l=>{this.state.assets=this.state.assets.filter(c=>c.id!==l),this.render()},onStartProduction:()=>this.startProduction()});i.appendChild(r.render());break;case"PRODUCTION":const o=new E({state:this.state,onUpdateScene:(l,c)=>{const d=this.state.assets.find(p=>p.id===l);d&&(Object.assign(d,c),this.render())},onRegenerateImage:async(l,c)=>{const d=this.state.assets.find(p=>p.id===l);if(d){this.setLoading(!0,"Regenerating image...");try{const p=this.state.createSubTab==="CAST"&&d.assignedCharacter&&d.assignedCharacter!=="none"?this.state.castImages[d.assignedCharacter]:this.state.refImage,u=await(await fetch("/api/gemini/image",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({prompt:d.visualDescription,style:this.state.style,aspectRatio:this.state.aspectRatio,charDNA:this.state.createSubTab==="SINGLE"?this.state.mainCharacter:"",outfitDNA:this.state.createSubTab==="SINGLE"?this.state.outfitDNA:"",settingDNA:this.state.globalSetting,keyObjectsDNA:this.state.keyObjects,spatialLayout:d.spatialLayout,refImage:p,feedback:c,continuityNotes:d.continuityNotes,locationName:d.locationName,presentCharacters:d.presentCharacters})})).json();u.image&&(d.imageUrl=u.image,d.userFeedback=c,this.render(),this.showToast("Image regenerated!","success"))}catch(p){console.error("Regeneration error:",p),this.setError(p.message)}finally{this.setLoading(!1)}}}});i.appendChild(o.render());break;case"METADATA":const n=new S({state:this.state,onExportZip:()=>this.exportZip(),onExportTxt:()=>this.exportTxt(),onPreview:()=>{this.state.showPreview=!0,this.render()},onUpgrade:()=>this.showUpgradeModal()});i.appendChild(n.render());break;case"ADMIN":m(()=>import("./AdminPanel-NEL5wU8H.js"),[]).then(l=>{const c=l.AdminPanel,d=new c({user:this.state.user,onClose:()=>{this.state.activeTab="CREATE",this.render()}});i.innerHTML="",i.appendChild(d.render())});break}if(e.appendChild(i),this.state.showProfile&&m(()=>import("./Profile-xAC9WXLI.js"),[]).then(a=>{const r=a.Profile;new r({user:this.state.user,onClose:()=>{this.state.showProfile=!1,this.render()},onUpdate:()=>{this.checkAuth()}}).render().then(n=>{e.appendChild(n)})}),this.state.showPreview){const a=this.createPreview();e.appendChild(a)}this.container.innerHTML="",this.container.appendChild(e),document.querySelectorAll(".tab").forEach(a=>{a.addEventListener("click",()=>{this.state.activeTab=a.dataset.tab,this.render()})}),document.getElementById("profile-btn")?.addEventListener("click",()=>{this.state.showProfile=!0,this.render()}),document.getElementById("logout-btn")?.addEventListener("click",()=>this.logout())}createPreview(){const e=document.createElement("div");e.className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center p-4",e.style.animation="fadeIn 0.3s ease-out";const t=this.state.assets.filter(a=>a.imageUrl);let s=0;const i=()=>{const a=t[s];e.innerHTML=`
                <div class="absolute top-6 left-6 right-6 flex justify-between items-center z-10">
                    <div class="flex items-center gap-3">
                        <div class="p-2 bg-primary rounded-lg">
                            <span class="text-white text-xs">🎬</span>
                        </div>
                        <span class="text-xs font-black uppercase tracking-widest text-gray">Scene ${s+1}/${t.length}</span>
                    </div>
                    <button class="text-gray hover:text-white p-3 bg-white/5 rounded-full border border-border transition-all" id="close-preview">
                        ✕
                    </button>
                </div>

                <div class="w-full max-w-5xl aspect-video relative rounded-2xl overflow-hidden shadow-2xl bg-darker border border-border">
                    <img src="${a.imageUrl}" class="w-full h-full object-cover" style="animation: slowZoom 7s linear infinite;">
                    
                    <div class="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/40 to-transparent p-12">
                        <div class="space-y-4 max-w-3xl">
                            <span class="px-4 py-1.5 rounded-full bg-primary text-xs font-black uppercase tracking-widest">
                                ${a.assignedCharacter&&a.assignedCharacter!=="none"?a.assignedCharacter:"Main Character"}
                            </span>
                            <p class="text-2xl font-bold text-white drop-shadow-2xl">
                                "${a.narration}"
                            </p>
                        </div>
                    </div>
                </div>

                <div class="mt-10 flex items-center gap-8">
                    <button class="text-gray hover:text-primary transition-all disabled:opacity-20" id="prev-scene" ${s===0?"disabled":""}>
                        <span style="font-size: 2rem;">⏮️</span>
                    </button>
                    
                    <button class="w-20 h-20 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 transition-all shadow-2xl" id="play-pause">
                        <span style="font-size: 2rem;">⏸️</span>
                    </button>
                    
                    <button class="text-gray hover:text-primary transition-all disabled:opacity-20" id="next-scene" ${s===t.length-1?"disabled":""}>
                        <span style="font-size: 2rem;">⏭️</span>
                    </button>
                </div>

                <style>
                    @keyframes slowZoom {
                        0% { transform: scale(1); }
                        100% { transform: scale(1.1); }
                    }
                </style>
            `,e.querySelector("#close-preview").addEventListener("click",()=>{this.state.showPreview=!1,this.render()}),e.querySelector("#prev-scene")?.addEventListener("click",()=>{s>0&&(s--,i())}),e.querySelector("#next-scene")?.addEventListener("click",()=>{s<t.length-1&&(s++,i())})};return i(),e}async exportZip(){this.setLoading(!0,"Creating ZIP...");try{const e=(await m(async()=>{const{default:o}=await import("https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js");return{default:o}},[])).default,t=new e;this.state.thumbnailUrl&&t.file("thumbnail.png",this.state.thumbnailUrl.split(",")[1],{base64:!0});let s=`StoryBoard Production Data
`;s+=`Title: ${this.state.metadata?.title||"Untitled"}
`,s+=`Hashtags: ${this.state.metadata?.hashtags||""}

`,s+=`Description: ${this.state.metadata?.description||""}

`,s+=`================================

`,this.state.assets.forEach((o,n)=>{s+=`Scene ${n+1}
`,s+=`Narration: ${o.narration}
`,s+=`Location: ${o.locationName}
`,s+=`Characters: ${o.presentCharacters?.join(", ")||"None"}
`,s+=`Visual: ${o.visualDescription}
`,s+=`Video Prompt: ${o.videoPromptHindi||o.videoGenPrompt}
`,s+=`--------------------------------

`,o.imageUrl&&t.folder("images").file(`scene_${n+1}.png`,o.imageUrl.split(",")[1],{base64:!0})}),t.file("production_data.txt",s);const i=await t.generateAsync({type:"blob"}),a=URL.createObjectURL(i),r=document.createElement("a");r.href=a,r.download=`${this.state.metadata?.title||"storyboard"}_export.zip`,r.click(),URL.revokeObjectURL(a),this.showToast("ZIP exported successfully!","success")}catch(e){console.error("Export error:",e),this.setError(e.message)}finally{this.setLoading(!1)}}exportTxt(){let e=`StoryBoard Production Data
`;e+=`Title: ${this.state.metadata?.title||"Untitled"}
`,e+=`Hashtags: ${this.state.metadata?.hashtags||""}

`,e+=`Description: ${this.state.metadata?.description||""}

`,e+=`================================

`,this.state.assets.forEach((a,r)=>{e+=`Scene ${r+1}
`,e+=`Narration: ${a.narration}
`,e+=`Location: ${a.locationName}
`,e+=`Characters: ${a.presentCharacters?.join(", ")||"None"}
`,e+=`Visual: ${a.visualDescription}
`,e+=`Video Prompt: ${a.videoPromptHindi||a.videoGenPrompt}
`,e+=`--------------------------------

`});const t=new Blob([e],{type:"text/plain"}),s=URL.createObjectURL(t),i=document.createElement("a");i.href=s,i.download=`${this.state.metadata?.title||"storyboard"}_data.txt`,i.click(),URL.revokeObjectURL(s),this.showToast("Text exported successfully!","success")}}new k;export{m as _};
