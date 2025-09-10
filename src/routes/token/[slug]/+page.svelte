<script lang="ts">
    import { onMount } from 'svelte';
    import { _ } from 'svelte-i18n'
    import { browser } from '$app/environment';
    import { goto } from '$app/navigation';
    import { locale, waitLocale } from 'svelte-i18n'
    import { getDataResponden, responden } from '$lib/stores/data.js';
    import logoUltimate from '$lib/assets/logo-ultimate.png';
    import logoDermies from '$lib/assets/logo-dermies-max.png';
    import flagID from '$lib/assets/indonesia.png';
    import flagEN from '$lib/assets/united-kingdom.png';
    export let data

    let promise:any;
    let status = {
        'status' : '',
        'message': ''
    }
    let selectedGreeting = '';
    let greeting = {
        'id' : '',
        'en': ''
    }
    let selectedLang = 'id'
    let logo:any;
    let jenis = ''
    
    // Get Data responden
    onMount(async () => {
        promise = getDataResponden(data.token);
		if (browser) {
            const res = await promise
            jenis = res.data.jenis
            greeting = res.data.greeting
            selectedGreeting = greeting.id
            $responden = res.data
            status = {
                status : res.status,
                message: res.message
            }
            localStorage.setItem('token',data.token)
        }
    })

    const onChangeLang = async (ev:any) => {
        selectedLang = ev.currentTarget.value;
        selectedGreeting = selectedLang == 'id' ? greeting.id : greeting.en
        locale.set(selectedLang)
        localStorage.setItem('lang',selectedLang)
        await waitLocale()
    }
    
    const pageSurvey = () => {
        if($responden.survey.jenis_id == '6') {
            goto(`/cure-rate/${$responden.survey.jenis_slug}`)
        }else{
            goto(`/survey/${$responden.survey.jenis_slug}`)
        }
    }

    $: if(jenis == 'ULTIMATE') {
        logo = logoUltimate
    }else{
        logo = logoDermies
    }
</script>

<div class="page-orange" style="background-color: white;">
	<div class="flex justify-center items-center">
		<div class="text-center mt-8">
            {#await promise}
                <div></div>
            {:then res}
                <img alt="logo" src={logo} style="height: {jenis == 'ULTIMATE' ? '100px' : '70px'};" />
            {/await}
		</div>
	</div>
	
	<div class="card card-compact w-100">
		<div class="card-body">
            {#await promise}
                <div class="flex justify-center">
                    <div style="padding-top:20vh;">
                        <div class="text-center">
                            <span class="loading loading-spinner loading-lg text-secondary"></span>
                        </div>
                        <div class="text-center mt-1">
                            Loading
                        </div>
                    </div>
                </div>
            {:then res}
                
                <div class="h-36 flex items-center">
                    <div class="text-center text-lg">
                        {@html selectedGreeting }
                    </div>
                </div>

                <div class="flex justify-between items-center mt-4 mx-5">
                    <div class="flex items-center">
                        <input id="lang_id" style="margin-top: 0px;" type="radio" name="radio-lang" class="radio radio-warning" value="id" checked={selectedLang==='id'} on:change={onChangeLang} />
                        <!-- svelte-ignore a11y-missing-attribute -->
                        <label for="lang_id" class="ms-3 flex  items-center"> 
                            <img class="me-1" src="{flagID}" style="height: 20px;"> 
                            <span style="margin-top: -2px;">Indonesia</span>
                        </label>
                    </div>

                    <div class="ms-4 flex items-center">
                        <input id="lang_end" style="margin-top: 0px;" type="radio" name="radio-lang" class="radio radio-warning" value="en" checked={selectedLang==='en'} on:change={onChangeLang} />
                        <!-- svelte-ignore a11y-missing-attribute -->
                        <label for="lang_end" class="ms-3 flex  items-center"> 
                            <img class="me-1" src="{flagEN}" style="height: 15px;"> 
                            <span style="margin-top: -2px;">English</span>
                        </label>
                    </div>
                </div>
    
                {#if status.status != 'finished'}
                <div class="card-actions justify-center mt-8 mx-5">
                    <button on:click={pageSurvey} class="btn btn-block btn-secondary font-semibold" style="border-radius: 50px;">
                        {$_('responden.button_start')}
                    </button>
                </div>
                {:else}
                    <div class="card-actions justify-center mt-8 mx-5">
                        <button type="button" class="btn btn-block btn-secondary font-semibold" style="border-radius: 50px;">
                            {status.message}
                        </button>
                    </div>
                {/if}
            {/await}

		</div>
	</div>
</div>