<script lang="ts">
  import type Konva from "konva";
  import {createOrchestra} from "$lib";
  import {setCurrentTab} from "$lib/stores/tabs"
  import {onMount} from "svelte";
  import {v7 as uuid} from "uuid";

  let currentTabIndex = 0;
  const imgs = [
    "https://images-ext-1.discordapp.net/external/j_0a_sMO9wIlnUS3S_2F98Xd57v6if9DoHqjZ32Jmk8/https/pbs.twimg.com/media/Ge6MO7qbAAAinSx.jpg%3Alarge?format=webp&width=670&height=670",
    "https://media.discordapp.net/attachments/1063526734969974907/1323339518023041044/image.png?ex=67742777&is=6772d5f7&hm=d2ea1500c35d6f3739ce468acf942b4fc90b275a751b517e023b0165eeed2672&=&format=webp&quality=lossless&width=1035&height=220",
  ];
  let tabs: {id: string, state: Konva.NodeConfig[]}[] = [];
  onMount(async () => {
    for (const img of imgs) {
      const o = await createOrchestra();
      await o.loadImage(img);
      tabs.push({id: uuid(), state: o.getState()});
    }
    tabs = tabs;
  });

  function onTabClick(index: number) {
    currentTabIndex = index;
    // might be because states rely on the pointer changing instead of the value
    // meaning changing indices probably doesn't update this.
    setCurrentTab(tabs[index]);
    console.log(index);
  }
</script>

<div class="h-screen">
  <div class="h-full flex flex-col p-3">
    <div role="tablist" class="tabs tabs-lifted flex-shrink-0">
      {#each tabs as _, index}
        {#if index == currentTabIndex}
          <button on:click={() => onTabClick(index)} role="tab" class="tab tab-active text-primary">Tab {index + 1}</button>
        {:else}
          <button on:click={() => onTabClick(index)} role="tab" class="tab">Tab {index + 1}</button>
        {/if}
      {/each}
    </div>
    <div class="border px-3 overflow-auto">
      <slot />
    </div>
  </div>
</div>
