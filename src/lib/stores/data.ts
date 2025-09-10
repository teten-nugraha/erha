import { writable } from 'svelte/store';
import { locale, waitLocale } from 'svelte-i18n'
import { PUBLIC_API_URL } from '$env/static/public'

const getDataResponden = async (token:string) => {
    const apiUrl = `${PUBLIC_API_URL}/api/token?t=${token}`
    const res = await fetch(apiUrl)
    if (!res.ok) throw new Error('Bad response')
    const data = await res.json()

    // Set default language
    // let lang = data.data.survey.bahasa
    let lang = 'id'
    locale.set(lang)
    localStorage.setItem('lang',lang)
    await waitLocale()

    return data
}

const getDataQuestion = async (jenis_id:any) => {
    const lang = localStorage.getItem('lang')
    const token = localStorage.getItem('token')
    const apiUrl = `${PUBLIC_API_URL}/api/question?token=${token}&jenis_survey=${jenis_id}&lang=${lang}`
    const res = await fetch(apiUrl)
    if (!res.ok) throw new Error('Bad response')
    const data = await res.json()

    if(data.status == 'finished'){
        return data
    }else{
        return {
            tipe: data.data.tipe,
            questions : data.data.question
        }
    }
}

const responden = writable({
    'survey' : {
        "bahasa": "",
        "outlet": "",
        "jenis" : "",
        "jenis_id" : "",
        "jenis_slug": "",
        "doctor" : "",
        "nurse" : "",
        "therapist" : "",
        "client_care" : "",
    },
    'responden' : {
        "id": 0,
        "nama": "",
        "phone_number": "",
        "email": "",
    },
});

export {getDataResponden,getDataQuestion,responden}