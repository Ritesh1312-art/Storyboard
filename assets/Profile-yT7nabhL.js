import{_ as i}from"./index-l8OsllP5.js";class d{constructor({user:e,onClose:t,onUpdate:s}){this.user=e,this.onClose=t,this.onUpdate=s,this.loading=!1,this.message=null}async loadUserData(){try{return await(await fetch("/api/profile")).json()}catch(e){return console.error("Failed to load profile:",e),null}}async saveProfile(e){this.loading=!0,this.render();try{const s=await(await fetch("/api/profile",{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify(e)})).json();s.success?(this.message={type:"success",text:"Profile updated successfully"},this.onUpdate()):this.message={type:"error",text:s.error||"Update failed"}}catch{this.message={type:"error",text:"Failed to update profile"}}this.loading=!1,this.render()}render(){const e=document.createElement("div");e.className="fixed inset-0 z-[1000] flex items-center justify-center p-4",e.style.background="rgba(0, 0, 0, 0.8)",e.style.backdropFilter="blur(8px)";const t=this.user;return e.innerHTML=`
            <div class="glass" style="max-width: 600px; width: 100%; max-height: 80vh; overflow-y: auto;">
                <div class="flex justify-between items-center p-6 border-b border-border">
                    <h2 class="text-xl font-black uppercase tracking-wider">Your Profile</h2>
                    <button class="text-gray hover:text-white p-2" id="close-profile">✕</button>
                </div>

                <div class="p-6">
                    ${this.message?`
                        <div class="mb-4 p-3 ${this.message.type==="success"?"bg-success/10 text-success":"bg-danger/10 text-danger"} rounded-lg">
                            ${this.message.text}
                        </div>
                    `:""}

                    <form id="profile-form" class="space-y-6">
                        <div class="form-group">
                            <label class="form-label">Username</label>
                            <input type="text" class="form-control" value="${t.username}" readonly disabled>
                        </div>

                        <div class="form-group">
                            <label class="form-label">Full Name</label>
                            <input type="text" class="form-control" id="full-name" value="${t.fullName||""}" placeholder="Enter your full name">
                        </div>

                        <div class="form-group">
                            <label class="form-label">Email Address</label>
                            <input type="email" class="form-control" id="email" value="${t.email||""}" placeholder="Only Gmail, Outlook, etc.">
                            <p class="text-xs text-gray mt-1">Temporary emails not allowed</p>
                        </div>

                        <div class="form-group">
                            <label class="form-label">Mobile Number</label>
                            <input type="tel" class="form-control" id="mobile" value="${t.mobile||""}" placeholder="10 digit mobile number">
                            <p class="text-xs text-gray mt-1">Indian mobile number (starts with 6-9)</p>
                        </div>

                        <div class="border-t border-border pt-4">
                            <h3 class="text-sm font-bold mb-4">Security Questions (Optional)</h3>
                            <p class="text-xs text-gray mb-4">Set these to recover your account if you forget password</p>
                            
                            <div id="security-questions">
                                ${this.renderSecurityQuestions(t.securityQuestions)}
                            </div>
                            
                            <button type="button" class="btn btn-secondary text-xs mt-2" id="add-question">
                                + Add Another Question
                            </button>
                        </div>

                        <div class="flex gap-2 pt-4">
                            <button type="submit" class="btn btn-primary flex-1" ${this.loading?"disabled":""}>
                                ${this.loading?"Saving...":"Save Changes"}
                            </button>
                            <button type="button" class="btn btn-secondary" id="cancel-profile">Cancel</button>
                        </div>
                    </form>

                    <div class="mt-6 pt-4 border-t border-border">
                        <h3 class="text-sm font-bold mb-2">Account Security</h3>
                        <div class="grid grid-2 gap-2">
                            <button class="btn btn-secondary text-xs" id="change-password">
                                🔐 Change Password
                            </button>
                            <button class="btn btn-secondary text-xs" id="two-factor">
                                📱 Setup 2FA (Coming Soon)
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `,e.querySelector("#close-profile").addEventListener("click",this.onClose),e.querySelector("#cancel-profile").addEventListener("click",this.onClose),e.querySelector("#change-password").addEventListener("click",()=>{i(()=>import("./ChangePassword-D8H0PhPT.js"),[]).then(r=>{const o=new r.ChangePassword({user:this.user,onClose:()=>e.remove()});e.appendChild(o.render())})}),e.querySelector("#profile-form").addEventListener("submit",r=>{r.preventDefault();const o={fullName:document.getElementById("full-name").value,email:document.getElementById("email").value,mobile:document.getElementById("mobile").value,securityQuestions:this.getSecurityAnswers()};this.saveProfile(o)}),e.querySelector("#add-question").addEventListener("click",()=>{this.addQuestionRow()}),e}renderSecurityQuestions(e=[]){return!e||e.length===0?this.getQuestionRow(0):e.map((t,s)=>this.getQuestionRow(s,t.question,t.answer)).join("")}getQuestionRow(e,t="",s=""){return`
            <div class="question-row mb-4 p-3 bg-darker rounded-lg" data-index="${e}">
                <select class="form-control mb-2" id="question-${e}">
                    <option value="">Select a question</option>
                    ${["What was your childhood nickname?","What is the name of your first pet?","What was your first car?","What elementary school did you attend?","What is the name of the town where you were born?","What is your mother's maiden name?","What was your favorite food as a child?","Who was your childhood hero?","What is your favorite book?","What is your favorite movie?","What was the name of your first teacher?","What is the name of your best friend?"].map(o=>`<option value="${o}" ${o===t?"selected":""}>${o}</option>`).join("")}
                </select>
                <input type="text" class="form-control" id="answer-${e}" value="${s}" placeholder="Your answer">
                <button type="button" class="text-danger text-xs mt-1 remove-question">Remove</button>
            </div>
        `}addQuestionRow(){const e=document.getElementById("security-questions"),t=e.children.length,s=document.createElement("div");s.innerHTML=this.getQuestionRow(t),e.appendChild(s.firstChild),s.querySelector(".remove-question").addEventListener("click",r=>{r.target.closest(".question-row").remove()})}getSecurityAnswers(){const e=document.querySelectorAll(".question-row"),t=[];return e.forEach(s=>{const r=s.dataset.index,o=document.getElementById(`question-${r}`)?.value,a=document.getElementById(`answer-${r}`)?.value;o&&a&&t.push({question:o,answer:a})}),t}}export{d as Profile};
