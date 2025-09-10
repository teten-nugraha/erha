<script>
	import "tailwindcss/tailwind.css";
</script>

<style>
	.layout-page {
		max-width: 400px;
	}

	@media (min-width: 320px) and (max-width: 767px){
		.layout-page {
			min-width: 320px;
			max-width: 767px;
		}
	}

	@media (min-width: 768px) and (max-width: 1024px){
		.layout-page {
			min-width: 768px;
			max-width: 1024px;
		}
	}

</style>

<div class="mx-auto layout-page">
	<slot />
</div>
