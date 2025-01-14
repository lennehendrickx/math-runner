import * as THREE from 'three';
import { Player } from './Player';
import { Block } from './Block';
import { ScoreManager } from './ScoreManager';

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

    constructor() {
        this.scene = new THREE.Scene();

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

        // Setup camera with new position and angle
        this.camera.position.set(0, 6, 8);
        this.camera.lookAt(0, 0, -20);

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
        const roadGeometry = new THREE.PlaneGeometry(8, 150);
        const roadMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x444444,
            side: THREE.DoubleSide 
        });
        const road = new THREE.Mesh(roadGeometry, roadMaterial);
        road.rotation.x = -Math.PI / 2;
        road.position.z = -50;
        this.scene.add(road);
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
                } else {
                    this.scoreManager.subtractPoints(5);
                    this.speedMultiplier = 0.7;
                    this.scoreManager.updateSpeed(0.7);
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

            // Check collision with block (game over or penalty)
            if (block.checkCollision(this.player)) {
                this.scoreManager.subtractPoints(5); // Penalty for hitting block
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

        // Create clouds
        const createCloud = () => {
            const cloud = new THREE.Group();
            const cloudMaterial = new THREE.MeshPhongMaterial({
                color: 0xffffff,
                emissive: 0x555555,
                emissiveIntensity: 0.1,
                transparent: true,
                opacity: 0.9
            });

            // Create several spheres for each cloud
            const sphereSizes = [
                { radius: 1, x: 0, y: 0, z: 0 },
                { radius: 0.8, x: 0.8, y: -0.2, z: 0 },
                { radius: 0.7, x: -0.8, y: -0.2, z: 0 },
                { radius: 0.7, x: 0.4, y: 0.2, z: 0.3 },
                { radius: 0.6, x: -0.4, y: 0.2, z: -0.3 }
            ];

            sphereSizes.forEach(({ radius, x, y, z }) => {
                const geometry = new THREE.SphereGeometry(radius, 16, 16);
                const sphere = new THREE.Mesh(geometry, cloudMaterial);
                sphere.position.set(x, y, z);
                cloud.add(sphere);
            });

            return cloud;
        };

        // Add multiple clouds at random positions
        for (let i = 0; i < 20; i++) {
            const cloud = createCloud();
            
            // Position cloud randomly in the sky
            const angle = Math.random() * Math.PI * 2;
            const radius = Math.random() * 200 + 100; // Distance from center
            const height = Math.random() * 100 + 50;  // Height above ground
            
            cloud.position.x = Math.cos(angle) * radius;
            cloud.position.y = height;
            cloud.position.z = Math.sin(angle) * radius;
            
            // Random rotation and scale for variety
            cloud.rotation.y = Math.random() * Math.PI;
            const scale = Math.random() * 2 + 1;
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

        // Create ground plane
        const groundGeometry = new THREE.PlaneGeometry(200, 200, 50, 50);
        const groundMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x90EE90,  // Light green
            side: THREE.DoubleSide,
            wireframe: true,
            transparent: true,
            opacity: 0.6
        });
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);

        // Create solid ground underneath
        const solidGroundGeometry = new THREE.PlaneGeometry(200, 200);
        const solidGroundMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x228B22,  // Forest green
            side: THREE.DoubleSide
        });
        const solidGround = new THREE.Mesh(solidGroundGeometry, solidGroundMaterial);

        // Position grounds
        ground.rotation.x = -Math.PI / 2;
        ground.position.y = -0.49;
        ground.position.z = -50;

        solidGround.rotation.x = -Math.PI / 2;
        solidGround.position.y = -0.5;
        solidGround.position.z = -50;

        this.scene.add(ground);
        this.scene.add(solidGround);

        // Add trees after creating the ground
        addTrees();

        // Add some fog for depth effect with adjusted values
        const fogColor = new THREE.Color('#87CEEB');  // Match sky color
        this.scene.fog = new THREE.Fog(fogColor, 50, 150);  // Start further away and fade more gradually
    }
} 