<script>
    import logoUltimate from '$lib/assets/logo-ultimate-black.png';
    import logoDermies from '$lib/assets/logo-dermies-max.png';

    export let resSubmit
</script>

<div class="page-orange" style="background-color: {resSubmit?.jenis == 'ULTIMATE' ? '#ef7e31' : 'white'};">
	<div class="flex justify-center items-center w-full" style="height: 70vh;">
        <div class="w-full text-center">
            <div class="flex justify-center items-center w-full">
                <img alt="logo" src={resSubmit?.jenis == 'ULTIMATE' ? logoUltimate : logoDermies} style="height: {resSubmit?.jenis == 'ULTIMATE' ? '80px' : '70px'};" />
            </div>
            <div class="mt-5 px-1 py-2 text-base font-sm text-center" style="color: {resSubmit?.jenis == 'ULTIMATE' ? '#FCF8F3' : 'black'};">
                {@html resSubmit?.message }
            </div>
        </div>
	</div>
</div>