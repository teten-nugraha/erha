import { init, register } from 'svelte-i18n'

const defaultLocale = 'id'

register('en', () => import('./locales/en.json'))
register('id', () => import('./locales/id.json'))

init({
	fallbackLocale: defaultLocale,
    initialLocale: defaultLocale
	// initialLocale: browser ? window.navigator.language : defaultLocale,
})