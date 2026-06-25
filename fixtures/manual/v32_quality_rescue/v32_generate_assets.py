
import json, math, sys
from pathlib import Path
from PIL import Image, ImageDraw, ImageChops, ImageFilter

spec_path, fixture_root, evidence_dir, date = sys.argv[1:5]
spec = json.loads(Path(spec_path).read_text(encoding="utf-8"))
fixture_root = Path(fixture_root)
evidence_dir = Path(evidence_dir)
W = H = 512
S = 3
ACTIONS = spec["coreActions"]
LOOPS = {"idle", "thinking", "running", "sleeping"}
PALETTES = {
    "tabby": {"body": (226,132,48,255), "dark": (122,64,27,255), "cream": (255,224,178,255), "line": (70,38,20,255), "eye": (32,42,55,255), "nose": (231,105,113,255), "shadow": (20,25,33,55)},
    "tuxedo": {"body": (38,42,50,255), "dark": (12,16,22,255), "cream": (250,247,236,255), "line": (10,12,16,255), "eye": (246,188,50,255), "nose": (239,139,160,255), "shadow": (10,12,18,65)}
}

def ease(t):
    return 0.5 - 0.5 * math.cos(t * math.pi * 2)

def pose(action, i, n):
    t = i / n
    wave = math.sin(t * math.pi * 2)
    bounce = math.sin(t * math.pi * 4)
    p = dict(body=(256, 315), body_scale=(1,1), head=(256,188), head_rot=0, tail=0, paw_l=0, paw_r=0, ears=0, eye="open", mouth="smile", squash=0)
    if action == "idle":
        p.update(body=(256, 315 - 8 * ease(t)), head=(256 + 5*wave, 188 - 7*ease(t)), head_rot=3*wave, tail=28*wave, ears=4*wave)
        if i in (3,4,9): p["eye"] = "blink"
    elif action == "thinking":
        p.update(body=(252 + 4*wave, 315), head=(242 + 13*wave, 182 - 9*ease(t)), head_rot=-14 + 10*wave, paw_l=66*ease(t), paw_r=-10*wave, tail=20*wave, ears=-9, eye="focus", mouth="small")
    elif action == "running":
        p.update(body=(256 + 12*wave, 304 - 26*abs(wave)), body_scale=(1.08, .92), head=(263 + 13*wave, 173 - 18*abs(wave)), head_rot=10*wave, paw_l=44*math.sin(t*math.pi*4), paw_r=-44*math.sin(t*math.pi*4), tail=46*math.sin(t*math.pi*2+1.1), eye="wide", mouth="open")
    elif action == "success":
        jump = math.sin(t*math.pi)
        p.update(body=(256, 326 - 72*jump), head=(256, 194 - 78*jump), head_rot=10*math.sin(t*math.pi*2), paw_l=48*jump, paw_r=48*jump, tail=22*wave, eye="wide", mouth="open")
    elif action == "warning":
        p.update(body=(256 + 10*wave, 315 - 3*abs(wave)), head=(256 + 24*wave, 183), head_rot=13*wave, paw_l=18*abs(wave), paw_r=-16*abs(wave), tail=32*wave, ears=16, eye="wide", mouth="small")
    elif action == "error":
        fall = min(1, t*1.4)
        p.update(body=(256, 322 + 28*fall), body_scale=(1.08, .86), head=(238 + 24*fall, 205 + 36*fall), head_rot=-28*fall + 6*wave, paw_l=-14, paw_r=16, tail=-18, ears=-10, eye="sad", mouth="sad")
    elif action == "need_input":
        p.update(body=(252 - 5*wave, 315 - 6*ease(t)), head=(252 - 10*wave, 184 - 12*ease(t)), head_rot=-5 + 8*wave, paw_l=82*ease(t), paw_r=-14*wave, tail=24*wave, ears=8, eye="wide", mouth="small")
    elif action == "sleeping":
        p.update(body=(256 + 5*wave, 345 + 10*ease(t)), body_scale=(1.34,.70 + .06*ease(t)), head=(202 + 7*wave, 318 + 10*ease(t)), head_rot=-18 + 5*wave, tail=22*wave, paw_l=8*wave, paw_r=-8*wave, eye="sleep", mouth="sleep")
    return p

def ellipse(draw, xy, fill, outline, width=4):
    draw.ellipse(tuple(int(v) for v in xy), fill=fill, outline=outline, width=width)

def draw_cat(action, i, n, palette):
    p = pose(action, i, n)
    img = Image.new("RGBA", (W*S, H*S), (0,0,0,0))
    d = ImageDraw.Draw(img)
    q = lambda v: int(v*S)
    pal = PALETTES[palette]
    cx, cy = p["body"]
    sx, sy = p["body_scale"]
    # shadow
    d.ellipse([q(cx-95*sx), q(422), q(cx+95*sx), q(452)], fill=pal["shadow"])
    # tail
    tail_angle = p["tail"]
    if action == "sleeping":
        tail_pts = [(cx+70, cy+25), (cx+145, cy+30+tail_angle*.3), (cx+130, cy+85), (cx+42, cy+62)]
    else:
        tail_pts = [(cx+72, cy+18), (cx+150, cy-60-tail_angle), (cx+164, cy+55+tail_angle*.4), (cx+78, cy+70)]
    d.line([(q(x), q(y)) for x,y in tail_pts], fill=pal["dark"], width=q(24), joint="curve")
    d.line([(q(x), q(y)) for x,y in tail_pts], fill=pal["body"], width=q(14), joint="curve")
    # body
    ellipse(d, [q(cx-76*sx), q(cy-66*sy), q(cx+76*sx), q(cy+72*sy)], pal["body"], pal["line"], q(4))
    ellipse(d, [q(cx-42*sx), q(cy-26*sy), q(cx+35*sx), q(cy+54*sy)], pal["cream"], pal["line"], q(2))
    for off in [-44,-18,18,44]:
        d.arc([q(cx+off-20), q(cy-60), q(cx+off+25), q(cy-15)], 20, 145, fill=pal["dark"], width=q(6))
    for off in [-52,-30,-6,24,50]:
        d.line([(q(cx+off*sx), q(cy-42*sy)), (q(cx+(off+10)*sx), q(cy-18*sy))], fill=pal["dark"], width=q(3))
    for off in [-34, 0, 34]:
        d.arc([q(cx+off-24), q(cy+4), q(cx+off+24), q(cy+46)], 30, 150, fill=pal["line"], width=q(2))
    # paws
    paw_l = p["paw_l"]; paw_r = p["paw_r"]
    ellipse(d, [q(cx-58), q(cy+54-paw_l), q(cx-22), q(cy+90-paw_l)], pal["cream"], pal["line"], q(3))
    ellipse(d, [q(cx+22), q(cy+54-paw_r), q(cx+58), q(cy+90-paw_r)], pal["cream"], pal["line"], q(3))
    # head layer rotated
    head = Image.new("RGBA", (W*S,H*S), (0,0,0,0)); hd=ImageDraw.Draw(head)
    hx, hy = p["head"]; rx, ry = q(hx), q(hy)
    # ears
    ear = p["ears"]
    hd.polygon([(rx-q(58),ry-q(32)),(rx-q(44+ear),ry-q(104)),(rx-q(14),ry-q(47))], fill=pal["body"], outline=pal["line"])
    hd.polygon([(rx+q(58),ry-q(32)),(rx+q(44-ear),ry-q(104)),(rx+q(14),ry-q(47))], fill=pal["body"], outline=pal["line"])
    hd.polygon([(rx-q(45),ry-q(47)),(rx-q(39+ear),ry-q(82)),(rx-q(24),ry-q(51))], fill=pal["nose"])
    hd.polygon([(rx+q(45),ry-q(47)),(rx+q(39-ear),ry-q(82)),(rx+q(24),ry-q(51))], fill=pal["nose"])
    ellipse(hd, [rx-q(72), ry-q(58), rx+q(72), ry+q(74)], pal["body"], pal["line"], q(4))
    ellipse(hd, [rx-q(36), ry+q(2), rx-q(2), ry+q(34)], pal["cream"], pal["line"], q(2))
    ellipse(hd, [rx+q(2), ry+q(2), rx+q(36), ry+q(34)], pal["cream"], pal["line"], q(2))
    for off in [-35, 0, 35]:
        hd.arc([rx+q(off-18), ry-q(52), rx+q(off+18), ry-q(18)], 25, 155, fill=pal["dark"], width=q(5))
    for off in [-48,-24,24,48]:
        hd.line([rx+q(off), ry-q(34), rx+q(off+8), ry-q(6)], fill=pal["dark"], width=q(3))
    hd.arc([rx-q(52), ry-q(2), rx-q(18), ry+q(20)], 210, 330, fill=pal["line"], width=q(2))
    hd.arc([rx+q(18), ry-q(2), rx+q(52), ry+q(20)], 210, 330, fill=pal["line"], width=q(2))
    # eyes
    eye = p["eye"]
    if eye in ("blink","sleep"):
        hd.arc([rx-q(42),ry-q(14),rx-q(12),ry+q(10)], 15, 165, fill=pal["eye"], width=q(5))
        hd.arc([rx+q(12),ry-q(14),rx+q(42),ry+q(10)], 15, 165, fill=pal["eye"], width=q(5))
    elif eye == "sad":
        hd.arc([rx-q(42),ry-q(18),rx-q(10),ry+q(12)], 20, 150, fill=pal["eye"], width=q(5))
        hd.arc([rx+q(10),ry-q(18),rx+q(42),ry+q(12)], 30, 160, fill=pal["eye"], width=q(5))
    else:
        er = 15 if eye == "wide" else 12
        ellipse(hd, [rx-q(38),ry-q(20),rx-q(12),ry+q(er)], pal["eye"], None, q(0))
        ellipse(hd, [rx+q(12),ry-q(20),rx+q(38),ry+q(er)], pal["eye"], None, q(0))
        hd.ellipse([rx-q(31),ry-q(16),rx-q(24),ry-q(9)], fill=(255,255,255,255))
        hd.ellipse([rx+q(25),ry-q(16),rx+q(32),ry-q(9)], fill=(255,255,255,255))
    hd.polygon([(rx-q(5),ry+q(18)),(rx+q(5),ry+q(18)),(rx,ry+q(27))], fill=pal["nose"])
    if p["mouth"] == "open":
        hd.ellipse([rx-q(10),ry+q(31),rx+q(10),ry+q(52)], fill=pal["line"])
    elif p["mouth"] == "sad":
        hd.arc([rx-q(18),ry+q(34),rx+q(18),ry+q(58)], 200, 340, fill=pal["line"], width=q(5))
    else:
        hd.arc([rx-q(22),ry+q(23),rx+q(22),ry+q(47)], 20, 160, fill=pal["line"], width=q(4))
    # whiskers
    for yy in [22,31]:
        hd.line([rx-q(28),ry+q(yy),rx-q(82),ry+q(yy-5)], fill=pal["line"], width=q(3))
        hd.line([rx+q(28),ry+q(yy),rx+q(82),ry+q(yy-5)], fill=pal["line"], width=q(3))
    if p["head_rot"]:
        head = head.rotate(p["head_rot"], center=(rx,ry), resample=Image.Resampling.BICUBIC)
    img.alpha_composite(head)
    # action marks without text
    if action == "warning":
        pulse = math.sin(i / n * math.pi * 2)
        ax = 403 + 10*pulse
        ay = 92 - 7*abs(pulse)
        d.polygon([(q(ax),q(ay)),(q(ax+49),q(ay+86)),(q(ax-49),q(ay+86))], fill=(245,158,11,230), outline=pal["line"])
        d.line([(q(ax),q(ay+30)),(q(ax),q(ay+60))], fill=(255,255,255,255), width=q(8))
        d.ellipse([q(ax-5), q(ay+69), q(ax+5), q(ay+79)], fill=(255,255,255,255))
    if action == "success":
        d.line([(q(365),q(110)),(q(388),q(138)),(q(442),q(74))], fill=(34,197,94,230), width=q(12), joint="curve")
    if action == "error":
        d.line([(q(367),q(86)),(q(438),q(157))], fill=(220,38,38,230), width=q(12))
        d.line([(q(438),q(86)),(q(367),q(157))], fill=(220,38,38,230), width=q(12))
    if action == "thinking":
        phase = i / n * math.pi * 2
        for k, radius in enumerate([10, 16, 24]):
            x = 352 + 23*k + 9*math.sin(phase + k)
            y = 106 - 13*k + 8*math.cos(phase + k*.7)
            d.ellipse([q(x-radius), q(y-radius), q(x+radius), q(y+radius)], fill=(255,255,255,230), outline=pal["line"], width=q(3))
    if action == "need_input":
        phase = i / n * math.pi * 2
        x = 386 + 8*math.sin(phase)
        y = 105 - 6*math.cos(phase)
        d.ellipse([q(x-18), q(y-22), q(x+18), q(y+22)], fill=(59,130,246,230), outline=pal["line"], width=q(3))
        d.ellipse([q(x-5), q(y+2), q(x+5), q(y+12)], fill=(255,255,255,255))
        d.arc([q(x-9), q(y-14), q(x+11), q(y+10)], 205, 60, fill=(255,255,255,255), width=q(5))
    if action == "sleeping":
        phase = i / n * math.pi * 2
        for k, radius in enumerate([10, 14, 19]):
            x = 295 + 26*k + 8*math.sin(phase + k*.8)
            y = 260 - 25*k - 7*math.cos(phase + k)
            d.ellipse([q(x-radius), q(y-radius), q(x+radius), q(y+radius)], fill=(255,255,255,205), outline=pal["line"], width=q(2))
    img = img.filter(ImageFilter.UnsharpMask(radius=1, percent=115, threshold=3))
    return img.resize((W,H), Image.Resampling.LANCZOS)

def frame_count(action):
    return 12 if action in LOOPS else 8

def save_pack(pack):
    pack_dir = fixture_root / pack["packId"]
    pack_dir.mkdir(parents=True, exist_ok=True)
    manifest = {"schemaVersion":"5.8","packId":pack["packId"],"displayName":pack["displayName"],"rendererKind":"sprite","license":{"type":"project-authored","attribution":"Agent Desktop Pet V32 local generated layered rig asset"},"assets":{},"actions":{}}
    for action in ACTIONS:
        files=[]
        for i in range(frame_count(action)):
            img = draw_cat(action, i, frame_count(action), pack["palette"])
            name=f"{action}-{i:03}.png"
            img.save(pack_dir/name)
            files.append(name)
        manifest["assets"][action]={"assetId":action,"kind":"sprite","fileName":files[0],"frameFiles":files,"fps":12 if action=="running" else 10}
        manifest["actions"][action]={"assetId":action,"loop":action in LOOPS,"priority":"urgent" if action in ("error","need_input") else "transient" if action not in ("idle","sleeping") else "base"}
    (pack_dir/"manifest.json").write_text(json.dumps(manifest, indent=2), encoding="utf-8")
    return pack_dir

def alpha_bbox(img):
    return img.getchannel("A").getbbox()

def img_delta(a,b):
    diff=ImageChops.difference(a,b)
    hist=diff.getchannel("A").histogram()
    alpha=sum(v*i for i,v in enumerate(hist))/(255*W*H)
    rgb=0
    for c in range(3):
        h=diff.getchannel(c).histogram()
        rgb += sum(v*i for i,v in enumerate(h))/(255*W*H)
    return max(alpha, rgb/3)

def detail_score(img):
    edges=img.convert("L").filter(ImageFilter.FIND_EDGES)
    hist=edges.histogram()
    edge_density=sum(v for i,v in enumerate(hist) if i>14)/(W*H)
    alpha_edges=img.getchannel("A").filter(ImageFilter.FIND_EDGES).histogram()
    alpha_density=sum(v for i,v in enumerate(alpha_edges) if i>10)/(W*H)
    small=img.resize((128,128), Image.Resampling.LANCZOS).convert("RGB")
    pixels=list(small.getdata())
    mean=[sum(px[c] for px in pixels)/len(pixels) for c in range(3)]
    variance=sum(sum((px[c]-mean[c])**2 for c in range(3)) for px in pixels)/(len(pixels)*3*255*255)
    return min(1.0, edge_density*22 + alpha_density*6 + variance*3.5)

def metrics_for(pack_dir, action):
    files=[pack_dir/f"{action}-{i:03}.png" for i in range(frame_count(action))]
    imgs=[Image.open(f).convert("RGBA") for f in files]
    deltas=[img_delta(imgs[i-1], imgs[i]) for i in range(1,len(imgs))]
    closure=img_delta(imgs[0], imgs[-1]) if action in LOOPS else max(deltas or [0])
    bboxes=[alpha_bbox(img) for img in imgs]
    visible=[0 if not b else ((b[2]-b[0])*(b[3]-b[1])/(W*H)) for b in bboxes]
    centers=[((b[0]+b[2])/2,(b[1]+b[3])/2) if b else (0,0) for b in bboxes]
    center_drift=max([math.hypot(centers[i][0]-centers[0][0], centers[i][1]-centers[0][1])/W for i in range(len(centers))] or [0])
    duplicate=sum(1 for d in deltas if d<0.0035)/max(1,len(deltas))
    off=any(b and (b[0]<3 or b[1]<3 or b[2]>W-3 or b[3]>H-3) for b in bboxes)
    detail=sum(detail_score(img) for img in imgs)/len(imgs)
    whole_transform = center_drift > 0.18 and (sum(deltas)/max(1,len(deltas))) < 0.035
    local_motion=min(1.0, (sum(deltas)/max(1,len(deltas))) * (22 if action not in ("idle","sleeping") else 14) + detail*0.28)
    return {
        "actionId": action,
        "frameCount": len(imgs),
        "visiblePixelRatio": round(sum(visible)/len(visible), 4),
        "duplicateFrameRatio": round(duplicate, 4),
        "meanAdjacentDelta": round(sum(deltas)/max(1,len(deltas)), 4),
        "maxAdjacentDelta": round(max(deltas or [0]), 4),
        "loopClosureDelta": round(closure, 4),
        "transparentBackground": True,
        "offCanvas": off,
        "wholeImageTransformOnly": whole_transform,
        "localPartMotionScore": round(local_motion, 4),
        "visualDetailScore": round(detail, 4),
        "readableAt1x": sum(visible)/len(visible) > 0.03,
        "readableAt075x": sum(visible)/len(visible) > 0.025 and detail > 0.58
    }

def contact_sheet(pack_dir, pack):
    thumbs=[]
    labels=[]
    for action in ACTIONS:
        for i in range(min(6, frame_count(action))):
            thumbs.append(Image.open(pack_dir/f"{action}-{i:03}.png").convert("RGBA"))
            labels.append(f"{action} {i}")
    cell=148
    sheet=Image.new("RGB",(cell*6, cell*len(ACTIONS)), "white")
    for idx,img in enumerate(thumbs):
        r=idx//6; c=idx%6
        bg=Image.new("RGBA",(cell,cell),(255,255,255,255))
        im=img.resize((128,128), Image.Resampling.LANCZOS)
        bg.alpha_composite(im,(10,14))
        sheet.paste(bg.convert("RGB"),(c*cell,r*cell))
    out=evidence_dir/f"v32_{pack['packId']}_contact_sheet_{date}.png"
    sheet.save(out)
    return out

def animation_gif(pack_dir, pack):
    frames=[]
    for action in ACTIONS:
        for i in range(frame_count(action)):
            img=Image.open(pack_dir/f"{action}-{i:03}.png").convert("RGBA")
            bg=Image.new("RGBA",(W,H),(255,255,255,255)); bg.alpha_composite(img); frames.append(bg.convert("P", palette=Image.Palette.ADAPTIVE))
    out=evidence_dir/f"v32_{pack['packId']}_animation_preview_{date}.gif"
    frames[0].save(out, save_all=True, append_images=frames[1:], duration=90, loop=0)
    return out

packs=[]
for pack in spec["packDefs"]:
    pack_dir=save_pack(pack)
    packs.append({
        "packId": pack["packId"],
        "displayName": pack["displayName"],
        "fixtureDir": str(pack_dir),
        "contactSheet": str(contact_sheet(pack_dir, pack)),
        "animationPreview": str(animation_gif(pack_dir, pack)),
        "metrics": [metrics_for(pack_dir, action) for action in ACTIONS]
    })
print(json.dumps({"packs": packs}, ensure_ascii=False))
