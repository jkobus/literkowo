import { updateGaze, resetGaze } from './gaze.js';
import { habitatFor } from './habitats.js';
import { animals, illustration, normalizeAnimalKey } from './animals.js';

const $ = id => document.getElementById(id);
const synth = window.speechSynthesis;
let previewAnimal;
const draw = animal => illustration(animal, { scenery: $('scenery').checked });
let voice;
let utterance;
let speechTimer;
let speechVersion = 0;
const animalCount = count => `${count} ${count === 1 ? 'zwierzątko' : count % 10 >= 2 && count % 10 <= 4 && (count % 100 < 12 || count % 100 > 14) ? 'zwierzątka' : 'zwierzątek'}`;
const letters = [...new Set(animals.map(animal => animal.inputKey))];
for (const letter of letters) $('letter-filter').add(new Option(letter.toLocaleUpperCase('pl'), letter));

function stopSpeech() {
  speechVersion++;
  clearTimeout(speechTimer);
  if (utterance) synth?.cancel();
  utterance = null;
}
function updateVoices() {
  stopSpeech();
  const polish = (synth?.getVoices() || []).filter(item => /^pl(?:[-_]|$)/i.test(item.lang));
  voice = polish.find(item => item.localService) || polish[0];
  $('voice-status').textContent = voice
    ? `Lektor: ${voice.name}. ${voice.localService ? 'Głos lokalny.' : 'Może wymagać internetu.'} Tempo i głośność jak w grze.`
    : 'Brak polskiego głosu w tej przeglądarce. Odsłuch jest niedostępny.';
  for (const button of document.querySelectorAll('[data-listen]')) button.disabled = !voice;
}
function listen(animal) {
  stopSpeech();
  if (!voice || !synth) return;
  const version = speechVersion;
  utterance = new SpeechSynthesisUtterance(animal.name);
  Object.assign(utterance, { voice, lang: 'pl-PL', rate: .82, pitch: 1, volume: .55 });
  $('voice-status').textContent = `Odsłuch: ${animal.name} — ${voice.name}.`;
  const complete = failed => {
    if (version !== speechVersion) return;
    clearTimeout(speechTimer);
    utterance = null;
    $('voice-status').textContent = failed ? 'Nie udało się odtworzyć nazwy. Sprawdź dostępność głosu.' : `Odtworzono: ${animal.name}.`;
  };
  utterance.onend = () => complete(false);
  utterance.onerror = () => complete(true);
  speechTimer = setTimeout(() => { stopSpeech(); $('voice-status').textContent = 'Lektor nie odpowiada. Odsłuch zatrzymany.'; }, 7000);
  try { synth.speak(utterance); } catch { complete(true); }
}

const cards = animals.map(animal => {
  const card = document.createElement('article');
  card.className = 'animal-card';
  const group = animals.filter(item => item.inputKey === animal.inputKey);
  // All markup values originate in the game's local animal catalogue.
  card.innerHTML = `<button class="animal-preview" type="button" aria-label="Powiększ: ${animal.name}">${draw(animal)}</button><div class="card-details"><div class="card-heading"><h2>${animal.name}</h2><kbd>${animal.inputKey.toUpperCase()}</kbd></div><p>${animalCount(group.length)} pod klawiszem ${animal.inputKey.toUpperCase()} · ${habitatFor(animal).label.toLocaleLowerCase('pl')}</p><button data-listen type="button" aria-label="Posłuchaj: ${animal.name}">Posłuchaj nazwy</button></div>`;
  card.querySelector('.animal-preview').addEventListener('click', () => {
    previewAnimal = animal;
    $('preview-title').textContent = animal.name;
    $('preview-image').innerHTML = draw(animal);
    $('preview-key').textContent = group.length === 1
      ? `Klawisz ${animal.inputKey.toUpperCase()} · ${animal.name}`
      : `Klawisz ${animal.inputKey.toUpperCase()} · losowanie spośród ${group.length} zwierząt`;
    $('preview').showModal();
  });
  card.querySelector('[data-listen]').addEventListener('click', () => listen(animal));
  $('animal-grid').append(card);
  return { animal, card };
});
function filter() {
  const query = normalizeAnimalKey($('search').value.trim());
  const letter = $('letter-filter').value;
  let count = 0;
  for (const { animal, card } of cards) {
    card.hidden = !normalizeAnimalKey(animal.name).includes(query) || Boolean(letter && animal.inputKey !== letter);
    if (!card.hidden) count++;
  }
  $('count').textContent = `Widoczne: ${count} z ${animals.length} zwierząt · ${letters.length} przypisanych klawiszy.`;
  $('empty').hidden = count !== 0;
}
function redraw() {
  for (const {animal, card} of cards) card.querySelector('.animal-preview').innerHTML = draw(animal);
  if (previewAnimal) $('preview-image').innerHTML = draw(previewAnimal);
}
$('scenery').addEventListener('change', redraw);
$('search').addEventListener('input', filter);
$('letter-filter').addEventListener('change', filter);
$('background').addEventListener('change', () => document.documentElement.style.setProperty('--preview-bg', $('background').value));
$('grayscale').addEventListener('change', () => document.body.classList.toggle('grayscale', $('grayscale').checked));
$('reset').addEventListener('click', () => {
  $('search').value = ''; $('letter-filter').value = ''; $('background').value = '#c4ceb9'; $('grayscale').checked = false;
  $('scenery').checked = true; redraw();
  document.documentElement.style.removeProperty('--preview-bg'); document.body.classList.remove('grayscale'); filter();
});
$('close-preview').addEventListener('click', () => $('preview').close());
synth?.addEventListener('voiceschanged', updateVoices);
window.addEventListener('pagehide', stopSpeech);
document.addEventListener('visibilitychange', () => { if (document.hidden) stopSpeech(); });
filter(); updateVoices();

// Keep tracking the last viewed animal across gaps and the whole enlarged
// dialog. Fast movement outside the illustration must not reset its gaze.
let gazeSurface = null;
function clearGalleryGaze() {
  if (gazeSurface) resetGaze(gazeSurface);
  gazeSurface = null;
}
function followGalleryPointer(event) {
  if (event.pointerType !== 'mouse' && !event.isPrimary) return;
  const card = event.target.closest?.('.animal-card');
  const next = $('preview').open ? $('preview-image') : card?.querySelector('.animal-preview') || gazeSurface;
  if (!next || next.closest('.animal-card')?.hidden) { clearGalleryGaze(); return; }
  if (next !== gazeSurface) {
    clearGalleryGaze();
    gazeSurface = next;
  }
  updateGaze(gazeSurface, event);
}
for (const type of ['pointermove', 'pointerover']) window.addEventListener(type, followGalleryPointer, { capture: true, passive: true });
for (const type of ['pointerup', 'pointercancel']) window.addEventListener(type, event => {
  if (event.isPrimary && event.pointerType !== 'mouse') clearGalleryGaze();
}, { capture: true, passive: true });
window.addEventListener('blur', clearGalleryGaze);
$('preview').addEventListener('close', clearGalleryGaze);
