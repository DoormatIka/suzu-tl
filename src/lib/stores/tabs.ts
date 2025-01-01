import type Konva from "konva";
import {writable} from "svelte/store";

const tab = writable<{id: string, state: Konva.NodeConfig[]}>();

export function setCurrentTab(state: {id: string, state: Konva.NodeConfig[]}) {
	tab.update((current) => {
        if (!current || current.id !== state.id) {
            return state;
        }
        return current;
    });
}
export function getCurrentTab() {
	return tab;
}
