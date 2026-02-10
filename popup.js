"use strict";

document.addEventListener('DOMContentLoaded', () => {
    // 1. Matter.js の存在確認（ReferenceError 対策）
    if (typeof Matter === 'undefined') {
        setTimeout(() => {
            if (typeof Matter === 'undefined') {
                document.body.innerHTML = '<div style="color:#ff5252; padding:20px; background:#000; height:100vh;">Matter.js Error: 読み込みに失敗しました。</div>';
            } else {
                startApp();
            }
        }, 500);
    } else {
        startApp();
    }

    function startApp() {
        const { Engine, Render, Runner, Bodies, Composite, Mouse, MouseConstraint, Events } = Matter;

        const defaultSites = [
            { name: 'Civitai', url: 'https://civitai.com', color: '#2196F3', logo: 'https://img.icons8.com/fluency/144/c-loading.png' },
            { name: 'Pinterest', url: 'https://www.pinterest.jp', color: '#E60023', logo: 'https://img.icons8.com/color/144/pinterest--v1.png' },
            { name: 'Google', url: 'https://www.google.com', color: '#4CAF50', logo: 'https://img.icons8.com/color/144/google-logo.png' },
            { name: 'Audio Editor', url: 'file:///c:/Users/nekon/OneDrive/デスクトップ/Antigravity/Audio%20Editor/', color: '#9C27B0', logo: 'https://img.icons8.com/fluency/144/audio-wave.png' },
            { name: 'Instagram', url: 'file:///c:/Users/nekon/OneDrive/デスクトップ/Antigravity/Instagram投稿/', color: '#E1306C', logo: 'https://img.icons8.com/fluency/144/instagram-new.png' },
            { name: 'Browser', url: 'file:///c:/Users/nekon/OneDrive/デスクトップ/Antigravity/Prompt-Flow-Browser/renderer/index.html', color: '#00BCD4', logo: 'https://img.icons8.com/fluency/144/web.png' }
        ];

        const engine = Engine.create();
        engine.world.gravity.y = 0.6;

        const render = Render.create({
            element: document.body,
            engine: engine,
            options: { width: 400, height: 500, wireframes: false, background: 'transparent' }
        });

        const wallOptions = { isStatic: true, render: { visible: false } };
        Composite.add(engine.world, [
            Bodies.rectangle(200, 510, 400, 20, wallOptions),
            Bodies.rectangle(-10, 250, 20, 500, wallOptions),
            Bodies.rectangle(410, 250, 20, 500, wallOptions),
            Bodies.rectangle(200, -100, 400, 20, wallOptions)
        ]);

        const mouse = Mouse.create(render.canvas);
        const mouseConstraint = MouseConstraint.create(engine, {
            mouse: mouse,
            constraint: { stiffness: 0.2, render: { visible: false } }
        });
        Composite.add(engine.world, mouseConstraint);

        Events.on(mouseConstraint, "mousedown", () => {
            if (mouseConstraint.body && mouseConstraint.body.siteUrl) {
                const body = mouseConstraint.body;
                if (typeof confetti === 'function') {
                    confetti({
                        particleCount: 50, spread: 60,
                        origin: { x: body.position.x / 400, y: body.position.y / 500 },
                        colors: [body.siteColor]
                    });
                }
                chrome.tabs.create({ url: body.siteUrl });
                Composite.remove(engine.world, body);
            }
        });

        Render.run(render);
        Runner.run(Runner.create(), engine);

        // 2. バルーン生成（画像読み込みチェック付き / InvalidStateError 対策）
        function addBalloon(site, delay = 0) {
            setTimeout(() => {
                const img = new Image();
                img.onload = () => {
                    const b = Bodies.circle(100 + Math.random() * 200, -50, 40, {
                        restitution: 0.8, frictionAir: 0.05,
                        render: { sprite: { texture: site.logo, xScale: 0.55, yScale: 0.55 } }
                    });
                    b.siteUrl = site.url; b.siteColor = site.color;
                    Composite.add(engine.world, b);
                };
                img.onerror = () => {
                    // 画像の読み込みに失敗した場合は色付きの円を表示
                    const b = Bodies.circle(100 + Math.random() * 200, -50, 40, {
                        restitution: 0.8, frictionAir: 0.05,
                        render: { fillStyle: site.color, strokeStyle: '#fff', lineWidth: 2 }
                    });
                    b.siteUrl = site.url; b.siteColor = site.color;
                    Composite.add(engine.world, b);
                };
                img.src = site.logo;
            }, delay);
        }

        defaultSites.forEach((site, i) => addBalloon(site, i * 200));

        document.getElementById('add-btn').onclick = () => {
            const input = document.getElementById('site-url');
            const url = input.value.trim();
            if (url) {
                const fullUrl = (url.startsWith('http') || url.startsWith('file')) ? url : `https://${url}`;
                addBalloon({ name: 'User Site', url: fullUrl, color: '#FFEB3B', logo: 'https://img.icons8.com/fluency/144/web.png' });
                input.value = '';
            }
        };
    }
});
