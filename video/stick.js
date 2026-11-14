// Thư viện dựng video người que (kiểu mặc định từ 2026-11-14). video/stick.py chèn nguyên file này vào
// compositions/stick.html rồi gọi STICK.build(tl, spec). spec do stick.py tính (thời gian từng cảnh, thẻ chữ).
// Toạ độ khung 1080×1920: tiêu đề y 150–560, sân khấu 580–1300 (mặt đất y=1300), phụ đề từ y=1425.
// Mọi chuyển động nằm trong một timeline GSAP (tua tới đâu cũng ra đúng hình), không dùng Math.random.
window.STICK = (function () {
  const NS = "http://www.w3.org/2000/svg";
  const INK = "#1d1a16", BACK = "#8d8579", PAPER = "#fbf7ee", WHITE = "#ffffff", Y = "#ffd23f", RED = "#e4572e",
    BLUE = "#7cc4ff", PURPLE = "#7a5bd6", GREEN = "#3fb07a", WOOD = "#c98b4b", STEEL = "#d9e6ef";
  const GROUND = 1300;
  const rad = (a) => a * Math.PI / 180;

  function build(tl, spec) {
    const stage = document.getElementById("stk");
    const txt = document.getElementById("txt");
    const END = spec.total;
    let seed = 7 + (spec.seed || 0);
    const rnd = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };

    // ---------- tiện ích vẽ ----------
    function mk(tag, attrs, parent) {
      const e = document.createElementNS(NS, tag);
      for (const k in attrs) e.setAttribute(k, attrs[k]);
      (parent || stage).appendChild(e);
      return e;
    }
    const grp = (p, a) => mk("g", a || {}, p);
    const line = (p, x1, y1, x2, y2, w, c) => mk("line", { x1, y1, x2, y2, stroke: c || INK, "stroke-width": w || 8, "stroke-linecap": "round" }, p);
    const path = (p, d, o) => { o = o || {}; return mk("path", { d, fill: o.fill || "none", stroke: o.stroke || INK, "stroke-width": o.w ?? 6, "stroke-linecap": "round", "stroke-linejoin": "round" }, p); };
    const rect = (p, x, y, w, h, o) => { o = o || {}; return mk("rect", { x, y, width: w, height: h, rx: o.rx ?? 10, fill: o.fill || WHITE, stroke: o.stroke || INK, "stroke-width": o.w ?? 6 }, p); };
    const circ = (p, cx, cy, r, o) => { o = o || {}; return mk("circle", { cx, cy, r, fill: o.fill || WHITE, stroke: o.stroke || INK, "stroke-width": o.w ?? 6 }, p); };
    function text(p, x, y, s, o) {
      o = o || {};
      const e = mk("text", { "data-layout-allow-overlap": "", x, y, "font-family": o.ff || "BVP", "font-weight": o.fw || 800, "font-size": o.fs || 40, fill: o.fill || INK, "text-anchor": o.anchor || "middle" }, p);
      e.textContent = s;
      return e;
    }
    const hidden = (el) => { el.style.opacity = 0; return el; };
    function pop(el, t, o) { o = o || {}; tl.fromTo(el, { scale: o.from ?? 0, transformOrigin: o.origin || "50% 50%" }, { scale: 1, duration: o.d || 0.4, ease: o.ease || "back.out(2.2)" }, t); }
    function show(el, t, o) { o = o || {}; tl.to(el, { opacity: 1, duration: 0.12 }, t); pop(el, t, o); }
    function fadeOut(el, t, d) { tl.to(el, { opacity: 0, duration: d ?? 0.2 }, t); }
    function draw(el, t, d) { el.setAttribute("pathLength", 1); el.style.strokeDasharray = 1; tl.fromTo(el, { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: d || 0.5, ease: "power2.inOut" }, t); }
    function ground(g, y, x1, x2) {
      y = y || GROUND; x1 = x1 || 70; x2 = x2 || 1010; const m = (x1 + x2) / 2;
      return path(g, `M${x1} ${y} Q ${(x1 + m) / 2} ${y - 6} ${m} ${y + 1} T ${x2} ${y - 1}`, { w: 7 });
    }
    // chữ trong SVG tự xuống dòng (ước lượng bề rộng theo cỡ chữ)
    function wrap(s, max) {
      const words = String(s).split(/\s+/), rows = [];
      let cur = "";
      for (const w of words) { if (cur && (cur + " " + w).length > max) { rows.push(cur); cur = w; } else cur = cur ? cur + " " + w : w; }
      if (cur) rows.push(cur);
      return rows;
    }
    function textBlock(p, x, y, s, o) {
      o = o || {}; const rows = wrap(s, o.max || 16), lh = (o.fs || 40) * 1.2;
      rows.forEach((row, i) => text(p, x, y + i * lh, row, o));
      return rows.length;
    }
    function star(p, x, y, r, fill) {
      let d = "";
      for (let i = 0; i < 10; i++) { const a = rad(-90 + i * 36), rr = i % 2 ? r * 0.45 : r; d += (i ? "L" : "M") + (x + Math.cos(a) * rr).toFixed(1) + " " + (y + Math.sin(a) * rr).toFixed(1); }
      return mk("path", { d: d + "Z", fill: fill || Y, stroke: INK, "stroke-width": 5, "stroke-linejoin": "round" }, p);
    }
    function heart(p, x, y, sc) {
      const g = grp(p); gsap.set(g, { x, y, scale: sc || 1 });
      path(g, "M0 34 C -70 -6 -44 -66 0 -32 C 44 -66 70 -6 0 34Z", { fill: RED });
      return g;
    }
    function note(p, x, y) {
      const g = grp(p); gsap.set(g, { x, y });
      path(g, "M0 0 L0 -52 L26 -44 L26 -34 L5 -40 L5 0", { fill: INK, w: 4 });
      mk("ellipse", { cx: -7, cy: 2, rx: 12, ry: 9, fill: INK }, g);
      return g;
    }
    function burst(p, x, y, t, r, color) {
      const b = hidden(grp(p)); gsap.set(b, { x, y });
      for (let i = 0; i < 8; i++) { const a = rad(i * 45 + 22); line(b, Math.cos(a) * r * 0.55, Math.sin(a) * r * 0.55, Math.cos(a) * r, Math.sin(a) * r, 7, color || INK); }
      tl.fromTo(b, { scale: 0.3, opacity: 0, transformOrigin: "50% 50%" }, { scale: 1.15, opacity: 1, duration: 0.25, ease: "power2.out", immediateRender: false }, t);
      tl.to(b, { opacity: 0, duration: 0.3 }, t + 0.35);
      return b;
    }
    function tag(p, x, y, s, o) {
      o = o || {}; const fs = o.fs || 34, w = o.w || Math.max(120, s.length * fs * 0.56 + 44), h = fs + 28;
      const g = grp(p);
      rect(g, x - w / 2, y - h / 2, w, h, { rx: h / 2, fill: o.fill || WHITE, w: 5 });
      text(g, x, y + fs * 0.36, s, { fs, fill: o.color || INK });
      return g;
    }
    // bong bóng lời nói, đuôi chỉ về (tx, ty)
    function bubble(p, x, y, s, o) {
      o = o || {}; const fs = o.fs || 36, rows = wrap(s, o.max || 14), lh = fs * 1.2;
      const w = Math.max(...rows.map((r) => r.length)) * fs * 0.56 + 56, h = rows.length * lh + 34;
      const g = grp(p);
      const tx = o.tx ?? x, ty = o.ty ?? y + h / 2 + 40, bx = Math.max(70, Math.min(1010 - w, x - w / 2)), by = y - h / 2;
      const cx = Math.max(bx + 30, Math.min(bx + w - 30, tx));
      path(g, `M${cx - 18} ${by + h - 3} L${tx} ${ty} L${cx + 18} ${by + h - 3}`, { fill: o.fill || WHITE, w: 5 });
      rect(g, bx, by, w, h, { rx: 26, fill: o.fill || WHITE, w: 5 });
      mk("rect", { x: cx - 16, y: by + h - 8, width: 32, height: 6, fill: o.fill || WHITE }, g);
      rows.forEach((row, i) => text(g, bx + w / 2, by + 17 + fs * 0.9 + i * lh, row, { fs, fill: o.color || INK }));
      return g;
    }
    function sweat(p, x, y, t0, t1, every) {
      for (let t = t0; t < t1 - 0.35; t += every || 0.42) {
        const d = hidden(path(p, "M0 -13 Q 9 2 0 8 Q -9 2 0 -13Z", { fill: BLUE, w: 3 }));
        const side = rnd() > 0.5 ? 1 : -1;
        tl.fromTo(d, { x: x + side * (10 + rnd() * 25), y, opacity: 1 }, { x: x + side * (45 + rnd() * 30), y: y + 80, opacity: 0, duration: 0.55, ease: "power1.in", immediateRender: false }, t);
      }
    }
    function floaters(p, t0, t1, every, makeEl, x, y) {
      for (let t = t0, i = 0; t < t1 - 0.5; t += every, i++) {
        const el = hidden(makeEl(p, i)); const dx = (rnd() - 0.5) * 80;
        tl.fromTo(el, { x: x + dx, y, opacity: 1, scale: 0.5 }, { x: x + dx * 1.6, y: y - 140, scale: 1, duration: 1.1, ease: "power1.out", immediateRender: false }, t);
        tl.to(el, { opacity: 0, duration: 0.3 }, t + 0.85);
      }
    }
    function dashes(p, t0, t1, y, dir) {
      const g = hidden(grp(p));
      for (let i = 0; i < 9; i++) line(g, 40 + i * 140, y, 100 + i * 140, y, 6, BACK);
      tl.to(g, { opacity: 1, duration: 0.1 }, t0);
      const n = Math.max(0, Math.floor((t1 - t0) / 0.3) - 1);
      tl.fromTo(g, { x: 0 }, { x: -140 * (dir || 1), duration: 0.3, ease: "none", repeat: n, immediateRender: false }, t0);
      return g;
    }

    // ---------- người que ----------
    // Toạ độ cục bộ: hông (0,0), vai y=-105, khuỷu -45, tay 13, tâm đầu -146, gối 72, bàn chân 144.
    // Góc tay/chân dương = đưa về phía trước; lean/hd dương = cúi về trước. flip: quay sang trái.
    function fig(p, x, hy, s, o) {
      o = o || {};
      const sw = (o.sw || 10) / s, f = { s, x, hy, flip: !!o.flip };
      f.root = grp(p); gsap.set(f.root, { x, y: hy, scale: s });
      f.bob = grp(f.root);
      const fl = grp(f.bob, o.flip ? { transform: "scale(-1 1)" } : {});
      const leg = (n, c) => {
        const th = grp(fl); line(th, 0, 0, 0, 72, sw, c);
        const sn = grp(th); line(sn, 0, 72, 0, 144, sw, c); line(sn, 0, 144, 16, 144, sw, c);
        gsap.set(th, { svgOrigin: "0 0" }); gsap.set(sn, { svgOrigin: "0 72" });
        f["th" + n] = th; f["sn" + n] = sn;
      };
      leg(2, BACK); leg(1, INK);
      const bd = grp(fl); gsap.set(bd, { svgOrigin: "0 0" }); f.bd = bd;
      const arm = (n, c) => {
        const ua = grp(bd); line(ua, 0, -105, 0, -45, sw, c);
        const fa = grp(ua); line(fa, 0, -45, 0, 13, sw, c);
        f["h" + n] = grp(fa);
        gsap.set(ua, { svgOrigin: "0 -105" }); gsap.set(fa, { svgOrigin: "0 -45" });
        f["ua" + n] = ua; f["fa" + n] = fa;
      };
      arm(2, BACK);
      f.back = grp(bd);
      line(bd, 0, 0, 0, -112, sw);
      f.mid = grp(bd);
      const hd = grp(bd); gsap.set(hd, { svgOrigin: "0 -112" }); f.hd = hd;
      if (o.hair) { path(hd, "M-26 -170 Q -64 -168 -60 -118", { w: 13 }); circ(hd, -34, -176, 15, { fill: INK, w: 0 }); }
      circ(hd, 0, -146, 34, { fill: WHITE, w: sw });
      if (o.hair) path(hd, "M-32 -158 Q -8 -192 30 -164", { w: 9 });
      const face = grp(hd); f.face = face;
      f.eyes = grp(face);
      if (o.glasses) { rect(f.eyes, 2, -160, 30, 13, { rx: 4, fill: INK, w: 0 }); line(f.eyes, 2, -154, -20, -158, 4); }
      else { circ(f.eyes, 9, -152, 4.5, { fill: INK, w: 0 }); circ(f.eyes, 24, -152, 4.5, { fill: INK, w: 0 }); }
      f.shut = hidden(grp(face)); path(f.shut, "M4 -151 Q 9 -147 14 -151", { w: 4 }); path(f.shut, "M19 -151 Q 24 -147 29 -151", { w: 4 });
      const mouthP = (d, fill) => path(face, d, { w: 4.5, fill: fill || "none" });
      f.m = {
        smile: mouthP("M6 -134 Q 16 -124 27 -134"), o: circ(face, 17, -131, 6, { fill: "none", w: 4.5 }),
        flat: mouthP("M7 -132 L 26 -132"), sad: mouthP("M6 -127 Q 16 -137 27 -127"), grin: mouthP("M4 -137 Q 16 -116 29 -137 Z", INK),
      };
      for (const k in f.m) if (k !== (o.mouth || "smile")) f.m[k].style.opacity = 0;
      if (o.band) path(hd, "M-33 -160 Q 0 -168 33 -160", { stroke: o.band, w: 10 });
      if (o.mirror) circ(hd, 6, -178, 13, { fill: STEEL, w: 4 });
      arm(1, INK);
      f.front = grp(bd);
      return f;
    }
    function P(f, t, p, d, ease) {
      d = d ?? 0.22;
      for (const k in p) {
        const v = p[k]; let el, vars;
        if (k === "dy") { el = f.bob; vars = { y: v }; }
        else if (k === "ex") { el = f.face; vars = { x: v }; }
        else if (k === "lean") { el = f.bd; vars = { rotation: v }; }
        else if (k === "hd") { el = f.hd; vars = { rotation: v }; }
        else { el = f[k]; vars = { rotation: -v }; }
        if (!el) continue;
        if (d <= 0) tl.set(el, vars, t); else tl.to(el, Object.assign(vars, { duration: d, ease: ease || "sine.inOut" }), t);
      }
    }
    function mouth(f, t, k) { for (const m in f.m) tl.set(f.m[m], { opacity: m === k ? 1 : 0 }, t); }
    function closeEyes(f, t, shut) { tl.set(f.eyes, { opacity: shut ? 0 : 1 }, t); tl.set(f.shut, { opacity: shut ? 1 : 0 }, t); }
    function blink(f, t0, t1) { for (let t = t0 + 1.3; t < t1 - 0.3; t += 2.1) { closeEyes(f, t, true); closeEyes(f, t + 0.12, false); } }
    function mv(f, t, vars, d, ease) { tl.to(f.root, Object.assign({}, vars, { duration: d, ease: ease || "none" }), t); }
    // vị trí bàn tay (toạ độ khung) khi tay ở góc ua/fa, thân nghiêng lean
    function hand(f, p) {
      const ua = p.ua ?? p.ua1 ?? 0, fa = p.fa ?? p.fa1 ?? 0;
      const s = f.s, dir = f.flip ? -1 : 1, lean = rad(p.lean || 0), a1 = rad(ua) - lean, a2 = rad(ua + fa) - lean;
      const hy = f.hy + (p.dy || 0) * s;
      const sx = f.x + dir * 105 * s * Math.sin(lean), sy = hy - 105 * s * Math.cos(lean);
      const ex = sx + dir * 60 * s * Math.sin(a1), ey = sy + 60 * s * Math.cos(a1);
      return [ex + dir * 58 * s * Math.sin(a2), ey + 58 * s * Math.cos(a2)];
    }
    const head = (f) => [f.x + (f.flip ? -1 : 1) * 10 * f.s, f.hy - 146 * f.s];
    const STAND = { ua1: 8, fa1: 10, ua2: -8, fa2: 10, th1: 4, sn1: 0, th2: -4, sn2: 0, lean: 0, hd: 0, dy: 0, ex: 0 };
    function cycle(f, t0, t1, per, A, B, o) {
      o = o || {}; let k = 0;
      for (let t = t0; t < t1 - 0.02; t += per / 2, k++) {
        const p = Object.assign({}, k % 2 ? B : A);
        if (o.noArms) { delete p.ua1; delete p.fa1; delete p.ua2; delete p.fa2; }
        P(f, t, p, Math.min(per / 2, t1 - t), "sine.inOut");
        if (o.bob) { tl.to(f.bob, { y: (o.base || 0) - o.bob, duration: per / 4, ease: "sine.out" }, t); tl.to(f.bob, { y: o.base || 0, duration: per / 4, ease: "sine.in" }, t + per / 4); }
      }
    }
    function breathe(f, t0, t1, base) { for (let t = t0 + 0.4, i = 0; t < t1 - 0.6; t += 0.6, i++) tl.to(f.bob, { y: (base || 0) - (i % 2 ? 0 : 4), duration: 0.6, ease: "sine.inOut" }, t); }

    // ---------- động tác ----------
    // act(f, tên, t0, t1, g): g là nhóm cảnh để vẽ đạo cụ theo toạ độ khung. Trả về mood mặc định đã dùng.
    const MOODS = { happy: "smile", vui: "smile", grin: "grin", sad: "sad", buon: "sad", shock: "o", wow: "o", tired: "flat", angry: "flat", neutral: "flat", love: "smile", scared: "o", proud: "grin" };
    const DEFAULT_MOOD = { stand: "happy", walk: "happy", run: "tired", jump: "grin", cheer: "grin", think: "neutral", shrug: "neutral", facepalm: "sad",
      wave: "happy", point: "grin", phone: "neutral", laptop: "neutral", sleep: "neutral", cry: "sad", lift: "tired", push: "tired", pull: "tired",
      carry: "tired", dance: "grin", sit: "happy", angry: "angry", love: "love", shock: "shock", tired: "tired", read: "neutral", money: "grin",
      selfie: "grin", scared: "scared", idea: "grin", eat: "happy" };
    const ACTIONS = {};
    ACTIONS.stand = (f, t0, t1) => { P(f, t0, STAND, 0); breathe(f, t0, t1); };
    ACTIONS.walk = (f, t0, t1, g, sc) => {
      P(f, t0, STAND, 0); if (!sc._panel) dashes(g, t0, t1, f.hy + 144 * f.s + 30);
      cycle(f, t0, t1, 0.56, { th1: 22, sn1: -6, th2: -20, sn2: -30, ua1: -22, fa1: 16, ua2: 22, fa2: 16, lean: 3 },
        { th1: -20, sn1: -30, th2: 22, sn2: -6, ua1: 22, fa1: 16, ua2: -22, fa2: 16, lean: 3 }, { bob: 5 });
    };
    ACTIONS.run = (f, t0, t1, g, sc) => {
      P(f, t0, STAND, 0); if (!sc._panel) dashes(g, t0, t1, f.hy + 144 * f.s + 30);
      cycle(f, t0, t1, 0.34, { th1: 40, sn1: -22, th2: -34, sn2: -90, ua1: -48, fa1: 88, ua2: 52, fa2: 88, lean: 14 },
        { th1: -34, sn1: -90, th2: 40, sn2: -22, ua1: 52, fa1: 88, ua2: -48, fa2: 88, lean: 14 }, { bob: 10 });
    };
    ACTIONS.jump = (f, t0, t1, g, sc) => {
      P(f, t0, STAND, 0); const up = sc._panel ? -18 : -90;
      for (let t = t0 + 0.1; t < t1 - 0.7; t += 0.85) {
        P(f, t, { dy: 18, th1: 40, sn1: -70, th2: 36, sn2: -66, ua1: -40, ua2: -44, lean: 18 }, 0.18);
        P(f, t + 0.2, { dy: up, th1: 20, sn1: -40, th2: -14, sn2: -30, ua1: 170, fa1: 0, ua2: 160, fa2: 0, lean: 0 }, 0.25, "power2.out");
        P(f, t + 0.48, { dy: 0, th1: 4, sn1: 0, th2: -4, sn2: 0, ua1: 20, fa1: 10, ua2: -10, fa2: 10 }, 0.25, "power2.in");
      }
    };
    ACTIONS.cheer = (f, t0, t1, g, sc) => {
      P(f, t0, { ua1: 160, fa1: 10, ua2: 150, fa2: 10, th1: 6, th2: -6, hd: -8 }, 0);
      for (let t = t0 + 0.2, i = 0; t < t1 - 0.4; t += 0.5, i++) P(f, t, { dy: i % 2 ? 0 : (sc._panel ? -12 : -26), ua1: i % 2 ? 160 : 150 }, 0.25);
      const [hx, hy] = head(f);
      if (!sc._panel) [[-130, -40], [120, -90], [-90, -150]].forEach(([dx, dy], i) => { const s = hidden(star(g, hx + dx, hy + dy, 20 + i * 4)); show(s, t0 + 0.3 + i * 0.35); });
    };
    ACTIONS.think = (f, t0, t1, g, sc) => {
      P(f, t0, Object.assign({}, STAND, { ua1: 40, fa1: 125, hd: -10 }), 0);
      for (let t = t0 + 0.5, i = 0; t < t1 - 0.5; t += 0.9, i++) P(f, t, { hd: i % 2 ? -10 : -2 }, 0.45);
      const [hx, hy] = head(f);
      const tb = hidden(grp(g));
      [[hx + 50, hy - 50, 10], [hx + 80, hy - 85, 15]].forEach(([x, y, r]) => circ(tb, x, y, r, { w: 4 }));
      const label = sc.think || "?";
      const w = Math.max(160, label.length * 20 + 70);
      const cx = Math.min(1000 - w / 2, hx + 90 + w / 2), cy = hy - 170;
      mk("ellipse", { cx, cy, rx: w / 2, ry: 62, fill: WHITE, stroke: INK, "stroke-width": 5 }, tb);
      text(tb, cx, cy + 13, label, { fs: label.length > 14 ? 30 : 36 });
      show(tb, t0 + 0.35, { from: 0.5 });
    };
    ACTIONS.idea = (f, t0, t1, g) => {
      ACTIONS.think(f, t0, Math.min(t1, t0 + 0.9), g, { think: "…" });
      const [hx, hy] = head(f);
      const b = hidden(grp(g));
      circ(b, hx, hy - 120, 34, { fill: Y }); rect(b, hx - 14, hy - 90, 28, 22, { rx: 4, fill: STEEL, w: 4 });
      show(b, t0 + 1.0); burst(g, hx, hy - 120, t0 + 1.05, 70, Y);
      P(f, t0 + 1.0, { ua1: 150, fa1: 0, hd: -12 }, 0.2, "back.out(2)"); mouth(f, t0 + 1.0, "grin");
    };
    ACTIONS.shrug = (f, t0, t1) => {
      P(f, t0, { ex: -15, ua1: 45, fa1: -95, ua2: -45, fa2: 95, th1: 10, th2: -10, sn1: 0, sn2: 0, lean: 0 }, 0);
      for (let t = t0 + 0.3, i = 0; t < t1 - 0.4; t += 0.6, i++) P(f, t, { dy: i % 2 ? 0 : -10, hd: i % 2 ? 0 : 10 }, 0.3);
    };
    ACTIONS.facepalm = (f, t0, t1) => {
      P(f, t0, Object.assign({}, STAND, { ua1: 62, fa1: 112, hd: 16, lean: 6 }), 0);
      for (let t = t0 + 0.5, i = 0; t < t1 - 0.5; t += 0.7, i++) P(f, t, { hd: i % 2 ? 16 : 24 }, 0.35);
    };
    ACTIONS.wave = (f, t0, t1) => {
      P(f, t0, Object.assign({}, STAND, { ua1: 140, fa1: 20 }), 0);
      for (let t = t0 + 0.1, i = 0; t < t1 - 0.2; t += 0.28, i++) P(f, t, { fa1: i % 2 ? 25 : -25 }, 0.28);
      breathe(f, t0, t1);
    };
    ACTIONS.point = (f, t0, t1) => {
      P(f, t0, Object.assign({}, STAND, { ua1: 150, fa1: 0, hd: -12 }), 0);
      for (let t = t0 + 0.3, i = 0; t < t1 - 0.3; t += 0.35, i++) P(f, t, { ua1: i % 2 ? 150 : 135 }, 0.17);
    };
    ACTIONS.phone = (f, t0, t1, g) => {
      const pose = { ua1: 55, fa1: 95, ua2: 45, fa2: 100, th1: 5, sn1: 0, th2: -5, sn2: 0, hd: 10, lean: 0 };
      P(f, t0, pose, 0);
      const [x, y] = hand(f, pose), s = f.s / 1.5;
      rect(g, x - 31 * s + (f.flip ? -10 : 10) * s, y - 60 * s, 62 * s, 108 * s, { rx: 11 * s, w: 6 * s });
      const glow = rect(g, x - 22 * s + (f.flip ? -10 : 10) * s, y - 48 * s, 44 * s, 70 * s, { rx: 4, fill: "#cfe8ff", w: 0 });
      tl.to(glow, { opacity: 0.5, duration: 0.4, yoyo: true, repeat: Math.max(0, Math.floor((t1 - t0) / 0.4) - 1), ease: "sine.inOut" }, t0);
      breathe(f, t0, t1);
    };
    ACTIONS.selfie = (f, t0, t1, g) => {
      const pose = Object.assign({}, STAND, { ua1: 150, fa1: -30, hd: -10 });
      P(f, t0, pose, 0);
      const [x, y] = hand(f, pose), s = f.s / 1.5;
      rect(g, x - 28 * s, y - 52 * s, 56 * s, 96 * s, { rx: 10 * s, w: 6 * s });
      for (let t = t0 + 0.6; t < t1 - 0.4; t += 1.2) { burst(g, x, y, t, 60 * s, Y); P(f, t, { hd: -18, dy: -6 }, 0.15); P(f, t + 0.3, { hd: -8, dy: 0 }, 0.3); }
    };
    ACTIONS.laptop = (f, t0, t1, g) => {
      const s = f.s, fx = f.x, dir = f.flip ? -1 : 1, seat = f.hy + 6 * s, floor = f.hy + 72 * s;
      // ghế + bàn + máy tính
      rect(g, fx - dir * 40 * s - 40 * s, seat, 80 * s, 14 * s, { rx: 4, fill: WOOD, w: 5 });
      line(g, fx - dir * 40 * s - 30 * s, seat + 14 * s, fx - dir * 40 * s - 30 * s, floor, 6);
      line(g, fx - dir * 40 * s + 30 * s, seat + 14 * s, fx - dir * 40 * s + 30 * s, floor, 6);
      line(g, fx - dir * 70 * s, seat, fx - dir * 70 * s, seat - 120 * s, 7);
      const dx0 = fx + dir * 90 * s, dx1 = fx + dir * 230 * s, top = f.hy - 22 * s;
      rect(g, Math.min(dx0, dx1), top, Math.abs(dx1 - dx0), 14 * s, { rx: 4, fill: WOOD, w: 5 });
      line(g, dx1 - dir * 14 * s, top + 14 * s, dx1 - dir * 14 * s, floor, 6);
      const lx = fx + dir * 150 * s;
      path(g, `M${lx - dir * 30 * s} ${top} L${lx + dir * 40 * s} ${top} L${lx + dir * 60 * s} ${top - 70 * s}`, { w: 7 });
      const scr = path(g, `M${lx + dir * 46 * s} ${top - 12 * s} L${lx + dir * 58 * s} ${top - 60 * s}`, { stroke: BLUE, w: 6 });
      tl.to(scr, { opacity: 0.3, duration: 0.3, yoyo: true, repeat: Math.max(0, Math.floor((t1 - t0) / 0.3) - 1) }, t0);
      P(f, t0, { th1: 88, sn1: -88, th2: 86, sn2: -86, ua1: 62, fa1: 38, ua2: 58, fa2: 42, lean: 4, hd: 6, dy: 0 }, 0);
      for (let t = t0 + 0.1, i = 0; t < t1 - 0.1; t += 0.16, i++) P(f, t, { fa1: i % 2 ? 30 : 46, fa2: i % 2 ? 48 : 34 }, 0.16);
    };
    ACTIONS.sit = (f, t0, t1, g) => {
      const s = f.s, fx = f.x, dir = f.flip ? -1 : 1, seat = f.hy + 6 * s, floor = f.hy + 72 * s;
      rect(g, fx - 50 * s, seat, 100 * s, 14 * s, { rx: 4, fill: WOOD, w: 5 });
      line(g, fx - 40 * s, seat + 14 * s, fx - 40 * s, floor, 6); line(g, fx + 40 * s, seat + 14 * s, fx + 40 * s, floor, 6);
      line(g, fx - dir * 50 * s, seat, fx - dir * 50 * s, seat - 130 * s, 7);
      P(f, t0, { th1: 88, sn1: -88, th2: 86, sn2: -86, ua1: 30, fa1: 40, ua2: 26, fa2: 44, lean: -4, dy: 0 }, 0);
      breathe(f, t0, t1);
    };
    ACTIONS.read = (f, t0, t1, g) => {
      const pose = { ua1: 50, fa1: 70, ua2: 45, fa2: 75, th1: 4, sn1: 0, th2: -4, sn2: 0, hd: 18, lean: 0 };
      P(f, t0, pose, 0);
      const [x, y] = hand(f, pose), s = f.s / 1.5, dir = f.flip ? -1 : 1;
      const b = grp(g);
      path(b, `M${x} ${y - 10 * s} L${x - dir * 10 * s} ${y - 70 * s} L${x + dir * 50 * s} ${y - 80 * s} L${x + dir * 52 * s} ${y - 20 * s} Z`, { fill: WHITE, w: 5 });
      path(b, `M${x} ${y - 10 * s} L${x + dir * 20 * s} ${y - 75 * s}`, { w: 4 });
      for (let t = t0 + 0.8; t < t1 - 0.4; t += 1.4) P(f, t, { hd: 24 }, 0.4), P(f, t + 0.6, { hd: 16 }, 0.4);
    };
    ACTIONS.sleep = (f, t0, t1, g) => {
      const s = f.s;
      rect(g, f.x - 200 * s, GROUND - 60 * s, 400 * s, 34 * s, { rx: 10, fill: STEEL, w: 6 });
      rect(g, f.x - 200 * s, GROUND - 90 * s, 70 * s, 32 * s, { rx: 14, fill: WHITE, w: 5 });
      gsap.set(f.root, { x: f.x + 30 * s, y: GROUND - 78 * s, rotation: -90 });
      P(f, t0, Object.assign({}, STAND, { ua1: 10, ua2: -6 }), 0);
      closeEyes(f, t0, true); mouth(f, t0, "flat");
      floaters(g, t0 + 0.2, t1, 0.7, (p) => text(p, 0, 0, "z", { fs: 46, fw: 900, fill: PURPLE }), f.x - 160 * s, GROUND - 140 * s);
      for (let t = t0, i = 0; t < t1 - 0.5; t += 0.8, i++) P(f, t, { lean: i % 2 ? 0 : -3 }, 0.8);
    };
    ACTIONS.cry = (f, t0, t1, g) => {
      P(f, t0, Object.assign({}, STAND, { lean: 10, hd: 16, ua1: 40, fa1: 100, ua2: 36, fa2: 104 }), 0);
      for (let t = t0 + 0.1, i = 0; t < t1 - 0.2; t += 0.2, i++) P(f, t, { dy: i % 2 ? 0 : 3 }, 0.1);
      const [hx, hy] = head(f);
      for (let t = t0 + 0.2; t < t1 - 0.5; t += 0.35) {
        const d = hidden(path(g, "M0 -10 Q 7 2 0 6 Q -7 2 0 -10Z", { fill: BLUE, w: 3 }));
        tl.fromTo(d, { x: hx + 18 * f.s / 1.5 * (f.flip ? -1 : 1), y: hy, opacity: 1 }, { y: hy + 110, opacity: 0, duration: 0.6, ease: "power1.in", immediateRender: false }, t);
      }
    };
    ACTIONS.lift = (f, t0, t1, g) => {
      const plate = (h) => { line(h, -30, 13, 30, 13, 8); rect(h, -44, -4, 16, 34, { rx: 4, fill: INK, w: 0 }); rect(h, 28, -4, 16, 34, { rx: 4, fill: INK, w: 0 }); };
      plate(f.h1);
      const up = Object.assign({}, STAND, { ua1: 172, fa1: 0, ua2: 165, fa2: 0 }), dn = Object.assign({}, STAND, { ua1: 55, fa1: 95, ua2: 50, fa2: 100, dy: 8, th1: 20, sn1: -30, th2: 16, sn2: -28 });
      P(f, t0, dn, 0);
      cycle(f, t0 + 0.2, t1, 1.1, up, dn);
      sweat(g, head(f)[0], head(f)[1] - 20, t0 + 0.4, t1, 0.5);
    };
    function sled(g, x, y, s, dir, o) {
      const b = grp(g);
      line(b, x, y + 140 * s, x, y - 10 * s, 11 * s);
      const gy = (o && o.gy) || GROUND;
      path(b, `M${x + dir * 10 * s} ${gy} L${x + dir * 26 * s} ${gy - 70 * s} L${x + dir * 170 * s} ${gy - 70 * s} L${x + dir * 184 * s} ${gy} Z`, { fill: (o && o.fill) || Y, w: 7 });
      return b;
    }
    ACTIONS.push = (f, t0, t1, g, sc) => {
      const A = { lean: 38, ua1: 75, fa1: 15, ua2: 70, fa2: 20, th1: 35, sn1: -45, th2: -30, sn2: -10, dy: 6, hd: 0 };
      const B = Object.assign({}, A, { th1: -10, sn1: -20, th2: 30, sn2: -55 });
      P(f, t0, A, 0);
      const [x, y] = hand(f, A);
      sled(g, x, y, f.s / 1.5, f.flip ? -1 : 1, { gy: f.hy + 144 * f.s });
      if (!sc._panel) dashes(g, t0, t1, GROUND + 30);
      cycle(f, t0 + 0.1, t1, 0.6, B, A);
      sweat(g, head(f)[0] + 40, head(f)[1] + 30, t0 + 0.3, t1, 0.5);
    };
    ACTIONS.pull = (f, t0, t1, g, sc) => {
      const A = { lean: -16, ua1: 75, fa1: 0, ua2: 20, fa2: 100, th1: 20, sn1: -10, th2: -20, sn2: -20 };
      const B = { lean: -16, ua1: 20, fa1: 100, ua2: 75, fa2: 0, th1: 20, sn1: -10, th2: -20, sn2: -20 };
      P(f, t0, A, 0);
      const [x, y] = hand(f, A), dir = f.flip ? -1 : 1;
      line(g, x, y, x + dir * (sc._panel ? 200 : 420), f.hy + 104 * f.s, 5, "#a0703f");
      cycle(f, t0 + 0.1, t1, 0.6, B, A);
    };
    ACTIONS.carry = (f, t0, t1, g, sc) => {
      const p = { ua1: 45, fa1: 50, ua2: 40, fa2: 55 };
      rect(f.front, 18, -88, 84, 70, { rx: 6, fill: WOOD, w: 6 });
      path(f.front, "M18 -64 L102 -64", { w: 4 });
      P(f, t0, Object.assign({}, STAND, p), 0);
      cycle(f, t0 + 0.1, t1, 0.7, { th1: 18, sn1: -8, th2: -16, sn2: -26 }, { th1: -16, sn1: -26, th2: 18, sn2: -8 }, { bob: 4 });
      if (!sc._panel) dashes(g, t0, t1, GROUND + 30);
    };
    ACTIONS.dance = (f, t0, t1, g) => {
      const A = { ua1: 150, fa1: 20, ua2: -30, fa2: 60, th1: 30, sn1: -40, th2: -6, sn2: 0, lean: -6, hd: -10, dy: 0 };
      const B = { ua1: -20, fa1: 70, ua2: 150, fa2: 20, th1: -6, sn1: 0, th2: 30, sn2: -40, lean: 6, hd: 10, dy: -12 };
      P(f, t0, A, 0); cycle(f, t0 + 0.1, t1, 0.8, B, A);
      const [hx, hy] = head(f);
      floaters(g, t0 + 0.2, t1, 0.6, (p) => note(p, 0, 0), hx + 120, hy);
    };
    ACTIONS.angry = (f, t0, t1, g) => {
      P(f, t0, Object.assign({}, STAND, { ua1: 50, fa1: 120, ua2: 45, fa2: 125, lean: 8 }), 0);
      for (let t = t0 + 0.1, i = 0; t < t1 - 0.2; t += 0.12, i++) P(f, t, { fa1: i % 2 ? 110 : 128, dy: i % 2 ? 0 : 2 }, 0.12);
      const [hx, hy] = head(f);
      floaters(g, t0, t1, 0.4, (p) => circ(p, 0, 0, 16, { fill: "#e9e4dc", w: 4 }), hx, hy - 50);
      const m = hidden(text(g, hx + 70, hy - 50, "#@!", { fs: 52, fw: 900, fill: RED })); show(m, t0 + 0.3);
    };
    ACTIONS.love = (f, t0, t1, g) => {
      P(f, t0, Object.assign({}, STAND, { ua1: 30, fa1: 120, ua2: 26, fa2: 124, hd: -6 }), 0);
      for (let t = t0 + 0.3, i = 0; t < t1 - 0.4; t += 0.6, i++) P(f, t, { lean: i % 2 ? -4 : 4 }, 0.6);
      const [hx, hy] = head(f);
      floaters(g, t0 + 0.1, t1, 0.45, (p) => heart(p, 0, 0, 0.45), hx + 30, hy - 40);
    };
    ACTIONS.shock = (f, t0, t1, g) => {
      P(f, t0, STAND, 0);
      P(f, t0 + 0.15, { lean: -12, ua1: 130, fa1: 40, ua2: 120, fa2: 45, dy: -24, hd: -10 }, 0.15, "back.out(3)");
      P(f, t0 + 0.4, { dy: 0 }, 0.2);
      for (let t = t0 + 0.6, i = 0; t < t1 - 0.2; t += 0.1, i++) P(f, t, { lean: i % 2 ? -12 : -9 }, 0.1);
      const [hx, hy] = head(f);
      const m = hidden(text(g, hx + 80, hy - 40, "!!", { fs: 110, fw: 900, fill: RED })); show(m, t0 + 0.2);
    };
    ACTIONS.scared = (f, t0, t1, g) => {
      P(f, t0, Object.assign({}, STAND, { lean: -8, ua1: 70, fa1: 120, ua2: 66, fa2: 124, th1: 14, sn1: -20, th2: 10, sn2: -20, dy: 8 }), 0);
      for (let t = t0 + 0.05, i = 0; t < t1 - 0.1; t += 0.08, i++) tl.to(f.bob, { x: i % 2 ? 3 : -3, duration: 0.08, ease: "none" }, t);
      sweat(g, head(f)[0], head(f)[1] - 10, t0 + 0.2, t1, 0.35);
    };
    ACTIONS.tired = (f, t0, t1, g) => {
      P(f, t0, Object.assign({}, STAND, { lean: 26, hd: 22, ua1: 20, fa1: 0, ua2: 16, fa2: 0, th1: 10, sn1: -16, th2: 6, sn2: -14, dy: 8 }), 0);
      for (let t = t0 + 0.4, i = 0; t < t1 - 0.6; t += 0.9, i++) P(f, t, { lean: i % 2 ? 26 : 32 }, 0.9);
      sweat(g, head(f)[0] + 30, head(f)[1] + 40, t0 + 0.2, t1, 0.45);
    };
    ACTIONS.money = (f, t0, t1, g) => {
      const pose = Object.assign({}, STAND, { ua1: 130, fa1: 30 });
      P(f, t0, pose, 0);
      const bill = grp(f.h1); rect(bill, -36, -10, 72, 40, { rx: 4, fill: "#8fd19e", w: 5 }); circ(bill, 0, 10, 10, { fill: "#8fd19e", w: 4 });
      for (let t = t0 + 0.2, i = 0; t < t1 - 0.2; t += 0.3, i++) P(f, t, { fa1: i % 2 ? 30 : 10 }, 0.3);
      const [x, y] = hand(f, pose);
      floaters(g, t0 + 0.2, t1, 0.35, (p) => { const c = grp(p); circ(c, 0, 0, 18, { fill: "#f2c230", w: 4 }); text(c, 0, 9, "$", { fs: 24, fw: 900 }); return c; }, x, y);
    };
    ACTIONS.eat = (f, t0, t1, g) => {
      const A = Object.assign({}, STAND, { ua1: 70, fa1: 120 }), B = Object.assign({}, STAND, { ua1: 40, fa1: 60 });
      circ(f.h1, 0, 4, 20, { fill: "#f2c230", w: 5 });
      P(f, t0, B, 0); cycle(f, t0 + 0.1, t1, 0.9, A, B);
      for (let t = t0 + 0.55; t < t1 - 0.4; t += 0.9) { mouth(f, t, "o"); mouth(f, t + 0.3, "smile"); }
    };
    function act(f, name, t0, t1, g, sc) {
      (ACTIONS[name] || ACTIONS.stand)(f, t0, t1, g, sc || {});
      if (name !== "sleep") blink(f, t0, t1);
    }
    function moodOf(name, mood) { return MOODS[mood] || MOODS[DEFAULT_MOOD[name] || "happy"] || "smile"; }
    function person(g, x, hy, s, o, name, t0, t1, sc) {
      o = o || {};
      const look = o.look || "";
      const f = fig(g, x, hy, s, { flip: o.flip, mouth: moodOf(name, o.mood), hair: look === "nu" || look === "girl", glasses: look === "kinh" || look === "glasses", band: o.band, mirror: o.mirror, sw: o.sw });
      act(f, name, t0, t1, g, sc);
      return f;
    }

    // ---------- tiêu đề ----------
    function header(id, c, t0, t1, hook) {
      const d = document.createElement("div"); d.className = "hd"; d.id = id; d.setAttribute("data-layout-allow-overlap", "");
      const lines = String(c.title || "").split("\n");
      let title;
      if (c.big) title = `<div class="t anton" style="font-size:${c.size}px"><div class="bar"></div>${[...c.title.replace(/\n/g, " ")].map((ch) => `<span class="ch">${ch === " " ? "&nbsp;" : esc(ch)}</span>`).join("")}</div>`;
      else title = `<div class="t" style="font-size:${c.size}px">${lines.map((l, i) => `<div class="tl"><div class="tli">${i === lines.length - 1 && lines.length > 1 ? `<span class="mk">${esc(l)}</span>` : esc(l)}</div></div>`).join("")}</div>`;
      d.innerHTML = (c.kicker ? `<div class="k">${esc(c.kicker.toUpperCase())}</div>` : "") + title + (c.sub ? `<div class="s">${esc(c.sub)}</div>` : "") + (c.subs || []).map((x, i) => `<div class="s2" id="${id}-x${i}">${esc(x.text)}</div>`).join("");
      txt.appendChild(d);
      if (hook) {
        tl.set(d, { opacity: 1 }, 0);
        tl.fromTo(`#${id} .tli`, { scale: 1.06, transformOrigin: "0% 50%" }, { scale: 1, duration: 0.5, ease: "power3.out" }, 0);
        if (c.sub) tl.set(`#${id} .s`, { opacity: 1 }, 0);
      } else {
        tl.set(d, { opacity: 1 }, t0);
        if (c.kicker) tl.fromTo(`#${id} .k`, { opacity: 0, x: -30 }, { opacity: 1, x: 0, duration: 0.4, ease: "power3.out" }, t0);
        if (c.big) {
          tl.fromTo(`#${id} .ch`, { y: -260, opacity: 0 }, { y: 0, opacity: 1, duration: 0.45, ease: "bounce.out", stagger: 0.06 }, t0 + 0.05);
          tl.fromTo(`#${id} .bar`, { scaleX: 0 }, { scaleX: 1, duration: 0.4, ease: "power2.out" }, t0 + 0.45);
        } else tl.fromTo(`#${id} .tli`, { yPercent: 110 }, { yPercent: 0, duration: 0.55, ease: "power4.out", stagger: 0.08 }, t0 + 0.05);
        if (c.sub) tl.fromTo(`#${id} .s`, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" }, t0 + 0.35);
      }
      (c.subs || []).forEach((x, i) => tl.fromTo(`#${id}-x${i}`, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" }, x.t));
      if (t1 < END) tl.to(d, { opacity: 0, duration: 0.18 }, t1 - 0.18);
    }
    function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }

    // ---------- các loại cảnh ----------
    // Mỗi hàm nhận (g, sc, t0, t1, top): g là nhóm của cảnh, top là y thấp nhất mà đầu nhân vật được chạm tới (dưới tiêu đề).
    const S = 1.5, HY = GROUND - 144 * S;
    const SCENES = {};
    SCENES.act = (g, sc, t0, t1) => {
      ground(g);
      const hasBubble = !!sc.bubble, x = hasBubble || sc.do === "think" ? 330 : 540;
      const f = person(g, x, sc.do === "laptop" || sc.do === "sit" ? HY + 108 : HY, S, sc, sc.do, t0, t1, sc);
      if (hasBubble) { const [hx, hy] = head(f); const b = hidden(bubble(g, 700, hy - 60, sc.bubble, { tx: hx + 50, ty: hy - 20 })); show(b, t0 + 0.35, { from: 0.4 }); }
      if (sc.label) { const l = hidden(tag(g, x, GROUND + 50, sc.label)); show(l, t0 + 0.5); }
    };
    SCENES.duo = (g, sc, t0, t1) => {
      ground(g);
      const L = sc.left || {}, R = sc.right || {}, kind = sc.do || "talk", D = t1 - t0;
      let xl = 330, xr = 750;
      if (kind === "highfive") { xl = 470; xr = 610; }
      if (kind === "hug") { xl = 500; xr = 580; }
      if (kind === "chase") { xl = 280; xr = 760; }
      const fl = fig(g, xl, HY, S, { mouth: moodOf("stand", L.mood), hair: L.look === "nu", glasses: L.look === "kinh", band: L.band });
      const fr = fig(g, xr, HY, S, { flip: kind !== "chase", mouth: moodOf("stand", R.mood), hair: R.look === "nu", glasses: R.look === "kinh", band: R.band, mirror: kind === "doctor" });
      blink(fl, t0, t1); blink(fr, t0 + 0.6, t1);
      const say = (f, who, t, side) => { if (!who.say) return; const [hx, hy] = head(f); const b = hidden(bubble(g, side < 0 ? 300 : 780, hy - 140, who.say, { tx: hx + (side < 0 ? 20 : -20), ty: hy - 50, fs: 34 })); show(b, t, { from: 0.4 }); return b; };
      if (kind === "talk" || kind === "argue" || kind === "ignore") {
        const mad = kind === "argue";
        act(fl, mad ? "angry" : "stand", t0, t1, g); act(fr, kind === "ignore" ? "phone" : mad ? "angry" : "stand", t0, t1, g);
        if (!mad) for (let t = t0 + 0.3, i = 0; t < t0 + D * 0.5; t += 0.3, i++) P(fl, t, { ua1: i % 2 ? 40 : 60, fa1: i % 2 ? 60 : 30 }, 0.3);
        const bl = say(fl, L, t0 + 0.3, -1);
        if (bl && R.say) fadeOut(bl, t0 + D * 0.5 - 0.1);
        say(fr, R, R.say && L.say ? t0 + D * 0.5 : t0 + 0.4, 1);
        if (kind === "ignore") { const dots = hidden(text(g, 790, 760, "…", { fs: 90, fw: 900 })); show(dots, t0 + D * 0.55); }
      } else if (kind === "highfive") {
        P(fl, t0, STAND, 0); P(fr, t0, STAND, 0);
        const HI = { ua1: 150, fa1: 10 };
        P(fl, t0 + 0.4, HI, 0.18, "power2.out"); P(fr, t0 + 0.4, HI, 0.18, "power2.out");
        mouth(fl, t0 + 0.58, "grin"); mouth(fr, t0 + 0.58, "grin");
        const st = hidden(star(g, 540, 790, 44)); show(st, t0 + 0.58); burst(g, 540, 790, t0 + 0.58, 110, RED);
        const ht = hidden(heart(g, 540, 690, 1)); show(ht, t0 + 1.0);
        say(fl, L, t0 + 1.0, -1); say(fr, R, t0 + 1.2, 1);
      } else if (kind === "hug") {
        P(fl, t0, Object.assign({}, STAND, { ua1: 80, fa1: 40, ua2: 75, fa2: 45 }), 0); P(fr, t0, Object.assign({}, STAND, { ua1: 80, fa1: 40, ua2: 75, fa2: 45 }), 0);
        breathe(fl, t0, t1); breathe(fr, t0, t1);
        mouth(fl, t0, "smile"); mouth(fr, t0, "smile");
        floaters(g, t0 + 0.2, t1, 0.5, (p) => heart(p, 0, 0, 0.45), 540, 760);
        say(fl, L, t0 + 0.5, -1); say(fr, R, t0 + 1.0, 1);
      } else if (kind === "give") {
        act(fl, "stand", t0, t1, g); act(fr, "stand", t0, t1, g);
        P(fl, t0 + 0.3, { ua1: 80, fa1: 0 }, 0.3); P(fr, t0 + 0.6, { ua1: 80, fa1: 0 }, 0.3);
        const item = grp(g); rect(item, -34, -26, 68, 52, { rx: 8, fill: sc.color || RED, w: 5 }); line(item, 0, -26, 0, 26, 5, Y);
        if (sc.item) text(item, 0, -40, sc.item, { fs: 30 });
        gsap.set(item, { x: 470, y: 960 });
        tl.to(item, { x: 610, duration: 0.6, ease: "power2.inOut" }, t0 + 0.8);
        mouth(fr, t0 + 1.4, "grin"); burst(g, 610, 960, t0 + 1.4, 70, Y);
        say(fl, L, t0 + 0.3, -1); say(fr, R, t0 + 1.5, 1);
      } else if (kind === "chase") {
        act(fl, "run", t0, t1, g); act(fr, "run", t0, t1, g);
        mouth(fr, t0, "o"); say(fl, L, t0 + 0.4, -1); say(fr, R, t0 + 1.0, 1);
      } else if (kind === "doctor") {
        act(fl, "stand", t0, t1, g); P(fr, t0, STAND, 0);
        const cr = grp(fr.mid); rect(cr, -2, -92, 36, 36, { rx: 6, w: 4 }); line(cr, 16, -84, 16, -64, 5, RED); line(cr, 6, -74, 26, -74, 5, RED);
        P(fr, t0 + 0.3, { ua1: 80, fa1: 10, lean: 6, hd: 6 }, 0.3);
        const st = path(g, `M${xr - 8} 920 Q ${(xl + xr) / 2} 1040 ${xl + 40} 962`, { stroke: "#6b6f78", w: 6 }); draw(st, t0 + 0.5, 0.4);
        const dsc = hidden(circ(g, xl + 40, 962, 12, { fill: STEEL, w: 4 })); show(dsc, t0 + 0.8);
        for (let t = t0 + 1.2, i = 0; t < t1 - 0.3; t += 0.3, i++) P(fr, t, { hd: i % 2 ? 6 : 16 }, 0.3);
        say(fl, L, t0 + 0.4, -1); say(fr, R, t0 + 1.2, 1);
      }
      if (L.label) { const l = hidden(tag(g, xl, GROUND + 50, L.label, { fs: 32 })); show(l, t0 + 0.4); }
      if (R.label) { const l = hidden(tag(g, xr, GROUND + 50, R.label, { fs: 32 })); show(l, t0 + 0.55); }
    };
    SCENES.phone = (g, sc, t0, t1) => {
      ground(g);
      const f = person(g, 300, HY, S, { mood: sc.mood || "shock", look: sc.look }, "phone", t0, t1);
      const [px, py] = hand(f, { ua: 55, fa: 95 });
      line(g, px + 40, py - 60, 540, 640, 4, BACK).setAttribute("stroke-dasharray", "10 12");
      line(g, px + 40, py + 40, 540, 1040, 4, BACK).setAttribute("stroke-dasharray", "10 12");
      rect(g, 540, 600, 460, 470, { rx: 36, w: 7 });
      if (sc.top) text(g, 770, 668, sc.top, { fs: 38, fill: RED });
      if (sc.msgs && sc.msgs.length) {
        let y = sc.top ? 720 : 660;
        sc.msgs.slice(0, 3).forEach((m, i) => {
          const me = m.me || i % 2 === 1, rows = wrap(m.text || m, 15), h = rows.length * 40 + 30, w = Math.max(...rows.map((r) => r.length)) * 19 + 44;
          const bg = hidden(grp(g)), x0 = me ? 975 - w : 565;
          rect(bg, x0, y, w, h, { rx: 22, fill: me ? Y : "#ece6da", w: 4 });
          rows.forEach((r, j) => text(bg, x0 + 22, y + 44 + j * 40, r, { fs: 32, anchor: "start" }));
          show(bg, t0 + 0.25 + i * Math.min(0.9, (t1 - t0 - 0.6) / 3), { from: 0.5, origin: me ? "100% 50%" : "0% 50%" });
          y += h + 20;
        });
      } else {
        ground(g, 1010, 580, 960);
        const m = fig(g, 770, 1010 - 130, 0.9, { mouth: moodOf(sc.show || "run"), band: RED });
        act(m, sc.show || "run", t0, t1, g, {});
      }
      const q1 = hidden(text(g, 190, 800, "?", { fs: 130, fw: 900, fill: RED })); show(q1, t0 + 0.3);
      const q2 = hidden(text(g, 330, 740, "?", { fs: 160, fw: 900, fill: RED })); show(q2, t0 + 1.0);
    };
    SCENES.chat = (g, sc, t0, t1) => {
      rect(g, 130, 590, 820, 700, { rx: 44, w: 7 });
      rect(g, 130, 590, 820, 96, { rx: 44, fill: "#ece6da", w: 7 });
      mk("rect", { x: 134, y: 650, width: 812, height: 34, fill: "#ece6da" }, g);
      line(g, 130, 686, 950, 686, 6);
      circ(g, 200, 638, 26, { fill: Y, w: 4 }); text(g, 245, 652, sc.name || "Bạn thân", { fs: 38, anchor: "start" });
      const msgs = (sc.msgs || []).slice(0, 4), D = t1 - t0;
      let y = 720;
      msgs.forEach((m, i) => {
        const me = m.me ?? i % 2 === 1, rows = wrap(m.text || m, 22), h = rows.length * 46 + 32, w = Math.min(640, Math.max(...rows.map((r) => r.length)) * 22 + 52);
        const bg = hidden(grp(g)), x0 = me ? 915 - w : 165;
        rect(bg, x0, y, w, h, { rx: 26, fill: me ? Y : "#ece6da", w: 4 });
        rows.forEach((r, j) => text(bg, x0 + 26, y + 50 + j * 46, r, { fs: 38, anchor: "start" }));
        show(bg, t0 + 0.2 + i * Math.max(0.5, (D - 0.8) / Math.max(1, msgs.length)), { from: 0.5, origin: me ? "100% 50%" : "0% 50%" });
        y += h + 22;
      });
    };
    SCENES.panels = (g, sc, t0, t1) => {
      const items = (sc.items || []).slice(0, 4), n = items.length, D = t1 - t0;
      const two = n <= 2, PH = two ? 600 : 450, PS = two ? 1.15 : 0.95;
      items.forEach((it, i) => {
        const x0 = 60 + (i % 2) * 500, y0 = two ? 640 : 430 + Math.floor(i / 2) * 480, fl = y0 + PH - 40;
        const pg = hidden(grp(g));
        rect(pg, x0, y0, 460, PH, { rx: 30, w: 6 });
        circ(pg, x0 + 52, y0 + 52, 30, { fill: Y, w: 5 });
        text(pg, x0 + 52, y0 + 66, String(it.n ?? i + 1), { fs: 40, fw: 900 });
        text(pg, x0 + 96, y0 + 66, it.label || "", { fs: (it.label || "").length > 15 ? 32 : 38, anchor: "start" });
        line(pg, x0 + 30, fl, x0 + 430, fl, 6);
        const t = t0 + 0.1 + i * Math.min(1.0, (D - 0.8) / n);
        tl.to(pg, { opacity: 1, duration: 0.12 }, t); pop(pg, t, { from: 0.8, d: 0.35 });
        const hy = fl - 144 * PS - (it.do === "laptop" || it.do === "sit" ? -72 * PS : 0);
        const sub = grp(pg);
        it._panel = true;
        person(sub, x0 + (it.do === "push" || it.do === "laptop" ? 130 : it.do === "pull" ? 120 : 230), hy, PS, { mood: it.mood, look: it.look }, it.do, t, t1, it);
      });
    };
    SCENES.dialog = (g, sc, t0, t1, id) => {
      ground(g);
      const D = t1 - t0, s = 1.2, f = fig(g, 300, GROUND - 144 * s, s, { mouth: moodOf("stand", sc.mood || "tired"), hair: sc.look === "nu" });
      blink(f, t0, t1);
      const btns = (sc.buttons && sc.buttons.length ? sc.buttons : ["Huỷ", "OK"]).slice(0, 2);
      const d = document.createElement("div"); d.className = "dlg"; d.id = id + "-dlg"; d.setAttribute("data-layout-allow-overlap", "");
      d.innerHTML = `<div class="dh">${esc(sc.title || "")}</div><div class="db">${esc(sc.text || "")}</div><div class="df">${btns.length > 1 ? `<div class="btn no" id="${id}-no">${esc(btns[0])}<div class="strike"></div></div>` : ""}<div class="btn yes" id="${id}-yes">${esc(btns[btns.length - 1])}</div></div><div class="dnote" id="${id}-note">${esc(sc.note || "")}</div>`;
      txt.appendChild(d);
      const nt = d.querySelector(".dnote");
      const ta = t0 + 0.3, tb = t0 + D * 0.38, tc = t0 + D * 0.72;
      tl.set(d, { opacity: 1 }, ta);
      tl.fromTo(d, { scale: 0.6, transformOrigin: "50% 50%" }, { scale: 1, duration: 0.4, ease: "back.out(2)" }, ta);
      P(f, t0, STAND, 0);
      P(f, ta, { hd: -14, ua1: 20, fa1: 30 }, 0.3);
      const REACH = { ua1: 152, fa1: -8, hd: -22, lean: 2 };
      if (btns.length > 1) {
        P(f, tb - 0.25, REACH, 0.25, "power2.out"); mouth(f, tb - 0.2, "smile");
        const r1 = hidden(circ(g, 640, 740, 30, { fill: "none", stroke: RED }));
        tl.fromTo(r1, { opacity: 1, scale: 0.3, transformOrigin: "50% 50%" }, { opacity: 0, scale: 2.2, duration: 0.4, ease: "power2.out", immediateRender: false }, tb);
        if (sc.note) {
          tl.to(`#${id}-no`, { x: 14, duration: 0.05, yoyo: true, repeat: 5, ease: "none" }, tb + 0.05);
          tl.fromTo(`#${id}-no .strike`, { scaleX: 0 }, { scaleX: 1, duration: 0.25, ease: "power2.out" }, tb + 0.15);
          tl.to(`#${id}-no`, { opacity: 0.55, duration: 0.2 }, tb + 0.25);
          tl.set(nt, { opacity: 1 }, tb + 0.2);
          tl.fromTo(nt, { scale: 1.4, transformOrigin: "100% 50%" }, { scale: 1, duration: 0.3, ease: "back.out(2)" }, tb + 0.2);
          P(f, tb + 0.4, { ua1: 20, fa1: 10, lean: 14, hd: 20 }, 0.3); mouth(f, tb + 0.4, "sad");
        }
      }
      P(f, tc - 0.25, REACH, 0.25, "power2.out");
      tl.to(`#${id}-yes`, { scale: 0.9, duration: 0.08, yoyo: true, repeat: 1 }, tc);
      const r2 = hidden(circ(g, 860, 740, 30, { fill: "none" }));
      tl.fromTo(r2, { opacity: 1, scale: 0.3, transformOrigin: "50% 50%" }, { opacity: 0, scale: 2.2, duration: 0.4, ease: "power2.out", immediateRender: false }, tc);
      P(f, tc + 0.3, STAND, 0.3); mouth(f, tc + 0.3, sc.after === "sad" ? "sad" : "grin");
      tl.to(d, { opacity: 0, duration: 0.18 }, t1 - 0.2);
    };
    SCENES.sign = (g, sc, t0, t1) => {
      ground(g);
      const f = fig(g, 540, HY, S, { mouth: moodOf("stand", sc.mood || "grin"), hair: sc.look === "nu" });
      blink(f, t0, t1);
      const pose = Object.assign({}, STAND, { ua1: 165, fa1: 10, ua2: 160, fa2: 15 });
      P(f, t0, pose, 0);
      const b = grp(g), rows = wrap(sc.text || "", 12), fs = rows.length > 1 ? 70 : 96, h = rows.length * fs * 1.1 + 50, w = 640;
      const top = 780 - 30 - h;
      line(b, 540, top + h, 540, 830, 10);
      rect(b, 540 - w / 2, top, w, h, { rx: 18, fill: sc.color === "yellow" ? Y : WHITE, w: 8 });
      rows.forEach((r, i) => text(b, 540, top + 25 + fs * 0.92 + i * fs * 1.1, r, { fs, fw: 900, fill: sc.color === "red" ? RED : INK }));
      pop(b, t0 + 0.05, { from: 0.4, origin: "50% 100%" });
      for (let t = t0 + 0.4, i = 0; t < t1 - 0.4; t += 0.45, i++) { tl.to(b, { y: i % 2 ? 0 : -14, duration: 0.45, ease: "sine.inOut" }, t); P(f, t, { dy: i % 2 ? 0 : -9 }, 0.45); }
    };
    SCENES.calendar = (g, sc, t0, t1) => {
      ground(g);
      person(g, 300, HY, S, { mood: sc.mood || "grin", look: sc.look }, "point", t0, t1);
      const cal = grp(g);
      rect(cal, 560, 720, 420, 500, { rx: 26, w: 7 });
      path(cal, "M560 830 L560 746 Q 560 720 586 720 L954 720 Q 980 720 980 746 L980 830 Z", { fill: RED, w: 7 });
      text(cal, 770, 790, sc.month || "", { fs: (sc.month || "").length > 14 ? 34 : 42, fill: WHITE });
      line(cal, 650, 700, 650, 745, 10); line(cal, 890, 700, 890, 745, 10);
      const day = String(sc.day || "");
      const dt = text(cal, 770, 1090, day, { ff: "Anton", fw: 400, fs: day.length > 5 ? 130 : day.length > 3 ? 170 : 220 });
      tl.fromTo(cal, { scaleY: 0, transformOrigin: "50% 0%" }, { scaleY: 1, duration: 0.45, ease: "back.out(1.6)" }, t0 + 0.1);
      tl.fromTo(dt, { opacity: 0, scale: 1.6, transformOrigin: "50% 50%" }, { opacity: 1, scale: 1, duration: 0.35, ease: "power3.out" }, t0 + 0.6);
      if (sc.stamp) {
        const st = hidden(grp(g)), sg = grp(st, { transform: "rotate(-12 820 1170)" });
        rect(sg, 670, 1130, 300, 80, { rx: 14, fill: "rgba(228,87,46,.08)", stroke: RED, w: 7 });
        text(sg, 820, 1186, sc.stamp, { fs: sc.stamp.length > 9 ? 40 : 50, fw: 900, fill: RED });
        tl.fromTo(st, { opacity: 0, scale: 2.2, transformOrigin: "50% 50%" }, { opacity: 1, scale: 1, duration: 0.25, ease: "power3.in" }, t0 + Math.min(1.4, (t1 - t0) * 0.6));
      }
    };
    SCENES.stat = (g, sc, t0, t1) => {
      ground(g);
      person(g, 230, HY, S, { mood: sc.mood || "shock", look: sc.look }, sc.do || "shock", t0, t1);
      const v = String(sc.value || ""), fs = v.length > 7 ? 150 : v.length > 5 ? 190 : 240;
      const box = grp(g);
      const num = /^[\d.]+$/.test(v.replace(/[+%]/g, "")) && v.replace(/\D/g, "").length > 0 && v.replace(/\D/g, "").length <= 7;
      if (num) {
        const target = parseInt(v.replace(/\D/g, ""), 10), suffix = v.replace(/[\d.]/g, ""), dots = v.includes(".");
        const fmt = (n) => (dots ? String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ".") : String(n)) + suffix;
        const steps = 12;
        for (let k = 0; k <= steps; k++) {
          const tx = text(box, 690, 1010, fmt(Math.round(target * (k === steps ? 1 : Math.pow(k / steps, 2)))), { ff: "Anton", fw: 400, fs });
          tx.style.opacity = 0;
          tl.set(tx, { opacity: 1 }, t0 + 0.2 + k * 0.06); if (k < steps) tl.set(tx, { opacity: 0 }, t0 + 0.26 + k * 0.06);
        }
      } else { const tx = text(box, 690, 1010, v, { ff: "Anton", fw: 400, fs }); pop(tx, t0 + 0.2); }
      const bar = hidden(rect(g, 470, 1030, 440, 22, { rx: 11, fill: Y, w: 0 }));
      tl.fromTo(bar, { opacity: 1, scaleX: 0, transformOrigin: "0% 50%" }, { scaleX: 1, duration: 0.5, ease: "power2.out", immediateRender: false }, t0 + 1.0);
      if (sc.label) { const n = textBlock(g, 690, 1120, sc.label, { fs: 40, max: 20 }); }
    };
    SCENES.versus = (g, sc, t0, t1) => {
      ground(g);
      const L = sc.left || {}, R = sc.right || {};
      person(g, 270, HY, S, { mood: L.mood, look: L.look, band: L.band }, L.do || "stand", t0, t1, L);
      person(g, 810, HY, S, { flip: true, mood: R.mood, look: R.look, band: R.band }, R.do || "stand", t0, t1, R);
      const vs = text(g, 540, 1000, "VS", { ff: "Anton", fw: 400, fs: 150, fill: RED }); pop(vs, t0 + 0.4, { ease: "back.out(3)" });
      if (L.label) { const l = hidden(tag(g, 270, 700, L.label, { fs: 34 })); show(l, t0 + 0.2); }
      if (R.label) { const l = hidden(tag(g, 810, 700, R.label, { fs: 34 })); show(l, t0 + 0.6); }
    };
    SCENES.crowd = (g, sc, t0, t1) => {
      ground(g);
      const n = Math.max(3, Math.min(7, sc.count || 5)), s = 0.95, hy = GROUND - 144 * s;
      for (let i = 0; i < n; i++) {
        const x = 130 + i * (820 / (n - 1));
        const sub = hidden(grp(g));
        person(sub, x, hy - (i % 2) * 0, s, { mood: sc.mood, look: i % 3 === 1 ? "nu" : "", band: i % 2 ? RED : undefined }, sc.do || "cheer", t0, t1, sc);
        tl.to(sub, { opacity: 1, duration: 0.1 }, t0 + i * 0.12); pop(sub, t0 + i * 0.12, { from: 0.5, origin: "50% 100%" });
      }
      if (sc.label) { const l = hidden(tag(g, 540, 760, sc.label, { fs: 40, fill: Y })); show(l, t0 + 0.6); }
    };
    SCENES.icons = (g, sc, t0, t1, id, ICONS) => {
      ground(g);
      const items = (sc.items || []).slice(0, 3), n = items.length, D = t1 - t0;
      items.forEach((it, i) => {
        const x = n === 1 ? 540 : n === 2 ? 330 + i * 420 : 230 + i * 310, ig = hidden(grp(g));
        circ(ig, x, 650, 70, { w: 6 });
        const ic = grp(ig, { transform: `translate(${x - 40} 610) scale(1.667)` });
        (ICONS[it.icon] || ICONS.spark).forEach((d) => mk("path", { d, fill: it.icon === "heart" ? RED : "none", stroke: INK, "stroke-width": 2.6, "stroke-linecap": "round", "stroke-linejoin": "round" }, ic));
        text(ig, x, 765, it.label || "", { fs: (it.label || "").length > 12 ? 30 : 36 });
        const t = t0 + 0.15 + i * Math.min(0.9, (D - 0.6) / n);
        tl.to(ig, { opacity: 1, duration: 0.1 }, t); pop(ig, t);
      });
      const ido = !sc.do || sc.do === "think" || sc.do === "idea" ? "point" : sc.do;
      person(g, 540, HY, S, { mood: sc.mood, look: sc.look }, ido, t0, t1, sc);
    };
    SCENES.board = (g, sc, t0, t1) => {
      ground(g);
      rect(g, 360, 640, 650, 470, { rx: 18, w: 8 });
      line(g, 520, 1110, 480, 1300, 8); line(g, 850, 1110, 890, 1300, 8);
      const lines = (sc.lines || []).slice(0, 4), D = t1 - t0;
      lines.forEach((l, i) => {
        const tx = hidden(text(g, 400, 740 + i * 100, (i + 1) + ". " + l, { fs: l.length > 16 ? 40 : 48, anchor: "start" }));
        tl.fromTo(tx, { opacity: 0, x: -20 }, { opacity: 1, x: 0, duration: 0.3, ease: "power2.out", immediateRender: false }, t0 + 0.2 + i * Math.min(0.9, (D - 0.6) / lines.length));
      });
      const f = person(g, 200, HY, S, { mood: sc.mood || "happy", look: sc.look || "kinh" }, "stand", t0, t1);
      const stick = grp(f.h1); line(stick, 0, 13, 0, 150, 5, WOOD);
      for (let i = 0; i < lines.length; i++) P(f, t0 + 0.2 + i * Math.min(0.9, (D - 0.6) / lines.length), { ua1: 95 + i * 6, fa1: 15 - i * 12 }, 0.25);
    };
    // cảnh cuối: chạy về phía người xem, phá dây đích, pháo giấy, vẫy tay
    SCENES.outro = (g, sc, t0, t1) => {
      ground(g);
      line(g, 90, 1300, 90, 990, 10); line(g, 990, 1300, 990, 990, 10);
      const tL = line(g, 90, 1060, 540, 1060, 9, RED), tR = line(g, 540, 1060, 990, 1060, 9, RED);
      for (let i = 0; i < 18; i++) for (let j = 0; j < 2; j++) mk("rect", { x: 90 + i * 50, y: 940 + j * 25, width: 50, height: 25, fill: (i + j) % 2 ? INK : WHITE }, g);
      rect(g, 90, 940, 900, 50, { rx: 0, fill: "none", w: 6 });
      const f = fig(g, 540, 940, 0.55, { mouth: "grin", band: RED, sw: 3.7 });
      blink(f, t0 + 1.5, t1);
      const ta = t0 + 0.3;
      P(f, t0, { ex: -15, th1: 10, th2: -10, ua1: 30, fa1: 60, ua2: -30, fa2: -60 }, 0);
      for (let t = t0, i = 0; t < ta; t += 0.1, i++) P(f, t, { th1: i % 2 ? 4 : 18, th2: i % 2 ? -18 : -4, dy: i % 2 ? 0 : -8 }, 0.1);
      tl.to(f.root, { scale: 1.5, y: HY, duration: ta - t0, ease: "power2.in" }, t0);
      tl.to(tL, { rotation: 32, svgOrigin: "90 1060", duration: 0.5, ease: "bounce.out" }, ta);
      tl.to(tR, { rotation: -32, svgOrigin: "990 1060", duration: 0.5, ease: "bounce.out" }, ta);
      P(f, ta, { ua1: 150, fa1: 15, ua2: -150, fa2: -15, th1: 14, sn1: 0, th2: -14, sn2: 0 }, 0.18, "back.out(2)");
      P(f, ta + 0.1, { dy: -60 }, 0.22, "power2.out"); P(f, ta + 0.32, { dy: 0 }, 0.2, "power2.in");
      const cols = [Y, RED, BLUE, PURPLE, GREEN];
      for (let i = 0; i < 34; i++) {
        const c = hidden(mk("rect", { x: -9, y: -5, width: 18, height: 10, fill: cols[i % 5] }, g));
        const x = 120 + rnd() * 840, y0 = 600 + rnd() * 140, delay = rnd() * 0.5;
        tl.fromTo(c, { x: 540, y: 960, opacity: 1, rotation: 0 }, { x, y: y0, rotation: rnd() * 360, duration: 0.4, ease: "power2.out", immediateRender: false }, ta + delay * 0.2);
        tl.to(c, { y: 1290, rotation: "+=" + (200 + rnd() * 400), duration: 2.2 + rnd(), ease: "power1.in" }, ta + 0.45 + delay);
        tl.to(c, { opacity: 0, duration: 0.3 }, ta + 2.6 + delay);
      }
      const tw = ta + Math.min(2.6, (t1 - ta) * 0.4);
      P(f, tw, { ua1: 135, fa1: 30, ua2: -10, fa2: -10 }, 0.3); mouth(f, tw, "smile");
      for (let t = tw + 0.3, i = 0; t < t1 - 0.3; t += 0.22, i++) P(f, t, { fa1: i % 2 ? 30 : -20 }, 0.22);
      const bub = hidden(grp(g));
      path(bub, "M760 760 Q 760 700 830 700 L960 700 Q 1010 700 1010 760 Q 1010 820 960 820 L860 820 L820 860 L830 820 Q 760 820 760 760Z", { fill: WHITE, w: 6 });
      [840, 885, 930].forEach((x) => circ(bub, x, 762, 11, { fill: INK, w: 0 }));
      show(bub, tw + 0.5);
    };

    // ---------- dựng ----------
    spec.cards.forEach((c, i) => header("h" + i, c, c.t0, c.t1, c.hook));
    spec.visuals.forEach((v, i) => {
      const g = hidden(grp(stage, { id: "v" + i }));
      if (v.t0 <= 0) tl.set(g, { opacity: 1 }, 0);
      else tl.fromTo(g, { y: 24 }, { opacity: 1, y: 0, duration: 0.22, ease: "power2.out" }, v.t0);
      if (v.t1 < END) tl.to(g, { opacity: 0, duration: 0.18 }, v.t1 - 0.18);
      const sc = v.scene;
      (SCENES[sc.type] || SCENES.act)(g, sc, Math.max(0, v.t0), v.t1, "v" + i, spec.icons || {});
    });
    tl.set({}, {}, END);
    return tl;
  }
  return { build };
})();
