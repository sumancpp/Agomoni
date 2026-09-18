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
 * - Real photograph in-place transformation (NOT text-to-image generation)
 * - Source image as absolute visual truth: identity, geometry, pose, body, face, framing, perspective
 * - Strict facial identity preservation: face is an immutable part of the source photograph
 * - Do NOT create a new person or generic model (no "handsome model" descriptions)
 * - Edit existing clothing into authentic Bengali Durga Puja Ashtami attire
 * - Adapt Durga Puja pandal environment with soft Goddess Durga idol bokeh around the subject
 * - Professional DSLR photography optics (natural skin texture, visible pores, physically plausible lighting)
 * - Absolute elimination of cartoon, anime, CGI, 3D render, beauty filters, or generic AI faces
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
      'CRITICAL IDENTITY AND POSE PRESERVATION: The persons in this image are immutable. Do not redraw, reinterpret, beautify, replace, or regenerate the people. ' +
      'Preserve the exact facial identities, facial geometry, facial proportions, eyes, eyebrows, noses, lips, jawlines, ears, hair, hairline, facial hair, skin tone, visible pores, and approximate ages of both individuals from the source image. ' +
      'Preserve their exact poses, arm positions, hand placements, body orientations, heights, shoulder widths, and overall composition.';
    attireInstruction =
      'Edit only the clothing and festive attire on their bodies: ' +
      'Transform the male subject clothing into an authentic ivory/off-white handloom silk Bengali Panjabi kurta with subtle maroon embroidery along collar and placket, traditional dhoti, and red-gold bordered uttoriyo stole draped over shoulder following his exact posture and body lines. ' +
      'Transform the female subject clothing into an authentic white/off-white Garad silk saree with rich red border and gold zari, red blouse, and traditional Bengali gold jewelry.';
  } else if (isMale) {
    subjectIdentityInstruction =
      'CRITICAL IDENTITY AND POSE PRESERVATION: The person in this photograph is the absolute visual truth. Do not create a new person and do not create a generic model. ' +
      'The person face is an immutable part of the source photograph. Do not redraw, regenerate, reinterpret, beautify, replace, or substantially modify the face. ' +
      'Keep the exact same face identity, facial structure, face shape, eyes, eyebrows, nose, lips, jawline, ears, hairstyle, hairline, beard/moustache, natural skin tone with visible pores, and approximate age. ' +
      'Keep the exact same body shape, shoulder width, height proportions, camera angle, head angle, body orientation, pose, hand position, and relative position in frame. ' +
      'Do NOT move his arms. Do NOT move his hands. Do NOT change his head position. Do NOT change his body orientation. Do NOT make him stand in a different pose. Do NOT create a centered studio portrait.';
    attireInstruction =
      'Transform the clothing directly on the person existing body and pose: ' +
      'Transform the current dark blue outfit (or whatever outfit the person is wearing) into an authentic traditional Bengali Durga Puja Ashtami ensemble: ' +
      'an elegant ivory/off-white handloom silk Bengali Panjabi kurta with subtle maroon/red embroidery along collar and placket, traditional pleated Bengali dhoti, and a rich red-and-gold bordered silk uttoriyo stole draped gracefully over his shoulder. ' +
      'The clothing must follow the person existing body silhouette, posture, and arm positions precisely.';
  } else if (isFemale) {
    subjectIdentityInstruction =
      'CRITICAL IDENTITY AND POSE PRESERVATION: The person in this photograph is the absolute visual truth. Do not create a new person and do not create a generic model. ' +
      'The person face is an immutable part of the source photograph. Do not redraw, regenerate, reinterpret, beautify, replace, or substantially modify the face. ' +
      'Keep the exact same face identity, facial structure, face shape, eyes, eyebrows, nose, lips, jawline, ears, hairstyle, hairline, natural skin tone with visible pores, and approximate age. ' +
      'Keep the exact same body shape, shoulder width, height proportions, camera angle, head angle, body orientation, pose, hand position, and relative position in frame.';
    attireInstruction =
      'Transform the clothing directly on the person existing body and pose: ' +
      'Transform the current outfit into an authentic traditional Bengali Durga Puja Ashtami ensemble: ' +
      'a traditional Bengali white/off-white Garad silk saree with a rich crimson red border and gold zari accents, tailored red blouse, heirloom Bengali gold jewelry, and a subtle festive red bindi.';
  } else {
    subjectIdentityInstruction =
      'The person face and body are immutable parts of the source photograph. Preserve the exact face identity, facial structure, eyes, nose, mouth, jawline, hairstyle, skin tone, body shape, pose, and framing.';
    attireInstruction =
      'Transform the current clothing into authentic Bengali Durga Puja festive handloom silk attire with rich gold and crimson accents, perfectly fitted to the existing body posture.';
  }

  const customNotes = options.userPrompt ? ` Additional styling preference: ${options.userPrompt}.` : '';

  return `This is a REAL PHOTOGRAPH EDITING AND TRANSFORMATION task.

TASK: "Change the clothes and festive environment of this photograph around the existing person."
DO NOT generate a new person. DO NOT create a generic Bengali male model. The exact person shown in the source image must remain recognizable.

${subjectIdentityInstruction}

CLOTHING TRANSFORMATION:
${attireInstruction}${customNotes}

BACKGROUND & FESTIVE ENVIRONMENT TRANSFORMATION:
Transform the surrounding environment into an authentic Bengali Durga Puja ${pujaDay} celebration.
Place the subject naturally in a Durga Puja pandal setting:
Include a beautifully decorated Goddess Durga idol naturally positioned in the background with soft depth of field and realistic bokeh, warm golden festive lighting, brass diyas, marigold flower garlands, and traditional red and cream fabric decorations.
The background must adapt around the original person silhouette without changing the subject framing, camera angle, or perspective.

AESTHETICS & OPTICS:
The final image must look like the original photograph was actually taken in real life at a Durga Puja celebration with a professional camera (DSLR portrait lens, 85mm f/1.8).
Use natural human skin texture, visible natural skin pores, natural hair strands, natural fabric drape, physically plausible festive lighting, natural shadows, and realistic highlights.

ABSOLUTE NEGATIVES:
Zero anime, zero cartoon, zero illustration, zero digital painting, zero CGI, zero 3D render, zero plastic or doll skin, zero AI beauty filters, zero face replacement, zero pose changes, zero generic AI faces. Preserve the authentic identity of the original person.`;
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

    const imageBuffer = fs.readFileSync(sourceImagePath);
    const ext = path.extname(sourceImagePath).toLowerCase();
    const mimeType = ext === '.png' ? 'image/png' : ext === '.webp' ? 'image/webp' : 'image/jpeg';

    const imageFile = await toFile(imageBuffer, path.basename(sourceImagePath), {
      type: mimeType,
    });

    console.log(`[OpenAI Primary] Transforming uploaded photograph with model: ${modelName}...`);
    console.log(`[OpenAI Primary] Attached file: ${imageFile.name} (${imageBuffer.length} bytes, MIME: ${mimeType})`);
    console.log(`[OpenAI Primary] Configuration: input_fidelity=high, quality=high, size=auto`);

    const response = await (client.images as any).edit({
      image: imageFile,
      prompt: promptText,
      model: modelName,
      input_fidelity: 'high',
      quality: 'high',
      output_format: 'png',
      size: 'auto',
      n: 1,
    });

    const item = response.data?.[0];
    let resultBuffer: Buffer | null = null;

    if (item?.b64_json) {
      resultBuffer = Buffer.from(item.b64_json, 'base64');
      console.log(`[OpenAI Primary] Received base64 image data (${resultBuffer.length} bytes)`);
    } else if (item?.url) {
      console.log(`[OpenAI Primary] Downloading generated realistic image from OpenAI URL: ${item.url.substring(0, 40)}...`);
      const imgRes = await fetch(item.url);
      if (imgRes.ok) {
        resultBuffer = Buffer.from(await imgRes.arrayBuffer());
      }
    }

    if (resultBuffer && resultBuffer.length > 5000) {
      const targetDir = path.resolve(config.UPLOAD_DIR);
      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
      }
      const filename = `agomoni-openai-${Date.now()}-${Math.floor(Math.random() * 10000)}.png`;
      const savePath = path.resolve(targetDir, filename);
      fs.writeFileSync(savePath, resultBuffer);
      console.log(`[OpenAI Primary] Successfully saved authentic realistic photograph: ${savePath} (${resultBuffer.length} bytes)`);
      return `/uploads/${filename}`;
    }

    console.warn('[OpenAI Primary] OpenAI response did not contain valid image data.');
  } catch (err: any) {
    const status = err?.status || err?.statusCode;
    const code = err?.code || err?.type || err?.error?.code || 'unknown';
    const message = err?.message || err?.error?.message || String(err);
    console.error(
      `[OpenAI Primary ERROR] OpenAI image edit API call failed!\n` +
      `  Status: ${status}\n` +
      `  Code: ${code}\n` +
      `  Message: ${message}`
    );
    if (code === 'credit_balance_exhausted' || status === 429) {
      console.error(
        `[OpenAI Primary ERROR] Your OpenAI account has 0 credits remaining (HTTP 429: credit_balance_exhausted).\n` +
        `  Please add billing credits at https://platform.openai.com/settings/organization/billing to enable OpenAI image transformations.`
      );
    }
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
    console.log('[Fallback Stylist] Photorealistic fallback completed successfully with transferred face:', stylistLocalPath);
    return `/uploads/${stylistFilename}`;
  }

  console.warn('[Fallback Stylist] Neural face transfer was unavailable. Refusing to copy template as it would replace identity.');
  return null;
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
    let openAiSucceeded = false;

    // 2. OpenAI Image Model — PRIMARY GENERATOR
    if (sourceLocalPath && fs.existsSync(sourceLocalPath)) {
      console.log('[Agomoni AI] STEP 1: Attempting OpenAI Image Model as PRIMARY GENERATOR...');
      const openAiImage = await transformWithOpenAI(sourceLocalPath, input);

      if (openAiImage) {
        console.log('[Agomoni AI] OpenAI successfully generated realistic transformed photograph!');
        openAiSucceeded = true;
        // 3. Optional secondary enhancement (temporarily disabled for pure OpenAI testing)
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

    // 5. If everything failed, do NOT return a photo of a stranger
    if (!resultImageUrl) {
      console.error('[Agomoni AI] Transformation failed: OpenAI did not generate an image and fallback identity transfer was unavailable.');
      throw new Error(
        'Image transformation could not be completed by OpenAI. If using OpenAI as primary generator, please ensure your OpenAI account has available credits.'
      );
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
