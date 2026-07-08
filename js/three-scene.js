// ============================================
// LMAJHOL — Three.js 3D Scene with GLB Models
// ============================================

class LMAJHOLScene {
    constructor() {
        this.scenes = [];
        this.mouse = { x: 0, y: 0 };
        this.clock = new THREE.Clock();
        this.maskModel = null;
        this.tshirtModel = null;
        this.gltfLoaded = false;
        this.init();
    }

    init() {
        this.setupHeroScene();
        this.setupShowcaseScene();
        this.setupEventListeners();
        this.animate();
        this.loadGLTFLoader();
    }

    loadGLTFLoader() {
        // Load GLTFLoader dynamically
        const script = document.createElement('script');
        script.type = 'module';
        script.innerHTML = `
            import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@0.128.0/examples/jsm/loaders/GLTFLoader.js';
            window.GLTFLoader = GLTFLoader;
            window.dispatchEvent(new Event('gltf-loaded'));
        `;
        document.head.appendChild(script);
        
        window.addEventListener('gltf-loaded', () => {
            this.gltfLoaded = true;
            this.loadModels();
        });
    }

    async loadModels() {
        if (!window.GLTFLoader) {
            console.warn('GLTFLoader not available');
            return;
        }

        const loader = new window.GLTFLoader();

        // Load mask model for hero
        try {
            const maskGltf = await new Promise((resolve, reject) => {
                loader.load('models/mask.glb', resolve, 
                    (progress) => console.log('Mask loading:', Math.round(progress.loaded / progress.total * 100) + '%'), 
                    reject
                );
            });
            
            this.maskModel = maskGltf.scene;
            
            // Auto-center and scale
            const box = new THREE.Box3().setFromObject(this.maskModel);
            const center = box.getCenter(new THREE.Vector3());
            const size = box.getSize(new THREE.Vector3());
            const maxDim = Math.max(size.x, size.y, size.z);
            const scale = 3 / maxDim;
            
            this.maskModel.scale.set(scale, scale, scale);
            this.maskModel.position.sub(center.multiplyScalar(scale));
            
            // Apply white material
            this.maskModel.traverse((child) => {
                if (child.isMesh) {
                    child.material = new THREE.MeshPhysicalMaterial({
                        color: 0xfafafa,
                        roughness: 0.4,
                        metalness: 0.1,
                        clearcoat: 0.3,
                        clearcoatRoughness: 0.4
                    });
                    child.castShadow = true;
                    child.receiveShadow = true;
                }
            });

            if (this.scenes[0]) {
                this.scenes[0].scene.remove(this.heroTShirt);
                this.scenes[0].scene.add(this.maskModel);
            }
            console.log('Mask model loaded successfully');
        } catch (e) {
            console.warn('Could not load mask model:', e);
        }

        // Load t-shirt model for showcase
        try {
            const tshirtGltf = await new Promise((resolve, reject) => {
                loader.load('models/tshirt.glb', resolve, 
                    (progress) => console.log('T-shirt loading:', Math.round(progress.loaded / progress.total * 100) + '%'), 
                    reject
                );
            });
            
            this.tshirtModel = tshirtGltf.scene;
            
            // Auto-center and scale
            const box = new THREE.Box3().setFromObject(this.tshirtModel);
            const center = box.getCenter(new THREE.Vector3());
            const size = box.getSize(new THREE.Vector3());
            const maxDim = Math.max(size.x, size.y, size.z);
            const scale = 3 / maxDim;
            
            this.tshirtModel.scale.set(scale, scale, scale);
            this.tshirtModel.position.sub(center.multiplyScalar(scale));
            this.tshirtModel.position.x = 2;
            
            // Apply black material
            this.tshirtModel.traverse((child) => {
                if (child.isMesh) {
                    child.material = new THREE.MeshPhysicalMaterial({
                        color: 0x0a0a0a,
                        roughness: 0.6,
                        metalness: 0.05,
                        clearcoat: 0.2,
                        clearcoatRoughness: 0.6
                    });
                    child.castShadow = true;
                    child.receiveShadow = true;
                }
            });

            if (this.scenes[1]) {
                this.scenes[1].scene.remove(this.showcaseTShirt);
                this.scenes[1].scene.add(this.tshirtModel);
            }
            console.log('T-shirt model loaded successfully');
        } catch (e) {
            console.warn('Could not load t-shirt model:', e);
        }
    }

    setupHeroScene() {
        const canvas = document.getElementById('heroCanvas');
        if (!canvas) return;

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
        
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.2;
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        camera.position.z = 5;

        // Lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        scene.add(ambientLight);

        const mainLight = new THREE.DirectionalLight(0xffffff, 1);
        mainLight.position.set(5, 5, 5);
        mainLight.castShadow = true;
        mainLight.shadow.mapSize.width = 2048;
        mainLight.shadow.mapSize.height = 2048;
        scene.add(mainLight);

        const fillLight = new THREE.DirectionalLight(0xc9a96e, 0.3);
        fillLight.position.set(-5, 0, -5);
        scene.add(fillLight);

        const rimLight = new THREE.DirectionalLight(0x8888ff, 0.2);
        rimLight.position.set(0, 5, -5);
        scene.add(rimLight);

        // Create placeholder (will be replaced by GLB)
        this.createHeroPlaceholder(scene);
        
        // Particles
        this.createParticles(scene, 800);
        
        // Floating shapes
        this.createFloatingShapes(scene);

        this.scenes.push({ scene, camera, renderer, type: 'hero' });
    }

    createHeroPlaceholder(scene) {
        const bodyGeo = new THREE.SphereGeometry(1.5, 32, 32);
        const bodyMat = new THREE.MeshPhysicalMaterial({
            color: 0xfafafa,
            roughness: 0.4,
            metalness: 0.1,
            clearcoat: 0.3
        });
        this.heroTShirt = new THREE.Mesh(bodyGeo, bodyMat);
        scene.add(this.heroTShirt);
    }

    createParticles(scene, count) {
        const geo = new THREE.BufferGeometry();
        const positions = new Float32Array(count * 3);

        for (let i = 0; i < count; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 25;
            positions[i * 3 + 1] = (Math.random() - 0.5) * 25;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 25;
        }

        geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

        const mat = new THREE.PointsMaterial({
            color: 0xc9a96e,
            size: 0.03,
            transparent: true,
            opacity: 0.6,
            blending: THREE.AdditiveBlending
        });

        this.particles = new THREE.Points(geo, mat);
        scene.add(this.particles);
    }

    createFloatingShapes(scene) {
        this.floatingShapes = [];
        const shapes = [
            { geo: new THREE.IcosahedronGeometry(0.3, 0), pos: [-3, 2, -2] },
            { geo: new THREE.OctahedronGeometry(0.25), pos: [3, -1, -3] },
            { geo: new THREE.TetrahedronGeometry(0.2), pos: [-2, -2, -1] },
            { geo: new THREE.TorusGeometry(0.2, 0.05, 8, 32), pos: [2, 3, -2] },
            { geo: new THREE.DodecahedronGeometry(0.2), pos: [4, 1, -4] }
        ];

        shapes.forEach((s, i) => {
            const mat = new THREE.MeshPhysicalMaterial({
                color: i % 2 === 0 ? 0xfafafa : 0xc9a96e,
                roughness: 0.3,
                metalness: 0.2,
                transparent: true,
                opacity: 0.5
            });
            const mesh = new THREE.Mesh(s.geo, mat);
            mesh.position.set(...s.pos);
            mesh.userData = {
                originalPos: [...s.pos],
                speed: Math.random() * 0.5 + 0.5,
                rotSpeed: Math.random() * 0.02 + 0.01
            };
            scene.add(mesh);
            this.floatingShapes.push(mesh);
        });
    }

    setupShowcaseScene() {
        const canvas = document.getElementById('showcaseCanvas');
        if (!canvas) return;

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
        
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.0;
        renderer.shadowMap.enabled = true;

        camera.position.set(0, 0, 6);

        // Lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
        scene.add(ambientLight);

        const keyLight = new THREE.DirectionalLight(0xffffff, 1.2);
        keyLight.position.set(3, 3, 5);
        keyLight.castShadow = true;
        scene.add(keyLight);

        const rimLight = new THREE.DirectionalLight(0xc9a96e, 0.5);
        rimLight.position.set(-3, 2, -3);
        scene.add(rimLight);

        // Create placeholder (will be replaced by GLB)
        this.createShowcasePlaceholder(scene);
        
        // Grid background
        this.createGridBackground(scene);

        this.scenes.push({ scene, camera, renderer, type: 'showcase' });
    }

    createShowcasePlaceholder(scene) {
        const group = new THREE.Group();
        const bodyGeo = new THREE.SphereGeometry(1.8, 32, 32);
        const bodyMat = new THREE.MeshPhysicalMaterial({
            color: 0x0a0a0a,
            roughness: 0.6,
            metalness: 0.05,
            clearcoat: 0.2
        });
        const body = new THREE.Mesh(bodyGeo, bodyMat);
        group.add(body);

        group.position.x = 2;
        scene.add(group);
        this.showcaseTShirt = group;
    }

    createGridBackground(scene) {
        const gridGeo = new THREE.PlaneGeometry(30, 30, 30, 30);
        const gridMat = new THREE.MeshBasicMaterial({
            color: 0x333333,
            wireframe: true,
            transparent: true,
            opacity: 0.1
        });
        const grid = new THREE.Mesh(gridGeo, gridMat);
        grid.position.z = -5;
        scene.add(grid);
    }

    setupEventListeners() {
        window.addEventListener('resize', () => this.onResize());
        window.addEventListener('mousemove', (e) => {
            this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
            this.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
        });

        if (typeof ScrollTrigger !== 'undefined') {
            gsap.registerPlugin(ScrollTrigger);

            // Hero model parallax
            ScrollTrigger.create({
                trigger: '#hero',
                start: 'top top',
                end: 'bottom top',
                onUpdate: (self) => {
                    const model = this.maskModel || this.heroTShirt;
                    if (model) {
                        model.rotation.x = self.progress * 0.5;
                        model.rotation.y = self.progress * Math.PI;
                        model.position.y = -self.progress * 2;
                    }
                }
            });

            // Showcase model rotation on scroll
            ScrollTrigger.create({
                trigger: '#showcase',
                start: 'top bottom',
                end: 'bottom top',
                onUpdate: (self) => {
                    const model = this.tshirtModel || this.showcaseTShirt;
                    if (model) {
                        model.rotation.y = self.progress * Math.PI * 2;
                        model.rotation.x = Math.sin(self.progress * Math.PI) * 0.3;
                    }
                }
            });
        }
    }

    onResize() {
        this.scenes.forEach(({ camera, renderer }) => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        });
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        const time = this.clock.getElapsedTime();

        // Animate hero model
        const heroModel = this.maskModel || this.heroTShirt;
        if (heroModel) {
            heroModel.position.y = Math.sin(time * 0.8) * 0.15;
            heroModel.rotation.y += 0.003;
        }

        // Particles
        if (this.particles) {
            this.particles.rotation.y += 0.0005;
            this.particles.rotation.x += 0.0002;
        }

        // Floating shapes
        if (this.floatingShapes) {
            this.floatingShapes.forEach((shape, i) => {
                const { originalPos, speed, rotSpeed } = shape.userData;
                shape.position.y = originalPos[1] + Math.sin(time * speed + i) * 0.3;
                shape.position.x = originalPos[0] + Math.cos(time * speed * 0.5 + i) * 0.2;
                shape.rotation.x += rotSpeed;
                shape.rotation.y += rotSpeed * 0.7;
            });
        }

        // Mouse parallax on hero camera
        if (this.scenes[0]) {
            const cam = this.scenes[0].camera;
            cam.position.x += (this.mouse.x * 0.3 - cam.position.x) * 0.05;
            cam.position.y += (this.mouse.y * 0.3 - cam.position.y) * 0.05;
            cam.lookAt(0, 0, 0);
        }

        // Render all scenes
        this.scenes.forEach(({ scene, camera, renderer }) => renderer.render(scene, camera));
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        try {
            window.lmajholScene = new LMAJHOLScene();
        } catch (e) {
            console.warn('3D scene error:', e);
        }
    }, 100);
});
