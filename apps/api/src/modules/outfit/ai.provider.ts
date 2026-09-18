import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';
import { config } from '../../config/index.js';

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

  // 1. Already a local uploaded file
  if (inputUrl.startsWith('/uploads/')) {
    const local = path.resolve(targetDir, path.basename(inputUrl));
    if (fs.existsSync(local)) return local;
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
      const timeout = setTimeout(() => controller.abort(), 8000);
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
 * Builds authentic, culturally grounded, strictly photorealistic DSLR prompts.
 * Explicitly avoids cartoon, illustration, or anime triggers.
 */
export function buildBengaliPhotorealisticPrompt(options: {
  gender: string;
  style: string;
  pujaDay: string;
  userPrompt?: string;
  facialDescription?: string;
}): { prompt: string; negativePrompt: string } {
  const isFemale = options.gender === 'FEMALE';
  const isMale = options.gender === 'MALE';
  const isModern = options.style === 'Modern' || options.style === 'Casual Puja';
  const isNight = options.style === 'Night Puja';
  const isAshtami = options.pujaDay === 'Ashtami' || options.style === 'Ashtami Special';
  const isDashami = options.pujaDay === 'Dashami';

  // 1. Person / Subject base
  let subject = options.facialDescription?.trim();
  if (!subject) {
    if (isMale) {
      subject = 'authentic candid color photograph of a real handsome 24-year-old Bengali Indian young man with natural skin texture, visible skin pores, clean groomed hair, natural warm skin tone, gentle festive smile';
    } else if (isFemale) {
      subject = 'authentic candid color photograph of a real beautiful 23-year-old Bengali Indian young woman with dark expressive eyes, natural skin texture with visible pores, radiant festive smile, delicate bindi';
    } else {
      subject = 'authentic candid color photograph of a stylish young Indian Bengali person with a warm festive smile';
    }
  } else {
    subject = `authentic candid color photograph of ${subject}`;
  }

  // 2. Attire & Styling details
  let attire = '';
  if (isFemale) {
    if (isDashami) {
      attire = 'celebrating Bijoya Dashami Sindoor Khela, wearing a traditional authentic white and red silk Garad saree with gold zari border, subtle playful touches of red vermilion sindoor on cheeks and forehead, gold jhumkas, red and white shankha pola bangles';
    } else if (isAshtami) {
      attire = 'wearing an authentic traditional Bengali Lal-Paar Garad silk saree in pure off-white and crimson red with intricate gold zari borders, authentic heirloom Bengali gold jewelry including sitahar necklace and jhumka earrings, shankha-pola bangles, luminous red round bindi, delicate sandalwood chondon art along eyebrows, holding a brass puja thali';
    } else if (isNight || isModern) {
      attire = 'wearing a glamorous contemporary royal midnight blue and gold Banarasi fusion silk saree, designer blouse, statement temple jewelry, jasmine floral gajra garland in hair, evening festival celebration';
    } else {
      attire = 'wearing an authentic handloom Bengali silk saree with rich gold and crimson zari embroidery, layered gold necklace, red bindi, alta decorated hands, traditional ethnic Bengali festival look';
    }
  } else if (isMale) {
    if (isDashami) {
      attire = 'celebrating Bijoya Dashami, wearing a crisp pristine ivory tussar silk Panjabi kurta with red thread work on collar, traditional pleated dhoti, exchanging warm festive greetings and sweets';
    } else if (isAshtami) {
      attire = 'wearing an authentic Bengali handloom tussar silk Panjabi kurta with crimson red and antique gold zardozi embroidery on collar and chest, traditional draped pleated maroon dhuti, silk uttorio stole draped elegantly over shoulder, holding a decorative puja brass pradeep';
    } else if (isNight || isModern) {
      attire = 'wearing a stylish contemporary Indo-Western royal navy blue Nehru vest jacket with embroidered mandarin collar over a tailored raw silk kurta and churidar pants, modern festive celebration';
    } else {
      attire = 'wearing a classic golden yellow and ivory muga silk kurta with intricate Kantha stitch embroidery, matching traditional pleated dhuti, authentic Bengali festival attire';
    }
  } else {
    attire = 'wearing a magnificent celebratory Bengali festive drape with artisanal kantha embroidery, royal autumn colors, and traditional gold accents';
  }

  const customNotes = options.userPrompt ? `, ${options.userPrompt}` : '';

  const prompt = `Hyperrealistic candid photograph, 35mm DSLR photography, ${subject}, ${attire}${customNotes}, celebrating Durga Puja at an illuminated Kolkata pandal with warm festive bokeh lights in the soft background, shot on Canon EOS R5 with 85mm f/1.4 lens, natural skin texture, visible pores, realistic eyes, cinematic ambient festive lighting, 8k resolution, photorealistic, uncompressed real photograph.`;

  const negativePrompt = 'cartoon, anime, 3d render, cgi, illustration, painting, drawing, sketch, artwork, digital art, doll, plastic skin, airbrushed, fake, smooth doll skin, oversaturated, deformed, bad anatomy, disfigured face, bad eyes, unnatural skin, text, watermark';

  return { prompt, negativePrompt };
}

/**
 * Hugging Face Serverless Inference: Generates ultra-realistic photographic portraits
 * using FLUX.1-schnell (the premier open-weights photorealism model).
 */
export async function generateHuggingFaceImage(prompt: string): Promise<string | null> {
  const token = config.HF_TOKEN || config.HUGGINGFACE_API_KEY || process.env.HF_TOKEN || process.env.HUGGINGFACE_API_KEY;
  if (!token) return null;

  const models = [
    'black-forest-labs/FLUX.1-schnell',
    'black-forest-labs/FLUX.1-dev',
    'stabilityai/stable-diffusion-xl-base-1.0',
  ];

  for (const model of models) {
    try {
      console.log(`[HuggingFace] Requesting ultra-realistic photographic inference with ${model}...`);
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 30000);

      const res = await fetch(`https://router.huggingface.co/hf-inference/models/${model}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          'x-wait-for-model': 'true',
        },
        body: JSON.stringify({
          inputs: prompt,
        }),
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (res.ok) {
        const buffer = Buffer.from(await res.arrayBuffer());
        if (buffer.length > 5000) {
          const filename = `agomoni-hf-${Date.now()}-${Math.floor(Math.random() * 10000)}.jpg`;
          const targetDir = path.resolve(config.UPLOAD_DIR);
          if (!fs.existsSync(targetDir)) {
            fs.mkdirSync(targetDir, { recursive: true });
          }
          const savePath = path.resolve(targetDir, filename);
          fs.writeFileSync(savePath, buffer);
          console.log(`[HuggingFace] Real DSLR photograph generated & saved: ${savePath} (${buffer.length} bytes)`);
          return `/uploads/${filename}`;
        }
      } else {
        const errText = await res.text();
        console.warn(`[HuggingFace] Model ${model} returned status ${res.status}:`, errText.slice(0, 150));
      }
    } catch (e: any) {
      console.warn(`[HuggingFace] Inference failed on ${model}:`, e?.message || e);
    }
  }

  return null;
}

/**
 * OpenAI DALL-E 3: Generates natural camera photographs with style: "natural"
 * preventing cartoon/airbrushed digital art styles.
 */
export async function generateOpenAIImage(prompt: string): Promise<string | null> {
  const apiKey = (config as any).GPT_IMAGE_API_KEY || config.OPENAI_API_KEY || process.env.GPT_IMAGE_API_KEY || process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  const rawBaseUrl = (config as any).GPT_IMAGE_BASE_URL || process.env.GPT_IMAGE_BASE_URL || process.env.OPENAI_BASE_URL || 'https://api.openai.com';
  const endpoint = rawBaseUrl.endsWith('/v1/images/generations')
    ? rawBaseUrl
    : `${rawBaseUrl.replace(/\/+$/, '')}/v1/images/generations`;
  const modelName = (config as any).GPT_IMAGE_MODEL || process.env.GPT_IMAGE_MODEL || 'dall-e-3';

  try {
    console.log(`[OpenAI/GPT-Image] Requesting image generation (${modelName}) from ${endpoint}...`);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 25000);

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: modelName,
        prompt,
        n: 1,
        size: '1024x1024',
        quality: 'standard',
        style: 'natural',
      }),
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (res.ok) {
      const data = (await res.json()) as any;
      const imageUrl = data.data?.[0]?.url;
      if (imageUrl) {
        const imgRes = await fetch(imageUrl);
        if (imgRes.ok) {
          const buffer = Buffer.from(await imgRes.arrayBuffer());
          const filename = `agomoni-openai-${Date.now()}.jpg`;
          const targetDir = path.resolve(config.UPLOAD_DIR);
          fs.writeFileSync(path.resolve(targetDir, filename), buffer);
          return `/uploads/${filename}`;
        }
        return imageUrl;
      }
    } else {
      console.warn('[OpenAI] DALL-E 3 error:', res.status, (await res.text()).slice(0, 200));
    }
  } catch (e: any) {
    console.warn('[OpenAI] Generation failed:', e?.message || e);
  }

  return null;
}

/**
 * High-Fidelity Photorealistic Bengali AI Outfit Synthesizer.
 * Cascades across Hugging Face FLUX, OpenAI DALL-E 3 Natural,
 * and Photorealistic Neural Diffusion with strict camera prompts.
 */
export async function generateNeuralOutfitImage(options: {
  gender: string;
  style: string;
  pujaDay: string;
  userPrompt?: string;
  facialDescription?: string;
}): Promise<string> {
  const { prompt } = buildBengaliPhotorealisticPrompt(options);

  // Tier 1: Hugging Face Serverless FLUX.1-schnell (Photorealistic open weights)
  const hfImage = await generateHuggingFaceImage(prompt);
  if (hfImage) {
    return hfImage;
  }

  // Tier 2: OpenAI DALL-E 3 with style: "natural"
  const openAiImage = await generateOpenAIImage(prompt);
  if (openAiImage) {
    return openAiImage;
  }

  // Tier 3: Neural Photorealism Engine (flux-realism / flux)
  const seed = Math.floor(Math.random() * 1000000);
  const encodedPrompt = encodeURIComponent(prompt);

  const realisticUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=768&height=1024&model=flux-realism&seed=${seed}&nologo=true`;
  const fluxUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=768&height=1024&model=flux&seed=${seed}&nologo=true`;

  console.log(`[AI Image] Synthesizing photorealistic Bengali outfit (seed=${seed}, gender=${options.gender}, day=${options.pujaDay})...`);

  const urls = [realisticUrl, fluxUrl];
  for (const url of urls) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 12000);
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeout);

      if (res.ok) {
        const buffer = Buffer.from(await res.arrayBuffer());
        if (buffer.length > 5000) {
          const filename = `agomoni-ai-${Date.now()}-${Math.floor(Math.random() * 10000)}.jpg`;
          const targetDir = path.resolve(config.UPLOAD_DIR);
          if (!fs.existsSync(targetDir)) {
            fs.mkdirSync(targetDir, { recursive: true });
          }
          const savePath = path.resolve(targetDir, filename);
          fs.writeFileSync(savePath, buffer);
          console.log(`[AI Image] Successfully saved photorealistic output: ${savePath} (${buffer.length} bytes)`);
          return `/uploads/${filename}`;
        }
      }
    } catch (e: any) {
      console.warn(`[AI Image] Download from ${url.slice(0, 45)}... failed:`, e?.message || e);
    }
  }

  // Tier 4: Fallback to authentic pre-rendered DSLR Bengali festival photograph (NEVER cartoon!)
  console.log('[AI Image] Fetch timed out, selecting authentic high-resolution Bengali festive photograph template...');
  const isFemale = options.gender === 'FEMALE';
  const isModern = options.style === 'Modern' || options.style === 'Casual Puja' || options.style === 'Night Puja';

  const templateRelative = isFemale
    ? (isModern ? 'uploads/outfits/female-modern.jpg' : 'uploads/outfits/female-traditional.jpg')
    : (isModern ? 'uploads/outfits/male-modern.jpg' : 'uploads/outfits/male-traditional.jpg');

  const candidateTemplatePaths = [
    path.resolve(process.cwd(), templateRelative),
    path.resolve(process.cwd(), 'apps/api', templateRelative),
    path.resolve(localDir, '../../..', templateRelative),
    path.resolve(localDir, '../../../..', templateRelative),
  ];

  for (const tPath of candidateTemplatePaths) {
    if (fs.existsSync(tPath)) {
      try {
        const filename = `agomoni-festive-${Date.now()}.jpg`;
        const destPath = path.resolve(config.UPLOAD_DIR, filename);
        fs.copyFileSync(tPath, destPath);
        console.log(`[AI Image] Copied authentic DSLR photo template: ${destPath}`);
        return `/uploads/${filename}`;
      } catch (copyErr) {
        console.warn('[AI Image] Template copy error:', copyErr);
      }
    }
  }

  return realisticUrl;
}

// Development / Fallback High-Fidelity Bengali AI Provider
export class DevelopmentMockProvider implements IAIProvider {
  async generateOutfit(input: OutfitGenerationInput): Promise<OutfitGenerationResult> {
    const isFemale = input.gender === 'FEMALE';
    const isMale = input.gender === 'MALE';
    const isModern = input.style === 'Modern' || input.style === 'Casual Puja';
    const isNight = input.style === 'Night Puja';

    let styleDescriptionEnglish = 'Traditional Bengali Lal-Paar Garad Saree with authentic gold jewelry, alta, and red bindi.';
    let styleDescriptionBengali = 'ঐতিহ্যবাহী লাল-পাড় গরদ শাড়ি, গালে চন্দনের ছোঁয়া, আলতা রাঙা হাত আর উজ্জ্বল লাল টিপ। অষ্টমীর অঞ্জলির জন্য সেরা সাজ।';
    let colorPalette = ['#8B0000 (Sindoor Red)', '#D4AF37 (Royal Gold)', '#FDFBF7 (Kash Cream)'];
    let stylingTips = [
      'Complete the look with traditional shankha-pola and subtle gold accents.',
      'Apply a touch of sandalwood paste (chondon) on forehead for Ashtami morning.',
      'Pair with a classic embroidered potli bag.',
    ];

    if (isMale) {
      if (isModern || isNight) {
        styleDescriptionEnglish = 'Contemporary Indo-Western Nehru jacket ensemble with embroidered mandarin collar for evening pandal hopping.';
        styleDescriptionBengali = 'আধুনিক ইন্দো-ওয়েস্টার্ন জহর কোট ও ফ্যাশনেবল কুর্তা সেট। নবমী বা সান্ধ্য প্যান্ডেল হপিংয়ের জন্য অত্যন্ত মানানসই।';
        colorPalette = ['#1A2B4C (Midnight Navy)', '#D4AF37 (Antique Gold)', '#E0D6C3 (Silk Ivory)'];
        stylingTips = [
          'Pair with leather loafers or handcrafted mojaris.',
          'Roll sleeves neatly with minimal wristwatch accessory.',
          'Comfortable for walking and long pandal hopping routes.',
        ];
      } else {
        styleDescriptionEnglish = 'Handloom Tussar Silk Kurta (Panjabi) with royal Maroon Dhuti and heritage gold-embroidered Nehru vest.';
        styleDescriptionBengali = 'হাতে বোনা তসর সিল্কের পাঞ্জাবি, মেরুন ধুতি আর সোনালী জরির জহর কোট। পুজো প্যান্ডেলে রাজকীয় ঐতিহ্যবাহী উপস্থিতি।';
        colorPalette = ['#6B1D2F (Heritage Maroon)', '#D4AF37 (Royal Gold)', '#FFF8DC (Cornsilk)'];
        stylingTips = [
          'Classic pleated dhuti with contrasting border.',
          'Handmade Kolhapuri or Bengali Nagra shoes.',
          'Traditional silk uttorio (stole) draped over the shoulder.',
        ];
      }
    } else if (isFemale) {
      if (isModern) {
        styleDescriptionEnglish = 'Contemporary fusion drape saree with chic designer blouse and statement temple jewellery.';
        styleDescriptionBengali = 'ফিউশন ডিজাইনার লুক—আধুনিক শৈলী আর ঐতিহ্যবাহী গহনার নিখুঁত মেলবন্ধন।';
        colorPalette = ['#2C1654 (Royal Purple)', '#D4AF37 (Muted Gold)', '#FF8C00 (Festive Amber)'];
        stylingTips = [
          'Statement oxidised silver or temple earrings.',
          'Sleek hair bun with jasmine floral gajra.',
          'Comfortable block heels for easy pandal exploration.',
        ];
      } else if (isNight) {
        styleDescriptionEnglish = 'Midnight festive silk ensemble with subtle zari work, tailor-made for evening lighting and pandal tours.';
        styleDescriptionBengali = 'নাইট প্যান্ডেল হপিংয়ের জন্য জমকালো শেডের সিল্ক শাড়ি ও সূক্ষ্ম জরির কাজ। রাতের আলোয় অসাধারণ উজ্জ্বলতা।';
        colorPalette = ['#101820 (Midnight Black)', '#F2AA4C (Warm Gold)', '#800020 (Burgundy)'];
        stylingTips = [
          'Smokey eye makeup and deep maroon lipstick.',
          'Layered choker necklace with matching bangles.',
          'Compact metallic clutch to keep essentials safe in crowds.',
        ];
      }
    }

    // Always generate an authentic photorealistic real image
    let resultImageUrl = await generateNeuralOutfitImage({
      gender: input.gender,
      style: input.style,
      pujaDay: input.pujaDay,
      userPrompt: input.prompt,
    });

    // If user provided a photo, ensure local path and try Bengali AI Stylist (IDM-VTON / PhotoMaker / InstantID)
    try {
      const sourceLocalPath = await ensureLocalImage(input.inputImageUrl);
      if (sourceLocalPath && fs.existsSync(sourceLocalPath)) {
        const stylistFilename = `agomoni-stylist-${Date.now()}.jpg`;
        const stylistLocalPath = path.resolve(config.UPLOAD_DIR, stylistFilename);
        console.log(`[DevelopmentMockProvider] Running Bengali AI Stylist for ${sourceLocalPath}...`);
        const ok = await executeBengaliAIStylist(sourceLocalPath, input.gender, input.style, input.pujaDay, stylistLocalPath, input.aiMode);
        if (ok && fs.existsSync(stylistLocalPath)) {
          resultImageUrl = `/uploads/${stylistFilename}`;
        } else {
          const isFemale = input.gender === 'FEMALE';
          const isModern = input.style === 'Modern' || input.style === 'Casual Puja' || input.style === 'Night Puja';
          const templateRelative = isFemale
            ? (isModern ? 'uploads/outfits/female-modern.jpg' : 'uploads/outfits/female-traditional.jpg')
            : (isModern ? 'uploads/outfits/male-modern.jpg' : 'uploads/outfits/male-traditional.jpg');
          const candidateTemplatePaths = [
            path.resolve(process.cwd(), templateRelative),
            path.resolve(process.cwd(), 'apps/api', templateRelative),
            path.resolve(localDir, '../../..', templateRelative),
            path.resolve(localDir, '../../../..', templateRelative),
          ];
          const templatePath = candidateTemplatePaths.find((p) => fs.existsSync(p));
          if (templatePath) {
            console.log(`[DevelopmentMockProvider] Direct faceswap fallback onto template: ${templatePath}...`);
            const swapped = await executeLocalNeuralFaceSwap(sourceLocalPath, templatePath, stylistLocalPath);
            if (swapped && fs.existsSync(stylistLocalPath)) {
              resultImageUrl = `/uploads/${stylistFilename}`;
            }
          }
        }
      }
    } catch (e) {
      console.warn('Bengali AI Stylist execution error in mock provider:', e);
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

// Qwen Image Model Provider (Alibaba Cloud DashScope / SiliconFlow)
export class QwenImageProvider implements IAIProvider {
  private fallbackProvider = new DevelopmentMockProvider();

  async generateOutfit(input: OutfitGenerationInput): Promise<OutfitGenerationResult> {
    const apiKey = (config as any).QWEN_IMAGE_API_KEY || config.QWEN_API_KEY || process.env.QWEN_IMAGE_API_KEY || config.AI_API_KEY;

    if (!apiKey) {
      console.warn('QWEN_API_KEY not set in .env, generating with neural diffusion engine');
      return this.fallbackProvider.generateOutfit(input);
    }

    try {
      const { prompt } = buildBengaliPhotorealisticPrompt({
        gender: input.gender,
        style: input.style,
        pujaDay: input.pujaDay,
        userPrompt: input.prompt,
      });

      const baseUrl = config.QWEN_BASE_URL || 'https://dashscope-intl.aliyuncs.com/api/v1/services/aigc/text2image/image-synthesis';
      const isSiliconFlow = baseUrl.includes('siliconflow') || baseUrl.includes('/v1/images/generations');

      let generatedImageUrl: string | null = null;

      if (isSiliconFlow) {
        const endpoint = baseUrl.endsWith('/v1/images/generations') ? baseUrl : `${baseUrl.replace(/\/+$/, '')}/v1/images/generations`;
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: config.QWEN_MODEL || 'Qwen/Qwen-Image',
            prompt,
            image_size: '1024x1024',
          }),
        });

        if (res.ok) {
          const data = (await res.json()) as any;
          generatedImageUrl = data.data?.[0]?.url || data.images?.[0]?.url;
        } else {
          console.error('SiliconFlow Qwen API error:', res.status, await res.text());
        }
      } else {
        const res = await fetch(baseUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
            'X-DashScope-Async': 'disable',
          },
          body: JSON.stringify({
            model: config.QWEN_MODEL || 'wanx-v1',
            input: {
              prompt,
              ref_img: input.inputImageUrl.startsWith('http') ? input.inputImageUrl : undefined,
            },
            parameters: {
              style: '<auto>',
              size: '1024*1024',
              n: 1,
            },
          }),
        });

        if (res.ok) {
          const data = (await res.json()) as any;
          generatedImageUrl = data.output?.results?.[0]?.url;
        } else {
          console.error('DashScope Qwen Image API error:', res.status, await res.text());
        }
      }

      if (generatedImageUrl) {
        const fallback = await this.fallbackProvider.generateOutfit(input);
        return {
          resultImageUrl: generatedImageUrl,
          styleDescriptionBengali: fallback.styleDescriptionBengali,
          styleDescriptionEnglish: fallback.styleDescriptionEnglish,
          colorPalette: fallback.colorPalette,
          stylingTips: fallback.stylingTips,
        };
      }
    } catch (err) {
      console.error('Qwen generation network error, utilizing neural diffusion fallback', err);
    }

    return this.fallbackProvider.generateOutfit(input);
  }
}

// Gemini Vision & Multimodal Fashion Transformation Provider
export class GeminiOutfitProvider implements IAIProvider {
  private fallbackProvider = new DevelopmentMockProvider();

  async generateOutfit(input: OutfitGenerationInput): Promise<OutfitGenerationResult> {
    const apiKey = config.AI_API_KEY || config.GEMINI_API_KEY;

    // 1. Resolve source image to disk immediately
    let sourceLocalPath: string | null = null;
    let imagePart: { inlineData: { mimeType: string; data: string } } | null = null;

    try {
      sourceLocalPath = await ensureLocalImage(input.inputImageUrl);
      if (sourceLocalPath && fs.existsSync(sourceLocalPath)) {
        const buf = fs.readFileSync(sourceLocalPath);
        const ext = path.extname(sourceLocalPath).toLowerCase().replace('.', '');
        const mimeType = ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : 'image/jpeg';
        imagePart = { inlineData: { mimeType, data: buf.toString('base64') } };
      }
    } catch (imgErr) {
      console.warn('Could not prepare user photo for Gemini Vision analysis', imgErr);
    }

    let parsed: any = {};

    // 2. Query Gemini for deep Bengali fashion styling & persona
    if (apiKey) {
      try {
        const prompt = `You are a world-class celebrity stylist specialized in Bengali Durga Puja fashion.
Analyze the user requirements and photo (if provided):
- Gender: ${input.gender}
- Puja Day: ${input.pujaDay}
- Style Motif: ${input.style}
${input.prompt ? `- User Preferences: ${input.prompt}` : ''}

Respond with a JSON object containing:
1. personDescription: A concise 1-sentence visual description of the person in the photo (approximate age, skin tone, hair style, facial structure, expression) for a photorealistic DSLR camera portrait. If no photo is present, describe an authentic charming real Bengali festive model.
2. styleDescriptionBengali: 2-3 culturally poetic sentences in Bengali describing the attire, fabric, drape, and why it fits this Puja day.
3. styleDescriptionEnglish: 2 sentences in English describing the complete look.
4. colorPalette: Array of 3 distinct color names with hex codes (e.g. ["#6B1D2F (Heritage Maroon)", ...]).
5. stylingTips: Array of 3 expert practical styling tips (jewelry, shoes, uttariya/stole, or grooming).

Return ONLY valid JSON.`;

        const contents: any[] = [];
        const parts: any[] = [];
        if (imagePart) {
          parts.push(imagePart);
        }
        parts.push({ text: prompt });
        contents.push({ parts });

        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${apiKey}`;
        const geminiRes = await fetch(geminiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents,
            generationConfig: { responseMimeType: 'application/json' },
          }),
        });

        if (geminiRes.ok) {
          const geminiData = (await geminiRes.json()) as any;
          const text = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text) parsed = JSON.parse(text);
        } else {
          console.warn('Gemini flash returned status:', geminiRes.status);
        }
      } catch (gErr) {
        console.warn('Gemini vision description call error:', gErr);
      }
    }

    // 3. Generate photorealistic Bengali attire (cascading through Hugging Face, OpenAI, and Neural Realism)
    let resultImageUrl = await generateNeuralOutfitImage({
      gender: input.gender,
      style: input.style,
      pujaDay: input.pujaDay,
      userPrompt: input.prompt,
      facialDescription: parsed.personDescription,
    });

    // 4. If source photo exists on disk, run identity-preserving Bengali AI Stylist (IDM-VTON / PhotoMaker / InstantID / FaceSwap)
    if (sourceLocalPath && fs.existsSync(sourceLocalPath)) {
      try {
        const stylistFilename = `agomoni-stylist-${Date.now()}.jpg`;
        const stylistLocalPath = path.resolve(config.UPLOAD_DIR, stylistFilename);
        console.log(`[GeminiOutfitProvider] Launching Bengali AI Stylist for ${sourceLocalPath} with mode=${input.aiMode || 'auto'}...`);
        const styled = await executeBengaliAIStylist(sourceLocalPath, input.gender, input.style, input.pujaDay, stylistLocalPath, input.aiMode);
        if (styled && fs.existsSync(stylistLocalPath)) {
          resultImageUrl = `/uploads/${stylistFilename}`;
          console.log('[GeminiOutfitProvider] Successfully generated personalized real Bengali portrait:', resultImageUrl);
        } else {
          const isFemale = input.gender === 'FEMALE';
          const isModern = input.style === 'Modern' || input.style === 'Casual Puja' || input.style === 'Night Puja';
          const templateRelative = isFemale
            ? (isModern ? 'uploads/outfits/female-modern.jpg' : 'uploads/outfits/female-traditional.jpg')
            : (isModern ? 'uploads/outfits/male-modern.jpg' : 'uploads/outfits/male-traditional.jpg');
          const candidateTemplatePaths = [
            path.resolve(process.cwd(), templateRelative),
            path.resolve(process.cwd(), 'apps/api', templateRelative),
            path.resolve(localDir, '../../..', templateRelative),
            path.resolve(localDir, '../../../..', templateRelative),
          ];
          const templatePath = candidateTemplatePaths.find((p) => fs.existsSync(p));
          if (templatePath) {
            console.log(`[GeminiOutfitProvider] Direct faceswap fallback onto template: ${templatePath}...`);
            const swapped = await executeLocalNeuralFaceSwap(sourceLocalPath, templatePath, stylistLocalPath);
            if (swapped && fs.existsSync(stylistLocalPath)) {
              resultImageUrl = `/uploads/${stylistFilename}`;
            }
          }
        }
      } catch (stylistErr) {
        console.warn('[GeminiOutfitProvider] Bengali AI Stylist step failed, keeping photorealistic neural generation:', stylistErr);
      }
    }

    const defaultBengali = input.gender === 'MALE'
      ? 'হাতে বোনা তসর সিল্কের পাঞ্জাবি, মেরুন ধুতি আর সোনালী জরির জহর কোট। পুজো প্যান্ডেলে রাজকীয় ঐতিহ্যবাহী উপস্থিতি।'
      : 'ঐতিহ্যবাহী লাল-পাড় গরদ শাড়ি, গালে চন্দনের ছোঁয়া, আলতা রাঙা হাত আর উজ্জ্বল লাল টিপ। অষ্টমীর অঞ্জলির জন্য সেরা সাজ।';
    const defaultEnglish = input.gender === 'MALE'
      ? 'Handloom Tussar Silk Kurta (Panjabi) with royal Maroon Dhuti and heritage gold-embroidered Nehru vest.'
      : 'Traditional Bengali Lal-Paar Garad Saree with gold jewelry, alta, and red bindi.';

    return {
      resultImageUrl,
      styleDescriptionBengali: parsed.styleDescriptionBengali || defaultBengali,
      styleDescriptionEnglish: parsed.styleDescriptionEnglish || defaultEnglish,
      colorPalette: parsed.colorPalette || ['#8B0000 (Sindoor Red)', '#D4AF37 (Royal Gold)', '#FDFBF7 (Kash Cream)'],
      stylingTips: parsed.stylingTips || [
        'Complete the look with traditional jewelry and subtle gold accents.',
        'Apply a touch of sandalwood paste (chondon) on forehead for puja morning.',
        'Pair with comfortable handcrafted footwear for pandal hopping.',
      ],
    };
  }
}

// Unified Bengali AI Stylist Runner (IDM-VTON / PhotoMaker / InstantID / FaceRestore)
export async function executeBengaliAIStylist(
  sourceImagePath: string,
  gender: string,
  style: string,
  pujaDay: string,
  outputImagePath: string,
  aiMode: string = 'auto'
): Promise<boolean> {
  return new Promise((resolve) => {
    // Dynamically locate bengali_ai_stylist.py across potential working directory structures
    const candidateScriptPaths = [
      path.resolve(process.cwd(), 'apps/api/scripts/bengali_ai_stylist.py'),
      path.resolve(process.cwd(), 'scripts/bengali_ai_stylist.py'),
      path.resolve(localDir, '../../scripts/bengali_ai_stylist.py'),
      path.resolve(localDir, '../../../scripts/bengali_ai_stylist.py'),
      path.resolve(localDir, '../../../../scripts/bengali_ai_stylist.py'),
    ];

    const scriptPath = candidateScriptPaths.find((p) => fs.existsSync(p));

    if (!scriptPath) {
      console.warn('[BengaliStylist] Script bengali_ai_stylist.py not found in any candidate path:', candidateScriptPaths);
      return resolve(false);
    }

    if (!fs.existsSync(sourceImagePath)) {
      console.warn('[BengaliStylist] Source image not found at', sourceImagePath);
      return resolve(false);
    }

    console.log(`[BengaliStylist] Invoking unified multi-model styling pipeline using ${scriptPath} (mode=${aiMode})...`);

    const hfToken = config.HF_TOKEN || config.HUGGINGFACE_API_KEY || process.env.HF_TOKEN || process.env.HUGGINGFACE_API_KEY || '';

    const py = spawn('python3', [
      scriptPath,
      '--source', sourceImagePath,
      '--gender', gender,
      '--style', style,
      '--day', pujaDay,
      '--mode', aiMode,
      '--output', outputImagePath,
    ], {
      env: {
        ...process.env,
        HF_TOKEN: hfToken,
        HUGGINGFACE_API_KEY: hfToken,
      },
    });

    py.stdout.on('data', (data) => console.log(`[BengaliStylist py] ${data.toString().trim()}`));
    py.stderr.on('data', (data) => console.error(`[BengaliStylist py err] ${data.toString().trim()}`));

    py.on('close', (code) => {
      if (code === 0 && fs.existsSync(outputImagePath)) {
        console.log('[BengaliStylist] Styling completed successfully!');
        resolve(true);
      } else {
        console.warn(`[BengaliStylist] Styling process exited with code ${code}`);
        resolve(false);
      }
    });

    py.on('error', (err) => {
      console.error('[BengaliStylist] Failed to start python process', err);
      resolve(false);
    });
  });
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

    const hfToken = config.HF_TOKEN || config.HUGGINGFACE_API_KEY || process.env.HF_TOKEN || process.env.HUGGINGFACE_API_KEY || '';

    console.log(`[FaceSwap] Transferring facial identity using ${scriptPath}...`);
    const py = spawn('python3', [scriptPath, sourceImagePath, targetImagePath, outputImagePath], {
      env: {
        ...process.env,
        HF_TOKEN: hfToken,
        HUGGINGFACE_API_KEY: hfToken,
      },
    });

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

// Factory to pick the appropriate AI provider
export function getAIProvider(): IAIProvider {
  // If user requested or configured Hugging Face, OpenAI, or Gemini, route through GeminiOutfitProvider
  // which integrates Hugging Face FLUX.1-schnell and OpenAI DALL-E 3
  if (
    config.AI_PROVIDER === 'HUGGINGFACE' ||
    config.AI_PROVIDER === 'OPENAI' ||
    config.AI_PROVIDER === 'GEMINI' ||
    config.AI_PROVIDER === 'AUTO' ||
    Boolean(config.HF_TOKEN || config.HUGGINGFACE_API_KEY) ||
    Boolean(config.OPENAI_API_KEY) ||
    Boolean(config.AI_API_KEY || config.GEMINI_API_KEY)
  ) {
    return new GeminiOutfitProvider();
  }

  if (config.AI_PROVIDER === 'QWEN' || Boolean(config.QWEN_API_KEY)) {
    return new QwenImageProvider();
  }

  return new DevelopmentMockProvider();
}
