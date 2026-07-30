document.addEventListener('DOMContentLoaded', function () {
  'use strict';

  var PREFS_KEY = 'matiz_prefs_v1';
  var SESSIONS_KEY = 'matiz_v1';
  var PROGRESS_KEY = 'matiz_progress_v1';

  var osReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var speechSupported = 'speechSynthesis' in window;

  // ---------------------------------------------------------------
  // Conteúdo das emoções — linguagem simples e âncoras concretas de
  // corpo/pensamento. Cada emoção também carrega uma frase-gatilho
  // curta usada no plano "quando eu perceber ___".
  // ---------------------------------------------------------------
  var emotions = [
    {
      name: 'Alegria', emoji: '😊', accent: 'joy', trigger: 'uma sensação de leveza no corpo',
      definition: 'Uma sensação boa que aparece quando algo dá certo ou é agradável.',
      thoughts: ['"Isso é bom."', '"Quero repetir isso."', '"Quero contar pra alguém."'],
      physical: ['Mais energia no corpo', 'Sorriso que vem sem esforço', 'Sensação de leveza'],
      healthy: ['Aproveitar o momento', 'Agradecer', 'Compartilhar com alguém de confiança'],
      unhealthy: ['Buscar só prazer rápido o tempo todo', 'Depender da aprovação dos outros para se sentir bem'],
      fn: 'Nos motiva a repetir o que faz bem e fortalece nossos laços com as pessoas.',
      science: 'O cérebro libera dopamina e serotonina — substâncias ligadas a prazer e bem-estar.'
    },
    {
      name: 'Tristeza', emoji: '😢', accent: 'sad', trigger: 'um nó na garganta',
      definition: 'Aparece quando perdemos algo ou alguém, ou vivemos uma decepção.',
      thoughts: ['"Sinto falta disso."', '"Isso é difícil."', '"Preciso de um tempo."'],
      physical: ['Peito mais pesado', 'Menos energia', 'Vontade de chorar'],
      healthy: ['Permitir-se sentir', 'Pedir apoio', 'Dar tempo pra si mesmo'],
      unhealthy: ['Esconder o que sente', 'Se isolar completamente', 'Ficar remoendo sem buscar ajuda'],
      fn: 'Ajuda a processar perdas e avisa às pessoas ao redor que precisamos de cuidado.',
      science: 'Áreas do cérebro ligadas ao processamento emocional (como a amígdala) ficam mais ativas.'
    },
    {
      name: 'Raiva', emoji: '😠', accent: 'anger', trigger: 'o coração acelerado e músculos tensos',
      definition: 'Surge quando algo parece injusto, quando somos frustrados ou nos sentimos ameaçados.',
      thoughts: ['"Isso é injusto."', '"Não vou aceitar isso."', '"Preciso me defender."'],
      physical: ['Coração acelera', 'Músculos tensos', 'Sensação de calor'],
      healthy: ['Reconhecer o que sente', 'Falar de forma direta e respeitosa', 'Colocar limites'],
      unhealthy: ['Explodir sem pensar', 'Agredir com palavras ou ações', 'Engolir tudo por dentro'],
      fn: 'Ajuda a enfrentar obstáculos e proteger o que é importante pra gente.',
      science: 'O corpo entra em alerta e libera adrenalina, preparando uma reação rápida.'
    },
    {
      name: 'Medo', emoji: '😨', accent: 'fear', trigger: 'o coração disparado e a respiração rápida',
      definition: 'Aparece quando algo parece uma ameaça à nossa segurança, física ou emocional.',
      thoughts: ['"Isso é perigoso."', '"Algo ruim pode acontecer."', '"Preciso me proteger."'],
      physical: ['Coração dispara', 'Pupilas dilatam', 'Respiração rápida'],
      healthy: ['Avaliar o perigo com calma', 'Se proteger quando necessário', 'Encarar aos poucos o que assusta'],
      unhealthy: ['Evitar tudo que dá medo', 'Entrar em pânico', 'Viver preocupado com coisas pouco prováveis'],
      fn: 'Nos protege de perigos reais, preparando o corpo para agir rápido.',
      science: 'A amígdala detecta ameaças e aciona uma resposta antes mesmo de "pensarmos" conscientemente.'
    },
    {
      name: 'Nojo', emoji: '🤢', accent: 'disgust', trigger: 'vontade de me afastar de algo ou alguém',
      definition: 'Uma reação de rejeição a algo que parece contaminado, nocivo ou que fere nossos valores.',
      thoughts: ['"Isso é repulsivo."', '"Preciso me afastar."', '"Isso pode me fazer mal."'],
      physical: ['Enjoo', 'Nariz franzido', 'Vontade de se afastar'],
      healthy: ['Reconhecer o incômodo', 'Se afastar quando faz sentido', 'Questionar reações exageradas'],
      unhealthy: ['Rejeitar pessoas ou situações sem refletir', 'Julgar com base só numa reação forte'],
      fn: 'Nos protege de coisas que podem nos fazer mal, como comida estragada ou situações arriscadas.',
      science: 'Ativa a ínsula, área do cérebro ligada a sabores desagradáveis e sensações de repulsa.'
    },
    {
      name: 'Surpresa', emoji: '😲', accent: 'surprise', trigger: 'uma reação rápida a algo inesperado',
      definition: 'Uma reação rápida a algo inesperado, que interrompe o que estávamos pensando ou fazendo.',
      thoughts: ['"Não esperava por isso!"', '"O que está acontecendo?"', '"Preciso entender rápido."'],
      physical: ['Sobrancelhas sobem', 'Olhos arregalam', 'Respiração muda de repente'],
      healthy: ['Ficar aberto ao novo', 'Se adaptar com calma à mudança'],
      unhealthy: ['Travar diante do inesperado', 'Reagir de forma exagerada a pequenas mudanças'],
      fn: 'Ajuda a redirecionar rápido nossa atenção para o que é novo, preparando uma resposta.',
      science: 'Ativa por um instante o sistema de alerta do cérebro, pausando o que estava em andamento.'
    }
  ];

  var extraChips = ['não souber nomear o que sinto'];

  var gameTypes = [
    { question: 'Combine cada emoção com sua definição', property: 'definition', label: 'Definições', purpose: 'Praticar o conceito geral de cada emoção.' },
    { question: 'Combine cada emoção com os pensamentos comuns', property: 'thoughts', label: 'Pensamentos', purpose: 'Reconhecer os pensamentos que costumam acompanhar cada emoção.' },
    { question: 'Combine cada emoção com as sensações no corpo', property: 'physical', label: 'Sensações físicas', purpose: 'Treinar a ligação entre sensação no corpo e nome da emoção — a base da granularidade emocional.' },
    { question: 'Combine cada emoção com formas saudáveis de lidar', property: 'healthy', label: 'Formas saudáveis', purpose: 'Lembrar de respostas que ajudam quando essa emoção aparecer.' },
    { question: 'Combine cada emoção com sua função', property: 'fn', label: 'Função', purpose: 'Entender por que essa emoção existe e para que serve.' },
    { question: 'Combine cada emoção com sua base no cérebro', property: 'science', label: 'Curiosidade científica', purpose: 'Uma camada extra, se você tiver curiosidade sobre o cérebro.' }
  ];

  var feedbackMessages = {
    correct: ['Isso mesmo! 🎉', 'Muito bem! ✨', 'Combinação certa! 👏', 'Você está indo bem! 🌟'],
    incorrect: ['Não foi essa. Tente de novo. 💪', 'Quase lá — olhe com calma. 🔍', 'Sem problema, tente outra vez. 🌱']
  };

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
        audioEnabled: p.audioEnabled !== false
      };
    } catch (e) {
      return { reducedMotion: false, largeText: false, highContrast: false, audioEnabled: true };
    }
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
    ifThenPlan: ''
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

    goCheckBtn: document.getElementById('go-check-btn'),
    skipCheckBtn: document.getElementById('skip-check-btn'),
    checkContinueBtn: document.getElementById('check-continue-btn'),
    checkTitle: document.getElementById('check-title'),
    checkQuestions: document.getElementById('check-questions'),

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
    el.skipBtn.classList.toggle('hidden', !(state.screen === 'learning' || state.screen === 'game'));
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
    } else {
      el.resumeBanner.classList.add('hidden');
    }
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
  }

  el.prefsBtn.addEventListener('click', function () { renderPrefsScreen(); showScreen('prefs'); });
  el.prefsDoneBtn.addEventListener('click', function () { showScreen('start'); });

  el.prefReducedMotion.addEventListener('change', function () { prefs.reducedMotion = this.checked; savePrefs(); applyPrefs(); });
  el.prefLargeText.addEventListener('change', function () { prefs.largeText = this.checked; savePrefs(); applyPrefs(); });
  el.prefHighContrast.addEventListener('change', function () { prefs.highContrast = this.checked; savePrefs(); applyPrefs(); });
  el.prefAudio.addEventListener('change', function () { prefs.audioEnabled = this.checked; savePrefs(); if (state.screen === 'learning') showEmotion(state.emotionIndex); });

  // ---------------------------------------------------------------
  // Tela inicial → autoavaliação opcional
  // ---------------------------------------------------------------
  el.startBtn.addEventListener('click', function () {
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

  function proceedFromCheck() {
    var phase = el.checkContinueBtn.dataset.phase;
    if (phase === 'before') {
      showScreen('learning');
      showEmotion(state.emotionIndex);
      completedSteps = 0;
      updateOverallProgress();
      saveProgress();
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
    return e.name + '. ' + e.definition + ' No corpo, pode parecer: ' + e.physical.join(', ') + '. Pensamentos comuns: ' + e.thoughts.join(' ');
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
          '<div class="emotion-block"><h4>Pensamentos comuns</h4><ul>' + e.thoughts.map(li).join('') + '</ul></div>' +
          '<div class="emotion-block"><h4>No corpo, pode parecer</h4><ul>' + e.physical.map(li).join('') + '</ul></div>' +
          '<div class="emotion-grid-2">' +
            '<div class="emotion-block"><h4>Isso ajuda</h4><ul>' + e.healthy.map(li).join('') + '</ul></div>' +
            '<div class="emotion-block"><h4>Isso pode atrapalhar</h4><ul>' + e.unhealthy.map(li).join('') + '</ul></div>' +
          '</div>' +
          '<div class="emotion-block"><h4>Pra que serve</h4><p>' + e.fn + '</p></div>' +
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
    showScreen('game');
    setupGame(state.gameIndex);
  }

  // ---------------------------------------------------------------
  // Jogo de associação
  // ---------------------------------------------------------------
  function updateGameProgress() {
    el.gameProgress.style.width = (((state.gameIndex + 1) / gameTypes.length) * 100) + '%';
    el.progressText.textContent = 'Desafio ' + (state.gameIndex + 1) + '/' + gameTypes.length;
  }

  function setupGame(index) {
    var gt = gameTypes[index];
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
    if (state.screen === 'game') {
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

  el.restartBtn.addEventListener('click', function () {
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
    completedSteps = 0;
    el.score.textContent = 0;
    updateOverallProgress();
    clearProgress();
    checkForResume();
    showScreen('start');
  });

  // ---------------------------------------------------------------
  // Voltar / Início
  // ---------------------------------------------------------------
  el.backBtn.addEventListener('click', function () {
    switch (state.screen) {
      case 'prefs': showScreen('start'); break;
      case 'check': showScreen('start'); break;
      case 'learning': showScreen('start'); break;
      case 'game': showScreen('learning'); break;
      case 'ifthen': showScreen('game'); break;
      case 'result': showScreen('ifthen'); break;
      case 'data': showScreen('start'); break;
    }
  });

  el.homeBtn.addEventListener('click', function () { stopSpeech(); checkForResume(); showScreen('start'); });

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
        '<span style="font-size:13px;color:#6B6863">No corpo: ' + e.physical[0] + '</span><br>' +
        '<span style="font-size:13px;color:#6B6863">Pode pensar: ' + e.thoughts[0] + '</span></div>' +
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
  checkForResume();
});
