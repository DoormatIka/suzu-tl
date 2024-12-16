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
		this.stage.add(this.work_layer);
		this.stage.add(this.main_layer);

		this.transformer = new Konva.Transformer();
		this.work_layer.add(this.transformer);
	}
	getStage() {return this.stage;}

	public async loadImage(url: string) {
		const work_layer_children = this.work_layer.getChildren(c => c.name() === "bg");
		const c = work_layer_children.at(0);
		if (c) {
			this.work_layer.removeName("bg")
		}

		const imagefn = new Promise<Konva.Image>((res, rej) => {
			Konva.Image.fromURL(url, res, rej);
		});
		const img = await imagefn;
		img.name("bg");
		console.log(img.width(), img.height());
		this.stage.width(img.width());
		this.stage.height(img.height());

		this.work_layer.add(img);
		this.work_layer.draw();
	}
	public pushNode() {
		const a = this.nodes[0];
		const txt = new Konva.Text({text: "Hello!"});
	}
}


