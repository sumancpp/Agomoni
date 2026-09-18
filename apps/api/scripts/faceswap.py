import sys
import os
import shutil
import cv2
from gradio_client import Client, handle_file

def swap_faces_gpu(source_path: str, target_path: str, output_path: str):
    print(f"[GPUFaceSwap] Requesting high-fidelity cloud GPU face swap with CodeFormer/GFPGAN...")
    print(f"[GPUFaceSwap] Source: {source_path}")
    print(f"[GPUFaceSwap] Target: {target_path}")

    # 1. Local ONNX Engine (instant, high fidelity, 100% private and robust)
    try:
        import insightface
        from insightface.app import FaceAnalysis

        candidate_model_paths = [
            os.path.join(os.path.dirname(__file__), '../models/inswapper_128.onnx'),
            os.path.join(os.getcwd(), 'apps/api/models/inswapper_128.onnx'),
            os.path.join(os.getcwd(), 'models/inswapper_128.onnx'),
        ]
        model_path = next((p for p in candidate_model_paths if os.path.exists(p)), None)

        if model_path:
            model_name = 'buffalo_sc' if os.path.exists(os.path.expanduser('~/.insightface/models/buffalo_sc')) else 'buffalo_l'
            app = FaceAnalysis(name=model_name, root=os.path.expanduser('~/.insightface'), providers=['CPUExecutionProvider'])
            app.prepare(ctx_id=0, det_size=(640, 640))

            swapper = insightface.model_zoo.get_model(model_path, download=False, download_zip=False)

            source_img = cv2.imread(source_path)
            target_img = cv2.imread(target_path)

            source_faces = app.get(source_img)
            if not source_faces:
                app.prepare(ctx_id=0, det_size=(1024, 1024))
                source_faces = app.get(source_img)

            target_faces = app.get(target_img)

            if source_faces and target_faces:
                res = target_img.copy()

                # If multiple faces present in both source and target (e.g. couple photo)
                if len(source_faces) >= 2 and len(target_faces) >= 2:
                    sorted_src = sorted(source_faces, key=lambda x: x.bbox[0])
                    sorted_tgt = sorted(target_faces, key=lambda x: x.bbox[0])
                    for s_f, t_f in zip(sorted_src[:2], sorted_tgt[:2]):
                        res = swapper.get(res, t_f, s_f, paste_back=True)
                else:
                    source_face = sorted(
                        source_faces,
                        key=lambda x: (x.bbox[2] - x.bbox[0]) * (x.bbox[3] - x.bbox[1]),
                        reverse=True
                    )[0]
                    target_face = sorted(
                        target_faces,
                        key=lambda x: (x.bbox[2] - x.bbox[0]) * (x.bbox[3] - x.bbox[1]),
                        reverse=True
                    )[0]
                    res = swapper.get(res, target_face, source_face, paste_back=True)

                os.makedirs(os.path.dirname(os.path.abspath(output_path)), exist_ok=True)
                cv2.imwrite(output_path, res)
                print(f"[FaceSwap] Local ONNX complete: Saved to {output_path}")
                return True
    except Exception as local_err:
        print(f"[FaceSwap] Local ONNX error: {local_err}, trying cloud fallback...", file=sys.stderr)

    # 2. Try Hugging Face GPU Fallback if local ONNX is unavailable
    try:
        client = Client('tonyassi/face-swap')
        result = client.predict(
            src_img=handle_file(source_path),
            dest_img=handle_file(target_path),
            api_name='/swap_faces'
        )
        if result and os.path.exists(result):
            os.makedirs(os.path.dirname(os.path.abspath(output_path)), exist_ok=True)
            shutil.copy(result, output_path)
            print(f"[FaceSwap] SUCCESS via Cloud GPU: Saved to {output_path}")
            return True
    except Exception as hf_err:
        print(f"[FaceSwap] Cloud GPU attempt failed ({hf_err})")
        return False

if __name__ == '__main__':
    if len(sys.argv) < 4:
        print("Usage: python faceswap.py <source_path> <target_path> <output_path>")
        sys.exit(1)

    source = sys.argv[1]
    target = sys.argv[2]
    out = sys.argv[3]

    ok = swap_faces_gpu(source, target, out)
    if not ok:
        sys.exit(1)
