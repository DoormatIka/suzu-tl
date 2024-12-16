<script lang="ts">
  import {State} from "$lib/index.js";
  import {onMount} from "svelte";
  onMount(async () => {
    const state = new State();
    await state.loadImage("https://images-ext-1.discordapp.net/external/j_0a_sMO9wIlnUS3S_2F98Xd57v6if9DoHqjZ32Jmk8/https/pbs.twimg.com/media/Ge6MO7qbAAAinSx.jpg%3Alarge?format=webp&width=670&height=670");
  })
</script>

<div id="container"></div>
