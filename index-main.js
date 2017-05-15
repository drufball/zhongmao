// UI setup
const worklet = new Worklet();
window.addEventListener('load', init);
async function init() {
  worklet.register('DOM', DOM);
  await worklet.importScripts('index-bg.js');

  populateCards('/data/today');
  initSW();
}

async function populateCards(source) {
  const fetchWorklet = await worklet.connect('fetch');
  await fetchWorklet.json(source);
}

async function initSW() {
  if( 'serviceWorker' in navigator ) {
    const registration = await navigator.serviceWorker.register('/sw.js');
    console.log(registration);
  }
}

// Expose DOM methods to workers
class DOM {
  static get exposed() { return ['initUI'] }

  initUI(data) {
    const reviewPage = new ReviewPage(data);
    document.querySelector('body').appendChild(reviewPage);
  }
}
