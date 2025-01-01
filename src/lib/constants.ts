import type Konva from "konva";
import type {Writable} from "svelte/store";

export type Tab = {id: string, state: Konva.NodeConfig[]};
export type TabStore = Writable<Tab | undefined>;

export const LAYER_MAIN = "main";
export const LAYER_WORK = "work";
export const GROUP_MAIN = "grp_main";
export const TRANSFORMER = "transformer";
export const CLOSE = "close";
export const MIN_TEXT_WIDTH = 100;
export const DEFAULT_TEXT_CONFIG = {
	width: MIN_TEXT_WIDTH,
	text: "Hello!",
	fontSize: 30,
	draggable: true,
	padding: 5,
};
