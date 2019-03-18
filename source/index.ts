import ret from 'ret';
import { difference } from './helpers/difference';
import { distinct } from './helpers/distinct';
import { intersection } from './helpers/intersection';
import { Literal } from './iterators/Literal';
import { Option } from './iterators/Option';
import { Reference } from './iterators/Reference';
import { Repetition } from './iterators/Repetition';
import { Stack } from './iterators/Stack';

class Genex {
  private tokens: ret.Root = null;
  private charset: number[];

  constructor(regex: string | RegExp, charset?: string) {
    if (regex instanceof RegExp) {
      regex = regex.source;
    }

    if (/[(][?]</.test(regex) === true) {
      throw new Error(`Unsupported lookbehind assertion.`);
    }

    if (charset == null) {
      charset = ' !"#$%&\'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~';
    }

    this.tokens = ret(regex);
    this.charset = charset.split('').map((value) => value.charCodeAt(0));
  }

  count() {
    let groups = 0;

    const counter = (tokens: ret.Tokens) => {
      let result = 0;

      if (tokens.type === ret.types.ROOT || tokens.type === ret.types.GROUP) {
        if (tokens.hasOwnProperty('options') !== true) {
          tokens.options = [tokens.stack];
        }

        tokens.options = distinct(
          tokens.options.map((stack) => {
            return stack.filter((value) => value.hasOwnProperty('notFollowedBy') !== true);
          })
        );

        for (let stack of tokens.options) {
          let value = 1;

          for (let node of stack) {
            value *= counter(node);
          }

          result += value;
        }

        if (tokens.type === ret.types.GROUP && tokens.remember === true) {
          ++groups;
        }
      } else if (tokens.type === ret.types.POSITION) {
        if (['B', '^', '$'].includes(tokens.value) === true) {
          result = 1;
        }
      } else if (tokens.type === ret.types.SET) {
        let set: number[] = [];

        for (let stack of tokens.set) {
          if (stack.type === ret.types.SET) {
            let data = [];

            for (let node of stack.set) {
              if (node.type === ret.types.RANGE) {
                for (let i = node.from; i <= node.to; ++i) {
                  data.push(i);
                }
              } else if (node.type === ret.types.CHAR) {
                data.push(node.value);
              }
            }

            set = set.concat(stack.not ? difference(this.charset, data) : intersection(this.charset, data));
          } else if (stack.type === ret.types.RANGE) {
            for (let i = stack.from; i <= stack.to; ++i) {
              set.push(i);
            }
          } else if (stack.type === ret.types.CHAR) {
            set.push(stack.value);
          }
        }

        result = (tokens.not === true ? difference(this.charset, set) : intersection(this.charset, set)).length;
      } else if (tokens.type === ret.types.REPETITION) {
        let count = counter(tokens.value);

        if (tokens.max === null) {
          return Infinity;
        }

        if (count === 1) {
          return tokens.max - tokens.min + 1;
        }

        result = (Math.pow(count, tokens.max + 1) - 1) / (count - 1);

        if (tokens.min > 0) {
          result -= (Math.pow(count, tokens.min + 0) - 1) / (count - 1);
        }
      } else if (tokens.type === ret.types.REFERENCE) {
        if (tokens.value > groups) {
          throw new Error(`Reference to non-existent capture group.`);
        }

        return 1;
      } else if (tokens.type === ret.types.CHAR) {
        return 1;
      }

      return isFinite(result) === true ? result : Infinity;
    };

    return counter(this.tokens);
  }

  generate(callback?: (value: string) => boolean | void) {
    let groups: Stack[] = [];

    const generator = (tokens: ret.Tokens): Option | Reference | Literal | Stack => {
      if (tokens.type === ret.types.ROOT || tokens.type === ret.types.GROUP) {
        if (tokens.hasOwnProperty('options') !== true) {
          tokens.options = [tokens.stack];
        }

        let result = distinct<ret.Token[]>(
          tokens.options.map((stack) => {
            return stack.filter((value) => value.hasOwnProperty('notFollowedBy') !== true);
          })
        ).map((stack) => new Stack(stack.map((node) => generator(node))));

        if (result.length > 1) {
          result = [new Option(result)];
        }

        if (tokens.type === ret.types.GROUP && tokens.remember === true) {
          groups.push(result[0]);
        }

        return result.shift();
      } else if (tokens.type === ret.types.POSITION) {
        if (['B', '^', '$'].includes(tokens.value) === true) {
          return new Literal(['']);
        }
      } else if (tokens.type === ret.types.SET) {
        let set: number[] = [];

        for (let stack of tokens.set) {
          if (stack.type === ret.types.SET) {
            let data = [];

            for (let node of stack.set) {
              if (node.type === ret.types.RANGE) {
                for (let i = node.from; i <= node.to; ++i) {
                  data.push(i);
                }
              } else if (node.type === ret.types.CHAR) {
                data.push(node.value);
              }
            }

            set = set.concat(stack.not ? difference(this.charset, data) : intersection(this.charset, data));
          } else if (stack.type === ret.types.RANGE) {
            for (let i = stack.from; i <= stack.to; ++i) {
              set.push(i);
            }
          } else if (stack.type === ret.types.CHAR) {
            set.push(stack.value);
          }
        }

        set = tokens.not === true ? difference(this.charset, set) : intersection(this.charset, set);

        if (set.length === 0) {
          set = [];
        }

        return new Literal(set.map((value) => String.fromCharCode(value)));
      } else if (tokens.type === ret.types.REPETITION) {
        return Repetition(generator(tokens.value), tokens.min, tokens.max);
      } else if (tokens.type === ret.types.REFERENCE) {
        if (groups.hasOwnProperty(tokens.value - 1) !== true) {
          throw new Error(`Reference to non-existent capture group.`);
        }

        return new Reference(groups[tokens.value - 1]);
      } else if (tokens.type === ret.types.CHAR) {
        return new Literal([String.fromCharCode(tokens.value)]);
      }

      return new Literal([]);
    };

    let values = generator(this.tokens) as Option | Stack;

    if (typeof callback === 'function') {
      for (let value of values) {
        if (callback(value) === false) {
          return null;
        }
      }

      return null;
    }

    let result = [];

    for (let value of values) {
      result.push(value);
    }

    return result;
  }
}

export = (regex: string | RegExp, charset?: string) => {
  return new Genex(regex, charset);
};

let f = new Genex(/(foo|bar|baz){1,2}|snafu/);

console.group(`${f.count()} Combinations:`);
console.groupEnd();
console.log(f.generate())
