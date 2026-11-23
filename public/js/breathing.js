const timerState = {
  status: 'idle',
  phases: [],
  phaseIndex: 0,
  phaseElapsed: 0,
  sessionElapsed: 0,
  completedCycles: 0,
  previousFrame: 0,
  frameId: null
};

const visual = document.querySelector('#breath-visual');
const phaseLabel = document.querySelector('#phase-label');
const phaseTime = document.querySelector('#phase-time');
const cycleCount = document.querySelector('#cycle-count');
const sessionTime = document.querySelector('#session-time');
const toggleButton = document.querySelector('#timer-toggle');
const resetButton = document.querySelector('#timer-reset');
const durationInputs = [...document.querySelectorAll('.duration-input')];
const cycleDuration = document.querySelector('#cycle-duration');

function readPhases() {
  const inhale = Math.max(1, Number(document.querySelector('#inhale-duration').value) || 4);
  const hold = Math.max(0, Number(document.querySelector('#hold-duration').value) || 0);
  const exhale = Math.max(1, Number(document.querySelector('#exhale-duration').value) || 4);
  return [
    { label: 'Inhale', duration: inhale * 1000 },
    ...(hold ? [{ label: 'Hold', duration: hold * 1000 }] : []),
    { label: 'Exhale', duration: exhale * 1000 }
  ];
}

function formatElapsed(milliseconds) {
  const seconds = Math.floor(milliseconds / 1000);
  return `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
}

function updateCycleSummary() {
  const total = readPhases().reduce((sum, phase) => sum + phase.duration, 0) / 1000;
  cycleDuration.textContent = `One cycle · ${total} seconds`;
}

function renderTimer() {
  const phase = timerState.phases[timerState.phaseIndex];
  const active = timerState.status !== 'idle' && phase;
  const progress = active ? Math.min(timerState.phaseElapsed / phase.duration, 1) : 0;

  if (timerState.status === 'idle') {
    phaseLabel.textContent = 'Ready';
    phaseTime.textContent = 'Press start';
    visual.style.setProperty('--breath-scale', '0.72');
  } else {
    phaseLabel.textContent = phase.label;
    phaseTime.textContent = timerState.status === 'paused'
      ? 'Paused'
      : `${Math.max(1, Math.ceil((phase.duration - timerState.phaseElapsed) / 1000))} sec`;

    let scale = 1;
    if (phase.label === 'Inhale') scale = 0.72 + (0.28 * progress);
    if (phase.label === 'Exhale') scale = 1 - (0.28 * progress);
    visual.style.setProperty('--breath-scale', scale.toFixed(3));
  }

  visual.style.setProperty('--progress', (progress * 100).toFixed(2));
  cycleCount.textContent = String(timerState.completedCycles);
  sessionTime.textContent = formatElapsed(timerState.sessionElapsed);
  toggleButton.textContent = timerState.status === 'running' ? 'Pause' : timerState.status === 'paused' ? 'Resume' : 'Start';
  durationInputs.forEach((input) => { input.disabled = timerState.status !== 'idle'; });
}

function advancePhase() {
  timerState.phaseIndex += 1;
  if (timerState.phaseIndex >= timerState.phases.length) {
    timerState.phaseIndex = 0;
    timerState.completedCycles += 1;
  }
}

function timerLoop(timestamp) {
  if (timerState.status !== 'running') return;

  const delta = Math.min(timestamp - timerState.previousFrame, 250);
  timerState.previousFrame = timestamp;
  timerState.phaseElapsed += delta;
  timerState.sessionElapsed += delta;

  let phase = timerState.phases[timerState.phaseIndex];
  while (timerState.phaseElapsed >= phase.duration) {
    timerState.phaseElapsed -= phase.duration;
    advancePhase();
    phase = timerState.phases[timerState.phaseIndex];
  }

  renderTimer();
  timerState.frameId = requestAnimationFrame(timerLoop);
}

function startOrPause() {
  if (timerState.status === 'running') {
    timerState.status = 'paused';
    cancelAnimationFrame(timerState.frameId);
    renderTimer();
    return;
  }

  if (timerState.status === 'idle') {
    timerState.phases = readPhases();
    timerState.phaseIndex = 0;
    timerState.phaseElapsed = 0;
  }

  timerState.status = 'running';
  timerState.previousFrame = performance.now();
  renderTimer();
  timerState.frameId = requestAnimationFrame(timerLoop);
}

function resetTimer() {
  cancelAnimationFrame(timerState.frameId);
  timerState.status = 'idle';
  timerState.phases = readPhases();
  timerState.phaseIndex = 0;
  timerState.phaseElapsed = 0;
  timerState.sessionElapsed = 0;
  timerState.completedCycles = 0;
  renderTimer();
}

toggleButton.addEventListener('click', startOrPause);
resetButton.addEventListener('click', resetTimer);
durationInputs.forEach((input) => input.addEventListener('input', updateCycleSummary));

document.addEventListener('keydown', (event) => {
  const interactive = ['INPUT', 'TEXTAREA', 'SELECT', 'BUTTON', 'A'].includes(document.activeElement.tagName);
  if (event.code === 'Space' && !interactive) {
    event.preventDefault();
    startOrPause();
  }
});

timerState.phases = readPhases();
updateCycleSummary();
renderTimer();
