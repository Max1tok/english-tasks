
const q  = sel => document.querySelector(sel);
const qa = sel => [...document.querySelectorAll(sel)];

const animals = [
  { key:"cat",      en:"Cat",      ru:"Кот" },
  { key:"dog",      en:"Dog",      ru:"Собака" },
  { key:"lion",     en:"Lion",     ru:"Лев" },
  { key:"tiger",    en:"Tiger",    ru:"Тигр" },
  { key:"bear",     en:"Bear",     ru:"Медведь" },
  { key:"elephant", en:"Elephant", ru:"Слон" },
  { key:"giraffe",  en:"Giraffe",  ru:"Жираф" },
  { key:"zebra",    en:"Zebra",    ru:"Зебра" },
  { key:"monkey",   en:"Monkey",   ru:"Обезьяна" },
  { key:"panda",    en:"Panda",    ru:"Панда" },
  { key:"fox",      en:"Fox",      ru:"Лиса" },
  { key:"wolf",     en:"Wolf",     ru:"Волк" },
  { key:"rabbit",   en:"Rabbit",   ru:"Кролик" },
  { key:"horse",    en:"Horse",    ru:"Лошадь" },
  { key:"cow",      en:"Cow",      ru:"Корова" },
  { key:"pig",      en:"Pig",      ru:"Свинья" },
  { key:"sheep",    en:"Sheep",    ru:"Овца" },
  { key:"deer",     en:"Deer",     ru:"Олень" },
  { key:"koala",    en:"Koala",    ru:"Коала" },
  { key:"penguin",  en:"Penguin",  ru:"Пингвин" },
];

const board = q("#board");
const overlay = q("#overlay");
const hud = q("#hud");
const scoreP1 = q("#score-p1");
const scoreP2 = q("#score-p2");
const turnIndicator = q("#turn-indicator");
const tplCard = q("#card-template");

const STATE = {
  deck: [],
  first: null,
  lock: false,
  turn: 1,
  scores: {1:0, 2:0},
  matchedPairs: 0
};

function shuffle(arr){
  for(let i=arr.length-1;i>0;i--){
    const j = Math.floor(Math.random()*(i+1));
    [arr[i],arr[j]]=[arr[j],arr[i]];
  }
  return arr;
}

function buildDeck(){
  const doubled = animals.flatMap(a => [{...a, id:a.key+"-A"}, {...a, id:a.key+"-B"}]);
  return shuffle(doubled);
}

function updateHud(){
  scoreP1.textContent = STATE.scores[1];
  scoreP2.textContent = STATE.scores[2];
  turnIndicator.textContent = `Turn: Player ${STATE.turn}`;
  document.body.classList.toggle("turn-p1", STATE.turn===1);
  document.body.classList.toggle("turn-p2", STATE.turn===2);
}

function createCard(cardData){
  const node = tplCard.content.firstElementChild.cloneNode(true);
  node.dataset.key = cardData.key;
  node.dataset.id  = cardData.id;
  node.querySelector("img").src = `img/${cardData.key}.png`;
  node.querySelector("img").alt = `${cardData.en}`;
  node.querySelector(".caption").textContent = `${cardData.en} (${cardData.ru})`;
  node.addEventListener("click", ()=>onCardClick(node));
  return node;
}

function onCardClick(card){
  if(STATE.lock) return;
  if(card.classList.contains("flipped")) return;

  card.classList.add("flipped");
  card.setAttribute("aria-pressed","true");

  if(!STATE.first){
    STATE.first = card;
    return;
  }

  const first = STATE.first;
  STATE.first = null;
  const isMatch = first.dataset.key === card.dataset.key;
  STATE.lock = true;

  if(isMatch){
    setTimeout(()=>{
      first.classList.add("vanish");
      card.classList.add("vanish");

      setTimeout(()=>{
        first.classList.remove("vanish");
        card.classList.remove("vanish");
        first.classList.add("matched");
        card.classList.add("matched");

        STATE.scores[STATE.turn] += 1;
        STATE.matchedPairs += 1;
        updateHud();
        STATE.lock = false;

        if(STATE.matchedPairs === animals.length){
          setTimeout(()=>{
            alert(`Игра окончена!\nКоличество открытых пар первого игрока: ${STATE.scores[1]}\nКоличество открытых пар второго игрока: ${STATE.scores[2]}`);
            startNewGame();
          }, 200);
        }
      }, 1000);
    }, 2000);
  } else {
    setTimeout(()=>{
      first.classList.remove("flipped");
      card.classList.remove("flipped");
      first.setAttribute("aria-pressed","false");
      card.setAttribute("aria-pressed","false");
      STATE.turn = (STATE.turn===1)?2:1;
      updateHud();
      STATE.lock = false;
    }, 650);
  }
}

function renderBoard(){
  board.innerHTML = "";
  board.classList.remove("hidden");
  hud.classList.remove("hidden");
  STATE.deck.forEach(data=>{
    const card = createCard(data);
    board.appendChild(card);
  });
  updateHud();
}

function startNewGame(){
  STATE.deck = buildDeck();
  STATE.first = null;
  STATE.lock = false;
  STATE.turn = 1;
  STATE.scores = {1:0, 2:0};
  STATE.matchedPairs = 0;
  renderBoard();
}

q("#btn-play").addEventListener("click", ()=>{
  overlay.classList.add("fade-out");
  setTimeout(()=>{
    overlay.classList.add("hidden");
    startNewGame();
  }, 420);
});


const helpBtn = q("#btn-help");
if (helpBtn) {
  helpBtn.addEventListener("click", ()=>{
    q("#modal").classList.remove("hidden");
  });
}
const closeModal = q("#close-modal");
if (closeModal) {
  closeModal.addEventListener("click", ()=>{
    q("#modal").classList.add("hidden");
  });
}

q("#btn-settings").addEventListener("click", ()=>{
  alert("Coming soon 🙂");
});


const tasksUI = {
  submenu: q("#submenu-tasks"),
  btnTasks: q("#btn-tasks"),
  btnMake: q("#btn-make"),
  btnComplete: q("#btn-complete"),

  builder: q("#tasks-builder"),
  builderRows: q("#builder-rows"),
  encodeBox: q("#encode-output"),
  copyBtn: q("#btn-copy-encode"),

  runner: q("#tasks-runner"),
  decodeBar: q(".decode-bar"),
  decodeBox: q("#decode-input"),
  startRun: q("#btn-start-run"),
  runnerRows: q("#runner-rows"),
  answersPool: q("#answers-pool"),

  checkBar: q("#check-bar"),
  btnCheck: q("#btn-check"),
  score: q("#score"),
};

const TASKS_STATE = {
  data: Array.from({length:10}, ()=>({pre:"", answer:"", post:""})),
  selectedAnswer: null,
  solution: [],
};

function showSubmenu(){
  q("#btn-play").classList.add("hidden");
  q("#btn-tasks").classList.add("hidden");
  q("#btn-settings").classList.add("hidden");
  tasksUI.submenu.classList.remove("hidden");
}
function hideOverlay(){
  overlay.classList.add("fade-out");
  setTimeout(()=>overlay.classList.add("hidden"), 420);
}
tasksUI.btnTasks.addEventListener("click", showSubmenu);



function buildBuilder(){
  tasksUI.builderRows.innerHTML = "";
  TASKS_STATE.data.forEach((row, i)=>{
    const el = document.createElement("div");
    el.className = "task-row";
    el.innerHTML = `
      <span class="segment pre" contenteditable="true" data-i="${i}" data-k="pre"></span>
      <span class="segment answer" contenteditable="true" data-i="${i}" data-k="answer"></span>
      <span class="segment post" contenteditable="true" data-i="${i}" data-k="post"></span>
    `;
    tasksUI.builderRows.appendChild(el);
  });

  tasksUI.builder.classList.remove("hidden");
  hideOverlay();
  encodeTasks();
}

function captureBuilderChanges(e){
  const t = e.target;
  if(!t.classList.contains("segment")) return;
  const i = +t.dataset.i;
  const k = t.dataset.k;
  TASKS_STATE.data[i][k] = t.textContent;

  const row = t.closest(".task-row");
  const needGrow = row.scrollWidth > row.clientWidth;
  row.classList.toggle("grow", needGrow);

  encodeTasks();
}

function encodeTasks(){
  try{
    const json = JSON.stringify(TASKS_STATE.data);
    const b64 = btoa(unescape(encodeURIComponent(json)));
    tasksUI.encodeBox.textContent = b64;
  }catch(err){
    tasksUI.encodeBox.textContent = "ERROR";
  }
}

tasksUI.btnMake.addEventListener("click", ()=>{
  tasksUI.submenu.classList.add("hidden");
  buildBuilder();
});
tasksUI.builder.addEventListener("input", captureBuilderChanges);
tasksUI.copyBtn.addEventListener("click", async ()=>{
  const txt = tasksUI.encodeBox.textContent.trim();
  if(!txt) return;
  try{
    await navigator.clipboard.writeText(txt);
    tasksUI.copyBtn.textContent = "Скопировано!";
    setTimeout(()=>tasksUI.copyBtn.textContent="Копировать", 1200);
  }catch(e){ alert("Не удалось скопировать"); }
});


function showRunner(){
  tasksUI.submenu.classList.add("hidden");
  tasksUI.runner.classList.remove("hidden");
  hideOverlay();
}
tasksUI.btnComplete.addEventListener("click", showRunner);

tasksUI.startRun.addEventListener("click", ()=>{
  const raw = tasksUI.decodeBox.textContent.trim();
  if(!raw) return;

  let arr;
  try{
    const json = decodeURIComponent(escape(atob(raw)));
    arr = JSON.parse(json);
  }catch(e){
    alert("Неверный код");
    return;
  }


  tasksUI.decodeBar.classList.add("hidden");


  TASKS_STATE.solution = arr.map(x=>x.answer || "");


  tasksUI.runnerRows.innerHTML = "";
  arr.forEach((row, i)=>{
    const el = document.createElement("div");
    el.className = "task-row fit";
    el.dataset.i = i;
    el.innerHTML = `
      <span class="segment pre" contenteditable="false">${row.pre||""}</span>
      <span class="segment answer" contenteditable="false" data-empty="true"></span>
      <span class="segment post" contenteditable="false">${row.post||""}</span>
    `;
    tasksUI.runnerRows.appendChild(el);
  });


  tasksUI.answersPool.innerHTML = "";
  const shuffled = shuffle([...TASKS_STATE.solution]);
  shuffled.forEach((ans, idx)=>{
    const chip = document.createElement("button");
    chip.type="button";
    chip.className = "answer-chip";
    chip.textContent = ans || `Ответ ${idx+1}`;
    chip.style.order = Math.floor(Math.random()*1000);
    chip.addEventListener("click", ()=>{
      qa(".answer-chip").forEach(c=>c.classList.remove("selected"));
      chip.classList.add("selected");
      TASKS_STATE.selectedAnswer = chip;
    });
    tasksUI.answersPool.appendChild(chip);
  });


  tasksUI.runnerRows.hidden = false;
  tasksUI.answersPool.hidden = false;


  tasksUI.checkBar.classList.add("hidden");
  tasksUI.score.classList.add("hidden");
  tasksUI.score.textContent = "";
});


tasksUI.runnerRows.addEventListener("click", (e)=>{
  const row = e.target.closest(".task-row");
  if(!row) return;
  if(!TASKS_STATE.selectedAnswer) return;

  const target = row.querySelector(".segment.answer");
  if(!target) return;

  target.textContent = TASKS_STATE.selectedAnswer.textContent;
  target.dataset.empty = "false";
  TASKS_STATE.selectedAnswer.disabled = true;
  TASKS_STATE.selectedAnswer.classList.remove("selected");
  TASKS_STATE.selectedAnswer.style.opacity = ".5";
  TASKS_STATE.selectedAnswer = null;

  const allPlaced = qa("#runner-rows .segment.answer").every(el=>{
    return el.dataset.empty==="false" || el.textContent.trim()!=="";
  });
  if(allPlaced){
    tasksUI.checkBar.classList.remove("hidden");
  }
});

tasksUI.btnCheck.addEventListener("click", ()=>{
  let ok = 0;
  qa("#runner-rows .task-row").forEach((row, i)=>{
    const ans = row.querySelector(".segment.answer").textContent.trim();
    const correct = (TASKS_STATE.solution[i]||"").trim();
    if(ans && ans === correct){
      row.classList.remove("fail"); row.classList.add("ok");
      ok++;
    }else{
      row.classList.remove("ok"); row.classList.add("fail");
    }
  });
  tasksUI.btnCheck.classList.add("hidden");
  tasksUI.score.classList.remove("hidden");
  tasksUI.score.textContent = `${ok} / 10`;
});
