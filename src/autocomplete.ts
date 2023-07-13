import { Key } from 'node:readline';
import { Prompt } from '@clack/core';
import { TextOptions } from '@clack/prompts';
import { S_CHECKBOX_ACTIVE, S_CHECKBOX_SELECTED, S_CHECKBOX_INACTIVE, S_BAR, S_BAR_END, box } from './utils';
import color from 'picocolors';

export type Option = { value: any; label?: string; hint?: string };

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

interface AutocompleteTextOptions<T extends Option> extends TextOptions {
  options: T[];
  render: (this: Omit<AutocompleteText<T>, 'prompt'>) => string | void;
}

class AutocompleteText<T extends Option> extends Prompt {
  valueWithCursor = '';
  options: T[];

  get cursor() {
    return this._cursor;
  }

  filteredOptions: T[];
  selected: T[];

  constructor(opts: AutocompleteTextOptions<T>) {
    super(opts);

    this.options = opts.options;
    this.filteredOptions = opts.options;
    this.selected = [];

    this.customKeyPress = this.customKeyPress.bind(this);

    this.on('finalize', () => {
      if (!this.value) {
        this.value = opts.defaultValue;
      }
      this.valueWithCursor = this.value;
      this.value = this.selected;
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

      const prev = this.value[value.length - 2];
      const last = this.value[value.length - 1];

      if (last === ':') return;

      if (prev && last && prev === ':' && /\d+/.test(last)) {
        const num = Number(last);
        this.filteredOptions = this.options.filter((v, i) => i === num);
        return;
      }

      this.filteredOptions = this.options.filter((v) =>
        v[v.label ? 'label' : 'value']?.toLowerCase().startsWith(value.toLowerCase())
      );
    });

    this.input.on('keypress', this.customKeyPress);
  }

  private customKeyPress(char: string, key?: Key) {
    if (key?.name === 'e' && key?.ctrl) {
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

export const autocomplete = <T extends Option>(opts: Omit<AutocompleteTextOptions<T>, 'render'>) => {
  return new AutocompleteText({
    options: opts.options,
    message: opts.message,
    validate: opts.validate,
    placeholder: opts.placeholder,
    defaultValue: opts.defaultValue,
    initialValue: opts.initialValue,
    render() {
      const title = `${color.gray(S_BAR)}\n  ${opts.message}\n`;

      const selected = this.selected
        .map((option, i) => `${color.red(S_CHECKBOX_SELECTED)} ${color.red(option.label)}`)
        .join(' ');
      const placeholder = opts.placeholder
        ? color.inverse(opts.placeholder[0]) + color.dim(opts.placeholder.slice(1))
        : color.inverse(color.hidden('_'));
      const selectedView = box(selected, 'Selected');

      const value = typeof this.value === 'string' ? (!this.value ? placeholder : this.valueWithCursor) : '';

      const textView = box(value, 'Search');

      const noResults = color.red('No results');
      const filteredOptions = this.filteredOptions
        .map((option, i) => {
          const active = i === 0;
          return `${i}: ` + opt(option, active ? 'active' : 'inactive');
        })
        .join(`\n${color.cyan(S_BAR)}  `);

      const options = `${color.cyan(S_BAR)}  ${this.filteredOptions.length ? filteredOptions : noResults}\n${color.cyan(
        S_BAR_END
      )}\n`;

      return title + `${selectedView}\n` + textView + options;
    },
  }).prompt() as Promise<T[] | symbol>;
};
