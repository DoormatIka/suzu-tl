import type Konva from "konva";
import {writable} from "svelte/store";

const tab = writable<Konva.NodeConfig[]>();

export function setCurrentTab(state: Konva.NodeConfig[]) {
	tab.set(state);
}
export function getCurrentTab() {
	return tab;
}
