import { THREE } from './three-imports';

export class RainEffect {
    private raindrops: THREE.Points;
    private particleCount: number = 8000;
    private particleGeometry: THREE.BufferGeometry;
    private velocities: Float32Array;
    private isRaining: boolean = false;
    private lightningLight: THREE.PointLight;
    private lastLightningTime: number = 0;
    private scene: THREE.Scene;
    private transitionDuration: number = 2000; // 2 seconds transition
    private transitionStartTime: number = 0;
    private targetOpacity: number = 0;
    private currentOpacity: number = 0;
    private ambientFlash: THREE.AmbientLight;

    constructor(scene: THREE.Scene) {
        this.scene = scene;
        
        // Create raindrop geometry
        this.particleGeometry = new THREE.BufferGeometry();
        const positions = new Float32Array(this.particleCount * 3);
        this.velocities = new Float32Array(this.particleCount);

        // Initialize raindrops
        for (let i = 0; i < this.particleCount; i++) {
            positions[i * 3] = Math.random() * 400 - 200;     // x
            positions[i * 3 + 1] = Math.random() * 200 + 50;  // y
            positions[i * 3 + 2] = Math.random() * 400 - 200; // z
            this.velocities[i] = Math.random() * 0.5 + 0.5;   // Speed variation
        }

        this.particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

        // Create raindrop material with zero initial opacity
        const rainMaterial = new THREE.PointsMaterial({
            color: 0x99ccff,
            size: 0.4,
            transparent: true,
            opacity: 0,
            blending: THREE.AdditiveBlending
        });

        // Create the particle system
        this.raindrops = new THREE.Points(this.particleGeometry, rainMaterial);
        scene.add(this.raindrops);
        this.raindrops.visible = false;

        // Create brighter lightning light with larger range
        this.lightningLight = new THREE.PointLight(0x7DF9FF, 0, 2000);
        this.lightningLight.position.set(0, 50, -50);
        scene.add(this.lightningLight);

        // Add ambient flash light
        this.ambientFlash = new THREE.AmbientLight(0x7DF9FF, 0);
        scene.add(this.ambientFlash);
    }

    startRain(): void {
        // Always make visible immediately
        this.raindrops.visible = true;
        this.isRaining = true;
        
        // Set initial opacity if starting fresh
        if (this.currentOpacity === 0) {
            (this.raindrops.material as THREE.PointsMaterial).opacity = 0;
        }
        
        this.lastLightningTime = Date.now();
        this.transitionStartTime = Date.now();
        this.targetOpacity = 0.8;
    }

    stopRain(): void {
        if (this.isRaining) {
            this.transitionStartTime = Date.now();
            this.targetOpacity = 0;
            this.lightningLight.intensity = 0;
            this.ambientFlash.intensity = 0;
        }
    }

    update(): void {
        // Update transition
        const now = Date.now();
        const elapsed = now - this.transitionStartTime;
        const progress = Math.min(elapsed / this.transitionDuration, 1);

        if (this.targetOpacity !== this.currentOpacity) {
            // Smoother lerp factor
            const lerpFactor = progress * 0.1;
            this.currentOpacity = THREE.MathUtils.lerp(
                this.currentOpacity,
                this.targetOpacity,
                lerpFactor
            );
            
            (this.raindrops.material as THREE.PointsMaterial).opacity = this.currentOpacity;

            if (Math.abs(this.currentOpacity - this.targetOpacity) < 0.001) {
                this.currentOpacity = this.targetOpacity;
                if (this.currentOpacity === 0) {
                    this.isRaining = false;
                    this.raindrops.visible = false;
                }
            }
        }

        // Always update rain when visible
        if (this.raindrops.visible) {
            // Update raindrops with faster fall speed
            const positions = this.particleGeometry.attributes.position.array as Float32Array;
            for (let i = 0; i < this.particleCount; i++) {
                positions[i * 3 + 1] -= this.velocities[i] * 2;
                if (positions[i * 3 + 1] < 0) {
                    positions[i * 3 + 1] = Math.random() * 200 + 50;
                    positions[i * 3] = Math.random() * 400 - 200;
                    positions[i * 3 + 2] = Math.random() * 400 - 200;
                }
            }
            this.particleGeometry.attributes.position.needsUpdate = true;

            // Create lightning more frequently at start
            if (now - this.lastLightningTime > Math.random() * 3000 + 2000) {
                this.createLightning();
                this.lastLightningTime = now;
            }
        }
    }

    private createLightning(): void {
        if (!this.isRaining) return;

        // Scale lightning intensity with current rain opacity
        const intensityScale = this.currentOpacity / 0.8;
        
        // Keep lightning closer to the player
        const x = (Math.random() - 0.5) * 200;
        const z = (Math.random() - 0.5) * 200 - 50;
        this.lightningLight.position.set(x, 50, z);

        const flash = () => {
            // Much brighter initial flash
            this.lightningLight.intensity = 8 * intensityScale;
            this.ambientFlash.intensity = 2 * intensityScale;
            
            setTimeout(() => {
                this.lightningLight.intensity = 0;
                this.ambientFlash.intensity = 0;
                
                setTimeout(() => {
                    this.lightningLight.intensity = 5 * intensityScale;
                    this.ambientFlash.intensity = 1 * intensityScale;
                    
                    setTimeout(() => {
                        this.lightningLight.intensity = 0;
                        this.ambientFlash.intensity = 0;
                        
                        setTimeout(() => {
                            this.lightningLight.intensity = 3 * intensityScale;
                            this.ambientFlash.intensity = 0.5 * intensityScale;
                            
                            setTimeout(() => {
                                this.lightningLight.intensity = 0;
                                this.ambientFlash.intensity = 0;
                            }, 50);
                        }, 50);
                    }, 50);
                }, 50);
            }, 50);
        };

        flash();
    }
} 