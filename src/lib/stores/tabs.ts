import type Konva from "konva";
import {writable} from "svelte/store";

const tab = writable<{id: string, state: Konva.NodeConfig[]}>();

export function setCurrentTab(state: {id: string, state: Konva.NodeConfig[]}) {
	// use id somehow?
	tab.set(state);
}
export function getCurrentTab() {
	return tab;
}
