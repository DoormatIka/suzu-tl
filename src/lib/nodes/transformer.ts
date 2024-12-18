
import Konva from "konva";
import type {CloseButton} from "./closebutton";
import {MAX_TEXT_WIDTH} from "$lib/constants";

export class TTransformer {
	private transformer: Konva.Transformer;
	constructor(private closeButton: CloseButton, config?: Konva.TransformerConfig) {
		this.transformer = new Konva.Transformer(config);
		this.on();
	}
	public getTransformer() {
		return this.transformer;
	}
	public nodes(v: Konva.Node[]): void;
	public nodes(): Konva.Node[];
	public nodes(v?: Konva.Node[]): Konva.Node[] | void {
		if (v) {
			this.transformer.nodes(v);
		} else {
			return this.transformer.nodes();
		}
	}
	private on() {
		this.transformer.on("dragmove", (e) => this.dragMove(e));
		this.transformer.on("transform", (e) => this.transform(e));
	}
	private dragMove(e: Konva.KonvaEventObject<Konva.Transformer>) {
		this.closeButton.updateDeletePosition();
	}
	private transform(e: Konva.KonvaEventObject<Konva.Transformer>) {
		const nodes = this.transformer.nodes();
		if (nodes.length === 1) {
			const node = nodes[0] as Konva.Text;
			const anchorName = this.transformer.getActiveAnchor();
			const newScaleX = node.scaleX();
			const newScaleY = node.scaleY();

			if (anchorName === 'middle-left' || anchorName === 'middle-right') {
				let newWidth = node.width() * newScaleX;
				node.width(newWidth);
				node.scaleX(1); 
			} else if (anchorName === 'top-center' || anchorName === 'bottom-center') {
				let newFontSize = node.fontSize() * newScaleY;
				let newWidth = node.width() * newScaleY;
				if (newWidth > MAX_TEXT_WIDTH) {
					node.fontSize(newFontSize);
					node.width(newWidth);
				}

				node.scaleX(1);
				node.scaleY(1);
			}
			node.getLayer()?.batchDraw();
		}
	}
}
