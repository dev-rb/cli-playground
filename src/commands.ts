import { autocomplete } from './autocomplete';

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

export const add = async () => {
  const a = await autocomplete({
    options: availablePackages,
    message: 'Add Packages',
    placeholder: 'Type a package name',
  });

  console.log(a);
};
