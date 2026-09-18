import sys
import os
import shutil

try:
    import numpy as np
    import cv2
    import insightface
    from insightface.app import FaceAnalysis
except ModuleNotFoundError as e:
    print(f"[FaceSwap ERROR] Missing required Python package: {e}", file=sys.stderr)
    sys.exit(1)

def refine_face_blend(target_img, swapped_img, target_face):
    """
    Applies Reinhard color space exposure/white-balance matching and
    keypoint-centered feathered boundary blending to seamlessly merge
    the swapped face into the authentic Bengali Durga Puja template without seams.
    """
    try:
        import cv2
        bbox = [int(x) for x in target_face.bbox]
        h_img, w_img = target_img.shape[:2]
        pad_x = int((bbox[2] - bbox[0]) * 0.08)
        pad_y = int((bbox[3] - bbox[1]) * 0.08)
        x1, y1 = max(0, bbox[0] - pad_x), max(0, bbox[1] - pad_y)
        x2, y2 = min(w_img, bbox[2] + pad_x), min(h_img, bbox[3] + pad_y)

        if (x2 - x1) < 20 or (y2 - y1) < 20:
            return swapped_img

        tgt_roi = target_img[y1:y2, x1:x2].copy()
        res_roi = swapped_img[y1:y2, x1:x2].copy()

        tgt_lab = cv2.cvtColor(tgt_roi, cv2.COLOR_BGR2LAB).astype(np.float32)
        res_lab = cv2.cvtColor(res_roi, cv2.COLOR_BGR2LAB).astype(np.float32)

        # 1. Match white balance & chromatic tone (A, B channels in LAB space)
        alpha_color = 0.50
        for c in [1, 2]:
            m_tgt, s_tgt = tgt_lab[:, :, c].mean(), tgt_lab[:, :, c].std()
            m_res, s_res = res_lab[:, :, c].mean(), res_lab[:, :, c].std()
            if s_res > 1e-4:
                matched = (res_lab[:, :, c] - m_res) * (s_tgt / s_res) + m_tgt
                res_lab[:, :, c] = (1 - alpha_color) * res_lab[:, :, c] + alpha_color * matched

        # 2. Match exposure / lightness (L channel) - subtle to retain user natural depth
        alpha_light = 0.25
        m_tgt_l, s_tgt_l = tgt_lab[:, :, 0].mean(), tgt_lab[:, :, 0].std()
        m_res_l, s_res_l = res_lab[:, :, 0].mean(), res_lab[:, :, 0].std()
        if s_res_l > 1e-4:
            matched_l = (res_lab[:, :, 0] - m_res_l) * (s_tgt_l / s_res_l) + m_tgt_l
            res_lab[:, :, 0] = (1 - alpha_light) * res_lab[:, :, 0] + alpha_light * matched_l

        res_lab = np.clip(res_lab, 0, 255).astype(np.uint8)
        color_matched = cv2.cvtColor(res_lab, cv2.COLOR_LAB2BGR)

        # 3. Seamless feathered boundary blending using target face keypoints if available
        mask = np.zeros((y2 - y1, x2 - x1), dtype=np.float32)
        roi_w = x2 - x1
        roi_h = y2 - y1

        if hasattr(target_face, 'kps') and target_face.kps is not None and len(target_face.kps) == 5:
            # 5 keypoints: left_eye, right_eye, nose, left_mouth, right_mouth
            kps = target_face.kps
            center_x = int(np.mean(kps[:, 0]) - x1)
            center_y = int(np.mean(kps[:, 1]) - y1)
            eye_dist = np.linalg.norm(kps[0] - kps[1])
            axis_x = int(max(eye_dist * 1.05, roi_w * 0.38))
            axis_y = int(max(eye_dist * 1.35, roi_h * 0.42))
        else:
            center_x = roi_w // 2
            center_y = roi_h // 2
            axis_x = int(roi_w * 0.40)
            axis_y = int(roi_h * 0.45)

        cv2.ellipse(mask, (center_x, center_y), (axis_x, axis_y), 0, 0, 360, 1.0, -1)
        ksize = int(max(15, min(51, roi_w // 4) | 1))
        mask = cv2.GaussianBlur(mask, (ksize, ksize), 0)
        mask = mask[:, :, np.newaxis]

        # Blend color-matched swapped face with authentic template background at boundaries
        final_roi = (color_matched * mask + tgt_roi * (1.0 - mask)).astype(np.uint8)
        swapped_img[y1:y2, x1:x2] = final_roi
        return swapped_img
    except Exception as blend_err:
        print(f"[FaceSwap] Blend refinement warning: {blend_err}", file=sys.stderr)
        return swapped_img

def swap_faces(source_path: str, target_path: str, output_path: str, mode: str = 'single') -> bool:
    print(f"[FaceSwap] Source: {source_path}")
    print(f"[FaceSwap] Target Template: {target_path}")
    print(f"[FaceSwap] Mode: {mode}")

    try:
        import cv2
        import insightface
        from insightface.app import FaceAnalysis

        candidate_model_paths = [
            os.path.join(os.path.dirname(__file__), '../models/inswapper_128.onnx'),
            os.path.join(os.getcwd(), 'apps/api/models/inswapper_128.onnx'),
            os.path.join(os.getcwd(), 'models/inswapper_128.onnx'),
        ]
        model_path = next((p for p in candidate_model_paths if os.path.exists(p)), None)

        if not model_path:
            # Download inswapper_128.onnx from HuggingFace if not present on server
            target_model_dir = os.path.join(os.path.dirname(__file__), '../models')
            os.makedirs(target_model_dir, exist_ok=True)
            dl_path = os.path.join(target_model_dir, 'inswapper_128.onnx')
            print(f"[FaceSwap] Downloading inswapper_128.onnx to {dl_path}...")
            try:
                import urllib.request
                url = "https://huggingface.co/ezioruan/inswapper_128.onnx/resolve/main/inswapper_128.onnx"
                urllib.request.urlretrieve(url, dl_path)
                model_path = dl_path
            except Exception as dl_err:
                print(f"[FaceSwap ERROR] Could not download inswapper_128.onnx: {dl_err}", file=sys.stderr)
                return False

        # Prefer buffalo_l if available with w600k_r50, fallback to buffalo_sc
        model_name = 'buffalo_l' if os.path.exists(os.path.expanduser('~/.insightface/models/buffalo_l/w600k_r50.onnx')) else 'buffalo_sc'
        app = FaceAnalysis(name=model_name, root=os.path.expanduser('~/.insightface'), providers=['CPUExecutionProvider'])
        app.prepare(ctx_id=0, det_size=(640, 640))

        swapper = insightface.model_zoo.get_model(model_path, download=False, download_zip=False)
        if not swapper:
            print("[FaceSwap ERROR] Could not initialize ONNX swapper model", file=sys.stderr)
            return False

        source_img = cv2.imread(source_path)
        if source_img is None:
            print(f"[FaceSwap ERROR] Could not read source image: {source_path}", file=sys.stderr)
            return False

        target_img = cv2.imread(target_path)
        if target_img is None:
            print(f"[FaceSwap ERROR] Could not read target template: {target_path}", file=sys.stderr)
            return False

        source_faces = app.get(source_img)
        if not source_faces:
            # Retry with larger detection resolution for small/distant faces
            app.prepare(ctx_id=0, det_size=(1024, 1024))
            source_faces = app.get(source_img)

        if not source_faces:
            print("[FaceSwap ERROR] No faces detected in uploaded photo. Please provide a clear photograph.", file=sys.stderr)
            return False

        target_faces = app.get(target_img)
        if not target_faces:
            print("[FaceSwap ERROR] No faces detected in target template.", file=sys.stderr)
            return False

        # Filter target faces by area to avoid background Durga idol or mural faces
        tgt_sorted_by_area = sorted(
            target_faces,
            key=lambda f: (f.bbox[2] - f.bbox[0]) * (f.bbox[3] - f.bbox[1]),
            reverse=True
        )

        res = target_img.copy()

        is_couple_mode = (mode.lower() == 'couple') or (len(source_faces) >= 2 and len(tgt_sorted_by_area) >= 2 and mode.lower() != 'single')

        if is_couple_mode:
            if len(source_faces) < 2:
                print(f"[FaceSwap ERROR] Couple transformation requires at least 2 detected faces in the source image (found {len(source_faces)}).", file=sys.stderr)
                return False

            # Get top 2 primary faces from source and template
            src_top2 = sorted(
                sorted(source_faces, key=lambda f: (f.bbox[2] - f.bbox[0]) * (f.bbox[3] - f.bbox[1]), reverse=True)[:2],
                key=lambda f: f.bbox[0]
            )
            tgt_top2 = sorted(tgt_sorted_by_area[:2], key=lambda f: f.bbox[0])

            # In authentic couple template: Left person is MALE (Kurta), Right person is FEMALE (Saree)
            src_males = [f for f in src_top2 if getattr(f, 'gender', -1) == 1]
            src_females = [f for f in src_top2 if getattr(f, 'gender', -1) == 0]

            if len(src_males) == 1 and len(src_females) == 1:
                print("[FaceSwap] Swapping Couple: Semantic Gender Match (Male -> Kurta, Female -> Saree)")
                mapping = [(src_males[0], tgt_top2[0]), (src_females[0], tgt_top2[1])]
            else:
                print("[FaceSwap] Swapping Couple: Spatial Alignment (Left -> Left, Right -> Right)")
                mapping = [(src_top2[0], tgt_top2[0]), (src_top2[1], tgt_top2[1])]

            for s_f, t_f in mapping:
                res = swapper.get(res, t_f, s_f, paste_back=True)
                res = refine_face_blend(target_img, res, t_f)
        else:
            # Single face mode: pick largest primary face
            source_face = sorted(
                source_faces,
                key=lambda f: (f.bbox[2] - f.bbox[0]) * (f.bbox[3] - f.bbox[1]),
                reverse=True
            )[0]
            target_face = tgt_sorted_by_area[0]

            print(f"[FaceSwap] Swapping Single Face: bbox area {(source_face.bbox[2]-source_face.bbox[0])*(source_face.bbox[3]-source_face.bbox[1]):.0f} -> template area {(target_face.bbox[2]-target_face.bbox[0])*(target_face.bbox[3]-target_face.bbox[1]):.0f}")
            res = swapper.get(res, target_face, source_face, paste_back=True)
            res = refine_face_blend(target_img, res, target_face)

        os.makedirs(os.path.dirname(os.path.abspath(output_path)), exist_ok=True)
        cv2.imwrite(output_path, res)
        print(f"[FaceSwap SUCCESS] Photorealistic face transformation complete: {output_path}")
        return True

    except Exception as e:
        print(f"[FaceSwap ERROR] Exception during local face transformation: {e}", file=sys.stderr)
        return False

if __name__ == '__main__':
    if len(sys.argv) < 4:
        print("Usage: python faceswap.py <source_path> <target_path> <output_path> [single|couple]")
        sys.exit(1)

    source = sys.argv[1]
    target = sys.argv[2]
    out = sys.argv[3]
    mode_arg = sys.argv[4] if len(sys.argv) > 4 else 'single'

    ok = swap_faces(source, target, out, mode_arg)
    if not ok:
        # Exit with non-zero status code to signal failure
        sys.exit(1)
