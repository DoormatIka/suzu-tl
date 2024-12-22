import {LAYER_MAIN} from "$lib/constants";
import Konva from "konva";
import {TextBox} from "./text";

/**
	* Handles the state and history of the Orchestra.
	*/
export class State {
	// currentState => history[]
	private currentState: Konva.NodeConfig[] = [];
	private history: Konva.NodeConfig[][] = [];
	private historyPointer: number = -1;
	constructor() {}
	public addNode(node: Konva.Node) {
		this.currentState.push({...node.attrs});
		this.saveStateToHistory(this.currentState.slice());
	}
	public updateNode(node: Konva.Node) {
		const nodeIndex = this.currentState.findIndex(c => c.id === node.id());
		this.currentState[nodeIndex] = {...node.attrs};
		this.saveStateToHistory(this.currentState.slice());
	}
	public deleteNode(node: Konva.Node) {
		const nodeIndex = this.currentState.findIndex(c => c.id === node.id());
		this.currentState = this.currentState.filter((_, index) => index !== nodeIndex);
		this.saveStateToHistory(this.currentState.slice());
	}
	private saveStateToHistory(state: Konva.ShapeConfig[]) {
		this.history.push(state);
		this.historyPointer++;
	}

	// issue: undo and redo overflows this.history;
	// 		because of historyPointer
	public undo() {
		this.historyPointer--;
		return this.history[this.historyPointer];
	}
	public getCurrentState() {
		return this.history[this.historyPointer];
	}
	public redo() {
		// returns index and currentState
		this.historyPointer++;
		return this.history[this.historyPointer];
	}

	public refreshStage(stage: Konva.Stage, state: Konva.ShapeConfig[]) {
		const layers = stage.children;
		const mainLayerIndex = layers.findIndex(c => c.name() === LAYER_MAIN);
		if (mainLayerIndex === -1) {
			return;
		}
		const mainLayer = layers[mainLayerIndex];
		mainLayer.clear(); // issue: mainLayer isn't getting cleared?
		console.log(state);

		for (const attr of state) {
			switch (attr.name) {
				case "text": {
					const txt = this.createText(attr);
					mainLayer.add(txt.getText());
					break;
				}
				default:
					break;
			}
		}
	}
	private createText(attrs: Object) {
		const txt = new TextBox(attrs, this);
		txt.setBackgroundFill(255, 255, 255, 0.8);
		return txt;
	}
}
