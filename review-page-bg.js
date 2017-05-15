importScripts('super-memo.js');

class ReviewPageWorklet {
  static get exposed() { return ['updateCard']; }

  async updateCard(card, difficulty) {
    const sm = new SuperMemo();

    const newEF = sm.calcEF(card.ef, difficulty);
    const newInterval = sm.calcInterval(card.interval, newEF);
    const newReviewDate = sm.calcNextReviewDate(newInterval);

    const updatedFields = {
      'ef': newEF,
      'interval': newInterval,
      'next_review': newReviewDate
    };
    const updatedCard = Object.assign({}, card, updatedFields);

    const options = {
      method: 'POST',
      body: JSON.stringify(updatedCard)
    };
    const response = await fetch('/data/update', options);
    // TODO: handle errors
  }
}
self.services.register('review-page', ReviewPageWorklet);
