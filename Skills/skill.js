(() => {
    const container = document.getElementById('holoContainer');
    const canvas = document.getElementById('skillsCanvas');
    if (!container || !canvas) return;

    const ctx = canvas.getContext('2d');

    const skillsData = [
        { name: "MATLAB", category: "Programming Languages" },
        { name: "Python", category: "Programming Languages" },
        { name: "C / C++", category: "Programming Languages" },
        { name: "COMSOL Multiphysics", category: "Engineering Software" },
        { name: "Autodesk Inventor", category: "Engineering Software" },
        { name: "Inventor Nastran", category: "Engineering Software" },
        { name: "Fusion 360", category: "Engineering Software" },
        { name: "Autodesk EAGLE", category: "Engineering Software" },
        { name: "HTML", category: "Web & Tools" },
        { name: "CSS", category: "Web & Tools" },
        { name: "JavaScript", category: "Web & Tools" },
        { name: "LaTeX", category: "Web & Tools" },
        { name: "Microsoft Office", category: "Web & Tools" }
    ];

    let width, height, radius;
    const fov = 550;

    let angleX = 0.2;
    let angleY = 0;
    const velX = 0.0012;
    const velY = 0.0035;

    let isDragging = false;
    let lastMouseX = 0;
    let lastMouseY = 0;
    let mouseX = -9999;
    let mouseY = -9999;
    let hoveredNode = null;

    // Distribuzione uniforme dei 13 nodi tramite Sfera di Fibonacci
    const nodes = skillsData.map((skill, i) => {
        const n = skillsData.length;
        const phi = Math.acos(1 - 2 * (i + 0.5) / n);
        const theta = Math.PI * (1 + Math.sqrt(5)) * i;
        return {
            ...skill,
            x: Math.cos(theta) * Math.sin(phi),
            y: Math.sin(theta) * Math.sin(phi),
            z: Math.cos(phi),
            screenX: 0,
            screenY: 0,
            scale: 1,
            depth: 0
        };
    });

    // Particelle energetiche di sfondo
    const particles = Array.from({ length: 140 }, () => {
        const u = Math.random();
        const v = Math.random();
        const theta = u * 2.0 * Math.PI;
        const phi = Math.acos(2.0 * v - 1.0);
        const r = 0.78 + Math.random() * 0.28;
        return {
            x: r * Math.sin(phi) * Math.cos(theta),
            y: r * Math.sin(phi) * Math.sin(theta),
            z: r * Math.cos(phi),
            size: 0.8 + Math.random() * 1.6
        };
    });

    function resize() {
        const dpr = window.devicePixelRatio || 1;
        width = container.clientWidth;
        height = container.clientHeight;
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        radius = Math.min(width * 0.34, height * 0.34);
    }

    window.addEventListener('resize', resize);
    resize();

    function rotate3D(p, ax, ay) {
        const cosY = Math.cos(ay);
        const sinY = Math.sin(ay);
        const x1 = p.x * cosY - p.z * sinY;
        const z1 = p.z * cosY + p.x * sinY;

        const cosX = Math.cos(ax);
        const sinX = Math.sin(ax);
        const y2 = p.y * cosX - z1 * sinX;
        const z2 = z1 * cosX + p.y * sinX;

        return { x: x1, y: y2, z: z2 };
    }

    function project(p3d) {
        const zWorld = p3d.z * radius;
        const scale = fov / (fov - zWorld);
        return {
            x: width / 2 + p3d.x * radius * scale,
            y: height / 2 + p3d.y * radius * scale,
            scale: scale,
            z: p3d.z
        };
    }

    function drawOrbitalRing(tiltX, tiltZ, ringRadiusFactor, alpha) {
        ctx.beginPath();
        const segments = 72;
        for (let i = 0; i <= segments; i++) {
            const a = (i / segments) * Math.PI * 2;
            const rx = Math.cos(a) * ringRadiusFactor;
            const ry = 0;
            const rz = Math.sin(a) * ringRadiusFactor;

            const yTilt = ry * Math.cos(tiltX) - rz * Math.sin(tiltX);
            const zTilt = rz * Math.cos(tiltX) + ry * Math.sin(tiltX);
            const xTilt = rx * Math.cos(tiltZ) - yTilt * Math.sin(tiltZ);
            const yFinal = yTilt * Math.cos(tiltZ) + rx * Math.sin(tiltZ);

            const rot = rotate3D({ x: xTilt, y: yFinal, z: zTilt }, angleX * 0.7, angleY * 0.7);
            const proj = project(rot);

            if (i === 0) ctx.moveTo(proj.x, proj.y);
            else ctx.lineTo(proj.x, proj.y);
        }
        ctx.strokeStyle = `rgba(140, 75, 10, ${alpha})`;
        ctx.lineWidth = 1;
        ctx.stroke();
    }

    function drawNode(node, cx, cy) {
        const isHovered = hoveredNode === node;
        const baseAlpha = Math.max(0.24, Math.min(1, (node.depth + 1.15) / 1.85));
        const alpha = isHovered ? 1 : (hoveredNode ? baseAlpha * 0.42 : baseAlpha);

        // Connessione sinaptica al nucleo
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(node.screenX, node.screenY);
        ctx.strokeStyle = isHovered
            ? 'rgba(180, 83, 9, 0.9)'
            : `rgba(120, 65, 15, ${alpha * 0.25})`;
        ctx.lineWidth = isHovered ? 1.8 : 0.85;
        ctx.stroke();

        // Punto del nodo
        const dotRadius = (isHovered ? 6.5 : 3.8) * node.scale;
        ctx.beginPath();
        ctx.arc(node.screenX, node.screenY, dotRadius, 0, Math.PI * 2);
        ctx.fillStyle = isHovered ? '#B45309' : `rgba(154, 77, 0, ${alpha})`;
        if (isHovered || node.depth > 0.2) {
            ctx.shadowColor = 'rgba(180, 83, 9, 0.55)';
            ctx.shadowBlur = isHovered ? 12 : 5;
        }
        ctx.fill();
        ctx.shadowBlur = 0;

        // Etichetta testo
        const baseFont = width < 480 ? 10.5 : 12.5;
        const fontSize = Math.round((isHovered ? baseFont + 2.5 : baseFont) * node.scale);
        ctx.font = `${isHovered ? '700' : '500'} ${fontSize}px Inter, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        ctx.fillStyle = isHovered ? '#111111' : `rgba(40, 35, 30, ${alpha})`;
        ctx.fillText(node.name, node.screenX, node.screenY - dotRadius - 5);
    }

    function animate() {
        ctx.clearRect(0, 0, width, height);
        const cx = width / 2;
        const cy = height / 2;

        if (!isDragging) {
            const speedFactor = hoveredNode ? 0.12 : 1;
            angleX += velX * speedFactor;
            angleY += velY * speedFactor;
        }

        drawOrbitalRing(0.55, 0.3, 1.08, 0.24);
        drawOrbitalRing(-0.65, -0.4, 0.92, 0.18);
        drawOrbitalRing(1.1, 0.1, 0.72, 0.15);

        particles.forEach(p => {
            const rot = rotate3D(p, angleX, angleY);
            const proj = project(rot);
            const alpha = Math.max(0.1, (proj.z + 1) * 0.35);
            ctx.fillStyle = `rgba(154, 77, 0, ${alpha})`;
            ctx.beginPath();
            ctx.arc(proj.x, proj.y, p.size * proj.scale, 0, Math.PI * 2);
            ctx.fill();
        });

        const projectedNodes = nodes.map(node => {
            const rot = rotate3D(node, angleX, angleY);
            const proj = project(rot);
            node.screenX = proj.x;
            node.screenY = proj.y;
            node.scale = proj.scale;
            node.depth = proj.z;
            return node;
        }).sort((a, b) => a.depth - b.depth);

        hoveredNode = null;
        for (let i = projectedNodes.length - 1; i >= 0; i--) {
            const n = projectedNodes[i];
            const dx = mouseX - n.screenX;
            const dy = mouseY - n.screenY;
            const hitRadius = 36 * n.scale;
            if (dx * dx + dy * dy < hitRadius * hitRadius) {
                hoveredNode = n;
                break;
            }
        }

        // Nodi posteriori
        projectedNodes.filter(n => n.depth < 0).forEach(n => drawNode(n, cx, cy));

        // Nucleo centrale SKILLS
        const coreGradient = ctx.createRadialGradient(cx, cy, 4, cx, cy, 58);
        coreGradient.addColorStop(0, 'rgba(217, 119, 6, 0.32)');
        coreGradient.addColorStop(0.5, 'rgba(180, 83, 9, 0.14)');
        coreGradient.addColorStop(1, 'rgba(180, 83, 9, 0)');
        ctx.fillStyle = coreGradient;
        ctx.beginPath();
        ctx.arc(cx, cy, 58, 0, Math.PI * 2);
        ctx.fill();

        // Anello interno del nucleo
        ctx.strokeStyle = 'rgba(154, 77, 0, 0.65)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(cx, cy, 34, 0, Math.PI * 2);
        ctx.stroke();

        // Scritta centrale SKILLS
        ctx.fillStyle = '#222222';
        ctx.font = '700 13px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('SKILLS', cx, cy);

        // Nodi anteriori
        projectedNodes.filter(n => n.depth >= 0).forEach(n => drawNode(n, cx, cy));

        requestAnimationFrame(animate);
    }

    container.addEventListener('pointerdown', e => {
        isDragging = true;
        lastMouseX = e.clientX;
        lastMouseY = e.clientY;
        const rect = canvas.getBoundingClientRect();
        mouseX = e.clientX - rect.left;
        mouseY = e.clientY - rect.top;
    });

    window.addEventListener('pointermove', e => {
        const rect = canvas.getBoundingClientRect();
        mouseX = e.clientX - rect.left;
        mouseY = e.clientY - rect.top;

        if (isDragging) {
            const dx = e.clientX - lastMouseX;
            const dy = e.clientY - lastMouseY;
            angleY += dx * 0.006;
            angleX -= dy * 0.006;
            lastMouseX = e.clientX;
            lastMouseY = e.clientY;
        }
    });

    window.addEventListener('pointerup', () => {
        isDragging = false;
    });

    container.addEventListener('pointerleave', () => {
        mouseX = -9999;
        mouseY = -9999;
        hoveredNode = null;
    });

    animate();
})();