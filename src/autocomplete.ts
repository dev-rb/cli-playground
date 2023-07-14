import { Key } from 'node:readline';
import { Prompt } from '@clack/core';
import { TextOptions } from '@clack/prompts';
import { S_CHECKBOX_ACTIVE, S_CHECKBOX_SELECTED, S_CHECKBOX_INACTIVE, S_BAR, S_BAR_END, box } from './utils';
import color from 'picocolors';

export type Option = { value: any; label?: string; hint?: string; group?: string };

const buildRegex = (str: string) => {
  let s = '';

  for (let i = 0; i < str.length; i++) {
    s += str[i] + '.*';
  }

  s = '.*' + s;

  return RegExp(s);
};

const search = <T extends Option>(values: T[], lookFor: string) => {
  const group = lookFor.match(/(\w+)\/(\w+)?/);

  if (group) {
    const groupData = values.filter((option) => option.group && option.group.includes(group[1]));

    const sp = group[2];

    if (!sp) return groupData;

    const r = buildRegex(sp);
    return groupData.filter((v) => r.test((v.label ?? v.value).toLowerCase()));
  }

  const r = buildRegex(lookFor);

  return !lookFor.length
    ? values
    : values.filter((v) => (v.group && r.test(v.group)) || r.test((v.label ?? v.value).toLowerCase()));
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
      const value = this.value as string;
      if (this.cursor >= value.length) {
        this.valueWithCursor = `${value}${color.inverse(color.hidden('_'))}`;
      } else {
        const s1 = value.slice(0, this.cursor);
        const s2 = value.slice(this.cursor);
        this.valueWithCursor = `${s1}${color.inverse(s2)}${s2.slice(1)}`;
      }

      const last = value[value.length - 1];
      if (last === ':') return;

      const indexSelector = value.match(/:(\d+)/);

      if (indexSelector?.length && indexSelector[1]) {
        const index = Number(indexSelector[1]);
        this.filteredOptions = this.options.filter((_, i) => i === index);
        return;
      }

      this.filteredOptions = search(this.options, value.toLowerCase());
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
      const [nongroups, groups] = this.filteredOptions.reduce(
        (acc, c) => {
          if (c.group) acc[1].push(c);
          else acc[0].push(c);
          return acc;
        },
        [[], []] as [T[], T[]]
      );

      let index = 0;
      const solo = nongroups
        .map((option) => {
          const active = index === 0;
          const selected = this.selected.find((v) => v.value === option.value) !== undefined;
          return (
            `${index++}: ` +
            opt(option, selected ? (active ? 'active-selected' : 'selected') : active ? 'active' : 'inactive')
          );
        })
        .join(`\n${color.cyan(S_BAR)}  `);

      let uniqueGroups = new Set();
      const group = groups
        .map((option) => {
          const active = index === 0;
          const selected = this.selected.find((v) => v.value === option.value) !== undefined;

          const has = uniqueGroups.has(option.group);
          uniqueGroups.add(option.group);

          return (
            (has ? '' : `\n${option.group}\n`) +
            `${index++}: ` +
            opt(option, selected ? (active ? 'active-selected' : 'selected') : active ? 'active' : 'inactive')
          );
        })
        .join(`\n${color.cyan(S_BAR)}  `);
      const options = `${color.cyan(S_BAR)}  ${this.filteredOptions.length ? solo + group : noResults}\n${color.cyan(
        S_BAR_END
      )}\n`;

      return title + `${selectedView}\n` + textView + options;
    },
  }).prompt() as Promise<T[] | symbol>;
};
