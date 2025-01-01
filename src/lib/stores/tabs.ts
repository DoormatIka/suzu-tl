import type {Tab, TabStore} from "$lib/constants";

export function setCurrentTab(tab: TabStore, state: Tab | undefined) {
	tab.update((current) => {
		if (state) {
		  if (!current || current.id !== state.id) {
			return state;
		  }
		}
        return current;
    });
}
