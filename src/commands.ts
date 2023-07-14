import { autocomplete } from './autocomplete';

const availablePackages: { label: string; value: string }[] = [
  {
    label: 'Unocss',
    value: 'unocss',
    group: 'packages',
  },
  {
    label: 'unoc222',
    value: 'unocss22',
    group: 'packages',
  },
  {
    label: 'Tailwind',
    value: 'tailwind',
    group: 'packages',
  },
  {
    label: 'Primitives',
    value: 'primitives',
    group: 'primitives',
  },
  {
    label: 'Primitives',
    value: 'primitives',
  },
  {
    label: 'Primitives',
    value: 'primitives',
  },
  {
    label: 'Primitives',
    value: 'primitives',
  },
  {
    label: 'Primitives',
    value: 'primitives',
  },
  {
    label: 'Primitives',
    value: 'primitives',
  },
  {
    label: 'sometailFox',
    value: 'sometail',
    group: 'primitives',
  },
  {
    label: 'Primitives',
    value: 'primitives',
  },
  {
    label: '10000 Primitives',
    value: '100 primitives',
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
