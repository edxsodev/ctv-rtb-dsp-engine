/**
 * Interactive 3D Connected TV Programmatic Bidding Network Scene
 * Built with Three.js (r128)
 */

class CTV3DScene {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        if (!this.container) return;

        this.width = this.container.clientWidth || 800;
        this.height = 420;

        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(45, this.width / this.height, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });

        this.renderer.setSize(this.width, this.height);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.container.appendChild(this.renderer.domElement);

        // Nodes & animation elements
        this.tvGroup = null;
        this.serverGroup = null;
        this.exchangeGroup = null;
        this.particles = [];
        this.isMouseInteracting = false;
        this.targetRotationY = 0;

        this.init();
    }

    init() {
        // Camera setup
        this.camera.position.set(0, 5, 22);
        this.camera.lookAt(0, 0, 0);

        // Lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
        this.scene.add(ambientLight);

        const dirLight1 = new THREE.DirectionalLight(0x2563eb, 1.2);
        dirLight1.position.set(10, 20, 15);
        this.scene.add(dirLight1);

        const dirLight2 = new THREE.DirectionalLight(0x7c3aed, 0.8);
        dirLight2.position.set(-10, -10, -10);
        this.scene.add(dirLight2);

        // Create 3D Nodes
        this.createSmartTVNode();
        this.createExchangeNode();
        this.createServerNode();

        // Create Connecting 3D Data Cables (Curves)
        this.createDataPipes();

        // Add Floating Background Grid Particles
        this.createBackgroundGrid();

        // Event listeners for mouse orbit
        this.setupInteractivity();

        // Start Animation Loop
        this.animate();
    }

    createSmartTVNode() {
        this.tvGroup = new THREE.Group();
        this.tvGroup.position.set(-7, 0, 0);

        // TV Outer Frame (Bezel)
        const frameGeo = new THREE.BoxGeometry(4.8, 3.0, 0.2);
        const frameMat = new THREE.MeshPhongMaterial({ color: 0x1e293b, shininess: 80 });
        const frame = new THREE.Mesh(frameGeo, frameMat);
        this.tvGroup.add(frame);

        // TV Screen (Glowing Display)
        const screenGeo = new THREE.PlaneGeometry(4.5, 2.7);
        const screenMat = new THREE.MeshBasicMaterial({ color: 0x3b82f6, transparent: true, opacity: 0.85 });
        const screen = new THREE.Mesh(screenGeo, screenMat);
        screen.position.z = 0.11;
        this.tvGroup.add(screen);

        // TV Stand Leg
        const standGeo = new THREE.CylinderGeometry(0.1, 0.4, 0.8, 16);
        const standMat = new THREE.MeshPhongMaterial({ color: 0x475569 });
        const stand = new THREE.Mesh(standGeo, standMat);
        stand.position.set(0, -1.8, 0);
        this.tvGroup.add(stand);

        // TV Label Ring
        const ringGeo = new THREE.RingGeometry(2.8, 2.9, 32);
        const ringMat = new THREE.MeshBasicMaterial({ color: 0x2563eb, side: THREE.DoubleSide });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.rotation.x = Math.PI / 2;
        ring.position.y = -1.9;
        this.tvGroup.add(ring);

        this.scene.add(this.tvGroup);
    }

    createExchangeNode() {
        this.exchangeGroup = new THREE.Group();
        this.exchangeGroup.position.set(0, 1.5, -2);

        // Central Exchange Core (Icosahedron Hub)
        const hubGeo = new THREE.IcosahedronGeometry(1.6, 1);
        const hubMat = new THREE.MeshStandardMaterial({ 
            color: 0x06b6d4, 
            wireframe: true, 
            emissive: 0x0284c7,
            emissiveIntensity: 0.5 
        });
        const hub = new THREE.Mesh(hubGeo, hubMat);
        this.exchangeGroup.add(hub);

        // Inner glowing core
        const coreGeo = new THREE.SphereGeometry(0.9, 16, 16);
        const coreMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
        const core = new THREE.Mesh(coreGeo, coreMat);
        this.exchangeGroup.add(core);

        this.scene.add(this.exchangeGroup);
    }

    createServerNode() {
        this.serverGroup = new THREE.Group();
        this.serverGroup.position.set(7, 0, 0);

        // Server Tower Stack
        for (let i = 0; i < 3; i++) {
            const blockGeo = new THREE.BoxGeometry(2.6, 0.9, 2.6);
            const blockMat = new THREE.MeshPhongMaterial({ color: 0x0f172a, shininess: 90 });
            const block = new THREE.Mesh(blockGeo, blockMat);
            block.position.y = (i * 1.1) - 1.0;
            this.serverGroup.add(block);

            // Server LED Lights
            const ledGeo = new THREE.BoxGeometry(2.4, 0.1, 0.1);
            const ledMat = new THREE.MeshBasicMaterial({ color: i === 1 ? 0x10b981 : 0x6366f1 });
            const led = new THREE.Mesh(ledGeo, ledMat);
            led.position.set(0, (i * 1.1) - 1.0, 1.31);
            this.serverGroup.add(led);
        }

        this.scene.add(this.serverGroup);
    }

    createDataPipes() {
        // Curve 1: TV to Exchange
        const curve1 = new THREE.CatmullRomCurve3([
            new THREE.Vector3(-5, 0, 0),
            new THREE.Vector3(-2.5, 1.5, -1),
            new THREE.Vector3(0, 1.5, -2)
        ]);

        // Curve 2: Exchange to Server
        const curve2 = new THREE.CatmullRomCurve3([
            new THREE.Vector3(0, 1.5, -2),
            new THREE.Vector3(3.5, 1.5, -1),
            new THREE.Vector3(5.5, 0, 0)
        ]);

        [curve1, curve2].forEach(curve => {
            const pipeGeo = new THREE.TubeGeometry(curve, 20, 0.08, 8, false);
            const pipeMat = new THREE.MeshBasicMaterial({ color: 0x94a3b8, transparent: true, opacity: 0.4 });
            const pipe = new THREE.Mesh(pipeGeo, pipeMat);
            this.scene.add(pipe);
        });

        this.curve1 = curve1;
        this.curve2 = curve2;

        // Create Animated Signal Packets
        for (let i = 0; i < 6; i++) {
            const pGeo = new THREE.SphereGeometry(0.22, 12, 12);
            const pMat = new THREE.MeshBasicMaterial({ color: i % 2 === 0 ? 0x38bdf8 : 0x10b981 });
            const pMesh = new THREE.Mesh(pGeo, pMat);
            this.scene.add(pMesh);
            this.particles.push({
                mesh: pMesh,
                progress: (i * 0.16) % 1,
                curve: i < 3 ? curve1 : curve2,
                dir: 1
            });
        }
    }

    createBackgroundGrid() {
        const gridGeo = new THREE.BufferGeometry();
        const count = 150;
        const positions = new Float32Array(count * 3);

        for (let i = 0; i < count * 3; i += 3) {
            positions[i] = (Math.random() - 0.5) * 40;
            positions[i + 1] = (Math.random() - 0.5) * 20;
            positions[i + 2] = (Math.random() - 0.5) * 30 - 5;
        }

        gridGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        const gridMat = new THREE.PointsMaterial({ color: 0xcbd5e1, size: 0.12, transparent: true, opacity: 0.6 });
        const points = new THREE.Points(gridGeo, gridMat);
        this.scene.add(points);
    }

    setupInteractivity() {
        let isDragging = false;
        let previousMouseX = 0;

        this.container.addEventListener('mousedown', (e) => {
            isDragging = true;
            previousMouseX = e.clientX;
        });

        window.addEventListener('mouseup', () => {
            isDragging = false;
        });

        window.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            const deltaX = e.clientX - previousMouseX;
            this.targetRotationY += deltaX * 0.005;
            previousMouseX = e.clientX;
        });
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        // Smooth camera rotation based on drag
        this.scene.rotation.y += (this.targetRotationY - this.scene.rotation.y) * 0.05;

        // Subtle idle rotation of nodes
        if (this.exchangeGroup) {
            this.exchangeGroup.rotation.y += 0.01;
            this.exchangeGroup.rotation.x += 0.005;
        }
        if (this.tvGroup) {
            this.tvGroup.rotation.y = Math.sin(Date.now() * 0.001) * 0.08;
        }

        // Animate particles along curves
        this.particles.forEach(p => {
            p.progress += 0.008;
            if (p.progress > 1) p.progress = 0;
            const point = p.curve.getPoint(p.progress);
            p.mesh.position.copy(point);
        });

        this.renderer.render(this.scene, this.camera);
    }

    triggerWinFlash() {
        // Flash TV screen green on auction win
        if (this.tvGroup) {
            const screen = this.tvGroup.children[1];
            if (screen && screen.material) {
                screen.material.color.setHex(0x10b981);
                setTimeout(() => {
                    screen.material.color.setHex(0x3b82f6);
                }, 600);
            }
        }
    }
}
