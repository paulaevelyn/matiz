document.addEventListener('DOMContentLoaded', function () {
  'use strict';

  var PREFS_KEY = 'matiz_prefs_v1';
  var SESSIONS_KEY = 'matiz_v1';
  var PROGRESS_KEY = 'matiz_progress_v1';
  var DOSE_KEY = 'matiz_dose_v1';

  var DOSE_TAGS = ['🔍 Percebi um sinal no corpo', '🏷️ Consegui nomear a emoção', '💬 Comentei com alguém', '📝 Usei meu plano quando-então'];

  var osReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var speechSupported = 'speechSynthesis' in window;

  // ---------------------------------------------------------------
  // Conteúdo conceitual (tela "O que é uma emoção?") — base teórica:
  // três componentes da emoção (Scherer), tendência de ação (Frijda),
  // expressões universais (Ekman), regulação como habilidade e não
  // como supressão (Gross).
  // ---------------------------------------------------------------
  var concepts = [
    {
      icon: '🧩', title: 'O que é uma emoção?',
      text: 'Não é "coisa da cabeça" nem fraqueza — é informação rápida. Toda emoção tem três partes que acontecem quase juntas: <strong>uma mudança no corpo</strong> (coração, respiração, tensão), <strong>um sentimento</strong> (o jeito como isso é vivido por dentro) e <strong>uma vontade de agir</strong> específica. Quando você sente antes de "pensar", é essa engrenagem funcionando.'
    },
    {
      icon: '🛡️', title: 'Pra que servem as emoções',
      text: 'Cada uma das seis emoções básicas existe porque, ao longo da nossa história como espécie, ela resolveu um problema real: fugir de perigo, notar uma perda, defender um limite, se aproximar do que é bom. <strong>Não existe emoção "errada"</strong> — existe emoção incômoda de sentir. O objetivo aqui não é eliminar nenhuma delas, é entender o recado que cada uma traz.'
    },
    {
      icon: '⚡', title: 'Tendência de ação',
      text: 'Cada emoção vem com um "programa" pronto: um impulso específico do que fazer — o medo empurra pra fugir, a raiva empurra pra enfrentar, o nojo empurra pra afastar. Isso se chama <strong>tendência de ação</strong>. Reconhecer esse impulso não significa obedecer a ele automaticamente — significa ganhar a escolha de segui-lo ou não.'
    },
    {
      icon: '🎛️', title: 'O que é regulação emocional',
      text: 'Regular uma emoção <strong>não é reprimir</strong> nem "ficar bem" o tempo todo. É um processo de três passos: <strong>perceber</strong> o que está acontecendo no corpo, <strong>nomear</strong> a emoção com precisão, e só então <strong>escolher</strong> a resposta — em vez de reagir no piloto automático. Regular bem não significa nunca sentir raiva ou medo; significa ter mais opções quando eles aparecerem.'
    },
    {
      icon: '👥', title: 'Reconhecer em você e nos outros',
      text: 'Existem dois radares: um <strong>interno</strong> (interocepção) — os sinais do seu próprio corpo — e um <strong>externo</strong> — expressões faciais e de postura que, segundo o pesquisador Paul Ekman, se repetem de forma parecida em culturas bem diferentes. Treinar os dois radares é a base do que costuma ser chamado de inteligência emocional.'
    }
  ];

  // ---------------------------------------------------------------
  // Conteúdo das emoções — linguagem simples e âncoras concretas de
  // corpo/pensamento, mais origem evolutiva, tendência de ação,
  // sinais visíveis em outras pessoas e uma cena do dia a dia pra
  // conectar com a realidade. Cada emoção carrega uma frase-gatilho
  // curta usada no plano "quando eu perceber ___".
  // ---------------------------------------------------------------
  var emotions = [
    {
      name: 'Alegria', emoji: '😊', accent: 'joy', trigger: 'uma sensação de leveza no corpo',
      definition: 'Uma sensação boa que aparece quando algo dá certo ou é agradável.',
      origin: 'Evoluiu porque nos aproxima do que é bom — comida, companhia, segurança. Quem sentia prazer em se conectar e explorar tinha mais chances de sobreviver e prosperar.',
      actionTendency: ['Dá vontade de se aproximar', 'Compartilhar com alguém', 'Continuar fazendo aquilo'],
      thoughts: ['"Isso é bom."', '"Quero repetir isso."', '"Quero contar pra alguém."'],
      physical: ['Mais energia no corpo', 'Sorriso que vem sem esforço', 'Sensação de leveza'],
      recognizeOthers: ['Sorriso que chega aos olhos', 'Postura mais aberta e solta', 'Fala mais leve e mais rápida'],
      scenario: 'Você recebe uma notícia boa e sente vontade de contar pra alguém na mesma hora — é a alegria empurrando você a compartilhar e fortalecer vínculos.',
      applyPrompt: 'Da próxima vez: nomeie em voz alta e aproveite 10 segundos antes de seguir em frente.',
      healthy: ['Aproveitar o momento', 'Agradecer', 'Compartilhar com alguém de confiança'],
      unhealthy: ['Buscar só prazer rápido o tempo todo', 'Depender da aprovação dos outros para se sentir bem'],
      fn: 'Nos motiva a repetir o que faz bem e fortalece nossos laços com as pessoas.',
      science: 'O cérebro libera dopamina e serotonina — substâncias ligadas a prazer e bem-estar.'
    },
    {
      name: 'Tristeza', emoji: '😢', accent: 'sad', trigger: 'um nó na garganta',
      definition: 'Aparece quando perdemos algo ou alguém, ou vivemos uma decepção.',
      origin: 'Evoluiu como resposta à perda — de pessoas, vínculos, recursos. Ela reduz nossa energia pra pedir ajuda e reavaliar o que realmente importa.',
      actionTendency: ['Dá vontade de se recolher', 'Ficar quieto por um tempo', 'Buscar conforto'],
      thoughts: ['"Sinto falta disso."', '"Isso é difícil."', '"Preciso de um tempo."'],
      physical: ['Peito mais pesado', 'Menos energia', 'Vontade de chorar'],
      recognizeOthers: ['Cantos da boca caídos', 'Olhar baixo, ombros curvados', 'Fala mais devagar e mais baixa'],
      scenario: 'Um amigo se muda de cidade e você sente um vazio quando pensa nele — a tristeza está sinalizando o quanto esse vínculo importava.',
      applyPrompt: 'Da próxima vez: permita-se sentir por alguns minutos antes de tentar "resolver" — a tristeza pede tempo, não solução imediata.',
      healthy: ['Permitir-se sentir', 'Pedir apoio', 'Dar tempo pra si mesmo'],
      unhealthy: ['Esconder o que sente', 'Se isolar completamente', 'Ficar remoendo sem buscar ajuda'],
      fn: 'Ajuda a processar perdas e avisa às pessoas ao redor que precisamos de cuidado.',
      science: 'Áreas do cérebro ligadas ao processamento emocional (como a amígdala) ficam mais ativas.'
    },
    {
      name: 'Raiva', emoji: '😠', accent: 'anger', trigger: 'o coração acelerado e músculos tensos',
      definition: 'Surge quando algo parece injusto, quando somos frustrados ou nos sentimos ameaçados.',
      origin: 'Evoluiu para nos defender quando algo importante é violado — nossos limites, nosso espaço, nossa dignidade.',
      actionTendency: ['Dá vontade de enfrentar', 'Corrigir a injustiça', 'Se impor'],
      thoughts: ['"Isso é injusto."', '"Não vou aceitar isso."', '"Preciso me defender."'],
      physical: ['Coração acelera', 'Músculos tensos', 'Sensação de calor'],
      recognizeOthers: ['Sobrancelhas franzidas, olhar fixo', 'Mandíbula tensa, lábios apertados', 'Gestos mais bruscos'],
      scenario: 'Alguém fura sua fila depois de você esperar 40 minutos — a raiva é o sinal de que um limite foi ultrapassado.',
      applyPrompt: 'Da próxima vez: nomeie "estou com raiva" antes de agir — isso já cria uma pausa entre sentir e fazer.',
      healthy: ['Reconhecer o que sente', 'Falar de forma direta e respeitosa', 'Colocar limites'],
      unhealthy: ['Explodir sem pensar', 'Agredir com palavras ou ações', 'Engolir tudo por dentro'],
      fn: 'Ajuda a enfrentar obstáculos e proteger o que é importante pra gente.',
      science: 'O corpo entra em alerta e libera adrenalina, preparando uma reação rápida.'
    },
    {
      name: 'Medo', emoji: '😨', accent: 'fear', trigger: 'o coração disparado e a respiração rápida',
      definition: 'Aparece quando algo parece uma ameaça à nossa segurança, física ou emocional.',
      origin: 'Evoluiu para nos manter vivos diante de ameaças reais — é um dos sistemas mais antigos e mais rápidos do cérebro.',
      actionTendency: ['Dá vontade de fugir', 'Se esconder', 'Congelar no lugar'],
      thoughts: ['"Isso é perigoso."', '"Algo ruim pode acontecer."', '"Preciso me proteger."'],
      physical: ['Coração dispara', 'Pupilas dilatam', 'Respiração rápida'],
      recognizeOthers: ['Olhos arregalados, sobrancelhas erguidas', 'Corpo encolhido ou tenso', 'Voz mais aguda ou trêmula'],
      scenario: 'Um carro freia bruscamente perto de você — o coração dispara antes mesmo de "pensar" no perigo. É o medo te protegendo.',
      applyPrompt: 'Da próxima vez: pergunte-se "esse perigo é real e imediato, ou é só uma possibilidade?" — ajuda a calibrar a resposta.',
      healthy: ['Avaliar o perigo com calma', 'Se proteger quando necessário', 'Encarar aos poucos o que assusta'],
      unhealthy: ['Evitar tudo que dá medo', 'Entrar em pânico', 'Viver preocupado com coisas pouco prováveis'],
      fn: 'Nos protege de perigos reais, preparando o corpo para agir rápido.',
      science: 'A amígdala detecta ameaças e aciona uma resposta antes mesmo de "pensarmos" conscientemente.'
    },
    {
      name: 'Nojo', emoji: '🤢', accent: 'disgust', trigger: 'vontade de me afastar de algo ou alguém',
      definition: 'Uma reação de rejeição a algo que parece contaminado, nocivo ou que fere nossos valores.',
      origin: 'Evoluiu para nos afastar do que pode contaminar ou adoecer — comida estragada, doenças e, mais tarde, também violações morais.',
      actionTendency: ['Dá vontade de se afastar', 'Rejeitar', 'Expelir ou evitar contato'],
      thoughts: ['"Isso é repulsivo."', '"Preciso me afastar."', '"Isso pode me fazer mal."'],
      physical: ['Enjoo', 'Nariz franzido', 'Vontade de se afastar'],
      recognizeOthers: ['Nariz enrugado, lábio superior levantado', 'Cabeça ou corpo virado pra longe', 'Expressão de repulsa no rosto'],
      scenario: 'Você abre a geladeira e sente um cheiro estranho — o nojo faz você recuar antes de qualquer risco real.',
      applyPrompt: 'Da próxima vez: repare se o nojo é sobre algo concreto (comida, cheiro) ou um julgamento moral — parecem iguais, mas pedem respostas diferentes.',
      healthy: ['Reconhecer o incômodo', 'Se afastar quando faz sentido', 'Questionar reações exageradas'],
      unhealthy: ['Rejeitar pessoas ou situações sem refletir', 'Julgar com base só numa reação forte'],
      fn: 'Nos protege de coisas que podem nos fazer mal, como comida estragada ou situações arriscadas.',
      science: 'Ativa a ínsula, área do cérebro ligada a sabores desagradáveis e sensações de repulsa.'
    },
    {
      name: 'Surpresa', emoji: '😲', accent: 'surprise', trigger: 'uma reação rápida a algo inesperado',
      definition: 'Uma reação rápida a algo inesperado, que interrompe o que estávamos pensando ou fazendo.',
      origin: 'Evoluiu pra interromper o que estávamos fazendo e redirecionar toda a atenção pro que é novo — antes mesmo de sabermos se é bom ou ruim.',
      actionTendency: ['Dá vontade de parar', 'Olhar e prestar atenção', 'Entender rápido o que aconteceu'],
      thoughts: ['"Não esperava por isso!"', '"O que está acontecendo?"', '"Preciso entender rápido."'],
      physical: ['Sobrancelhas sobem', 'Olhos arregalam', 'Respiração muda de repente'],
      recognizeOthers: ['Sobrancelhas erguidas, olhos arregalados', 'Boca aberta', 'Corpo momentaneamente parado'],
      scenario: 'Alguém aparece de surpresa numa festa — antes de sentir alegria ou susto, o corpo já reagiu à surpresa em si.',
      applyPrompt: 'Da próxima vez: dê um segundo pra deixar a surpresa passar antes de decidir como reagir ao que veio depois dela.',
      healthy: ['Ficar aberto ao novo', 'Se adaptar com calma à mudança'],
      unhealthy: ['Travar diante do inesperado', 'Reagir de forma exagerada a pequenas mudanças'],
      fn: 'Ajuda a redirecionar rápido nossa atenção para o que é novo, preparando uma resposta.',
      science: 'Ativa por um instante o sistema de alerta do cérebro, pausando o que estava em andamento.'
    }
  ];

  var extraChips = ['não souber nomear o que sinto'];

  var gameTypes = [
    { question: 'Combine cada emoção com sua definição', property: 'definition', label: 'Definições', purpose: 'Praticar o conceito geral de cada emoção.' },
    { question: 'Combine cada emoção com as sensações no corpo (em você)', property: 'physical', label: 'Sensações no corpo', purpose: 'Treinar a ligação entre sensação no corpo e nome da emoção — a base da granularidade emocional.' },
    { question: 'Combine cada emoção com os sinais visíveis em outras pessoas', property: 'recognizeOthers', label: 'Reconhecer nos outros', purpose: 'Praticar reconhecer essa emoção em outras pessoas, pela expressão e pela postura.' },
    { question: 'Combine cada emoção com a vontade de agir que ela desperta', property: 'actionTendency', label: 'Tendência de ação', purpose: 'Perceber o impulso específico de cada emoção — o primeiro passo pra escolher se vai segui-lo.' },
    { question: 'Combine cada emoção com uma cena do dia a dia', property: 'scenario', label: 'Aplicar na vida real', purpose: 'Conectar cada emoção com situações reais, pra reconhecer também fora do jogo.' },
    { question: 'Combine cada emoção com os pensamentos comuns', property: 'thoughts', label: 'Pensamentos', purpose: 'Reconhecer os pensamentos que costumam acompanhar cada emoção.' },
    { question: 'Combine cada emoção com formas saudáveis de lidar', property: 'healthy', label: 'Formas saudáveis', purpose: 'Lembrar de respostas que ajudam quando essa emoção aparecer.' }
  ];

  var feedbackMessages = {
    correct: ['Isso mesmo! 🎉', 'Muito bem! ✨', 'Combinação certa! 👏', 'Você está indo bem! 🌟'],
    incorrect: ['Não foi essa. Tente de novo. 💪', 'Quase lá — olhe com calma. 🔍', 'Sem problema, tente outra vez. 🌱']
  };

  function weekStart(dateObj) {
    var d = dateObj ? new Date(dateObj) : new Date();
    var day = (d.getDay() + 6) % 7; // segunda = 0
    d.setDate(d.getDate() - day);
    return d.toISOString().slice(0, 10);
  }

  function propToText(val) { return Array.isArray(val) ? val.join(' ') : val; }
  function li(text) { return '<li>' + text + '</li>'; }
  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = a[i]; a[i] = a[j]; a[j] = tmp;
    }
    return a;
  }

  // ---------------------------------------------------------------
  // Preferências (persistidas, independentes do histórico)
  // ---------------------------------------------------------------
  var prefs = loadPrefs();

  function loadPrefs() {
    try {
      var raw = localStorage.getItem(PREFS_KEY);
      var p = raw ? JSON.parse(raw) : {};
      return {
        reducedMotion: p.reducedMotion === true,
        largeText: p.largeText === true,
        highContrast: p.highContrast === true,
        audioEnabled: p.audioEnabled !== false,
        profile: p.profile === 'body-first' ? 'body-first' : 'general'
      };
    } catch (e) {
      return { reducedMotion: false, largeText: false, highContrast: false, audioEnabled: true, profile: 'general' };
    }
  }

  // Tailoring (Murta/GEPPSVida): a ordem dos 6 desafios muda conforme o
  // perfil escolhido pela pessoa. "Corpo primeiro" começa pelas sensações
  // físicas antes dos rótulos — ajuda quem tem mais dificuldade em
  // perceber o que sente antes de nomear.
  function buildGameOrder(profile) {
    if (profile === 'body-first') {
      var order = ['physical', 'recognizeOthers', 'definition', 'actionTendency', 'scenario', 'thoughts', 'healthy'];
      return order.map(function (prop) { return gameTypes.filter(function (g) { return g.property === prop; })[0]; });
    }
    return gameTypes.slice();
  }

  function savePrefs() {
    try { localStorage.setItem(PREFS_KEY, JSON.stringify(prefs)); } catch (e) { /* indisponível */ }
  }

  function applyPrefs() {
    document.body.classList.toggle('pref-reduced-motion', prefs.reducedMotion);
    document.body.classList.toggle('pref-large-text', prefs.largeText);
    document.body.classList.toggle('pref-high-contrast', prefs.highContrast);
  }

  function reducedMotionActive() { return osReducedMotion || prefs.reducedMotion; }

  // ---------------------------------------------------------------
  // Estado
  // ---------------------------------------------------------------
  var state = {
    screen: 'start',
    emotionIndex: 0,
    gameIndex: 0,
    score: 0,
    selected: null,
    matchedPairs: 0,
    matchedEmotions: [],
    selfBefore: [null, null],
    selfAfter: [null, null],
    gameBreakdown: [],
    vocabWords: {},
    ifThenPlan: '',
    orderedGameTypes: gameTypes.slice()
  };

  var totalSteps = emotions.length + gameTypes.length;
  var completedSteps = 0;
  var currentUtterance = null;

  // ---------------------------------------------------------------
  // Elementos
  // ---------------------------------------------------------------
  var screens = {
    start: document.getElementById('scr-start'),
    prefs: document.getElementById('scr-prefs'),
    check: document.getElementById('scr-check'),
    concept: document.getElementById('scr-concept'),
    learning: document.getElementById('scr-learning'),
    game: document.getElementById('scr-game'),
    ifthen: document.getElementById('scr-ifthen'),
    result: document.getElementById('scr-result'),
    data: document.getElementById('scr-data')
  };

  var el = {
    startBtn: document.getElementById('start-btn'),
    resumeBanner: document.getElementById('resume-banner'),
    resumeBtn: document.getElementById('resume-btn'),
    freshStartBtn: document.getElementById('fresh-start-btn'),

    prefsBtn: document.getElementById('prefs-btn'),
    prefsDoneBtn: document.getElementById('prefs-done-btn'),
    prefReducedMotion: document.getElementById('pref-reduced-motion'),
    prefLargeText: document.getElementById('pref-large-text'),
    prefHighContrast: document.getElementById('pref-high-contrast'),
    prefAudio: document.getElementById('pref-audio'),
    profileGeneral: document.getElementById('profile-general'),
    profileBodyFirst: document.getElementById('profile-body-first'),

    doseCard: document.getElementById('dose-card'),
    doseTags: document.getElementById('dose-tags'),
    doseText: document.getElementById('dose-text'),
    doseSaveBtn: document.getElementById('dose-save-btn'),
    doseSkipBtn: document.getElementById('dose-skip-btn'),

    goCheckBtn: document.getElementById('go-check-btn'),
    skipCheckBtn: document.getElementById('skip-check-btn'),
    checkContinueBtn: document.getElementById('check-continue-btn'),
    checkTitle: document.getElementById('check-title'),
    checkQuestions: document.getElementById('check-questions'),

    conceptList: document.getElementById('concept-list'),
    conceptContinueBtn: document.getElementById('concept-continue-btn'),

    prevEmotion: document.getElementById('prev-emotion'),
    nextEmotion: document.getElementById('next-emotion'),
    goToGame: document.getElementById('go-to-game'),
    learningProgress: document.getElementById('learning-progress'),
    emotionContent: document.getElementById('emotion-content'),

    score: document.getElementById('score'),
    gameProgress: document.getElementById('game-progress'),
    progressText: document.getElementById('progress-text'),
    roundPurpose: document.getElementById('round-purpose'),
    gameQuestion: document.getElementById('game-question'),
    gameContent: document.getElementById('game-content'),
    hintBtn: document.getElementById('hint-btn'),
    nextGame: document.getElementById('next-game'),
    finishGame: document.getElementById('finish-game'),
    feedback: document.getElementById('feedback'),
    feedbackContent: document.getElementById('feedback-content'),
    confettiContainer: document.getElementById('confetti-container'),

    ifthenChips: document.getElementById('ifthen-chips'),
    ifthenInput: document.getElementById('ifthen-input'),
    ifthenContinueBtn: document.getElementById('ifthen-continue-btn'),
    ifthenSkipBtn: document.getElementById('ifthen-skip-btn'),

    finalScore: document.getElementById('final-score'),
    resultDelta: document.getElementById('result-delta'),
    restartBtn: document.getElementById('restart-btn'),

    backBtn: document.getElementById('back-btn'),
    homeBtn: document.getElementById('home-btn'),
    skipBtn: document.getElementById('skip-btn'),
    dataBtn: document.getElementById('data-btn'),
    overallProgressBar: document.getElementById('overall-progress-bar'),

    sessionList: document.getElementById('session-list'),
    planList: document.getElementById('plan-list'),
    exportHtmlBtn: document.getElementById('export-html-btn'),
    exportJsonBtn: document.getElementById('export-json-btn'),
    clearDataBtn: document.getElementById('clear-data-btn'),
    exportHtmlResult: document.getElementById('export-html-result'),
    exportJsonResult: document.getElementById('export-json-result'),
    exportRefResult: document.getElementById('export-ref-result')
  };

  var checkQuestionsText = [
    'Quando sinto algo forte, consigo dizer com palavras o que é (ex.: "isso é raiva", "isso é medo").',
    'Consigo perceber sinais no meu corpo (coração acelerado, nó na garganta) que me ajudam a entender o que sinto.'
  ];
  var scaleLabels = ['Quase nunca', 'Raramente', 'Às vezes', 'Quase sempre', 'Sempre'];

  // ---------------------------------------------------------------
  // Navegação entre telas
  // ---------------------------------------------------------------
  function showScreen(name) {
    Object.keys(screens).forEach(function (k) {
      if (screens[k]) screens[k].classList.toggle('hidden', k !== name);
    });
    state.screen = name;
    updateNav();
    window.scrollTo({ top: 0, behavior: reducedMotionActive() ? 'auto' : 'smooth' });
  }

  function updateNav() {
    var isStart = state.screen === 'start';
    el.backBtn.disabled = isStart;
    el.skipBtn.classList.toggle('hidden', !(state.screen === 'concept' || state.screen === 'learning' || state.screen === 'game'));
    el.dataBtn.classList.toggle('hidden', state.screen === 'data');
  }

  function updateOverallProgress() {
    var pct = Math.min(100, (completedSteps / totalSteps) * 100);
    el.overallProgressBar.style.width = pct + '%';
  }

  // ---------------------------------------------------------------
  // Retomada de sessão (efeito Zeigarnik, sem culpa)
  // ---------------------------------------------------------------
  function loadProgress() {
    try {
      var raw = localStorage.getItem(PROGRESS_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) { return null; }
  }

  function saveProgress() {
    var progress = {
      screen: state.screen,
      emotionIndex: state.emotionIndex,
      gameIndex: state.gameIndex,
      score: state.score,
      completedSteps: completedSteps,
      selfBefore: state.selfBefore,
      vocabWords: state.vocabWords,
      gameBreakdown: state.gameBreakdown,
      savedAt: new Date().toISOString()
    };
    try { localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress)); } catch (e) { /* indisponível */ }
  }

  function clearProgress() {
    try { localStorage.removeItem(PROGRESS_KEY); } catch (e) { /* indisponível */ }
  }

  function checkForResume() {
    var progress = loadProgress();
    if (progress && (progress.screen === 'learning' || progress.screen === 'game')) {
      el.resumeBanner.classList.remove('hidden');
      el.resumeBanner._data = progress;
      return true;
    }
    el.resumeBanner.classList.add('hidden');
    return false;
  }

  // ---------------------------------------------------------------
  // Dose Cultivada: check-in semanal leve e opcional, só aparece pra
  // quem já jogou pelo menos uma vez. Nunca bloqueia, nunca cobra —
  // "dispensar essa semana" é uma opção tão válida quanto registrar.
  // ---------------------------------------------------------------
  function loadDose() {
    try {
      var raw = localStorage.getItem(DOSE_KEY);
      return raw ? JSON.parse(raw) : { records: [], skipWeek: null };
    } catch (e) { return { records: [], skipWeek: null }; }
  }

  function saveDose(dose) {
    try { localStorage.setItem(DOSE_KEY, JSON.stringify(dose)); } catch (e) { /* indisponível */ }
  }

  function renderDoseCard() {
    var ws = weekStart();
    var dose = loadDose();
    var alreadyLogged = dose.records.some(function (r) { return r.weekStart === ws; });
    var hasHistory = loadSessions().length > 0;
    if (!hasHistory || alreadyLogged || dose.skipWeek === ws) {
      el.doseCard.classList.add('hidden');
      return;
    }
    el.doseTags.innerHTML = DOSE_TAGS.map(function (t) {
      return '<button type="button" class="chip" data-tag="' + t.replace(/"/g, '&quot;') + '" aria-pressed="false">' + t + '</button>';
    }).join('');
    Array.prototype.forEach.call(el.doseTags.querySelectorAll('.chip'), function (chip) {
      chip.addEventListener('click', function () {
        chip.setAttribute('aria-pressed', chip.getAttribute('aria-pressed') === 'true' ? 'false' : 'true');
      });
    });
    el.doseText.value = '';
    el.doseCard.classList.remove('hidden');
  }

  el.doseSaveBtn.addEventListener('click', function () {
    var tags = Array.prototype.filter.call(el.doseTags.querySelectorAll('.chip'), function (c) { return c.getAttribute('aria-pressed') === 'true'; }).map(function (c) { return c.dataset.tag; });
    var text = el.doseText.value.trim();
    if (!tags.length && !text) { el.doseCard.classList.add('hidden'); return; }
    var dose = loadDose();
    dose.records.push({ ts: Date.now(), date: new Date().toISOString(), weekStart: weekStart(), tags: tags, text: text });
    saveDose(dose);
    el.doseCard.classList.add('hidden');
  });

  el.doseSkipBtn.addEventListener('click', function () {
    var dose = loadDose();
    dose.skipWeek = weekStart();
    saveDose(dose);
    el.doseCard.classList.add('hidden');
  });

  function refreshStartScreen() {
    var resuming = checkForResume();
    if (!resuming) renderDoseCard(); else el.doseCard.classList.add('hidden');
  }

  el.resumeBtn.addEventListener('click', function () {
    var progress = el.resumeBanner._data;
    if (!progress) return;
    state.emotionIndex = progress.emotionIndex || 0;
    state.gameIndex = progress.gameIndex || 0;
    state.score = progress.score || 0;
    state.selfBefore = progress.selfBefore || [null, null];
    state.vocabWords = progress.vocabWords || {};
    state.gameBreakdown = progress.gameBreakdown || [];
    completedSteps = progress.completedSteps || 0;
    el.score.textContent = state.score;
    updateOverallProgress();
    if (progress.screen === 'game') {
      state.orderedGameTypes = buildGameOrder(prefs.profile);
      showScreen('game');
      setupGame(state.gameIndex);
    } else {
      showScreen('learning');
      showEmotion(state.emotionIndex);
    }
  });

  el.freshStartBtn.addEventListener('click', function () {
    clearProgress();
    el.resumeBanner.classList.add('hidden');
  });

  // ---------------------------------------------------------------
  // Preferências
  // ---------------------------------------------------------------
  function renderPrefsScreen() {
    el.prefReducedMotion.checked = prefs.reducedMotion;
    el.prefLargeText.checked = prefs.largeText;
    el.prefHighContrast.checked = prefs.highContrast;
    el.prefAudio.checked = prefs.audioEnabled;
    el.profileGeneral.setAttribute('aria-pressed', String(prefs.profile === 'general'));
    el.profileBodyFirst.setAttribute('aria-pressed', String(prefs.profile === 'body-first'));
  }

  el.prefsBtn.addEventListener('click', function () { renderPrefsScreen(); showScreen('prefs'); });
  el.prefsDoneBtn.addEventListener('click', function () { showScreen('start'); });

  el.prefReducedMotion.addEventListener('change', function () { prefs.reducedMotion = this.checked; savePrefs(); applyPrefs(); });
  el.prefLargeText.addEventListener('change', function () { prefs.largeText = this.checked; savePrefs(); applyPrefs(); });
  el.prefHighContrast.addEventListener('change', function () { prefs.highContrast = this.checked; savePrefs(); applyPrefs(); });
  el.prefAudio.addEventListener('change', function () { prefs.audioEnabled = this.checked; savePrefs(); if (state.screen === 'learning') showEmotion(state.emotionIndex); });

  el.profileGeneral.addEventListener('click', function () { prefs.profile = 'general'; savePrefs(); renderPrefsScreen(); });
  el.profileBodyFirst.addEventListener('click', function () { prefs.profile = 'body-first'; savePrefs(); renderPrefsScreen(); });

  // ---------------------------------------------------------------
  // Tela inicial → autoavaliação opcional
  // ---------------------------------------------------------------
  el.startBtn.addEventListener('click', function () {
    resetSession();
    clearProgress();
    renderCheck('before');
    showScreen('check');
  });

  function renderCheck(phase) {
    el.checkTitle.textContent = phase === 'before' ? 'Antes de começar (opcional)' : 'Agora que você terminou (opcional)';
    el.checkQuestions.innerHTML = '';
    checkQuestionsText.forEach(function (q, qi) {
      var row = document.createElement('div');
      row.className = 'scale-row';
      var label = document.createElement('div');
      label.className = 'scale-question';
      label.textContent = q;
      var opts = document.createElement('div');
      opts.className = 'scale-options';
      opts.setAttribute('role', 'radiogroup');
      opts.setAttribute('aria-label', q);
      scaleLabels.forEach(function (lbl, vi) {
        var b = document.createElement('button');
        b.type = 'button';
        b.className = 'scale-opt';
        b.textContent = lbl;
        b.setAttribute('role', 'radio');
        b.setAttribute('aria-pressed', 'false');
        b.addEventListener('click', function () {
          var target = phase === 'before' ? state.selfBefore : state.selfAfter;
          target[qi] = vi;
          Array.prototype.forEach.call(opts.querySelectorAll('.scale-opt'), function (o) { o.setAttribute('aria-pressed', 'false'); });
          b.setAttribute('aria-pressed', 'true');
        });
        opts.appendChild(b);
      });
      row.appendChild(label);
      row.appendChild(opts);
      el.checkQuestions.appendChild(row);
    });
    el.checkContinueBtn.dataset.phase = phase;
  }

  el.checkContinueBtn.addEventListener('click', proceedFromCheck);
  el.skipCheckBtn.addEventListener('click', proceedFromCheck);

  function renderConceptScreen() {
    el.conceptList.innerHTML = concepts.map(function (c) {
      return '<div class="concept-card"><div class="concept-icon" aria-hidden="true">' + c.icon + '</div><div><h3>' + c.title + '</h3><p>' + c.text + '</p></div></div>';
    }).join('');
  }

  el.conceptContinueBtn.addEventListener('click', function () {
    showScreen('learning');
    showEmotion(state.emotionIndex);
    completedSteps = 0;
    updateOverallProgress();
    saveProgress();
  });

  function proceedFromCheck() {
    var phase = el.checkContinueBtn.dataset.phase;
    if (phase === 'before') {
      renderConceptScreen();
      showScreen('concept');
    } else {
      showScreen('ifthen');
    }
  }

  // ---------------------------------------------------------------
  // Aprendizado
  // ---------------------------------------------------------------
  function stopSpeech() {
    if (speechSupported) window.speechSynthesis.cancel();
    currentUtterance = null;
  }

  function buildSpeechText(e) {
    return e.name + '. ' + e.definition + ' No corpo, em você, pode parecer: ' + e.physical.join(', ') + '. Nos outros, dá pra notar: ' + e.recognizeOthers.join(', ') + '. Dá vontade de: ' + e.actionTendency.join(', ');
  }

  function showEmotion(index) {
    stopSpeech();
    var e = emotions[index];
    el.learningProgress.style.width = (((index + 1) / emotions.length) * 100) + '%';
    el.prevEmotion.disabled = index === 0;
    el.nextEmotion.textContent = index < emotions.length - 1 ? 'Próximo →' : 'Ir para o jogo →';
    el.goToGame.classList.toggle('hidden', index < emotions.length - 1);

    var listenBtnHtml = (speechSupported && prefs.audioEnabled)
      ? '<button type="button" id="listen-btn" class="listen-btn" aria-pressed="false">🔊 Ouvir</button>' : '';

    var savedWord = state.vocabWords[e.name] || '';

    el.emotionContent.innerHTML =
      '<div class="emotion-layout">' +
        '<div class="emotion-badge accent-' + e.accent + '" aria-hidden="true">' + e.emoji + '</div>' +
        '<div class="emotion-info">' +
          '<div class="emotion-head">' +
            '<h3 class="emotion-name accent-text-' + e.accent + '">' + e.name + '</h3>' +
            listenBtnHtml +
          '</div>' +
          '<div class="emotion-block"><h4>O que é</h4><p>' + e.definition + '</p></div>' +
          '<div class="emotion-block"><h4>De onde vem</h4><p>' + e.origin + '</p></div>' +
          '<div class="scenario-box"><strong>Imagine que...</strong> ' + e.scenario + '</div>' +
          '<div class="emotion-grid-2">' +
            '<div class="emotion-block"><h4>No corpo, em você</h4><ul>' + e.physical.map(li).join('') + '</ul></div>' +
            '<div class="emotion-block"><h4>Como reconhecer nos outros</h4><ul>' + e.recognizeOthers.map(li).join('') + '</ul></div>' +
          '</div>' +
          '<div class="emotion-block"><h4>O que dá vontade de fazer</h4><ul>' + e.actionTendency.map(li).join('') + '</ul></div>' +
          '<div class="emotion-block"><h4>Pensamentos comuns</h4><ul>' + e.thoughts.map(li).join('') + '</ul></div>' +
          '<div class="emotion-grid-2">' +
            '<div class="emotion-block"><h4>Isso ajuda</h4><ul>' + e.healthy.map(li).join('') + '</ul></div>' +
            '<div class="emotion-block"><h4>Isso pode atrapalhar</h4><ul>' + e.unhealthy.map(li).join('') + '</ul></div>' +
          '</div>' +
          '<div class="apply-tip">🎯 <strong>Pra aplicar:</strong> ' + e.applyPrompt + '</div>' +
          '<button type="button" class="science-toggle" id="science-toggle" aria-expanded="false">Quer saber mais? (camada científica)</button>' +
          '<p class="science-note hidden" id="science-note"><strong>Curiosidade:</strong> ' + e.science + '</p>' +
          '<div class="vocab-row">' +
            '<label for="vocab-input">Qual palavra você usaria pra isso, no seu dia a dia? <span style="font-weight:400;color:var(--muted)">(opcional)</span></label>' +
            '<input type="text" id="vocab-input" placeholder="ex.: irritado, com raiva, puto..." value="' + savedWord.replace(/"/g, '&quot;') + '">' +
          '</div>' +
        '</div>' +
      '</div>';

    var scienceToggle = document.getElementById('science-toggle');
    var scienceNote = document.getElementById('science-note');
    scienceToggle.addEventListener('click', function () {
      var expanded = scienceToggle.getAttribute('aria-expanded') === 'true';
      scienceToggle.setAttribute('aria-expanded', String(!expanded));
      scienceNote.classList.toggle('hidden', expanded);
    });

    document.getElementById('vocab-input').addEventListener('change', function () {
      var v = this.value.trim();
      if (v) state.vocabWords[e.name] = v; else delete state.vocabWords[e.name];
      saveProgress();
    });

    var listenBtn = document.getElementById('listen-btn');
    if (listenBtn) {
      listenBtn.addEventListener('click', function () {
        if (window.speechSynthesis.speaking) {
          stopSpeech();
          listenBtn.setAttribute('aria-pressed', 'false');
          listenBtn.textContent = '🔊 Ouvir';
          return;
        }
        var utt = new SpeechSynthesisUtterance(buildSpeechText(e));
        utt.lang = 'pt-BR';
        utt.onend = function () { listenBtn.setAttribute('aria-pressed', 'false'); listenBtn.textContent = '🔊 Ouvir'; };
        currentUtterance = utt;
        listenBtn.setAttribute('aria-pressed', 'true');
        listenBtn.textContent = '⏸ Parar';
        window.speechSynthesis.speak(utt);
      });
    }
  }

  el.prevEmotion.addEventListener('click', function () {
    if (state.emotionIndex > 0) {
      state.emotionIndex--;
      showEmotion(state.emotionIndex);
      completedSteps = Math.max(0, completedSteps - 1);
      updateOverallProgress();
      saveProgress();
    }
  });

  el.nextEmotion.addEventListener('click', function () {
    if (state.emotionIndex < emotions.length - 1) {
      state.emotionIndex++;
      showEmotion(state.emotionIndex);
      completedSteps++;
      updateOverallProgress();
      saveProgress();
    } else {
      goToGame();
    }
  });

  el.goToGame.addEventListener('click', goToGame);

  function goToGame() {
    stopSpeech();
    completedSteps = emotions.length;
    updateOverallProgress();
    state.orderedGameTypes = buildGameOrder(prefs.profile);
    showScreen('game');
    setupGame(state.gameIndex);
  }

  // ---------------------------------------------------------------
  // Jogo de associação
  // ---------------------------------------------------------------
  function updateGameProgress() {
    el.gameProgress.style.width = (((state.gameIndex + 1) / state.orderedGameTypes.length) * 100) + '%';
    el.progressText.textContent = 'Desafio ' + (state.gameIndex + 1) + '/' + state.orderedGameTypes.length;
  }

  function setupGame(index) {
    var gt = state.orderedGameTypes[index];
    el.gameQuestion.textContent = gt.question;
    el.roundPurpose.textContent = 'Por que este desafio: ' + gt.purpose;
    el.nextGame.classList.add('hidden');
    el.finishGame.classList.add('hidden');
    el.hintBtn.disabled = false;
    updateGameProgress();

    state.matchedPairs = 0;
    state.matchedEmotions = [];
    state.gameBreakdown[index] = { label: gt.label, correct: 0, total: emotions.length, attempts: 0 };

    var left = shuffle(emotions);
    var right = shuffle(emotions);

    var col1 = document.createElement('div');
    col1.className = 'game-col';
    col1.setAttribute('role', 'group');
    col1.setAttribute('aria-label', 'Emoções');
    left.forEach(function (e) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'emotion-card';
      b.dataset.emotion = e.name;
      b.setAttribute('aria-pressed', 'false');
      b.innerHTML = '<span class="emoji-circle accent-' + e.accent + '" aria-hidden="true">' + e.emoji + '</span><span>' + e.name + '</span><span class="check-badge" aria-hidden="true">✓</span>';
      b.addEventListener('click', function () { handleEmotionClick(e.name, b); });
      col1.appendChild(b);
    });

    var col2 = document.createElement('div');
    col2.className = 'game-col';
    col2.setAttribute('role', 'group');
    col2.setAttribute('aria-label', 'Descrições');
    right.forEach(function (e) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'match-card';
      b.dataset.property = e.name;
      b.innerHTML = '<span>' + propToText(e[gt.property]) + '</span>';
      b.addEventListener('click', function () { handlePropertyClick(e.name, b); });
      col2.appendChild(b);
    });

    el.gameContent.innerHTML = '';
    el.gameContent.appendChild(col1);
    el.gameContent.appendChild(col2);
    state.selected = null;
    saveProgress();
  }

  function handleEmotionClick(name, cardEl) {
    if (state.matchedEmotions.indexOf(name) !== -1) return;
    Array.prototype.forEach.call(document.querySelectorAll('.emotion-card'), function (c) { c.setAttribute('aria-pressed', 'false'); });
    cardEl.setAttribute('aria-pressed', 'true');
    state.selected = name;
  }

  function handlePropertyClick(name, cardEl) {
    if (cardEl.classList.contains('correct')) return;
    if (!state.selected) { announceFeedback(false, 'Selecione uma emoção primeiro, na coluna da esquerda.'); return; }

    var breakdown = state.gameBreakdown[state.gameIndex];
    breakdown.attempts++;
    var reduced = reducedMotionActive();

    if (state.selected === name) {
      cardEl.classList.add('correct');
      if (!reduced) { cardEl.classList.add('pop'); setTimeout(function () { cardEl.classList.remove('pop'); }, 400); }
      cardEl.innerHTML += '<div class="back-name">' + name + '</div>';
      state.score += 10;
      el.score.textContent = state.score;
      state.matchedEmotions.push(name);
      breakdown.correct++;

      Array.prototype.forEach.call(document.querySelectorAll('.emotion-card'), function (c) {
        if (c.dataset.emotion === state.selected) c.classList.add('matched');
      });

      createConfetti();
      announceFeedback(true);
      state.matchedPairs++;
      saveProgress();

      if (state.matchedPairs === emotions.length) {
        setTimeout(function () {
          if (state.gameIndex < gameTypes.length - 1) { el.nextGame.classList.remove('hidden'); el.nextGame.focus(); }
          else { el.finishGame.classList.remove('hidden'); el.finishGame.focus(); }
        }, 600);
      }
    } else {
      cardEl.classList.add('incorrect');
      if (!reduced) cardEl.classList.add('shake');
      setTimeout(function () { cardEl.classList.remove('incorrect', 'shake'); }, 900);
      announceFeedback(false);
    }

    Array.prototype.forEach.call(document.querySelectorAll('.emotion-card'), function (c) { c.setAttribute('aria-pressed', 'false'); });
    state.selected = null;
  }

  el.hintBtn.addEventListener('click', function () {
    var remaining = emotions.filter(function (e) { return state.matchedEmotions.indexOf(e.name) === -1; });
    if (!remaining.length) return;
    var target = remaining[0];
    var card = document.querySelector('.emotion-card[data-emotion="' + cssEscape(target.name) + '"]');
    var match = document.querySelector('.match-card[data-property="' + cssEscape(target.name) + '"]');
    if (card) { card.scrollIntoView({ behavior: reducedMotionActive() ? 'auto' : 'smooth', block: 'center' }); card.style.outline = '3px solid var(--accent)'; }
    if (match) match.style.outline = '3px solid var(--accent)';
    announceFeedback(true, 'Dica: procure a descrição de "' + target.name + '" — ela está destacada.');
  });

  function cssEscape(s) { return s.replace(/"/g, '\\"'); }

  function announceFeedback(isCorrect, customMessage) {
    var messages = isCorrect ? feedbackMessages.correct : feedbackMessages.incorrect;
    var msg = customMessage || messages[Math.floor(Math.random() * messages.length)];
    el.feedbackContent.textContent = (isCorrect ? '🎉 ' : '🤔 ') + msg;
    el.feedback.classList.remove('hidden', 'correct-fb', 'incorrect-fb');
    el.feedback.classList.add(isCorrect ? 'correct-fb' : 'incorrect-fb');
    clearTimeout(announceFeedback._t);
    announceFeedback._t = setTimeout(function () { el.feedback.classList.add('hidden'); }, isCorrect ? 2200 : 2800);
  }

  document.getElementById('feedback-close').addEventListener('click', function () {
    clearTimeout(announceFeedback._t);
    el.feedback.classList.add('hidden');
  });

  function createConfetti() {
    if (reducedMotionActive()) return;
    var colors = ['#4F6D7A', '#C97B4A', '#B98A1D', '#3D7A4E', '#3B6EA5'];
    for (var i = 0; i < 22; i++) {
      var c = document.createElement('div');
      c.className = 'confetti';
      c.style.left = (Math.random() * 100) + '%';
      c.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      var size = (Math.random() * 8 + 5);
      c.style.width = size + 'px';
      c.style.height = size + 'px';
      c.style.animationDuration = (Math.random() * 1.5 + 1.8) + 's';
      el.confettiContainer.appendChild(c);
      (function (node) { setTimeout(function () { node.remove(); }, 4000); })(c);
    }
  }

  el.nextGame.addEventListener('click', function () {
    state.gameIndex++;
    completedSteps++;
    updateOverallProgress();
    setupGame(state.gameIndex);
  });

  el.finishGame.addEventListener('click', function () {
    completedSteps = totalSteps;
    updateOverallProgress();
    showScreen('ifthen');
    renderIfThen();
  });

  // ---------------------------------------------------------------
  // Pular etapa
  // ---------------------------------------------------------------
  el.skipBtn.addEventListener('click', function () {
    if (state.screen === 'concept') {
      showScreen('learning');
      showEmotion(state.emotionIndex);
      completedSteps = 0;
      updateOverallProgress();
      saveProgress();
    } else if (state.screen === 'game') {
      if (state.gameIndex < gameTypes.length - 1) {
        state.gameIndex++;
        completedSteps++;
        updateOverallProgress();
        setupGame(state.gameIndex);
      } else {
        completedSteps = totalSteps;
        updateOverallProgress();
        showScreen('ifthen');
        renderIfThen();
      }
    } else if (state.screen === 'learning') {
      if (state.emotionIndex < emotions.length - 1) {
        state.emotionIndex++;
        showEmotion(state.emotionIndex);
        completedSteps++;
        updateOverallProgress();
        saveProgress();
      } else {
        goToGame();
      }
    }
  });

  // ---------------------------------------------------------------
  // Plano "quando eu perceber ___" (implementation intention)
  // ---------------------------------------------------------------
  function renderIfThen() {
    var chips = emotions.map(function (e) { return e.trigger; }).concat(extraChips);
    el.ifthenChips.innerHTML = chips.map(function (c) {
      return '<button type="button" class="chip" data-trigger="' + c.replace(/"/g, '&quot;') + '">' + c + '</button>';
    }).join('');
    Array.prototype.forEach.call(el.ifthenChips.querySelectorAll('.chip'), function (chip) {
      chip.addEventListener('click', function () {
        el.ifthenInput.value = 'Quando eu perceber ' + chip.dataset.trigger + ', vou tentar nomear o que sinto.';
        el.ifthenInput.focus();
      });
    });
    el.ifthenInput.value = state.ifThenPlan || '';
  }

  el.ifthenContinueBtn.addEventListener('click', function () {
    state.ifThenPlan = el.ifthenInput.value.trim();
    finalizeResult();
  });
  el.ifthenSkipBtn.addEventListener('click', function () {
    state.ifThenPlan = '';
    finalizeResult();
  });

  // ---------------------------------------------------------------
  // Resultado + persistência local
  // ---------------------------------------------------------------
  function finalizeResult() {
    var vocabList = Object.keys(state.vocabWords).map(function (k) { return { emotion: k, word: state.vocabWords[k] }; });
    var session = {
      date: new Date().toISOString(),
      score: state.score,
      totalPossible: emotions.length * gameTypes.length * 10,
      selfBefore: state.selfBefore,
      selfAfter: state.selfAfter,
      breakdown: state.gameBreakdown.map(function (b) { return b; }),
      vocabWords: vocabList,
      ifThenPlan: state.ifThenPlan || null
    };
    saveSession(session);
    clearProgress();

    el.finalScore.textContent = state.score;
    var deltaHtml = '';
    if (state.selfBefore.every(function (v) { return v !== null; }) && state.selfAfter.every(function (v) { return v !== null; })) {
      var d1 = state.selfAfter[0] - state.selfBefore[0];
      var d2 = state.selfAfter[1] - state.selfBefore[1];
      deltaHtml = '<p class="science-note">Sua autopercepção mudou em ' + (d1 >= 0 ? '+' + d1 : d1) + ' ponto(s) na questão 1 e ' + (d2 >= 0 ? '+' + d2 : d2) + ' ponto(s) na questão 2, comparado ao início. Isso não é um diagnóstico — é só um retrato de como você se percebeu hoje.</p>';
    }
    el.resultDelta.innerHTML = deltaHtml;
    showScreen('result');
  }

  function resetSession() {
    stopSpeech();
    state.emotionIndex = 0;
    state.gameIndex = 0;
    state.score = 0;
    state.matchedPairs = 0;
    state.matchedEmotions = [];
    state.selfBefore = [null, null];
    state.selfAfter = [null, null];
    state.gameBreakdown = [];
    state.vocabWords = {};
    state.ifThenPlan = '';
    state.orderedGameTypes = gameTypes.slice();
    completedSteps = 0;
    el.score.textContent = 0;
    updateOverallProgress();
  }

  el.restartBtn.addEventListener('click', function () {
    resetSession();
    clearProgress();
    refreshStartScreen();
    showScreen('start');
  });

  // ---------------------------------------------------------------
  // Voltar / Início
  // ---------------------------------------------------------------
  el.backBtn.addEventListener('click', function () {
    switch (state.screen) {
      case 'prefs': showScreen('start'); break;
      case 'check': showScreen('start'); break;
      case 'concept': showScreen('start'); break;
      case 'learning': showScreen('concept'); break;
      case 'game': showScreen('learning'); break;
      case 'ifthen': showScreen('game'); break;
      case 'result': showScreen('ifthen'); break;
      case 'data': showScreen('start'); break;
    }
  });

  el.homeBtn.addEventListener('click', function () { stopSpeech(); refreshStartScreen(); showScreen('start'); });

  el.dataBtn.addEventListener('click', function () { renderDataScreen(); showScreen('data'); });
  document.getElementById('data-back-btn').addEventListener('click', function () { showScreen('start'); });

  // ---------------------------------------------------------------
  // Dados: armazenamento local + exportação
  // ---------------------------------------------------------------
  function loadSessions() {
    try {
      var raw = localStorage.getItem(SESSIONS_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) { return []; }
  }

  function saveSession(session) {
    var sessions = loadSessions();
    sessions.push(session);
    try { localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions)); } catch (e) { /* indisponível */ }
  }

  function renderDataScreen() {
    var sessions = loadSessions();
    if (!sessions.length) {
      el.sessionList.innerHTML = '<p class="empty-note">Nenhuma sessão registrada ainda. Jogue uma vez para começar a acompanhar seu progresso.</p>';
    } else {
      el.sessionList.innerHTML = sessions.map(function (s, i) {
        var d = new Date(s.date);
        return '<div class="session-row"><span>' + (i + 1) + '. ' + d.toLocaleDateString('pt-BR') + ' ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) + '</span><span>' + s.score + ' / ' + s.totalPossible + ' pontos</span></div>';
      }).join('');
    }

    var plans = sessions.filter(function (s) { return s.ifThenPlan; });
    if (!plans.length) {
      el.planList.innerHTML = '<p class="empty-note">Nenhum plano salvo ainda.</p>';
    } else {
      el.planList.innerHTML = plans.map(function (s) {
        var d = new Date(s.date);
        return '<div class="session-row" style="display:block"><strong>' + d.toLocaleDateString('pt-BR') + ':</strong> ' + s.ifThenPlan + '</div>';
      }).join('');
    }
  }

  el.exportJsonBtn.addEventListener('click', function () { exportJSON(loadSessions()); });
  el.exportHtmlBtn.addEventListener('click', function () { exportHTML(loadSessions()); });
  el.exportJsonResult.addEventListener('click', function () { exportJSON(loadSessions()); });
  el.exportHtmlResult.addEventListener('click', function () { exportHTML(loadSessions()); });
  el.exportRefResult.addEventListener('click', function () { exportQuickReference(); });

  el.clearDataBtn.addEventListener('click', function () {
    if (window.confirm('Isso vai apagar todo o histórico salvo neste dispositivo. Deseja continuar?')) {
      localStorage.removeItem(SESSIONS_KEY);
      renderDataScreen();
    }
  });

  function downloadFile(filename, content, mime) {
    var blob = new Blob([content], { type: mime });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url; a.download = filename;
    document.body.appendChild(a); a.click(); a.remove();
    URL.revokeObjectURL(url);
  }

  function exportJSON(sessions) {
    var payload = { app: 'Matiz', exportedAt: new Date().toISOString(), sessions: sessions };
    downloadFile('matiz-dados-' + Date.now() + '.json', JSON.stringify(payload, null, 2), 'application/json');
  }

  function exportHTML(sessions) {
    var rows = sessions.map(function (s, i) {
      var d = new Date(s.date);
      var breakdownRows = s.breakdown.map(function (b) { return '<li>' + b.label + ': ' + b.correct + '/' + b.total + '</li>'; }).join('');
      var vocabRows = (s.vocabWords || []).map(function (v) { return '<li>' + v.emotion + ' → "' + v.word + '"</li>'; }).join('');
      return '<div style="margin-bottom:24px;padding:16px;border:1px solid #E5E0D8;border-radius:12px;">' +
        '<strong>Sessão ' + (i + 1) + '</strong> — ' + d.toLocaleDateString('pt-BR') + ' às ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) +
        '<p>Pontuação: ' + s.score + ' / ' + s.totalPossible + '</p>' +
        (breakdownRows ? '<p><strong>Desempenho por desafio:</strong></p><ul>' + breakdownRows + '</ul>' : '') +
        (vocabRows ? '<p><strong>Palavras próprias:</strong></p><ul>' + vocabRows + '</ul>' : '') +
        (s.ifThenPlan ? '<p><strong>Plano:</strong> ' + s.ifThenPlan + '</p>' : '') +
        '</div>';
    }).join('');

    var html = '<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8">' +
      '<title>Relatório Matiz</title>' +
      '<style>body{font-family:sans-serif;max-width:720px;margin:40px auto;color:#33312E;padding:0 20px}h1{color:#38505B}</style>' +
      '</head><body>' +
      '<h1>Relatório pessoal — Matiz</h1>' +
      '<p>Exportado em ' + new Date().toLocaleString('pt-BR') + '.</p>' +
      '<p style="background:#DCE6E9;padding:12px 16px;border-radius:10px;"><strong>Nota:</strong> este relatório é um recurso psicoeducativo e não substitui avaliação ou acompanhamento profissional. Pode ser levado ou enviado para conversar com seu/sua psicólogo/a.</p>' +
      rows +
      '<p style="font-size:12px;color:#6B6863;margin-top:30px">© Psicoterapia e Afins · psicoterapiaeafins.com.br</p>' +
      '</body></html>';

    downloadFile('matiz-relatorio-' + Date.now() + '.html', html, 'text/html');
  }

  function exportQuickReference() {
    var cards = emotions.map(function (e) {
      return '<div style="border:1.5px solid #E5E0D8;border-radius:12px;padding:14px;margin-bottom:10px;display:flex;gap:12px;align-items:flex-start;break-inside:avoid;">' +
        '<div style="font-size:28px">' + e.emoji + '</div>' +
        '<div><strong>' + e.name + '</strong><br>' +
        '<span style="font-size:13px;color:#6B6863">Em você: ' + e.physical[0] + '</span><br>' +
        '<span style="font-size:13px;color:#6B6863">Nos outros: ' + e.recognizeOthers[0] + '</span><br>' +
        '<span style="font-size:13px;color:#6B6863">Dá vontade de: ' + e.actionTendency[0] + '</span></div>' +
        '</div>';
    }).join('');

    var html = '<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8">' +
      '<title>Cartão de referência rápida — Matiz</title>' +
      '<style>body{font-family:sans-serif;max-width:480px;margin:30px auto;color:#33312E;padding:0 16px}h1{font-size:20px;color:#38505B}@media print{body{margin:0}}</style>' +
      '</head><body>' +
      '<h1>Matiz — cartão de referência rápida</h1>' +
      '<p style="font-size:13px;color:#6B6863">Guarde ou imprima. Um lembrete rápido das 6 emoções básicas, suas pistas no corpo e pensamentos comuns.</p>' +
      cards +
      '<p style="font-size:11px;color:#A9A399;margin-top:16px">Recurso psicoeducativo · © Psicoterapia e Afins</p>' +
      '</body></html>';

    downloadFile('matiz-referencia-rapida-' + Date.now() + '.html', html, 'text/html');
  }

  // ---------------------------------------------------------------
  // Init
  // ---------------------------------------------------------------
  applyPrefs();
  updateNav();
  updateOverallProgress();
  refreshStartScreen();
});
