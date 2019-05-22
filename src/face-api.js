const axios = require('axios');
const {sleep} = require("./util");

const canvas = require('canvas');
const faceapi = require('face-api.js');
const {faceDetectionNet, faceDetectionOptions} = require('./faceDetection');

const FACE_API_ENDPOINT = process.env.FACE_API_ENDPOINT;
const FACE_API_KEY = process.env.FACE_API_KEY;

const { Canvas, Image, ImageData } = canvas;
faceapi.env.monkeyPatch({ Canvas, Image, ImageData });

let loadedModels = false;

const azure = axios.create({
    baseURL: FACE_API_ENDPOINT,
    params: {
        returnFaceId: 'false',
        returnFaceLandmarks: 'false',
        recognitionModel: 'recognition_02',
        returnFaceAttributes: 'age',
    },
    headers: {
        'Ocp-Apim-Subscription-Key': FACE_API_KEY,
        'Content-Type': 'application/json',
    }
});

async function processImageUrlAzure(imageUrl) {
    try {
        const res = await azure.post('/detect', {url: imageUrl});
        return res.data.map((result) => result.faceAttributes.age);
    } catch (err) {
        if (err.response.status === 429) {
            await sleep(60 * 1000);
            return await processImageUrlAzure(imageUrl);
        } else {
            console.error('An error occurred during the communication with Face API');
            return [];
        }
    }
}

async function processImageUrlLocal(imageUrl) {
    if (!loadedModels) {
        await faceDetectionNet.loadFromDisk('/home/marek/Projekty/iqos-age/data/weights');
        await faceapi.nets.faceLandmark68Net.loadFromDisk('/home/marek/Projekty/iqos-age/data/weights');
        await faceapi.nets.ageGenderNet.loadFromDisk('/home/marek/Projekty/iqos-age/data/weights');
        loadedModels = true;
    }

    const img = await canvas.loadImage(imageUrl);
    const detectionsWithAgeAndGender = await faceapi.detectAllFaces(img).withAgeAndGender();

    return detectionsWithAgeAndGender.map((result) => result.age);
}

module.exports = {processImageUrlAzure, processImageUrlLocal};