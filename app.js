// ==========================================
// 1. BANCO DE DADOS E AUTO-SETUP (APK)
// ==========================================
const dbName = "CQDatabase"; const storeName = "cq_store"; let db = null;
const BIBLE_METADATA_LOCAL = [
    {id:"GEN",name:"Gênesis",chaps:50,test:"OT"}, {id:"EXO",name:"Êxodo",chaps:40,test:"OT"}, {id:"LEV",name:"Levítico",chaps:27,test:"OT"}, {id:"NUM",name:"Números",chaps:36,test:"OT"}, {id:"DEU",name:"Deuteronômio",chaps:34,test:"OT"}, {id:"JOS",name:"Josué",chaps:24,test:"OT"}, {id:"JDG",name:"Juízes",chaps:21,test:"OT"}, {id:"RUT",name:"Rute",chaps:4,test:"OT"}, {id:"1SA",name:"1 Samuel",chaps:31,test:"OT"}, {id:"2SA",name:"2 Samuel",chaps:24,test:"OT"}, {id:"1KI",name:"1 Reis",chaps:22,test:"OT"}, {id:"2KI",name:"2 Reis",chaps:25,test:"OT"}, {id:"1CH",name:"1 Crônicas",chaps:29,test:"OT"}, {id:"2CH",name:"2 Crônicas",chaps:36,test:"OT"}, {id:"EZR",name:"Esdras",chaps:10,test:"OT"}, {id:"NEH",name:"Neemias",chaps:13,test:"OT"}, {id:"EST",name:"Ester",chaps:10,test:"OT"}, {id:"JOB",name:"Jó",chaps:42,test:"OT"}, {id:"PSA",name:"Salmos",chaps:150,test:"OT"}, {id:"PRO",name:"Provérbios",chaps:31,test:"OT"}, {id:"ECC",name:"Eclesiastes",chaps:12,test:"OT"}, {id:"SNG",name:"Cânticos",chaps:8,test:"OT"}, {id:"ISA",name:"Isaías",chaps:66,test:"OT"}, {id:"JER",name:"Jeremias",chaps:52,test:"OT"}, {id:"LAM",name:"Lamentações",chaps:5,test:"OT"}, {id:"EZE",name:"Ezequiel",chaps:48,test:"OT"}, {id:"DAN",name:"Daniel",chaps:12,test:"OT"}, {id:"HOS",name:"Oséias",chaps:14,test:"OT"}, {id:"JOE",name:"Joel",chaps:3,test:"OT"}, {id:"AMO",name:"Amós",chaps:9,test:"OT"}, {id:"OBA",name:"Obadias",chaps:1,test:"OT"}, {id:"JON",name:"Jonas",chaps:4,test:"OT"}, {id:"MIC",name:"Miquéias",chaps:7,test:"OT"}, {id:"NAH",name:"Naum",chaps:3,test:"OT"}, {id:"HAB",name:"Habacuque",chaps:3,test:"OT"}, {id:"ZEP",name:"Sofonias",chaps:3,test:"OT"}, {id:"HAG",name:"Ageu",chaps:2,test:"OT"}, {id:"ZEC",name:"Zacarias",chaps:14,test:"OT"}, {id:"MAL",name:"Malaquias",chaps:4,test:"OT"},
    {id:"MAT",name:"Mateus",chaps:28,test:"NT"}, {id:"MRK",name:"Marcos",chaps:16,test:"NT"}, {id:"LUK",name:"Lucas",chaps:24,test:"NT"}, {id:"JHN",name:"João",chaps:21,test:"NT"}, {id:"ACT",name:"Atos",chaps:28,test:"NT"}, {id:"ROM",name:"Romanos",chaps:16,test:"NT"}, {id:"1CO",name:"1 Coríntios",chaps:16,test:"NT"}, {id:"2CO",name:"2 Coríntios",chaps:13,test:"NT"}, {id:"GAL",name:"Gálatas",chaps:6,test:"NT"}, {id:"EPH",name:"Efésios",chaps:6,test:"NT"}, {id:"PHP",name:"Filipenses",chaps:4,test:"NT"}, {id:"COL",name:"Colossenses",chaps:4,test:"NT"}, {id:"1TH",name:"1 Tessalonicenses",chaps:5,test:"NT"}, {id:"2TH",name:"2 Tessalonicenses",chaps:3,test:"NT"}, {id:"1TI",name:"1 Timóteo",chaps:6,test:"NT"}, {id:"2TI",name:"2 Timóteo",chaps:4,test:"NT"}, {id:"TIT",name:"Tito",chaps:3,test:"NT"}, {id:"PHM",name:"Filemom",chaps:1,test:"NT"}, {id:"HEB",name:"Hebreus",chaps:13,test:"NT"}, {id:"JAS",name:"Tiago",chaps:5,test:"NT"}, {id:"1PE",name:"1 Pedro",chaps:5,test:"NT"}, {id:"2PE",name:"2 Pedro",chaps:3,test:"NT"}, {id:"1JN",name:"1 João",chaps:5,test:"NT"}, {id:"2JN",name:"2 João",chaps:1,test:"NT"}, {id:"3JN",name:"3 João",chaps:1,test:"NT"}, {id:"JUD",name:"Judas",chaps:1,test:"NT"}, {id:"REV",name:"Apocalipse",chaps:22,test:"NT"}
];
let bibleDb = {}; let extrasDb = { temas: [], estudos: [], hinos: [], quiz: [], notas: [], flashcards: [], highlights: [], customDict: {}, reactions: {}, plan: { active: null, history: [] } }; 
let currentBook = "GEN"; let currentAlphabet = localStorage.getItem('cq_alphabet') || 'latin'; let isInterlinear = false; let isFocusMode = false; let currentFontSize = parseFloat(localStorage.getItem('cq_font_size')) || 1.0; let isDarkMode = localStorage.getItem('cq_dark_mode') === 'true'; let userTotalPoints = parseInt(localStorage.getItem('cq_user_points')) || 0; let editingId = null; let selectedVerses = []; let currentStudy = null; let currentTheme = null; let ttsUtterances = []; const audioCtx = new (window.AudioContext || window.webkitAudioContext)(); 

function initDB() { return new Promise((resolve) => { let request = indexedDB.open(dbName, 1); request.onupgradeneeded = (e) => { let tDb = e.target.result; if (!tDb.objectStoreNames.contains(storeName)) tDb.createObjectStore(storeName); }; request.onsuccess = (e) => { db = e.target.result; resolve(); }; }); }
function saveDataToDB(key, data) { if (db) { let tx = db.transaction([storeName], "readwrite"); tx.objectStore(storeName).put(data, key); } }
function loadDataFromDB(key) { return new Promise((resolve) => { if(!db) return resolve(null); let tx = db.transaction([storeName], "readonly"); let req = tx.objectStore(storeName).get(key); req.onsuccess = () => resolve(req.result); req.onerror = () => resolve(null); }); }

window.onload = async function() {
    try {
        await initDB();
        let lb = await loadDataFromDB('bible_cq_local'); let le = await loadDataFromDB('cq_extras_local');
        bibleDb = lb || {}; if(le) extrasDb = Object.assign(extrasDb, le);
        if(!extrasDb.hinos) extrasDb.hinos = []; if(!extrasDb.temas) extrasDb.temas = []; if(!extrasDb.estudos) extrasDb.estudos = []; if(!extrasDb.quiz) extrasDb.quiz = []; if(!extrasDb.notas) extrasDb.notas = []; if(!extrasDb.flashcards) extrasDb.flashcards = []; if(!extrasDb.highlights) extrasDb.highlights = []; if(!extrasDb.customDict) extrasDb.customDict = {}; if(!extrasDb.reactions) extrasDb.reactions = {}; if(!extrasDb.plan) extrasDb.plan = { active: null, history: [] };
        if(typeof CQ_DICT !== 'undefined') Object.assign(CQ_DICT, extrasDb.customDict);
        checkStreak(); init(); setupGestures(); 
        
        // AUTO-SETUP PARA APK
        if (Object.keys(bibleDb).length === 0) await checkAndLoadInitialBackup();
        
        currentBook = 'GEN'; const s = document.getElementById('chapter-select'); if(s) { s.innerHTML="<option value='1'>Capítulo 1</option>"; s.value=1; }
        showUI('home'); 
    } catch(e) { console.error("Erro Fatal:", e); }
};

async function checkAndLoadInitialBackup() {
    try {
        const response = await fetch('biblia_cq_backup.json');
        if (!response.ok) throw new Error("Sem ficheiro de backup.");
        const restored = await response.json();
        if (restored.bible) { bibleDb = restored.bible; extrasDb = restored.extras || extrasDb; } else { bibleDb = restored; }
        saveDataToDB('bible_cq_local', bibleDb); saveDataToDB('cq_extras_local', extrasDb);
        alert("Configuração inicial concluída!"); location.reload();
    } catch (err) { console.warn("Auto-setup:", err.message); }
}

// ==========================================
// 2. FUNÇÕES BASE, ÁUDIO TTS E UI
// ==========================================
function getSafeAudioPath(v, f) { return v.startsWith('http') ? v : `${f}/${encodeURI(v)}`; }
function safeTransliterateCyrillic(t) { if (typeof transliterateCyrillic !== 'function') return t; return t.split(/(<[^>]*>)/g).map(p => p.startsWith('<') ? p : transliterateCyrillic(p)).join(''); }
function checkStreak() { const today = new Date().toLocaleDateString('pt-BR'); let lastLogin = localStorage.getItem('cq_last_login'); let streak = parseInt(localStorage.getItem('cq_streak')) || 0; if (lastLogin !== today) { const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1); if (lastLogin === yesterday.toLocaleDateString('pt-BR')) { streak++; } else if (lastLogin !== null) { streak = 1; } else { streak = 1; } localStorage.setItem('cq_last_login', today); localStorage.setItem('cq_streak', streak); } const el = document.getElementById('user-streak'); if(el) el.innerText = streak; }

// --- MOTOR DE VOZ TTS BLINDADO ---
function stopAudio() { 
    if('speechSynthesis' in window) window.speechSynthesis.cancel(); 
    ttsUtterances = []; 
    document.querySelectorAll('.verse-row').forEach(el => el.classList.remove('active-reading')); 
}
function togglePause() { if (window.speechSynthesis.paused) window.speechSynthesis.resume(); else if (window.speechSynthesis.speaking) window.speechSynthesis.pause(); }

function speak(text, verseId) {
    if(!('speechSynthesis' in window)) return alert("Seu navegador não suporta áudio TTS.");
    stopAudio();
    if (!text) return;
    
    let utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'pt-BR'; // Força a pronúncia em português para o CQ
    
    const speedEl = document.getElementById('audio-speed');
    if(speedEl) utterance.rate = parseFloat(speedEl.value) || 0.8;
    
    utterance.onstart = () => {
        document.querySelectorAll('.verse-row').forEach(el => el.classList.remove('active-reading'));
        if(verseId) {
            const vEl = document.getElementById(verseId);
            if(vEl) { vEl.classList.add('active-reading'); vEl.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
        }
    };
    
    utterance.onend = () => { if(verseId) { const vEl = document.getElementById(verseId); if(vEl) vEl.classList.remove('active-reading'); } };
    ttsUtterances.push(utterance);
    window.speechSynthesis.speak(utterance);
}

function speakFullChapter() {
    if(!('speechSynthesis' in window)) return alert("Seu navegador não suporta áudio TTS.");
    stopAudio();
    const cs = document.getElementById('chapter-select'); if(!cs) return;
    const chap = cs.value; const data = bibleDb[currentBook] && bibleDb[currentBook][chap];
    if(!data) return;

    const verses = Object.keys(data).filter(k => k !== '_audio').sort((a,b) => a-b);
    if(verses.length === 0) return;

    let index = 0;
    function speakNext() {
        if (index >= verses.length) return;
        const vNum = verses[index];
        // Limpa tudo (HTML e Quebras de linha) para não bugar o motor
        const textToRead = data[vNum].cq.replace(/<[^>]*>?/gm, '').replace(/[\n\r]/g, ' '); 
        
        let utterance = new SpeechSynthesisUtterance(textToRead);
        utterance.lang = 'pt-BR'; 
        const speedEl = document.getElementById('audio-speed');
        if(speedEl) utterance.rate = parseFloat(speedEl.value) || 0.8;

        utterance.onstart = () => {
            document.querySelectorAll('.verse-row').forEach(el => el.classList.remove('active-reading'));
            const vEl = document.getElementById(`verse-${vNum}`);
            if(vEl) { vEl.classList.add('active-reading'); vEl.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
        };
        utterance.onend = () => {
            const vEl = document.getElementById(`verse-${vNum}`);
            if(vEl) vEl.classList.remove('active-reading');
            index++;
            speakNext();
        };

        ttsUtterances.push(utterance);
        window.speechSynthesis.speak(utterance);
    }
    speakNext();
}

function init() {
    const otD = document.getElementById('ot-books'); const ntD = document.getElementById('nt-books');
    if(otD && otD.parentElement) { let h3 = otD.parentElement.querySelector('h3'); if(h3) h3.onclick = function() { this.parentElement.classList.toggle('collapsed'); }; }
    if(ntD && ntD.parentElement) { let h3 = ntD.parentElement.querySelector('h3'); if(h3) h3.onclick = function() { this.parentElement.classList.toggle('collapsed'); }; }
    BIBLE_METADATA_LOCAL.forEach(b => {
        const div = document.createElement('div'); div.className = "book-item"; div.innerHTML = `<span>${b.name}</span> <span class="chapter-badge">${b.chaps}</span>`;
        div.onclick = () => { selectBook(b.id); showUI('reader'); };
        if(b.test === "OT" && otD) otD.appendChild(div); else if(ntD) ntD.appendChild(div);
        const btnIdx = document.createElement('button'); btnIdx.className = "index-book-btn"; btnIdx.innerText = b.name; btnIdx.onclick = () => { selectBook(b.id); showUI('reader'); };
        const grid = b.test === "OT" ? document.getElementById('index-ot-grid') : document.getElementById('index-nt-grid'); if(grid) grid.appendChild(btnIdx);
        const amSel = document.getElementById('admin-book-select'); if(amSel) { const opt = document.createElement('option'); opt.value = b.id; opt.textContent = b.name; amSel.appendChild(opt); }
        const qzSel = document.getElementById('admin-quiz-book'); if(qzSel) { const opt = document.createElement('option'); opt.value = b.id; opt.textContent = b.name; qzSel.appendChild(opt); }
    });
    updateAlphabetButtonText(); applyAccessibility(); updateUserRank(); loadPlansUI();
}

function showUI(ui) {
    if(isFocusMode && ui !== 'reader') toggleFocusMode(); 
    const screens = ['home', 'search', 'quiz', 'reader', 'login', 'admin', 'themes', 'studies', 'hymns', 'plans', 'dictionary', 'notes', 'flashcards'];
    screens.forEach(s => { const el = document.getElementById(`${s}-ui`); if(el) el.classList.add('hidden'); });
    const target = document.getElementById(`${ui}-ui`); if(target) target.classList.remove('hidden');
    if(ui === 'reader') { const cs = document.getElementById('chapter-select'); if(cs && cs.options.length === 0) document.getElementById('book-index-modal').classList.remove('hidden'); }
    if(ui === 'admin') { const am = document.getElementById('admin-mode'); if(am) am.value = 'bible'; toggleAdminForm(); }
    if(ui === 'home') updateUserRank();
    if(ui === 'dictionary') loadDictionary(); 
    if(ui === 'notes') loadPersonalNotes('all'); 
    if(ui === 'flashcards') loadFlashcards();
    if(ui === 'themes') loadTemas();
    if(ui === 'studies') loadEstudos();
    if(ui === 'hymns') { closeHymn(); loadHinos(); }
    if(ui === 'plans') loadPlansUI();
    if(ui === 'quiz') { const qs = document.getElementById('quiz-start'); if(qs) qs.classList.remove('hidden'); const qg = document.getElementById('quiz-game'); if(qg) qg.classList.add('hidden'); const qr = document.getElementById('quiz-result'); if(qr) qr.classList.add('hidden'); const qsm = document.getElementById('quiz-status-msg'); if(qsm) qsm.innerText = extrasDb.quiz.length + " perguntas no banco."; }
}

function toggleInterlinear() { isInterlinear = !isInterlinear; const bInt = document.getElementById('btn-interlinear'); if(bInt){ bInt.innerHTML = isInterlinear ? "📖 Normal" : "🧬 Interlinear"; bInt.style.background = isInterlinear ? "#e74c3c" : "#8e44ad"; } loadSelectedChapter(); }
function toggleFocusMode() { isFocusMode = !isFocusMode; const body = document.body; const btn = document.getElementById('btn-focus'); if(isFocusMode) { body.classList.add('focus-mode'); if(btn){btn.innerHTML = "❌ Sair do Foco"; btn.style.background = "#e74c3c";} if(isInterlinear) toggleInterlinear(); } else { body.classList.remove('focus-mode'); if(btn){btn.innerHTML = "👁️ Foco"; btn.style.background = "#2c3e50";} } }
function applyAccessibility() { document.documentElement.style.setProperty('--base-font-size', currentFontSize + 'rem'); const themeBtn = document.getElementById('btn-theme'); if (isDarkMode) { document.documentElement.setAttribute('data-theme', 'dark'); if(themeBtn) themeBtn.textContent = '☀️'; } else { document.documentElement.removeAttribute('data-theme'); if(themeBtn) themeBtn.textContent = '🌙'; } }
function changeFontSize(step) { currentFontSize += step * 0.1; if (currentFontSize < 0.8) currentFontSize = 0.8; if (currentFontSize > 2.0) currentFontSize = 2.0; localStorage.setItem('cq_font_size', currentFontSize.toFixed(1)); applyAccessibility(); }
function toggleDarkMode() { isDarkMode = !isDarkMode; localStorage.setItem('cq_dark_mode', isDarkMode); applyAccessibility(); }
function toggleAlphabet() { currentAlphabet = currentAlphabet === 'latin' ? 'cyrillic' : 'latin'; localStorage.setItem('cq_alphabet', currentAlphabet); updateAlphabetButtonText(); const rUi = document.getElementById('reader-ui'); if (rUi && !rUi.classList.contains('hidden')) loadSelectedChapter(); const hUi = document.getElementById('hymns-ui'); if (hUi && !hUi.classList.contains('hidden')) loadHinos(); const dUi = document.getElementById('dictionary-ui'); if (dUi && !dUi.classList.contains('hidden')) loadDictionary(); const fUi = document.getElementById('flashcards-ui'); if (fUi && !fUi.classList.contains('hidden')) loadFlashcards(); }
function updateAlphabetButtonText() { const btn = document.getElementById('btn-alphabet-text'); if(btn) btn.textContent = currentAlphabet === 'latin' ? '🔤 Alfabeto: Latino' : '🔤 Alfabeto: Cirílico'; }
function setupGestures() { 
    let touchstartX = 0; let touchendX = 0; const readerArea = document.getElementById('content'); if(!readerArea) return;
    function handleSwipe() { const rUi = document.getElementById('reader-ui'); if (rUi && rUi.classList.contains('hidden')) return; const cs = document.getElementById('chapter-select'); if(!cs) return; let currentChap = parseInt(cs.value); const book = BIBLE_METADATA_LOCAL.find(b => b.id === currentBook); if (touchendX < touchstartX - 70 && currentChap < book.chaps) { cs.value = currentChap + 1; loadSelectedChapter(); document.getElementById('content').scrollTo({top: 0, behavior: 'smooth'}); } if (touchendX > touchstartX + 70 && currentChap > 1) { cs.value = currentChap - 1; loadSelectedChapter(); document.getElementById('content').scrollTo({top: 0, behavior: 'smooth'}); } } 
    readerArea.addEventListener('touchstart', e => { touchstartX = e.changedTouches[0].screenX; }, {passive: true}); readerArea.addEventListener('touchend', e => { touchendX = e.changedTouches[0].screenX; handleSwipe(); }, {passive: true}); 
}

// ==========================================
// 3. LEITURA, BÍBLIA E SELEÇÃO
// ==========================================
function selectBook(id) {
    currentBook = id; const b = BIBLE_METADATA_LOCAL.find(x => x.id === id);
    const titleText = document.getElementById('current-title-text'); if(titleText) titleText.textContent = b.name;
    const s = document.getElementById('chapter-select'); 
    if(s) { s.innerHTML = ""; for(let i=1; i<=b.chaps; i++) { s.innerHTML += `<option value="${i}">Capítulo ${i}</option>`; } s.value = 1; }
    const bim = document.getElementById('book-index-modal'); if(bim) bim.classList.add('hidden');
    loadSelectedChapter();
}

function loadSelectedChapter() {
    stopAudio(); selectedVerses = []; updateSelectionFAB();
    const cs = document.getElementById('chapter-select'); if(!cs) return;
    const chap = cs.value; const b = BIBLE_METADATA_LOCAL.find(x => x.id === currentBook);
    const container = document.getElementById('verse-container'); const navBottom = document.getElementById('chapter-nav-bottom');
    if(!container) return; container.innerHTML = ""; if(navBottom) navBottom.innerHTML = "";
    localStorage.setItem('cq_last_read', JSON.stringify({book: currentBook, chap: chap}));
    
    const data = bibleDb[currentBook] && bibleDb[currentBook][chap];
    const aBar = document.getElementById('audio-bar');
    if(!data) { container.innerHTML = "<p>Sem conteúdo. Puxe este capítulo no Painel Admin.</p>"; if(aBar) aBar.style.display="none"; return; }
    if(aBar) aBar.style.display="flex";
    if (data._audio) { container.innerHTML += `<div style="background: var(--verse-hover); padding: 15px; border-radius: 8px; margin-bottom: 20px; text-align: center;"><p style="margin-top: 0; font-weight: bold; color: var(--primary);">🎧 Narração</p><audio controls style="width: 100%; border-radius: 8px;"><source src="${getSafeAudioPath(data._audio, 'audios_biblia')}" type="audio/mpeg"></audio></div>`; }
    
    Object.keys(data).filter(k => k !== '_audio').sort((a,b)=>a-b).forEach(vNum => {
        const div = document.createElement('div'); div.className = "verse-row"; div.id = `verse-${vNum}`;
        const hl = extrasDb.highlights.find(h => h.book === currentBook && h.chap == chap && h.verse == vNum); const hlClass = hl ? `hl-${hl.color}` : "";
        
        // Limpeza rigorosa para o Motor de Voz e para os Botões não quebrarem!
        const cleanCQ = data[vNum].cq.replace(/<[^>]*>?/gm, ''); 
        const safeCqAudio = cleanCQ.replace(/[\n\r]/g, ' ').replace(/'/g, "\\'").replace(/"/g, '&quot;');
        const safePt = data[vNum].pt.replace(/[\n\r]/g, ' ').replace(/'/g, "\\'").replace(/"/g, '&quot;');
        
        const hasNote = extrasDb.notas.find(n => n.book === currentBook && n.chap == chap && n.verse == vNum); const noteIcon = hasNote ? "📝" : "✏️";
        let displayCQ = currentAlphabet === 'cyrillic' ? safeTransliterateCyrillic(data[vNum].cq) : data[vNum].cq;
        let ptClick = `onclick="toggleVerseSelection('${vNum}', 'both', '${safePt}', '${safeCqAudio}', event)"`; 
        let cqClick = `onclick="toggleVerseSelection('${vNum}', 'cq', '${safePt}', '${safeCqAudio}', event)"`;
        
        if (isInterlinear) {
            let ptWords = data[vNum].pt.split(' '); let cqWords = cleanCQ.split(' '); let maxLen = Math.max(ptWords.length, cqWords.length); let intHtml = `<div class="interlinear-container ${hlClass}">`;
            for(let w=0; w<maxLen; w++) { let pw = ptWords[w] || ''; let cw = cqWords[w] || ''; let displayCw = currentAlphabet === 'cyrillic' ? safeTransliterateCyrillic(cw) : cw; intHtml += `<div class="interlinear-word"><span class="int-cq">${displayCw}</span><span class="int-pt">${pw}</span></div>`; } intHtml += `</div>`;
            div.style.gridTemplateColumns = "1fr"; 
            div.innerHTML = `<div style="display:flex; align-items:center; gap:10px; flex-wrap:wrap;" ${ptClick}><span class="verse-num">${vNum}</span><button class="audio-btn" onclick="event.stopPropagation(); speak('${safeCqAudio}', 'verse-${vNum}')">🔊</button><button class="audio-btn" onclick="event.stopPropagation(); openVerseImage('${b.name}', ${chap}, ${vNum}, '${safePt}', '${safeCqAudio}')">🖼️</button><button class="audio-btn" onclick="event.stopPropagation(); openNoteModal('${currentBook}', ${chap}, ${vNum}, '${safePt}')">${noteIcon}</button><button class="audio-btn" onclick="event.stopPropagation(); openHighlightModal('${currentBook}', ${chap}, ${vNum})">🖍️</button></div>${intHtml}`;
        } else {
            div.innerHTML = `<div class="text-pt hl-wrapper ${hlClass}" ${ptClick}><span class="verse-num">${vNum}</span> <span class="v-text">${data[vNum].pt}</span></div><div class="text-cq hl-wrapper ${hlClass}" ${cqClick}><div style="margin-bottom: 5px; display: flex; gap: 5px;"><button class="audio-btn" onclick="event.stopPropagation(); speak('${safeCqAudio}', 'verse-${vNum}')">🔊</button><button class="audio-btn" onclick="event.stopPropagation(); openVerseImage('${b.name}', ${chap}, ${vNum}, '${safePt}', '${safeCqAudio}')">🖼️</button><button class="audio-btn" onclick="event.stopPropagation(); openNoteModal('${currentBook}', ${chap}, ${vNum}, '${safePt}')">${noteIcon}</button><button class="audio-btn" onclick="event.stopPropagation(); openHighlightModal('${currentBook}', ${chap}, ${vNum})">🖍️</button></div><span class="v-text">${displayCQ}</span></div>`; 
        }
        container.appendChild(div);
    });
    if(navBottom) {
        if (chap > 1) { const btnP = document.createElement('button'); btnP.className = "btn-chap-nav"; btnP.innerHTML = `⬅️ Cap ${parseInt(chap) - 1}`; btnP.onclick = () => { cs.value = parseInt(chap) - 1; loadSelectedChapter(); document.getElementById('content').scrollTo(0,0); }; navBottom.appendChild(btnP); } else navBottom.appendChild(document.createElement('div'));
        if (chap < b.chaps) { const btnN = document.createElement('button'); btnN.className = "btn-chap-nav"; btnN.innerHTML = `Cap ${parseInt(chap) + 1} ➡️`; btnN.onclick = () => { cs.value = parseInt(chap) + 1; loadSelectedChapter(); document.getElementById('content').scrollTo(0,0); }; navBottom.appendChild(btnN); } else navBottom.appendChild(document.createElement('div'));
    }
}

function toggleVerseSelection(vNum, type, pt, cq, e) {
    if(e.target.tagName === 'BUTTON') return; 
    const verseDiv = document.getElementById(`verse-${vNum}`); if(!verseDiv) return;
    const existingIdx = selectedVerses.findIndex(v => v.vNum === vNum);
    if (existingIdx > -1) { if (selectedVerses[existingIdx].type === type) { selectedVerses.splice(existingIdx, 1); verseDiv.classList.remove('selected-both', 'selected-cq'); } else { selectedVerses[existingIdx].type = type; verseDiv.classList.remove('selected-both', 'selected-cq'); verseDiv.classList.add(`selected-${type}`); } } else { selectedVerses.push({ vNum, type, ptText: pt, cqText: cq }); verseDiv.classList.add(`selected-${type}`); }
    updateSelectionFAB();
}
function updateSelectionFAB() { const fab = document.getElementById('selection-fab'); const countSpan = document.getElementById('selection-count'); if(fab && countSpan) { if (selectedVerses.length > 0) { countSpan.innerText = `(${selectedVerses.length})`; fab.classList.remove('hidden'); } else { fab.classList.add('hidden'); } } }
function clearSelection() { selectedVerses = []; document.querySelectorAll('.verse-row').forEach(el => el.classList.remove('selected-both', 'selected-cq')); updateSelectionFAB(); }

// ==========================================
// 4. IMAGENS, COMPARTILHAR E PDF RESPONSIVO
// ==========================================
function getLinesCanvas(context, text, maxWidth) { if (!text) return []; let words = text.split(' '); let lines = []; let currentLine = words[0] || ''; for (let i = 1; i < words.length; i++) { let word = words[i]; let width = context.measureText(currentLine + " " + word).width; if (width < maxWidth) { currentLine += " " + word; } else { lines.push(currentLine); currentLine = word; } } if (currentLine) lines.push(currentLine); return lines; }
function openVerseImage(bookName, chap, verse, ptText, cqText) { const im = document.getElementById('image-modal'); if(im) im.classList.remove('hidden'); const canvas = document.getElementById('single-verse-canvas'); if(!canvas) return; canvas.dataset.pt = ptText; canvas.dataset.cq = cqText; canvas.dataset.ref = `— ${bookName} ${chap}:${verse} —`; drawSingleCanvasImage(false); }
function drawSingleCanvasImage(isTransparent) { 
    const canvas = document.getElementById('single-verse-canvas'); if(!canvas) return; 
    const ctx = canvas.getContext('2d'); const ptText = `"${canvas.dataset.pt}"`; const cqText = canvas.dataset.cq; const refText = canvas.dataset.ref; 
    const maxWidth = 900; const ptLineHeight = 60; const cqLineHeight = 70; 
    ctx.font = 'bold 45px Arial'; let ptLines = getLinesCanvas(ctx, ptText, maxWidth); ctx.font = 'italic 50px Arial'; let cqLines = getLinesCanvas(ctx, cqText, maxWidth); 
    let topPadding = 150; let bottomPadding = 150; let spacingBetween = 80; let refSpace = 100; let totalHeight = topPadding + (ptLines.length * ptLineHeight) + spacingBetween + (cqLines.length * cqLineHeight) + refSpace + bottomPadding; 
    canvas.width = 1080; canvas.height = Math.max(1080, totalHeight); 
    if (isTransparent) { ctx.clearRect(0, 0, 1080, canvas.height); } else { let gradient = ctx.createLinearGradient(0, 0, 1080, canvas.height); gradient.addColorStop(0, '#1a5f7a'); gradient.addColorStop(1, '#0d3242'); ctx.fillStyle = gradient; ctx.fillRect(0, 0, 1080, canvas.height); } 
    ctx.textAlign = 'center'; let currentY = topPadding; ctx.fillStyle = isTransparent ? '#ffffff' : '#ffffff'; 
    if(isTransparent) { ctx.shadowColor = 'rgba(0,0,0,0.8)'; ctx.shadowBlur = 10; ctx.shadowOffsetX = 2; ctx.shadowOffsetY = 2; } 
    ctx.font = 'bold 45px Arial'; ptLines.forEach(line => { ctx.fillText(line, 540, currentY); currentY += ptLineHeight; }); 
    currentY += spacingBetween - 40; ctx.fillStyle = '#e67e22'; ctx.font = 'italic 50px Arial'; cqLines.forEach(line => { ctx.fillText(line, 540, currentY); currentY += cqLineHeight; }); 
    currentY += refSpace; ctx.fillStyle = '#ffffff'; ctx.font = 'bold 40px Arial'; ctx.fillText(refText, 540, currentY); currentY += 60; ctx.font = '28px Arial'; ctx.fillStyle = isTransparent ? 'rgba(255, 255, 255, 0.9)' : 'rgba(255, 255, 255, 0.6)'; ctx.fillText(`Bíblia CQ`, 540, currentY); 
}
function downloadVerseImage(isTransparent) { drawSingleCanvasImage(isTransparent); const canvas = document.getElementById('single-verse-canvas'); if(!canvas) return; const a = document.createElement('a'); a.href = canvas.toDataURL("image/png"); a.download = `versiculo_cq.png`; a.click(); drawSingleCanvasImage(false); }
function copySelectedVerses() {
    const chapNum = document.getElementById('chapter-select').value; const bookName = BIBLE_METADATA_LOCAL.find(b => b.id === currentBook).name; let textToCopy = `📖 *${bookName} ${chapNum}*\n\n`; 
    selectedVerses.sort((a,b) => parseInt(a.vNum) - parseInt(b.vNum)).forEach(v => { let finalCq = v.cqText; if(currentAlphabet === 'cyrillic') finalCq = safeTransliterateCyrillic(finalCq); if(v.type === 'both') { textToCopy += `${v.vNum}. [PT] ${v.ptText}\n   [CQ] ${finalCq}\n\n`; } else { textToCopy += `${v.vNum}. [CQ] ${finalCq}\n\n`; } }); navigator.clipboard.writeText(textToCopy).then(() => { alert(`${selectedVerses.length} versículo(s) copiado(s)!`); clearSelection(); }).catch(() => alert("Erro ao copiar."));
}
function shareSelectedVersesImage() {
    if(selectedVerses.length === 0) return; const chapNum = document.getElementById('chapter-select').value; const bookName = BIBLE_METADATA_LOCAL.find(b => b.id === currentBook).name;
    const canvas = document.createElement('canvas'); const ctx = canvas.getContext('2d'); const maxWidth = 900; const fontSize = 32; let versesToDraw = []; let totalHeight = 250; 
    selectedVerses.sort((a,b) => parseInt(a.vNum) - parseInt(b.vNum)).forEach(v => { let finalCq = v.cqText; if(currentAlphabet === 'cyrillic') finalCq = safeTransliterateCyrillic(finalCq); let ptLines = []; let cqLines = []; if (v.type === 'both') { ctx.font = `bold ${fontSize}px Arial`; ptLines = getLinesCanvas(ctx, `${v.vNum}. ${v.ptText}`, maxWidth); ctx.font = `italic ${fontSize}px Arial`; cqLines = getLinesCanvas(ctx, finalCq, maxWidth); } else { ctx.font = `italic ${fontSize}px Arial`; cqLines = getLinesCanvas(ctx, `${v.vNum}. ${finalCq}`, maxWidth); } versesToDraw.push({ ptLines, cqLines }); totalHeight += (ptLines.length * (fontSize + 10)) + (cqLines.length * (fontSize + 10)) + 50; });
    totalHeight += 150; canvas.width = 1080; canvas.height = Math.max(1080, totalHeight); let gradient = ctx.createLinearGradient(0, 0, 1080, canvas.height); gradient.addColorStop(0, '#1a5f7a'); gradient.addColorStop(1, '#0d3242'); ctx.fillStyle = gradient; ctx.fillRect(0, 0, 1080, canvas.height); ctx.textAlign = 'center'; ctx.fillStyle = '#ffffff'; ctx.font = 'bold 55px Arial'; ctx.fillText(`— ${bookName} ${chapNum} —`, 540, 140); ctx.textAlign = 'left'; let currentY = 260; versesToDraw.forEach(v => { if(v.ptLines.length > 0) { ctx.fillStyle = '#ffffff'; ctx.font = `bold ${fontSize}px Arial`; v.ptLines.forEach(line => { ctx.fillText(line, 90, currentY); currentY += (fontSize + 10); }); currentY += 10; } ctx.fillStyle = '#e67e22'; ctx.font = `italic ${fontSize}px Arial`; v.cqLines.forEach(line => { ctx.fillText(line, 90, currentY); currentY += (fontSize + 10); }); currentY += 50; }); ctx.textAlign = 'center'; ctx.font = '30px Arial'; ctx.fillStyle = 'rgba(255, 255, 255, 0.6)'; ctx.fillText(`Bíblia CQ`, 540, canvas.height - 60);
    try { const a = document.createElement('a'); a.href = canvas.toDataURL("image/png"); a.download = `Versiculos_CQ.png`; a.click(); clearSelection(); } catch(e) { alert("Muitos versículos. Copie o texto."); }
}

function shareChapter() { const sc = document.getElementById('share-chapter-modal'); if(sc) sc.classList.remove('hidden'); }
function copyChapterText() { const cs = document.getElementById('chapter-select'); if(!cs) return; const data = bibleDb[currentBook][cs.value]; let text = `📖 *${currentBook} ${cs.value}*\n\n`; Object.keys(data).filter(k=>k!=='_audio').sort((a,b)=>a-b).forEach(v => text += `${v}. [PT] ${data[v].pt}\n   [CQ] ${data[v].cq}\n\n`); navigator.clipboard.writeText(text).then(() => { alert("Copiado!"); document.getElementById('share-chapter-modal').classList.add('hidden'); }); }
function downloadChapterImage() {
    const data = bibleDb[currentBook][document.getElementById('chapter-select').value]; const canvas = document.createElement('canvas'); const ctx = canvas.getContext('2d'); const maxWidth = 900; const fontSize = 30; let totalHeight = 300; let items = [];
    Object.keys(data).filter(k=>k!=='_audio').sort((a,b)=>a-b).forEach(vNum => { ctx.font = `bold ${fontSize}px Arial`; let ptLines = getLinesCanvas(ctx, `${vNum}. ${data[vNum].pt}`, maxWidth); ctx.font = `italic ${fontSize}px Arial`; let cqLines = getLinesCanvas(ctx, data[vNum].cq, maxWidth); items.push({ptLines, cqLines}); totalHeight += (ptLines.length + cqLines.length) * (fontSize + 10) + 60; });
    canvas.width = 1080; canvas.height = totalHeight; let grad = ctx.createLinearGradient(0,0,0,totalHeight); grad.addColorStop(0,'#1a5f7a'); grad.addColorStop(1,'#0d3242'); ctx.fillStyle = grad; ctx.fillRect(0,0,1080,totalHeight); ctx.fillStyle = "#fff"; ctx.textAlign = "center"; ctx.font = "bold 50px Arial"; ctx.fillText(`— ${currentBook} ${document.getElementById('chapter-select').value} —`, 540, 150);
    let y = 250; ctx.textAlign = "left"; items.forEach(item => { ctx.fillStyle = "#fff"; ctx.font = `bold ${fontSize}px Arial`; item.ptLines.forEach(l => { ctx.fillText(l, 90, y); y+=fontSize+10; }); y += 5; ctx.fillStyle = "#e67e22"; ctx.font = `italic ${fontSize}px Arial`; item.cqLines.forEach(l => { ctx.fillText(l, 90, y); y+=fontSize+10; }); y += 50; });
    try { const a = document.createElement('a'); a.href = canvas.toDataURL("image/png"); a.download = "capitulo.png"; a.click(); document.getElementById('share-chapter-modal').classList.add('hidden'); } catch(e) { alert("Capítulo longo, use exportar PDF."); }
}

function createPrintArea() { let div = document.getElementById('print-area'); if (!div) { div = document.createElement('div'); div.id = 'print-area'; document.body.appendChild(div); } return div; }
function exportChapterPDF() {
    const cs = document.getElementById('chapter-select'); if(!cs) return; const chapNum = cs.value; const data = bibleDb[currentBook] && bibleDb[currentBook][chapNum]; if(!data) return alert("Sem conteúdo.");
    const bookName = BIBLE_METADATA_LOCAL.find(b => b.id === currentBook).name; const printArea = createPrintArea(); const date = new Date().toLocaleDateString('pt-BR');
    let html = `<div style="font-family: 'Segoe UI', Arial, sans-serif; padding: 10px;"><div style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #2c3e50; padding-bottom: 10px;"><h1 style="margin: 0; color: #2c3e50; text-transform: uppercase; letter-spacing: 2px;">${bookName} - Capítulo ${chapNum}</h1><p style="color: #7f8c8d; font-size: 0.9rem; margin: 5px 0;">Bíblia CQ | Exportado em ${date}</p></div><table style="width: 100%; border-collapse: collapse;"><thead><tr style="background: #f8f9fa;"><th style="width: 45%; text-align: left; padding: 10px; border: 1px solid #dee2e6; color: #2980b9;">Português</th><th style="width: 55%; text-align: left; padding: 10px; border: 1px solid #dee2e6; color: #d35400;">Cito Qasveheot</th></tr></thead><tbody>`;
    Object.keys(data).filter(k => k !== '_audio').sort((a,b) => a-b).forEach(vNum => { const ptText = data[vNum].pt; const cqLatino = data[vNum].cq.replace(/<[^>]*>?/gm, ''); const cqCirilico = safeTransliterateCyrillic(cqLatino); html += `<tr style="page-break-inside: avoid;"><td style="padding: 12px; border: 1px solid #dee2e6; vertical-align: top; line-height: 1.5;"><b style="color: #2980b9; font-size: 0.8rem;">${vNum}.</b> ${ptText}</td><td style="padding: 12px; border: 1px solid #dee2e6; vertical-align: top;"><div style="font-style: italic; color: #d35400; margin-bottom: 6px; line-height: 1.4;">${cqLatino}</div><div style="color: #8e44ad; font-weight: bold; font-size: 1.1rem; line-height: 1.2;">${cqCirilico}</div></td></tr>`; });
    html += `</tbody></table><div style="text-align: center; margin-top: 30px; font-size: 0.8rem; color: #aaa; border-top: 1px solid #eee; padding-top: 10px;">Projeto Linguístico CQ.</div></div>`;
    printArea.innerHTML = html; document.getElementById('share-chapter-modal').classList.add('hidden'); setTimeout(() => { window.print(); }, 500);
}
function exportNotes() {
    if (!extrasDb.notas || extrasDb.notas.length === 0) return alert("Você não tem anotações.");
    const printArea = createPrintArea(); const date = new Date().toLocaleDateString('pt-BR');
    let html = `<div style="font-family: Arial, sans-serif; color: #333;"><div style="text-align: center; margin-bottom: 30px;"><h1 style="color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 10px; display: inline-block;">Relatório do Diário</h1><p style="color: #7f8c8d; font-size: 0.9rem;">Gerado em: ${date}</p></div>`;
    extrasDb.notas.slice().reverse().forEach(n => { const bName = BIBLE_METADATA_LOCAL.find(b => b.id === n.book).name; html += `<div style="margin-bottom: 20px; padding: 15px; border: 1px solid #ddd; border-radius: 8px; background: #fafafa; page-break-inside: avoid;"><h3 style="margin: 0 0 10px 0; color: #2980b9;">${bName} ${n.chap}:${n.verse}</h3>`; if(n.tag && n.tag !== "Geral") html += `<span style="background: #eee; padding: 4px 10px; border-radius: 12px; font-size: 0.8rem; margin-bottom: 10px; display: inline-block; font-weight: bold;">${n.tag}</span>`; html += `<p style="margin: 10px 0 0 0; line-height: 1.6; font-size: 1.1rem;">${n.text.replace(/\n/g, '<br>')}</p><p style="margin: 15px 0 0 0; font-size: 0.85rem; color: #999; text-align: right;">Anotado em: ${n.date}</p></div>`; });
    printArea.innerHTML = html + `</div>`; setTimeout(() => { window.print(); }, 300);
}
function exportStudy() {
    if (!currentStudy) return; const printArea = createPrintArea(); const date = new Date().toLocaleDateString('pt-BR');
    let html = `<div style="font-family: Arial, sans-serif; color: #333;"><div style="text-align: center; margin-bottom: 30px;"><h1 style="color: #2c3e50; border-bottom: 2px solid #8e44ad; padding-bottom: 10px; display: inline-block;">${currentStudy.titulo}</h1><p style="color: #7f8c8d; font-size: 0.9rem;">Categoria: ${currentStudy.categoria} | Exportado em: ${date}</p></div><table style="width: 100%; border-collapse: collapse; margin-top: 20px;"><thead><tr><th style="text-align:left; padding-bottom:10px; color:#2980b9; width:50%;">Português</th><th style="text-align:left; padding-bottom:10px; color:#d35400; width:50%;">Cito Qasveheot</th></tr></thead><tbody>`;
    const linesPt = currentStudy.pt.split('\n'); const linesCq = currentStudy.cq.split('\n');
    for(let i=0; i<linesPt.length; i++) { let ptLine = linesPt[i].trim(); let cqLine = linesCq[i] ? linesCq[i].replace(/<[^>]*>?/gm, '').trim() : ""; if(ptLine === "" && cqLine === "") { html += `<tr><td colspan="2" style="padding: 10px 0;"></td></tr>`; continue; } html += `<tr style="page-break-inside: avoid;"><td style="width: 50%; padding: 12px 10px 12px 0; vertical-align: top; border-bottom: 1px solid #eee; font-size: 1.1rem; line-height:1.5;"><strong>${ptLine}</strong></td><td style="width: 50%; padding: 12px 0 12px 10px; vertical-align: top; border-bottom: 1px solid #eee;"><div style="color: #d35400; font-style: italic; font-size: 1.1rem; margin-bottom: 5px;">${cqLine}</div><div style="color: #8e44ad; font-size: 1.2rem; font-weight: bold;">${safeTransliterateCyrillic(cqLine)}</div></td></tr>`; }
    printArea.innerHTML = html + `</tbody></table></div>`; setTimeout(() => { window.print(); }, 300);
}

// ==========================================
// 5. TRADUTOR PESSOAL BLINDADO
// ==========================================
const PALAVRAS_PROTEGIDAS = [ "app", "conlang", "design", "wi-fi", "wifi", "smartphone", "notebook", "smartfix", "mikrotik", "starlink", "cq", "cito", "qasveheot" ];
function processTranslationWithProtection(rawText) {
    let text = rawText; let placeholders = {}; let counter = 0;
    text = text.replace(/\{([^}]+)\}/g, (m, w) => { let id = `8888800${counter++}`; placeholders[id] = w; return id; });
    PALAVRAS_PROTEGIDAS.forEach(word => { text = text.replace(new RegExp(`\\b${word}\\b`, 'gi'), (m) => { let id = `8888800${counter++}`; placeholders[id] = m; return id; }); });
    const lines = text.split('\n'); let cqLines = lines.map(l => translateCQ(l)); let cyrLines = cqLines.map(l => safeTransliterateCyrillic(l.replace(/<[^>]*>?/gm, '')));
    let cqHtml = cqLines.join('<br>'); let cyrHtml = cyrLines.join('<br>'); let cqOut = cqLines.join('\n').replace(/<[^>]*>?/gm, ''); let cyrOut = cyrLines.join('\n');
    for (let id in placeholders) { let w = placeholders[id]; let span = `<span style="color: #3498db; font-weight: bold;">${w}</span>`; cqHtml = cqHtml.replace(new RegExp(id, 'g'), span); cyrHtml = cyrHtml.replace(new RegExp(id, 'g'), span); cqOut = cqOut.replace(new RegExp(id, 'g'), w); cyrOut = cyrOut.replace(new RegExp(id, 'g'), w); }
    return { cqHtml, cyrHtml, cqOut, cyrOut };
}
function autoTranslatePersonal() { const input = document.getElementById('translator-pt-input'); if(!input) return; if(!input.value.trim()) { document.getElementById('translator-cq-output').innerHTML = "..."; document.getElementById('translator-cyr-output').innerHTML = "..."; return; } const res = processTranslationWithProtection(input.value); document.getElementById('translator-cq-output').innerHTML = res.cqHtml; document.getElementById('translator-cyr-output').innerHTML = res.cyrHtml; }
function copyPersonalTranslation() { const ptInput = document.getElementById('translator-pt-input').value.trim(); if (!ptInput) return alert("Digite algo para copiar!"); const result = processTranslationWithProtection(ptInput); const textToCopy = `[CQ Latino]\n${result.cqOut}\n\n[CQ Cirílico]\n${result.cyrOut}`; navigator.clipboard.writeText(textToCopy).then(() => { alert("Tradução copiada!"); }).catch(() => alert("Erro ao copiar.")); }

// ==========================================
// 6. PLANOS E ANOTAÇÕES
// ==========================================
const READING_PLANS_DEF = [ { id: '1year', title: 'Bíblia em 1 Ano', icon: '📖', days: 365, capPerDay: 4 }, { id: '6months', title: 'Bíblia em 6 Meses', icon: '⚡', days: 180, capPerDay: 7 } ];
function getAllBibleChapters() { let all = []; BIBLE_METADATA_LOCAL.forEach(b => { for(let i=1; i<=b.chaps; i++) all.push({ book: b.id, chap: i }); }); return all; }
function startPlan(planId) { if(confirm("Iniciar este plano?")) { extrasDb.plan.active = planId; extrasDb.plan.history = []; saveDataToDB('cq_extras_local', extrasDb); loadPlansUI(); } }
function markDayDone(dayIdx) { if(!extrasDb.plan.history.includes(dayIdx)) { extrasDb.plan.history.push(dayIdx); saveDataToDB('cq_extras_local', extrasDb); loadPlansUI(); } }
function loadPlansUI() {
    const list = document.getElementById('plans-list'); if(!list) return; list.innerHTML = ""; const activePlan = READING_PLANS_DEF.find(p => p.id === extrasDb.plan.active);
    if(activePlan) {
        document.getElementById('plans-main').classList.add('hidden'); document.getElementById('plan-active-ui').classList.remove('hidden'); const container = document.getElementById('active-plan-container'); const percent = Math.round((extrasDb.plan.history.length / activePlan.days) * 100); let todayIdx = extrasDb.plan.history.length; const allCaps = getAllBibleChapters(); const start = Math.floor(todayIdx * (1189/activePlan.days)); const end = Math.floor((todayIdx+1) * (1189/activePlan.days)); const todayCaps = allCaps.slice(start, end);
        let capsHtml = todayCaps.map(c => { const bName = BIBLE_METADATA_LOCAL.find(bm => bm.id === c.book).name; return `<div class="reading-item"><span>${bName} ${c.chap}</span><button class="btn-check" onclick="selectBook('${c.book}', false); document.getElementById('chapter-select').value=${c.chap}; loadSelectedChapter();">Ler</button></div>`; }).join('');
        container.innerHTML = `<div class="plan-card"><div class="plan-icon">${activePlan.icon}</div><h3>${activePlan.title}</h3><div class="progress-container"><div class="progress-bar" style="width: ${percent}%"></div></div><p><b>${percent}% Concluído</b> - Dia ${todayIdx + 1} de ${activePlan.days}</p><hr style="margin:20px 0; opacity:0.2;"><h4>Leitura de Hoje:</h4>${capsHtml}<button class="btn-primary" onclick="markDayDone(${todayIdx})" style="width:100%; margin-top:15px; background:#27ae60;">Finalizar Leitura</button></div>`;
    } else {
        document.getElementById('plans-main').classList.remove('hidden'); document.getElementById('plan-active-ui').classList.add('hidden');
        READING_PLANS_DEF.forEach(p => { const card = document.createElement('div'); card.className = "plan-card"; card.innerHTML = `<div class="plan-icon">${p.icon}</div><h3>${p.title}</h3><div class="plan-stats"><span>📅 ${p.days} Dias</span><span>📖 ${p.capPerDay} Cap/dia</span></div><button class="btn-primary" onclick="startPlan('${p.id}')" style="width:100%;">Iniciar Plano</button>`; list.appendChild(card); });
    }
}
function openNoteModal(bookId, chap, verse, textPt) { const bookName = BIBLE_METADATA_LOCAL.find(b => b.id === bookId).name; const rb = document.getElementById('note-ref-book'); if(rb) rb.value = bookId; const rc = document.getElementById('note-ref-chap'); if(rc) rc.value = chap; const rv = document.getElementById('note-ref-verse'); if(rv) rv.value = verse; const nt = document.getElementById('note-modal-title'); if(nt) nt.innerText = `Anotação: ${bookName} ${chap}:${verse}`; const nv = document.getElementById('note-modal-verse'); if(nv) nv.innerText = `"${textPt}"`; const existingNote = extrasDb.notas.find(n => n.book === bookId && n.chap == chap && n.verse == verse); const mt = document.getElementById('note-modal-text'); if(mt) mt.value = existingNote ? existingNote.text : ""; const ts = document.getElementById('note-tag-select'); if(ts) ts.value = existingNote && existingNote.tag ? existingNote.tag : "Geral"; const nm = document.getElementById('note-modal'); if(nm) nm.classList.remove('hidden'); }
function savePersonalNote() { const bookId = document.getElementById('note-ref-book').value; const chap = document.getElementById('note-ref-chap').value; const verse = document.getElementById('note-ref-verse').value; const mt = document.getElementById('note-modal-text'); const text = mt ? mt.value.trim() : ""; const ts = document.getElementById('note-tag-select'); const tag = ts ? ts.value : "Geral"; extrasDb.notas = extrasDb.notas.filter(n => !(n.book === bookId && n.chap == chap && n.verse == verse)); if(text !== "") { extrasDb.notas.push({ id: Date.now(), book: bookId, chap: chap, verse: verse, text: text, tag: tag, date: new Date().toLocaleDateString('pt-BR') }); } saveDataToDB('cq_extras_local', extrasDb); document.getElementById('note-modal').classList.add('hidden'); loadSelectedChapter(); }
function filterNotes(tag, btnElement) { const buttons = document.getElementById('note-filters').querySelectorAll('.btn-tag'); buttons.forEach(b => b.classList.remove('active')); if(btnElement) btnElement.classList.add('active'); loadPersonalNotes(tag); }
function loadPersonalNotes(filterTag = 'all') { const list = document.getElementById('notes-list'); if(!list) return; list.innerHTML = ""; let notasParaMostrar = extrasDb.notas; if(filterTag !== 'all') { notasParaMostrar = extrasDb.notas.filter(n => n.tag === filterTag); } if (!notasParaMostrar || notasParaMostrar.length === 0) { list.innerHTML = "<p style='color:var(--text); opacity:0.7;'>Nenhuma anotação nesta categoria.</p>"; return; } notasParaMostrar.slice().reverse().forEach(n => { const bookName = BIBLE_METADATA_LOCAL.find(b => b.id === n.book).name; const div = document.createElement('div'); div.className = "note-card"; let tagHtml = ""; if(n.tag && n.tag !== "Geral") { let icon = "🏷️"; if(n.tag === "Promessa") icon = "🌟"; if(n.tag === "Oração") icon = "🙏"; if(n.tag === "Estudo") icon = "📚"; if(n.tag === "Dúvida") icon = "❓"; tagHtml = `<span class="note-tag-label">${icon} ${n.tag}</span><br>`; } div.innerHTML = `<button class="note-delete" onclick="deleteNote(${n.id})">🗑️</button>${tagHtml}<span class="note-ref" onclick="currentBook='${n.book}'; document.getElementById('chapter-select').value=${n.chap}; showUI('reader'); loadSelectedChapter();">${bookName} ${n.chap}:${n.verse}</span><span class="note-date">Anotado em: ${n.date}</span><div class="note-text">${n.text.replace(/\n/g, '<br>')}</div>`; list.appendChild(div); }); }
function deleteNote(id) { if(confirm("Apagar anotação?")) { extrasDb.notas = extrasDb.notas.filter(n => n.id !== id); saveDataToDB('cq_extras_local', extrasDb); loadPersonalNotes('all'); } }
function openHighlightModal(bookId, chap, verse) { const bk = document.getElementById('hl-ref-book'); if(bk) bk.value = bookId; const ch = document.getElementById('hl-ref-chap'); if(ch) ch.value = chap; const vs = document.getElementById('hl-ref-verse'); if(vs) vs.value = verse; document.getElementById('highlight-modal').classList.remove('hidden'); }
function saveHighlight(color) { const bookId = document.getElementById('hl-ref-book').value; const chap = document.getElementById('hl-ref-chap').value; const verse = document.getElementById('hl-ref-verse').value; extrasDb.highlights = extrasDb.highlights.filter(h => !(h.book === bookId && h.chap == chap && h.verse == verse)); if(color !== 'clear') { extrasDb.highlights.push({ book: bookId, chap: chap, verse: verse, color: color }); } saveDataToDB('cq_extras_local', extrasDb); document.getElementById('highlight-modal').classList.add('hidden'); loadSelectedChapter(); }

// ==========================================
// 7. DICIONÁRIO E FLASHCARDS
// ==========================================
function openAddDictModal() { const nP = document.getElementById('new-word-pt'); if(nP){nP.value = ''; nP.dataset.oldPt = '';} document.getElementById('new-word-cq').value = ''; document.getElementById('add-dict-modal').classList.remove('hidden'); }
function closeAddDictModal() { document.getElementById('add-dict-modal').classList.add('hidden'); }
function saveNewDictionaryWord() { let ptWord = document.getElementById('new-word-pt').value.trim().toLowerCase(); let cqWord = document.getElementById('new-word-cq').value.trim().toLowerCase(); let oldPt = document.getElementById('new-word-pt').dataset.oldPt; if(!ptWord || !cqWord) return alert("Preencha as duas palavras!"); if (oldPt && oldPt !== ptWord) { delete extrasDb.customDict[oldPt]; if(typeof CQ_DICT !== 'undefined') delete CQ_DICT[oldPt]; } extrasDb.customDict[ptWord] = cqWord; saveDataToDB('cq_extras_local', extrasDb); if(typeof CQ_DICT !== 'undefined') CQ_DICT[ptWord] = cqWord; alert("Palavra salva com sucesso!"); closeAddDictModal(); loadDictionary(); }
function editCustomWord(ptWord) { document.getElementById('new-word-pt').value = ptWord; document.getElementById('new-word-cq').value = extrasDb.customDict[ptWord]; document.getElementById('new-word-pt').dataset.oldPt = ptWord; document.getElementById('add-dict-modal').classList.remove('hidden'); }
function deleteCustomWord(ptWord) { if(confirm(`Excluir "${ptWord}"?`)) { delete extrasDb.customDict[ptWord]; if(typeof CQ_DICT !== 'undefined') delete CQ_DICT[ptWord]; saveDataToDB('cq_extras_local', extrasDb); loadDictionary(); } }
function removeAccents(str) { return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase(); }
function filterDictionary() { const term = removeAccents(document.getElementById('dict-search').value.trim()); const cards = document.getElementById('dictionary-grid').children; for (let i = 0; i < cards.length; i++) { const pt = removeAccents(cards[i].querySelector('.dict-pt').innerText); const cq = removeAccents(cards[i].querySelector('.dict-cq').innerText); if (pt.includes(term) || cq.includes(term)) cards[i].style.display = ""; else cards[i].style.display = "none"; } }
function loadDictionary() { const grid = document.getElementById('dictionary-grid'); if(!grid) return; grid.innerHTML = ""; if(typeof CQ_DICT === 'undefined') return; const words = Object.keys(CQ_DICT).sort((a, b) => a.localeCompare(b)); words.forEach(ptWord => { const div = document.createElement('div'); div.className = "dict-card"; let cqOriginal = CQ_DICT[ptWord]; let cqDisplay = currentAlphabet === 'cyrillic' ? safeTransliterateCyrillic(cqOriginal) : cqOriginal; let adminBtns = ""; if (extrasDb.customDict[ptWord]) { adminBtns = `<div style="position: absolute; top: 5px; right: 5px; display: flex; gap: 8px;"><button onclick="editCustomWord('${ptWord.replace(/'/g, "\\'")}')" style="background:none; border:none; cursor:pointer; font-size:1rem;">✏️</button><button onclick="deleteCustomWord('${ptWord.replace(/'/g, "\\'")}')" style="background:none; border:none; cursor:pointer; font-size:1rem;">❌</button></div>`; div.style.position = "relative"; div.style.border = "2px solid #e67e22"; } 
// Protege o audio de quebrar os botões no dicionário
const safeCqAudioDict = cqOriginal.replace(/[\n\r]/g, ' ').replace(/'/g, "\\'");
div.innerHTML = `${adminBtns}<span class="dict-cq">${cqDisplay}</span><span class="dict-pt">${ptWord}</span><div style="display:flex; justify-content:center; gap:5px; margin-top:10px;"><button class="btn-nav" onclick="speak('${safeCqAudioDict}', '')" style="background:var(--secondary); padding: 5px 10px;">🔊</button><button class="btn-nav" onclick="saveFlashcard('${ptWord.replace(/'/g, "\\'")}', '${safeCqAudioDict}')" style="background:#f39c12; padding: 5px 10px;">⭐</button></div>`; grid.appendChild(div); }); }
function saveFlashcard(pt, cq) { if(extrasDb.flashcards.find(f => f.pt === pt)) return alert("Já salvo!"); extrasDb.flashcards.push({ id: Date.now(), pt: pt, cq: cq }); saveDataToDB('cq_extras_local', extrasDb); alert("Salvo nos Flashcards!"); const fUi = document.getElementById('flashcards-ui'); if (fUi && !fUi.classList.contains('hidden')) loadFlashcards(); }
function removeFlashcard(id) { extrasDb.flashcards = extrasDb.flashcards.filter(f => f.id !== id); saveDataToDB('cq_extras_local', extrasDb); loadFlashcards(); }
function loadFlashcards() { const list = document.getElementById('flashcards-list'); if(!list) return; list.innerHTML = ""; if (extrasDb.flashcards.length === 0) return; extrasDb.flashcards.slice().reverse().forEach(f => { const card = document.createElement('div'); card.className = "flashcard"; let displayCq = currentAlphabet === 'cyrillic' ? safeTransliterateCyrillic(f.cq) : f.cq; card.innerHTML = `<button class="btn-flashcard-remove" onclick="removeFlashcard(${f.id}); event.stopPropagation();">X</button><div class="flashcard-inner"><div class="flashcard-front"><span>${displayCq}</span><p>Clique para virar</p></div><div class="flashcard-back"><span>${f.pt}</span></div></div>`; card.onclick = () => card.classList.toggle('flipped'); list.appendChild(card); }); }

// ==========================================
// 8. QUIZ E PESQUISA
// ==========================================
function playSound(type) { if(audioCtx.state === 'suspended') audioCtx.resume(); const osc = audioCtx.createOscillator(); const gainNode = audioCtx.createGain(); osc.connect(gainNode); gainNode.connect(audioCtx.destination); if(type === 'correct') { osc.type = 'sine'; osc.frequency.setValueAtTime(523.25, audioCtx.currentTime); osc.frequency.exponentialRampToValueAtTime(880.00, audioCtx.currentTime + 0.1); gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime); gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5); osc.start(); osc.stop(audioCtx.currentTime + 0.5); } else { osc.type = 'sawtooth'; osc.frequency.setValueAtTime(150, audioCtx.currentTime); gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime); gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3); osc.start(); osc.stop(audioCtx.currentTime + 0.3); } }
function updateUserRank() { const up = document.getElementById('user-total-points'); if(up) up.innerText = userTotalPoints; const rankEl = document.getElementById('user-rank'); const medalEl = document.getElementById('user-medal'); if(!rankEl || !medalEl) return; if(userTotalPoints < 100) { rankEl.innerText = "Iniciante"; medalEl.innerText = "🥉"; } else if(userTotalPoints < 500) { rankEl.innerText = "Estudioso"; medalEl.innerText = "🥈"; } else if(userTotalPoints < 1500) { rankEl.innerText = "Mestre Bíblico"; medalEl.innerText = "🥇"; } else { rankEl.innerText = "Rei do Quiz"; medalEl.innerText = "👑"; } }
let activeQuizQuestions = []; let currentQIndex = 0; let currentScore = 0;
function clearQuizForm() { ['quiz-question','quiz-op1','quiz-op2','quiz-op3','quiz-op4'].forEach(id => document.getElementById(id).value = ''); document.getElementById('quiz-correct-ans').value = '1'; }
function saveQuizQuestion() { const q = document.getElementById('quiz-question').value; const o1 = document.getElementById('quiz-op1').value; const o2 = document.getElementById('quiz-op2').value; const o3 = document.getElementById('quiz-op3').value; const o4 = document.getElementById('quiz-op4').value; const cAns = parseInt(document.getElementById('quiz-correct-ans').value); if(!q || !o1 || !o2 || !o3 || !o4) return alert("Preencha tudo!"); if (editingId) { let index = extrasDb.quiz.findIndex(e => e.id === editingId); if(index > -1) { extrasDb.quiz[index] = { id: editingId, titulo: q, opcoes: [o1, o2, o3, o4], respostaCorreta: cAns - 1 }; } editingId = null; const bq = document.getElementById('btn-submit-quiz'); if(bq) bq.innerText = "💾 Salvar Pergunta"; alert("Atualizada!"); } else { extrasDb.quiz.push({ id: Date.now(), titulo: q, opcoes: [o1, o2, o3, o4], respostaCorreta: cAns - 1 }); alert("Salva!"); } saveDataToDB('cq_extras_local', extrasDb); clearQuizForm(); renderManageList(); }
function startQuiz() { if (extrasDb.quiz.length === 0) return alert("Nenhuma pergunta cadastrada!"); activeQuizQuestions = extrasDb.quiz.sort(() => 0.5 - Math.random()).slice(0, 10); currentQIndex = 0; currentScore = 0; document.getElementById('quiz-start').classList.add('hidden'); document.getElementById('quiz-result').classList.add('hidden'); document.getElementById('quiz-game').classList.remove('hidden'); loadQuizQuestion(); }
function loadQuizQuestion() { const q = activeQuizQuestions[currentQIndex]; document.getElementById('quiz-counter').innerText = `Pergunta ${currentQIndex + 1} de ${activeQuizQuestions.length}`; document.getElementById('quiz-score').innerText = `Pontos: ${currentScore}`; document.getElementById('quiz-question-text').innerText = q.titulo; document.getElementById('quiz-next-btn').classList.add('hidden'); const optsDiv = document.getElementById('quiz-options'); optsDiv.innerHTML = ""; q.opcoes.forEach((opt, index) => { const btn = document.createElement('button'); btn.className = "quiz-btn"; btn.innerText = opt; btn.onclick = () => selectQuizAnswer(index, btn); optsDiv.appendChild(btn); }); }
function selectQuizAnswer(selectedIndex, btnElement) { const q = activeQuizQuestions[currentQIndex]; const optsDiv = document.getElementById('quiz-options'); const buttons = optsDiv.querySelectorAll('.quiz-btn'); buttons.forEach(b => b.disabled = true); if (selectedIndex === q.respostaCorreta) { playSound('correct'); btnElement.classList.add('quiz-correct'); currentScore += 10; document.getElementById('quiz-score').innerText = `Pontos: ${currentScore}`; } else { playSound('wrong'); btnElement.classList.add('quiz-wrong'); buttons[q.respostaCorreta].classList.add('quiz-correct'); } document.getElementById('quiz-next-btn').classList.remove('hidden'); }
function nextQuizQuestion() { currentQIndex++; if (currentQIndex >= activeQuizQuestions.length) finishQuiz(); else loadQuizQuestion(); }
function finishQuiz() { document.getElementById('quiz-game').classList.add('hidden'); document.getElementById('quiz-result').classList.remove('hidden'); document.getElementById('quiz-final-score').innerText = currentScore; userTotalPoints += currentScore; localStorage.setItem('cq_user_points', userTotalPoints); const maxScore = activeQuizQuestions.length * 10; let feedback = ""; if (currentScore === maxScore) feedback = "Perfeito! 🥇"; else if (currentScore >= maxScore * 0.7) feedback = "Muito bem! 🥈"; else if (currentScore >= maxScore * 0.5) feedback = "Bom trabalho! 🥉"; else feedback = "Tente novamente! 📖"; document.getElementById('quiz-feedback-msg').innerText = feedback; updateUserRank(); }
function searchBible() { const sInput = document.getElementById('search-input'); if(!sInput) return; let termOriginal = sInput.value.trim(); const resultsDiv = document.getElementById('search-results'); if(!resultsDiv) return; resultsDiv.innerHTML = ""; if(!termOriginal) { resultsDiv.innerHTML = "<p>Digite algo.</p>"; return; } const normalizedTerm = removeAccents(termOriginal); let count = 0; for(let bookId in bibleDb) { const bookMeta = BIBLE_METADATA_LOCAL.find(b => b.id === bookId); const bookName = bookMeta ? bookMeta.name : bookId; for(let chap in bibleDb[bookId]) { for(let vNum in bibleDb[bookId][chap]) { if(vNum === '_audio') continue; const ptText = bibleDb[bookId][chap][vNum].pt; const cqText = bibleDb[bookId][chap][vNum].cq.replace(/<[^>]*>?/gm, ''); if(removeAccents(ptText).includes(normalizedTerm) || removeAccents(cqText).includes(normalizedTerm)) { count++; const div = document.createElement('div'); div.className = "result-card"; const regex = new RegExp(`(${termOriginal})`, 'gi'); let highlightedPt = ptText.replace(regex, '<span class="search-highlight">$1</span>'); if(!highlightedPt.includes('search-highlight')) highlightedPt = ptText; div.innerHTML = `<h4>${bookName} ${chap}:${vNum}</h4><p>${highlightedPt}</p>`; div.onclick = () => { currentBook = bookId; document.getElementById('chapter-select').value = chap; showUI('reader'); loadSelectedChapter(); setTimeout(() => { const vEl = document.getElementById(`verse-${vNum}`); if(vEl) { vEl.scrollIntoView({behavior: "smooth", block: "center"}); vEl.classList.add('active-reading'); setTimeout(() => { vEl.classList.remove('active-reading'); }, 2000); } }, 300); }; resultsDiv.appendChild(div); } } } } if(count === 0) resultsDiv.innerHTML = "<p>Nenhum resultado.</p>"; else { const summary = document.createElement('p'); summary.style = "color: var(--primary); font-weight: bold; margin-bottom: 15px;"; summary.innerHTML = `✅ ${count} resultado(s).`; resultsDiv.prepend(summary); } }

// ==========================================
// 9. EXTRAS E REAÇÕES (ESTUDOS, TEMAS, HINOS)
// ==========================================
function renderReactions(type, id) {
    const key = `${type}_${id}`; const userR = extrasDb.reactions[key];
    const emus = [{id:'love',icon:'❤️'},{id:'like',icon:'👍'},{id:'haha',icon:'😂'},{id:'wow',icon:'😮'},{id:'pray',icon:'🙏'}];
    let html = `<div class="reaction-bar">`;
    emus.forEach(e => { const active = userR === e.id ? 'active' : ''; html += `<button id="react-${key}-${e.id}" class="react-btn ${active}" onclick="setReaction('${type}','${id}','${e.id}')">${e.icon} <span id="count-${key}-${e.id}">${userR === e.id ? 1 : 0}</span></button>`; });
    return html + `</div>`;
}
function setReaction(t, id, r) {
    if(!extrasDb.reactions) extrasDb.reactions = {}; const key = `${t}_${id}`;
    if(extrasDb.reactions[key] === r) delete extrasDb.reactions[key]; else extrasDb.reactions[key] = r;
    saveDataToDB('cq_extras_local', extrasDb);
    const emus = ['love','like','haha','wow','pray'];
    emus.forEach(e => { const btn = document.getElementById(`react-${key}-${e}`); const cnt = document.getElementById(`count-${key}-${e}`); if(btn && cnt) { if(extrasDb.reactions[key] === e) { btn.classList.add('active'); cnt.innerText = "1"; } else { btn.classList.remove('active'); cnt.innerText = "0"; } } });
}

function saveTheme() { const title = document.getElementById('theme-title').value; const content = document.getElementById('theme-content').value; if(!title || !content) return alert("Preencha!"); const translatedCq = content.split('\n').map(line => translateCQ(line)).join('\n'); if (editingId) { let index = extrasDb.temas.findIndex(e => e.id === editingId); if(index > -1) { extrasDb.temas[index] = { ...extrasDb.temas[index], titulo: title, pt: content, cq: translatedCq }; } editingId = null; alert("Atualizado!"); } else { extrasDb.temas.push({ id: Date.now(), titulo: title, audio: "", pt: content, cq: translatedCq }); alert("Publicado!"); } saveDataToDB('cq_extras_local', extrasDb); document.getElementById('theme-title').value = ''; document.getElementById('theme-content').value = ''; loadTemas(); renderManageList(); }
function loadTemas() { const list = document.getElementById('themes-list'); if(!list) return; list.innerHTML = ""; if (extrasDb.temas.length === 0) return; extrasDb.temas.slice().reverse().forEach(t => { const pill = document.createElement('div'); pill.className = "theme-pill"; pill.innerHTML = `🔍 ${t.titulo}`; pill.onclick = () => openTheme(t.id); list.appendChild(pill); }); }
function openTheme(id) { stopAudio(); const theme = extrasDb.temas.find(e => e.id === id); if(!theme) return; currentTheme = theme; document.getElementById('themes-main').classList.add('hidden'); document.getElementById('theme-reader').classList.remove('hidden'); document.getElementById('theme-reader-title').textContent = theme.titulo; const container = document.getElementById('theme-reader-content'); container.innerHTML = renderReactions('theme', id); const linesPt = theme.pt.split('\n'); const linesCq = theme.cq.split('\n'); for(let i=0; i<linesPt.length; i++) { let ptLine = linesPt[i].trim(); let cqLine = linesCq[i] ? linesCq[i].trim() : ""; if(ptLine === "" && cqLine === "") { container.appendChild(document.createElement('br')); continue; } const cleanCQAudio = cqLine.replace(/<[^>]*>?/gm, '').replace(/[\n\r]/g, ' '); let displayCQ = currentAlphabet === 'cyrillic' ? safeTransliterateCyrillic(cqLine) : cqLine; const div = document.createElement('div'); div.className = "verse-row"; div.id = `theme-line-${i}`; div.innerHTML = `<div class="text-pt">${ptLine}</div><div class="text-cq"><button class="audio-btn" onclick="speak('${cleanCQAudio.replace(/'/g, "\\'")}', 'theme-line-${i}')">🔊</button> ${displayCQ}</div>`; container.appendChild(div); } }
function closeTheme() { stopAudio(); currentTheme = null; document.getElementById('theme-reader').classList.add('hidden'); document.getElementById('themes-main').classList.remove('hidden'); }

function saveEstudo() { const title = document.getElementById('study-title').value; const cat = document.getElementById('study-category').value; const content = document.getElementById('study-content').value; if(!title || !content) return alert("Preencha!"); const translatedCq = content.split('\n').map(line => translateCQ(line)).join('\n'); if (editingId) { let index = extrasDb.estudos.findIndex(e => e.id === editingId); if(index > -1) { extrasDb.estudos[index] = { ...extrasDb.estudos[index], titulo: title, categoria: cat, pt: content, cq: translatedCq }; } editingId = null; alert("Atualizado!"); } else { extrasDb.estudos.push({ id: Date.now(), titulo: title, categoria: cat, audio: "", pt: content, cq: translatedCq }); alert("Publicado!"); } saveDataToDB('cq_extras_local', extrasDb); document.getElementById('study-title').value = ''; document.getElementById('study-content').value = ''; loadEstudos(); renderManageList(); }
function loadEstudos() { const list = document.getElementById('studies-list'); if(!list) return; list.innerHTML = ""; if (extrasDb.estudos.length === 0) return; extrasDb.estudos.slice().reverse().forEach(s => { const card = document.createElement('div'); card.className = "study-card"; card.innerHTML = `<span class="study-tag">${s.categoria}</span><h3 style="margin: 10px 0 5px 0; color: var(--primary);">${s.titulo}</h3><p style="font-size: 0.9rem; color: var(--text); opacity: 0.8;">Clique para ler.</p>`; card.onclick = () => openStudy(s.id); list.appendChild(card); }); }
function openStudy(id) { stopAudio(); const study = extrasDb.estudos.find(e => e.id === id); if(!study) return; currentStudy = study; document.getElementById('studies-main').classList.add('hidden'); document.getElementById('study-reader').classList.remove('hidden'); document.getElementById('study-reader-title').textContent = study.titulo; const container = document.getElementById('study-reader-content'); container.innerHTML = renderReactions('study', id); const linesPt = study.pt.split('\n'); const linesCq = study.cq.split('\n'); for(let i=0; i<linesPt.length; i++) { let ptLine = linesPt[i].trim(); let cqLine = linesCq[i] ? linesCq[i].trim() : ""; if(ptLine === "" && cqLine === "") { container.appendChild(document.createElement('br')); continue; } const cleanCQAudio = cqLine.replace(/<[^>]*>?/gm, '').replace(/[\n\r]/g, ' '); let cyrillicText = safeTransliterateCyrillic(cleanCQAudio); const div = document.createElement('div'); div.className = "verse-row"; div.id = `study-line-${i}`; div.innerHTML = `<div class="text-pt">${ptLine}</div><div class="text-cq" style="position:relative;"><button class="audio-btn" onclick="speak('${cleanCQAudio.replace(/'/g, "\\'")}', 'study-line-${i}')">🔊</button> ${cqLine}<button class="btn-toggle-cyr" onclick="document.getElementById('cyr-study-${i}').classList.toggle('hidden'); this.innerText = this.innerText === '+' ? '-' : '+'" title="Ver Cirílico">+</button><div id="cyr-study-${i}" class="hidden cyrillic-block">${cyrillicText}</div></div>`; container.appendChild(div); } }
function closeStudy() { stopAudio(); currentStudy = null; document.getElementById('study-reader').classList.add('hidden'); document.getElementById('studies-main').classList.remove('hidden'); }

function saveHino() { const title = document.getElementById('hymn-title').value; const audioFile = document.getElementById('hymn-audio').value; const content = document.getElementById('hymn-content').value; if(!title || !content) return alert("Preencha!"); const translatedCq = content.split('\n').map(line => translateCQ(line)).join('\n'); if (editingId) { let index = extrasDb.hinos.findIndex(e => e.id === editingId); if(index > -1) { extrasDb.hinos[index] = { ...extrasDb.hinos[index], titulo: title, audio: audioFile, pt: content, cq: translatedCq }; } editingId = null; alert("Atualizado!"); } else { extrasDb.hinos.push({ id: Date.now(), titulo: title, audio: audioFile, pt: content, cq: translatedCq }); alert("Salvo!"); } saveDataToDB('cq_extras_local', extrasDb); document.getElementById('hymn-title').value = ''; document.getElementById('hymn-audio').value = ''; document.getElementById('hymn-content').value = ''; loadHinos(); renderManageList(); }
function loadHinos() { const list = document.getElementById('hymns-list'); if(!list) return; list.innerHTML = ""; if(extrasDb.hinos.length === 0) { list.innerHTML = "<p style='color: var(--text); opacity: 0.8;'>Nenhum hino cadastrado.</p>"; return; } extrasDb.hinos.slice().reverse().forEach(h => { const card = document.createElement('div'); card.className = "study-card"; card.style.cursor = "pointer"; card.innerHTML = `<h3 style="margin: 5px 0; color: var(--primary);">🎵 ${h.titulo}</h3><p style="font-size: 0.9rem; color: var(--text); opacity: 0.8;">Clique para abrir a letra e ouvir.</p>`; card.onclick = () => openHymn(h.id); list.appendChild(card); }); }
function openHymn(id) { stopAudio(); const h = extrasDb.hinos.find(e => e.id === id); if(!h) return; document.getElementById('hymns-main').classList.add('hidden'); document.getElementById('hymn-reader').classList.remove('hidden'); document.getElementById('hymn-reader-title').textContent = h.titulo; const container = document.getElementById('hymn-reader-content'); container.innerHTML = renderReactions('hymn', id); if (h.audio) { let audioSrc = getSafeAudioPath(h.audio, 'audios'); container.innerHTML += `<div style="background: var(--verse-hover); padding: 10px; border-radius: 8px; margin: 15px 0 10px 0; text-align: center;"><p style="margin-top: 0; font-weight: bold; color: var(--primary); font-size: 0.9rem;">🎵 Ouvir Hino</p><audio controls style="width: 100%; height: 40px; border-radius: 8px;"><source src="${audioSrc}"></audio></div>`; } const linesPt = h.pt.split('\n'); const linesCq = h.cq.split('\n'); let lyricsHtml = ""; for(let i=0; i<linesPt.length; i++) { let ptLine = linesPt[i].trim(); let cqLine = linesCq[i] ? linesCq[i].trim() : ""; if(currentAlphabet === 'cyrillic') cqLine = safeTransliterateCyrillic(cqLine); if(ptLine === "" && cqLine === "") { lyricsHtml += `<br>`; } else { lyricsHtml += `<div class="hymn-row"><div class="text-pt">${ptLine}</div><div class="text-cq">${cqLine}</div></div>`; } } container.innerHTML += `<div class="hymn-lyrics">${lyricsHtml}</div>`; }
function closeHymn() { const container = document.getElementById('hymn-reader-content'); if (container) { const audios = container.querySelectorAll('audio'); audios.forEach(a => a.pause()); } stopAudio(); document.getElementById('hymn-reader').classList.add('hidden'); document.getElementById('hymns-main').classList.remove('hidden'); }

// ==========================================
// 10. ADMIN, BACKUP E GERAÇÃO MESTRE
// ==========================================
function verifyAdmin() { const pc = document.getElementById('pass-code'); if(pc && pc.value === "541350as*") showUI('admin'); else alert("Código inválido!"); }

function autoGenerateStudy() {
    const books = Object.keys(bibleDb); if(books.length === 0) return alert("Sua Bíblia está vazia! Salve capítulos primeiro no painel Admin.");
    let validVerse = null, bName = "", rChap = "", rVerse = "", attempts = 0;
    while (!validVerse && attempts < 50) {
        const rBook = books[Math.floor(Math.random() * books.length)]; const chaps = Object.keys(bibleDb[rBook]);
        if (chaps.length > 0) {
            rChap = chaps[Math.floor(Math.random() * chaps.length)]; const verses = Object.keys(bibleDb[rBook][rChap]).filter(k => k !== '_audio');
            if (verses.length > 0) { rVerse = verses[Math.floor(Math.random() * verses.length)]; validVerse = bibleDb[rBook][rChap][rVerse]; bName = BIBLE_METADATA_LOCAL.find(b => b.id === rBook).name; }
        }
        attempts++;
    }
    if (!validVerse) return alert("Não encontrei versículos. Certifique-se de que os textos bíblicos foram salvos corretamente.");
    document.getElementById('study-title').value = `Esboço: ${bName} ${rChap}:${rVerse}`; document.getElementById('study-content').value = `[Texto Base]\n"${validVerse.pt}"\n\n[Introdução]\n(Escreva a introdução aqui)\n\n[Desenvolvimento]\n1. Primeiro ponto...\n2. Segundo ponto...\n\n[Conclusão]\n(Escreva a aplicação prática aqui)\n`;
}

function autoGenerateQuiz() { 
    const bookId = document.getElementById('admin-quiz-book').value; const bookData = bibleDb[bookId]; if(!bookData) return alert("Salve capítulos deste livro primeiro!"); let allVerses = []; for(let c in bookData) { for(let v in bookData[c]) { if(v !== '_audio') allVerses.push({c, v, text: bookData[c][v].pt}); } } if(allVerses.length < 4) return alert("Faltam versículos."); let target = allVerses[Math.floor(Math.random() * allVerses.length)]; let words = target.text.split(' ').filter(w => w.length > 4); if(words.length === 0) words = target.text.split(' '); let answerWord = words[Math.floor(Math.random() * words.length)].replace(/[.,;?!]/g, ''); let questionText = `Complete (${BIBLE_METADATA_LOCAL.find(b=>b.id==bookId).name} ${target.c}:${target.v}): "${target.text.replace(new RegExp(answerWord, 'i'), '_____')}"`; let wrongOpts = []; while(wrongOpts.length < 3) { let randV = allVerses[Math.floor(Math.random() * allVerses.length)]; let randWords = randV.text.split(' ').filter(w => w.length > 4); if(randWords.length > 0) { let rw = randWords[Math.floor(Math.random() * randWords.length)].replace(/[.,;?!]/g, ''); if(rw.toLowerCase() !== answerWord.toLowerCase() && !wrongOpts.includes(rw)) wrongOpts.push(rw); } } document.getElementById('quiz-question').value = questionText; document.getElementById('quiz-op1').value = answerWord; document.getElementById('quiz-op2').value = wrongOpts[0]; document.getElementById('quiz-op3').value = wrongOpts[1]; document.getElementById('quiz-op4').value = wrongOpts[2]; document.getElementById('quiz-correct-ans').value = "1"; const randomPos = Math.floor(Math.random() * 4) + 1; if(randomPos !== 1) { const tempVal = document.getElementById(`quiz-op${randomPos}`).value; document.getElementById(`quiz-op${randomPos}`).value = answerWord; document.getElementById('quiz-op1').value = tempVal; document.getElementById('quiz-correct-ans').value = randomPos; } 
}

function toggleAdminForm() {
    const mode = document.getElementById('admin-mode').value;
    ['bible', 'quiz', 'theme', 'study', 'hymn', 'translator'].forEach(m => { const el = document.getElementById(`form-${m}`); if(el) el.classList.toggle('hidden', mode !== m); });
    const manageMap = { 'quiz': 'quiz', 'theme': 'temas', 'study': 'estudos', 'hymn': 'hinos' };
    const mSelect = document.getElementById('manage-type'); const mList = document.getElementById('manage-list');
    if(mode === 'translator') { if(mSelect) mSelect.style.display = 'none'; if(mList) mList.style.display = 'none'; } 
    else if (mode === 'bible') { if(mSelect) mSelect.style.display = 'block'; if(mList) { mList.style.display = 'block'; mList.innerHTML = "<p style='color: var(--text); opacity: 0.8;'>Versículos editados acima.</p>"; } } 
    else if(manageMap[mode] && mSelect) { mSelect.style.display = 'block'; if(mList) mList.style.display = 'block'; mSelect.value = manageMap[mode]; renderManageList(); }
}

function renderManageList() {
    const type = document.getElementById('manage-type').value; const list = document.getElementById('manage-list'); list.innerHTML = "";
    if (!extrasDb[type] || extrasDb[type].length === 0) return;
    extrasDb[type].slice().reverse().forEach(item => {
        const div = document.createElement('div'); div.style = "display:flex; justify-content:space-between; align-items:center; background:var(--bg-color); padding:10px; margin-bottom:5px; border-radius:4px; color:var(--text); border:1px solid var(--border-color);";
        div.innerHTML = `<span><b>${item.titulo?item.titulo.substring(0,30):'Item'}...</b></span> <div><button onclick="editExtra('${type}', ${item.id})" style="background:#f39c12; color:white; border:none; padding:5px 10px; border-radius:4px; cursor:pointer; margin-right:5px;">✏️</button><button onclick="deleteExtra('${type}', ${item.id})" style="background:#e74c3c; color:white; border:none; padding:5px 10px; border-radius:4px; cursor:pointer;">❌</button></div>`;
        list.appendChild(div);
    });
}

function editExtra(type, id) { const item = extrasDb[type].find(i => i.id === id); if(!item) return; const formMap = { 'quiz': 'quiz', 'temas': 'theme', 'estudos': 'study', 'hinos': 'hymn' }; document.getElementById('admin-mode').value = formMap[type]; toggleAdminForm(); editingId = id; if(type === 'estudos') { document.getElementById('study-title').value = item.titulo; document.getElementById('study-category').value = item.categoria; document.getElementById('study-content').value = item.pt; } else if(type === 'hinos') { document.getElementById('hymn-title').value = item.titulo; document.getElementById('hymn-audio').value = item.audio || ""; document.getElementById('hymn-content').value = item.pt; } else if(type === 'temas') { document.getElementById('theme-title').value = item.titulo; document.getElementById('theme-content').value = item.pt; } else if(type === 'quiz') { document.getElementById('quiz-question').value = item.titulo; document.getElementById('quiz-op1').value = item.opcoes[0]; document.getElementById('quiz-op2').value = item.opcoes[1]; document.getElementById('quiz-op3').value = item.opcoes[2]; document.getElementById('quiz-op4').value = item.opcoes[3]; document.getElementById('quiz-correct-ans').value = (item.respostaCorreta + 1).toString(); } document.getElementById('content').scrollTo({top: 0, behavior: 'smooth'}); }
function deleteExtra(type, id) { if(confirm("Excluir permanentemente?")) { extrasDb[type] = extrasDb[type].filter(item => item.id !== id); saveDataToDB('cq_extras_local', extrasDb); renderManageList(); if(type==='estudos') loadEstudos(); if(type==='hinos') loadHinos(); if(type==='temas') loadTemas(); } }

async function fetchBulkFromAPI() { const abs = document.getElementById('admin-book-select'); if(!abs) return; const bookId = abs.value; const startChap = parseInt(document.getElementById('admin-chap-num').value); const endChap = parseInt(document.getElementById('admin-chap-end').value) || startChap; if(!bookId || !startChap) return alert("Selecione livro e capítulos."); if(endChap < startChap) return alert("Final não pode ser menor."); if((endChap - startChap) > 20) return alert("Máximo 20 por vez."); const btn = document.getElementById('btn-fetch-api'); if(btn) btn.disabled = true; if(!bibleDb[bookId]) bibleDb[bookId] = {}; const apiMap = { "NAH": "NAM", "PRO": "PROV", "SNG": "SONG OF SOLOMON", "JDG": "JUDGES", "PHM": "PHILEMON", "2JN": "2 JOHN", "3JN": "3 JOHN", "JUD": "JUDE", "OBA": "OBADIAH" }; const apiBookId = apiMap[bookId] || bookId; try { for(let c = startChap; c <= endChap; c++) { if(btn) btn.innerHTML = `⏳ Processando Cap ${c}...`; const response = await fetch(`https://bible-api.com/${apiBookId}+${c}?translation=almeida`); if(!response.ok) throw new Error("Erro cap " + c); const data = await response.json(); bibleDb[bookId][c] = { _audio: "" }; data.verses.forEach(v => { const cleanText = v.text.replace(/\n/g, ' ').trim(); bibleDb[bookId][c][v.verse] = { pt: cleanText, cq: translateCQ(cleanText) }; }); } saveDataToDB('bible_cq_local', bibleDb); alert(`✅ Salvos.`); loadAdminData(); if (currentBook === bookId) loadSelectedChapter(); } catch (e) { alert("Falha: " + e.message); } finally { if(btn) {btn.innerHTML = "☁️ Puxar e Salvar Lote"; btn.disabled = false;} } }
function importBulk() { const bookId = document.getElementById('admin-book-select').value; const chapNum = document.getElementById('admin-chap-num').value; const chapAudio = document.getElementById('admin-chap-audio').value; const text = document.getElementById('bulk-input').value; if(!bookId || !chapNum || !text) return; if(!bibleDb[bookId]) bibleDb[bookId] = {}; bibleDb[bookId][chapNum] = { _audio: chapAudio }; text.split('\n').forEach(line => { const match = line.trim().match(/^(\d+)\s+(.*)/); if(match) bibleDb[bookId][chapNum][match[1]] = { pt: match[2], cq: translateCQ(match[2]) }; }); saveDataToDB('bible_cq_local', bibleDb); alert("Salvo Offline!"); loadAdminData(); if (currentBook === bookId && document.getElementById('chapter-select').value === chapNum) loadSelectedChapter(); }
function loadAdminData() { const bookId = document.getElementById('admin-book-select').value; const chapNum = document.getElementById('admin-chap-num').value; const textArea = document.getElementById('bulk-input'); const audioInput = document.getElementById('admin-chap-audio'); if (bibleDb[bookId] && bibleDb[bookId][chapNum]) { let rawText = ""; const data = bibleDb[bookId][chapNum]; if(audioInput) audioInput.value = data._audio || ""; Object.keys(data).filter(k => k !== '_audio').sort((a,b) => a-b).forEach(v => rawText += `${v} ${data[v].pt}\n`); if(textArea) textArea.value = rawText.trim(); } else { if(textArea) textArea.value = ""; if(audioInput) audioInput.value = ""; } }

function saveToDisk() { const blob = new Blob([JSON.stringify({ bible: bibleDb, extras: extrasDb })], {type: "application/json"}); const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = "biblia_cq_backup.json"; a.click(); }
function loadFromDisk(event) { const reader = new FileReader(); reader.onload = (e) => { try { const restored = JSON.parse(e.target.result); if (restored.bible) { bibleDb = restored.bible; extrasDb = restored.extras || extrasDb; } else if (Object.keys(restored).some(k => BIBLE_METADATA_LOCAL.find(b => b.id === k))) { bibleDb = restored; } else { throw new Error("Estrutura não encontrada"); } if(!extrasDb.hinos) extrasDb.hinos=[]; if(!extrasDb.quiz) extrasDb.quiz=[]; if(!extrasDb.notas) extrasDb.notas=[]; if(!extrasDb.flashcards) extrasDb.flashcards=[]; if(!extrasDb.highlights) extrasDb.highlights=[]; if(!extrasDb.customDict) extrasDb.customDict={}; if(!extrasDb.reactions) extrasDb.reactions={}; if(!extrasDb.plan) extrasDb.plan={ active: null, history: [] }; saveDataToDB('bible_cq_local', bibleDb); saveDataToDB('cq_extras_local', extrasDb); alert("✅ Restaurado com sucesso!"); loadSelectedChapter(); loadEstudos(); loadHinos(); loadTemas(); loadPlansUI(); showUI('home'); } catch (error) { alert("Erro: Arquivo corrompido."); } }; reader.readAsText(event.target.files[0]); }