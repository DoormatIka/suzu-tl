import Konva from "konva";
import { v7 as uuidv7 } from "uuid";

import { TextBox } from "./nodes/text";
import { CloseButton } from "./nodes/closebutton";
import {
	LAYER_MAIN,
	LAYER_WORK,
	TRANSFORMER,
	MIN_TEXT_WIDTH,
	DEFAULT_TEXT_CONFIG,
} from "./constants";
import { TTransformer } from "./nodes/transformer";
import { State } from "./nodes/state";
import {loadKonvaImageFromURL} from "./nodes/img";

export async function createOrchestra() {
    const state = new Orchestra();
    state.setStageClick();
	return state;
}

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
			width: window.innerWidth / 1.5,
			height: window.innerHeight / 1.5,
		});
		this.mainLayer = new Konva.Layer({ name: LAYER_MAIN });
		this.workLayer = new Konva.Layer({ name: LAYER_WORK });
		this.stage.add(this.mainLayer);
		this.stage.add(this.workLayer);

		this.state = new State();

		this.closeButton = new CloseButton(
			{
				name: "delete",
				radius: 10,
				fill: "red",
				draggable: false,
				visible: false,
			},
			this.state
		);
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
				const t = this.transformer.getTransformer();
				const stage = t.getStage()!;
				
				if (Math.abs(newBox.width) < MIN_TEXT_WIDTH * stage.scaleX()) {
					return oldBox;
				}
				return newBox;
			},
		});
		this.workLayer.add(this.closeButton.getButton());
		this.workLayer.add(this.transformer.getTransformer());
	}
	getStage() {
		return this.stage;
	}
	public setStageClick() {
		this.stage.on("dblclick dbltap", (e) => {
			if (["Text", "Circle", "Stage"].includes(e.target.getClassName())) {
				return;
			}
			const stageTransform = this.stage.getAbsoluteTransform();
			const invertedTransform = stageTransform.copy().invert();
			const pointer = invertedTransform.point({ x: e.evt.layerX, y: e.evt.layerY });
			this.pushText(pointer.x, pointer.y);
		});
		this.stage.on("wheel", (e) => { this.zoom(e); })
		this.stage.on("click tap", (e) => {
			const tr = this.transformer;
			if (["Image"].includes(e.target.getClassName())) {
				this.closeButton.hide();
				tr.nodes([]);
				return;
			}
			if (["Circle", "Stage"].includes(e.target.getClassName())) {
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
	private zoom(e: Konva.KonvaEventObject<WheelEvent>) {
		e.evt.preventDefault();
		const scaleBy = 1.1;

		var oldScale = this.stage.scaleX();
		var pointer = this.stage.getPointerPosition();
		if (!pointer) {
			return;
		}

		var mousePointTo = {
			x: (pointer.x - this.stage.x()) / oldScale,
			y: (pointer.y - this.stage.y()) / oldScale,
		};

		// how to scale? Zoom in? Or zoom out?
		let direction = e.evt.deltaY > 0 ? 1 : -1;

		// when we zoom on trackpad, e.evt.ctrlKey is true
		// in that case lets revert direction
		if (e.evt.ctrlKey) {
			direction = -direction;
		}

		var newScale = direction > 0 ? oldScale * scaleBy : oldScale / scaleBy;

		this.stage.scale({ x: newScale, y: newScale });

		var newPos = {
			x: pointer.x - mousePointTo.x * newScale,
			y: pointer.y - mousePointTo.y * newScale,
		};
		this.stage.position(newPos);
		this.closeButton.updateDeletePosition();
	}

	public async loadImage(url: string) {
		const work_layer_children = this.mainLayer.getChildren(
			(c) => c.name() === "bg"
		);
		const c = work_layer_children.at(0);
		if (c) {
			this.mainLayer.removeChildren();
			this.transformer.nodes([]);
		}

		const img = await loadKonvaImageFromURL(url);

		this.mainLayer.add(img);
		this.state.updateNode(img);
	}
	public pushText(x: number, y: number) {
		const txt = new TextBox(
			{
				...DEFAULT_TEXT_CONFIG,
				id: uuidv7(),
				x: x,
				y: y,
			},
			this.state
		);
		txt.setBackgroundFill(255, 255, 255, 0.8);
		const konvaTxt = txt.getText();
		this.mainLayer.add(konvaTxt);
		this.state.addNode(konvaTxt);
	}
	public undo() {
		const s = this.state.undo();
		this.state.refreshStage(this.stage, s);
		this.transformer.nodes([]);
		this.closeButton.hide();
	}
	public redo() {
		const s = this.state.redo();
		this.state.refreshStage(this.stage, s);
		this.transformer.nodes([]);
		this.closeButton.hide();
	}
	public getScale() {
		return this.stage.scaleX();
	}

	public async loadNodeConfig(s: Konva.NodeConfig[]) {
		return this.state.loadStateFromNodeConfig(this.stage, s);
	}
	public async load(str: string) {
		const j = JSON.parse(str);
		return await this.state.loadStateFromJSON(this.stage, j);
	}
	public save() {
		return this.state.saveStateToJSON();
	}
	public getState() {
		return this.state.getCurrentState();
	}
}

function precisionRoundMod(n: number, precision: number) {
  var factor = Math.pow(10, precision);
  var n = precision < 0 ? n : 0.01 / factor + n;
  return Math.round(n * factor) / factor;
}
