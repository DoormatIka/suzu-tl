import Konva from "konva";
import { v7 as uuidv7 } from "uuid";

export async function loadImage(url: string): Promise<Konva.Image> {
	const imagefn = new Promise<Konva.Image>((res, rej) => {
		Konva.Image.fromURL(url, res, rej);
	});
	const img = await imagefn;
	img.name("bg");
	img.id(uuidv7());
	return img;
}
