<script lang="ts">
  import {createOrchestra, Orchestra} from "$lib/index.js";
    import {getCurrentTab} from "$lib/stores/tabs";
  import {onMount} from "svelte";
  let state: Orchestra;
  let saveContent = "";
  let errGlobal = "";

  onMount(async () => {
    const k = getCurrentTab();
    state = await createOrchestra();
    k.subscribe(async (v) => {
      if (!v) { return; }
      // doesn't update when clicking on tabs, unless you make a tiny change in the code?
      await state.loadNodeConfig(v.state);
    });
  });

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
