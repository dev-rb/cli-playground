import { Key } from 'node:readline';
import { Prompt } from '@clack/core';
import { TextOptions } from '@clack/prompts';
import color from 'picocolors';

const availablePackages: { label: string; value: string }[] = [
  {
    label: 'Unocss',
    value: 'unocss',
  },
  {
    label: 'unoc222',
    value: 'unocss22',
  },
  {
    label: 'Tailwind',
    value: 'tailwind',
  },
  {
    label: 'Primitives',
    value: 'primitives',
  },
];

// Taken from https://github.com/natemoo-re/clack/blob/main/packages/prompts/src/index.ts#L642
const S_STEP_ACTIVE = '◆';
const S_STEP_CANCEL = '■';
const S_STEP_ERROR = '▲';
const S_STEP_SUBMIT = '◇';

const S_BAR_START = '┌';
const S_BAR = '│';
const S_BAR_END = '└';

const S_RADIO_ACTIVE = '●';
const S_RADIO_INACTIVE = '○';
const S_CHECKBOX_ACTIVE = '◻';
const S_CHECKBOX_SELECTED = '◼';
const S_CHECKBOX_INACTIVE = '◻';
const S_PASSWORD_MASK = '▪';

const S_BAR_H = '─';
const S_CORNER_TOP_RIGHT = '╮';
const S_CONNECT_LEFT = '├';
const S_CORNER_BOTTOM_RIGHT = '╯';

const S_INFO = '●';
const S_SUCCESS = '◆';
const S_WARN = '▲';
const S_ERROR = '■';

// Adapted from https://github.com/chalk/ansi-regex
// @see LICENSE
function ansiRegex() {
  const pattern = [
    '[\\u001B\\u009B][[\\]()#;?]*(?:(?:(?:(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]+)*|[a-zA-Z\\d]+(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]*)*)?\\u0007)',
    '(?:(?:\\d{1,4}(?:;\\d{0,4})*)?[\\dA-PR-TZcf-nq-uy=><~]))',
  ].join('|');

  return new RegExp(pattern, 'g');
}

const strip = (str: string) => str.replace(ansiRegex(), '');
const note = (message = '', title = '') => {
  const lines = `\n${message}\n`.split('\n');
  const len =
    Math.max(
      lines.reduce((sum, ln) => {
        ln = strip(ln);
        return ln.length > sum ? ln.length : sum;
      }, 0),
      strip(title).length
    ) + 2;
  const msg = lines
    .map((ln) => `${color.gray(S_BAR)}  ${color.dim(ln)}${' '.repeat(len - strip(ln).length)}${color.gray(S_BAR)}`)
    .join('\n');
  return `${color.gray(S_BAR)}\n${color.green(S_STEP_SUBMIT)}  ${color.reset(title)} ${color.gray(
    S_BAR_H.repeat(Math.max(len - title.length - 1, 1)) + S_CORNER_TOP_RIGHT
  )}\n${msg}\n${color.gray(S_CONNECT_LEFT + S_BAR_H.repeat(len + 2) + S_CORNER_BOTTOM_RIGHT)}\n`;
};
const opt = (
  option: any,
  state: 'inactive' | 'active' | 'selected' | 'active-selected' | 'submitted' | 'cancelled'
) => {
  const label = option.label ?? String(option.value);
  if (state === 'active') {
    return `${color.cyan(S_CHECKBOX_ACTIVE)} ${label} ${option.hint ? color.dim(`(${option.hint})`) : ''}`;
  } else if (state === 'selected') {
    return `${color.green(S_CHECKBOX_SELECTED)} ${color.dim(label)}`;
  } else if (state === 'cancelled') {
    return `${color.strikethrough(color.dim(label))}`;
  } else if (state === 'active-selected') {
    return `${color.green(S_CHECKBOX_SELECTED)} ${label} ${option.hint ? color.dim(`(${option.hint})`) : ''}`;
  } else if (state === 'submitted') {
    return `${color.dim(label)}`;
  }
  return `${color.dim(S_CHECKBOX_INACTIVE)} ${color.dim(label)}`;
};

export const add = async () => {
  const a = await new AutocompleteText({
    options: availablePackages,
    message: 'Test',
    render() {
      const title = `${color.gray(S_BAR)}\n  ${'Test'}\n`;

      const selected = this.selected
        .map((option, i) => `${color.red(S_CHECKBOX_SELECTED)} ${color.red(option.label)}`)
        .join(' ');

      const selectedView = note(selected, 'Selected');

      const value = this.value;
      const textView = `${title}${color.cyan(S_BAR)}  ${value}\n${color.cyan(S_BAR_END)}\n`;

      const options = `${color.cyan(S_BAR)}  ${this.filteredOptions
        .map((option, i) => {
          const selected = this.value.includes(option.value);
          const active = i === this.cursor;
          if (active && selected) {
            return opt(option, 'active-selected');
          }
          if (selected) {
            return opt(option, 'selected');
          }
          return opt(option, active ? 'active' : 'inactive');
        })
        .join(`\n${color.cyan(S_BAR)}  `)}\n${color.cyan(S_BAR_END)}\n`;
      return `${selectedView}\n` + textView + options;
    },
  }).prompt();
  console.log('After', a);
};

interface AutocompleteTextOptions extends TextOptions {
  options: any[];
  render: (this: Omit<AutocompleteText, 'prompt'>) => string | void;
}

class AutocompleteText extends Prompt {
  valueWithCursor = '';
  options: any[];
  get cursor() {
    return this._cursor;
  }

  filteredOptions: any[];
  selected: any[];
  constructor(opts: AutocompleteTextOptions) {
    super(opts);

    this.options = opts.options;
    this.filteredOptions = [];
    this.selected = [];

    this.customKeyPress = this.customKeyPress.bind(this);
    this.on('finalize', () => {
      if (!this.value) {
        this.value = opts.defaultValue;
      }
      this.valueWithCursor = this.value;
    });
    this.on('value', () => {
      const value = this.value;
      if (this.cursor >= value.length) {
        this.valueWithCursor = `${value}${color.inverse(color.hidden('_'))}`;
      } else {
        const s1 = value.slice(0, this.cursor);
        const s2 = value.slice(this.cursor);
        this.valueWithCursor = `${s1}${color.inverse(s2)}${s2.slice(1)}`;
      }

      this.filteredOptions = this.options.filter((v) => v.value.startsWith(value));
    });
    this.input.on('keypress', this.customKeyPress);
  }

  private customKeyPress(char: string, key?: Key) {
    if (key?.name === 'tab') {
      const firstOption = this.filteredOptions[0];
      const has = this.selected.includes(firstOption);
      if (has) {
        this.selected = this.selected.filter((v) => v !== firstOption);
      } else {
        this.selected =
          this.filteredOptions?.length === 0 ? this.selected : [...this.selected, this.filteredOptions[0]];
      }
    }
  }
}
