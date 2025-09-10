/** @type {import('./$types').PageLoad} */
export function load({ params }) {
    let slug = params.slug
    let sl = slug.split('-')
	
    return {
        respondenID : sl[0],
        outletID : sl[1],
        outletKODE : sl[2],
    }
}