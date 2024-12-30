import Konva from "konva";
import type { State } from "./state";

export class TextBox {
	private text: Konva.Text;

	constructor(config: Konva.TextConfig, private state: State) {
		this.text = new Konva.Text({ name: "text", ...config });
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
		this.text.on("dragmove", (e) => {
			/*
			const stage = e.target.getStage()!;
			const stageBox = stage.container().getBoundingClientRect();
			const stageTransform = stage.getAbsoluteTransform();
			const invertedTransform = stageTransform.copy().invert();
			const textAbsPos = this.text.absolutePosition();
			const relativePost = invertedTransform.point(textAbsPos);

			// doesn't work.
			const clampedX = Math.max(0, Math.min(relativePost.x, stageBox.x + stageBox.right));
			const clampedY = Math.max(0, Math.min(relativePost.y, stageBox.y + stageBox.bottom));
			this.text.x(clampedX);
			this.text.y(clampedY);
			*/
		})
		this.text.on("dragend", (e) => {this.state.updateNode(this.text)});
	}
	private doubleClick(e: Konva.KonvaEventObject<Konva.Text>) {
		const textNode = this.text;
		const stage = e.target.getStage()!;
		const textPosition = textNode.getAbsolutePosition();
		const stageBox = stage.container().getBoundingClientRect();

		const areaPosition = {
			x: stageBox.left + textPosition.x,
			y: Math.abs(stageBox.y + window.scrollY) + textPosition.y,
		};

		const textarea = document.createElement("textarea");
		document.body.appendChild(textarea);

		const fontSize = Math.min(textNode.fontSize() * (stage.scaleX() / 1.5), 30);

		textarea.value = textNode.text();
		textarea.style.position = "absolute";
		textarea.style.left = areaPosition.x + "px";
		textarea.style.top = areaPosition.y + "px";
		textarea.style.width = textNode.width().toString();
		textarea.style.fontSize = `${fontSize}px`;

		textarea.focus();

		textarea.addEventListener("keydown", (e) => {
			if (!e.shiftKey && e.key === "Enter") {
				textarea.blur();
			}
		});

		textarea.addEventListener("blur", () => {
			textNode.text(textarea.value);
			this.state.updateNode(textNode);
			document.body.removeChild(textarea);
		});
	}
}
