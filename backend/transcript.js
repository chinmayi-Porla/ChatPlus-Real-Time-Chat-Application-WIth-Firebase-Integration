// Imports the Google Cloud client library
const speech = require('@google-cloud/speech').v1p1beta1;

// Try to load config keys, use defaults if not available
let configKeys;
try {
    configKeys = require("./configKeys");
} catch (error) {
    console.log("Warning: configKeys.js not found in transcript.js, using default values");
    configKeys = {
        gcsUriLink: "gs://your-project-id.appspot.com"
    };
}

// Creates a client with error handling
let client;
try {
    client = new speech.SpeechClient({ keyFilename: "./audio_transcript.json" });
    // Test if the client is working by checking if it has the required methods
    if (!client.recognize || !client.longRunningRecognize) {
        throw new Error("Invalid Speech client");
    }
} catch (error) {
    console.log("Warning: Could not initialize Speech client with key file:", error.message);
    // Try to use default credentials
    try {
        client = new speech.SpeechClient();
        if (!client.recognize || !client.longRunningRecognize) {
            throw new Error("Invalid Speech client with default credentials");
        }
    } catch (defaultError) {
        console.log("Warning: Could not initialize Speech client with default credentials:", defaultError.message);
        client = null;
    }
}

async function textToAudio(audioName, isShort, supportWebM = false) {
    // If client is not available, return a placeholder message
    if (!client) {
        console.log("Speech client not available, returning placeholder transcript");
        return "Audio transcript not available - credentials not configured";
    }

    // The path to the remote LINEAR16 file
    const gcsUri = configKeys.gcsUriLink + "/audios/" + audioName;

    // The audio file's encoding, sample rate in hertz, and BCP-47 language code
    const audio = {
        uri: gcsUri,
    };
    const config = {
        encoding: "MP3",
        sampleRateHertz: 48000,
        languageCode: 'en-US',
        alternativeLanguageCodes: ['es-ES', 'fr-FR']
    };
    console.log("audio config: ", config);
    const request = {
        audio: audio,
        config: config,
    };

    try {
        // Detects speech in the audio file
        if (isShort) {
            const [response] = await client.recognize(request);
            return response.results.map(result => result.alternatives[0].transcript).join('\n');
        }
        const [operation] = await client.longRunningRecognize(request);
        const [response] = await operation.promise().catch(e => console.log("response promise error: ", e));
        return response.results.map(result => result.alternatives[0].transcript).join('\n');
    } catch (error) {
        console.log("Error in textToAudio:", error.message);
        return "Error transcribing audio: " + error.message;
    }
}

module.exports = textToAudio;