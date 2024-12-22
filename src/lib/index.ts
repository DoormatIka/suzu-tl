import Konva from "konva";
import { v7 as uuidv7 } from "uuid";

import {TextBox} from "./nodes/text";
import {CloseButton} from "./nodes/closebutton";
import {LAYER_MAIN, LAYER_WORK, TRANSFORMER, MAX_TEXT_WIDTH} from "./constants";
import {TTransformer} from "./nodes/transformer";
import {State} from "./nodes/state";

export class Orchestra {
	private stage: Konva.Stage;
	private mainLayer: Konva.Layer;
	private workLayer: Konva.Layer;

	private transformer: TTransformer;
	private closeButton: CloseButton;
	private state: State;

	constructor(id?: string) {
		this.stage = new Konva.Stage({
			container: id ?? "container",
			width: 100,
			height: 100,
		});
		this.mainLayer = new Konva.Layer({ name: LAYER_MAIN });
		this.workLayer = new Konva.Layer({ name: LAYER_WORK });
		this.stage.add(this.mainLayer);
		this.stage.add(this.workLayer);

		this.state = new State();

		this.closeButton = new CloseButton({
			name: "delete",
			radius: 10,
			fill: "red",
			draggable: false,
			visible: false,
		}, this.state);
		this.transformer = new TTransformer(this.closeButton, {
			name: TRANSFORMER,
			padding: 2,
			flipEnabled: false,
			rotateEnabled: false,
			centeredScaling: false,
			enabledAnchors: [
        "top-center",
        "middle-left",
        "middle-right",
        "bottom-center",
			],
			boundBoxFunc: (oldBox, newBox) => {
				if (Math.abs(newBox.width) < MAX_TEXT_WIDTH) {
					return oldBox;
				}
				return newBox;
			},
		});
		this.workLayer.add(this.closeButton.getButton());
		this.workLayer.add(this.transformer.getTransformer());
	}
	getStage() {return this.stage;}
	public setStageClick() {
		this.stage.on('click tap', (e) => {
			const tr = this.transformer;
			if (["Image"].includes(e.target.getClassName())) {
				this.closeButton.hide();
				tr.nodes([]);
				return;
			}
			if (["Circle"].includes(e.target.getClassName())) {
				return;
			}

			const metaPressed = e.evt.shiftKey || e.evt.ctrlKey || e.evt.metaKey;
			const isSelected = tr.nodes().indexOf(e.target) >= 0;

			if (!metaPressed && !isSelected) {
				tr.nodes([e.target]);
			} else if (metaPressed && isSelected) {
				const nodes = tr.nodes().slice();
				nodes.splice(nodes.indexOf(e.target), 1);
				tr.nodes(nodes);
			} else if (metaPressed && !isSelected) {
				const nodes = tr.nodes().concat([e.target]);
				tr.nodes(nodes);
			}

			this.closeButton.updateDeletePosition();
			this.closeButton.show();
			this.workLayer.draw();
		});
	}

	public async loadImage(url: string) {
		const work_layer_children = this.mainLayer.getChildren(c => c.name() === "bg");
		const c = work_layer_children.at(0);
		if (c) {
			this.mainLayer.clear();
			this.transformer.nodes([]);
		}

		const imagefn = new Promise<Konva.Image>((res, rej) => {
			Konva.Image.fromURL(url, res, rej);
		});
		const img = await imagefn;
		img.name("bg");
		this.stage.width(img.width());
		this.stage.height(img.height());

		this.mainLayer.add(img);
		this.mainLayer.draw();
	}
	public pushText(x: number, y: number) {
		const txt = new TextBox({
			id: uuidv7(),
			x: x,
			y: y,
			width: MAX_TEXT_WIDTH,
			text: "Hello!",
			fontSize: 30,
			draggable: true,
			padding: 5,
		}, this.state);
		txt.setBackgroundFill(255, 255, 255, 0.8);
		const konvaTxt = txt.getText();
		this.mainLayer.add(konvaTxt);
		this.state.addNode(konvaTxt);
	}
	public undo() {
		const s = this.state.undo();
		this.state.refreshStage(this.stage, s);
	}
	public redo() {
		const s = this.state.redo();
		this.state.refreshStage(this.stage, s);
	}
}

