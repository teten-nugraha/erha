<script>
// @ts-nocheck
    import { browser } from '$app/environment';
    import { _ } from 'svelte-i18n'
    import { onMount } from 'svelte';
    import { getDataQuestion } from '$lib/stores/data';
    import {survey,submitSurvey} from './store';
    import Loading from './loading.svelte';
    import Status from './status.svelte';
    import logoUltimate from '$lib/assets/logo-ultimate.png';
    import logoDermies from '$lib/assets/logo-dermies-max.png';

    export let data;

    let submitLoading = false;
    let resSubmit = {
        'status' : false,
        'jenis' : '',
        'message' : '',
    }
    let promise;
    let dataQuestion = [{
        id: '',
        kode: '',
        type: '',
        question: '',
        is_mandatory: true,
        answers: [{
            id : "",
            text: ""
        }],
    }]

    let logo ='';
    let tipe = ''

    // Cure Rate
    let cureRateAnswer = '';
    let cureRateFreeTextStatus = false
    let cureRateFreeTextAnswer = '';
    let cureRateFreeTextAnswerSub = '';

    // Waiting Time
    let waitingTimeInput = '';

    let freeTextAnswer = '';
    let singleChoiceAnswer = '';
    let selectedAnswer = '';
    let nextButton = false;
    let question = {
        total : 0,
        number: 0,
    }
    let showQuestion = [{
        id: '',
        kode: '',
        kategori: '',
        type: '',
        question: '',
        scale_low: '',
        scale_high: '',
        question: '',
        input_waktu: '',
        wording_input_waktu: '',
        answers: [{
            id : "",
            text: "",
            order: 0
        }],
    }];
    $: dataQuestion;

    $: if(tipe == 'ULTIMATE') {
        logo = logoUltimate
    }else{
        logo = logoDermies
    }

    onMount(async () => {
        promise = getDataQuestion(data.jenis_survey_id);
        const resDataQuestion = await promise;
        if(typeof resDataQuestion.status != 'undefined'){
            submitLoading = true
            resSubmit = resDataQuestion
        }else{
            dataQuestion = resDataQuestion.questions;
            tipe = resDataQuestion.tipe
            question.total = dataQuestion.length
        }

        // Back to Top
        document.body.scrollIntoView();

        // First Question
        getQuestion(0)
    })

    const getQuestion = (i) => {
        const dt = dataQuestion[i]
        showQuestion = {
            id : dt.id,
            is_mandatory : dt.is_mandatory,
            kode : dt.kode,
            kategori : dt.kategori,
            input_waktu : dt.input_waktu,
            wording_input_waktu : dt.wording_input_waktu,
            type : dt.type,
            text : dt.question,
            scale_high : dt.scale_high,
            scale_low : dt.scale_low,
            answers : dt.answers,
        }

        // is_mandatory

    }

    const nextQuestion = () => {
        // Back to Top
        document.body.scrollIntoView();

        // Store Survey
        storeSurvey()

        // Next Question
        question.number+=1
        getQuestion(question.number)
        getHistoryAnswer()
    }

    const backQuestion = () => {
        // Back to Top
        document.body.scrollIntoView();

        question.number-=1
        getQuestion(question.number)
        getHistoryAnswer()
    }

    const getHistoryAnswer = () => {
        freeTextAnswer = $survey[showQuestion.id]?.free_text ?? ''
        singleChoiceAnswer = $survey[showQuestion.id]?.answer_id ?? ''
        selectedAnswer = $survey[showQuestion.id]?.answer_id ?? ''
    }

    // Set Survey
    const storeSurvey= (submit = false) => {  
        // Cure Rate - lainnya
        if(showQuestion.kategori == 'Cure Rate' && selectedAnswer == 131) {
            $survey[showQuestion.id] = ({
                type: showQuestion.type,
                kode: showQuestion.kode,
                question_id: showQuestion.id,
                answer_id: singleChoiceAnswer,
                free_text: cureRateFreeTextAnswer,
                free_text_sub : cureRateFreeTextAnswerSub,
                waiting_time : waitingTimeInput
            })
        }else{
            $survey[showQuestion.id] = ({
                type: showQuestion.type,
                kode: showQuestion.kode,
                question_id: showQuestion.id,
                answer_id: singleChoiceAnswer,
                free_text: freeTextAnswer,
                free_text_sub : cureRateFreeTextAnswerSub,
                waiting_time : waitingTimeInput
            })
        }

        if(!submit){
            // reset
            freeTextAnswer = ''
            singleChoiceAnswer= ''
            selectedAnswer= ''
            waitingTimeInput = ''
        }
    }

    // Submit 
    const btnSubmit = async () => {
        submitLoading = true
        // Store Survey
        storeSurvey(true)

        // Submit
        const token = localStorage.getItem('token')
        resSubmit = await submitSurvey($survey,token)
    }

    $: if (singleChoiceAnswer != '' || freeTextAnswer != '') {

        /**
         * 115, 116, 117
        */
        const checksub = [115, 116, 117];

        // Q29 freetext
        if(selectedAnswer == 131){
            nextButton = false
            cureRateFreeTextStatus = true

            cureRateFreeTextAnswerSub = ''

            checksub.forEach(element => {
                let el1 = document.getElementById(`freetextsub-${element}`);
                el1.style.display = 'none';
            });

            // min 5 char
            if(cureRateFreeTextAnswer === ""){
                nextButton = false
            }else if(cureRateFreeTextAnswer.trim() === "" && cureRateFreeTextAnswer.substring(0, 3) === "   "){
                cureRateFreeTextAnswer = ""
                nextButton = false
            }else if(cureRateFreeTextAnswer.length < 5 && cureRateFreeTextAnswer != ""){
                nextButton = false
            }else{
                nextButton = true
            }
        }else{
            cureRateFreeTextAnswer = ''
            /**
             * 115, 116, 117
            */
            const checksub = [115, 116, 117];
            if( checksub.includes(singleChoiceAnswer)){
                checksub.forEach(element => {
                    let el1 = document.getElementById(`freetextsub-${element}`);
                    el1.style.display = 'none';
                });
                const el2 = document.getElementById(`freetextsub-${singleChoiceAnswer}`);
                el2.style.display = 'block';

                if(cureRateFreeTextAnswerSub === ""){
                    nextButton = false
                }else if(cureRateFreeTextAnswerSub.trim() === "" && cureRateFreeTextAnswerSub.substring(0, 3) === "   "){
                    cureRateFreeTextAnswerSub = ""
                    nextButton = false
                }else if(cureRateFreeTextAnswerSub.length < 5 && cureRateFreeTextAnswerSub != ""){
                    nextButton = false
                }else{
                    nextButton = true
                }
            }else{
                cureRateFreeTextStatus = false
                nextButton = true
            }

        }
    }else{
        if(showQuestion.is_mandatory == false){
            nextButton = true
        }else{
            nextButton = false
        }
    }
</script>

<style>
    .selected-answer {
        background-color: rgb(251 146 60);
        color: black;
        font-weight: 600;
    }

    .progress-secondary {
        border-radius: 0px;
    }

    input[type=number]::-webkit-inner-spin-button, 
    input[type=number]::-webkit-outer-spin-button { 
        -webkit-appearance: none;
        -moz-appearance: none;
        appearance: none;
        margin: 0; 
    }
</style>

{#if resSubmit.status == 'finished'}
    <Status bind:resSubmit />
{:else}
    <div class="page-white">
        {#await promise}
        <div></div>
        {:then res}
        <div>
            <progress class="progress progress-secondary w-100" value="{question.number+1}" max="{question.total}" style="vertical-align:top;border-radius: 0px;"></progress>
        </div>
        <div class="pt-1 pb-5 {tipe == 'ULTIMATE' ? 'ps-0' : 'ps-2'}" style="border-bottom: 1px solid #ffa400;">
            <img alt="logo" src={logo} style="height: {tipe == 'ULTIMATE' ? '75px' : '65px'};" />
        </div>
        {/await}

        <div class="card card-compact bg-base-100 w-100" style="border-bottom-left-radius: 0;border-bottom-right-radius: 0;">
            <div class="card-body">
                {#if submitLoading == true}
                    <Loading />
                {:else}
                    {#await promise}
                        <Loading />
                    {:then res}
                        <div class="mb-1">
                            <h2 class="card-title text-base text-justify">{showQuestion?.text}</h2>
                        </div>
                        {#if showQuestion?.type == 'single_choice'}

                            {#if showQuestion.kategori == 'Cure Rate'}
                                {#each showQuestion.answers  as item}               
                                    <!-- svelte-ignore a11y-click-events-have-key-events -->
                                    <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
                                    <label for="answer-{item.id}" 
                                        class="p-2 mb-2 rounded-md border-solid border border-orange-500/75"
                                        class:selected-answer={selectedAnswer === item.id}
                                        on:click={() => {
                                            selectedAnswer = item.id
                                            cureRateAnswer = item.order
                                        }}
                                    >
                                        <div class="flex items-center">
                                            <div class="me-3">
                                                <input id="answer-{item.id}" type="radio" name="answer" value="{item.id}" class="radio radio-accent" 
                                                bind:group={singleChoiceAnswer}
                                                />
                                            </div>
                                            <div class="text-base" style="font-weight: 500;">
                                                {item.text}
                                            </div>
                                        </div>
                                    </label >

                                    {#if [115, 116, 117].includes(item.id)}
                                        <div class="mt-1" id="freetextsub-{item.id}" style="display: none;">
                                            <!-- svelte-ignore missing-declaration -->
                                            <textarea class="textarea textarea-md border-orange-500/75 w-full min-h-48" 
                                                maxlength="500"
                                                name="answer" placeholder="{$_('survey.textarea_placholder_1')}"
                                                on:input={ (ev) => {
                                                    const length = ev.target.value.length
                                                }}
                                                bind:value={cureRateFreeTextAnswerSub}
                                            ></textarea>
                                        </div>
                                    {/if}
                                {/each}
                                
                                {#if cureRateFreeTextStatus == true}
                                    <div class="mt-1">
                                        <!-- svelte-ignore missing-declaration -->
                                        <textarea class="textarea textarea-md border-orange-500/75 w-full min-h-48" 
                                            maxlength="500"
                                            name="answer" placeholder="{$_('survey.textarea_placholder')}"
                                            on:input={ (ev) => {
                                                const length = ev.target.value.length
                                            }}
                                            bind:value={cureRateFreeTextAnswer}
                                        ></textarea>
                                    </div>
                                {/if}

                            {:else}
                                <div class="font-semibold mb-2">
                                    (1 : {showQuestion.scale_low} - {showQuestion.answers.length} : {showQuestion.scale_high})
                                </div>

                                <div class="flex justify-between">
                                    <div class="text-left text-sm">{showQuestion.scale_low}</div>
                                    <div class="text-right text-sm">{showQuestion.scale_high}</div>
                                </div>

                                <div class="grid grid-flow-col">
                                    {#each showQuestion.answers  as item}               
                                        <!-- svelte-ignore a11y-click-events-have-key-events -->
                                        <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
                                        <!-- svelte-ignore a11y-no-static-element-interactions -->
                                        <label for="answer-{item.id}" 
                                            class="p-2 mb-2 border-solid border"
                                            style="border-color: #ffa400;"
                                            class:selected-answer={selectedAnswer === item.id}
                                            on:click={() => {
                                                if(singleChoiceAnswer == ''){
                                                    selectedAnswer = item.id
                                                    cureRateAnswer = item.order
                                                    singleChoiceAnswer = item.id
                                                }else{
                                                    selectedAnswer = ''
                                                    cureRateAnswer = ''
                                                    singleChoiceAnswer = ''
                                                }
                                            }}
                                        >
                                            <div class="text-center">    
                                                <span style="font-weight: 500;font-size: 14.5px;">{item.text}</span>
                                            </div>
                                        </label >
                                    {/each}
                                </div>

                                <!-- Input Waktu Menunggu -->
                                {#if showQuestion.input_waktu == true}
                                    <div class="w-full">
                                        <div class="italic text-justify">
                                            {showQuestion.wording_input_waktu}: 
                                            <input type="number" min="1" class="input input-bordered input-xs" style="width: 65px;"
                                            bind:value={waitingTimeInput}
                                            on:input={ (ev) => {
                                                if(waitingTimeInput == 0){
                                                    waitingTimeInput = '';
                                                }
                                            }}
                                            />
                                            <span>{$_('survey.times')}</span>
                                        </div>
                                    </div>
                                {/if}
                            {/if}

                        {:else}
                            <div>
                                <!-- svelte-ignore missing-declaration -->
                                <textarea class="textarea textarea-md border-orange-500/75 w-full min-h-48" 
                                    maxlength="500"
                                    name="answer" placeholder="{$_('survey.textarea_placholder')}"
                                    on:input={ (ev) => {
                                        const length = ev.target.value.length
                                    }}
                                    bind:value={freeTextAnswer}
                                ></textarea>
                            </div>
                        {/if}

                        <div class="mt-2 flex justify-between">
                            {#if question.number > 0 }
                                <button class="btn btn-default" style="width: 35%;" on:click={backQuestion}>{$_('survey.button_back')}</button>
                            {/if}
        
                            {#if showQuestion.kategori == 'Cure Rate' && question.number == 0 && cureRateAnswer == '1'}
                                <button class="btn btn-primary" style="width: 100%;" on:click={btnSubmit}>{$_('survey.button_save')}</button>
                            {:else}
                                {#if question.number == 0 }
                                    <button class="btn btn-secondary" style="width: 100%;" on:click={nextQuestion} disabled={!nextButton}>
                                        {$_('survey.button_next')}
                                        <svg style="width: 16px;margin-top: 5px;" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M16.1716 10.9999L10.8076 5.63589L12.2218 4.22168L20 11.9999L12.2218 19.778L10.8076 18.3638L16.1716 12.9999H4V10.9999H16.1716Z"></path></svg>
                                    </button>
                                {:else}
                                    {#if (question.number+1) == question.total}
                                        <button class="btn btn-primary" style="width: 63%;" on:click={btnSubmit} disabled={!nextButton}>{$_('survey.button_save')}</button>
                                    {:else}
                                        <button class="btn btn-secondary" style="width: 63%;" on:click={nextQuestion} disabled={!nextButton}>
                                            {$_('survey.button_next')} 
                                            <svg style="width: 16px;margin-top: 5px;" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M16.1716 10.9999L10.8076 5.63589L12.2218 4.22168L20 11.9999L12.2218 19.778L10.8076 18.3638L16.1716 12.9999H4V10.9999H16.1716Z"></path></svg>
                                        </button>
                                    {/if}
                                {/if}
                            {/if}
                        </div>

                    {/await}
                {/if}
                        
            </div>
        </div>

    </div>
{/if}