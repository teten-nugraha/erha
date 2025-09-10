const daisyui = require('daisyui');
const typography = require('@tailwindcss/typography');

/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{html,svelte,js,ts}'],
	theme: {
		extend: {},
	},
	daisyui: {
		themes: ['bumblebee'],
	},
	plugins: [daisyui,typography],
}

