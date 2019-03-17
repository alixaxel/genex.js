import { Literal } from './Literal';
import { Option } from './Option';
import { Reference } from './Reference';

export class Stack {
  data: (Option | Reference | Literal | Stack)[];

  constructor(data: (Option | Reference | Literal | Stack)[]) {
    if (data.length === 0) {
      data = [new Literal([''])];
    }

    this.data = data;
  }

  *[Symbol.iterator]() {
    for (this.rewind(); this.valid() === true; this.next()) {
      yield this.current();
    }
  }

  clone() {
    return new Stack(this.data.map((iterator) => iterator.clone()));
  }

  current() {
    let result = '';

    for (let value of this.data) {
      result += value.current();
    }

    return result;
  }

  next() {
    if (this.valid() === true) {
      let i = this.data.length;

      while ((this.data[--i].next(), i > 0 && this.data[i].valid() !== true)) {
        this.data[i].rewind();
      }
    }
  }

  rewind() {
    for (let value of this.data) {
      value.rewind();
    }
  }

  valid() {
    return this.data.length > 0 && this.data[0].valid();
  }
}
