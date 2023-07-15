import { Option, autocomplete } from './autocomplete';

const availablePackages: Option[] = [
  {
    label: 'active-element',
    value: 'Inputs',
    group: 'primitives',
  },
  {
    label: 'audio',
    value: 'Display & Media',
    group: 'primitives',
  },
  {
    label: 'autofocus',
    value: 'Inputs',
    group: 'primitives',
  },
  {
    label: 'bounds',
    value: 'Display & Media',
    group: 'primitives',
  },
  {
    label: 'broadcast-channel',
    value: 'Browser APIs',
    group: 'primitives',
  },
  {
    label: 'clipboard',
    value: 'Browser APIs',
    group: 'primitives',
  },
  {
    label: 'connectivity',
    value: 'Network',
    group: 'primitives',
  },
  {
    label: 'context',
    value: 'Utilities',
    group: 'primitives',
  },
  {
    label: 'cursor',
    value: 'Utilities',
    group: 'primitives',
  },
  // {
  //   label: 'date',
  //   value: 'Utilities',
  //   group: 'primitives',
  // },
  // {
  //   label: 'destructure',
  //   value: 'Reactivity',
  //   group: 'primitives',
  // },
  // {
  //   label: 'devices',
  //   value: 'Display & Media',
  //   group: 'primitives',
  // },
  // {
  //   label: 'event-bus',
  //   value: 'Utilities',
  //   group: 'primitives',
  // },
  // {
  //   label: 'event-dispatcher',
  //   value: 'Utilities',
  //   group: 'primitives',
  // },
  // {
  //   label: 'event-listener',
  //   value: 'Browser APIs',
  //   group: 'primitives',
  // },
  // {
  //   label: 'event-props',
  //   value: 'Browser APIs',
  //   group: 'primitives',
  // },
  // {
  //   label: 'fetch',
  //   value: 'Network',
  //   group: 'primitives',
  // },
  // {
  //   label: 'fullscreen',
  //   value: 'Browser APIs',
  //   group: 'primitives',
  // },
  // {
  //   label: 'geolocation',
  //   value: 'Browser APIs',
  //   group: 'primitives',
  // },
  // {
  //   label: 'graphql',
  //   value: 'Network',
  //   group: 'primitives',
  // },
  // {
  //   label: 'i18n',
  //   value: 'Utilities',
  //   group: 'primitives',
  // },
  // {
  //   label: 'idle',
  //   value: 'Display & Media',
  //   group: 'primitives',
  // },
  // {
  //   label: 'input-mask',
  //   value: 'Inputs',
  //   group: 'primitives',
  // },
  // {
  //   label: 'intersection-observer',
  //   value: 'Display & Media',
  //   group: 'primitives',
  // },
  // {
  //   label: 'jsx-parser',
  //   value: 'Utilities',
  //   group: 'primitives',
  // },
  // {
  //   label: 'keyboard',
  //   value: 'Inputs',
  //   group: 'primitives',
  // },
  // {
  //   label: 'keyed',
  //   value: 'Control Flow',
  //   group: 'primitives',
  // },
  // {
  //   label: 'map',
  //   value: 'Utilities',
  //   group: 'primitives',
  // },
  // {
  //   label: 'media',
  //   value: 'Display & Media',
  //   group: 'primitives',
  // },
  // {
  //   label: 'memo',
  //   value: 'Reactivity',
  //   group: 'primitives',
  // },
  {
    label: 'Unocss',
    value: 'unocss',
    group: 'packages',
  },
  {
    label: 'Tailwind',
    value: 'tailwind',
    group: 'packages',
  },
  {
    label: 'Kobalte',
    value: 'kobalte',
    group: 'packages',
  },
  {
    label: 'solid-select',
    value: 'solid-select',
    group: 'packages',
  },
  {
    label: 'ark',
    value: 'ark',
    group: 'packages',
  },
];

export const add = async () => {
  const a = await autocomplete({
    options: availablePackages,
    message: 'Add Packages',
    placeholder: 'Type a package name',
  });

  console.log(a);
};
