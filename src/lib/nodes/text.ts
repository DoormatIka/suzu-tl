import Konva from "konva";
import {CloseButton} from "./closebutton";

export class TextBox {
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