import { INTERVIEW_SPEECH_CONFIG } from './src/config/speech';
import { getInterviewSpeechAuthorization } from './src/services/speechTokenManager';

async function testVoice(voiceName: string) {
  try {
    const auth = await getInterviewSpeechAuthorization("test-interview-id");
    const ssml = `<speak version='1.0' xmlns='http://www.w3.org/2001/10/synthesis' xmlns:mstts='http://www.w3.org/2001/mstts' xml:lang='vi-VN'><voice name='${voiceName}'>Hãy thử nói tiếng Việt kết hợp React và Node JS nhé.</voice></speak>`;

    const response = await fetch(
      `https://${auth.region}.tts.speech.microsoft.com/cognitiveservices/v1`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${auth.token}`,
          'Content-Type': 'application/ssml+xml',
          'X-Microsoft-OutputFormat': 'audio-24khz-160kbitrate-mono-mp3',
          'User-Agent': 'NexoraMobile',
        },
        body: ssml,
      }
    );
    console.log(`Voice ${voiceName} returned status: ${response.status}`);
  } catch (err) {
    console.error(err);
  }
}

testVoice('en-US-AvaMultilingualNeural');
testVoice('en-US-JennyMultilingualNeural');
testVoice('vi-VN-HoaiMyNeural');
