// Three.js setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({
    canvas: document.getElementById('canvas-background'),
    antialias: true,
    alpha: true
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0xD0D0D0, 0);

// Calabi-Yau manifold parameters
const n = 3; // dimension parameter
const m = 15; // mesh resolution
const scale = 220; // overall scale

// Animation parameter
let theta = Math.PI/4;

// Timing variables for consistent animation speed
let lastTime = null;
const THETA_SPEED = 0.12; // radians per second
const ROTATION_SPEED = 0.12; // radians per second

// Complex number operations
function complexMul(z1, z2) {
    return {
        re: z1.re * z2.re - z1.im * z2.im,
        im: z1.re * z2.im + z1.im * z2.re
    };
}

function complexPow(z, power) {
    const r = Math.sqrt(z.re * z.re + z.im * z.im);
    const theta = Math.atan2(z.im, z.re);
    const rPow = Math.pow(r, power);
    return {
        re: rPow * Math.cos(power * theta),
        im: rPow * Math.sin(power * theta)
    };
}

function complexExp(z) {
    const expReal = Math.exp(z.re);
    return {
        re: expReal * Math.cos(z.im),
        im: expReal * Math.sin(z.im)
    };
}

function complexCos(z) {
    return {
        re: Math.cos(z.re) * Math.cosh(z.im),
        im: -Math.sin(z.re) * Math.sinh(z.im)
    };
}

function complexSin(z) {
    return {
        re: Math.sin(z.re) * Math.cosh(z.im),
        im: Math.cos(z.re) * Math.sinh(z.im)
    };
}

function complexCosh(z) {
    return {
        re: Math.cosh(z.re) * Math.cos(z.im),
        im: Math.sinh(z.re) * Math.sin(z.im)
    };
}

function complexSinh(z) {
    return {
        re: Math.sinh(z.re) * Math.cos(z.im),
        im: Math.cosh(z.re) * Math.sin(z.im)
    };
}

// Calabi-Yau surface function
function calabiYauSurface(x, y, k1, k2, theta) {
    const z = { re: x, im: y };
    
    // exp(i*2π*k1/n) * cos(z)^(2/n)
    const phase1 = { re: 0, im: 2 * Math.PI * k1 / n };
    const exp1 = complexExp(phase1);
    const cosZ = complexCosh(z);
    const cosPow = complexPow(cosZ, 2/n);
    const z1 = complexMul(exp1, cosPow);
    
    // exp(i*2π*k2/n) * sin(z)^(2/n)
    const phase2 = { re: 0, im: 2 * Math.PI * k2 / n };
    const exp2 = complexExp(phase2);
    const sinZ = complexSinh(z);
    const sinPow = complexPow(sinZ, 2/n);
    const z2 = complexMul(exp2, sinPow);
    
    return {
        x: z1.re * scale,
        y: z2.re * scale,
        z1_im: z1.im * scale * 0.9,
        z2_im: z2.im * scale * 0.9
    };
}

// Create wireframe geometry for Calabi-Yau
const group = new THREE.Group();
const meshData = [];

// Pre-calculate grid coordinates (these don't change)
const gridCoords = [];
for (let i = 0; i <= m; i++) {
    for (let j = 0; j <= m; j++) {
        gridCoords.push({
            x: -1.1 + 2.2 * (j / m),
            y: (Math.PI / 2) * (i / m)
        });
    }
}

// Initial geometry setup (only done once)
function initializeManifold() {
    for (let k1 = 0; k1 < n; k1++) {
        for (let k2 = 0; k2 < n; k2++) {
            const geometry = new THREE.BufferGeometry();
            const vertices = new Float32Array((m + 1) * (m + 1) * 3);
            const indices = [];
            
            // Create wireframe lines indices (only done once)
            for (let i = 0; i < m; i++) {
                for (let j = 0; j < m; j++) {
                    const a = i * (m + 1) + j;
                    const b = i * (m + 1) + j + 1;
                    const c = (i + 1) * (m + 1) + j;
                    const d = (i + 1) * (m + 1) + j + 1;
                    
                    indices.push(a, b);
                    indices.push(a, c);
                    if (i === m - 1) indices.push(c, d);
                    if (j === m - 1) indices.push(b, d);
                }
            }
            
            geometry.setIndex(indices);
            const positionAttribute = new THREE.BufferAttribute(vertices, 3);
            positionAttribute.setUsage(THREE.DynamicDrawUsage); // Hint that we'll update this
            geometry.setAttribute('position', positionAttribute);
            
            const opacityValue = 0.2 + 0.2 * (k1 + k2) / (2 * n);
            const material = new THREE.LineBasicMaterial({
                color: 0xD0D0D0,
                opacity: opacityValue,
                transparent: true,
                depthWrite: false,
                depthTest: true
            });
            
            const wireframe = new THREE.LineSegments(geometry, material);
            group.add(wireframe);
            
            // Store references for updates
            meshData.push({
                geometry,
                vertices,
                k1,
                k2
            });
        }
    }
}

// Update only vertex positions (much faster)
function updateManifold(theta) {
    for (const data of meshData) {
        const { geometry, vertices, k1, k2 } = data;
        
        let idx = 0;
        for (const coord of gridCoords) {
            const point = calabiYauSurface(coord.x, coord.y, k1, k2, theta);
            const z = point.z1_im * Math.cos(theta) + point.z2_im * Math.sin(theta);
            
            vertices[idx++] = point.x;
            vertices[idx++] = point.y;
            vertices[idx++] = z;
        }
        
        geometry.attributes.position.needsUpdate = true;
    }
}

// Initial generation
initializeManifold();
updateManifold(theta);
scene.add(group);
camera.position.z = 400;
group.rotation.x = Math.PI * 3/4;
group.rotation.y = Math.PI / 2;

// Animation
function animate(currentTime) {
    requestAnimationFrame(animate);
    
    // Initialize lastTime on first frame
    if (lastTime === null) {
        lastTime = currentTime;
        renderer.render(scene, camera);
        return;
    }
    
    // Calculate delta time in seconds, clamped to prevent huge jumps
    const deltaTime = Math.min((currentTime - lastTime) / 1000, 0.1);
    lastTime = currentTime;
    
    // Animate theta with time-based speed
    theta += THETA_SPEED * deltaTime;
    
    // Update only vertex positions (not recreating geometry)
    updateManifold(theta);

    const speed = 1.0;
    // Slow rotation with time-based speed
    group.rotation.x += ROTATION_SPEED * speed * deltaTime;
    group.rotation.y += ROTATION_SPEED * speed * deltaTime;
    
    renderer.render(scene, camera);
}

// Start animation
requestAnimationFrame(animate);

// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Smooth scroll
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
        }
    });
});
