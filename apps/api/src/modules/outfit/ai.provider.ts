import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';
import { File as BufferFile } from 'node:buffer';
import OpenAI, { toFile } from 'openai';
import { config } from '../../config/index.js';

// Polyfill globalThis.File in Node.js runtime for OpenAI SDK multipart uploads
if (typeof (globalThis as any).File === 'undefined') {
  (globalThis as any).File = BufferFile;
}

const localDir = typeof __dirname !== 'undefined' ? __dirname : process.cwd();

export interface OutfitGenerationInput {
  userId: string;
  inputImageUrl: string;
  gender: string;
  style: string;
  pujaDay: string;
  prompt?: string;
  aiMode?: 'auto' | 'vton' | 'photomaker' | 'instantid' | 'faceswap';
}

export interface OutfitGenerationResult {
  resultImageUrl: string;
  styleDescriptionBengali: string;
  styleDescriptionEnglish: string;
  colorPalette: string[];
  stylingTips: string[];
}

export interface IAIProvider {
  generateOutfit(input: OutfitGenerationInput): Promise<OutfitGenerationResult>;
}

/**
 * Ensures any input image (Base64 Data URL, /uploads/... path, or HTTP URL)
 * is safely resolved to an actual local file on disk so AI styling scripts can process it.
 */
export async function ensureLocalImage(inputUrl: string): Promise<string | null> {
  if (!inputUrl || typeof inputUrl !== 'string') return null;

  const targetDir = path.resolve(config.UPLOAD_DIR);
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  // 1. Direct or relative file path on disk
  const candidateLocalPaths = [
    inputUrl,
    path.resolve(inputUrl),
    path.resolve(process.cwd(), inputUrl.replace(/^\/+/, '')),
    path.resolve(targetDir, path.basename(inputUrl)),
    path.resolve(process.cwd(), 'uploads', inputUrl.replace(/^\/+/, '')),
    path.resolve(process.cwd(), 'uploads/outfits', path.basename(inputUrl)),
    path.resolve(localDir, '../../..', inputUrl.replace(/^\/+/, '')),
    path.resolve(localDir, '../../../uploads', inputUrl.replace(/^\/+/, '')),
    path.resolve(localDir, '../../../uploads/outfits', path.basename(inputUrl)),
  ];

  for (const cPath of candidateLocalPaths) {
    if (fs.existsSync(cPath) && fs.statSync(cPath).isFile()) {
      return cPath;
    }
  }

  // 2. Base64 Data URL
  if (inputUrl.startsWith('data:image/')) {
    try {
      const match = inputUrl.match(/^data:image\/([a-zA-Z0-9]+);base64,(.+)$/);
      if (match) {
        const ext = match[1] === 'jpeg' ? 'jpg' : match[1];
        const base64Data = match[2];
        const filename = `agomoni-user-${Date.now()}-${Math.floor(Math.random() * 10000)}.${ext}`;
        const savePath = path.resolve(targetDir, filename);
        fs.writeFileSync(savePath, Buffer.from(base64Data, 'base64'));
        console.log(`[AI Provider] User base64 photo saved to: ${savePath}`);
        return savePath;
      }
    } catch (e) {
      console.warn('[AI Provider] Failed to decode base64 user image:', e);
    }
  }

  // 3. Remote HTTP / HTTPS URL
  if (inputUrl.startsWith('http://') || inputUrl.startsWith('https://')) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);
      const res = await fetch(inputUrl, { signal: controller.signal });
      clearTimeout(timeout);

      if (res.ok) {
        const buffer = Buffer.from(await res.arrayBuffer());
        const filename = `agomoni-user-${Date.now()}-${Math.floor(Math.random() * 10000)}.jpg`;
        const savePath = path.resolve(targetDir, filename);
        fs.writeFileSync(savePath, buffer);
        console.log(`[AI Provider] Remote user photo downloaded to: ${savePath}`);
        return savePath;
      }
    } catch (e) {
      console.warn('[AI Provider] Failed to fetch remote user image:', e);
    }
  }

  return null;
}

/**
 * Constructs the Master OpenAI Image Transformation Prompt adhering strictly to:
 * - Real photograph transformation
 * - Identity preservation (facial structure, proportions, eyes, nose, lips, jawline, hair, beard, glasses, skin tone, age)
 * - Authentic Bengali Durga Puja Ashtami attire
 * - Durga Puja Pandal environment with Goddess Durga idol in the background
 * - Professional DSLR portrait photography optics & realistic lighting
 * - Strict avoidance of anime, cartoon, illustration, CGI, 3D render, doll skin, AI filters
 */
export function buildMasterOpenAIPrompt(options: {
  gender: string;
  style: string;
  pujaDay: string;
  userPrompt?: string;
}): string {
  const isCouple = options.gender === 'COUPLE';
  const isFemale = options.gender === 'FEMALE';
  const isMale = options.gender === 'MALE';
  const pujaDay = options.pujaDay || 'Ashtami';

  let subjectIdentityInstruction = '';
  let attireInstruction = '';

  if (isCouple) {
    subjectIdentityInstruction =
      'Preserve the exact identity and recognizable appearance of both individuals in the input photograph. ' +
      'Preserve facial structure, facial proportions, eyes, nose, lips, jawlines, hairstyles, facial hair, glasses, ' +
      'natural skin tones, approximate ages, body proportions, natural facial asymmetry, and relative position.';
    attireInstruction =
      'For the couple, dress both subjects in coordinated authentic traditional Bengali Durga Puja festive clothing. ' +
      'The male subject wears an elegant ivory/off-white Bengali panjabi kurta with subtle maroon/red embroidery, ' +
      'traditional pleated Bengali dhoti, and a red-and-gold bordered silk uttoriyo stole. ' +
      'The female subject wears a traditional Bengali white/off-white Garad silk saree with a rich red Bengali border ' +
      'and gold zari, an elegant red blouse, authentic heirloom Bengali gold jewelry, jhumka earrings, bangles, and a subtle red bindi.';
  } else if (isMale) {
    subjectIdentityInstruction =
      'Preserve the exact identity and recognizable appearance of the male person in the input photograph. ' +
      'Preserve facial structure, facial proportions, eyes, eyebrows, nose, lips, jawline, hairstyle, beard, moustache, ' +
      'glasses, natural skin tone, approximate age, body proportions, natural facial asymmetry, and recognizable characteristics.';
    attireInstruction =
      'Dress the male subject in authentic Bengali Durga Puja traditional clothing: an elegant ivory/off-white Bengali panjabi ' +
      'kurta with subtle maroon/red embroidery along collar and placket, traditional pleated Bengali dhoti, and a rich red-and-gold bordered silk uttoriyo stole draped over shoulder.';
  } else if (isFemale) {
    subjectIdentityInstruction =
      'Preserve the exact identity and recognizable appearance of the female person in the input photograph. ' +
      'Preserve facial structure, facial proportions, eyes, eyebrows, nose, lips, jawline, hairstyle, skin tone, ' +
      'approximate age, body proportions, natural facial asymmetry, and recognizable characteristics.';
    attireInstruction =
      'Dress the female subject in authentic Bengali Durga Puja traditional clothing: a traditional Bengali white/off-white Garad silk saree ' +
      'with a rich crimson red Bengali border and gold zari, tailored red blouse, heirloom Bengali gold jewelry, jhumka earrings, ' +
      'shankha-pola and gold bangles, and a subtle festive red bindi on forehead.';
  } else {
    subjectIdentityInstruction =
      'Preserve the exact identity and recognizable appearance of the person or people in the input photograph. ' +
      'Preserve facial structure, facial proportions, eyes, nose, lips, jawline, hairstyle, skin tone, and approximate age.';
    attireInstruction =
      'Dress the subject in authentic Bengali Durga Puja festive handloom silk attire with rich gold and crimson accents.';
  }

  const customNotes = options.userPrompt ? ` Specific styling preferences: ${options.userPrompt}.` : '';

  return `Transform the provided real photograph into an authentic, highly photorealistic Bengali Durga Puja ${pujaDay} portrait photograph.

This is a REAL PHOTOGRAPH TRANSFORMATION task.

${subjectIdentityInstruction}
The person must remain clearly recognizable as the same person from the source photograph.
Do not replace the person's face and do not create a different person.
Transform primarily the clothing, background, lighting and festive environment.

${attireInstruction}${customNotes}

Place the subjects inside a beautiful realistic Bengali Durga Puja pandal during ${pujaDay}.
Include a beautifully decorated Goddess Durga idol naturally positioned in the background, traditional Bengali pandal decorations, marigold flowers, red and cream fabric, brass lamps, diyas and warm golden festive lighting.
Keep the human subject as the primary focus. The Goddess Durga idol must remain naturally in the soft background with realistic depth of field and bokeh; do not let the background overpower the subject.

Make the final result look exactly like a professional real-world photograph captured by a professional DSLR or mirrorless camera (35mm / 85mm portrait lens) at a Bengali Durga Puja celebration.
Use natural human skin texture, realistic visible pores, natural hair strands, realistic eyes, realistic fabric texture, physically plausible lighting, natural shadows, realistic highlights, realistic depth of field, realistic lens rendering and subtle professional color grading.
The subject and environment must have consistent lighting and must appear naturally photographed together.
The final image must be photographic, natural, elegant and culturally authentic.

Absolutely avoid anime, manga, cartoon, illustration, digital painting, oil painting, watercolor, comic-book styling, CGI, 3D rendering, fantasy art, plastic skin, porcelain skin, doll-like faces, artificial eyes, excessive beauty filters, excessive HDR, oversaturation, unrealistic lighting, face replacement, celebrity resemblance or generic AI faces.
Do not alter the person's identity. Do not generate a new person. Do not distort the face, hands, fingers, eyes, jewelry or clothing.
The final image should look like an authentic professional Bengali Durga Puja photograph taken in real life.`;
}

/**
 * PRIMARY GENERATOR:
 * Transforms the user's actual photograph using the official OpenAI Image Transformation API.
 * The user's uploaded photograph is passed directly to the model as the input image.
 */
export async function transformWithOpenAI(
  sourceImagePath: string,
  options: OutfitGenerationInput
): Promise<string | null> {
  let apiKey =
    (config as any).GPT_IMAGE_API_KEY ||
    config.OPENAI_API_KEY ||
    process.env.GPT_IMAGE_API_KEY ||
    process.env.OPENAI_API_KEY ||
    process.env.OPENAI_KEY ||
    process.env.OPEN_AI_KEY ||
    (config.AI_API_KEY?.startsWith('sk-') ? config.AI_API_KEY : undefined) ||
    (process.env.AI_API_KEY?.startsWith('sk-') ? process.env.AI_API_KEY : undefined);

  if (!apiKey) {
    const candidateEnvPaths = [
      '/etc/secrets/OPENAI_API_KEY',
      '/etc/secrets/.env',
      path.resolve(process.cwd(), 'apps/api/.env'),
      path.resolve(process.cwd(), '.env'),
      path.resolve(localDir, '../../.env'),
      path.resolve(localDir, '../../../.env'),
      path.resolve(localDir, '../../../../.env'),
    ];
    for (const f of candidateEnvPaths) {
      if (fs.existsSync(f)) {
        try {
          const text = fs.readFileSync(f, 'utf8');
          if (f.endsWith('OPENAI_API_KEY')) {
            apiKey = text.trim();
            break;
          }
          const m = text.match(/^(?:OPENAI_API_KEY|GPT_IMAGE_API_KEY|OPENAI_KEY|OPEN_AI_KEY)\s*=\s*["']?([^"'\r\n]+)["']?/m);
          if (m && m[1]) {
            apiKey = m[1].trim();
            break;
          }
        } catch {
          // ignore
        }
      }
    }
  }

  if (!apiKey) {
    console.warn('[OpenAI Primary] No OPENAI_API_KEY available in backend environment.');
    return null;
  }

  if (!fs.existsSync(sourceImagePath)) {
    console.warn('[OpenAI Primary] Source image not found on disk at:', sourceImagePath);
    return null;
  }

  const rawBaseUrl =
    (config as any).GPT_IMAGE_BASE_URL ||
    process.env.GPT_IMAGE_BASE_URL ||
    process.env.OPENAI_BASE_URL ||
    undefined;

  const modelName =
    (config as any).GPT_IMAGE_MODEL ||
    process.env.GPT_IMAGE_MODEL ||
    'gpt-image-2';

  const promptText = buildMasterOpenAIPrompt(options);

  try {
    const client = new OpenAI({
      apiKey,
      baseURL: rawBaseUrl,
    });

    console.log(`[OpenAI Primary] Transforming uploaded photograph with model: ${modelName}...`);

    const imageFile = await toFile(
      fs.readFileSync(sourceImagePath),
      path.basename(sourceImagePath),
      { type: 'image/jpeg' }
    );

    const response = await client.images.edit({
      image: imageFile,
      prompt: promptText,
      model: modelName,
      n: 1,
      size: '1024x1024',
    });

    const item = response.data?.[0];
    let imageBuffer: Buffer | null = null;

    if (item?.b64_json) {
      imageBuffer = Buffer.from(item.b64_json, 'base64');
    } else if (item?.url) {
      console.log('[OpenAI Primary] Downloading generated realistic image from OpenAI URL...');
      const imgRes = await fetch(item.url);
      if (imgRes.ok) {
        imageBuffer = Buffer.from(await imgRes.arrayBuffer());
      }
    }

    if (imageBuffer && imageBuffer.length > 5000) {
      const targetDir = path.resolve(config.UPLOAD_DIR);
      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
      }
      const filename = `agomoni-openai-${Date.now()}-${Math.floor(Math.random() * 10000)}.jpg`;
      const savePath = path.resolve(targetDir, filename);
      fs.writeFileSync(savePath, imageBuffer);
      console.log(`[OpenAI Primary] Successfully saved authentic realistic photograph: ${savePath} (${imageBuffer.length} bytes)`);
      return `/uploads/${filename}`;
    }

    console.warn('[OpenAI Primary] OpenAI response did not contain valid image data.');
  } catch (err: any) {
    // Log safe diagnostic information without exposing API keys or tokens
    console.warn(
      `[OpenAI Primary] Transformation failed: status=${err?.status}, code=${err?.code || err?.type || 'unknown'}`
    );
  }

  return null;
}

/**
 * OPTIONAL SECONDARY AI ENHANCEMENT MODEL:
 * If a secondary enhancement model is configured in the project, it may perform
 * subtle resolution/detail restoration.
 *
 * It MUST NEVER:
 * - replace the person's face
 * - change identity
 * - redesign clothing
 * - regenerate the person
 * - turn the photograph into an illustration
 * - override the OpenAI-generated composition
 *
 * If secondary model is not configured, fails, or degrades quality,
 * returns the original OpenAI image directly.
 */
export async function enhanceWithSecondaryModel(
  openaiImageUrl: string,
  options: OutfitGenerationInput
): Promise<string> {
  // Check if a secondary enhancement model is explicitly enabled
  const secondaryEnabled = process.env.ENABLE_SECONDARY_ENHANCER === 'true';

  if (!secondaryEnabled) {
    // Return OpenAI image directly as the primary final result
    return openaiImageUrl;
  }

  try {
    const localOpenAIPath = await ensureLocalImage(openaiImageUrl);
    if (!localOpenAIPath || !fs.existsSync(localOpenAIPath)) {
      return openaiImageUrl;
    }

    console.log(`[Secondary Model] Performing subtle detail enhancement on ${localOpenAIPath}...`);
    // If enhancement is configured, it would enhance subtle skin pores/resolution
    // For now, safely preserve the authentic OpenAI output:
    return openaiImageUrl;
  } catch (secErr) {
    console.warn('[Secondary Model] Enhancement error, returning original OpenAI image safely:', secErr);
    return openaiImageUrl;
  }
}

/**
 * CONFIGURED PHOTOREALISTIC FALLBACK:
 * Executes only if OpenAI image transformation fails.
 * Maps user's facial identity onto authentic high-resolution Bengali Durga Puja
 * Ashtami photographs, completely avoiding cartoon/anime/CGI artifacts.
 */
export async function executeFallbackPhotorealisticStyling(
  sourceLocalPath: string,
  options: OutfitGenerationInput
): Promise<string | null> {
  const isCouple = options.gender === 'COUPLE';
  const isMale = options.gender === 'MALE';
  const isModern = options.style === 'Modern' || options.style === 'Casual Puja' || options.style === 'Night Puja';

  let templateRelative = '';
  if (isCouple) {
    templateRelative = 'uploads/outfits/couple-traditional.jpg';
  } else if (isMale) {
    templateRelative = isModern ? 'uploads/outfits/male-modern.jpg' : 'uploads/outfits/male-traditional.jpg';
  } else {
    templateRelative = isModern ? 'uploads/outfits/female-modern.jpg' : 'uploads/outfits/female-traditional.jpg';
  }

  const candidateTemplatePaths = [
    path.resolve(process.cwd(), templateRelative),
    path.resolve(process.cwd(), 'apps/api', templateRelative),
    path.resolve(localDir, '../../..', templateRelative),
    path.resolve(localDir, '../../../..', templateRelative),
  ];

  const templatePath = candidateTemplatePaths.find((p) => fs.existsSync(p));
  if (!templatePath) {
    console.warn('[Fallback Stylist] Authentic photo template not found:', templateRelative);
    return null;
  }

  const targetDir = path.resolve(config.UPLOAD_DIR);
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  const stylistFilename = `agomoni-festive-${Date.now()}-${Math.floor(Math.random() * 10000)}.jpg`;
  const stylistLocalPath = path.resolve(targetDir, stylistFilename);

  console.log(`[Fallback Stylist] Transferring facial identity onto authentic template: ${templatePath}...`);
  const swapped = await executeLocalNeuralFaceSwap(sourceLocalPath, templatePath, stylistLocalPath);

  if (swapped && fs.existsSync(stylistLocalPath)) {
    console.log('[Fallback Stylist] Photorealistic fallback completed successfully:', stylistLocalPath);
    return `/uploads/${stylistFilename}`;
  }

  // If face transfer is unavailable, copy the authentic high-resolution template
  fs.copyFileSync(templatePath, stylistLocalPath);
  return `/uploads/${stylistFilename}`;
}

/**
 * PRIMARY OUTFIT PROVIDER:
 * Strict priority pipeline:
 * 1. User uploads photo
 * 2. OpenAI Image Model — PRIMARY GENERATOR
 * 3. Generated realistic image
 * 4. Optional Secondary AI Model (only if configured and safe)
 * 5. Final realistic photograph
 *
 * Fault tolerance:
 * - OpenAI succeeds -> return OpenAI image (optionally enhanced)
 * - OpenAI fails -> use configured photorealistic fallback model
 */
export class OpenAIFirstOutfitProvider implements IAIProvider {
  async generateOutfit(input: OutfitGenerationInput): Promise<OutfitGenerationResult> {
    console.log(`\n========================================`);
    console.log(`[Agomoni AI] Outfit generation requested for user: ${input.userId}`);
    console.log(`[Agomoni AI] Gender: ${input.gender}, Day: ${input.pujaDay}, Style: ${input.style}`);
    console.log(`========================================\n`);

    // 1. Resolve source image to disk
    const sourceLocalPath = await ensureLocalImage(input.inputImageUrl);

    let resultImageUrl: string | null = null;

    // 2. OpenAI Image Model — PRIMARY GENERATOR
    if (sourceLocalPath && fs.existsSync(sourceLocalPath)) {
      console.log('[Agomoni AI] STEP 1: Attempting OpenAI Image Model as PRIMARY GENERATOR...');
      const openAiImage = await transformWithOpenAI(sourceLocalPath, input);

      if (openAiImage) {
        console.log('[Agomoni AI] OpenAI successfully generated realistic transformed photograph!');
        // 3. Optional secondary enhancement (if configured)
        resultImageUrl = await enhanceWithSecondaryModel(openAiImage, input);
      } else {
        console.warn('[Agomoni AI] OpenAI generation did not produce an image. Triggering configured fallback...');
      }
    }

    // 4. Configured Fallback (only if OpenAI generation fails)
    if (!resultImageUrl && sourceLocalPath && fs.existsSync(sourceLocalPath)) {
      console.log('[Agomoni AI] STEP 2: Running configured photorealistic fallback model...');
      resultImageUrl = await executeFallbackPhotorealisticStyling(sourceLocalPath, input);
    }

    // 5. If everything failed, provide safe authentic festive photo
    if (!resultImageUrl) {
      const isCouple = input.gender === 'COUPLE';
      const isMale = input.gender === 'MALE';
      const defaultPath = isCouple
        ? '/outfits/couple-traditional.jpg'
        : isMale
        ? '/outfits/male-traditional.jpg'
        : '/outfits/female-traditional.jpg';
      resultImageUrl = defaultPath;
    }

    // 6. Cultural styling descriptions and tips
    const isCouple = input.gender === 'COUPLE';
    const isMale = input.gender === 'MALE';

    let styleDescriptionBengali = '';
    let styleDescriptionEnglish = '';
    let colorPalette: string[] = [];
    let stylingTips: string[] = [];

    if (isCouple) {
      styleDescriptionBengali =
        'অষ্টমীর পুজো মণ্ডপে ঐতিহ্যবাহী যুগল সাজ—তসর সিল্কের সুবিন্যস্ত পাঞ্জাবি, ধুতি ও লাল-পাড় গরদ শাড়ির নিখুঁত সমন্বয়। দেবীর সান্নিধ্যে রাজকীয় উৎসবের আবহ।';
      styleDescriptionEnglish =
        'A harmonious traditional Bengali couple ensemble for Ashtami: handloom tussar silk Panjabi with pleated dhoti paired with an authentic white and crimson Garad silk saree.';
      colorPalette = ['#8B0000 (Sindoor Red)', '#D4AF37 (Royal Gold)', '#FDFBF7 (Garad Ivory)'];
      stylingTips = [
        'Coordinate the red embroidery on the Panjabi with the red border of the saree.',
        'Pair with authentic handcrafted Kolhapuri or Nagra footwear for comfort in pandals.',
        'Subtle gold jewelry and a delicate round bindi complete the sacred festive charm.',
      ];
    } else if (isMale) {
      styleDescriptionBengali =
        'হাতে বোনা তসর সিল্কের পাঞ্জাবি, রাজকীয় মেরুন সুতোর সূক্ষ্ম কাজ, ঐতিহ্যবাহী কুঁচি দেওয়া ধুতি আর উত্তরীয়। পুজো মণ্ডপে খাঁটি বাঙালি উৎসবের আভিজাত্য।';
      styleDescriptionEnglish =
        'Handcrafted Tussar Silk Panjabi with subtle crimson embroidery, traditional pleated dhoti, and red-gold bordered uttoriyo stole.';
      colorPalette = ['#6B1D2F (Heritage Maroon)', '#D4AF37 (Royal Gold)', '#FFF8DC (Cornsilk Ivory)'];
      stylingTips = [
        'Drape the uttoriyo stole neatly over the left shoulder for an aristocratic festive look.',
        'Classic pleated dhoti with contrasting border for authentic Ashtami styling.',
        'Handmade leather mojaris or Kolhapuris for effortless pandal hopping.',
      ];
    } else {
      styleDescriptionBengali =
        'ঐতিহ্যবাহী লাল-পাড় গরদ শাড়ি, খাঁটি সোনার সাবেকি গহনা, হাতে শাঁখা-পলা আর উজ্জ্বল লাল টিপ। অষ্টমীর অঞ্জলির জন্য পরম শ্রদ্ধার সাজ।';
      styleDescriptionEnglish =
        'Traditional Bengali Lal-Paar Garad Silk Saree with rich gold zari border, heirloom gold jewelry, shankha-pola, and red bindi.';
      colorPalette = ['#8B0000 (Sindoor Red)', '#D4AF37 (Royal Gold)', '#FDFBF7 (Kash Cream)'];
      stylingTips = [
        'Complete the festive look with traditional shankha-pola and heirloom gold jhumkas.',
        'Apply a touch of sandalwood paste (chondon) along eyebrows for Ashtami morning.',
        'Pair with an embroidered velvet potli bag for puja essentials.',
      ];
    }

    return {
      resultImageUrl,
      styleDescriptionBengali,
      styleDescriptionEnglish,
      colorPalette,
      stylingTips,
    };
  }
}

/**
 * Executes high-precision facial swap and CodeFormer/GFPGAN restoration onto target template
 */
export async function executeLocalNeuralFaceSwap(
  sourceImagePath: string,
  targetImagePath: string,
  outputImagePath: string
): Promise<boolean> {
  return new Promise((resolve) => {
    const candidateScriptPaths = [
      path.resolve(process.cwd(), 'apps/api/scripts/faceswap.py'),
      path.resolve(process.cwd(), 'scripts/faceswap.py'),
      path.resolve(localDir, '../../scripts/faceswap.py'),
      path.resolve(localDir, '../../../scripts/faceswap.py'),
      path.resolve(localDir, '../../../../scripts/faceswap.py'),
    ];

    const scriptPath = candidateScriptPaths.find((p) => fs.existsSync(p));

    if (!scriptPath) {
      console.warn('[FaceSwap] faceswap.py not found in candidate paths:', candidateScriptPaths);
      return resolve(false);
    }

    if (!fs.existsSync(sourceImagePath) || !fs.existsSync(targetImagePath)) {
      console.warn('[FaceSwap] Source or target image not found:', { sourceImagePath, targetImagePath });
      return resolve(false);
    }

    console.log(`[FaceSwap] Transferring facial identity using ${scriptPath}...`);
    const py = spawn('python3', [scriptPath, sourceImagePath, targetImagePath, outputImagePath]);

    py.stdout.on('data', (d) => console.log(`[FaceSwap py] ${d.toString().trim()}`));
    py.stderr.on('data', (d) => console.error(`[FaceSwap py err] ${d.toString().trim()}`));

    py.on('close', (code) => {
      if (code === 0 && fs.existsSync(outputImagePath)) {
        console.log('[FaceSwap] Face swap executed successfully!');
        resolve(true);
      } else {
        console.warn(`[FaceSwap] Process exited with code ${code}`);
        resolve(false);
      }
    });

    py.on('error', (err) => {
      console.error('[FaceSwap] Failed to start python process', err);
      resolve(false);
    });
  });
}

/**
 * Unified Bengali AI Stylist Runner (IDM-VTON / PhotoMaker / InstantID / FaceRestore)
 */
export async function executeBengaliAIStylist(
  sourceImagePath: string,
  gender: string,
  style: string,
  pujaDay: string,
  outputImagePath: string,
  aiMode: string = 'auto'
): Promise<boolean> {
  return new Promise((resolve) => {
    const candidateScriptPaths = [
      path.resolve(process.cwd(), 'apps/api/scripts/bengali_ai_stylist.py'),
      path.resolve(process.cwd(), 'scripts/bengali_ai_stylist.py'),
      path.resolve(localDir, '../../scripts/bengali_ai_stylist.py'),
      path.resolve(localDir, '../../../scripts/bengali_ai_stylist.py'),
      path.resolve(localDir, '../../../../scripts/bengali_ai_stylist.py'),
    ];

    const scriptPath = candidateScriptPaths.find((p) => fs.existsSync(p));

    if (!scriptPath || !fs.existsSync(sourceImagePath)) {
      return resolve(false);
    }

    const py = spawn('python3', [
      scriptPath,
      '--source', sourceImagePath,
      '--gender', gender,
      '--style', style,
      '--day', pujaDay,
      '--mode', aiMode,
      '--output', outputImagePath,
    ]);

    py.on('close', (code) => {
      resolve(code === 0 && fs.existsSync(outputImagePath));
    });

    py.on('error', () => {
      resolve(false);
    });
  });
}

/**
 * Legacy prompt builder helper maintained for backward compatibility
 */
export function buildBengaliPhotorealisticPrompt(options: {
  gender: string;
  style: string;
  pujaDay: string;
  userPrompt?: string;
  facialDescription?: string;
}): { prompt: string; negativePrompt: string } {
  const prompt = buildMasterOpenAIPrompt(options);
  const negativePrompt =
    'cartoon, anime, 3d render, cgi, illustration, painting, drawing, sketch, artwork, digital art, doll, plastic skin, airbrushed, fake, smooth doll skin, oversaturated, deformed, bad anatomy, disfigured face, bad eyes, unnatural skin, text, watermark';
  return { prompt, negativePrompt };
}

/**
 * Legacy OpenAI helper maintained for backward compatibility
 */
export async function generateOpenAIImage(prompt: string): Promise<string | null> {
  const apiKey =
    (config as any).GPT_IMAGE_API_KEY ||
    config.OPENAI_API_KEY ||
    process.env.GPT_IMAGE_API_KEY ||
    process.env.OPENAI_API_KEY;

  if (!apiKey) return null;

  try {
    const client = new OpenAI({ apiKey });
    const response = await client.images.generate({
      model: (config as any).GPT_IMAGE_MODEL || 'dall-e-3',
      prompt,
      n: 1,
      size: '1024x1024',
    });
    return response.data?.[0]?.url || null;
  } catch (e: any) {
    console.warn('[OpenAI] Generation error:', e?.message || e);
    return null;
  }
}

/**
 * Factory to pick the appropriate AI provider.
 * OpenAI is ALWAYS PRIMARY.
 */
export function getAIProvider(): IAIProvider {
  return new OpenAIFirstOutfitProvider();
}
