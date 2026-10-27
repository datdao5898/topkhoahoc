# Dựng video dọc (1080x1920) cho một thuật ngữ từ storyboard JSON: giọng VieNeu-TTS, phụ đề, các cảnh HyperFrames.
# Chạy bằng Python của venv VieNeu (xem video/README.md):
#   <venv>/Scripts/python video/make.py logs/video/2026-10-27-slug.json C:/Users/datda/Videos/topkhoahoc/2026-10-27-slug
# Kết quả là một project HyperFrames trong thư mục đích; render bằng `npx hyperframes render` trong thư mục đó.
# Định dạng storyboard: xem scripts/daily-video-prompt.md.
import html, json, math, pathlib, re, shutil, subprocess, sys

HERE = pathlib.Path(__file__).resolve().parent
SFX_DIR = pathlib.Path.home() / ".claude" / "skills" / "media-use" / "audio" / "assets" / "sfx"
VOICE = "Quang Sơn"
HF = "hyperframes@0.8.201"
MAX_SPEECH = 84.0  # giây; dài hơn thì đọc nhanh lên, tối đa x1.15
END_HOLD = 3.0  # giữ thẻ cuối sau câu cuối

TONES = {"amber": "#f4b63f", "red": "#e8412c", "pink": "#f6d5cc", "green": "#e3ecdf", "sage": "#a9d6bd", "cream": "#efe9df"}
DEFAULT_TONE = {"phone": "amber", "reveal": "red", "timeline": "amber", "big": "pink", "chat": "green", "morph": "amber", "outro": "amber"}
INK, CREAM, ALERT = "#17140f", "#fff4e0", "#e8412c"
LIMITS = {"phone": 8, "reveal": 5, "timeline": 6, "big": 7, "chat": 7, "morph": 5, "outro": 3}


def fail(msg):
    print(f"LỖI storyboard: {msg}", file=sys.stderr)
    sys.exit(2)


def esc(s):
    return html.escape(str(s), quote=True)


def r(x):
    return f"{x:.3f}".rstrip("0").rstrip(".") or "0"


# ---------- storyboard ----------

def load(path):
    sb = json.loads(pathlib.Path(path).read_text(encoding="utf-8"))
    for key in ("term", "slug", "caption", "scenes"):
        if not sb.get(key):
            fail(f"thiếu '{key}'")
    if not 4 <= len(sb["scenes"]) <= 9:
        fail("cần 4–9 cảnh")
    if sb["scenes"][-1]["type"] != "outro":
        fail("cảnh cuối phải là 'outro'")
    if sb.get("motion", "classic") not in ("classic", "pop"):
        fail("motion chỉ nhận 'classic' hoặc 'pop'")
    for i, sc in enumerate(sb["scenes"], 1):
        t = sc.get("type")
        if t not in LIMITS:
            fail(f"cảnh {i}: type '{t}' không hợp lệ")
        if not sc.get("beats") or len(sc["beats"]) > LIMITS[t]:
            fail(f"cảnh {i} ({t}): cần 1–{LIMITS[t]} beat")
        if sc.get("tone") and sc["tone"] not in TONES:
            fail(f"cảnh {i}: tone '{sc['tone']}' không hợp lệ")
        for b in sc["beats"]:
            if not str(b.get("say", "")).strip():
                fail(f"cảnh {i}: beat thiếu 'say'")
            if len(b["say"]) > 240:
                fail(f"cảnh {i}: câu quá dài (>240 ký tự): {b['say'][:40]}…")
        if t == "phone" and sum(1 for b in sc["beats"] if b.get("line")) > 2:
            fail(f"cảnh {i}: phone tối đa 2 'line'")
        if t == "timeline" and sum(1 for b in sc["beats"] if b.get("year")) > 3:
            fail(f"cảnh {i}: timeline tối đa 3 mốc")
        if t == "outro" and sum(1 for b in sc["beats"] if b.get("line")) > 2:
            fail(f"cảnh {i}: outro tối đa 2 'line'")
        if t == "morph" and (sum(1 for b in sc["beats"] if b.get("from")) > 3 or any(b.get("from") and not b.get("to") for b in sc["beats"])):
            fail(f"cảnh {i}: morph tối đa 3 cặp 'from' + 'to'")
    return sb


# ---------- giọng đọc ----------

def ffdur(p):
    return float(subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(p)]).strip())


def syllables(text):
    # tiếng Việt: mỗi chữ một âm tiết; chữ tiếng Anh (không dấu) đếm theo cụm nguyên âm
    n = 0
    for w in re.findall(r"[\wÀ-ỹ]+", text):
        n += len(re.findall(r"[aeiouy]+", w.lower())) or 1 if w.isascii() and not w.isdigit() else 1
    return max(1, n)


def gap_after(text, last_in_scene):
    if last_in_scene:
        return 0.55
    end = text.strip()[-1]
    return {".": 0.32, "!": 0.32, "?": 0.32, ":": 0.22, ",": 0.15}.get(end, 0.2)


def voice(sb, out):
    from vieneu import Vieneu
    tmp = out / ".vo"
    tmp.mkdir(parents=True, exist_ok=True)
    tts = Vieneu()
    beats = [(si, b) for si, sc in enumerate(sb["scenes"]) for b in sc["beats"]]
    t = 0.3
    parts = [(None, 0.3)]
    for n, (si, b) in enumerate(beats):
        text = b["say"].strip()
        for attempt in range(4):
            raw, cut = tmp / f"{n:03d}_raw.wav", tmp / f"{n:03d}.wav"
            tts.save(tts.infer(text, voice=VOICE), str(raw))
            subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", str(raw), "-af",
                            "silenceremove=start_periods=1:start_threshold=-45dB,areverse,"
                            "silenceremove=start_periods=1:start_threshold=-45dB,areverse,aresample=48000",
                            "-ac", "1", str(cut)], check=True)
            d = ffdur(cut)
            if 0.12 < d / syllables(text) < 0.45:
                break
            print(f"  đọc lại câu {n} (lần {attempt + 1}): {text}", flush=True)
        last = n + 1 == len(beats) or beats[n + 1][0] != si
        b["_start"], b["_dur"] = t, d
        g = gap_after(text, last)
        parts += [(cut, d), (None, g)]
        print(f"  {r(t):>6}s {text}", flush=True)
        t += d + g
    speech_end = t
    factor = 1.0
    if speech_end > MAX_SPEECH:
        factor = min(1.15, speech_end / MAX_SPEECH)
        print(f"  dài {r(speech_end)}s, đọc nhanh x{r(factor)}", flush=True)
        for _, b in beats:
            b["_start"] /= factor
            b["_dur"] /= factor
    # ghép: khoảng lặng + từng câu
    lines = []
    for f, d in parts:
        if f is None:
            p = tmp / f"sil_{int(d * 1000)}.wav"
            if not p.exists():
                subprocess.run(["ffmpeg", "-y", "-v", "error", "-f", "lavfi", "-i", "anullsrc=r=48000:cl=mono", "-t", str(d), str(p)], check=True)
            f = p
        lines.append(f"file '{pathlib.Path(f).resolve().as_posix()}'")
    (tmp / "list.txt").write_text("\n".join(lines), encoding="utf-8")
    af = f"atempo={factor}," if factor > 1 else ""
    subprocess.run(["ffmpeg", "-y", "-v", "error", "-f", "concat", "-safe", "0", "-i", str(tmp / "list.txt"),
                    "-af", af + "loudnorm=I=-15:TP=-1.5:LRA=11", "-ar", "48000", "-b:a", "192k", str(out / "assets" / "vo.mp3")], check=True)
    return beats, speech_end / factor


# ---------- phụ đề ----------

def caption_groups(text):
    clauses = re.findall(r"[^.,!?:;]+[.,!?:;]*", text.strip())
    groups = []
    for c in clauses:
        words = c.split()
        while len(words) > 6:
            k = math.ceil(len(words) / math.ceil(len(words) / 5))
            groups.append(words[:k])
            words = words[k:]
        if words:
            if groups and len(words) <= 2 and len(groups[-1]) + len(words) <= 6 and groups[-1][-1][-1] == ",":
                groups[-1] += words
            else:
                groups.append(words)
    return [" ".join(g) for g in groups]


def captions_html(beats, pop=False):
    items = []
    for _, b in beats:
        groups = caption_groups(b.get("cap") or b["say"])
        total = sum(syllables(g) for g in groups)
        acc = 0
        for g in groups:
            s = b["_start"] + b["_dur"] * acc / total
            acc += syllables(g)
            e = b["_start"] + b["_dur"] * acc / total
            items.append([g, s, e])
    marks, js = [], []
    for i, (text, s, e) in enumerate(items):
        st = max(0.1, s - 0.05)
        en = e + 0.25
        if i + 1 < len(items):
            en = min(en, items[i + 1][1] - 0.07)
        en = max(en, st + 0.5)
        js.append(f'    tl.set("#cap-{i}", {{ opacity: 1, visibility: "visible" }}, {r(st)});')
        if pop:
            words = text.split()
            marks.append(f'    <div id="cap-{i}" class="cap"><span class="cap-t">' + " ".join(f'<span id="cap-{i}-{k}" class="w">{esc(w)}</span>' for k, w in enumerate(words)) + '</span></div>')
            js += [f'    tl.fromTo("#cap-{i} .cap-t", {{ opacity: 0, scale: 0.8, rotation: {-2 if i % 2 else 2} }}, {{ opacity: 1, scale: 1, rotation: 0, duration: 0.3, ease: "back.out(2.4)" }}, {r(st)});',
                   f'    tl.fromTo("#cap-{i} .w", {{ opacity: 0, y: 26, scale: 0.6 }}, {{ opacity: 1, y: 0, scale: 1, duration: 0.24, ease: "back.out(2.6)", stagger: {r(min(0.04, 0.3 / len(words)))} }}, {r(st)});']
            total_w = sum(syllables(w) for w in words)
            acc = 0
            for k, w in enumerate(words):
                ws = s + (e - s) * acc / total_w
                acc += syllables(w)
                js += [f'    tl.set("#cap-{i}-{k}", {{ color: "{TONES["amber"]}" }}, {r(max(st, ws))});',
                       f'    tl.set("#cap-{i}-{k}", {{ color: "{CREAM}" }}, {r(max(st, s + (e - s) * acc / total_w) + 0.12)});']
        else:
            marks.append(f'    <div id="cap-{i}" class="cap"><span class="cap-t">{esc(text)}</span></div>')
            js.append(f'    tl.fromTo("#cap-{i} .cap-t", {{ opacity: 0, scale: 0.96 }}, {{ opacity: 1, scale: 1, duration: 0.12, ease: "power2.out" }}, {r(st)});')
        js += [
               f'    tl.to("#cap-{i}", {{ opacity: 0, duration: 0.08, ease: "power2.in" }}, {r(en - 0.08)});',
               f'    tl.set("#cap-{i}", {{ opacity: 0, visibility: "hidden" }}, {r(en)});']
    return f'''<template>
  <style>
{FONTS}
    #root {{ position: absolute; inset: 0; }}
    .cap {{ position: absolute; left: 0; right: 0; top: 1150px; height: 170px; display: flex; align-items: center; justify-content: center; opacity: 0; visibility: hidden; overflow: visible; }}
    .cap-t .w {{ display: inline-block; }}
    .cap-t {{ display: inline-block; max-width: 840px; text-align: center; font-family: "BVP"; font-weight: 800; font-size: 52px; line-height: 1.22; color: {CREAM}; background: rgba(23,20,15,0.86); padding: 14px 30px 18px; border-radius: 22px; }}
  </style>
  <div id="root" data-composition-id="captions" data-width="1080" data-height="1920" data-layout-allow-caption-zone>
{chr(10).join(marks)}
  </div>
  <script>
    const tl = gsap.timeline({{ paused: true }});
{chr(10).join(js)}
    window.__timelines["captions"] = tl;
  </script>
</template>
'''


# ---------- các cảnh ----------

FONTS = "\n".join(
    f'    @font-face {{ font-family: "BVP"; font-weight: {w}; src: url("assets/fonts/BeVietnamPro-{n}.ttf"); }}'
    for w, n in ((900, "Black"), (800, "ExtraBold"), (500, "Medium")))

PHONE_CSS = (HERE / "phone.css").read_text(encoding="utf-8")
FEED = (HERE / "feed.html").read_text(encoding="utf-8")


# motion "pop": hình trang trí bay lơ lửng (x, y, cỡ, loại, góc), nằm sát mép để chừa chỗ cho chữ
DECO = [(40, 40, 110, "heart", -12), (900, 110, 90, "spark", 0), (950, 560, 140, "ring", 0), (30, 720, 80, "spark", 15),
        (900, 1000, 120, "heart", 14), (70, 1040, 150, "squig", -8), (780, 1440, 100, "spark", 0), (130, 1520, 130, "ring", 0),
        (930, 1700, 110, "heart", -10), (440, 1790, 90, "spark", 20)]
SHAPES = {"heart": '<path d="M50 88C20 66 4 48 4 30C4 16 15 6 28 6C38 6 46 12 50 20C54 12 62 6 72 6C85 6 96 16 96 30C96 48 80 66 50 88Z" fill="{c}"/>',
          "spark": '<path d="M50 0C54 36 64 46 100 50C64 54 54 64 50 100C46 64 36 54 0 50C36 46 46 36 50 0Z" fill="{c}"/>',
          "ring": '<circle cx="50" cy="50" r="38" fill="none" stroke="{c}" stroke-width="12"/>',
          "squig": '<path d="M6 50Q20 18 34 50T62 50T94 50" fill="none" stroke="{c}" stroke-width="11" stroke-linecap="round"/>'}


class Scene:
    def __init__(self, sid, sc, start, prev_ground, pop=False, dur=0.0, idx=0):
        self.id, self.sc, self.start = sid, sc, start
        self.ground = TONES[sc.get("tone") or DEFAULT_TONE[sc["type"]]]
        self.prev = prev_ground
        self.css, self.html, self.js = [], [], []
        self.sfx = []  # (file, abs_time_of_hit, volume)
        self.pop, self.dur, self.idx = pop, dur, idx
        self.back, self.front = [], []  # pop: lớp dưới / trên khung "camera" chứa nội dung

    def t(self, b, off=0.0):
        return max(0.0, b["_start"] - self.start + off)

    def hit(self, name, b, vol, off=0.0):
        self.sfx.append((name, b["_start"] + off, vol))

    def enter(self, style):
        p = self.id
        if self.pop:
            return self.pop_enter()
        if self.prev is None:
            return self.ground
        if style == "flood":
            self.css.append(f"#{p}-in {{ position: absolute; inset: 0; background: {self.ground}; clip-path: circle(0% at 50% 45%); }}")
            self.html.insert(0, f'<div id="{p}-in"></div>')
            self.js.insert(0, f'tl.fromTo("#{p}-in", {{ clipPath: "circle(0% at 50% 45%)" }}, {{ clipPath: "circle(120% at 50% 45%)", duration: 0.6, ease: "power2.inOut" }}, 0);')
            return self.prev
        direction = -100 if style == "up" else 100
        self.css.append(f"#{p}-in {{ position: absolute; inset: 0; background: {self.prev}; z-index: 20; }}")
        self.html.append(f'<div id="{p}-in"></div>')
        self.js.insert(0, f'tl.fromTo("#{p}-in", {{ yPercent: 0 }}, {{ yPercent: {direction}, duration: 0.5, ease: "power3.inOut" }}, 0);')
        return self.ground

    def pop_enter(self):
        # chuyển cảnh xoay vòng: sọc chéo quét, vòng tròn bung, cảnh cũ xoay thu nhỏ
        p = self.id
        self.deco()
        if self.prev is None:
            return self.ground
        self.hit("whoosh.mp3", {"_start": self.start}, 0.35, 0.02)
        kind = ("stripes", "burst", "spin")[self.idx % 3]
        if kind == "stripes":
            self.css += [f"#{p}-in {{ position: absolute; left: -420px; top: -320px; width: 1920px; height: 2560px; transform: rotate(-14deg); }}",
                         f"#{p}-in i {{ display: block; height: 366px; background: {self.ground}; transform-origin: 0% 50%; }} #{p}-in i:nth-child(even) {{ transform-origin: 100% 50%; }}"]
            self.back.insert(0, f'<div id="{p}-in" data-layout-ignore>{"<i></i>" * 7}</div>')
            self.js.insert(0, f'tl.fromTo("#{p}-in i", {{ scaleX: 0 }}, {{ scaleX: 1, duration: 0.5, ease: "expo.inOut", stagger: 0.045 }}, 0);')
            return self.prev
        if kind == "burst":
            rings = [ALERT if self.ground != ALERT else INK, CREAM, self.ground]
            for j, c in enumerate(rings):
                self.css.append(f"#{p}-in{j} {{ position: absolute; left: -760px; top: -460px; width: 2600px; height: 2600px; border-radius: 50%; background: {c}; }}")
                self.back.insert(j, f'<div id="{p}-in{j}" data-layout-ignore></div>')
                self.js.insert(0, f'tl.fromTo("#{p}-in{j}", {{ scale: 0 }}, {{ scale: 1, duration: 0.55, ease: "power3.inOut" }}, {r(j * 0.09)});')
            return self.prev
        self.css.append(f"#{p}-in {{ position: absolute; inset: 0; background: {self.prev}; z-index: 20; }}")
        self.front.append(f'<div id="{p}-in" data-layout-ignore></div>')
        self.js.insert(0, f'tl.fromTo("#{p}-in", {{ scale: 1, rotation: 0, borderRadius: "0%" }}, {{ scale: 0, rotation: -35, borderRadius: "50%", duration: 0.6, ease: "back.in(1.3)" }}, 0);')
        return self.ground

    def deco(self):
        p = self.id
        dark = self.ground == TONES["red"]
        colors = ("rgba(255,244,224,0.35)", "rgba(23,20,15,0.22)") if dark else ("rgba(255,255,255,0.6)", "rgba(23,20,15,0.1)")
        self.css.append(f".{p}-dc {{ position: absolute; }} .{p}-dc svg {{ display: block; width: 100%; height: 100%; overflow: visible; }}")
        start = 0.6 if self.prev else 0.2
        for j, (x, y, size, kind, rot) in enumerate(DECO):
            shape = SHAPES[kind].format(c=colors[j % 2])
            self.back.append(f'<div id="{p}-dc{j}" class="{p}-dc" style="left:{x}px;top:{y}px;width:{size}px;height:{size}px" data-layout-ignore><svg id="{p}-dv{j}" viewBox="0 0 100 100">{shape}</svg></div>')
            self.js.append(f'tl.fromTo("#{p}-dv{j}", {{ scale: 0, rotation: {rot - 120} }}, {{ scale: 1, rotation: {rot}, duration: 0.6, ease: "back.out(2.2)" }}, {r(start + j * 0.05)});')
            d = 1.5 + (j % 4) * 0.35
            reps = max(0, int((self.dur - start - 0.8) / d) - 1)
            if reps:
                amp = (18 + (j % 3) * 10) * (1 if j % 2 else -1)
                self.js.append(f'tl.fromTo("#{p}-dc{j}", {{ y: 0, rotation: 0 }}, {{ y: {amp}, rotation: {12 if j % 2 else -12}, duration: {r(d)}, ease: "sine.inOut", yoyo: true, repeat: {reps} }}, {r(start + 0.6)});')

    def shake(self, at, amp=14):
        if self.pop:
            self.js.append(f'tl.fromTo("#{self.id}-cam", {{ x: 0, rotation: 0 }}, {{ x: {amp}, rotation: 0.6, duration: 0.05, ease: "none", yoyo: true, repeat: 5, immediateRender: false }}, {r(at)});')

    def blur_in(self, sel, at, dur=0.2):
        if self.pop:
            self.js.append(f'tl.fromTo("{sel}", {{ opacity: 0, scale: 0.3, rotation: -8, y: 40 }}, {{ opacity: 1, scale: 1, rotation: 0, y: 0, duration: 0.6, ease: "back.out(2.2)" }}, {r(at)});')
            return
        self.js.append(f'tl.fromTo("{sel}", {{ opacity: 0, filter: "blur(8px)" }}, {{ opacity: 1, filter: "blur(0px)", duration: {dur}, ease: "power4.out" }}, {r(at)});')

    def doc(self, root_bg, ink):
        html, js = self.html, self.js
        if self.pop:
            p = self.id
            self.css.append(f"#{p}-cam {{ position: absolute; inset: 0; transform-origin: 50% 45%; }}")
            html = self.back + [f'<div id="{p}-cam" data-layout-allow-overflow>'] + html + ["</div>"] + self.front
            js = [j.replace('"expo.out"', '"back.out(1.8)"') for j in js]
            js.append(f'tl.fromTo("#{p}-cam", {{ scale: 1 }}, {{ scale: 1.045, duration: {r(self.dur)}, ease: "none" }}, 0);')
        return f'''<template>
  <style>
{FONTS}
    #root {{ position: absolute; inset: 0; background: {root_bg}; font-family: "BVP"; color: {ink}; overflow: hidden; }}
{PHONE_CSS if self.sc["type"] == "phone" else ""}
    {chr(10).join("    " + c for c in self.css).strip()}
  </style>
  <div id="root" data-composition-id="{self.id}" data-width="1080" data-height="1920">
    {chr(10).join("    " + h for h in html).strip()}
  </div>
  <script>
    const tl = gsap.timeline({{ paused: true }});
    {chr(10).join("    " + j for j in js).strip()}
    window.__timelines["{self.id}"] = tl;
  </script>
</template>
'''


def scene_phone(s):
    p = s.id
    beats = s.sc["beats"]
    root_bg = s.enter("up") if s.prev else s.ground
    clock = next((b for b in beats if b.get("clock")), None)
    s.html.append(f'<div id="{p}-phone" class="phone"><div class="screen">'
                  f'<div id="{p}-feed" class="feed" data-layout-ignore>{FEED}{FEED}</div>'
                  f'<div id="{p}-dim" class="dim"></div>')
    if clock:
        s.html.append(f'<div id="{p}-lock" class="lock"><div class="lock-time">{esc(clock["clock"])}</div>'
                      f'<div class="lock-date">{esc(clock.get("date", ""))}</div><div class="lock-bar"></div></div>')
    notes, y_feed, lines, below = [], 0, 0, []
    for i, b in enumerate(beats):
        at = s.t(b)
        if b.get("notify"):
            n = b["notify"]
            nid = f"{p}-n{len(notes)}"
            colors = ["#3f8f6b", "#c0563f", "#d79a1e", "#7a5bb0", "#2f6e9e"]
            s.html.append(f'<div id="{nid}" class="nt"><div class="av" style="background:{colors[len(notes) % 5]}">{esc(str(n.get("from", "?"))[:1].upper())}</div>'
                          f'<div><div class="nt-t">{esc(n.get("from", ""))}</div><div class="nt-b">{esc(n.get("text", ""))}</div></div><div class="nt-dot"></div></div>')
            for k, old in enumerate(reversed(notes)):
                s.js.append(f'tl.to("#{old}", {{ y: {156 * (k + 1)}, duration: 0.45, ease: "power3.out" }}, {r(at)});')
            s.js.append(f'tl.fromTo("#{nid}", {{ y: -220, opacity: 0 }}, {{ y: 0, opacity: 1, duration: 0.55, ease: "expo.out" }}, {r(at)});')
            notes.append(nid)
            s.hit("notification.mp3" if len(notes) % 2 else "ping.mp3", b, 0.4 if len(notes) % 2 else 0.6, -0.25)
        if b.get("scroll"):
            for off in (0.15, 0.85):
                y_feed -= 400
                s.js.append(f'tl.to("#{p}-feed", {{ y: {y_feed}, duration: 0.5, ease: "power3.out" }}, {r(at + off)});')
        if b.get("line"):
            if lines == 0:
                s.js.append(f'tl.fromTo("#{p}-phone", {{ scale: 1, y: 0 }}, {{ scale: 0.6, y: -182, duration: 0.9, ease: "power2.inOut" }}, {r(max(0, at - 0.2))});')
                s.js.append(f'tl.fromTo("#{p}-dim", {{ opacity: 0 }}, {{ opacity: 0.45, duration: 0.9, ease: "power2.inOut" }}, {r(max(0, at - 0.2))});')
            lid = f"{p}-l{lines}"
            size = int(min(92 if lines == 0 else 130, 900 / (len(str(b["line"])) * 0.6)))
            s.css.append(f"#{lid} {{ position: absolute; left: 40px; right: 40px; top: {840 if lines == 0 else 960}px; text-align: center; font-weight: 900; font-size: {size}px; line-height: 1.1; letter-spacing: -0.02em; }}")
            below.append(f'<div id="{lid}">{esc(b["line"])}</div>')
            if lines == 0:
                s.blur_in(f"#{lid}", at + 0.15)
            else:
                s.js.append(f'tl.fromTo("#{lid}", {{ opacity: 0, scale: 1.12 }}, {{ opacity: 1, scale: 1, duration: 0.5, ease: "expo.out" }}, {r(at)});')
            lines += 1
        if clock and i > 0 and beats[i - 1] is clock:
            s.js.append(f'tl.fromTo("#{p}-lock", {{ yPercent: 0 }}, {{ yPercent: -100, duration: 0.55, ease: "power3.inOut" }}, {r(at)});')
    s.html.append(f'</div><div class="notch"></div></div>')
    s.html += below
    if not s.prev:
        s.css.append(f"#{p}-night {{ position: absolute; inset: 0; background: {INK}; }}")
        s.html.insert(0, f'<div id="{p}-night"></div>')
        s.js.insert(0, f'tl.fromTo("#{p}-night", {{ opacity: 0.55 }}, {{ opacity: 0, duration: 1.2, ease: "power2.inOut" }}, 0.4);')
    return s.doc(root_bg, INK)


def initials_html(word, full):
    parts = full.split()
    letters = re.sub(r"[^A-Za-zÀ-ỹ]", "", word)
    if letters.isupper() and len(letters) == len(parts) and all(w[0].upper() == c for w, c in zip(parts, letters)):
        return "".join(f"<span><b>{esc(w[0])}</b>{esc(w[1:])}</span>" for w in parts)
    return "".join(f"<span>{esc(w)}</span>" for w in parts)


def scene_reveal(s):
    p = s.id
    dark = s.ground in (TONES["red"],)
    ink = CREAM if dark else INK
    root_bg = s.enter("flood")
    word = ""
    for b in s.sc["beats"]:
        at = s.t(b)
        if b.get("kicker"):
            s.css.append(f"#{p}-k {{ position: absolute; left: 60px; right: 60px; top: 330px; text-align: center; font-weight: 500; font-size: 52px; }}")
            s.html.append(f'<div id="{p}-k">{esc(b["kicker"])}</div>')
            s.blur_in(f"#{p}-k", at)
        if b.get("word"):
            w = str(b["word"])
            size = int(min(290, 960 / max(1, len(w) * 0.66)))
            size = max(size, 110)
            unit = list(w) if len(w) <= 8 else w.split()
            sep = "" if len(w) <= 8 else "&nbsp;"
            spans = sep.join(f"<span>{esc(c) if c != ' ' else '&nbsp;'}</span>" for c in unit)
            s.css.append(f"#{p}-w {{ position: absolute; left: 30px; right: 30px; top: {420 + (290 - size) // 2}px; display: flex; flex-wrap: wrap; justify-content: center; font-weight: 900; font-size: {size}px; line-height: 1.02; letter-spacing: -0.03em; }}")
            s.css.append(f"#{p}-w span {{ display: inline-block; }}")
            s.html.append(f'<div id="{p}-w">{spans}</div>')
            if s.pop:
                # từng chữ rơi từ trên xuống, nảy, rồi rung khung
                last = 0.1 * (len(unit) - 1)
                s.js.append(f'tl.fromTo("#{p}-w span", {{ opacity: 0, y: -560, rotation: (i) => (i % 2 ? 28 : -28) }}, {{ opacity: 1, y: 0, rotation: 0, duration: 0.75, ease: "bounce.out", stagger: 0.1 }}, {r(at)});')
                s.shake(at + 0.45 + last, 18)
                s.hit("impact-bass-1.mp3", b, 0.2, 0.4 + last)
            else:
                s.js.append(f'tl.fromTo("#{p}-w span", {{ opacity: 0, scale: 1.5, filter: "blur(10px)" }}, {{ opacity: 1, scale: 1, filter: "blur(0px)", duration: 0.45, ease: "expo.out", stagger: 0.07 }}, {r(at)});')
                s.hit("impact-bass-1.mp3", b, 0.1, -0.05)
            word = w
        if b.get("full"):
            s.css.append(f"#{p}-f {{ position: absolute; left: 40px; right: 40px; top: 770px; display: flex; flex-wrap: wrap; justify-content: center; gap: 0 22px; font-size: 64px; font-weight: 500; }}")
            s.css.append(f"#{p}-f span {{ display: inline-block; color: {ink}; opacity: 0.85; }} #{p}-f b {{ font-weight: 900; }}")
            s.html.append(f'<div id="{p}-f">{initials_html(word, b["full"])}</div>')
            if s.pop:
                s.js.append(f'tl.fromTo("#{p}-f span", {{ opacity: 0, scale: 0, rotation: 14 }}, {{ opacity: 0.9, scale: 1, rotation: 0, duration: 0.5, ease: "back.out(2.4)", stagger: 0.12 }}, {r(at)});')
                s.hit("pop.mp3", b, 0.35, 0.0)
            else:
                s.js.append(f'tl.fromTo("#{p}-f span", {{ opacity: 0, filter: "blur(6px)" }}, {{ opacity: 0.9, filter: "blur(0px)", duration: 0.15, ease: "power2.out", stagger: 0.2 }}, {r(at)});')
        if b.get("meaning"):
            m = str(b["meaning"])
            size = 100 if len(m) <= 18 else 76
            s.css.append(f"#{p}-m {{ position: absolute; left: 60px; right: 60px; top: 920px; text-align: center; font-weight: 900; font-size: {size}px; line-height: 1.1; letter-spacing: -0.02em; color: {INK}; }}")
            if s.pop:
                # vệt bút dạ quang quét ngang sau chữ
                w = min(960, int(len(m) * size * 0.56 + 70))
                s.css.append(f"#{p}-mk {{ position: absolute; left: {(1080 - w) // 2}px; top: {920 + int(size * 0.1)}px; width: {w}px; height: {size}px; background: {CREAM}; border-radius: 18px; transform: rotate(-2deg); transform-origin: 0% 50%; }}")
                s.html.append(f'<div id="{p}-mk"></div>')
                s.js.append(f'tl.fromTo("#{p}-mk", {{ scaleX: 0 }}, {{ scaleX: 1, duration: 0.4, ease: "power3.out" }}, {r(at)});')
                at += 0.2
            s.html.append(f'<div id="{p}-m">{esc(m)}</div>')
            s.js.append(f'tl.fromTo("#{p}-m", {{ opacity: 0, y: 30 }}, {{ opacity: 1, y: 0, duration: 0.5, ease: "expo.out" }}, {r(at)});')
    if not s.pop:
        s.hit("whoosh.mp3", {"_start": s.start}, 0.3, -0.12)
    return s.doc(root_bg, ink)


STAMPS = [(700, 210, -8), (790, 390, 6), (690, 570, -12), (780, 740, 8), (800, 880, -5), (560, 1040, 9)]


def scene_timeline(s):
    p = s.id
    root_bg = s.enter("up")
    s.css += [f".{p}-dot {{ position: absolute; left: 150px; width: 40px; height: 40px; border-radius: 50%; background: {INK}; }}",
              f".{p}-y {{ position: absolute; left: 225px; font-weight: 900; font-size: 150px; line-height: 1; letter-spacing: -0.03em; }}",
              f".{p}-n {{ position: absolute; left: 232px; right: 60px; font-weight: 500; font-size: 42px; line-height: 1.2; color: #3d372f; }}",
              f".{p}-t {{ position: absolute; left: 232px; right: 60px; font-weight: 800; font-size: 56px; line-height: 1.1; }}",
              f"#{p}-line {{ position: absolute; left: 166px; width: 8px; background: {INK}; border-radius: 4px; transform-origin: 50% 0%; }}",
              f".{p}-st {{ position: absolute; }} .{p}-stamp {{ display: inline-block; padding: 4px 18px 8px; border: 6px solid {ALERT}; border-radius: 14px; color: {ALERT}; font-weight: 900; font-size: 54px; line-height: 1.1; background: rgba(244,182,63,0.92); }}"]
    nodes = [b for b in s.sc["beats"] if b.get("year")]
    long_stamp = any(len(str(b.get("stamp", ""))) > 6 for b in s.sc["beats"])
    # đủ 3 mốc thì không còn chỗ phía dưới: dời các mốc xuống, con dấu chữ dài nằm phía trên
    ys = ([300, 575, 850] if long_stamp and len(nodes) == 3 else [260, 550, 840])[:len(nodes)]
    if len(nodes) > 1:
        s.html.append(f'<div id="{p}-line" style="top:{ys[0] + 75}px;height:{ys[-1] - ys[0]}px"></div>')
    k = 0
    for b in s.sc["beats"]:
        at = s.t(b)
        if b.get("year"):
            y = ys[k]
            s.html.append(f'<div id="{p}-d{k}" class="{p}-dot" style="top:{y + 55}px"></div>')
            s.html.append(f'<div id="{p}-y{k}" class="{p}-y" style="top:{y}px">{esc(b["year"])}</div>')
            s.js.append(f'tl.fromTo("#{p}-d{k}", {{ scale: 0 }}, {{ scale: 1, duration: 0.4, ease: "back.out(1.6)" }}, {r(at)});')
            s.js.append(f'tl.fromTo("#{p}-y{k}", {{ opacity: 0, x: -40 }}, {{ opacity: 1, x: 0, duration: 0.6, ease: "expo.out" }}, {r(at)});')
            if b.get("note"):
                s.html.append(f'<div id="{p}-n{k}" class="{p}-n" style="top:{y + 165}px">{esc(b["note"])}</div>')
                s.js.append(f'tl.fromTo("#{p}-n{k}", {{ opacity: 0 }}, {{ opacity: 1, duration: 0.3, ease: "power2.out" }}, {r(at + 0.35)});')
            if b.get("title"):
                s.html.append(f'<div id="{p}-t{k}" class="{p}-t" style="top:{y + 215}px">{esc(b["title"])}</div>')
                s.blur_in(f"#{p}-t{k}", at + 0.7)
            if k > 0:
                s.js.append(f'tl.fromTo("#{p}-line", {{ scaleY: {r((ys[k - 1] - ys[0]) / max(1, ys[-1] - ys[0]))} }}, {{ scaleY: {r((y - ys[0]) / max(1, ys[-1] - ys[0]))}, duration: 0.6, ease: "power2.inOut" }}, {r(max(0, at - 0.5))});')
            elif len(nodes) > 1:
                s.js.append(f'tl.set("#{p}-line", {{ scaleY: 0 }}, 0);')
            k += 1
        if b.get("stamp") and len(str(b["stamp"])) > 6:
            # chữ dài: một con dấu lớn ở khoảng trống phía dưới
            top = 180 if len(ys) == 3 else (ys[-1] + 420) if ys else 600
            s.html.append(f'<div class="{p}-st" style="left:0;right:0;top:{min(top, 980)}px;text-align:center;transform:rotate(-5deg)"><div id="{p}-s0" class="{p}-stamp" style="font-size:72px;border-width:8px">{esc(b["stamp"])}</div></div>')
            s.js.append(f'tl.fromTo("#{p}-s0", {{ opacity: 0, scale: 2 }}, {{ opacity: 1, scale: 1, duration: 0.3, ease: "back.out(1.6)" }}, {r(at)});')
            s.hit("pop.mp3", b, 0.5, -0.1)
            s.shake(at + 0.2)
        elif b.get("stamp"):
            for j, (x, y, rot) in enumerate(STAMPS):
                s.html.append(f'<div class="{p}-st" style="left:{x}px;top:{y}px;transform:rotate({rot}deg)" data-layout-allow-overlap data-layout-ignore><div id="{p}-s{j}" class="{p}-stamp">{esc(b["stamp"])}</div></div>')
            s.js.append(f'tl.fromTo(".{p}-stamp", {{ opacity: 0, scale: 1.8 }}, {{ opacity: 1, scale: 1, duration: 0.3, ease: "back.out(1.6)", stagger: 0.09 }}, {r(at)});')
            s.hit("pop.mp3", b, 0.5, -0.1)
    return s.doc(root_bg, INK)


def scene_big(s):
    p = s.id
    root_bg = s.enter("down")
    s.css += [f"#{p}-top {{ position: absolute; left: 40px; right: 40px; top: 240px; text-align: center; font-weight: 900; font-size: 150px; line-height: 1; letter-spacing: -0.03em; }}",
              f"#{p}-sub {{ position: absolute; left: 40px; right: 40px; top: 410px; text-align: center; font-weight: 800; font-size: 54px; }}",
              f".{p}-it {{ position: absolute; left: 60px; right: 60px; text-align: center; }}",
              f".{p}-row {{ position: absolute; left: 100px; right: 50px; display: flex; align-items: center; gap: 36px; text-align: left; }}",
              f".{p}-row svg {{ width: 140px; height: 140px; flex: none; }} .{p}-row div {{ font-weight: 800; font-size: 56px; line-height: 1.1; }}"]
    cur, y, n = [], 520, 0
    heights = {"number": 440, "head": 120, "up": 200, "down": 200, "stamp": 240, "line": 130}
    for b in s.sc["beats"]:
        at = s.t(b)
        if b.get("top"):
            size = int(min(150, 960 / max(1, len(str(b["top"])) * 0.62)))
            s.html.append(f'<div id="{p}-top" style="font-size:{size}px;top:{240 + (150 - size) // 2}px">{esc(b["top"])}</div>')
            s.js.append(f'tl.fromTo("#{p}-top", {{ opacity: 0, scale: 1.3 }}, {{ opacity: 1, scale: 1, duration: 0.5, ease: "expo.out" }}, {r(at)});')
            if b.get("sub"):
                s.html.append(f'<div id="{p}-sub">{esc(b["sub"])}</div>')
                s.blur_in(f"#{p}-sub", at + 0.5)
        for kind in ("number", "head", "up", "down", "stamp", "line"):
            if not b.get(kind):
                continue
            h = heights[kind]
            if kind in ("head", "line"):
                fs = 70 if kind == "head" else 60
                rows = math.ceil(len(str(b[kind])) * fs * 0.56 / 940)
                h = int(rows * fs * 1.12 + 26)
            elif kind in ("up", "down"):
                h = max(200, math.ceil(len(str(b[kind])) * 56 * 0.56 / 760) * 63 + 70)
            if cur and (any(c in ("number", "stamp") for _, c in cur) or y + h > 1130):
                for eid, _ in cur:
                    s.js.append(f'tl.to("#{eid}", {{ opacity: 0, filter: "blur(8px)", duration: 0.22, ease: "power3.in" }}, {r(max(0, at - 0.3))});')
                cur, y = [], 520
            eid = f"{p}-i{n}"
            n += 1
            v = b[kind]
            if kind == "number":
                v = v if isinstance(v, dict) else {"value": v}
                s.html.append(f'<div id="{eid}" class="{p}-it" style="top:{y}px;height:440px">'
                              f'<div style="font-weight:500;font-size:48px">{esc(v.get("pre", ""))}</div>'
                              f'<div style="font-weight:900;font-size:{300 if len(str(v.get("value", ""))) <= 4 else 190}px;line-height:1;letter-spacing:-0.04em;color:#c42f1c">{esc(v.get("value", ""))}</div>'
                              f'<div style="font-weight:800;font-size:60px">{esc(v.get("label", ""))}</div></div>')
                s.js.append(f'tl.fromTo("#{eid}", {{ opacity: 0, y: 60 }}, {{ opacity: 1, y: 0, duration: 0.6, ease: "expo.out" }}, {r(at)});')
            elif kind in ("head", "line"):
                size = 70 if kind == "head" else 60
                s.html.append(f'<div id="{eid}" class="{p}-it" style="top:{y}px;font-weight:{900 if kind == "head" else 800};font-size:{size}px;line-height:1.1">{esc(v)}</div>')
                s.blur_in(f"#{eid}", at)
            elif kind in ("up", "down"):
                path = "M50 92 V14 M20 42 L50 12 L80 42" if kind == "up" else "M50 8 V86 M20 58 L50 88 L80 58"
                color = INK if kind == "up" else ALERT
                s.html.append(f'<div id="{eid}" class="{p}-row" style="top:{y}px;height:180px"><svg viewBox="0 0 100 100"><path id="{eid}-a" d="{path}" fill="none" stroke="{color}" stroke-width="12" stroke-linecap="round" stroke-linejoin="round" /></svg><div>{esc(v)}</div></div>')
                s.js.append(f'tl.fromTo("#{eid}", {{ opacity: 0 }}, {{ opacity: 1, duration: 0.2, ease: "power2.out" }}, {r(at)});')
                s.js.append(f'tl.fromTo("#{eid}-a", {{ strokeDasharray: 260, strokeDashoffset: 260 }}, {{ strokeDashoffset: 0, duration: 0.6, ease: "power2.out" }}, {r(at)});')
            elif kind == "stamp":
                s.html.append(f'<div class="{p}-it" style="top:{y + 40}px;transform:rotate(-6deg)"><div id="{eid}" style="display:inline-block;padding:10px 34px 16px;border:10px solid {ALERT};border-radius:22px;color:{ALERT};font-weight:900;font-size:{92 if len(str(v)) <= 14 else 66}px;line-height:1.1">{esc(v)}</div></div>')
                s.js.append(f'tl.fromTo("#{eid}", {{ opacity: 0, scale: 2.2 }}, {{ opacity: 1, scale: 1, duration: 0.3, ease: "back.out(1.6)" }}, {r(at)});')
                s.hit("pop.mp3", b, 0.5, -0.1)
                s.shake(at + 0.2)
            cur.append((eid, kind))
            y += h
    return s.doc(root_bg, INK)


def scene_chat(s):
    p = s.id
    root_bg = s.enter("up")
    title = s.sc.get("title", "Nhóm chat")
    s.css += [f"#{p}-hd {{ position: absolute; left: 60px; right: 60px; top: 210px; height: 90px; display: flex; align-items: center; gap: 20px; font-weight: 800; font-size: 46px; border-bottom: 4px solid rgba(23,20,15,0.12); }}",
              f"#{p}-hd i {{ width: 64px; height: 64px; border-radius: 50%; background: {ALERT}; display: block; }}",
              f"#{p}-col {{ position: absolute; left: 0; right: 0; top: 0; }}",
              f"#{p}-clip {{ position: absolute; left: 0; right: 0; top: 320px; height: 810px; overflow: hidden; }}",
              f".{p}-b {{ position: absolute; max-width: 760px; padding: 18px 28px 22px; border-radius: 34px; font-weight: 500; font-size: 44px; line-height: 1.25; }}",
              f".{p}-L {{ left: 60px; background: #fff; border-bottom-left-radius: 10px; transform-origin: 0% 100%; }}",
              f".{p}-R {{ right: 60px; background: {INK}; color: {CREAM}; border-bottom-right-radius: 10px; transform-origin: 100% 100%; }}",
              f".{p}-nm {{ display: block; font-weight: 800; font-size: 30px; color: #6a6257; margin-bottom: 4px; }}"]
    s.html.append(f'<div id="{p}-hd"><i></i>{esc(title)}</div><div id="{p}-clip" data-layout-allow-overflow><div id="{p}-col">')
    y, k, shift = 20, 0, 0
    for b in s.sc["beats"]:
        if not b.get("bubble"):
            continue
        at = s.t(b)
        bb = b["bubble"]
        side = "R" if bb.get("side") == "right" else "L"
        text = str(bb.get("text", ""))
        lines = math.ceil(len(text) / 27) + (1 if side == "L" and bb.get("name") else 0) * 0.7
        h = int(lines * 56 + 44)
        name = f'<span class="{p}-nm">{esc(bb["name"])}</span>' if side == "L" and bb.get("name") else ""
        s.html.append(f'<div id="{p}-b{k}" class="{p}-b {p}-{side}" style="top:{y}px">{name}{esc(text)}</div>')
        if y + h - shift > 790:
            shift = y + h - 790
            s.js.append(f'tl.to("#{p}-col", {{ y: {-shift}, duration: 0.45, ease: "power3.out" }}, {r(at)});')
        if s.pop:
            s.js.append(f'tl.fromTo("#{p}-b{k}", {{ opacity: 0, y: 60, scale: 0.2, rotation: {-7 if side == "L" else 7} }}, {{ opacity: 1, y: 0, scale: 1, rotation: 0, duration: 0.6, ease: "back.out(2.2)" }}, {r(at)});')
        else:
            s.js.append(f'tl.fromTo("#{p}-b{k}", {{ opacity: 0, y: 40, scale: 0.94 }}, {{ opacity: 1, y: 0, scale: 1, duration: 0.45, ease: "expo.out" }}, {r(at)});')
        s.hit("click-soft.mp3", b, 0.7, -0.05)
        y += h + 26
        k += 1
    s.html.append("</div></div>")
    return s.doc(root_bg, INK)


def scene_outro(s, end_local):
    p = s.id
    root_bg = s.enter("up")
    k, y = 0, 380
    for b in s.sc["beats"]:
        if b.get("line"):
            text = str(b["line"])
            size = int(max(72, min(100, 980 / (len(text) * 0.56))))
            rows = math.ceil(len(text) * size * 0.56 / 980)
            s.css.append(f"#{p}-l{k} {{ position: absolute; left: 40px; right: 40px; top: {y}px; text-align: center; font-weight: 900; font-size: {size}px; line-height: 1.1; letter-spacing: -0.02em; }}")
            y += int(rows * size * 1.12 + 18)
            s.html.append(f'<div id="{p}-l{k}">{esc(b["line"])}</div>')
            s.blur_in(f"#{p}-l{k}", s.t(b))
            k += 1
    card = max(0.5, end_local - 2.6)
    url = "topkhoahoc.online"
    spans = "".join(f'<span{" class=dot" if c == "." else ""}>{c}</span>' for c in url)
    s.css += [f"#{p}-rule {{ position: absolute; left: 390px; top: 760px; width: 300px; height: 8px; border-radius: 4px; background: {INK}; }}",
              f"#{p}-k {{ position: absolute; left: 0; right: 0; top: 820px; text-align: center; font-weight: 800; font-size: 44px; letter-spacing: 0.06em; }}",
              f"#{p}-url {{ position: absolute; left: 0; right: 0; top: 900px; display: flex; justify-content: center; font-weight: 900; font-size: 84px; letter-spacing: -0.02em; }}",
              f"#{p}-url span {{ display: inline-block; }} #{p}-url .dot {{ color: {ALERT}; }}"]
    s.html += [f'<div id="{p}-rule"></div>', f'<div id="{p}-k">MỖI NGÀY MỘT THUẬT NGỮ</div>', f'<div id="{p}-url">{spans}</div>']
    s.js += [f'tl.fromTo("#{p}-rule", {{ scaleX: 0 }}, {{ scaleX: 1, duration: 0.5, ease: "expo.out" }}, {r(card - 0.3)});',
             f'tl.fromTo("#{p}-k", {{ opacity: 0 }}, {{ opacity: 1, duration: 0.3, ease: "power2.out" }}, {r(card - 0.2)});',
             f'tl.fromTo("#{p}-url span", {{ opacity: 0, y: -90 }}, {{ opacity: 1, y: 0, duration: 0.55, ease: "bounce.out", stagger: 0.03 }}, {r(card)});' if s.pop else
             f'tl.fromTo("#{p}-url span", {{ opacity: 0 }}, {{ opacity: 1, duration: 0.01, stagger: 0.03 }}, {r(card)});']
    return s.doc(root_bg, INK)


def scene_morph(s):
    # đọc lệch âm: chữ gốc hiện, bị gạch, mũi tên vẽ ra, chữ mới rơi xuống nảy vào ô
    p = s.id
    root_bg = s.enter("down")
    s.css += [f"#{p}-ti {{ position: absolute; left: 40px; right: 40px; top: 220px; text-align: center; font-weight: 900; font-size: 84px; line-height: 1.05; letter-spacing: -0.02em; }}",
              f".{p}-fr {{ position: absolute; left: 50px; width: 430px; height: 170px; display: flex; align-items: center; justify-content: center; font-weight: 900; font-size: 120px; letter-spacing: -0.02em; }}",
              f".{p}-x {{ position: absolute; left: 60px; right: 60px; top: 50%; height: 14px; margin-top: -4px; border-radius: 7px; background: {ALERT}; transform-origin: 0% 50%; }}",
              f".{p}-ar {{ position: absolute; left: 470px; width: 140px; height: 170px; }}",
              f".{p}-to {{ position: absolute; left: 600px; width: 430px; height: 170px; display: flex; align-items: center; justify-content: center; }}",
              f".{p}-to span {{ display: inline-block; padding: 4px 40px 18px; border-radius: 34px; background: {INK}; color: {CREAM}; font-weight: 900; font-size: 116px; line-height: 1.1; letter-spacing: -0.02em; }}",
              f"#{p}-st {{ position: absolute; left: 0; right: 0; top: 600px; text-align: center; transform: rotate(-8deg); }}",
              f"#{p}-st span {{ display: inline-block; padding: 8px 40px 18px; border: 12px solid {ALERT}; border-radius: 26px; color: {ALERT}; background: {CREAM}; font-weight: 900; font-size: 128px; line-height: 1.05; }}"]
    if s.sc.get("title"):
        s.html.append(f'<div id="{p}-ti">{esc(s.sc["title"])}</div>')
        s.blur_in(f"#{p}-ti", 0.35)
    k = 0
    for b in s.sc["beats"]:
        at = s.t(b)
        if b.get("from"):
            y = 410 + k * 230
            s.html += [f'<div id="{p}-fr{k}" class="{p}-fr" style="top:{y}px">{esc(b["from"])}<i id="{p}-x{k}" class="{p}-x"></i></div>',
                       f'<svg id="{p}-ar{k}" class="{p}-ar" style="top:{y}px" viewBox="0 0 140 170"><path id="{p}-ap{k}" d="M14 85H118M90 55L122 85L90 115" fill="none" stroke="{INK}" stroke-width="13" stroke-linecap="round" stroke-linejoin="round"/></svg>',
                       f'<div class="{p}-to" style="top:{y}px"><span id="{p}-to{k}">{esc(b["to"])}</span></div>']
            s.js += [f'tl.fromTo("#{p}-fr{k}", {{ opacity: 0, scale: 0, rotation: -14 }}, {{ opacity: 1, scale: 1, rotation: 0, duration: 0.5, ease: "back.out(2.2)" }}, {r(at)});',
                     f'tl.fromTo("#{p}-x{k}", {{ scaleX: 0 }}, {{ scaleX: 1, duration: 0.25, ease: "power2.out" }}, {r(at + 0.5)});',
                     f'tl.fromTo("#{p}-fr{k}", {{ opacity: 1 }}, {{ opacity: 0.45, duration: 0.25, ease: "power1.out", immediateRender: false }}, {r(at + 0.6)});',
                     f'tl.fromTo("#{p}-ap{k}", {{ strokeDasharray: 240, strokeDashoffset: 240 }}, {{ strokeDashoffset: 0, duration: 0.4, ease: "power2.out" }}, {r(at + 0.6)});',
                     f'tl.fromTo("#{p}-to{k}", {{ opacity: 0, y: -300, scale: 0.4, rotation: 22 }}, {{ opacity: 1, y: 0, scale: 1, rotation: 0, duration: 0.9, ease: "elastic.out(1, 0.5)" }}, {r(at + 0.85)});']
            s.hit("click-soft.mp3", b, 0.6, 0.5)
            s.hit("pop.mp3", b, 0.45, 0.9)
            k += 1
        if b.get("stamp"):
            # con dấu đập lên giữa các hàng: các hàng lùi lại cho dấu nổi bật
            s.html.append(f'<div id="{p}-st" data-layout-allow-overlap><span id="{p}-sv">{esc(b["stamp"])}</span></div>')
            if k:
                rows = ", ".join(f"#{p}-fr{j}, #{p}-ar{j}, #{p}-to{j}" for j in range(k))
                s.js.append(f'tl.fromTo("{rows}", {{ opacity: (i, el) => el.id.includes("-fr") ? 0.45 : 1 }}, {{ opacity: 0.2, duration: 0.25, ease: "power2.out", immediateRender: false }}, {r(at - 0.05)});')
            s.js.append(f'tl.fromTo("#{p}-sv", {{ opacity: 0, scale: 2.4 }}, {{ opacity: 1, scale: 1, duration: 0.32, ease: "back.out(1.6)" }}, {r(at)});')
            s.hit("pop.mp3", b, 0.55, -0.1)
            s.shake(at + 0.22, 18)
    return s.doc(root_bg, INK)


BUILDERS = {"morph": scene_morph, "phone": scene_phone, "reveal": scene_reveal, "timeline": scene_timeline, "big": scene_big, "chat": scene_chat}


def build(sb, out, beats, speech_end):
    total = round(speech_end + END_HOLD, 2)
    scenes = sb["scenes"]
    starts = [0.0] + [max(0.0, sc["beats"][0]["_start"] - 0.25) for sc in scenes[1:]]
    ends = starts[1:] + [total]
    hosts, sfx, prev = [], [], None
    pop = sb.get("motion") == "pop"
    (out / "compositions").mkdir(exist_ok=True)
    for i, sc in enumerate(scenes):
        sid = f"s{i + 1}"
        s = Scene(sid, sc, starts[i], prev, pop, ends[i] - starts[i], i)
        doc = scene_outro(s, ends[i] - starts[i]) if sc["type"] == "outro" else BUILDERS[sc["type"]](s)
        (out / "compositions" / f"{sid}.html").write_text(doc, encoding="utf-8")
        hosts.append(f'      <div id="{sid}" data-composition-id="{sid}" data-composition-src="compositions/{sid}.html" data-start="{r(starts[i])}" data-duration="{r(ends[i] - starts[i])}" data-track-index="1" data-track-kind="graphics" data-width="1080" data-height="1920"></div>')
        sfx += s.sfx
        prev = s.ground
    (out / "compositions" / "captions.html").write_text(captions_html(beats, pop), encoding="utf-8")
    audio = ['      <audio id="vo" class="clip" src="assets/vo.mp3" data-start="0" data-track-index="3" data-volume="1"></audio>']
    for j, (name, at, vol) in enumerate(sfx):
        audio.append(f'      <audio id="sfx-{j}" class="clip" src="assets/sfx/{name}" data-start="{r(max(0, at))}" data-track-index="{4 + j}" data-volume="{vol}"></audio>')
    index = f'''<!doctype html>
<html lang="vi">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=1080, height=1920" />
    <script src="https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/gsap.min.js"></script>
    <style>
      * {{ margin: 0; padding: 0; box-sizing: border-box; }}
      html, body {{ margin: 0; width: 1080px; height: 1920px; overflow: hidden; background: {TONES["amber"]}; }}
      #root {{ width: 100%; height: 100%; position: relative; }}
    </style>
  </head>
  <body>
    <div id="root" data-composition-id="main" data-start="0" data-duration="{r(total)}" data-width="1080" data-height="1920">
{chr(10).join(hosts)}
      <div id="captions" data-composition-id="captions" data-composition-src="compositions/captions.html" data-start="0" data-duration="{r(total)}" data-track-index="2" data-track-kind="captions" data-width="1080" data-height="1920" style="z-index: 10"></div>
{chr(10).join(audio)}
    </div>
    <script>
      const tl = gsap.timeline({{ paused: true }});
      window.__timelines["main"] = tl;
    </script>
  </body>
</html>
'''
    (out / "index.html").write_text(index, encoding="utf-8")
    return total


def scaffold(out, name):
    (out / "assets" / "fonts").mkdir(parents=True, exist_ok=True)
    (out / "assets" / "sfx").mkdir(parents=True, exist_ok=True)
    for f in (HERE / "fonts").glob("*.ttf"):
        shutil.copy(f, out / "assets" / "fonts" / f.name)
    for f in ("notification", "ping", "pop", "whoosh", "impact-bass-1", "click-soft"):
        shutil.copy(SFX_DIR / f"{f}.mp3", out / "assets" / "sfx" / f"{f}.mp3")
    (out / "hyperframes.json").write_text(json.dumps({"$schema": "https://hyperframes.heygen.com/schema/hyperframes.json",
        "registry": "https://raw.githubusercontent.com/heygen-com/hyperframes/main/registry",
        "paths": {"blocks": "compositions", "components": "compositions/components", "assets": "assets"},
        "media": {"autoProxy": True}}, indent=2), encoding="utf-8")
    (out / "meta.json").write_text(json.dumps({"id": name, "name": name}, indent=2), encoding="utf-8")
    (out / "package.json").write_text(json.dumps({"name": name, "private": True, "type": "module", "scripts": {
        "dev": f"npx --yes {HF} preview", "check": f"npx --yes {HF} check", "render": f"npx --yes {HF} render"}}, indent=2), encoding="utf-8")


def main():
    if len(sys.argv) < 3:
        print("make.py <storyboard.json> <out_dir> [--no-voice]")
        sys.exit(1)
    sb = load(sys.argv[1])
    out = pathlib.Path(sys.argv[2])
    out.mkdir(parents=True, exist_ok=True)
    scaffold(out, out.name)
    shutil.copy(sys.argv[1], out / "storyboard.json")
    timing = out / ".vo" / "timing.json"
    if "--no-voice" in sys.argv and timing.exists():
        data = json.loads(timing.read_text(encoding="utf-8"))
        beats = [(si, b) for si, sc in enumerate(sb["scenes"]) for b in sc["beats"]]
        for (_, b), (st, du) in zip(beats, data["beats"]):
            b["_start"], b["_dur"] = st, du
        speech_end = data["end"]
    else:
        print("Tạo giọng đọc…", flush=True)
        beats, speech_end = voice(sb, out)
        timing.write_text(json.dumps({"beats": [[b["_start"], b["_dur"]] for _, b in beats], "end": speech_end}), encoding="utf-8")
    total = build(sb, out, beats, speech_end)
    print(f"OK: {out} ({r(total)} s)")


if __name__ == "__main__":
    main()
