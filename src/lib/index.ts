import Konva from "konva";

type TextSave = Partial<Konva.TextConfig> & { type: "text" };
type ImageSave = Partial<Konva.ImageConfig> & { type: "image" };

type NodeSave = TextSave | ImageSave;

export class State {
	private nodes: NodeSave[] = [];
	private stage: Konva.Stage;
	private main_layer: Konva.Layer;
	private work_layer: Konva.Layer;
	private transformer: Konva.Transformer;

	constructor(id?: string) {
		this.stage = new Konva.Stage({
			container: id ?? "container",
			width: 100,
			height: 100,
		});
		this.main_layer = new Konva.Layer();
		this.work_layer = new Konva.Layer();
		this.stage.add(this.main_layer);
		this.stage.add(this.work_layer);

		this.transformer = new Konva.Transformer({
			padding: 5,
			flipEnabled: false,
		});
		this.work_layer.add(this.transformer);
	}
	getStage() {return this.stage;}
	public setStageClick() {
		this.stage.on('click tap', (e) => {
			const tr = this.transformer;
			if (e.target.getClassName() === "Image") {
				tr.nodes([]);
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
		});
	}

	public async loadImage(url: string) {
		const work_layer_children = this.main_layer.getChildren(c => c.name() === "bg");
		const c = work_layer_children.at(0);
		if (c) {
			this.main_layer.clear();
		}

		const imagefn = new Promise<Konva.Image>((res, rej) => {
			Konva.Image.fromURL(url, res, rej);
		});
		const img = await imagefn;
		img.name("bg");
		this.stage.width(img.width());
		this.stage.height(img.height());

		this.main_layer.add(img);
		this.main_layer.draw();
	}
	public pushText(x: number, y: number) {
		const txt = new Text({
			x: x,
			y: y,
			text: "Hello!",
			fontSize: 30,
			draggable: true,
			padding: 5,
		});
		txt.setBackgroundFill(255, 255, 255, 0.8);
		this.main_layer.add(txt.getText());
	}
}

class Text {
	private text: Konva.Text;
	constructor(config: Konva.TextConfig) {
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
	}
	private doubleClick(e: Konva.KonvaEventObject<Konva.Text>) {
		const textNode = this.text;
		const stage = e.target.getStage()!;
		const textPosition = textNode.getAbsolutePosition();
		const stageBox = stage.container().getBoundingClientRect();

		const areaPosition = {
			x: stageBox.left + textPosition.x,
			y: Math.abs(stageBox.top) - window.scrollY + textPosition.y,
			// tried my best to account for small screens with big images.
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
