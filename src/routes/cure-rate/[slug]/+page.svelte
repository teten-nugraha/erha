<script>
// @ts-nocheck
    import { browser } from '$app/environment';
    import { _ } from 'svelte-i18n'
    import { onMount, tick } from 'svelte';
    import { getDataQuestion } from '$lib/stores/data';
    import {survey,submitSurvey} from './store';
    import Loading from './loading.svelte';
    import Status from './status.svelte';
    import logoUltimate from '$lib/assets/logo-ultimate.png';
    import logoDermies from '$lib/assets/logo-dermies-max.png';
    import iconFaceRed from '$lib/assets/icons/red.svg';
    import iconFaceYellow from '$lib/assets/icons/yellow.svg';
    import iconFaceGreen from '$lib/assets/icons/green.svg';

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

    let checkAnswer = '';

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

    let prevQuestionNumber = null; 

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
    }

    const nextQuestion = async () => {
        // Back to Top
        document.body.scrollIntoView();

        // Store Survey
        storeSurvey();

        // Simpan nomor sebelumnya
        prevQuestionNumber = question.number;

        // Jika sekarang Q28 (question.number == 0 dan showQuestion.kode == 'Q28'), lompat ke Q43
        if (question.number === 0 && showQuestion.kode === 'Q28') {
            // Cari index Q28
            const idxQ28 = dataQuestion.findIndex(q => q.kode === 'Q28');
            // Jika ditemukan, ambil answers dari Q28
            let answers = [];
            if (idxQ28 !== -1) {
                answers = dataQuestion[idxQ28].answers;
            }
            const isFirstIndex = answers.length > 0 && answers[0].id === checkAnswer;
            if (isFirstIndex) {
                // Cari index Q43
                const idxQ43 = dataQuestion.findIndex(q => q.kode === 'Q43');
                if (idxQ43 !== -1) {
                    question.number = idxQ43;
                    getQuestion(question.number);
                    getHistoryAnswer();
                    await tick();
                    openQ29SubTextarea();
                    return;
                }
            }
        }

        // Next Question normal
        question.number += 1;
        getQuestion(question.number);
        getHistoryAnswer();
        await tick();
        openQ29SubTextarea();
    }

    const backQuestion = async () => {
        // Back to Top
        document.body.scrollIntoView();

        // Jika sekarang Q43 dan sebelumnya Q28 (khusus lompatan Q28->Q43), kembali ke Q28
        if (showQuestion.kode === 'Q43' && prevQuestionNumber !== null) {
            const idxQ28 = dataQuestion.findIndex(q => q.kode === 'Q28');
            if (prevQuestionNumber === idxQ28) {
                question.number = idxQ28;
                getQuestion(question.number);
                getHistoryAnswer();
                await tick(); 
                openQ29SubTextarea(); 
                prevQuestionNumber = null;
                return;
            }
        }

        // Normal back
        prevQuestionNumber = question.number;
        question.number -= 1;
        getQuestion(question.number);
        getHistoryAnswer();
        await tick(); 
        openQ29SubTextarea(); 
    }

    // Fungsi untuk membuka textarea sub jika sudah ada isinya
    function openQ29SubTextarea() {
        if (showQuestion.kode === 'Q29' && cureRateFreeTextAnswerSub && selectedAnswer && selectedAnswer != 131) {
            const el = document.querySelector(`.freetextsub-${selectedAnswer}`);
            if (el) el.style.display = 'block';
        }
    }

    const getHistoryAnswer = () => {
        freeTextAnswer = $survey[showQuestion.id]?.free_text ?? ''
        singleChoiceAnswer = $survey[showQuestion.id]?.answer_id ?? ''
        selectedAnswer = $survey[showQuestion.id]?.answer_id ?? ''
        cureRateFreeTextAnswerSub = $survey[showQuestion.id]?.free_text_sub ?? ''
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

    $: {
        // Reset state
        let isQ29 = showQuestion.kode === 'Q29';
        let isQ43 = showQuestion.kode === 'Q43';
        let isCureRateLainnya = selectedAnswer == 131;
        let isMandatory = showQuestion.is_mandatory;

        checkAnswer = selectedAnswer;
        
        // Jika Q29 dan selectedAnswer bukan 131, tampilkan textarea sub untuk selectedAnswer
        let checksub = isQ29 ? showQuestion.answers.map(a => a.id) : [];    
        if (isQ29 && selectedAnswer && selectedAnswer != 131) {
            // Sembunyikan semua
            checksub.forEach(id => {
                const el = document.querySelector(`.freetextsub-${id}`);
                if (el) el.style.display = 'none';
            });
            // Tampilkan yang dipilih
            const el = document.querySelector(`.freetextsub-${selectedAnswer}`);
            if (el) el.style.display = 'block';
        } else if (isQ29) {
            // Sembunyikan semua jika bukan Q29 atau selectedAnswer 131
            checksub.forEach(id => {
                const el = document.querySelector(`.freetextsub-${id}`);
                if (el) el.style.display = 'none';
            });
        }

        // --- Tambahkan ini agar textarea sub tetap terbuka jika sudah ada isinya ---
        if (isQ29 && cureRateFreeTextAnswerSub != ''  && selectedAnswer != 131) {
            const el = document.querySelector(`.freetextsub-${selectedAnswer}`);
            if (el) el.style.display = 'block';
        }
        // --------------------------------------------------------------------------

        // Default
        nextButton = false;
        cureRateFreeTextStatus = false;

        // Jika ada jawaban
        if (singleChoiceAnswer !== '' || freeTextAnswer !== '') {
            if (isQ29 && isCureRateLainnya) {
                // Tampilkan textarea utama untuk "Lainnya"
                cureRateFreeTextStatus = true;
                cureRateFreeTextAnswerSub = '';

                // Validasi minimal 5 karakter
                if (
                    !cureRateFreeTextAnswer ||
                    cureRateFreeTextAnswer.trim() === '' ||
                    cureRateFreeTextAnswer.replace(/^\s+/, '').length < 5 ||
                    /^\s/.test(cureRateFreeTextAnswer)
                ) {
                    nextButton = false;
                } else {
                    nextButton = true;
                }
            } else if (isQ29 && showQuestion.answers.map(a => a.id).includes(singleChoiceAnswer)) {
                // Tampilkan textarea sub untuk pilihan Q29 selain "Lainnya"
                cureRateFreeTextStatus = false;

                if (
                    !cureRateFreeTextAnswerSub ||
                    cureRateFreeTextAnswerSub.trim() === '' ||
                    cureRateFreeTextAnswerSub.replace(/^\s+/, '').length < 5 ||
                    /^\s/.test(cureRateFreeTextAnswerSub)
                ) {
                    nextButton = false;
                } else {
                    nextButton = true;
                }
            } else if (isQ43) {
                // Q43: wajib isi minimal 5 karakter
                if (singleChoiceAnswer == '') {
                    nextButton = false;
                } else {
                    nextButton = true;
                }
            } else {
                // Pertanyaan lain
                nextButton = true;
            }
        } else {
            // Jika tidak mandatory, tombol next aktif
            nextButton = !isMandatory;
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
                        {#if showQuestion.kode == 'Q43'}
                            <div class="grid grid-flow-col mt-2 mb-0">
                                {#each showQuestion.answers as item} 
                                    <div>
                                        <!-- svelte-ignore a11y-click-events-have-key-events -->
                                        <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
                                        <!-- svelte-ignore a11y-no-static-element-interactions -->
                                        <div for="answer-{item.id}"
                                            class="p-0"
                                            style="padding: 2.5px;"
                                            class:selected-answer={selectedAnswer === item.id}
                                            on:click={() => {
                                                selectedAnswer = item.id;
                                                singleChoiceAnswer = item.id;
                                            }}
                                        >
                                            <div class="text-center">    
                                                <div class="flex justify-center">
                                                    {#if item.text <= 6 }
                                                        <img src="{iconFaceRed}" style="width: 24px;height: auto;" alt="" srcset="">
                                                    {:else if item.text <= 8 }
                                                        <img src="{iconFaceYellow}" style="width: 24px;height: auto;" alt="" srcset="">
                                                    {:else}
                                                        <img src="{iconFaceGreen}" style="width: 24px;height: auto;" alt="" srcset="">
                                                    {/if}
                                                </div>
                                            </div>
                                        </div>
                                        <!-- svelte-ignore a11y-click-events-have-key-events -->
                                        <!-- svelte-ignore a11y-no-static-element-interactions -->
                                        <div class="mt-1"
                                            on:click={() => {
                                                selectedAnswer = item.id;
                                                singleChoiceAnswer = item.id;
                                            }}
                                        >
                                            <div class="text-center"> 
                                                <span style="font-weight: 500;font-size: 12px;">

                                                    {#if item.text <= 6 }
                                                        <span style="color:red;">{item.text}</span>
                                                    {:else if item.text <= 8 }
                                                        <span style="color:#FFD65A;">{item.text}</span>
                                                    {:else}
                                                        <span style="color:green;">{item.text}</span>
                                                    {/if}
                                                    
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                {/each}
                            </div>
                            <div class="flex justify-between mt-2 mb-3">
                                <div class="text-left text-sm" style="font-size: 11px;">{showQuestion.scale_low}</div>
                                <div class="text-right text-sm" style="font-size: 11px;">{showQuestion.scale_high}</div>
                            </div>
                        {:else}
                            {#if showQuestion?.type == 'single_choice'}
                                
                                {#each showQuestion.answers  as item}               
                                    
                                    <!-- svelte-ignore a11y-click-events-have-key-events -->
                                    <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
                                    <label for="answer-{item.id}" 
                                        class="p-2 mb-2 rounded-md border-solid border border-orange-500/75"
                                        class:selected-answer={selectedAnswer === item.id}
                                        on:click={() => {
                                            // Reset Q29 jika ganti pilihan di Q28 dan bukan "Lainnya"
                                            if (showQuestion.kode === 'Q28' && selectedAnswer !== item.id && item.id != 131) {
                                                // Reset jawaban sub Q29
                                                cureRateFreeTextAnswerSub = '';
                                                // Reset selected answer Q29
                                                const idxQ29 = dataQuestion.findIndex(q => q.kode === 'Q29');
                                                if (idxQ29 !== -1) {
                                                    const q29id = dataQuestion[idxQ29].id;
                                                    // Reset di store jika sudah pernah diisi
                                                    if ($survey[q29id]) {
                                                        $survey[q29id].free_text_sub = '';
                                                        $survey[q29id].answer_id = '';
                                                    }
                                                }
                                            }

                                            // Reset hanya jika ganti pilihan di Q29 dan bukan "Lainnya"
                                            if (showQuestion.kode === 'Q29' && selectedAnswer !== item.id && item.id != 131) {
                                                cureRateFreeTextAnswerSub = '';
                                            }
                                            selectedAnswer = item.id;
                                            cureRateAnswer = item.order;
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

                                    {#if showQuestion.kode == 'Q29'}
                                        <div class="mt-1 freetextsub-{item.id}" style="display: none;">
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
                        {/if}
    
                        <div class="mt-2 flex justify-between">
                            {#if question.number > 0 }
                                <button class="btn btn-default" style="width: 35%;" on:click={backQuestion}>{$_('survey.button_back')}</button>
                            {/if}
        

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
                            
                        </div>

                    {/await}
                {/if}
                        
            </div>
        </div>

    </div>
{/if}