<script lang="ts">
// @ts-nocheck
    import { onMount, onDestroy } from 'svelte';
    import { _ } from 'svelte-i18n'
    import { browser } from '$app/environment';
    import { goto } from '$app/navigation';
    import { PUBLIC_API_URL } from '$env/static/public'
    import logoUltimate from '$lib/assets/logo-ultimate.png';
    import logoDermies from '$lib/assets/logo-dermies-max.png';
    import Loading from '../../../survey/[slug]/loading.svelte';

    import intlTelInput from "intl-tel-input";
    import "intl-tel-input/build/css/intlTelInput.css";

    export let data
    export let value: string = "";

    let modalMessage = ''
    let promise: any;
    let buttonStatus = false
    let responden = {
        kodeOutlet: '',
        nomorTelepon: '',
        status: false
    };
    let logo:any;
    let greeting:string = '';
    let outlet = {
        'id' : '',
        'kode' : '',
        'nama' : '',
        'jenis' : '',
    }
    let status:boolean = false

    let iti: intlTelInput.Plugin;
    let input: HTMLInputElement;
    let formattedValue: string;

    $: if (formattedValue) {
        value = iti.getSelectedCountryData();
        responden.nomorTelepon = value.dialCode+formattedValue
    }

    onMount(async () => {
        promise = checkOutlet(data.kodeOutlet)
        const res = await promise
        status = res.status
        outlet = res.data
        greeting = res.message
        if(!status){
            logo = logoUltimate
        }else {
            logo = outlet.jenis == 'ULTIMATE' ? logoUltimate : logoDermies;
        }

        // @ts-ignore
        await import("intl-tel-input/build/js/utils");
        iti = intlTelInput(input,{
            initialCountry: "id",
            separateDialCode: true,
        });
    });

    onDestroy(() => iti && iti.destroy());

    const onSubmit = async () => {
        promise = checkResponden(data.kodeOutlet)
        const res = await promise
        
        if(!res.status){
            modalMessage = res.message
            modal_info.showModal()
            await import("intl-tel-input/build/js/utils");
            iti = intlTelInput(input,{
                initialCountry: "id",
                separateDialCode: true,
            });
        }else{
            goto(`/v2/survey/${res.data.id}-${outlet.id}-${data.kodeOutlet}`)
        }
    }

    const checkOutlet = async (kodeOutlet: any) => {
        const apiUrl = `${PUBLIC_API_URL}/api/v2/responden/check-outlet?kode=${kodeOutlet}`
        const res = await fetch(apiUrl)
        //if (!res.ok) throw new Error('Bad response')
        const data = await res.json()

        return data
    }

    const checkResponden = async (kodeOutlet: any) => {
        responden.kodeOutlet = kodeOutlet
        const apiUrl = `${PUBLIC_API_URL}/api/v2/responden/check-data`
        const res = await fetch(apiUrl, {
            method: 'POST',
            body: JSON.stringify(responden)
        })
        if (!res.ok) throw new Error('Bad response')
        const data = await res.json()

        return data
    }

    const isValidPhoneNumber = (phoneNumber: any) => {
        return true
        const phoneRegex = /^(?:62)[1-9]/;
        
        if (phoneRegex.test(phoneNumber)) {
            // Phone number is valid
            return true;
        } else {
            // Phone number is invalid
            return false;
        }
    }
</script>

<style>
    svg {
        color: #50577A;
        width: 24px;
        margin-right: 7px;
    }

    .text-base-1 {
        font-size: 1.1rem;
        line-height: 1.5rem;
    }

    :global(.iti) {
        width: 100% !important;
    }

    :global(.iti__search-input) {
        padding: 5px;
    }
</style>

<!-- Open the modal using ID.showModal() method -->
<dialog id="modal_info" class="modal modal-center sm:modal-middle">
    <div class="modal-box">
        <p class="py-4">{modalMessage}</p>
        <div class="modal-action">
        <form method="dialog">
            <!-- if there is a button in form, it will close the modal -->
            <button class="btn">Close</button>
        </form>
        </div>
    </div>
</dialog>

{#await promise}
<div class="flex justify-center items-center">
    <Loading />
</div>
{:then res}
{#if !status}
    <div class="page-orange" style="background-color: white;">
    {#if outlet.id != ''}
        <div class="flex justify-center items-center">
            <div class="text-center mt-8">
                <img alt="logo" src={logo} style="height: {outlet.jenis == 'ULTIMATE' ? '100px' : '70px'};" />
            </div>
        </div>
        
        <div class="card card-compact w-100 mt-3">
            <div class="card-body">
                <div class="text-center text-base-1 font-medium mb-4">
                    <div>Survey di outlet ini belum tersedia</div>
                </div>
            </div>
        </div>
    {/if}
</div>
{:else}
<div class="page-orange" style="background-color: white;">
    {#if outlet.id != ''}
        <div class="flex justify-center items-center">
            <div class="text-center mt-8">
                <img alt="logo" src={logo} style="height: {outlet.jenis == 'ULTIMATE' ? '100px' : '70px'};" />
            </div>
        </div>
        
        <div class="card card-compact w-100 mt-3">
            <div class="card-body">
                <div class="text-center text-base-1 font-medium mb-4">
                    <div>{@html greeting}</div>
                </div>
                <div>
                    <input
                        type="tel"
                        class="w-full px-4 py-3 text-gray-700 bg-white border rounded-md focus:outline-none focus:ring focus:ring-opacity-40"
                        placeholder="Masukan nomor telepon"
                        bind:this={input}
                        bind:value={formattedValue}
                        on:input= {(ev) => {   
                            let min = 9;
                            let max = 12;
                            const { value } = event.target

                            
                            if (!isNaN(Number(value))) {
                                if(value == 0 || value == 62){
                                    formattedValue = null
                                }else{
                                    if(value!= null){
                                        let t = value.toString()
                                        if(value.length > max){
                                            let tlpn = t.slice(0,-1)
                                            formattedValue = tlpn
                                        }
                                        
                                        buttonStatus = isValidPhoneNumber(t)
                                        if(buttonStatus){
                                            if(value.length < min){
                                                buttonStatus = false
                                            }
                                        }
                                    }
                                }

                            } else {
                                if(value!= null){
                                    let t = value.toString()
                                    let tlpn = t.slice(0,-1)
                                    formattedValue = tlpn
                                }
                            }

                            
                        }}
                    />
                    <div class="label">
                        <span class="label-text-alt" style="color: #50577A;text-align: center;">Silahkan isi nomor handphone <b>tanpa kode negara</b> dan <b>tanpa diawali angka 0</b></span>
                    </div>
                </div>
    
                <div class="card-actions justify-center mt-7">
                    <button on:click={onSubmit} disabled={!buttonStatus} class="btn btn-block btn-secondary text-base font-medium" style="border-radius: 50px;">
                        {$_('responden.button_start')}
                    </button>
                </div>
            </div>
        </div>
    {/if}
</div>
{/if}
{/await}