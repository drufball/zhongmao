self.addEventListener('install', event => {
  const request = indexedDB.open('card_data', 4);
  request.onupgradeneeded = event => {
    console.log("Upgrading IDB schema...");
    const db = event.target.result;
    const store = db.createObjectStore('cards', {keyPath: 'front'});
    store.createIndex('next_review', 'next_review', {unique: false});
    store.transaction.oncomplete = load_sample_data;
  }
});

function load_sample_data(event) {
  const sample_data = [
    {
      'front':'中文',
      'hint':"It's what you're studying",
      'back':'Chinese',
      'next_review': '2017-02-19',
      'ef': 2.5,
      'interval': 1
    },
    {
      'front':'英文',
      'hint':"It's what you know",
      'back':'English',
      'next_review': '2017-02-19',
      'ef': 2.5,
      'interval': 1
    },
    {
      'front':'漂亮',
      'hint':"It's a trap",
      'back':'Beautiful',
      'next_review': '2017-02-19',
      'ef': 2.5,
      'interval': 1
    }
  ];
  const db = event.target.db;
  const store = db.transaction('cards', 'readwrite')
                .objectStore('cards');
  for( var i in sample_data ) {
    store.add(sample_data[i]);
  }
}

self.addEventListener('fetch', event => {
  if(event.request.url.indexOf('data/today') >= 0) {
    event.respondWith(
      loadCardsForDate('2017-02-19')
      .then(data => new Response(JSON.stringify(data)))
    );
  }
  else if(event.request.url.indexOf('data/update') >= 0) {
    let update;
    event.respondWith(
      event.request.text()
      .then(req => update = JSON.parse(req))
      .then(() => storeCard(update))
      .then(res => new Response(res))
    );
  }
});

function loadCard(front) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('card_data');
    request.onsuccess = event => {
      const db = event.target.result;
      const store = db.transaction('cards').objectStore('cards');
      store.get(front).onsuccess = res => resolve(res.target.result);
    }
  });
}

function loadCardsForDate(date) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('card_data');
    request.onsuccess = event => {
      const db = event.target.result;
      const store = db.transaction('cards').objectStore('cards');
      const today = IDBKeyRange.only(date);
      let reviews = [];
      store.index('next_review').openCursor(today).onsuccess = res => {
        let cursor = res.target.result;
        if(cursor) {
          reviews.push(cursor.value);
          cursor.continue();
        }
        else {
          resolve(reviews)
        }
      };
    }
  });
}

function storeCard(newData) {
  console.log(newData);
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('card_data');
    request.onsuccess = event => {
      const db = event.target.result;
      const store = db.transaction('cards', 'readwrite').objectStore('cards');
      const update = store.put(newData);
      update.onsuccess = res => resolve(res);
      update.onerror = err => console.log(error);
    }
  });
}

function updateCard(card, difficulty) {
  return new Promise((resolve, reject) => {
    const newEF = calcEF(card.ef, difficulty);
    const newInterval = calcInterval(card.interval, newEF);
    const newReviewDate = calcNextReviewDate(newInterval);
    const updatedFields = {
      'ef': newEF,
      'interval': newInterval,
      'next_review': newReviewDate
    };
    const updatedCard = Object.assign({}, card, updatedFields);
    resolve(updatedCard);
  });
}
const difficulty = {
  EASY: 5,
  MEDIUM: 4,
  HARD: 3,
  WRONG_EASY: 2,
  WRONG_MEDIUM: 1,
  WRONG_HARD: 0
};

function calcEF(oldEF, q) {
  return (oldEF - 0.8 + 0.28*q - 0.02*q*q);
}

function calcInterval(oldInterval, EF) {
  return Math.floor(oldInterval*EF);
}

function daysToMillis(numDays) {
  return numDays * 24 * 60 * 60 * 1000;
}

function calcNextReviewDate(interval) {
  const now = Date.now();
  const then = new Date(now + daysToMillis(interval));
  const dateNums = [then.getFullYear(), then.getMonth()+1, then.getDate()]
  return dateNums.join('-');
}
