import Konva from "konva";

export async function loadKonvaImageFromURL(url: string): Promise<Konva.Image> {
	const base64 = await convertURLToBase64(url);
	const img = await loadKonvaImageFromBase64(base64);
	return img;
}

export async function convertURLToBase64(url: string) {
	const response = await fetch(url);
	if (!response.ok) {
		throw new Error(`Failed to fetch the URL: ${response.statusText}`);
	}
	return new Promise<string>((res, rej) => {
		const reader = new FileReader();
		response.blob()
			.then((v) => {
				reader.readAsDataURL(v);
				reader.onloadend = () => {
					res(reader.result as string);
				}
				reader.onerror = () => {
					rej(new Error("FileReader error"));
				}
			})
			.catch(rej);
	});
}

export async function loadKonvaImageFromBase64(base64: string): Promise<Konva.Image> {
	return new Promise<Konva.Image>((res, rej) => {
		const imageObj = new Image();
		imageObj.src = base64;
		imageObj.onload = () => {
			const yoda = new Konva.Image({image: imageObj});
			yoda.name("bg");
			yoda.id("bg");
			res(yoda);
		};
		imageObj.onerror = (err) => {rej(err)}
	});
}

