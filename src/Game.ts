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
        this.scene.background = new THREE.Color('#FF69B4'); // Hot pink background

        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
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
        // Create a large ground plane
        const groundGeometry = new THREE.PlaneGeometry(200, 200, 50, 50);  // Added segments for grid
        const groundMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x90EE90,  // Light green
            side: THREE.DoubleSide,
            wireframe: true,   // Show grid pattern
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

        // Position both grounds
        ground.rotation.x = -Math.PI / 2;
        ground.position.y = -0.49;  // Slightly above solid ground
        ground.position.z = -50;

        solidGround.rotation.x = -Math.PI / 2;
        solidGround.position.y = -0.5;
        solidGround.position.z = -50;

        this.scene.add(ground);
        this.scene.add(solidGround);

        // Add some fog for depth effect
        this.scene.fog = new THREE.Fog(0xFF69B4, 20, 100);
    }
} 