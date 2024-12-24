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

<div>
  <form on:submit={changeImage}>
    <input type="text" name="imagelink" id="imagelink">
    <button type="submit">Submit</button>
  </form>
</div>

<br>

<div>
  <button on:click={undo}>Undo</button>
  <button on:click={redo}>Redo</button>
  <button on:click={() => { state.pushText(0, 0); }}>Add</button>
</div>

<br>

<div style="width: 15rem; flex-direction: row; display: flex; height: 1.5em; align-items: center;">
  <button on:click={zoomIn} style="flex-grow: 1; height: 100%;">Zoom +</button>
  <p style="padding: 0px 1em 0px 1em;">{scale}x</p>
  <button on:click={zoomOut} style="flex-grow: 1; height: 100%;">Zoom -</button>
</div>

<br>

<div style="align-items: center; flex-direction: row; display: flex; width: 20rem">
  <textarea style="flex-grow: 1;" name="save" id="save">{saveContent}</textarea>
  <button on:click={save} style="height: 100%;">Save</button>
  <button on:click={load} style="height: 100%;">Load</button>
</div>

<div id="container" style="border: dotted; width: fit-content;"></div>
