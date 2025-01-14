import * as THREE from 'three';
import { Player } from './Player';
import { Block } from './Block';
import { ScoreManager } from './ScoreManager';
import { RainEffect } from './RainEffect';
import { SunEffect } from './SunEffect';
import { FlowerEffect } from './FlowerEffect';

export class Game {
    private scene: THREE.Scene;
    private camera: THREE.PerspectiveCamera;
    private renderer: THREE.WebGLRenderer;
    private player: Player;
    private blocks: Block[];
    private scoreManager: ScoreManager;
    private lastBlockSpawnTime: number;
    private readonly SPAWN_INTERVAL = 7000; // Changed from 5000 to 7000 (7 seconds between blocks)
    private speedMultiplier: number = 1; // Add speed multiplier
    private rainEffect: RainEffect;
    private sunEffect: SunEffect;
    private flowerEffect: FlowerEffect;

    constructor() {
        this.scene = new THREE.Scene();
        this.rainEffect = new RainEffect(this.scene);
        this.sunEffect = new SunEffect(this.scene);
        this.flowerEffect = new FlowerEffect(this.scene);

        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            2000
        );
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.blocks = [];
        this.lastBlockSpawnTime = 0;
        this.scoreManager = new ScoreManager();
    }

    private generateQuestion(): { num1: number; num2: number } {
        return {
            num1: Math.floor(Math.random() * 9) + 1,
            num2: Math.floor(Math.random() * 9) + 1
        };
    }

    private spawnBlock(): void {
        const { num1, num2 } = this.generateQuestion();
        const block = new Block(num1, num2);
        this.blocks.push(block);
        this.scene.add(block.getMesh());
    }

    init(): void {
        // Setup renderer
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(this.renderer.domElement);

        // Adjust camera position and angle - slightly higher
        this.camera.position.set(0, 4, 8);      // Raised from 3 to 4
        this.camera.lookAt(0, -2, -15);         // Keep same look target

        // Create background first (so it's behind everything)
        this.createBackground();

        // Create road
        this.createRoad();

        // Create player
        this.player = new Player();
        this.scene.add(this.player.getMesh());

        // Setup lights
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
        directionalLight.position.set(0, 10, 5);
        this.scene.add(ambientLight);
        this.scene.add(directionalLight);

        // Setup event listeners
        window.addEventListener('keydown', this.handleKeyDown.bind(this));
        window.addEventListener('resize', this.handleResize.bind(this));
    }

    private createRoad(): void {
        // Create main road - even longer
        const roadGeometry = new THREE.PlaneGeometry(8, 800);  // Much longer road
        const roadMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x444444,
            side: THREE.DoubleSide 
        });
        const road = new THREE.Mesh(roadGeometry, roadMaterial);
        road.rotation.x = -Math.PI / 2;
        road.position.y = 0;
        road.position.z = -300;  // Move further back to center the longer road
        this.scene.add(road);

        // Create road stripes - more of them
        const stripeLength = 5;
        const stripeGap = 5;
        const numStripes = 80;  // More stripes to cover the longer road
        const stripeWidth = 0.3;

        // Create stripes
        for (let i = 0; i < numStripes; i++) {
            const stripeGeometry = new THREE.PlaneGeometry(stripeWidth, stripeLength);
            const stripeMaterial = new THREE.MeshBasicMaterial({
                color: 0xFFFFFF,
                side: THREE.DoubleSide
            });
            const stripe = new THREE.Mesh(stripeGeometry, stripeMaterial);
            
            // Position stripe
            stripe.rotation.x = -Math.PI / 2;
            stripe.position.y = 0.01;
            stripe.position.z = 15 - i * (stripeLength + stripeGap);  // Start closer and extend further
            
            this.scene.add(stripe);
        }
    }

    private handleKeyDown(event: KeyboardEvent): void {
        this.player.handleInput(event.key);
    }

    private handleResize(): void {
        const width = window.innerWidth;
        const height = window.innerHeight;
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
    }

    private updateBlocks(deltaTime: number): void {
        for (let i = this.blocks.length - 1; i >= 0; i--) {
            const block = this.blocks[i];
            block.update(deltaTime * this.speedMultiplier);

            const scoringResult = block.checkScoring(this.player);
            if (scoringResult !== 'none') {
                if (scoringResult === 'correct') {
                    this.scoreManager.addPoints(10);
                    this.speedMultiplier = 1;
                    this.scoreManager.updateSpeed(1);
                    this.rainEffect.stopRain();
                    this.sunEffect.startShining();
                    this.flowerEffect.spawnFlowers();
                } else {
                    this.scoreManager.subtractPoints(5);
                    this.speedMultiplier = 0.7;
                    this.scoreManager.updateSpeed(0.7);
                    this.rainEffect.startRain();
                    this.sunEffect.stopShining();
                    
                    setTimeout(() => {
                        this.speedMultiplier = 0.85;
                        this.scoreManager.updateSpeed(0.85);
                        setTimeout(() => {
                            this.speedMultiplier = 1;
                            this.scoreManager.updateSpeed(1);
                        }, 3000);
                    }, 3000);
                }
                
                // Remove block after animation
                setTimeout(() => {
                    this.scene.remove(block.getMesh());
                    this.blocks.splice(i, 1);
                }, 500);
                
                continue;
            }

            // Check collision with block
            if (block.checkCollision(this.player)) {
                this.scoreManager.subtractPoints(5);
                // Start rain on collision
                this.rainEffect.startRain();
                this.scene.remove(block.getMesh());
                this.blocks.splice(i, 1);
                continue;
            }

            // Remove blocks that are behind the player
            if (block.getPosition().z > 5) {
                this.scene.remove(block.getMesh());
                this.blocks.splice(i, 1);
            }
        }
    }

    private handleCollision(block: Block): void {
        const playerPosition = this.player.getPosition();
        const isCorrectSide = block.isCorrectSide(playerPosition.x > 0);
        
        if (isCorrectSide) {
            this.scoreManager.addPoints(10);
        } else {
            this.scoreManager.subtractPoints(5);
        }
    }

    animate(): void {
        const animate = (currentTime: number) => {
            requestAnimationFrame(animate);

            // Spawn new blocks
            if (currentTime - this.lastBlockSpawnTime > this.SPAWN_INTERVAL) {
                this.spawnBlock();
                this.lastBlockSpawnTime = currentTime;
            }

            // Update game objects
            const deltaTime = 1/60;
            this.updateBlocks(deltaTime);
            this.player.update(deltaTime);

            // Update rain effect
            this.rainEffect.update();
            this.sunEffect.update();
            this.flowerEffect.update();

            this.renderer.render(this.scene, this.camera);
        };

        animate(0);
    }

    private createBackground(): void {
        // Create sky dome with simpler setup
        const skyGeometry = new THREE.SphereGeometry(500, 32, 32);
        const skyMaterial = new THREE.MeshBasicMaterial({
            color: new THREE.Color('#87CEEB'),  // Sky blue
            side: THREE.BackSide,
            fog: false
        });
        
        const sky = new THREE.Mesh(skyGeometry, skyMaterial);
        sky.position.y = 0;
        this.scene.add(sky);

        // Enhanced cloud creation with bigger, more visible clouds
        const createCloud = () => {
            const cloud = new THREE.Group();
            const cloudMaterial = new THREE.MeshPhongMaterial({
                color: 0xffffff,
                emissive: 0x888888,        // Brighter emissive
                emissiveIntensity: 0.2,    // Increased intensity
                transparent: true,
                opacity: 0.9               // More opaque
            });

            // Bigger, more varied cloud shapes
            const sphereSizes = [
                { radius: 2.0, x: 0, y: 0, z: 0 },      // Increased base size
                { radius: 1.8, x: 2, y: -0.2, z: 0.3 },
                { radius: 1.6, x: -2, y: -0.1, z: -0.2 },
                { radius: 1.7, x: 1, y: 0.2, z: 0.5 },
                { radius: 1.5, x: -1.2, y: 0.3, z: -0.4 },
                { radius: 1.4, x: 1.4, y: -0.3, z: -0.3 },
                { radius: 1.3, x: -1.6, y: 0.1, z: 0.4 },
                { radius: 1.5, x: 0, y: 0.5, z: -0.8 }  // Added extra sphere
            ];

            sphereSizes.forEach(({ radius, x, y, z }) => {
                const geometry = new THREE.SphereGeometry(radius, 16, 16);
                const sphere = new THREE.Mesh(geometry, cloudMaterial);
                sphere.position.set(x, y, z);
                cloud.add(sphere);
            });

            return cloud;
        };

        // Add more clouds with varied placement
        for (let i = 0; i < 60; i++) {  // Increased from 40 to 60 clouds
            const cloud = createCloud();
            
            // More varied cloud placement
            const angle = Math.random() * Math.PI * 2;
            const radius = Math.random() * 200 + 50;    // Reduced radius range for more visible clouds
            const height = Math.random() * 80 + 60;     // Higher minimum height
            
            cloud.position.x = Math.cos(angle) * radius;
            cloud.position.y = height;
            cloud.position.z = Math.sin(angle) * radius;
            
            // More varied rotation and scaling
            cloud.rotation.y = Math.random() * Math.PI * 2;
            cloud.rotation.z = Math.random() * 0.2 - 0.1;
            const scale = Math.random() * 3 + 1.5;      // Increased scale range
            cloud.scale.set(scale, scale * 0.6, scale);
            
            this.scene.add(cloud);
        }

        // Create a tree function
        const createTree = () => {
            const tree = new THREE.Group();

            // Create trunk
            const trunkGeometry = new THREE.CylinderGeometry(0.3, 0.5, 2, 8);
            const trunkMaterial = new THREE.MeshPhongMaterial({
                color: 0x8B4513,  // Saddle brown
                shininess: 5
            });
            const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
            trunk.position.y = 1;

            // Create foliage (multiple layers of cones)
            const foliageMaterial = new THREE.MeshPhongMaterial({
                color: 0x228B22,  // Forest green
                shininess: 10
            });

            const foliageLayers = [
                { radius: 2, height: 3, y: 2.5 },
                { radius: 1.6, height: 2.4, y: 3.5 },
                { radius: 1.2, height: 1.8, y: 4.3 }
            ];

            foliageLayers.forEach(({ radius, height, y }) => {
                const foliageGeometry = new THREE.ConeGeometry(radius, height, 8);
                const foliage = new THREE.Mesh(foliageGeometry, foliageMaterial);
                foliage.position.y = y;
                tree.add(foliage);
            });

            tree.add(trunk);
            return tree;
        };

        // Add type definition for tree positions
        interface TreePosition {
            x: number;
            z: number;
        }

        // Add trees around the road
        const addTrees = () => {
            const treePositions: TreePosition[] = [];
            const numTrees = 100;

            for (let i = 0; i < numTrees; i++) {
                // Generate random position
                const angle = Math.random() * Math.PI * 2;
                const radiusFromCenter = Math.random() * 80 + 20; // Between 20 and 100 units from center
                const x = Math.cos(angle) * radiusFromCenter;
                const z = Math.sin(angle) * radiusFromCenter - 50; // Offset by road position

                // Don't place trees too close to the road
                if (Math.abs(x) < 6) continue;  // Skip positions too close to road

                // Check distance from other trees
                const tooClose = treePositions.some(pos => {
                    const dx = pos.x - x;
                    const dz = pos.z - z;
                    return Math.sqrt(dx * dx + dz * dz) < 8;  // Minimum distance between trees
                });

                if (!tooClose) {
                    const tree = createTree();
                    tree.position.set(x, 0, z);
                    
                    tree.rotation.y = Math.random() * Math.PI * 2;
                    const scale = Math.random() * 0.4 + 0.8;
                    tree.scale.set(scale, scale, scale);
                    
                    this.scene.add(tree);
                    treePositions.push({ x, z });
                }
            }
        };

        // Create solid ground
        const solidGroundGeometry = new THREE.PlaneGeometry(200, 200);
        const solidGroundMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x228B22,  // Forest green
            side: THREE.DoubleSide
        });
        const solidGround = new THREE.Mesh(solidGroundGeometry, solidGroundMaterial);
        solidGround.rotation.x = -Math.PI / 2;
        solidGround.position.y = -0.5;
        solidGround.position.z = -50;
        this.scene.add(solidGround);

        // Add grass sprites
        this.addGrassToScene();

        // Add trees after creating the ground
        addTrees();

        // Add some fog for depth effect
        const fogColor = new THREE.Color('#87CEEB');
        this.scene.fog = new THREE.Fog(fogColor, 50, 150);
    }

    private createGrassSprite(): THREE.Sprite {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = 64;
        canvas.height = 64;

        if (context) {
            // Draw a simple grass blade
            context.fillStyle = '#90EE90';  // Light green
            context.strokeStyle = '#228B22'; // Forest green
            context.lineWidth = 1;

            // Draw three blades of grass
            for (let i = 0; i < 3; i++) {
                const x = 20 + i * 12;
                context.beginPath();
                context.moveTo(x, 64);
                context.quadraticCurveTo(
                    x + (Math.random() * 10 - 5),
                    40,
                    x + (Math.random() * 16 - 8),
                    10
                );
                context.stroke();
                context.fill();
            }
        }

        const texture = new THREE.Texture(canvas);
        texture.needsUpdate = true;
        const material = new THREE.SpriteMaterial({
            map: texture,
            transparent: true,
            depthWrite: false
        });

        return new THREE.Sprite(material);
    }

    private addGrassToScene(): void {
        // Add grass sprites around the scene
        for (let i = 0; i < 1000; i++) {
            const grass = this.createGrassSprite();
            
            // Random position within bounds
            const angle = Math.random() * Math.PI * 2;
            const radius = Math.random() * 90 + 10; // Between 10 and 100 units from center
            const x = Math.cos(angle) * radius;
            const z = Math.sin(angle) * radius - 50;

            // Don't place grass too close to the road
            if (Math.abs(x) < 5) continue;

            grass.position.set(x, -0.3, z);
            
            // Random scale and rotation for variety
            const scale = Math.random() * 0.3 + 0.2;
            grass.scale.set(scale, scale * 1.5, 1);
            grass.material.rotation = Math.random() * 0.2 - 0.1;

            this.scene.add(grass);
        }
    }
} 