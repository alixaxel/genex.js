import { Option } from './Option';
import { Stack } from './Stack';

export class Reference {
  i: number;
  data: Option | Stack;

  constructor(data: Option | Stack) {
    this.i = 0;
    this.data = data;
  }

  clone() {
    return new Reference(this.data);
  }

  current() {
    return this.data.current();
  }

  next() {
    ++this.i;
  }

  rewind() {
    this.i = 0;
  }

  valid() {
    return this.i == 0;
  }
}
