import type Konva from "konva";

/**
	* Handles the state and history of the Orchestra.
	*/
export class State {
	// currentState => history[]
	private currentState: Object[] = [];
	private history: Object[][] = [];
	private currentPointer: number = 0;
	constructor() {}
	public addNode(node: Konva.Shape) {
		// add to node attributes.
		// should call saveStateToHistory here.
	}
	public updateNode(node: Konva.Shape) {
		// update node attributes on currentState.
		// should call saveStateToHistory here.
	}
	public saveStateToHistory() {
		// copy every node's attributes into the currentState array
		// push that into history.
		//
		// there are smarter ways to do this like only
		// 		updating what changed.
		// id maybe?
	}
	public undo() {
		// returns index and currentState
	}
	public redo() {
		// returns index and currentState
	}
}
