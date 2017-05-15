importScripts('review-page-bg.js');

class FetchWorklet {
  static get exposed() { return ['json']; }

  async json(url) {
    const response = await fetch(url);
    const json = await response.json();

    const DOMWorklet = await self.services.connect('DOM');
    DOMWorklet.initUI(json);
  }

}
self.services.register('fetch', FetchWorklet);
