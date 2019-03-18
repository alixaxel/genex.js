export class Literal {
  i = 0;
  data: string[];

  constructor(data: string[]) {
    this.data = data;
  }

  clone(): Literal {
    return new Literal(this.data);
  }

  current() {
    return this.data[this.i] || '';
  }

  next() {
    ++this.i;
  }

  rewind() {
    this.i = 0;
  }

  valid(): boolean {
    return this.i < this.data.length;
  }
}
