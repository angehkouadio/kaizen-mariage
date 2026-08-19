(() => {
  const cfg = window.KAIZEN_SUPABASE || {};
  const configured = cfg.url && !cfg.url.includes("VOTRE-PROJET") &&
                     cfg.anonKey && !cfg.anonKey.includes("VOTRE_CLE");
  let client = null;
  let timer = null;

  function status(text, online=false){
    const el = document.getElementById("syncStatus");
    if(!el) return;
    el.classList.toggle("online", online);
    const span = el.querySelector("span:last-child");
    if(span) span.textContent = text;
  }

  function authMessage(msg){
    const el=document.getElementById("authMessage");
    if(el) el.textContent=msg||"";
  }

  function renderAuth(session){
    const out=document.getElementById("authLoggedOut");
    const inn=document.getElementById("authLoggedIn");
    const user=document.getElementById("authUser");
    if(!out || !inn) return;
    if(session){
      out.style.display="none";
      inn.style.display="block";
      if(user) user.textContent=session.user.email || "Utilisateur connecté";
    }else{
      out.style.display="block";
      inn.style.display="none";
    }
  }

  async function init(){
    if(!configured || !window.supabase){
      status("Mode local");
      return;
    }
    client = window.supabase.createClient(cfg.url, cfg.anonKey);
    const { data: { session } } = await client.auth.getSession();
    renderAuth(session);
    if(!session){
      status("Supabase prêt · connexion requise");
    } else {
      status("Synchronisé", true);
      await loadRemote(session.user.id);
    }

    client.auth.onAuthStateChange(async (_event, newSession)=>{
      renderAuth(newSession);
      if(newSession){
        status("Synchronisé", true);
        await loadRemote(newSession.user.id);
        const localRaw=localStorage.getItem("kaizenMarriageYear");
        if(localRaw) await saveRemote(JSON.parse(localRaw));
      }else{
        status("Mode local · non connecté");
      }
    });
  }

  async function loadRemote(userId){
    const { data, error } = await client
      .from("kaizen_marriage_state")
      .select("state,updated_at")
      .eq("user_id", userId)
      .maybeSingle();
    if(error){ console.error(error); status("Erreur de synchronisation"); return; }
    if(data && data.state){
      const localRaw = localStorage.getItem("kaizenMarriageYear");
      if(!localRaw){
        localStorage.setItem("kaizenMarriageYear", JSON.stringify(data.state));
        window.dispatchEvent(new Event("kaizen-cloud-loaded"));
      }
    }
  }

  async function saveRemote(state){
    if(!client) return;
    const { data: { session } } = await client.auth.getSession();
    if(!session){ status("Mode local · non connecté"); return; }
    status("Synchronisation…");
    const { error } = await client.from("kaizen_marriage_state").upsert({
      user_id: session.user.id,
      state,
      updated_at: new Date().toISOString()
    }, { onConflict: "user_id" });
    if(error){ console.error(error); status("Erreur de synchronisation"); }
    else status("Synchronisé", true);
  }

  async function signIn(){
    if(!client){ authMessage("Configure d'abord Supabase dans supabase-config.js."); return; }
    const email=document.getElementById("authEmail")?.value.trim();
    const password=document.getElementById("authPassword")?.value;
    if(!email || !password){ authMessage("Saisissez l'e-mail et le mot de passe."); return; }
    authMessage("Connexion…");
    const { error }=await client.auth.signInWithPassword({email,password});
    authMessage(error ? error.message : "Connecté.");
  }

  async function signUp(){
    if(!client){ authMessage("Configure d'abord Supabase dans supabase-config.js."); return; }
    const email=document.getElementById("authEmail")?.value.trim();
    const password=document.getElementById("authPassword")?.value;
    if(!email || !password){ authMessage("Saisissez l'e-mail et le mot de passe."); return; }
    authMessage("Création du compte…");
    const { error }=await client.auth.signUp({email,password});
    authMessage(error ? error.message : "Compte créé. Vérifiez votre e-mail si la confirmation est activée.");
  }

  async function signOut(){
    if(!client) return;
    await client.auth.signOut();
    status("Mode local · non connecté");
  }

  function queueSave(state){
    clearTimeout(timer);
    timer = setTimeout(()=>saveRemote(state), 700);
  }

  window.KaizenCloud = { init, queueSave, saveRemote, signIn, signUp, signOut };
  window.addEventListener("load", init);
})();