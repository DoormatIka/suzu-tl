<script lang="ts">
  import {Orchestra} from "$lib/index.js";
  import {onMount} from "svelte";
  let state: Orchestra;
  let scale = 0;
  let saveContent = "";

  onMount(async () => {
    state = new Orchestra();
    state.setStageClick();
    await state.loadImage("https://images-ext-1.discordapp.net/external/j_0a_sMO9wIlnUS3S_2F98Xd57v6if9DoHqjZ32Jmk8/https/pbs.twimg.com/media/Ge6MO7qbAAAinSx.jpg%3Alarge?format=webp&width=670&height=670");
    scale = state.getScale();
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
  async function save() {
    saveContent = await state.save();
  }
  async function load() {
    await state.load(saveContent);
  }
  function undo() {
    state.undo();
  }
  function redo() {
    state.redo();
  }
  function zoomIn() {
    state.zoomIn();
    scale = state.getScale();
  }
  function zoomOut() {
    state.zoomOut();
    scale = state.getScale();
  }
</script>

<div class="w-80 py-2">
  <div>
    <p>Input image</p>
    <form class="flex gap-2" on:submit={changeImage}>
      <input class="flex-1" type="text" name="imagelink" id="imagelink">
      <button type="submit">Submit</button>
    </form>
  </div>

  <br>

  <div class="flex gap-2">
    <button class="flex-1" on:click={undo}>Undo</button>
    <button class="flex-1" on:click={redo}>Redo</button>
    <button class="flex-1" on:click={() => { state.pushText(0, 0); }}>Add</button>
  </div>

  <br>

  <div class="flex gap-2 flex-row h-6 items-center">
    <button  on:click={zoomIn} class="flex-1 h-full">Zoom +</button>
    <p style="padding: 0px 1em 0px 1em;">{scale}x</p>
    <button on:click={zoomOut} class="flex-1 h-full">Zoom -</button>
  </div>

  <br>

  <div class="flex flex-col items-center gap-2">
    <div class="w-full">
      <textarea class="w-full" name="save" id="save">{saveContent}</textarea>
    </div>
    <div class="flex w-full gap-2">
      <button on:click={save} class="flex-1 h-full">Save</button>
      <button on:click={load} class="flex-1 h-full">Load</button>
    </div>
  </div>
</div>


<div id="container" class="border-dotted w-fit"></div>
