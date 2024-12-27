<script lang="ts">
  import {Orchestra} from "$lib/index.js";
  import {onMount} from "svelte";
  let state: Orchestra;
  let scale = 0;
  let saveContent = "";
  let errGlobal = "";

  onMount(async () => {
    state = new Orchestra();
    state.setStageClick();
    await state.loadImage("https://images-ext-1.discordapp.net/external/j_0a_sMO9wIlnUS3S_2F98Xd57v6if9DoHqjZ32Jmk8/https/pbs.twimg.com/media/Ge6MO7qbAAAinSx.jpg%3Alarge?format=webp&width=670&height=670")
      .catch((err) => errGlobal = err);
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
        .catch((err) => errGlobal = err);
    }
  }
  async function save() {
    saveContent = await state.save()
      .catch((err) => errGlobal = err);
  }
  async function load() {
    await state.load(saveContent)
      .catch((err) => errGlobal = err);
  }
  function undo() {
    state.undo();
  }
  function redo() {
    state.redo();
  }
</script>


<div>
  <a href="/">Root</a>
</div>

<div class="flex flex-row items-center gap-3">
  <button class="flex-1 btn btn-outline" on:click={undo}>Undo</button>
  <button class="flex-1 btn btn-outline" on:click={redo}>Redo</button>
  <p style="padding: 0px 1em 0px 1em;">{scale}x</p>
</div>

<br>

<p>Double-click to add text.</p>
<div class="flex justify-center items-center">
  <div id="container" class="border-dotted w-fit bg-slate-700"></div>
</div>

<br>

<div>
  <p>Input image</p>
  <form class="flex gap-2" on:submit={changeImage}>
    <input class="flex-1" type="text" name="imagelink" id="imagelink">
    <button class="btn btn-outline" type="submit">Submit</button>
  </form>
</div>

<br>

<div class="flex flex-col items-center gap-2">
  <div class="w-full">
    <textarea class="w-full" name="save" id="save">{saveContent}</textarea>
  </div>
  <div class="flex w-full gap-2">
    <button on:click={save} class="btn btn-outline flex-1 h-full">Save</button>
    <button on:click={load} class="btn btn-outline flex-1 h-full">Load</button>
  </div>
</div>
