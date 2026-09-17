import fs from 'fs';
import path from 'path';

function createWavFile(filename, sampleRate, durationSec, generator) {
  const numChannels = 1;
  const bytesPerSample = 2;
  const totalSamples = Math.floor(sampleRate * durationSec);
  const dataSize = totalSamples * numChannels * bytesPerSample;
  const buffer = Buffer.alloc(44 + dataSize);

  // RIFF chunk descriptor
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write('WAVE', 8);

  // fmt sub-chunk
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(numChannels, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(sampleRate * numChannels * bytesPerSample, 28);
  buffer.writeUInt16LE(numChannels * bytesPerSample, 32);
  buffer.writeUInt16LE(bytesPerSample * 8, 34);

  // data sub-chunk
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataSize, 40);

  let offset = 44;
  for (let i = 0; i < totalSamples; i++) {
    const t = i / sampleRate;
    let sample = generator(t);
    sample = Math.max(-1, Math.min(1, sample));
    const intSample = Math.floor(sample * 32767);
    buffer.writeInt16LE(intSample, offset);
    offset += 2;
  }

  fs.writeFileSync(filename, buffer);
  console.log(`Generated ${filename} (${durationSec}s, ${(buffer.length / 1024).toFixed(1)} KB)`);
}

const sampleRate = 44100;
const outputDir = path.resolve(process.cwd(), 'apps/web/public/audio');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// 1. Traditional Bengali Dhak Rhythm (Ta-khi-ta-khi-tin-tin)
createWavFile(path.join(outputDir, 'dhak_beats.wav'), sampleRate, 12, (t) => {
  const barTime = t % 2.0;
  let signal = 0;

  const hitTimes = [0.0, 0.25, 0.5, 0.75, 1.0, 1.25, 1.5, 1.75];
  const hitFrequencies = [110, 140, 110, 165, 220, 140, 110, 260];
  const hitVolumes = [1.0, 0.6, 0.9, 0.7, 0.8, 0.6, 1.0, 0.9];

  for (let i = 0; i < hitTimes.length; i++) {
    const dt = barTime - hitTimes[i];
    if (dt >= 0 && dt < 0.22) {
      const decay = Math.exp(-dt * 22);
      const freq = hitFrequencies[i] * Math.exp(-dt * 8);
      const drumOsc = Math.sin(2 * Math.PI * freq * dt);
      const kashimClack = Math.sin(2 * Math.PI * 1800 * dt) * Math.exp(-dt * 45) * 0.3;
      signal += (drumOsc * 0.7 + kashimClack) * decay * hitVolumes[i];
    }
  }

  const rustle = (Math.random() * 2 - 1) * 0.02;
  return (signal * 0.8 + rustle);
});

// 2. Autumn Shehnai & Morning Flute Melody
createWavFile(path.join(outputDir, 'autumn_shehnai.wav'), sampleRate, 16, (t) => {
  const tanpura = (Math.sin(2 * Math.PI * 130.81 * t) * 0.15 +
                   Math.sin(2 * Math.PI * 196.00 * t) * 0.12 +
                   Math.sin(2 * Math.PI * 261.63 * t) * 0.08);

  const melodyNotes = [261.63, 277.18, 329.63, 349.23, 392.00, 415.30, 493.88, 523.25];
  const step = Math.floor((t * 1.5) % melodyNotes.length);
  const noteFreq = melodyNotes[step];
  const noteDt = (t * 1.5) % 1.0;
  const envelope = Math.sin(Math.PI * noteDt);
  const vibrato = 1 + 0.02 * Math.sin(2 * Math.PI * 5 * t);

  const shehnai = (Math.sin(2 * Math.PI * noteFreq * vibrato * t) * 0.4 +
                   Math.sin(2 * Math.PI * noteFreq * 2 * vibrato * t) * 0.2 +
                   Math.sin(2 * Math.PI * noteFreq * 3 * vibrato * t) * 0.15);

  return (tanpura + shehnai * envelope * 0.6);
});

// 3. Agomoni & Mahalaya Morning Chants & Bell
createWavFile(path.join(outputDir, 'agomoni_melody.wav'), sampleRate, 14, (t) => {
  const shankhaTime = t % 7.0;
  let shankha = 0;
  if (shankhaTime < 4.0) {
    const sEnv = Math.sin((Math.PI * shankhaTime) / 4.0);
    const breath = (Math.random() * 2 - 1) * 0.08;
    shankha = (Math.sin(2 * Math.PI * 230 * shankhaTime) * 0.5 +
               Math.sin(2 * Math.PI * 460 * shankhaTime) * 0.25 + breath) * sEnv * 0.7;
  }

  const bellTime = t % 1.75;
  let bell = 0;
  if (bellTime < 1.2) {
    const bDecay = Math.exp(-bellTime * 4.5);
    bell = (Math.sin(2 * Math.PI * 1046.50 * bellTime) * 0.3 +
            Math.sin(2 * Math.PI * 2093.00 * bellTime) * 0.15 +
            Math.sin(2 * Math.PI * 3135.96 * bellTime) * 0.08) * bDecay;
  }

  const hum = Math.sin(2 * Math.PI * 110 * t) * 0.1;
  return (shankha + bell + hum);
});
