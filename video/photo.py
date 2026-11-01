# Dựng video thuật ngữ kiểu "photo" (mặc định từ 2026-11-01, theo bản demo déjà vu):
# ảnh thật CC0 từ Wikimedia Commons (ảnh Unsplash) + Ken Burns + hoà tan + thẻ chữ/icon SVG vẽ nét,
# giọng VieNeu "Hải Đăng", phụ đề kiểu pop. Định dạng storyboard: scripts/daily-video-prompt.md.
# Chạy bằng Python của venv VieNeu:
#   <venv>/Scripts/python -X utf8 video/photo.py logs/video/2026-11-01-red-flag.json C:/Users/datda/Videos/topkhoahoc/2026-11-01-red-flag [--no-voice]
# Muốn tự chọn ảnh: bỏ file <out>/assets/photos/<id>.jpg vào trước (đã có thì không tải lại).
import json, math, pathlib, subprocess, sys, time, urllib.parse, urllib.request

HERE = pathlib.Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))
import make as M  # noqa: E402

M.VOICE = "Hải Đăng"
r, esc, fail = M.r, M.esc, M.fail
W, H = 1080, 1920
XF = 0.5          # hoà tan giữa ảnh / giữa cảnh
AMBER, CREAM, INK = "#f4b63f", "#fff4e0", "#17140f"
UA = "topkhoahoc-video/1.0 (https://topkhoahoc.online)"
API = "https://commons.wikimedia.org/w/api.php"

C = "M4 24 A20 20 0 1 0 44 24 A20 20 0 1 0 4 24"
ICONS = {
    "question": [C, "M18 18 C18 11 30 11 30 18 C30 23 24 23 24 29", "M24 35 V35.5"],
    "eye":      ["M4 24 C11 13 37 13 44 24 C37 35 11 35 4 24 Z", "M17 24 A7 7 0 1 0 31 24 A7 7 0 1 0 17 24"],
    "spark":    ["M24 4 C26 18 30 22 44 24 C30 26 26 30 24 44 C22 30 18 26 4 24 C18 22 22 18 24 4 Z"],
    "book":     ["M6 10 C14 8 20 9 24 13 C28 9 34 8 42 10 V38 C34 36 28 37 24 41 C20 37 14 36 6 38 Z", "M24 13 V41"],
    "brain":    ["M24 9 C18 4 10 8 11 15 C5 17 5 26 10 28 C8 35 15 40 21 37 C22 41 24 41 24 41 V9",
                 "M24 9 C30 4 38 8 37 15 C43 17 43 26 38 28 C40 35 33 40 27 37 C26 41 24 41 24 41", "M16 21 L20 24 M32 21 L28 24"],
    "users":    ["M11 16 A6 6 0 1 0 23 16 A6 6 0 1 0 11 16", "M5 38 C5 30 11 26 17 26 C23 26 29 30 29 38",
                 "M28 13 A5 5 0 1 0 38 13 A5 5 0 1 0 28 13", "M31 22 C38 22 43 26 43 34"],
    "battery":  ["M5 16 H39 V32 H5 Z", "M39 21 H43 V27 H39", "M9 20 H14 V28 H9 Z"],
    "smile":    [C, "M15 28 C19 34 29 34 33 28", "M17 18 V19.5 M31 18 V19.5"],
    "heart":    ["M24 41 C10 31 4 24 4 16 C4 10 9 6 14 6 C18 6 22 9 24 12 C26 9 30 6 34 6 C39 6 44 10 44 16 C44 24 38 31 24 41 Z"],
    "flag":     ["M10 44 V5", "M10 7 C18 3 24 11 32 7 C35 6 38 6 40 7 V27 C38 26 35 26 32 27 C24 31 18 23 10 27"],
    "alert":    ["M24 6 L44 40 H4 Z", "M24 19 V29", "M24 34 V34.5"],
    "chat":     ["M6 10 H42 V32 H22 L12 40 V32 H6 Z", "M14 19 H34 M14 25 H27"],
    "phone":    ["M15 4 H33 A3 3 0 0 1 36 7 V41 A3 3 0 0 1 33 44 H15 A3 3 0 0 1 12 41 V7 A3 3 0 0 1 15 4 Z", "M21 38 H27"],
    "clock":    [C, "M24 12 V24 L32 29"],
    "check":    [C, "M15 25 L21 31 L33 18"],
    "cross":    [C, "M17 17 L31 31 M31 17 L17 31"],
    "bulb":     ["M17 30 C11 26 10 20 12 15 C14 9 19 6 24 6 C29 6 34 9 36 15 C38 20 37 26 31 30 V35 H17 Z", "M19 40 H29", "M21 44 H27"],
    "star":     ["M24 5 L29.5 17.5 L43 18.8 L32.8 27.8 L35.8 41 L24 34 L12.2 41 L15.2 27.8 L5 18.8 L18.5 17.5 Z"],
    "money":    [C, "M29 17 C27 15 25 15 24 15 C20 15 18 17 18 19.5 C18 25 30 22 30 28.5 C30 31 28 33 24 33 C22 33 20 32 18 30", "M24 11 V15 M24 33 V37"],
    "chart":    ["M6 42 H42", "M10 34 L19 24 L26 30 L40 14", "M32 14 H40 V22"],
    "fire":     ["M24 44 C14 44 9 37 10 29 C11 21 18 18 18 9 C25 13 28 19 27 25 C29 23 31 21 31 17 C36 22 39 28 38 33 C37 40 31 44 24 44 Z"],
    "globe":    [C, "M4 24 H44", "M24 4 C15 15 15 33 24 44 C33 33 33 15 24 4"],
    "lock":     ["M11 22 H37 V43 H11 Z", "M16 22 V15 C16 10 20 6 24 6 C28 6 32 10 32 15 V22", "M24 30 V35"],
    "shield":   ["M24 4 L40 10 V22 C40 32 33 40 24 44 C15 40 8 32 8 22 V10 Z", "M17 24 L22 29 L31 19"],
    "music":    ["M18 36 V10 L40 6 V32", "M8 36 A5 5 0 1 0 18 36 A5 5 0 1 0 8 36", "M30 32 A5 5 0 1 0 40 32 A5 5 0 1 0 30 32"],
    "coffee":   ["M8 16 H34 V30 C34 37 29 42 21 42 C13 42 8 37 8 30 Z", "M34 20 H38 C42 20 42 28 38 28 H34", "M15 6 V10 M21 6 V10 M27 6 V10"],
    "search":   ["M6 20 A14 14 0 1 0 34 20 A14 14 0 1 0 6 20", "M30 30 L43 43"],
}


# ---------- storyboard ----------

def load(path):
    sb = json.loads(pathlib.Path(path).read_text(encoding="utf-8"))
    for key in ("term", "slug", "caption", "photos", "scenes"):
        if not sb.get(key):
            fail(f"thiếu '{key}'")
    photos, scenes = sb["photos"], sb["scenes"]
    if not isinstance(photos, dict) or not 5 <= len(photos) <= 12:
        fail("'photos' phải là object 5–12 ảnh, dạng {\"p1\": [\"english words\", \"từ khoá dự phòng\"]}")
    for pid, q in photos.items():
        if not (isinstance(q, str) and q.strip()) and not (isinstance(q, list) and q and all(isinstance(x, str) and x.strip() for x in q)):
            fail(f"ảnh {pid}: từ khoá phải là chuỗi hoặc danh sách chuỗi tiếng Anh")
    if not 5 <= len(scenes) <= 9:
        fail("cần 5–9 cảnh")
    if not scenes[-1].get("outro"):
        fail("cảnh cuối phải có \"outro\": true")
    used = set()
    for i, sc in enumerate(scenes, 1):
        beats = sc.get("beats") or []
        if not 1 <= len(beats) <= 4:
            fail(f"cảnh {i}: cần 1–4 beat")
        if not beats[0].get("photo"):
            fail(f"cảnh {i}: beat đầu phải có 'photo'")
        if sc.get("outro") and (i != len(scenes) or len(beats) != 1):
            fail("cảnh outro là cảnh cuối và chỉ có 1 beat")
        has_card = False
        for b in beats:
            if not str(b.get("say", "")).strip():
                fail(f"cảnh {i}: beat thiếu 'say'")
            if len(b["say"]) > 240:
                fail(f"cảnh {i}: câu quá dài (>240 ký tự): {b['say'][:40]}…")
            if b.get("photo"):
                if b["photo"] not in photos:
                    fail(f"cảnh {i}: ảnh '{b['photo']}' không có trong 'photos'")
                used.add(b["photo"])
            c = b.get("card")
            if not c:
                continue
            if sc.get("outro"):
                fail("cảnh outro không có 'card' (thẻ cuối tự thêm)")
            if c.get("keep"):
                if not has_card or not c.get("sub") or len(c) > 2:
                    fail(f"cảnh {i}: card 'keep' chỉ có 'sub', và phải đứng sau một card khác trong cùng cảnh")
                continue
            has_card = True
            if c.get("dialog"):
                d = c["dialog"]
                if not isinstance(d, dict) or not d.get("title") or not d.get("text"):
                    fail(f"cảnh {i}: dialog cần 'title' và 'text'")
                continue
            if c.get("icon", "spark") not in ICONS:
                fail(f"cảnh {i}: icon '{c.get('icon')}' không có. Dùng: {', '.join(ICONS)}")
            if not c.get("title"):
                fail(f"cảnh {i}: card thiếu 'title'")
            for line in c["title"].split("\n"):
                if len(line) > 14:
                    fail(f"cảnh {i}: dòng tiêu đề '{line}' dài quá 14 ký tự, xuống dòng bằng \\n hoặc rút gọn")
            if len(c["title"].split("\n")) > 3:
                fail(f"cảnh {i}: tiêu đề tối đa 3 dòng")
            if len(c.get("kicker", "")) > 30 or len(c.get("sub", "")) > 44:
                fail(f"cảnh {i}: kicker tối đa 30, sub tối đa 44 ký tự")
    missing = set(photos) - used
    if missing:
        fail(f"ảnh khai báo mà không dùng: {', '.join(sorted(missing))}")
    return sb


# ---------- ảnh từ Wikimedia Commons ----------

def api(**params):
    params.update(action="query", format="json")
    req = urllib.request.Request(API + "?" + urllib.parse.urlencode(params), headers={"User-Agent": UA})
    for attempt in range(4):
        try:
            with urllib.request.urlopen(req, timeout=40) as f:
                return json.load(f)
        except Exception:  # mạng chập chờn / bị giới hạn tốc độ: chờ rồi thử lại
            if attempt == 3:
                raise
            time.sleep(3 * (attempt + 1))


STOP = {"a", "an", "the", "of", "in", "on", "at", "with", "and", "to", "for", "by"}
# tên file có các chữ này thường là tranh, bản khắc, sơ đồ, hiện vật bảo tàng… không hợp video
NOT_PHOTO = ("painting", "drawing", "illustration", "engraving", "etching", "lithograph", "poster", "diagram", "map ",
             "logo", "bioart", "met dp", "museum", "cartoon", "sketch", "plate ", "woodcut", "manuscript", "stamp")
# danh mục Commons của tranh, bản in, hiện vật bảo tàng (tên file nhiều khi không lộ ra, vd. "Rembrandt - Woman Lying in Bed")
NOT_PHOTO_CATS = ("painting", "print", "drawing", "engraving", "etching", "museum", "rijksmuseum", "collection",
                  "artworks", "sculpture", "illustration", "art by", "by rembrandt", "pd-art")


def keywords(q):
    return [w for w in q.lower().replace(",", " ").split() if w not in STOP and len(w) > 1]


def title_fits(title, q):
    """Tên file phải chứa mọi từ khoá (so 4 chữ cái đầu, nên 'pills' khớp 'pill', 'doctors' khớp 'doctor').
    Bộ máy tìm kiếm của Commons khớp cả mô tả/danh mục nên hay trả ảnh lạc đề (tìm 'doctor' ra giày Dr. Martens)."""
    t = title.lower()
    return all(w[:4] in t for w in keywords(q))


def search(queries, taken):
    """Ảnh Unsplash (CC0) đầu tiên trên Commons có tên khớp từ khoá. Chỉ dùng kho Unsplash: ảnh đời thường, chất lượng
    đều; tìm rộng ra cả Commons thì hay dính ảnh tư liệu, tranh cổ không hợp. Thử lần lượt các từ khoá storyboard ghi
    (chính rồi dự phòng). Không tự bớt chữ: bớt hay làm rơi đúng danh từ chính ('woman holding pill' → ảnh ôm mèo).
    Kho Unsplash thiếu hẳn vài chủ đề (thuốc, bác sĩ, phòng lab), nên không có thì tìm cả Commons (vẫn chỉ CC0 /
    public domain, tên phải khớp, bỏ tranh vẽ, sơ đồ, ảnh .png).
    Hết từ khoá thì bỏ cuộc, daily-video.ps1 cho Claude viết lại storyboard."""
    # từng từ khoá: kho Unsplash trước, rồi cả Commons; xong mới sang từ khoá dự phòng (thường chung chung hơn)
    scopes = [(s, wide) for s in dict.fromkeys(queries) for wide in (False, True)]
    for s, wide in scopes:
        query = f"{s} filetype:bitmap" if wide else f"{s} incategory:Images_from_Unsplash filetype:bitmap"
        d = api(generator="search", gsrnamespace=6, gsrlimit=40 if wide else 20, gsrsearch=query,
                prop="imageinfo", iiprop="url|size|extmetadata|mime", iiextmetadatafilter="LicenseShortName|Categories")
        pages = sorted(d.get("query", {}).get("pages", {}).values(), key=lambda p: p.get("index", 99))
        for p in pages:
            ii = (p.get("imageinfo") or [{}])[0]
            lic = ii.get("extmetadata", {}).get("LicenseShortName", {}).get("value", "")
            if p["title"] in taken or min(ii.get("width", 0), ii.get("height", 0)) < 1100 or not title_fits(p["title"], s):
                continue
            cats = ii.get("extmetadata", {}).get("Categories", {}).get("value", "").lower()
            if wide and (ii.get("mime") != "image/jpeg" or any(w in p["title"].lower() for w in NOT_PHOTO)
                         or any(w in cats for w in NOT_PHOTO_CATS)):
                continue
            if lic.upper() == "CC0" or lic.lower().startswith("public domain"):
                return p["title"], ii, lic
    return None


def fetch_photos(sb, out):
    folder = out / "assets" / "photos"
    folder.mkdir(parents=True, exist_ok=True)
    cred_file = folder / "CREDITS.json"
    credits = json.loads(cred_file.read_text(encoding="utf-8")) if cred_file.exists() else []
    known = {c["id"]: c for c in credits}
    taken = {c["title"] for c in credits}
    for pid, q in sb["photos"].items():
        dst = folder / f"{pid}.jpg"
        if dst.exists() and pid in known and known[pid].get("query") != q:
            dst.unlink()  # storyboard đổi từ khoá (vd. viết lại sau lỗi): tải ảnh mới
            taken.discard(known.pop(pid)["title"])
        if dst.exists():
            continue  # ảnh đã tải, hoặc người dùng tự bỏ ảnh vào
        hit = search([q] if isinstance(q, str) else list(q), taken)
        if not hit:
            fail(f"không tìm được ảnh cho {pid} ({q}), đổi từ khoá tiếng Anh đơn giản hơn")
        title, ii, lic = hit
        w = min(ii["width"], math.ceil(2400 * ii["width"] / ii["height"]) + 2, 4000)
        url = api(titles=title, prop="imageinfo", iiprop="url", iiurlwidth=w)
        url = next(iter(url["query"]["pages"].values()))["imageinfo"][0].get("thumburl") or ii["url"]
        raw = folder / f"{pid}.src"
        with urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": UA}), timeout=120) as f:
            raw.write_bytes(f.read())
        # cắt sẵn đúng khung 1350x2400 (khung Ken Burns), nhẹ và đều nhau
        subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", str(raw), "-vf",
                        "scale=1350:2400:force_original_aspect_ratio=increase,crop=1350:2400", "-q:v", "3", str(dst)], check=True)
        raw.unlink()
        taken.add(title)
        known[pid] = {"id": pid, "query": q, "title": title, "license": lic, "source": ii.get("descriptionurl") or ii["url"]}
        print(f"  ảnh {pid}: {title} ({lic})", flush=True)
    cred_file.write_text(json.dumps(list(known.values()), ensure_ascii=False, indent=1), encoding="utf-8")


# ---------- dựng cảnh ----------

def icon(cls, name):
    return (f'<svg class="ico" viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">'
            + "".join(f'<path class="{cls}" pathLength="1" d="{d}"/>' for d in ICONS[name]) + "</svg>")


def title_html(eid, text, size):
    lines = text.split("\n")
    rows = "".join(f'<div class="tl"><div class="tli" id="{eid}-{i}">{esc(t)}</div></div>' for i, t in enumerate(lines))
    return f'<div class="title" style="font-size:{size}px">{rows}</div>', len(lines)


def dialog_html(cid, d):
    btns = d.get("buttons") or ["Bỏ qua", "OK"]
    note = f'<div id="{cid}-x" class="folder"><svg viewBox="0 0 48 48" fill="none" stroke="{CREAM}" stroke-width="2.4" stroke-linejoin="round"><path d="M24 6 L44 40 H4 Z"/><path d="M24 19 V29 M24 34 V34.5"/></svg><span>{esc(d["note"])}</span></div>' if d.get("note") else ""
    return f'''<div id="{cid}" class="dlg">
  <div class="dlg-h"><svg viewBox="0 0 48 48" class="dlg-i" fill="none" stroke="{INK}" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"><path d="M24 6 L44 40 H4 Z" fill="{AMBER}"/><path d="M24 19 V29 M24 34 V34.5"/></svg><div>{esc(d["title"])}</div></div>
  <div class="dlg-b">{esc(d["text"])}</div>
  <div class="dlg-f">{"".join(f'<span class="btn{" ghost" if n + 1 < len(btns) else ""}">{esc(b)}</span>' for n, b in enumerate(btns[:3]))}</div>
</div>{note}'''


def build_scene(k, sc, start, dur, term, total_scenes):
    p = f"s{k + 1}"
    html, css, js, sfx = [], [], [], []
    beats = sc["beats"]
    # --- ảnh: mỗi beat có "photo" mở một shot mới ---
    shots = [(j, b) for j, b in enumerate(beats) if b.get("photo")]
    for n, (j, b) in enumerate(shots):
        a = 0.0 if n == 0 else b["_start"] - 0.3 - start
        e = (shots[n + 1][1]["_start"] - 0.3 - start + XF) if n + 1 < len(shots) else dur
        html.append(f'<div id="{p}-sh{n}" class="shot"><img id="{p}-im{n}" src="assets/photos/{b["photo"]}.jpg" alt=""></div>')
        z0, z1 = (1.0, 1.12) if (k + n) % 2 == 0 else (1.12, 1.02)
        y0, y1 = (30, -30) if n % 2 == 0 else (-20, 20)
        js.append(f'tl.fromTo("#{p}-im{n}", {{ scale: {z0}, y: {y0} }}, {{ scale: {z1}, y: {y1}, duration: {r(e - a)}, ease: "none" }}, {r(a)});')
        js.append(f'tl.set("#{p}-sh{n}", {{ opacity: 1 }}, 0);' if not (n or k) else f'tl.fromTo("#{p}-sh{n}", {{ opacity: 0 }}, {{ opacity: 1, duration: {XF}, ease: "sine.inOut" }}, {r(a)});')
        if n:
            js.append(f'tl.set("#{p}-sh{n - 1}", {{ opacity: 0 }}, {r(a + XF + 0.05)});')
            sfx.append(("whoosh-short.mp3", start + a, 0.25))
    html.append(f'<div id="{p}-scrim" class="scrim"></div>')

    if sc.get("outro"):
        b = beats[0]
        t0 = b["_start"] - start
        card = max(t0 + 0.4, dur - 2.6)
        cx, cy, R = 540, 600, 330
        dots = "".join(f'<circle class="{p}-dot" cx="{r(cx + R * math.cos(math.radians(-90 + i * 45)))}" cy="{r(cy + R * math.sin(math.radians(-90 + i * 45)))}" r="9"/>' for i in range(8))
        url = "topkhoahoc.online"
        name = term.upper()
        fs = 150 if len(name) <= 8 else 120 if len(name) <= 11 else 96 if len(name) <= 14 else 72
        html += [f'<svg id="{p}-ring" class="full" viewBox="0 0 {W} {H}"><circle id="{p}-rc" cx="{cx}" cy="{cy}" r="{R}" pathLength="1" transform="rotate(-90 {cx} {cy})"/>{dots}</svg>',
                 f'<div id="{p}-term">{esc(name)}</div>',
                 f'<div id="{p}-k">MỖI NGÀY MỘT THUẬT NGỮ</div>',
                 f'<div id="{p}-url">' + "".join(f'<span{" class=dot" if c == "." else ""}>{c}</span>' for c in url) + "</div>"]
        css += [f"#{p}-rc {{ fill: none; stroke: {AMBER}; stroke-width: 4; stroke-dasharray: 1; }}",
                f".{p}-dot {{ fill: {CREAM}; }}",
                f"#{p}-term {{ position: absolute; left: 230px; right: 230px; top: {cy}px; transform: translateY(-50%); text-align: center; font-family: BVP; font-weight: 900; font-size: {fs}px; line-height: 1.02; letter-spacing: -0.02em; text-wrap: balance; color: {CREAM}; text-shadow: 0 6px 40px rgba(0,0,0,.5); }}",
                f"#{p}-k {{ position: absolute; left: 0; right: 0; top: 965px; text-align: center; font-family: BVP; font-weight: 800; font-size: 40px; letter-spacing: .14em; color: {AMBER}; }}",
                f"#{p}-url {{ position: absolute; left: 0; right: 0; top: 1020px; display: flex; justify-content: center; font-family: BVP; font-weight: 900; font-size: 84px; color: {CREAM}; }}",
                f"#{p}-url span {{ display: inline-block; }} #{p}-url .dot {{ color: {AMBER}; }}"]
        js += [f'tl.fromTo("#{p}-rc", {{ strokeDashoffset: 1 }}, {{ strokeDashoffset: 0, duration: 1.6, ease: "power2.inOut" }}, {r(t0)});',
               f'tl.fromTo(".{p}-dot", {{ scale: 0, opacity: 0, transformOrigin: "50% 50%" }}, {{ scale: 1, opacity: 1, duration: 0.4, ease: "back.out(2.5)", stagger: 0.12 }}, {r(t0 + 0.2)});',
               f'tl.fromTo("#{p}-term", {{ opacity: 0, scale: 1.25 }}, {{ opacity: 1, scale: 1, duration: 0.7, ease: "power4.out" }}, {r(t0 + 0.3)});',
               f'tl.fromTo("#{p}-k", {{ opacity: 0, y: 20 }}, {{ opacity: 1, y: 0, duration: 0.5, ease: "power3.out" }}, {r(card - 0.3)});',
               f'tl.fromTo("#{p}-url span", {{ opacity: 0, y: -60 }}, {{ opacity: 1, y: 0, duration: 0.5, ease: "back.out(2)", stagger: 0.03 }}, {r(card)});',
               f'tl.to("#{p}-scrim", {{ opacity: 1, duration: 0.8 }}, {r(t0)});']
        css.append(f"#{p}-scrim {{ background: rgba(10,8,6,.5) !important; opacity: 0.6; }}")
        sfx.append(("impact-bass-1.mp3", start + t0 + 0.3, 0.35))
    else:
        cards = [(j, b) for j, b in enumerate(beats) if b.get("card")]
        live = None  # (id thẻ đang hiện, toạ độ y cho dòng phụ, các phần tử cần ẩn)
        kept = []
        for n, (j, b) in enumerate(cards):
            c = b["card"]
            t = b["_start"] - start - 0.1
            cid = f"{p}-c{n}"
            if c.get("keep") and live:   # chỉ thêm dòng phụ vào thẻ đang hiện
                html.append(f'<div id="{cid}" class="subline" style="top:{live[1]}px">{esc(c["sub"])}</div>')
                js.append(f'tl.fromTo("#{cid}", {{ opacity: 0, y: 24 }}, {{ opacity: 1, y: 0, duration: 0.5, ease: "power3.out" }}, {r(t)});')
                live[2].append(cid)
                continue
            if live:
                for el in live[2]:
                    js.append(f'tl.to("#{el}", {{ opacity: 0, y: -20, duration: 0.25, ease: "power2.in" }}, {r(t - 0.3)});')
            if c.get("dialog"):
                d = c["dialog"]
                html.append(dialog_html(cid, d))
                js.append(f'tl.fromTo("#{cid}", {{ opacity: 0, scale: 0.7, y: 40 }}, {{ opacity: 1, scale: 1, y: 0, duration: 0.45, ease: "back.out(1.8)" }}, {r(t)});')
                sfx.append(("notification.mp3", start + t, 0.45))
                els = [cid]
                if d.get("note"):
                    js.append(f'tl.fromTo("#{cid}-x", {{ opacity: 0, x: -40 }}, {{ opacity: 1, x: 0, duration: 0.45, ease: "power3.out" }}, {r(t + b["_dur"] * 0.55)});')
                    sfx.append(("click-soft.mp3", start + t + b["_dur"] * 0.55, 0.4))
                    els.append(f"{cid}-x")
                live = (cid, 960, els)
                continue
            text = c["title"]
            longest = max(len(x) for x in text.split("\n"))
            size = 150 if longest <= 9 else 124 if longest <= 11 else 104
            if text.count("\n") >= 2:
                size = min(size, 108)  # 3 dòng: thu nhỏ để dòng phụ/keep không đè lên phụ đề (top 1150)
            th, nrows = title_html(f"{cid}-t", text, size)
            y_sub = 330 + 150 + 70 + int(nrows * size * 1.08) + 26
            echo = f'<div id="{cid}-echo" class="echo" data-layout-ignore style="font-size:{size}px">{"<br>".join(esc(x) for x in text.split(chr(10)))}</div>' if c.get("echo") else ""
            html.append(f'''<div id="{cid}" class="card">
  <div class="badge"><svg class="bring" viewBox="0 0 120 120"><circle id="{cid}-r" cx="60" cy="60" r="56" pathLength="1" transform="rotate(-90 60 60)"/></svg>{icon(f"{cid}-ip", c.get("icon", "spark"))}</div>
  <div class="kick" id="{cid}-k">{esc(c.get("kicker", "")).upper()}</div>
  {echo}{th}
  {f'<div class="sub" id="{cid}-s">{esc(c["sub"])}</div>' if c.get("sub") else ""}
</div>''')
            js += [f'tl.fromTo("#{cid}", {{ opacity: 0 }}, {{ opacity: 1, duration: 0.15, ease: "none" }}, {r(t)});',
                   f'tl.fromTo("#{cid}-r", {{ strokeDashoffset: 1 }}, {{ strokeDashoffset: 0, duration: 0.7, ease: "power2.inOut" }}, {r(t)});',
                   f'tl.fromTo(".{cid}-ip", {{ strokeDashoffset: 1 }}, {{ strokeDashoffset: 0, duration: 0.7, ease: "power2.out", stagger: 0.08 }}, {r(t + 0.15)});',
                   f'tl.fromTo("#{cid}-k", {{ opacity: 0, x: -30 }}, {{ opacity: 1, x: 0, duration: 0.45, ease: "power3.out" }}, {r(t + 0.1)});',
                   f'tl.fromTo("#{cid} .tli", {{ yPercent: 110 }}, {{ yPercent: 0, duration: 0.6, ease: "power4.out", stagger: 0.09 }}, {r(t + 0.2)});']
            if c.get("sub"):
                js.append(f'tl.fromTo("#{cid}-s", {{ opacity: 0, y: 24 }}, {{ opacity: 1, y: 0, duration: 0.5, ease: "power3.out" }}, {r(t + 0.6)});')
            if c.get("echo"):
                js += [f'tl.fromTo("#{cid}-echo", {{ opacity: 0, x: 0, y: 0 }}, {{ opacity: 0.55, x: 14, y: 12, duration: 0.5, ease: "power2.out" }}, {r(t + 0.5)});',
                       f'tl.to("#{cid}-echo", {{ x: 22, y: 18, opacity: 0.35, duration: {r(max(0.5, dur - t - 1.2))}, ease: "sine.inOut" }}, {r(t + 1.0)});']
                sfx.append(("impact-bass-2.mp3", start + t + 0.2, 0.35))
            else:
                sfx.append(("pop.mp3", start + t + 0.2, 0.3))
            live = (cid, y_sub + (70 if c.get("sub") else 0) + (40 if c.get("echo") else 0), [cid])
        if live and k + 1 < total_scenes:
            for el in live[2]:
                js.append(f'tl.to("#{el}", {{ opacity: 0, duration: 0.3, ease: "power2.in" }}, {r(dur - XF - 0.35)});')
        css += [
            f"#{p} .card {{ position: absolute; left: 80px; top: 330px; width: 920px; color: {CREAM}; opacity: 0; }}",
            f"#{p} .dlg, #{p} .folder, #{p} .subline {{ opacity: 0; }}",
            f"#{p} .badge {{ position: relative; width: 120px; height: 120px; color: {AMBER}; }}",
            f"#{p} .bring {{ position: absolute; inset: 0; width: 120px; height: 120px; }}",
            f"#{p} .bring circle {{ fill: rgba(10,8,6,.35); stroke: {AMBER}; stroke-width: 2.5; stroke-dasharray: 1; }}",
            f"#{p} .ico {{ position: absolute; left: 30px; top: 30px; width: 60px; height: 60px; }}",
            f"#{p} .ico path {{ stroke-dasharray: 1; }}",
            f"#{p} .kick {{ margin-top: 30px; font-family: BVP; font-weight: 800; font-size: 40px; letter-spacing: .12em; color: {AMBER}; text-shadow: 0 2px 14px rgba(0,0,0,.5); }}",
            f"#{p} .title {{ position: relative; margin-top: 8px; font-family: BVP; font-weight: 900; line-height: 1.04; letter-spacing: -0.02em; color: {CREAM}; text-shadow: 0 6px 34px rgba(0,0,0,.55); }}",
            f"#{p} .tl {{ overflow: hidden; padding-bottom: .06em; }} #{p} .tli {{ display: block; }}",
            f"#{p} .echo {{ position: absolute; left: 0; top: 198px; font-family: BVP; font-weight: 900; line-height: 1.1; letter-spacing: -0.02em; color: transparent; -webkit-text-stroke: 3px {AMBER}; opacity: 0; }}",
            f"#{p} .sub {{ margin-top: 22px; font-family: BVP; font-weight: 500; font-size: 50px; color: {CREAM}; text-shadow: 0 2px 18px rgba(0,0,0,.6); }}",
            f"#{p} .subline {{ position: absolute; left: 80px; width: 920px; font-family: BVP; font-weight: 800; font-size: 54px; line-height: 1.2; color: {AMBER}; text-shadow: 0 2px 18px rgba(0,0,0,.6); }}",
            f"#{p} .dlg {{ position: absolute; left: 110px; top: 380px; width: 860px; background: #fbf8f2; border-radius: 34px; padding: 44px 48px 40px; color: {INK}; box-shadow: 0 30px 80px rgba(0,0,0,.45); font-family: BVP; }}",
            f"#{p} .dlg-h {{ display: flex; align-items: center; gap: 22px; font-weight: 900; font-size: 56px; line-height: 1.1; }}",
            f"#{p} .dlg-i {{ width: 72px; height: 72px; flex: none; }}",
            f"#{p} .dlg-b {{ margin-top: 22px; font-weight: 500; font-size: 42px; line-height: 1.3; color: #3b352c; }}",
            f"#{p} .dlg-f {{ margin-top: 36px; display: flex; justify-content: flex-end; gap: 22px; }}",
            f"#{p} .btn {{ font-weight: 800; font-size: 38px; padding: 16px 34px; border-radius: 18px; background: {AMBER}; color: {INK}; }}",
            f"#{p} .btn.ghost {{ background: #ece6da; }}",
            f"#{p} .folder {{ position: absolute; left: 110px; top: 860px; max-width: 860px; display: flex; align-items: center; gap: 18px; padding: 18px 30px; border-radius: 22px; background: rgba(10,8,6,.62); color: {CREAM}; font-family: BVP; font-weight: 800; font-size: 44px; }}",
            f"#{p} .folder svg {{ width: 60px; height: 60px; flex: none; }}",
        ]
    doc = f'''<template>
  <style>
{M.FONTS}
    #root {{ position: absolute; inset: 0; overflow: hidden; background: #0b0907; }}
    #root .shot {{ position: absolute; inset: 0; overflow: hidden; opacity: 0; }}
    #root .shot img {{ position: absolute; left: -135px; top: -240px; width: 1350px; height: 2400px; object-fit: cover; }}
    #root .scrim {{ position: absolute; inset: 0;
      background: linear-gradient(180deg, rgba(10,8,6,.78) 0%, rgba(10,8,6,.45) 34%, rgba(10,8,6,.05) 52%, rgba(10,8,6,.15) 66%, rgba(10,8,6,.7) 100%); }}
    #root .full {{ position: absolute; inset: 0; width: {W}px; height: {H}px; overflow: visible; }}
{chr(10).join("    " + x for x in css)}
  </style>
  <div id="root" data-composition-id="{p}" data-width="{W}" data-height="{H}">
    <div id="{p}">
{chr(10).join("      " + x for x in html)}
    </div>
  </div>
  <script>
    const tl = gsap.timeline({{ paused: true }});
{chr(10).join("    " + x for x in js)}
    window.__timelines["{p}"] = tl;
  </script>
</template>
'''
    return doc, sfx


def main():
    if len(sys.argv) < 3:
        print("photo.py <storyboard.json> <out_dir> [--no-voice]")
        sys.exit(1)
    sb = load(sys.argv[1])
    out = pathlib.Path(sys.argv[2])
    out.mkdir(parents=True, exist_ok=True)
    M.scaffold(out, out.name)
    (out / "storyboard.json").write_text(pathlib.Path(sys.argv[1]).read_text(encoding="utf-8"), encoding="utf-8")
    print("Tải ảnh (Wikimedia Commons, CC0)…", flush=True)
    fetch_photos(sb, out)
    timing = out / ".vo" / "timing.json"
    beats = [(si, b) for si, sc in enumerate(sb["scenes"]) for b in sc["beats"]]
    if "--no-voice" in sys.argv and timing.exists():
        data = json.loads(timing.read_text(encoding="utf-8"))
        for (_, b), (st, du) in zip(beats, data["beats"]):
            b["_start"], b["_dur"] = st, du
        speech_end = data["end"]
    else:
        print(f"Tạo giọng đọc ({M.VOICE})…", flush=True)
        beats, speech_end = M.voice(sb, out)
        timing.write_text(json.dumps({"beats": [[b["_start"], b["_dur"]] for _, b in beats], "end": speech_end}), encoding="utf-8")
    total = round(speech_end + M.END_HOLD, 2)
    scenes = sb["scenes"]
    starts = [0.0] + [max(0.0, sc["beats"][0]["_start"] - 0.3) for sc in scenes[1:]]
    ends = starts[1:] + [total]
    (out / "compositions").mkdir(exist_ok=True)
    hosts, sfx = [], []
    for k, sc in enumerate(scenes):
        last = k + 1 == len(scenes)
        dur = ends[k] - starts[k] + (0 if last else XF)
        doc, sx = build_scene(k, sc, starts[k], dur, sb["term"], len(scenes))
        (out / "compositions" / f"s{k + 1}.html").write_text(doc, encoding="utf-8")
        sfx += sx
        hosts.append(f'      <div id="s{k + 1}" data-composition-id="s{k + 1}" data-composition-src="compositions/s{k + 1}.html" data-start="{r(starts[k])}" data-duration="{r(dur)}" data-track-index="{1 + k % 2}" data-track-kind="graphics" data-width="{W}" data-height="{H}" style="z-index:{1 + k}"></div>')
    cap = M.captions_html(beats, "pop").replace("rgba(23,20,15,0.86)", "rgba(12,10,8,0.62)")
    (out / "compositions" / "captions.html").write_text(cap, encoding="utf-8")
    audio = ['      <audio id="vo" class="clip" src="assets/vo.mp3" data-start="0" data-track-index="3" data-volume="1"></audio>']
    for j, (name, at, vol) in enumerate(sfx):
        audio.append(f'      <audio id="sfx-{j}" class="clip" src="assets/sfx/{name}" data-start="{r(max(0, at))}" data-track-index="{4 + j}" data-volume="{vol}"></audio>')
    (out / "index.html").write_text(f'''<!doctype html>
<html lang="vi">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width={W}, height={H}" />
    <script src="https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/gsap.min.js"></script>
    <style>
      * {{ margin: 0; padding: 0; box-sizing: border-box; }}
      html, body {{ margin: 0; width: {W}px; height: {H}px; overflow: hidden; background: #0b0907; }}
      #root {{ width: 100%; height: 100%; position: relative; background: #0b0907; }}
    </style>
  </head>
  <body>
    <div id="root" data-composition-id="main" data-start="0" data-duration="{r(total)}" data-width="{W}" data-height="{H}">
{chr(10).join(hosts)}
      <div id="captions" data-composition-id="captions" data-composition-src="compositions/captions.html" data-start="0" data-duration="{r(total)}" data-track-index="2" data-track-kind="captions" data-width="{W}" data-height="{H}" style="z-index: 30"></div>
{chr(10).join(audio)}
    </div>
    <script>
      window.__timelines = window.__timelines || {{}};
      window.__timelines["main"] = gsap.timeline({{ paused: true }});
    </script>
  </body>
</html>
''', encoding="utf-8")
    print(f"OK: {out} ({r(total)} s)")


if __name__ == "__main__":
    main()
