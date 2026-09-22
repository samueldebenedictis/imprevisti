#!/usr/bin/env python3
"""
Genera gif di face morph (naturale -> espressione) per il dataset FACES.

Algoritmo: landmark detection (mediapipe FaceLandmarker, 478 punti) +
Delaunay triangulation + warp affine triangolo-per-triangolo + cross-dissolve,
stile Beier-Neely / classico morph a griglia triangolare (come 3dthis.com/morph.htm).

Naming file sorgente: {id}_{age}_{sex}_{expr}_{set}.jpg
  expr: n=neutrale, a=rabbia, d=disgusto, f=paura, h=felicita, s=tristezza
  set:  a / b (due sessioni per soggetto)

Uso:
    .venv-morph/bin/python3 scripts/face_morph.py
"""

import glob
import os
import re
from itertools import product

import cv2
import imageio.v2 as imageio
import mediapipe as mp
import numpy as np
from mediapipe.tasks.python import BaseOptions, vision
from scipy.spatial import Delaunay

SRC_DIR = "public/images/faces"
OUT_DIR = "public/images/faces_morph"
MODEL_PATH = "scripts/models/face_landmarker.task"

EXPR_NAMES = {
    "a": "rabbia",
    "d": "disgusto",
    "f": "paura",
    "h": "felicita",
    "s": "tristezza",
}
NEUTRAL = "n"

N_FRAMES = 20       # frame per transizione neutrale -> espressione
HOLD_FRAMES = 6     # frame fermi a inizio/fine (pausa su neutrale/espressione)
FPS = 15
MAX_WIDTH = 480     # ridimensiona per gif leggere (originali sono ~3500px)
MASK_FEATHER = 15   # px di blur sul bordo maschera viso (evita seam sul collo/maglia)

FILENAME_RE = re.compile(r"^(\d+)_([a-z])_([a-z])_([a-z])_([a-z])\.jpg$")

# 8 punti agli angoli/bordi immagine, cosi la triangolazione copre tutto il
# frame e il warp non lascia buchi neri fuori dal contorno del viso.
def border_points(w, h):
    return [
        (0, 0), (w // 2, 0), (w - 1, 0),
        (0, h // 2), (w - 1, h // 2),
        (0, h - 1), (w // 2, h - 1), (w - 1, h - 1),
    ]


def detect_landmarks(landmarker, img_bgr):
    rgb = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2RGB)
    mp_img = mp.Image(image_format=mp.ImageFormat.SRGB, data=rgb)
    result = landmarker.detect(mp_img)
    if not result.face_landmarks:
        return None
    h, w = img_bgr.shape[:2]
    pts = [(lm.x * w, lm.y * h) for lm in result.face_landmarks[0]]
    pts.extend(border_points(w, h))
    return np.array(pts, dtype=np.float64)


def delaunay_triangles(points, w, h):
    # scipy da indici diretti nei simplessi, niente round-matching fragile
    # (cv2.Subdiv2D internamente riquantizza le coordinate e il match per
    # arrotondamento perde triangoli).
    tri = Delaunay(points)
    return [tuple(int(i) for i in simplex) for simplex in tri.simplices]


def warp_triangle(src, dst, t_src, t_dst):
    r_src = cv2.boundingRect(np.float32([t_src]))
    r_dst = cv2.boundingRect(np.float32([t_dst]))

    t_src_rect = [(p[0] - r_src[0], p[1] - r_src[1]) for p in t_src]
    t_dst_rect = [(p[0] - r_dst[0], p[1] - r_dst[1]) for p in t_dst]

    src_crop = src[r_src[1]:r_src[1] + r_src[3], r_src[0]:r_src[0] + r_src[2]]
    if src_crop.size == 0 or r_dst[2] <= 0 or r_dst[3] <= 0:
        return

    warp_mat = cv2.getAffineTransform(np.float32(t_src_rect), np.float32(t_dst_rect))
    dst_crop = cv2.warpAffine(
        src_crop, warp_mat, (r_dst[2], r_dst[3]),
        flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_REFLECT_101,
    )

    mask = np.zeros((r_dst[3], r_dst[2]), dtype=np.float32)
    cv2.fillConvexPoly(mask, np.int32(t_dst_rect), 1.0, cv2.LINE_AA)
    mask = mask[:, :, None]

    region = dst[r_dst[1]:r_dst[1] + r_dst[3], r_dst[0]:r_dst[0] + r_dst[2]]
    dst[r_dst[1]:r_dst[1] + r_dst[3], r_dst[0]:r_dst[0] + r_dst[2]] = (
        region * (1 - mask) + dst_crop * mask
    )


def face_mask(pts_mid_face, shape):
    """Maschera sfumata (hull dei landmark viso) per isolare il warp dal
    resto del frame: maglia/spalle si muovono leggermente tra gli scatti
    (non sono pixel-identici) e warpare tutto il frame le distorce."""
    h, w = shape[:2]
    hull = cv2.convexHull(np.float32(pts_mid_face)).astype(np.int32)
    mask = np.zeros((h, w), dtype=np.uint8)
    cv2.fillConvexPoly(mask, hull, 255, cv2.LINE_AA)
    k = MASK_FEATHER * 2 + 1
    mask = cv2.GaussianBlur(mask, (k, k), 0)
    return (mask.astype(np.float32) / 255.0)[:, :, None]


def morph_frame(img1, img2, pts1, pts2, triangles, alpha, face_count, img_static):
    pts_mid = (1 - alpha) * pts1 + alpha * pts2

    warped1 = np.zeros_like(img1, dtype=np.float32)
    warped2 = np.zeros_like(img2, dtype=np.float32)

    img1f = img1.astype(np.float32)
    img2f = img2.astype(np.float32)

    for tri in triangles:
        t1 = [tuple(pts1[i]) for i in tri]
        t2 = [tuple(pts2[i]) for i in tri]
        tm = [tuple(pts_mid[i]) for i in tri]
        warp_triangle(img1f, warped1, t1, tm)
        warp_triangle(img2f, warped2, t2, tm)

    warped = (1 - alpha) * warped1 + alpha * warped2

    mask = face_mask(pts_mid[:face_count], img1.shape)
    out = warped * mask + img_static.astype(np.float32) * (1 - mask)
    return np.clip(out, 0, 255).astype(np.uint8)


def ease_in_out(t):
    return t * t * (3 - 2 * t)


def build_morph_gif(landmarker, neutral_path, expr_path, out_path, size=None):
    img_n = cv2.imread(neutral_path)
    img_e = cv2.imread(expr_path)
    if img_n is None or img_e is None:
        print(f"  skip (immagine non leggibile): {neutral_path} / {expr_path}")
        return False

    if size is None:
        h0, w0 = img_n.shape[:2]
        scale = MAX_WIDTH / w0
        size = (MAX_WIDTH, round(h0 * scale))
    img_n = cv2.resize(img_n, size, interpolation=cv2.INTER_AREA)
    img_e = cv2.resize(img_e, size, interpolation=cv2.INTER_AREA)

    pts_n = detect_landmarks(landmarker, img_n)
    pts_e = detect_landmarks(landmarker, img_e)
    if pts_n is None or pts_e is None:
        print(f"  skip (volto non rilevato): {neutral_path} / {expr_path}")
        return False

    h, w = img_n.shape[:2]
    avg_pts_for_tri = (pts_n + pts_e) / 2.0
    triangles = delaunay_triangles(avg_pts_for_tri, w, h)
    face_count = pts_n.shape[0] - len(border_points(w, h))

    frames = []
    for i in range(N_FRAMES + 1):
        alpha = ease_in_out(i / N_FRAMES)
        frame = morph_frame(img_n, img_e, pts_n, pts_e, triangles, alpha, face_count, img_n)
        frames.append(cv2.cvtColor(frame, cv2.COLOR_BGR2RGB))

    seq = [frames[0]] * HOLD_FRAMES + frames + [frames[-1]] * HOLD_FRAMES
    seq += frames[::-1][1:]  # torna a neutrale, loop pulito

    imageio.mimsave(out_path, seq, fps=FPS, loop=0)
    return True


def group_faces(files):
    groups = {}
    for f in files:
        name = os.path.basename(f)
        m = FILENAME_RE.match(name)
        if not m:
            continue
        fid, age, sex, expr, set_ = m.groups()
        groups.setdefault((fid, age, sex, set_), {})[expr] = f
    return groups


def main():
    os.makedirs(OUT_DIR, exist_ok=True)

    base_options = BaseOptions(model_asset_path=MODEL_PATH)
    options = vision.FaceLandmarkerOptions(base_options=base_options, num_faces=1)
    landmarker = vision.FaceLandmarker.create_from_options(options)

    files = glob.glob(os.path.join(SRC_DIR, "*.jpg"))
    groups = group_faces(files)

    n_ok, n_skip = 0, 0
    for (fid, age, sex, set_), exprs in sorted(groups.items()):
        if NEUTRAL not in exprs:
            print(f"soggetto {fid}{set_}: manca neutrale, skip")
            continue
        neutral_path = exprs[NEUTRAL]
        for code, label in EXPR_NAMES.items():
            if code not in exprs:
                continue
            expr_path = exprs[code]
            out_name = f"{fid}_{age}_{sex}_{code}_{set_}_morph.gif"
            out_path = os.path.join(OUT_DIR, out_name)
            print(f"morph {fid}{set_}: neutrale -> {label} ...")
            ok = build_morph_gif(landmarker, neutral_path, expr_path, out_path)
            if ok:
                n_ok += 1
                print(f"  -> {out_path}")
            else:
                n_skip += 1

    landmarker.close()
    print(f"\nfatto: {n_ok} gif generate, {n_skip} saltate.")


if __name__ == "__main__":
    main()
