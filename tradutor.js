// ==========================================
// DICIONÁRIO OFICIAL CITO QASVEHEOT (CQ)
// Regra: Espirituais/Divinas = Hebraico/Latim. Comuns = Regra CQ.
// ==========================================

const CQ_DICT = {
    // === PALAVRAS ESPIRITUAIS E TEOLÓGICAS (Hebraico/Latim) ===
    "deus": "elochim",
    "senhor": "adonai",
    "jesus": "yeshua",
    "cristo": "mashiach",
    "espírito": "ruach",
    "santo": "kadosh",
    "céu": "shamayim",
    "terra": "eretz", // (Conforme Gênesis 1:1)
    "paz": "shalom",
    "graça": "chen",
    "misericórdia": "chesed",
    "fé": "emunah",
    "salvação": "yeshuah",
    "glória": "kabod",
    "sabedoria": "chokmah",
    "profeta": "nabi",
    "anjo": "malak",
    "pecado": "chet",
    "alma": "nefesh",
    "verdade": "emet",
    "justiça": "tzedek",
    "lei": "torah",
    "mandamento": "mitzvah",
    
    // === PALAVRAS COMUNS, SENTIMENTOS E NATUREZA (Raízes Próprias CQ) ===
    "amor": "inas",
    
    // ⚠️ Adicione abaixo o restante do seu vocabulário autêntico CQ ⚠️
    // "palavra_pt": "palavra_cq",
    
};

// ==========================================
// FUNÇÃO: TRADUTOR INTELIGENTE PT -> CQ
// ==========================================
function translateCQ(portugueseText) {
    if (!portugueseText) return "";
    const tokens = portugueseText.split(/([\s,.;:!?()[\]{}]+)/);
    
    let translatedArray = tokens.map(token => {
        if (/^[\s,.;:!?()[\]{}]+$/.test(token)) return token;
        
        let lowerToken = token.toLowerCase();
        let cleanTokenForSearch = lowerToken.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        
        let translatedWord = CQ_DICT[lowerToken] || CQ_DICT[cleanTokenForSearch];
        
        if (translatedWord) {
            // Mantém a primeira letra maiúscula se o original também era
            if (token[0] === token[0].toUpperCase()) {
                return translatedWord.charAt(0).toUpperCase() + translatedWord.slice(1);
            }
            return translatedWord;
        }
        return token;
    });

    return translatedArray.join('');
}

// ... (abaixo continua a sua função transliterateCyrillic igual estava antes) ...

const MAP = {'a':'i','e':'o','i':'u','o':'a','u':'e','b':'c','c':'d','d':'f','f':'g','g':'h','h':'j','j':'l','l':'m','m':'n','n':'p','p':'q','q':'r','r':'s','s':'t','t':'v','v':'x','x':'z','z':'b','k':'k','y':'y','w':'w','ç':'ç'};

const MAP_FULL = {};
for (const k in MAP) { 
    MAP_FULL[k] = MAP[k]; 
    MAP_FULL[k.toUpperCase()] = MAP[k].toUpperCase(); 
}

const CYRILLIC_MAP = {
    'a':'а', 'b':'б', 'c':'ц', 'd':'д', 'e':'е', 'f':'ф', 'g':'г', 'h':'х',
    'i':'и', 'j':'ж', 'k':'к', 'l':'л', 'm':'м', 'n':'н', 'o':'о', 'p':'п',
    'q':'к', 'r':'р', 's':'с', 't':'т', 'u':'у', 'v':'в', 'w':'в', 'x':'кс',
    'y':'й', 'z':'з', 'ç':'ч'
};

const CYRILLIC_FULL = {};
for (let k in CYRILLIC_MAP) {
    CYRILLIC_FULL[k] = CYRILLIC_MAP[k];
    CYRILLIC_FULL[k.toUpperCase()] = CYRILLIC_MAP[k].toUpperCase();
}

function translateCQ(text) {
    if(!text) return "";
    
    const tokens = text.match(/[\p{L}\p{N}]+['’]?[\p{L}\p{N}]*|[^\p{L}\p{N}\s]/gu) || [];
    
    let result = tokens.map(tok => {
        const lowerTok = tok.toLowerCase();
        
        if (GLOSSARIO_ORIGINAL[lowerTok]) {
            const term = GLOSSARIO_ORIGINAL[lowerTok];
            let formatTerm = term;
            if (tok === tok.toUpperCase()) formatTerm = term.toUpperCase();
            else if (tok[0] === tok[0].toUpperCase()) formatTerm = term.charAt(0).toUpperCase() + term.slice(1);
            return `<span class="original-term">${formatTerm}</span>`;
        }
        
        if (!/^[\p{L}]+$/u.test(tok.replace(/['’]/g, ''))) return tok;
        
        // Embrulhando a palavra com a função do dicionário de clique
        let translated = Array.from(tok).map(ch => {
            if (ch === 'ç' || ch === 'Ç') return ch;
            const nfd = ch.normalize('NFD');
            const mapped = MAP_FULL[nfd[0]] || nfd[0];
            let resChar = (nfd[0] === nfd[0].toUpperCase()) ? mapped.toUpperCase() : mapped.toLowerCase();
            return (resChar + nfd.slice(1)).normalize('NFC');
        }).join('');
        
        let safeTok = tok.replace(/'/g, "\\'"); // Protege apóstrofos
        return `<span class="cq-word" onclick="showDictionary(this, '${safeTok}')">${translated}</span>`;
        
    }).join(' ');

    return result.replace(/\s+([,.!?;:])/g, '$1');
}

function transliterateCyrillic(htmlText) {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlText;

    function traverse(node) {
        if (node.nodeType === 3) { 
            node.nodeValue = Array.from(node.nodeValue).map(ch => {
                const nfd = ch.normalize('NFD');
                const mapped = CYRILLIC_FULL[nfd[0]];
                return mapped ? (mapped + nfd.slice(1)).normalize('NFC') : ch;
            }).join('');
        } else if (node.nodeType === 1) { 
            if (!node.classList.contains('original-term')) {
                Array.from(node.childNodes).forEach(traverse);
            }
        }
    }
    traverse(tempDiv);
    return tempDiv.innerHTML;
}