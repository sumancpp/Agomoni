import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';
import { config } from '../../config/index.js';

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

// High-Fidelity Neural Bengali AI Outfit Synthesizer
export async function generateNeuralOutfitImage(options: {
  gender: string;
  style: string;
  pujaDay: string;
  userPrompt?: string;
  facialDescription?: string;
}): Promise<string> {
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
      subject = 'an authentic portrait of a handsome 24-year-old Bengali Indian young man with natural groomed black hair, warm brown skin tone, confident festive smile';
    } else if (isFemale) {
      subject = 'an authentic portrait of a beautiful graceful 23-year-old Bengali Indian young woman with expressive dark eyes, natural black hair, radiant festive smile';
    } else {
      subject = 'an authentic portrait of a stylish young Indian person with a radiant warm smile';
    }
  }

  // 2. Attire & Styling details
  let attire = '';
  if (isFemale) {
    if (isDashami) {
      attire = 'celebrating Bijoya Dashami Sindoor Khela, wearing a traditional white and red silk Garad saree with gold zari border, playful touches of red vermilion sindoor on cheeks and forehead, gold jhumkas, shankha pola bangles, holding a brass puja thali';
    } else if (isAshtami) {
      attire = 'wearing a traditional Bengali Lal-Paar Garad silk saree in pure off-white and crimson red with intricate gold zari borders, authentic Bengali gold jewelry including sitahar necklace and jhumka earrings, shankha-pola red and white bangles, luminous red round bindi, delicate sandalwood chondon art along the brow, holding a brass dhunachi with fragrant incense smoke';
    } else if (isNight || isModern) {
      attire = 'wearing a glamorous contemporary royal midnight blue and gold Banarasi fusion silk saree, designer backless blouse, statement temple jewelry, jasmine floral gajra garland in hair, evening festival glamour';
    } else {
      attire = 'wearing an authentic handloom Bengali silk saree with rich gold and crimson zari embroidery, layered gold necklace, red bindi, alta decorated hands, traditional ethnic Bengali festival look';
    }
  } else if (isMale) {
    if (isDashami) {
      attire = 'celebrating Bijoya Dashami, wearing a crisp pristine ivory tussar silk Panjabi kurta with red thread work, exchanging warm festive greetings and sweets';
    } else if (isAshtami) {
      attire = 'wearing an authentic Bengali handloom tussar silk Panjabi kurta with crimson red and antique gold zardozi embroidery on collar and chest, traditional draped pleated maroon dhuti, silk uttorio stole draped elegantly over shoulder, holding a decorative puja brass pradeep';
    } else if (isNight || isModern) {
      attire = 'wearing a stylish contemporary Indo-Western royal navy blue Nehru vest jacket with embroidered mandarin collar over a tailored raw silk kurta and churidar pants, modern festive celebration';
    } else {
      attire = 'wearing a classic golden yellow and ivory muga silk kurta with intricate Kantha stitch embroidery, matching traditional pleated dhuti, authentic Bengali festival attire';
    }
  } else {
    attire = 'wearing a magnificent Bengali celebratory festive drape with artisanal kantha embroidery, royal autumn colors, and traditional gold accents';
  }

  const customNotes = options.userPrompt ? `, ${options.userPrompt}` : '';

  const fullPrompt = `${subject}, ${attire}${customNotes}, celebrating Durga Puja at a majestic illuminated Kolkata pandal with an artistic idol of Goddess Durga softly glowing in the background, warm festive bokeh, floating dhuna incense smoke, cinematic lighting, 8k resolution, masterpiece portrait photography, photorealistic, sharp focus, natural skin texture, cultural authenticity.`;

  const seed = Math.floor(Math.random() * 1000000);
  const encodedPrompt = encodeURIComponent(fullPrompt);

  const primaryUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=768&height=1024&model=flux&seed=${seed}&nologo=true`;
  const fallbackUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=768&height=1024&model=turbo&seed=${seed}&nologo=true`;

  console.log(`[AI Image] Synthesizing photorealistic Bengali outfit (seed=${seed}, gender=${options.gender}, day=${options.pujaDay})...`);

  // Try downloading image to local disk first
  const urls = [primaryUrl, fallbackUrl];
  for (const url of urls) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 9000);
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
          console.log(`[AI Image] Successfully saved to disk: ${savePath} (${buffer.length} bytes)`);
          return `/uploads/${filename}`;
        }
      }
    } catch (e: any) {
      console.warn(`[AI Image] Download from ${url.slice(0, 45)}... failed:`, e?.message || e);
    }
  }

  // If local save or fetch timed out, return direct neural AI image URL
  console.log('[AI Image] Returning direct neural AI image URL');
  return primaryUrl;
}

// Development / Fallback High-Fidelity Bengali AI Provider
export class DevelopmentMockProvider implements IAIProvider {
  async generateOutfit(input: OutfitGenerationInput): Promise<OutfitGenerationResult> {
    const isFemale = input.gender === 'FEMALE';
    const isMale = input.gender === 'MALE';
    const isModern = input.style === 'Modern' || input.style === 'Casual Puja';
    const isNight = input.style === 'Night Puja';

    let styleDescriptionEnglish = 'Traditional Bengali Lal-Paar Garad Saree with gold jewelry, alta, and red bindi.';
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
    } else {
      styleDescriptionEnglish = 'Fluid celebratory festive drape with artisanal kantha embroidery and rich autumn hues.';
      styleDescriptionBengali = 'উৎসবের আনন্দমুখর ফিউশন সাজ—কাঁথাস্টিচের সূক্ষ্ম কাজ ও শরতের উৎসবের রঙে রঙিন।';
      colorPalette = ['#D4AF37 (Gold)', '#8B0000 (Sindoor)', '#F5F5DC (Ivory)'];
      stylingTips = [
        'Artisanal handcrafted stole or shawl.',
        'Comfortable handcrafted footwear.',
      ];
    }

    // Always generate an authentic neural AI image
    let resultImageUrl = await generateNeuralOutfitImage({
      gender: input.gender,
      style: input.style,
      pujaDay: input.pujaDay,
      userPrompt: input.prompt,
    });

    // If source photo exists, try Bengali AI Stylist (IDM-VTON / PhotoMaker / InstantID / FaceRestore)
    try {
      let sourceLocalPath = '';
      if (input.inputImageUrl.startsWith('/uploads/')) {
        sourceLocalPath = path.resolve(config.UPLOAD_DIR, path.basename(input.inputImageUrl));
      }
      if (sourceLocalPath && fs.existsSync(sourceLocalPath)) {
        const stylistFilename = `agomoni-stylist-${Date.now()}.jpg`;
        const stylistLocalPath = path.resolve(config.UPLOAD_DIR, stylistFilename);
        const ok = await executeBengaliAIStylist(sourceLocalPath, input.gender, input.style, input.pujaDay, stylistLocalPath, input.aiMode);
        if (ok && fs.existsSync(stylistLocalPath)) {
          resultImageUrl = `/uploads/${stylistFilename}`;
        }
      }
    } catch (e) {
      console.warn('Bengali AI Stylist execution error in mock provider', e);
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
    const apiKey = config.QWEN_API_KEY || config.AI_API_KEY;

    if (!apiKey) {
      console.warn('QWEN_API_KEY not set in .env, generating with neural diffusion engine');
      return this.fallbackProvider.generateOutfit(input);
    }

    try {
      const genderWord = input.gender === 'MALE' ? 'Indian Bengali young man' : input.gender === 'FEMALE' ? 'Indian Bengali young woman' : 'Indian person';
      const prompt = `Hyperrealistic festive portrait of an ${genderWord} wearing an authentic Bengali ${input.style} outfit for Durga Puja celebrations on ${input.pujaDay}, preserving exact facial features, facial structure, skin tone, hair, and eye details from the reference image, intricate traditional fabric embroidery, rich silk textures, warm autumn golden light, Kolkata Durga Puja festive background, masterpiece photography, 8k resolution.`;

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
    const apiKey = config.AI_API_KEY;

    if (!apiKey) {
      console.warn('Gemini API key not set, using neural AI fallback');
      return this.fallbackProvider.generateOutfit(input);
    }

    try {
      // 1. Prepare image payload for Gemini Vision
      let imagePart: { inlineData: { mimeType: string; data: string } } | null = null;
      let sourceLocalPath = '';
      try {
        if (input.inputImageUrl.startsWith('data:image/')) {
          const mimeType = input.inputImageUrl.split(';')[0].split(':')[1];
          const base64 = input.inputImageUrl.split(',')[1];
          imagePart = { inlineData: { mimeType, data: base64 } };
        } else if (input.inputImageUrl.startsWith('/uploads/')) {
          const filename = path.basename(input.inputImageUrl);
          sourceLocalPath = path.resolve(config.UPLOAD_DIR, filename);
          if (fs.existsSync(sourceLocalPath)) {
            const buf = fs.readFileSync(sourceLocalPath);
            const ext = path.extname(sourceLocalPath).toLowerCase().replace('.', '');
            const mimeType = ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : 'image/jpeg';
            imagePart = { inlineData: { mimeType, data: buf.toString('base64') } };
          }
        } else if (input.inputImageUrl.startsWith('http')) {
          const imgRes = await fetch(input.inputImageUrl);
          if (imgRes.ok) {
            const buf = Buffer.from(await imgRes.arrayBuffer());
            const mimeType = imgRes.headers.get('content-type') || 'image/jpeg';
            imagePart = { inlineData: { mimeType, data: buf.toString('base64') } };
          }
        }
      } catch (imgErr) {
        console.warn('Could not load user photo for Gemini Vision analysis', imgErr);
      }

      // 2. Query Gemini for facial attributes and deep Bengali fashion styling
      const prompt = `You are a world-class celebrity stylist specialized in Bengali Durga Puja fashion.
Analyze the user requirements and photo (if provided):
- Gender: ${input.gender}
- Puja Day: ${input.pujaDay}
- Style Motif: ${input.style}
${input.prompt ? `- User Preferences: ${input.prompt}` : ''}

Respond with a JSON object containing:
1. personDescription: A concise 1-sentence visual description of the person in the photo (approximate age, skin tone, hair style, facial structure, expression) for an AI image generator. If no photo is present, describe an ideal charming Bengali festive model.
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

      let parsed: any = {};
      try {
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
          console.warn('Gemini 3.6 flash returned status:', geminiRes.status);
        }
      } catch (gErr) {
        console.warn('Gemini vision description call error', gErr);
      }

      // 3. Generate photorealistic Bengali attire using the neural AI image generator
      let resultImageUrl = await generateNeuralOutfitImage({
        gender: input.gender,
        style: input.style,
        pujaDay: input.pujaDay,
        userPrompt: input.prompt,
        facialDescription: parsed.personDescription,
      });

      // 4. If source photo exists, try running the identity-preserving Bengali AI Stylist / Face swap
      if (sourceLocalPath && fs.existsSync(sourceLocalPath)) {
        try {
          const stylistFilename = `agomoni-stylist-${Date.now()}.jpg`;
          const stylistLocalPath = path.resolve(config.UPLOAD_DIR, stylistFilename);
          console.log(`[GeminiOutfitProvider] Launching Bengali AI Stylist pipeline for ${sourceLocalPath} with mode=${input.aiMode || 'auto'}...`);
          const styled = await executeBengaliAIStylist(sourceLocalPath, input.gender, input.style, input.pujaDay, stylistLocalPath, input.aiMode);
          if (styled && fs.existsSync(stylistLocalPath)) {
            resultImageUrl = `/uploads/${stylistFilename}`;
            console.log('[GeminiOutfitProvider] Successfully generated photorealistic Bengali portrait:', resultImageUrl);
          }
        } catch (stylistErr) {
          console.warn('[GeminiOutfitProvider] Bengali AI Stylist step failed, keeping neural AI generation:', stylistErr);
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
    } catch (err) {
      console.error('Gemini outfit provider error, using fallback', err);
      return this.fallbackProvider.generateOutfit(input);
    }
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
    const scriptPath = path.resolve('./scripts/bengali_ai_stylist.py');

    if (!fs.existsSync(scriptPath)) {
      console.warn('[BengaliStylist] Script bengali_ai_stylist.py not found at', scriptPath);
      return resolve(false);
    }

    if (!fs.existsSync(sourceImagePath)) {
      console.warn('[BengaliStylist] Source image not found at', sourceImagePath);
      return resolve(false);
    }

    console.log(`[BengaliStylist] Invoking unified multi-model styling pipeline (mode=${aiMode})...`);
    const py = spawn('python3', [
      scriptPath,
      '--source', sourceImagePath,
      '--gender', gender,
      '--style', style,
      '--day', pujaDay,
      '--mode', aiMode,
      '--output', outputImagePath,
    ]);

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

// Local Neural Face Swap Runner using Python InsightFace & Inswapper ONNX
export async function executeLocalNeuralFaceSwap(
  sourceImagePath: string,
  targetImagePath: string,
  outputImagePath: string
): Promise<boolean> {
  return new Promise((resolve) => {
    const scriptPath = path.resolve('./scripts/faceswap.py');
    const modelPath = path.resolve('./models/inswapper_128.onnx');

    if (!fs.existsSync(modelPath)) {
      console.warn('[FaceSwap] Model inswapper_128.onnx not yet available at', modelPath);
      return resolve(false);
    }

    if (!fs.existsSync(sourceImagePath)) {
      console.warn('[FaceSwap] Source image not found at', sourceImagePath);
      return resolve(false);
    }

    if (!fs.existsSync(targetImagePath)) {
      console.warn('[FaceSwap] Target image not found at', targetImagePath);
      return resolve(false);
    }

    console.log(`[FaceSwap] Invoking neural face transfer...`);
    const py = spawn('python3', [scriptPath, sourceImagePath, targetImagePath, outputImagePath, modelPath]);

    py.stdout.on('data', (data) => console.log(`[FaceSwap py] ${data.toString().trim()}`));
    py.stderr.on('data', (data) => console.error(`[FaceSwap py err] ${data.toString().trim()}`));

    py.on('close', (code) => {
      if (code === 0 && fs.existsSync(outputImagePath)) {
        console.log('[FaceSwap] Successfully executed local neural face swap!');
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
  if (config.AI_PROVIDER === 'GEMINI' || Boolean(config.AI_API_KEY)) {
    return new GeminiOutfitProvider();
  }
  if (config.AI_PROVIDER === 'QWEN' || Boolean(config.QWEN_API_KEY)) {
    return new QwenImageProvider();
  }
  return new DevelopmentMockProvider();
}
