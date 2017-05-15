class SuperMemo {
  constructor() {
    this.difficulty = {
      EASY: 5,
      MEDIUM: 4,
      HARD: 3,
      WRONG_EASY: 2,
      WRONG_MEDIUM: 1,
      WRONG_HARD: 0
    };
  }

  calcEF(oldEF, q) {
    return (oldEF - 0.8 + 0.28*q - 0.02*q*q);
  }

  calcInterval(oldInterval, EF) {
    return Math.floor(oldInterval*EF);
  }

  daysToMillis(numDays) {
    return numDays * 24 * 60 * 60 * 1000;
  }

  calcNextReviewDate(interval) {
    const now = Date.now();
    const then = new Date(now + this.daysToMillis(interval));
    const dateNums = [then.getFullYear(), then.getMonth()+1, then.getDate()]
    return dateNums.join('-');
  }
}
