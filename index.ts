import * as p from '@clack/prompts';

p.intro('Welcome to the CLI');

p.multiselect({
  message: 'Package',
  options: [
    { label: 'Unocss', value: 'unocss' },
    { label: 'Tailwind', value: 'tailwind' },
  ],
});
