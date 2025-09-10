import { writable } from 'svelte/store';
import { PUBLIC_API_URL } from '$env/static/public';

const survey = writable([{
    type: '',
    kode: '',
    question_id: '',
    answer_id: '',
    free_text: '',
    waiting_time: '',
}]);

const submitSurvey = async (survey:any,token:any) => {
    const apiUrl = `${PUBLIC_API_URL}/api/store/survey?t=${token}`
    const res = await fetch(apiUrl, {
        method: 'POST',
        body: JSON.stringify(survey)
    })
    if (!res.ok) throw new Error('Bad response')
    const data = await res.json()

    return data
}

export {survey, submitSurvey};