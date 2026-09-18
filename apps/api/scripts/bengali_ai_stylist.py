import sys
import os
import shutil
import time
import argparse
from gradio_client import Client, handle_file

# Authentic Bengali Festive Dress Prompts & Descriptions
BENGALI_STYLES = {
    'MALE': {
        'Traditional': {
            'garment_template': 'uploads/outfits/male-traditional.jpg',
            'garment_des': 'Traditional Indian Bengali festive cream tussar silk kurta panjabi with royal maroon zardozi embroidery and maroon silk uttoriyo stole',
            'photomaker_prompt': 'a raw 35mm DSLR color photograph of an Indian Bengali man img wearing traditional Bengali embroidered tussar silk kurta panjabi and dhuti with silk stole at Kolkata Durga Puja pandal, realistic skin texture with visible pores, sharp facial focus, festive warm lights, authentic Indian festival photography, 8k resolution, uncompressed photo',
            'instantid_prompt': 'photorealistic 8k DSLR portrait photograph of Indian Bengali man wearing authentic royal embroidered tussar silk kurta panjabi at Kolkata Durga Puja pandal, highly detailed, realistic skin texture, natural lighting, true to life photo',
        },
        'Modern': {
            'garment_template': 'uploads/outfits/male-modern.jpg',
            'garment_des': 'Modern Indo-Western midnight blue Nehru jacket with embroidered mandarin collar over silk kurta',
            'photomaker_prompt': 'a raw 35mm DSLR color photograph of an Indian Bengali man img wearing stylish modern Bengali Indo-Western Nehru jacket ensemble at illuminated Durga Puja pandal at night, natural skin pores, sharp details, candid festival photography, 8k resolution',
            'instantid_prompt': 'photorealistic DSLR portrait of Indian man in modern navy blue designer Nehru jacket at Kolkata Durga Puja, natural skin texture, sharp focus, 8k resolution, real life photo',
        },
        'Ashtami Special': {
            'garment_template': 'uploads/outfits/male-traditional.jpg',
            'garment_des': 'Heritage Ashtami morning handloom silk panjabi with red-gold borders and traditional pleated dhoti',
            'photomaker_prompt': 'a raw 35mm DSLR color photograph of an Indian Bengali man img wearing authentic Bengali handloom silk kurta for Ashtami Anjali at Durga Puja mandap, warm morning festival light, realistic skin texture, sharp focus, 8k, authentic photo',
            'instantid_prompt': 'photorealistic 8k portrait of Bengali man in cream and maroon silk kurta at Durga Puja Ashtami ceremony, high detail, realistic skin texture, natural camera shot',
        }
    },
    'FEMALE': {
        'Traditional': {
            'garment_template': 'uploads/outfits/female-traditional.jpg',
            'garment_des': 'Traditional Bengali Lal-Paar white Garad silk saree with red and gold zari border, gold temple jewelry and red bindi',
            'photomaker_prompt': 'a raw 35mm DSLR color photograph of an Indian Bengali woman img wearing traditional Bengali Lal-Paar Garad silk saree with red border and gold jewelry at Kolkata Durga Puja pandal, realistic skin texture with pores, sharp focus, 8k resolution, authentic festival photo',
            'instantid_prompt': 'photorealistic 8k DSLR portrait of Indian Bengali woman wearing authentic red and white Garad silk saree with gold necklace and red bindi at Durga Puja pandal, highly detailed, realistic skin texture, natural camera photo',
        },
        'Modern': {
            'garment_template': 'uploads/outfits/female-modern.jpg',
            'garment_des': 'Modern designer festive fusion silk saree with contemporary blouse and temple earrings',
            'photomaker_prompt': 'a raw 35mm DSLR color photograph of an Indian Bengali woman img wearing stylish modern festive silk saree at illuminated Durga Puja pandal, sharp focus, realistic skin texture with pores, candid festival photography, 8k',
            'instantid_prompt': 'photorealistic 8k portrait of young Indian woman in contemporary festive designer saree at Durga Puja festival, natural lighting, sharp focus, realistic skin, true to life photo',
        },
        'Ashtami Special': {
            'garment_template': 'uploads/outfits/female-traditional.jpg',
            'garment_des': 'Sacred Ashtami morning Lal-Paar Garad silk saree with shankha-pola, alta on hands, and glowing red bindi',
            'photomaker_prompt': 'a raw 35mm DSLR color photograph of an Indian Bengali woman img wearing traditional Bengali Lal-Paar saree for Ashtami morning Anjali at Durga Puja pandal, natural morning light, realistic skin texture with pores, sharp focus, 8k, real camera photo',
            'instantid_prompt': 'photorealistic 8k portrait of Bengali woman offering flowers in traditional red and white silk saree at Durga Puja mandap, realistic skin texture, real photograph',
        }
    }
}

NEGATIVE_PROMPT = (
    'cartoon, anime, 3d render, cgi, illustration, painting, drawing, artwork, digital art, '
    'doll, plastic skin, airbrushed, fake, smooth doll skin, oversaturated, deformed, bad anatomy, '
    'lowres, low quality, blurry, disfigured face, bad eyes, unnatural, extra limbs, painting frame, watermark'
)

def get_hf_client(space_name: str) -> Client:
    """Initialize Gradio Client with optional Hugging Face authentication token."""
    hf_token = os.environ.get('HF_TOKEN') or os.environ.get('HUGGINGFACE_API_KEY')
    if hf_token:
        try:
            return Client(space_name, token=hf_token)
        except Exception as e:
            print(f"[BengaliStylist] Authenticated Client init for {space_name} failed ({e}), trying public...")
    return Client(space_name)

def save_image_result(src_file: str, dst_file: str) -> bool:
    """Saves output image as clean, high-resolution JPEG, handling WebP and mode conversions."""
    try:
        os.makedirs(os.path.dirname(os.path.abspath(dst_file)), exist_ok=True)
        try:
            from PIL import Image
            with Image.open(src_file) as img:
                rgb_img = img.convert('RGB')
                rgb_img.save(dst_file, format='JPEG', quality=95, optimize=True)
            return True
        except Exception as pil_err:
            shutil.copy(src_file, dst_file)
            return True
    except Exception as e:
        print(f"[BengaliStylist] Failed to save result image: {e}")
        return False

def try_idm_vton(source_path: str, garment_path: str, garment_des: str, output_path: str) -> bool:
    """1. IDM-VTON (Virtual Try-On Network): Drapes authentic Bengali attire onto user while keeping 100% real face."""
    print("[BengaliStylist] Attempting yisol/IDM-VTON Virtual Try-On...")
    try:
        client = get_hf_client('yisol/IDM-VTON')
        res = client.predict(
            dict={'background': handle_file(source_path), 'layers': [], 'composite': None},
            garm_img=handle_file(garment_path),
            garment_des=garment_des,
            is_checked=True,
            is_checked_crop=False,
            denoise_steps=30,
            seed=42,
            api_name='/tryon'
        )
        if res and len(res) > 0:
            target_img = res[0] if isinstance(res, (list, tuple)) else res
            if target_img and os.path.exists(target_img):
                if save_image_result(target_img, output_path):
                    print(f"[BengaliStylist] SUCCESS with yisol/IDM-VTON: Saved to {output_path}")
                    return True
    except Exception as e:
        print(f"[BengaliStylist] IDM-VTON failed/busy: {e}")
    return False

def try_photomaker(source_path: str, prompt: str, output_path: str) -> bool:
    """2. TencentARC/PhotoMaker: Generates authentic candid Bengali festival portrait preserving user identity."""
    print("[BengaliStylist] Attempting TencentARC/PhotoMaker...")
    try:
        client = get_hf_client('TencentARC/PhotoMaker')
        res = client.predict(
            upload_images=[handle_file(source_path)],
            prompt=prompt,
            negative_prompt=NEGATIVE_PROMPT,
            style_name='Photographic (Default)',
            num_steps=30,
            style_strength_ratio=20,
            num_outputs=1,
            guidance_scale=5.0,
            seed=42,
            api_name='/generate_image'
        )
        if res and len(res) > 0:
            item = res[0]
            if isinstance(item, list) and len(item) > 0:
                img_file = item[0].get('image') if isinstance(item[0], dict) else item[0]
            elif isinstance(item, dict):
                img_file = item.get('image')
            else:
                img_file = item
            if img_file and os.path.exists(img_file):
                if save_image_result(img_file, output_path):
                    print(f"[BengaliStylist] SUCCESS with PhotoMaker: Saved to {output_path}")
                    return True
    except Exception as e:
        print(f"[BengaliStylist] PhotoMaker failed/busy: {e}")
    return False

def try_instantid(source_path: str, prompt: str, output_path: str) -> bool:
    """3. InstantX/InstantID: Zero-shot IdentityNet preserving facial keypoints."""
    print("[BengaliStylist] Attempting InstantX/InstantID...")
    try:
        client = get_hf_client('InstantX/InstantID')
        res = client.predict(
            face_image_path=handle_file(source_path),
            pose_image_path=handle_file(source_path),
            prompt=prompt,
            negative_prompt=NEGATIVE_PROMPT,
            style_name='(No style)',
            num_steps=30,
            identitynet_strength_ratio=0.85,
            adapter_strength_ratio=0.85,
            canny_strength=0.3,
            depth_strength=0.3,
            controlnet_selection=['depth'],
            guidance_scale=4.5,
            seed=100,
            scheduler='EulerDiscreteScheduler',
            enable_LCM=False,
            enhance_face_region=True,
            api_name='/generate_image'
        )
        if res and len(res) > 0:
            img_file = res[0] if isinstance(res, (list, tuple)) else res
            if img_file and os.path.exists(img_file):
                if save_image_result(img_file, output_path):
                    print(f"[BengaliStylist] SUCCESS with InstantID: Saved to {output_path}")
                    return True
    except Exception as e:
        print(f"[BengaliStylist] InstantID failed/busy: {e}")
    return False

def try_faceswap_restoration(source_path: str, template_path: str, output_path: str) -> bool:
    """4. High-Res CodeFormer/GFPGAN Face Swap onto authentic Bengali DSLR template."""
    print("[BengaliStylist] Attempting CodeFormer / GFPGAN Face Swap on Bengali Template...")
    try:
        client = get_hf_client('tonyassi/face-swap')
        res = client.predict(
            src_img=handle_file(source_path),
            dest_img=handle_file(template_path),
            api_name='/swap_faces'
        )
        res_file = res.get('path') if isinstance(res, dict) else res
        if res_file and isinstance(res_file, str) and os.path.exists(res_file):
            if save_image_result(res_file, output_path):
                print(f"[BengaliStylist] SUCCESS with CodeFormer Face Swap: Saved to {output_path}")
                return True
    except Exception as e:
        print(f"[BengaliStylist] Cloud FaceSwap failed/busy: {e}")

    # Fallback to local ONNX swapper
    try:
        import insightface
        from insightface.app import FaceAnalysis
        import cv2

        base_dir = os.path.dirname(__file__)
        model_path = os.path.join(base_dir, '../models/inswapper_128.onnx')
        if not os.path.exists(model_path):
            return False

        app = FaceAnalysis(name='buffalo_sc', providers=['CPUExecutionProvider'])
        app.prepare(ctx_id=0, det_size=(640, 640))
        swapper = insightface.model_zoo.get_model(model_path, download=False, download_zip=False)

        src = cv2.imread(source_path)
        tgt = cv2.imread(template_path)
        src_faces = app.get(src)
        tgt_faces = app.get(tgt)

        if src_faces and tgt_faces:
            src_face = sorted(src_faces, key=lambda x: (x.bbox[2] - x.bbox[0]) * (x.bbox[3] - x.bbox[1]), reverse=True)[0]
            tgt_face = sorted(tgt_faces, key=lambda x: (x.bbox[2] - x.bbox[0]) * (x.bbox[3] - x.bbox[1]), reverse=True)[0]
            res_img = swapper.get(tgt, tgt_face, src_face, paste_back=True)
            os.makedirs(os.path.dirname(os.path.abspath(output_path)), exist_ok=True)
            cv2.imwrite(output_path, res_img)
            print(f"[BengaliStylist] SUCCESS with Local ONNX: Saved to {output_path}")
            return True
    except Exception as local_err:
        print(f"[BengaliStylist] Local fallback error: {local_err}")

    return False

def main():
    parser = argparse.ArgumentParser(description="Agomoni Bengali AI Stylist")
    parser.add_argument("--source", required=True, help="User source photo path")
    parser.add_argument("--gender", default="MALE", choices=["MALE", "FEMALE", "OTHER"], help="Gender")
    parser.add_argument("--style", default="Traditional", help="Festive style")
    parser.add_argument("--day", default="Ashtami", help="Puja day")
    parser.add_argument("--mode", default="auto", choices=["auto", "vton", "photomaker", "instantid", "faceswap"], help="AI Engine mode")
    parser.add_argument("--output", required=True, help="Output image file path")

    args = parser.parse_args()

    gender = 'FEMALE' if args.gender.upper() == 'FEMALE' else 'MALE'
    style_key = 'Ashtami Special' if 'ashtami' in args.style.lower() else 'Modern' if 'modern' in args.style.lower() else 'Traditional'
    
    config = BENGALI_STYLES[gender][style_key]
    template_full_path = os.path.join(os.path.dirname(__file__), '..', config['garment_template'])

    print(f"[BengaliStylist] Starting styling: Gender={gender}, Style={style_key}, Mode={args.mode}")

    # Specific requested mode
    if args.mode == "vton":
        if try_idm_vton(args.source, template_full_path, config['garment_des'], args.output):
            sys.exit(0)
    elif args.mode == "photomaker":
        if try_photomaker(args.source, config['photomaker_prompt'], args.output):
            sys.exit(0)
    elif args.mode == "instantid":
        if try_instantid(args.source, config['instantid_prompt'], args.output):
            sys.exit(0)
    elif args.mode == "faceswap":
        if try_faceswap_restoration(args.source, template_full_path, args.output):
            sys.exit(0)

    # AUTO Mode: Cascades through the best identity-preserving models
    # 1. High-Res Face Restoration Face Swap on Bengali DSLR template (100% exact facial match)
    if try_faceswap_restoration(args.source, template_full_path, args.output):
        sys.exit(0)

    # 2. IDM-VTON (Virtual Try-On onto user's actual body & face)
    if try_idm_vton(args.source, template_full_path, config['garment_des'], args.output):
        sys.exit(0)

    # 3. PhotoMaker (Authentic festive Durga Puja photo session)
    if try_photomaker(args.source, config['photomaker_prompt'], args.output):
        sys.exit(0)

    # 4. InstantID (Zero-shot identity preservation)
    if try_instantid(args.source, config['instantid_prompt'], args.output):
        sys.exit(0)

    print("[BengaliStylist] All AI styling attempts failed.", file=sys.stderr)
    sys.exit(1)

if __name__ == '__main__':
    main()
