/** @type {import('./$types').PageLoad} */
export function load({ params }) {
	return {
        token : params.slug
    }
}