<script lang="ts">
  import type {TabStore} from "$lib/constants";
	import { createOrchestra, Orchestra } from "$lib/index.js";
	import { setCurrentTab } from "$lib/stores/tabs";
	import { onMount, onDestroy, setContext, getContext } from "svelte";

  const tab: TabStore = getContext("tab");
  
	let orchestra: Orchestra;
	let saveContent = $state("");
	let errGlobal = "";

  let unsubscribe: () => void;

	onMount(async () => {
		orchestra = await createOrchestra();
		unsubscribe = tab.subscribe(async (v) => {
      const s = $state.snapshot(v);
			if (!s) {
				return;
			}
      console.log("state: ", s.state);
			await orchestra.loadNodeConfig(s.state as any);
		});
	});

  onDestroy(() => {
    if (unsubscribe) {
      unsubscribe();
      setCurrentTab(tab, undefined);
    }
  });

	async function changeImage(
		e: SubmitEvent & { currentTarget: EventTarget & HTMLFormElement }
	) {
		if (!e.target) return;

		const formData = new FormData(e.currentTarget);
		const formProps = Object.fromEntries(formData);
		const img_link = formProps["imagelink"];
		if (img_link) {
			await orchestra
				.loadImage(img_link.toString())
				.catch((err) => (errGlobal = err));
		}
	}
	async function save() {
		saveContent = await orchestra.save().catch((err) => (errGlobal = err));
	}
	async function load() {
		await orchestra.load(saveContent).catch((err) => (errGlobal = err));
	}
	function undo() {
		orchestra.undo();
	}
	function redo() {
		orchestra.redo();
	}
</script>

<div>
	<a href="/">Root</a>
</div>

<div class="flex flex-row items-center gap-3">
	<button class="flex-1 btn btn-outline" onclick={undo}>Undo</button>
	<button class="flex-1 btn btn-outline" onclick={redo}>Redo</button>
</div>

<br />

<p>Double-click to add text.</p>
<div class="flex justify-center items-center">
	<div id="container" class="border-dotted w-fit bg-slate-700"></div>
</div>

<br />

<div>
	<p>Input image</p>
	<form class="flex gap-2" onsubmit={changeImage}>
		<input class="flex-1" type="text" name="imagelink" id="imagelink" />
		<button class="btn btn-outline" type="submit">Submit</button>
	</form>
</div>

<br />

<div class="flex flex-col items-center gap-2">
	<div class="w-full">
		<textarea class="w-full" name="save" id="save">{saveContent}</textarea>
	</div>
	<div class="flex w-full gap-2">
		<button onclick={save} class="btn btn-outline flex-1 h-full">Save</button>
		<button onclick={load} class="btn btn-outline flex-1 h-full">Load</button>
	</div>
</div>
