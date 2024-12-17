import Konva from "konva";

type TextSave = Partial<Konva.TextConfig> & { type: "text" };
type ImageSave = Partial<Konva.ImageConfig> & { type: "image" };

type NodeSave = TextSave | ImageSave;

const LAYER_MAIN = "main"
const LAYER_WORK = "work"
const TRANSFORMER = "transformer"

export class State {
	private nodes: NodeSave[] = [];
	private stage: Konva.Stage;
	private mainLayer: Konva.Layer;
	private workLayer: Konva.Layer;

	private transformer: Konva.Transformer;
	private closeButton: CloseButton;

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

		this.transformer = new Konva.Transformer({
			name: TRANSFORMER,
			padding: 2,
			flipEnabled: false,
			rotateEnabled: false,
			centeredScaling: true,
		});
		this.closeButton = new CloseButton({
			name: "delete",
			radius: 10,
			fill: "red",
			draggable: false,
			visible: true,
		});
		this.workLayer.add(this.closeButton.getButton());
		this.workLayer.add(this.transformer);
	}
	getStage() {return this.stage;}
	public setTransformerEvent() {
		this.transformer.on("transformer dragmove", (e) => {
			this.closeButton.updateDeletePosition();
		});
	}
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
		const txt = new Text({
			x: x,
			y: y,
			text: "Hello!",
			fontSize: 30,
			draggable: true,
			padding: 5,
		}, this.closeButton);
		txt.setBackgroundFill(255, 255, 255, 0.8);
		this.mainLayer.add(txt.getText());
	}
}

class Text {
	private text: Konva.Text;
	constructor(config: Konva.TextConfig, private closeButton: CloseButton) {
		this.text = new Konva.Text(config);
		this.on();
	}
	public getText() {
		return this.text;
	}
	public setBackgroundFill(r: number, g: number, b: number, a: number) {
		this.text.sceneFunc(function (context, shape) {
			context.fillStyle = `rgba(${r}, ${g}, ${b}, ${a})`;
			context.fillRect(0, 0, shape.width(), shape.height());
			(shape as Konva.Text)._sceneFunc(context);
		});
	}
	private on() {
		this.text.on("dblclick dbltap", (e) => this.doubleClick(e));
		this.text.on("transform", (e) => this.transform(e));
	}
	private transform(e: Konva.KonvaEventObject<Konva.Text>) {
		this.closeButton.updateDeletePosition();
	}
	private doubleClick(e: Konva.KonvaEventObject<Konva.Text>) {
		const textNode = this.text;
		const stage = e.target.getStage()!;
		const textPosition = textNode.getAbsolutePosition();
		const stageBox = stage.container().getBoundingClientRect();

		const areaPosition = {
			x: stageBox.left + textPosition.x,
			y: Math.abs(stageBox.top) - window.scrollY + textPosition.y,
		};

		const textarea = document.createElement('textarea');
		document.body.appendChild(textarea);

		textarea.value = textNode.text();
		textarea.style.position = 'absolute';
		textarea.style.left = areaPosition.x + 'px';
		textarea.style.top = areaPosition.y + 'px';
		textarea.style.width = textNode.width().toString();
		textarea.style.fontSize = `${textNode.fontSize()}px`;

		textarea.focus();

		textarea.addEventListener("keydown", (e) => {
			if (!e.shiftKey && e.key === "Enter") {
				textarea.blur();
			}
		});

		textarea.addEventListener("blur", () => {
			textNode.text(textarea.value);
			document.body.removeChild(textarea);
		});
	}
}

class CloseButton {
	private closeButton: Konva.Circle;
	constructor(config: Konva.CircleConfig) {
		this.closeButton = new Konva.Circle(config);
	}
	public getButton() {
		return this.closeButton;
	}
	public updateDeletePosition() {
		const stage = this.closeButton.getStage()!;
		const workLayer = stage.getLayers().filter(c => c.name() === LAYER_WORK)[0];
		const tr = workLayer.getChildren(c => c.name() === TRANSFORMER)[0] as Konva.Transformer;
		const x = tr.x() / stage.scaleX();
		const y = tr.y() / stage.scaleY();
		this.closeButton.x(x - 15);
		this.closeButton.y(y - 15);
	}
	public show() { this.closeButton.show(); }
	public hide() { this.closeButton.hide(); }
}
