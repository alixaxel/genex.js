import { Literal } from './Literal';
import { Option } from './Option';
import { Reference } from './Reference';
import { Stack } from './Stack';

export function Repetition(data: Reference | Literal | Stack, min: number, max: number): Literal | Stack {
  if (max === 0) {
    return new Literal(['']);
  }

  let stack = [];

  for (let i = 0; i < min; ++i) {
    stack.push(data.clone());
  }

  if (max > min) {
    stack.push(new Option([new Literal([]), Repetition(data, 1, max - min)]));
  }

  return new Stack(stack);
}
