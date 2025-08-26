// Three.js setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ 
    canvas: document.getElementById('canvas-background'),
    antialias: true, 
    alpha: true 
});

renderer.setSize(window.innerWidth, window.innerHeight);
/*renderer.setClearColor(0x000000, 0);*/
renderer.setClearColor(0xD0D0D0, 0);

// Calabi-Yau manifold parameters
const n = 5; // dimension parameter
const m = 36; // mesh resolution
const scale = 210; // overall scale

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

// Calabi-Yau surface function
function calabiYauSurface(x, y, k1, k2) {
    const z = { re: x, im: y };
    
    // exp(i*2π*k1/n) * cos(z)^(2/n)
    const phase1 = { re: 0, im: 2 * Math.PI * k1 / n };
    const exp1 = complexExp(phase1);
    const cosZ = complexCos(z);
    const cosPow = complexPow(cosZ, 2/n);
    const z1 = complexMul(exp1, cosPow);
    
    // exp(i*2π*k2/n) * sin(z)^(2/n)
    const phase2 = { re: 0, im: 2 * Math.PI * k2 / n };
    const exp2 = complexExp(phase2);
    const sinZ = complexSin(z);
    const sinPow = complexPow(sinZ, 2/n);
    const z2 = complexMul(exp2, sinPow);
    
    return new THREE.Vector3(
        z1.re * scale,
        z2.re * scale,
        (z1.im + z2.im) * Math.sqrt(2) / 2 * scale
    );

/*    return new THREE.Vector3(
        (-z1.re - z2.re) * scale,
        (-z1.im - z2.im) * scale * 0.8,
        (z1.re - z2.re) * scale
    ); */
}

// Create wireframe geometry for Calabi-Yau
const group = new THREE.Group();

// Generate patches for different k1, k2 values
for (let k1 = 0; k1 < n; k1++) {
    for (let k2 = 0; k2 < n; k2++) {
        const geometry = new THREE.BufferGeometry();
        const vertices = [];
        const indices = [];
        
        // Create grid of vertices
        for (let i = 0; i <= m; i++) {
            for (let j = 0; j <= m; j++) {
                const x = (Math.PI / 2) * (i / m);
                /*const y = - 1.1 + 2.2 * (j / m);*/
                const y = - Math.PI / 4 + (Math.PI / 2) * (j / m);
                
                const point = calabiYauSurface(x, y, k1, k2);
                vertices.push(point.x, point.y, point.z);
            }
        }
 

        // Create wireframe lines
        for (let i = 0; i < m; i++) {
            for (let j = 0; j < m; j++) {
                const a = i * (m + 1) + j;
                const b = i * (m + 1) + j + 1;
                const c = (i + 1) * (m + 1) + j;
                const d = (i + 1) * (m + 1) + j + 1;
                
                // Horizontal lines
                indices.push(a, b);
                // Vertical lines
                indices.push(a, c);
                // Last row/column
                if (i === m - 1) indices.push(c, d);
                if (j === m - 1) indices.push(b, d);
            }
        }
        
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
        geometry.setIndex(indices);
        
        const material = new THREE.LineBasicMaterial({ 
            color: 0xffffff,
            opacity: 0.1 + 0.8*(k1 + k2) / (2 * n), // Vary opacity for depth
            transparent: true
        });
        
        const wireframe = new THREE.LineSegments(geometry, material);
        group.add(wireframe);
    }
}

scene.add(group);
camera.position.z = 500;

// Animation
function animate() {
    requestAnimationFrame(animate);
    
    // Slow rotation
    group.rotation.x += 0.00053;
    group.rotation.y += 0.00061;
    group.rotation.z += 0.00041;
    
    renderer.render(scene, camera);
}

animate();

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
