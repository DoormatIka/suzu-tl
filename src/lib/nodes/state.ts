import { DEFAULT_TEXT_CONFIG, LAYER_MAIN } from "$lib/constants";
import Konva from "konva";
import { TextBox } from "./text";
import { loadKonvaImageFromBase64, loadKonvaImageFromURL } from "./img";

type SaveNode = SaveText | SaveBG;
type SaveText = {
	type: "text";
	x: number;
	y: number;
	width: number;
	text: string;
	fontSize: number;
};
type SaveBG = {
	type: "bg";
	src: string;
	width: number;
	height: number;
};

/**
 * Handles the state and history of the Orchestra.
 */
export class State {
	private currentState: Konva.NodeConfig[] = [];
	private history: Konva.NodeConfig[][] = [];
	private historyPointer: number = -1;

	constructor() {
		this.saveStateToHistory([]);
	}

	public addNode(node: Konva.Node) {
		this.currentState.push({ ...node.attrs });
		this.saveStateToHistory(this.currentState.slice());
	}
	public updateNode(node: Konva.Node) {
		const nodeIndex = this.currentState.findIndex((c) => c.id === node.id());
		if (nodeIndex === -1) {
			this.addNode(node);
		} else {
			this.currentState[nodeIndex] = { ...node.attrs };
			this.saveStateToHistory(this.currentState.slice());
		}
	}
	public deleteNode(node: Konva.Node) {
		const nodeIndex = this.currentState.findIndex((c) => c.id === node.id());
		this.currentState = this.currentState.filter(
			(_, index) => index !== nodeIndex
		);
		this.saveStateToHistory(this.currentState.slice());
	}
	private saveStateToHistory(state: Konva.ShapeConfig[]) {
		this.history = this.history.slice(0, this.historyPointer + 1);
		this.history.push(state);
		this.historyPointer = this.history.length - 1;
		this.currentState = state.slice();
	}

	public undo() {
		if (this.historyPointer > 0) {
			this.historyPointer--;
			this.currentState = this.history[this.historyPointer].slice();
			return this.currentState;
		}
		return this.currentState;
	}
	public redo() {
		if (this.historyPointer < this.history.length - 1) {
			this.historyPointer++;
			this.currentState = this.history[this.historyPointer].slice();
			return this.currentState;
		}
		return this.currentState;
	}

	public getCurrentState(): Konva.NodeConfig[] {
		return this.history[this.historyPointer];
	}

	public async saveStateToJSON() {
		const state = this.getCurrentState();
		const parsedState: SaveNode[] = [];

		for (const node of state) {
			const p = await this.stringifyNode(node);
			parsedState.push(p);
		}
		return JSON.stringify(parsedState, undefined, 2);
	}
	private async stringifyNode(
		node: Konva.ImageConfig | Konva.TextConfig
	): Promise<SaveNode> {
		if (node.image) {
			const img = node as Konva.ImageConfig;
			return {
				type: "bg",
				width: img.width!,
				height: img.height!,
				src: node.image.src,
			};
		}
		if (node.text) {
			const text = node as Konva.TextConfig;
			return {
				type: "text",
				x: text.x!,
				y: text.y!,
				text: text.text!,
				width: text.width!,
				fontSize: text.fontSize!,
			};
		}
		throw new Error("Unknown type found!");
	}

	public loadStateFromNodeConfig(
		stage: Konva.Stage,
		nodes: Konva.NodeConfig[]
	) {
		console.log("nodes:", nodes);

		if (!Array.isArray(nodes)) {
			throw new TypeError("nodes is not an array");
		}

		this.currentState.splice(0, this.currentState.length);
		this.history.splice(0, this.history.length);
		this.historyPointer = 0;

		for (const node of nodes) {
			this.currentState.push(node);
		}

		// this.currentState is somehow a [[{node}, {node}]], instead of a [{node}, {node}]
		// pls check.
		this.refreshStage(stage, this.currentState);
	}

	public async loadStateFromJSON(stage: Konva.Stage, nodes: any[]) {
		this.currentState.splice(0, this.currentState.length);
		this.history.splice(0, this.history.length);
		this.historyPointer = 0;

		for (const node of nodes) {
			this.currentState.push(await this.parseNode(node));
		}
		this.refreshStage(stage, this.currentState);
	}
	private async parseNode(
		node: SaveNode
	): Promise<Konva.ImageConfig | Konva.TextConfig> {
		if (node.type === "bg") {
			const img = node as SaveBG;
			const elem = new Image(img.width, img.height);
			elem.src = structuredClone(node.src);

			return {
				name: "bg",
				id: "bg",
				x: 0,
				y: 0,
				image: elem,
				width: img.width!,
				height: img.height!,
			};
		}
		if (node.type === "text") {
			const text = node as SaveText;
			return {
				...DEFAULT_TEXT_CONFIG,
				name: "text",
				x: text.x!,
				y: text.y!,
				text: text.text!,
				width: text.width!,
				fontSize: text.fontSize!,
			};
		}
		throw new Error("Unknown type found!");
	}

	public async refreshStage(stage: Konva.Stage, state: Konva.ShapeConfig[]) {
		if (!state || !Array.isArray(state)) {
			console.warn("Invalid state provided to refreshStage");
			return;
		}

		const layers = stage.children;
		const mainLayerIndex = layers.findIndex((c) => c.name() === LAYER_MAIN);
		if (mainLayerIndex === -1) {
			console.warn("Could not find the main layer!");
			return;
		}

		const mainLayer = layers[mainLayerIndex];
		mainLayer.destroyChildren();

		for (const attr of state) {
			switch (attr.name) {
				case "text": {
					const txt = this.createText(attr);
					mainLayer.add(txt.getText());
					break;
				}
				case "bg": {
					const base64: string = attr.image.src;
					const img = await loadKonvaImageFromBase64(base64);
					stage.width(img.width());
					stage.height(img.height());
					mainLayer.add(img);
					break;
				}
				default:
					console.log("Unknown state value passed.");
					break;
			}
		}
		mainLayer.batchDraw();
	}
	private createText(attrs: Object) {
		const txt = new TextBox(attrs, this);
		txt.setBackgroundFill(255, 255, 255, 0.8);
		return txt;
	}
}
