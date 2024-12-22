<script lang="ts">
  import {Orchestra} from "$lib/index.js";
  import {onMount} from "svelte";
  let state: Orchestra;

  onMount(async () => {
    state = new Orchestra();
    state.setStageClick();
    await state.loadImage("https://images-ext-1.discordapp.net/external/j_0a_sMO9wIlnUS3S_2F98Xd57v6if9DoHqjZ32Jmk8/https/pbs.twimg.com/media/Ge6MO7qbAAAinSx.jpg%3Alarge?format=webp&width=670&height=670");
  })
  async function changeImage(e: SubmitEvent & {currentTarget: EventTarget & HTMLFormElement}) {
    if (!e.target)
      return;

    const formData = new FormData(e.currentTarget);
    const formProps = Object.fromEntries(formData);
    const img_link = formProps["imagelink"];
    if (img_link) {
      await state.loadImage(img_link.toString())
    }
  }
  function undo() {
    state.undo();
  }
  function redo() {
    state.redo();
  }
</script>

<div>
  <form on:submit={changeImage}>
    <input type="text" name="imagelink" id="imagelink">
    <button type="submit">Submit</button>
  </form>
</div>
<button on:click={undo}>Undo</button>
<button on:click={redo}>Redo</button>
<button on:click={() => { state.pushText(0, 0); }}>Add</button>
<div id="container"></div>
