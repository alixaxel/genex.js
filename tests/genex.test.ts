import genex from '../source';

describe('genex', () => {
  let charset = ' *+,-./0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz';
  let patterns = [
    // =========================================================================
    // Character Classes
    // =========================================================================
    { in: /./, out: null },
    { in: /\D/, out: null },
    { in: /\d/, out: null },
    { in: /\S/, out: null },
    { in: /\s/, out: null },
    { in: /\W/, out: null },
    { in: /\w/, out: null },

    // =========================================================================
    // Character Sets
    // =========================================================================
    { in: /[^0-9]/, out: null },
    { in: /[^abc]/, out: null },
    { in: /[0-9]/, out: null },
    { in: /[abc]/, out: null },

    // =========================================================================
    // Alternation
    // =========================================================================
    { in: /a|b|c/, out: null },

    // =========================================================================
    // Boundaries
    // =========================================================================
    { in: /\B/, out: [''] },
    { in: /\b/, out: [] },
    { in: /^/, out: [''] },
    { in: /$/, out: [''] },

    // =========================================================================
    // Grouping & References
    // =========================================================================
    { in: /(?:)\1/, out: `Reference to non-existent capture group.` },
    { in: /()\1/, out: [''] },
    { in: /(abc)(\1)\2/, out: ['abcabcabc'] },
    { in: /(abc)/, out: ['abc'] },
    { in: /(abc)\1/, out: ['abcabc'] },
    { in: /\1/, out: `Reference to non-existent capture group.` },

    // =========================================================================
    // Greedy Quantifiers
    // =========================================================================
    { in: /a?/, out: ['', 'a'] },
    { in: /a?b?c?/, out: ['', 'c', 'b', 'bc', 'a', 'ac', 'ab', 'abc'] },
    { in: /a{1,3}/, out: ['a', 'aa', 'aaa'] },
    { in: /a{3,}/, out: Infinity },
    { in: /a{3}/, out: ['aaa'] },
    { in: /a*/, out: Infinity },
    { in: /a+/, out: Infinity },
    { in: /ab?/, out: ['a', 'ab'] },
    { in: /ab?c?/, out: ['a', 'ac', 'ab', 'abc'] },

    // =========================================================================
    // Non-Greedy Quantifiers
    // =========================================================================
    { in: /a{3,}?/, out: Infinity },
    { in: /a*?/, out: Infinity },
    { in: /a+?/, out: Infinity },
    // { in: /a??/, out: ['', 'a'] },
    // { in: /a{1,3}?/, out: ['a', 'aa', 'aaa'] },
    // { in: /a{3}?/, out: ['', 'aaa'] },

    // =========================================================================
    // Assertions (Lookahead)
    // =========================================================================
    { in: /x(?!y)/, out: ['x'] },
    { in: /x(?!y|z)/, out: ['x'] },
    { in: /x(?=y)/, out: ['xy'] },
    { in: /x(?=y|z)/, out: ['xy', 'xz'] },

    // =========================================================================
    // Assertions (Lookbehind)
    // =========================================================================
    { in: /(?<!y)x/, out: `Unsupported lookbehind assertion.` },
    { in: /(?<=y)x/, out: `Unsupported lookbehind assertion.` },

    // =========================================================================
    // Combinations
    // =========================================================================
    { in: /(?:[0-9a-f]{2}){3}/, out: 16777216 },
    { in: /([ab])\1/, out: ['aa', 'bb'] },
    { in: /([ab])\1\1/, out: ['aaa', 'bbb'] },
    { in: /([ab]{1,2})\1/, out: ['aa', 'aaaa', 'abab', 'bb', 'baba', 'bbbb'] },
    { in: /(|)/, out: [''] },
    { in: /(||)/, out: [''] },
    { in: /(|a)/, out: ['', 'a'] },
    { in: /(a?)\1/, out: ['', 'aa'] },
    // { in: /(a)?\1/, out: ['', 'aa'] },
    { in: /(a|a|a)/, out: ['a'] },
    { in: /[]/, out: [] },
    { in: /[^\D\d]/, out: [] },
    { in: /[^\S\s]/, out: [] },
    { in: /[^\W\w]/, out: [] },
    { in: /[^AZ]BC/, out: 68 },
    { in: /[0-9a-f]{2}/, out: 256 },
    { in: /[0-9a-f]/, out: null },
    { in: /[01]?[01]?/, out: ['', '0', '1', '0', '00', '01', '1', '10', '11'] },
    { in: /[a]{0,1}?/, out: ['', '', 'a'] },
    { in: /[a]{0,1}/, out: ['', 'a'] },
    { in: /[a]{0}/, out: [''] },
    { in: /[ab]{0,2}?/, out: ['', '', 'a', 'aa', 'ab', 'b', 'ba', 'bb'] },
    { in: /[ab]{0}/, out: [''] },
    { in: /[ab]{1,2}/, out: ['a', 'aa', 'ab', 'b', 'ba', 'bb'] },
    { in: /^$/, out: [''] },
    { in: /|/, out: [''] },
    { in: /|\b/, out: [''] },
    { in: /||/, out: [''] },
    { in: /a|(b|c)?/, out: ['a', '', 'b', 'c'] },
    { in: /a|(b|c)/, out: ['a', 'b', 'c'] },
    { in: /a|a|a/, out: ['a'] },
  ];

  for (let pattern of patterns) {
    if (pattern.out == null) {
      pattern.out = charset.split('').filter((value) => pattern.in.test(value));
    }

    describe(`${pattern.in}`, () => {
      if (typeof pattern.out === 'string') {
        describe(`count()`, () => {
          it(`should throw ${pattern.out}`, () => {
            expect(() => genex(pattern.in, charset).count()).toThrow();
          });
        });

        describe(`generate()`, () => {
          it(`should throw ${pattern.out}`, () => {
            expect(() => genex(pattern.in, charset).generate()).toThrow();
          });
        });
      } else {
        let instance = genex(pattern.in, charset);

        describe(`count()`, () => {
          let count = typeof pattern.out === 'number' ? pattern.out : pattern.out.length;

          it(`should total ${count}`, () => {
            expect(instance.count()).toEqual(count);
          });
        });

        if (Array.isArray(pattern.out) === true) {
          let values = instance.generate();

          describe(`generate()`, () => {
            it(`should generate ${pattern.out}`, () => {
              expect(values).toEqual(pattern.out);
            });

            if (values.toString() !== '') {
              for (let value of values) {
                it(`'${value}' should match ${pattern.in}`, () => {
                  expect(pattern.in.test(value)).toBeTruthy();
                });
              }
            }
          });
        }
      }
    });
  }
});
