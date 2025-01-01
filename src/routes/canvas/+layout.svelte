<script lang="ts">
	import type Konva from "konva";
	import { createOrchestra, Orchestra } from "$lib";
	import { setCurrentTab, getCurrentTab } from "$lib/stores/tabs";
	import { onMount, onDestroy } from "svelte";
	import { v7 as uuid } from "uuid";

	let currentTabIndex = 0;
	const imgs = [
		"https://scontent.fmnl4-7.fna.fbcdn.net/v/t39.30808-6/471696684_122137349210477523_2147963932047450702_n.jpg?_nc_cat=108&ccb=1-7&_nc_sid=aa7b47&_nc_ohc=0QdolnCD8f0Q7kNvgHQh5GH&_nc_zt=23&_nc_ht=scontent.fmnl4-7.fna&_nc_gid=ApLYvE8UyfKVef3YXIWwiGD&oh=00_AYD_s7ZUiP9t9EkDwvGZ7iYv4nVFUpbDgOzQJf_dJ3iPYQ&oe=677AC8D8",
		"https://scontent.fmnl4-7.fna.fbcdn.net/v/t39.30808-6/472016853_8956503004467342_615579185115283719_n.jpg?_nc_cat=1&ccb=1-7&_nc_sid=aa7b47&_nc_ohc=oLt0VtcBFSsQ7kNvgGqMLlK&_nc_zt=23&_nc_ht=scontent.fmnl4-7.fna&_nc_gid=A-07ro_ltGzINBEiLqxSYGo&oh=00_AYAgHv5Tu3WN5mPf66WhIEaVy9vTGb6itfZZsHRM88omLg&oe=677AEA80",
	];
	let tabs: { id: string; state: Konva.NodeConfig[] }[] = [];
	let state: Orchestra;
	let unsubscribe: () => void;

	onMount(async () => {
		for (const img of imgs) {
			const o = await createOrchestra();
			await o.loadImage(img);
			tabs.push({ id: uuid(), state: o.getState() });
		}
		tabs = tabs;

		const k = getCurrentTab();
		state = await createOrchestra();
		unsubscribe = k.subscribe(async (v) => {
			if (!v) {
				return;
			}
			await state.loadNodeConfig(v.state);
		});
	});

	onDestroy(() => {
		if (unsubscribe) {
			unsubscribe();
		}
	});

	function onTabClick(index: number) {
		currentTabIndex = index;
		setCurrentTab(tabs[index]);
	}
</script>

<div class="h-screen">
	<div class="h-full flex flex-col p-3">
		<div role="tablist" class="tabs tabs-lifted flex-shrink-0">
			{#each tabs as _, index}
				{#if index == currentTabIndex}
					<button
						on:click={() => onTabClick(index)}
						role="tab"
						class="tab tab-active text-primary">Tab {index + 1}</button
					>
				{:else}
					<button on:click={() => onTabClick(index)} role="tab" class="tab"
						>Tab {index + 1}</button
					>
				{/if}
			{/each}
		</div>
		<div class="border px-3 overflow-auto">
			<slot />
		</div>
	</div>
</div>
