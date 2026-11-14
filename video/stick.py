# Dựng video thuật ngữ kiểu "người que" (mặc định từ 2026-11-14, theo bản HYROX):
# người que nét mực trên nền giấy tập, mỗi beat một cảnh nhân vật tương tác (chạy, đập tay, bấm hộp thoại…),
# thẻ chữ phía trên, giọng VieNeu "Hải Đăng", phụ đề pop phía dưới. Định dạng storyboard: scripts/daily-video-prompt.md.
# Phần vẽ nằm ở video/stick.js (chèn nguyên vào compositions/stick.html); file này kiểm tra storyboard,
# tạo giọng, tính thời gian từng cảnh và ráp project HyperFrames.
#   <venv>/Scripts/python -X utf8 video/stick.py logs/video/2026-11-15-x.json C:/Users/datda/Videos/topkhoahoc/2026-11-15-x [--no-voice] [--lenient]
# Lỗi storyboard → exit 2 (daily-video.ps1 cho Claude viết lại kèm thông báo lỗi).
import json, pathlib, sys

HERE = pathlib.Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))
import make as M  # noqa: E402
from photo import ICONS  # noqa: E402

M.VOICE = "Hải Đăng"
r, esc, fail = M.r, M.esc, M.fail
W, H = 1080, 1920
HOOK_HOLD = 3.0
HOOK_WORDS = 12

ACTIONS = ["stand", "walk", "run", "jump", "cheer", "think", "idea", "shrug", "facepalm", "wave", "point", "phone", "selfie",
           "laptop", "sit", "read", "sleep", "cry", "lift", "push", "pull", "carry", "dance", "angry", "love", "shock",
           "scared", "tired", "money", "eat"]
MOODS = ["happy", "grin", "sad", "shock", "tired", "angry", "neutral", "love", "scared", "proud"]
DUO = ["talk", "argue", "ignore", "highfive", "hug", "give", "chase", "doctor"]
TYPES = ["act", "duo", "phone", "chat", "panels", "dialog", "sign", "calendar", "stat", "versus", "crowd", "icons", "board"]


def check_len(where, val, n):
    if val is not None and len(str(val)) > n:
        fail(f"{where}: '{val}' dài quá {n} ký tự")


def check_scene(where, sc):
    if not isinstance(sc, dict):
        fail(f"{where}: 'scene' phải là object")
    t = sc.get("type", "act")
    if t not in TYPES:
        fail(f"{where}: loại cảnh '{t}' không có. Dùng: {', '.join(TYPES)}")
    if sc.get("mood") and sc["mood"] not in MOODS:
        fail(f"{where}: mood '{sc['mood']}' không có. Dùng: {', '.join(MOODS)}")
    if sc.get("look") and sc["look"] not in ("nam", "nu", "kinh"):
        fail(f"{where}: look chỉ là 'nam', 'nu' hoặc 'kinh'")

    def need_do(obj, w, key="do"):
        if obj.get(key) and obj[key] not in ACTIONS:
            fail(f"{w}: động tác '{obj[key]}' không có. Dùng: {', '.join(ACTIONS)}")

    if t == "act":
        if not sc.get("do"):
            fail(f"{where}: cảnh act cần 'do'")
        need_do(sc, where)
        check_len(where, sc.get("bubble"), 24); check_len(where, sc.get("think"), 18); check_len(where, sc.get("label"), 22)
    elif t == "duo":
        if sc.get("do", "talk") not in DUO:
            fail(f"{where}: duo 'do' chỉ là: {', '.join(DUO)}")
        for side in ("left", "right"):
            o = sc.get(side) or {}
            check_len(where, o.get("say"), 24); check_len(where, o.get("label"), 16)
            if o.get("mood") and o["mood"] not in MOODS:
                fail(f"{where}: mood '{o['mood']}' không có")
        check_len(where, sc.get("item"), 14)
    elif t == "phone":
        need_do(sc, where, "show")
        msgs = sc.get("msgs") or []
        if len(msgs) > 3:
            fail(f"{where}: phone tối đa 3 tin nhắn")
        for m in msgs:
            check_len(where, m.get("text") if isinstance(m, dict) else m, 40)
        check_len(where, sc.get("top"), 18)
    elif t == "chat":
        msgs = sc.get("msgs") or []
        if not 2 <= len(msgs) <= 4:
            fail(f"{where}: chat cần 2–4 tin nhắn")
        for m in msgs:
            check_len(where, m.get("text") if isinstance(m, dict) else m, 60)
        check_len(where, sc.get("name"), 20)
    elif t == "panels":
        items = sc.get("items") or []
        if not 2 <= len(items) <= 4:
            fail(f"{where}: panels cần 2–4 ô")
        for it in items:
            if not it.get("do"):
                fail(f"{where}: mỗi ô panels cần 'do'")
            need_do(it, where); check_len(where, it.get("label"), 18)
    elif t == "dialog":
        if not sc.get("title") or not sc.get("text"):
            fail(f"{where}: dialog cần 'title' và 'text'")
        check_len(where, sc["title"], 24); check_len(where, sc["text"], 40); check_len(where, sc.get("note"), 28)
        b = sc.get("buttons") or []
        if not 1 <= len(b) <= 2:
            fail(f"{where}: dialog cần 1–2 nút")
        for x in b:
            check_len(where, x, 10)
    elif t == "sign":
        if not sc.get("text"):
            fail(f"{where}: sign cần 'text'")
        check_len(where, sc["text"], 24)
    elif t == "calendar":
        if not sc.get("day"):
            fail(f"{where}: calendar cần 'day'")
        check_len(where, sc.get("month"), 16); check_len(where, sc["day"], 7); check_len(where, sc.get("stamp"), 12)
    elif t == "stat":
        if not sc.get("value"):
            fail(f"{where}: stat cần 'value'")
        check_len(where, sc["value"], 9); check_len(where, sc.get("label"), 40); need_do(sc, where)
    elif t == "versus":
        for side in ("left", "right"):
            o = sc.get(side) or {}
            if not o.get("label"):
                fail(f"{where}: versus cần 'label' cho cả left và right")
            check_len(where, o["label"], 16); need_do(o, where)
    elif t == "crowd":
        need_do(sc, where); check_len(where, sc.get("label"), 24)
    elif t == "icons":
        items = sc.get("items") or []
        if not 1 <= len(items) <= 3:
            fail(f"{where}: icons cần 1–3 mục")
        for it in items:
            if it.get("icon") not in ICONS:
                fail(f"{where}: icon '{it.get('icon')}' không có. Dùng: {', '.join(ICONS)}")
            check_len(where, it.get("label"), 14)
        need_do(sc, where)
    elif t == "board":
        lines = sc.get("lines") or []
        if not 1 <= len(lines) <= 4:
            fail(f"{where}: board cần 1–4 dòng")
        for l in lines:
            check_len(where, l, 22)


def load(path):
    sb = json.loads(pathlib.Path(path).read_text(encoding="utf-8"))
    for key in ("term", "slug", "caption", "scenes"):
        if not sb.get(key):
            fail(f"thiếu '{key}'")
    scenes = sb["scenes"]
    if not 5 <= len(scenes) <= 9:
        fail("cần 5–9 cảnh")
    if not scenes[-1].get("outro"):
        fail("cảnh cuối phải có \"outro\": true")
    opening = scenes[0].get("beats") or []
    if len(opening) < 2:
        fail("cảnh 1 cần ít nhất 2 beat: câu hook rồi tới tình huống")
    hook = opening[0]
    if len(str(hook.get("say", "")).split()) > HOOK_WORDS:
        fail(f"câu hook tối đa {HOOK_WORDS} chữ: {hook.get('say')}")
    if "dính rồi" in str(hook.get("say", "")).lower():
        fail("câu hook không dùng cụm 'dính rồi' (đã lặp nhiều), viết cách khác")
    hc = hook.get("card") or {}
    if not hc.get("title") or hc.get("keep"):
        fail("beat đầu tiên phải có thẻ chữ với 'title' (không dùng keep), để người tắt tiếng vẫn đọc được hook")
    types = []
    for i, sc in enumerate(scenes, 1):
        beats = sc.get("beats") or []
        if not 1 <= len(beats) <= 4:
            fail(f"cảnh {i}: cần 1–4 beat")
        if sc.get("outro"):
            if i != len(scenes) or len(beats) != 1:
                fail("cảnh outro là cảnh cuối và chỉ có 1 beat")
            if beats[0].get("card") or beats[0].get("scene"):
                fail("beat outro không có 'card' hay 'scene' (máy tự dựng cảnh về đích)")
        elif not beats[0].get("scene"):
            fail(f"cảnh {i}: beat đầu phải có 'scene'")
        has_card = False
        for j, b in enumerate(beats, 1):
            where = f"cảnh {i} beat {j}"
            if not str(b.get("say", "")).strip():
                fail(f"{where}: thiếu 'say'")
            if len(b["say"]) > 240:
                fail(f"{where}: câu quá dài (>240 ký tự)")
            if b.get("scene"):
                check_scene(where, b["scene"])
                if b["scene"].get("type") == "dialog" and b.get("card"):
                    fail(f"{where}: beat có dialog thì không có 'card' (hộp thoại chiếm chỗ thẻ chữ)")
                types.append(b["scene"].get("type", "act"))
            c = b.get("card")
            if not c:
                continue
            if c.get("keep"):
                if not has_card or not c.get("sub") or len(c) > 2:
                    fail(f"{where}: card 'keep' chỉ có 'sub', và phải đứng sau một card khác trong cùng cảnh")
                check_len(where, c["sub"], 40)
                continue
            has_card = True
            if not c.get("title"):
                fail(f"{where}: card thiếu 'title'")
            rows = c["title"].split("\n")
            if len(rows) > 3:
                fail(f"{where}: tiêu đề tối đa 3 dòng")
            for line in rows:
                if len(line) > 14:
                    fail(f"{where}: dòng tiêu đề '{line}' dài quá 14 ký tự, xuống dòng bằng \\n hoặc rút gọn")
            if c.get("big") and (len(rows) > 1 or len(c["title"]) > 12):
                fail(f"{where}: card 'big' chỉ 1 dòng, tối đa 12 ký tự")
            check_len(where, c.get("kicker"), 30); check_len(where, c.get("sub"), 44)
    if len(set(types)) < 4:
        fail(f"cần ít nhất 4 loại cảnh khác nhau (mới có: {', '.join(sorted(set(types)))}); dùng thêm duo, chat, panels, sign, stat…")
    plain = sum(1 for t in types if t == "act")
    if len(types) >= 6 and plain > len(types) * 0.6:
        fail(f"quá nhiều cảnh 'act' ({plain}/{len(types)}): dùng thêm duo, chat, panels, sign, stat… cho đa dạng")
    return sb


def title_size(c):
    rows = c["title"].split("\n")
    if c.get("big"):
        n = len(c["title"])
        return min(250, int(880 / max(1, 0.5 * n)))
    em = max(sum(0.25 if ch == " " else 0.76 if ch.isupper() or ch.isdigit() else 0.56 for ch in x) for x in rows)
    size = min(150 if max(len(x) for x in rows) <= 9 else 124 if max(len(x) for x in rows) <= 11 else 108, int(890 / max(em, 1)))
    budget = 410 - (50 if c.get("kicker") else 0) - (70 if c.get("sub") else 0)
    return max(72, min(size, int(budget / (len(rows) * 1.08))))


def q(x):
    return round(float(x), 3)


def plan(sb, total):
    """Tính thời gian cảnh (visuals) và thẻ chữ (cards) cho stick.js."""
    scenes = sb["scenes"]
    visuals, cards, sfx = [], [], []
    scene_start = []
    for k, sc in enumerate(scenes):
        for j, b in enumerate(sc["beats"]):
            if not (b.get("scene") or sc.get("outro")):
                continue
            t0 = 0.0 if not visuals else max(0.0, b["_start"] - 0.15)
            if k == 0 and visuals:
                t0 = max(t0, HOOK_HOLD)
            if j == 0:
                scene_start.append(t0)
            visuals.append({"t0": q(t0), "scene": {"type": "outro"} if sc.get("outro") else b["scene"], "_d": b["_dur"]})
    for i, v in enumerate(visuals):
        v["t1"] = visuals[i + 1]["t0"] if i + 1 < len(visuals) else total
    scene_end = scene_start[1:] + [total]
    for k, sc in enumerate(scenes):
        if sc.get("outro"):
            t0 = scene_start[k] + 0.25
            term = sb["term"].strip()
            if len(term) <= 12:
                end = {"title": term.upper(), "big": True}
            else:
                rows, cur = [], ""
                for w in term.split():
                    if cur and len(cur + " " + w) > 14:
                        rows.append(cur); cur = w
                    else:
                        cur = (cur + " " + w).strip()
                rows.append(cur)
                end = {"title": chr(10).join(rows[:3])}
            cards.append({"t0": q(t0), "t1": total, "kicker": "Mỗi ngày một thuật ngữ", "sub": "topkhoahoc.online", "subs": [], **end})
            continue
        for j, b in enumerate(sc["beats"]):
            c = b.get("card")
            if not c:
                continue
            if c.get("keep"):
                cards[-1]["subs"].append({"t": q(max(b["_start"] - 0.1, cards[-1]["t0"] + 0.6)), "text": c["sub"]})
                continue
            t0 = 0.0 if not cards else max(0.0, b["_start"] - 0.1)
            if k == 0 and cards:
                t0 = max(t0, HOOK_HOLD)
            if cards and cards[-1]["t1"] > t0:
                cards[-1]["t1"] = q(t0)
            cards.append({"t0": q(t0), "t1": q(scene_end[k]), "hook": not cards, "subs": [],
                          **{x: c[x] for x in ("kicker", "title", "sub", "big") if c.get(x)}})
    # hộp thoại chiếm nửa trên: ẩn thẻ chữ trong lúc hộp thoại hiện
    for v in visuals:
        if v["scene"].get("type") == "dialog":
            for c in cards:
                if c["t0"] < v["t0"] < c["t1"]:
                    c["t1"] = q(v["t0"] + 0.2)
    for c in cards:
        c["size"] = title_size(c)
        if not c.get("hook"):
            sfx.append(("impact-bass-2.mp3" if c.get("big") else "pop.mp3", c["t0"] + 0.25, 0.3))
    for i, v in enumerate(visuals):
        t0, D, ty = v["t0"], v["t1"] - v["t0"], v["scene"].get("type", "act")
        if i:
            sfx.append(("whoosh-short.mp3", t0, 0.2))
        if ty == "dialog":
            sfx.append(("notification.mp3", t0 + 0.3, 0.45))
            if len(v["scene"].get("buttons") or []) > 1:
                sfx.append(("click-soft.mp3", t0 + D * 0.38, 0.45))
            sfx.append(("click.mp3", t0 + D * 0.72, 0.35))
        if ty == "duo" and v["scene"].get("do") == "highfive":
            sfx.append(("pop.mp3", t0 + 0.58, 0.4))
        if ty == "outro":
            sfx.append(("impact-bass-1.mp3", t0 + 0.3, 0.35))
        del v["_d"]
    return visuals, cards, sfx


CSS = """
    #root { position: absolute; inset: 0; overflow: hidden; background-color: #fbf7ee;
      background-image: repeating-linear-gradient(180deg, transparent 0 63px, #e4ebf2 63px 66px); }
    #stk-margin { position: absolute; left: 58px; top: 0; bottom: 0; width: 3px; background: #f3c7c0; }
    #stk { position: absolute; left: 0; top: 0; width: 1080px; height: 1920px; overflow: visible; }
    #txt { position: absolute; inset: 0; }
    #txt .hd { position: absolute; left: 86px; top: 150px; width: 910px; opacity: 0; color: #1d1a16; }
    #txt .k { font-family: BVP; font-weight: 800; font-size: 40px; letter-spacing: .12em; color: #e4572e; }
    #txt .t { margin-top: 6px; font-family: BVP; font-weight: 900; line-height: 1.06; letter-spacing: -0.02em; }
    #txt .t.anton { font-family: Anton; font-weight: 400; letter-spacing: .02em; line-height: 1; position: relative; display: inline-block; white-space: nowrap; }
    #txt .tl { overflow: hidden; padding-bottom: .06em; }
    #txt .tli { display: block; white-space: nowrap; }
    #txt .ch { display: inline-block; position: relative; }
    #txt .bar { position: absolute; left: -12px; right: -12px; bottom: 18%; height: 34%; background: #ffd23f; transform-origin: 0 50%; }
    #txt .mk { background: linear-gradient(180deg, transparent 56%, #ffd23f 56%, #ffd23f 92%, transparent 92%); padding: 0 .06em; }
    #txt .s { margin-top: 14px; font-family: BVP; font-weight: 500; font-size: 44px; line-height: 1.25; color: #4a443b; }
    #txt .s2 { margin-top: 8px; font-family: BVP; font-weight: 800; font-size: 44px; line-height: 1.25; color: #e4572e; opacity: 0; }
    #txt .dlg { position: absolute; left: 110px; top: 430px; width: 860px; background: #ffffff; border: 7px solid #1d1a16; border-radius: 34px; padding: 40px 46px 36px; color: #1d1a16; font-family: BVP; box-shadow: 12px 14px 0 #1d1a16; opacity: 0; }
    #txt .dh { font-weight: 900; font-size: 56px; line-height: 1.1; }
    #txt .db { margin-top: 16px; font-weight: 500; font-size: 46px; line-height: 1.3; color: #3b352c; }
    #txt .df { margin-top: 30px; display: flex; justify-content: flex-end; gap: 22px; }
    #txt .btn { position: relative; font-weight: 800; font-size: 42px; padding: 16px 34px; border-radius: 18px; border: 5px solid #1d1a16; }
    #txt .btn.no { background: #ece6da; }
    #txt .btn.yes { background: #ffd23f; }
    #txt .strike { position: absolute; left: 10px; right: 10px; top: 48%; height: 8px; background: #e4572e; border-radius: 4px; transform-origin: 0 50%; }
    #txt .dnote { margin-top: 18px; text-align: right; font-weight: 900; font-size: 44px; color: #e4572e; opacity: 0; }
"""


def stick_html(spec):
    lib = (HERE / "stick.js").read_text(encoding="utf-8")
    data = json.dumps(spec, ensure_ascii=False).replace("</", "<\\/")
    return f'''<template>
  <style>
{M.FONTS}
{CSS}
  </style>
  <div id="root" data-composition-id="stick" data-width="{W}" data-height="{H}">
    <div id="stk-margin"></div>
    <svg id="stk" viewBox="0 0 {W} {H}" xmlns="http://www.w3.org/2000/svg"></svg>
    <div id="txt"></div>
  </div>
  <script>
{lib}
    (function () {{
      const tl = gsap.timeline({{ paused: true }});
      window.STICK.build(tl, {data});
      window.__timelines["stick"] = tl;
    }})();
  </script>
</template>
'''


def main():
    if len(sys.argv) < 3:
        print("stick.py <storyboard.json> <out_dir> [--no-voice] [--lenient]")
        sys.exit(1)
    sb = load(sys.argv[1])
    out = pathlib.Path(sys.argv[2])
    out.mkdir(parents=True, exist_ok=True)
    M.scaffold(out, out.name)
    (out / "storyboard.json").write_text(pathlib.Path(sys.argv[1]).read_text(encoding="utf-8"), encoding="utf-8")
    timing = out / ".vo" / "timing.json"
    beats = [(si, b) for si, sc in enumerate(sb["scenes"]) for b in sc["beats"]]
    if "--no-voice" in sys.argv and timing.exists():
        data = json.loads(timing.read_text(encoding="utf-8"))
        for (_, b), (st, du) in zip(beats, data["beats"]):
            b["_start"], b["_dur"] = st, du
        speech_end = data["end"]
    else:
        print(f"Tạo giọng đọc ({M.VOICE})…", flush=True)
        beats, speech_end = M.voice(sb, out, lead=0)
        timing.write_text(json.dumps({"beats": [[b["_start"], b["_dur"]] for _, b in beats], "end": speech_end}), encoding="utf-8")
    hook_dur = beats[0][1]["_dur"]
    if hook_dur > HOOK_HOLD:
        if "--lenient" not in sys.argv:
            fail(f"câu hook đọc mất {r(hook_dur)} giây, phải dưới {HOOK_HOLD} giây. Viết ngắn lại: {beats[0][1]['say']}")
        print(f"  (câu hook đọc mất {r(hook_dur)} giây, hơi dài)", flush=True)
    total = round(speech_end + M.END_HOLD + 0.5, 2)
    visuals, cards, sfx = plan(sb, total)
    icons = {}
    for v in visuals:
        for it in v["scene"].get("items") or []:
            if it.get("icon"):
                icons[it["icon"]] = ICONS[it["icon"]]
    spec = {"total": total, "visuals": visuals, "cards": cards, "icons": icons, "seed": len(sb["slug"])}
    (out / "compositions").mkdir(exist_ok=True)
    for old in (out / "compositions").glob("s*.html"):
        if old.name != "stick.html":
            old.unlink()
    (out / "compositions" / "stick.html").write_text(stick_html(spec), encoding="utf-8")
    cap = M.captions_html(beats, "pop").replace("top: 1150px", "top: 1425px").replace("rgba(23,20,15,0.86)", "#1d1a16")
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
      html, body {{ margin: 0; width: {W}px; height: {H}px; overflow: hidden; background: #fbf7ee; }}
      #root {{ width: 100%; height: 100%; position: relative; background: #fbf7ee; }}
    </style>
  </head>
  <body>
    <div id="root" data-composition-id="main" data-start="0" data-duration="{r(total)}" data-width="{W}" data-height="{H}">
      <div id="stick" data-composition-id="stick" data-composition-src="compositions/stick.html" data-start="0" data-duration="{r(total)}" data-track-index="1" data-track-kind="graphics" data-width="{W}" data-height="{H}" style="z-index:1"></div>
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
    print(f"OK: {out} ({r(total)} s, {len(visuals)} cảnh)")


if __name__ == "__main__":
    main()
