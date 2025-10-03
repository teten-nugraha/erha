<script>
// @ts-nocheck
    import { browser } from '$app/environment';
    import { onMount } from 'svelte';
    import { _ } from 'svelte-i18n'
    import Loading from './loading.svelte';
    import Status from './status.svelte';
    import { PUBLIC_API_URL } from '$env/static/public'
    // Face
    import logoUltimate from '$lib/assets/logo-ultimate.png';
    import logoDermies from '$lib/assets/logo-dermies-max.png';
    import iconFaceRed from '$lib/assets/icons/red.svg';
    import iconFaceYellow from '$lib/assets/icons/yellow.svg';
    import iconFaceGreen from '$lib/assets/icons/green.svg';

    export let data

    /**
   * @type {any[]}
   */
    let respondenID
    let outletID
    let outletKODE
    let promise
    let questions = []
    let selectedAnswer = {}
    let freeTextAnswer = {}
    let showFreeText = []
    let submitLoading = false
    let submitButtonStatus = false;

    // Multiple Choice
    let selected_ = []
    let checkStatusMandatorySub_ = []
    let parentOpsi = []
    let mandatorySub = {}
    
    let tipe = ''
    let logo

    // Q1 & Q27
    let checkMandatoryOpsi = {
        'Q41' : [],
        'Q42' : [],
    }
    let Q1 = false
    let Q27 = false
    let statusSurvey = false;
    let statusSurvey_ = false;
    let mandatoryFreetext = {
        'Q41' : true,
        'Q42' : true,
    }
    let resSubmit = {
        'status' : false,
        'jenis' : '',
        'message' : '',
    }

    onMount(async () => {
        respondenID = data.respondenID
        outletID = data.outletID
        outletKODE = data.outletKODE
        
        const ot = await checkOutlet(outletKODE)

        // Load data question
        promise = getDataQuestions(respondenID,ot);
        questions = await promise;

        // Set options
        setDataOption(questions)
    })

    const checkOutlet = async (outletKODE) => {
        const apiUrl = `${PUBLIC_API_URL}/api/v2/responden/check-outlet?kode=${outletKODE}`
        const res = await fetch(apiUrl)
        if (!res.ok) throw new Error('Bad response')
        const data = await res.json()

        const outlet = data.data
        logo = outlet.jenis == 'ULTIMATE' ? logoUltimate : logoDermies;
        tipe = outlet.jenis

        return data
    }

    const getDataQuestions = async (respondenID,ot) => {
        const apiUrl = `${PUBLIC_API_URL}/api/v2/questions?id=${respondenID}&ot=${ot.data.jenis}`
        const res = await fetch(apiUrl)
        if (!res.ok) throw new Error('Bad response')
        const data = await res.json()

        return data.data;
    }

    const setDataOption = (questions) => {
        for (let index = 0; index < questions.length; index++) {
            const el = questions[index];

            // Set mandatory
            let isMandatory = true
            if(el.kode == 'Q1' || el.kode == 'Q27'){
                isMandatory = true
            }

            selectedAnswer[el.id] = {
                id : el.id,
                isMandatory : isMandatory,
                kode : el.kode,
                selected : [],
                text : []
            };
            showFreeText[el.id] = [];
            freeTextAnswer[el.kode] = '';
        }
    }

    const checkMandatory = (kode) => {
        if(kode == 'Q1'){
            Q1 = true 
        }

        if(kode == 'Q27'){
            Q27 =  true
        }

        if(Q1 && Q27){
            checkMandatoryAll()
        }

        // check status     
        setStatusMandatoruSub()
    }

    function checkMandatorySub(opt,kat)
    {
        if(opt.kategori.length > 0){
            // Parent Opsi
            if(!parentOpsi.includes(opt.id)){
                parentOpsi.push(opt.id)
            }

            if(mandatorySub.hasOwnProperty(opt.id)){
                if(mandatorySub[opt.id].opsi == opt.opsi 
                    && kat != ""
                ){
                    if(!mandatorySub[opt.id]['selectedSub'].includes(kat)){
                        mandatorySub[opt.id]['status'] = true 
                        mandatorySub[opt.id]['selectedSub'].push(kat) 
                    }else{
                        const index = mandatorySub[opt.id]['selectedSub'].indexOf(kat);
                        if (index !== -1) {
                            mandatorySub[opt.id]['selectedSub'].splice(index, 1);
                        }

                        if(mandatorySub[opt.id]['selectedSub'].length > 0){
                            mandatorySub[opt.id]['status'] = true
                        }else{
                            mandatorySub[opt.id]['status'] = false 
                        }
                    }
                }else{
                    mandatorySub[opt.id]['parentSelected'] = !mandatorySub[opt.id]['parentSelected'] 
                    mandatorySub[opt.id]['status'] = false 
                    mandatorySub[opt.id]['selectedSub'] = []
                }
            }else{
                mandatorySub[opt.id] = {
                    id : opt.id,
                    opsi: opt.opsi,
                    parentSelected : true,
                    status : false,
                    selectedSub : [],
                }
            }
        }

        // check status     
        setStatusMandatoruSub()
    }

    function setStatusMandatoruSub() {
        checkStatusMandatorySub_ = []   
        parentOpsi.forEach(el => {
            if(mandatorySub.hasOwnProperty(el)){
                if(mandatorySub[el]['parentSelected']){
                    if(mandatorySub[el]['status']){
                        checkStatusMandatorySub_.push(true)
                    }else{
                        checkStatusMandatorySub_.push(false)
                    }
                }
            }
        });

        if(!checkStatusMandatorySub_.includes(false)){
            statusSurvey_ = true
        }else{
            statusSurvey_ = false
        }


        if(statusSurvey && statusSurvey_
            && mandatoryFreetext['Q41'] && mandatoryFreetext['Q42'] 
        ){
            submitButtonStatus = true
        }else{
            submitButtonStatus = false
        }
    }

    const onSubmit = async () => {
        submitLoading = true
        const apiUrl = `${PUBLIC_API_URL}/api/v2/survey/submit`
        const res = await fetch(apiUrl, {
            method: 'POST',
            body: JSON.stringify({
                outletID: outletID,
                respondenID: respondenID,
                selectedAnswer,
                selectedMultiple:selected_,
                freeTextAnswer
            })
        })
        if (!res.ok) throw new Error('Bad response')
        const data = await res.json()

        if(data.status == 'finished'){
            resSubmit = data
            resSubmit.jenis = tipe
        }else{
            modal_info.showModal()
            resSubmit = data
        }

        submitLoading = false
    }

    // Multiple Choice
    let check = []
    function updateClassSelected(item,opt,kat="",k=false) {
        let ID = `${item.kode}-${opt.opsi}${kat}`
        const element = document.getElementById(ID);
        
        if (element) {
            if(selected_.includes(ID)){
                removeKategori(ID,item,opt)

                // Remove Mandatory
                if(k){
                    let newArray = checkMandatoryOpsi[item.kode].filter(item => item !== opt.id);
                    checkMandatoryOpsi[item.kode] = newArray
                }else{
                    const i = checkMandatoryOpsi[item.kode].indexOf(opt.id)
                    if (i !== -1) {
                        checkMandatoryOpsi[item.kode].splice(i, 1);
                    }
                }

                const index = selected_.indexOf(ID);
                if (index !== -1) {
                    selected_.splice(index, 1);
                }

                // kategori
                if(k){
                    check[item.kode+'-'+opt.opsi] = ''
                    openKategori(item.kode,opt.opsi,false)

                    if(opt.opsi == 'Lainnya'){
                        checFreetext('',item)
                    }
                }else{
                    check[kat+item.kode] = ''
                }

            }else{
                selected_.push(ID)
                checkMandatoryOpsi[item.kode].push(opt.id)
                // kategori
                if(k){
                    check[item.kode+'-'+opt.opsi] = item.kode+'-'+opt.opsi
                    openKategori(item.kode,opt.opsi,true)
                    
                    if(opt.opsi == 'Lainnya'){
                        checFreetext('Lainnya',item) 
                    }
                }else{
                    check[kat+item.kode] = kat+item.kode
                }
                
            }
        }

        // Check mandatory
        checkMandatoryAll();

        // check sub mandatori
        checkMandatorySub(opt,kat)
    }

    function checkMandatoryAll()
    {
        if(checkMandatoryOpsi['Q41'].length > 0 
            && checkMandatoryOpsi['Q42'].length > 0
            && Q1 && Q27
        ){
            statusSurvey = true
        }else{
            statusSurvey = false
        }

    }

    function openKategori(kode,opsi,stat){
        const ID = `kat-${kode}-${opsi}`
        const element = document.getElementById(ID);

        if(element){
            if(stat){
                element.classList.remove('hidden');
            }else{
                element.classList.add('hidden');
            }
        }
    }

    function removeKategori(ID,item,opt){
        if(ID == `${item.kode}-Komunikasi dan keramahan`){
            (opt.kategori).forEach(kat => {
                const index = selected_.indexOf(`${ID}-${kat}`);
                if (index !== -1) {
                    selected_.splice(index, 1);
                    check[`-${kat}${item.kode}`] = ''
                }
            });
        }

        if(ID == `${item.kode}-Waktu tunggu pelayanan`){
            (opt.kategori).forEach(kat => {
                const index = selected_.indexOf(`${ID}-${kat}`);
                if (index !== -1) {
                    selected_.splice(index, 1);
                    check[`-${kat}${item.kode}`] = ''
                }
            });
        }
    }

    function checFreetext(opsi,item){
        if(opsi == 'Lainnya'){
            showFreeText[item.id] = opsi
            mandatoryFreetext[item.kode] = false
        }else{
            showFreeText[item.id] = ''
            mandatoryFreetext[item.kode] = true
            freeTextAnswer[item.kode] = ''
        }
    }

    function checkMandatoryFreetext(kode,length){
        if(freeTextAnswer[kode].trim() === "" && freeTextAnswer[kode].substring(0, 3) === "   "){
            freeTextAnswer[kode] = ""
            mandatoryFreetext[kode] = false
        }else if(length >= 5){
            mandatoryFreetext[kode] = true
        }else{
            mandatoryFreetext[kode] = false
        }

        checkMandatory()
    }
</script>

<style>
    .selected-answer {
        border-radius: 3px;
        background-color: rgb(251 146 60) !important;
        color: black !important;
        font-weight: 600;
    }

    :global(.selected-answer )

    .hidden {
        display: none;
    }

    ul {
        list-style: none; /* Remove default bullet points */
        padding: 0;
    }

    ul li {
        position: relative; /* Required for positioning the number */
        padding-left: 1.1rem; /* Space for the number */
    }

    ul li::before {
        font-size: 1rem;
        font-weight:600;
        line-height: 1.5rem;
        content: counter(item) ". "; /* Add the number followed by a dot */
        counter-increment: item; /* Increment the counter for each <li> */
        position: absolute;
        left: 0;
    }

    ul {
        counter-reset: item; /* Reset the counter at the beginning of the list */
    }
</style>

<dialog id="modal_info" class="modal">
    <div class="modal-box">
        <form method="dialog">
            <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
        </form>
        <h3 class="text-lg font-bold">Informasi</h3>
        <p class="py-4">{@html resSubmit.message}</p>
    </div>
</dialog>

{#if resSubmit.status == 'finished'}
    <Status bind:resSubmit />
{:else}
    <div class="page-white">
        {#if tipe != ''}
            <div class="pt-4 pb-5 {tipe == 'ULTIMATE' ? 'ps-0' : 'ps-2'}" style="border-bottom: 1px solid #ffa400;">
                <img alt="logo" src={logo} style="height: {tipe == 'ULTIMATE' ? '75px' : '65px'};" />
            </div>
        {/if}

        <div class="card card-compact bg-base-100 w-100" style="border-bottom-left-radius: 0;border-bottom-right-radius: 0;">
            <div class="card-body">
                {#if submitLoading == true}
                    <Loading />
                {:else}
                    {#await promise}
                        <Loading />
                    {:then res}
                        {#if questions.length > 0 }
                            <ul>
                                {#each questions as item}     
                                    <li class="mb-0">
                                        <h2 class="card-title text-base text-left">{item?.text}</h2>
                                        
                                        <!-- OPTIONS -->
                                        {#if item.kode == 'Q1' || item.kode == 'Q27'}
                                            <div class="grid grid-flow-col mt-2 mb-0">
                                                {#each item.options as opt} 
                                                    <div>
                                                        <!-- svelte-ignore a11y-click-events-have-key-events -->
                                                        <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
                                                        <!-- svelte-ignore a11y-no-static-element-interactions -->
                                                        <div for="answer-{opt.id}"
                                                            class="p-0"
                                                            style="padding: 2.5px;"
                                                            class:selected-answer={selectedAnswer[item.id].selected[0] === opt.id}
                                                            on:click={() => {
                                                                selectedAnswer[item.id].selected[0] = opt.id
                                                                selectedAnswer[item.id].text[0] = opt.opsi
                                                                checkMandatory(item.kode)
                                                            }}
                                                        >
                                                            <div class="text-center">    
                                                                <div class="flex justify-center">
                                                                    {#if opt.opsi <= 6 }
                                                                        <img src="{iconFaceRed}" style="width: 24px;height: auto;" alt="" srcset="">
                                                                    {:else if opt.opsi <= 8 }
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
                                                                selectedAnswer[item.id].selected[0] = opt.id
                                                                selectedAnswer[item.id].text[0] = opt.opsi
                                                                checkMandatory(item.kode)
                                                            }}
                                                        >
                                                            <div class="text-center"> 
                                                                <span style="font-weight: 500;font-size: 12px;">

                                                                    {#if opt.opsi <= 6 }
                                                                        <span style="color:red;">{opt.opsi}</span>
                                                                    {:else if opt.opsi <= 8 }
                                                                        <span style="color:#FFD65A;">{opt.opsi}</span>
                                                                    {:else}
                                                                        <span style="color:green;">{opt.opsi}</span>
                                                                    {/if}
                                                                    
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                {/each}
                                            </div>

                                            <div class="flex justify-between mt-2 mb-3">
                                                <div class="text-left text-sm" style="font-size: 11px;">{item.scale_low}</div>
                                                <div class="text-right text-sm" style="font-size: 11px;">{item.scale_high}</div>
                                            </div>

                                        {:else}
                                            <div class="grid grid-flow-col-12 mt-3">
                                                {#each item.options as opt} 
                                                    <!-- svelte-ignore a11y-click-events-have-key-events -->
                                                    <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
                                                    <!-- svelte-ignore a11y-no-static-element-interactions -->
                                                    <!-- svelte-ignore missing-declaration -->
                                                    <label for="answer-{opt.id}"
                                                        id="{item.kode}-{opt.opsi}"
                                                        class="p-2 mb-3 border-solid border"
                                                        style="border-color: #ffa400;"
                                                        class:selected-answer={check[item.kode+'-'+opt.opsi] == item.kode+'-'+opt.opsi}
                                                        on:click={updateClassSelected(item,opt,"",true)}
                                                    >
                                                        <div class="text-left">    
                                                            <span style="font-weight: 500;font-size: 14.5px;">{opt.opsi}</span>
                                                        </div>
                                                    </label>

                                                    {#if opt.kategori.length > 0}
                                                        <div id="kat-{item.kode}-{opt.opsi}" class="hidden">
                                                            <div class="grid grid-flow-col-12 ps-7">
                                                                {#each opt.kategori as kat}
                                                                    <!-- svelte-ignore a11y-click-events-have-key-events -->
                                                                    <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
                                                                    <!-- svelte-ignore a11y-no-static-element-interactions -->
                                                                    <!-- svelte-ignore missing-declaration -->
                                                                    <label for="answer-{kat}"
                                                                    id="{item.kode}-{opt.opsi}-{kat}"
                                                                    class="p-2 mb-3 border-solid border"
                                                                    style="border-color: #ffa400;"
                                                                    class:selected-answer={check[`-${kat}${item.kode}`] == `-${kat}${item.kode}`}
                                                                    on:click={updateClassSelected(item,opt,`-${kat}`,false)}
                                                                >
                                                                    <div class="text-left">    
                                                                        <span style="font-weight: 500;font-size: 14.5px;">{kat}</span>
                                                                    </div>
                                                                </label>
                                                                {/each}
                                                            </div>
                                                        </div>
                                                    {/if}
                                                {/each}
        
                                                {#if showFreeText[item.id] == 'Lainnya' }
                                                    <div>
                                                        <!-- svelte-ignore missing-declaration -->
                                                        <textarea class="textarea textarea-md border-orange-500/75 w-full min-h-48" 
                                                            maxlength="250"
                                                            name="answer" placeholder="{$_('survey.textarea_placholder')}"
                                                            on:input={ (ev) => {
                                                                const length = ev.target.value.length
                                                                checkMandatoryFreetext(item.kode,length)
                                                            }}
                                                            bind:value={freeTextAnswer[item.kode]}
                                                        ></textarea>
                                                    </div>
                                                {/if}
                                            </div>
                                        {/if}
        
                                    </li>
                                {/each}
                            </ul>
                            
                            <div class="mt-2 mb-1 flex justify-between">
                                <button class="btn btn-secondary" style="width: 100%;" on:click={onSubmit} disabled={!submitButtonStatus}>
                                    {$_('survey.button_save')} 
                                    <svg style="width: 16px;margin-top: 5px;" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M16.1716 10.9999L10.8076 5.63589L12.2218 4.22168L20 11.9999L12.2218 19.778L10.8076 18.3638L16.1716 12.9999H4V10.9999H16.1716Z"></path></svg>
                                </button>
                            </div>
                            

                        {/if}
                    {/await}
                {/if}
            </div>
        </div>
    </div>
{/if}
