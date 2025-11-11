import * as THREE from "three";

export async function fetchMapTexture(latitude, longitude, zoom, API_KEY) {
    const url = `https://maps.googleapis.com/maps/api/staticmap?center=${latitude},${longitude}&zoom=${zoom}&size=1024x1024&maptype=satellite&key=${API_KEY}`;

    const response = await fetch(url);
    const blob = await response.blob();
    const imageBitmap = await createImageBitmap(blob);

    return new THREE.Texture(imageBitmap);
}
