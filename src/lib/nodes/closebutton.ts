import Konva from "konva";
import { CLOSE, LAYER_WORK, TRANSFORMER } from "../constants";
import type { State } from "./state";

export class CloseButton {
	private closeButton: Konva.Circle;
	constructor(config: Konva.CircleConfig, private state: State) {
		this.closeButton = new Konva.Circle({ name: CLOSE, ...config });
		this.on();
	}
	public getButton() {
		return this.closeButton;
	}
	public updateDeletePosition() {
		const stage = this.closeButton.getStage()!;
		// cache?
		const workLayer = stage
			.getLayers()
			.filter((c) => c.name() === LAYER_WORK)[0];
		const tr = workLayer.getChildren(
			(c) => c.name() === TRANSFORMER
		)[0] as Konva.Transformer;
		const x = tr.x() / stage.scaleX();
		const y = tr.y() / stage.scaleY();
		this.closeButton.x(x - 15);
		this.closeButton.y(y - 15);
	}
	private on() {
		this.closeButton.on("click", (e) => this.onClick(e));
	}
	private onClick(e: Konva.KonvaEventObject<MouseEvent>) {
		console.log("close.");
		const stage = this.closeButton.getStage()!;
		// cache?
		const workLayer = stage
			.getLayers()
			.filter((c) => c.name() === LAYER_WORK)[0];
		const tr = workLayer.getChildren(
			(c) => c.name() === TRANSFORMER
		)[0] as Konva.Transformer;
		const selected_nodes = tr.nodes();
		for (const node of selected_nodes) {
			this.state.deleteNode(node);
			node.remove();
		}
		tr.nodes([]);
		this.closeButton.hide();
	}
	public show() {
		this.closeButton.show();
	}
	public hide() {
		this.closeButton.hide();
	}
}
