import { Literal } from './Literal';
import { Stack } from './Stack';

export class Option {
  i = 0;
  data: (Literal | Stack)[];

  constructor(data: (Literal | Stack)[]) {
    this.data = data;
  }

  *[Symbol.iterator]() {
    for (this.rewind(); this.valid() === true; this.next()) {
      yield this.current();
    }
  }

  clone() {
    return new Option(this.data.map((iterator) => iterator.clone()));
  }

  current() {
    return this.data[this.i].current();
  }

  next() {
    if (this.valid() === true) {
      this.data[this.i].next();

      while (this.valid() === true && this.data[this.i].valid() !== true) {
        ++this.i;
      }
    }
  }

  rewind() {
    this.i = 0;

    for (let value of this.data) {
      value.rewind();
    }
  }

  valid() {
    return this.i < this.data.length;
  }
}
