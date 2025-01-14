import * as THREE from 'three';

export class RainEffect {
    private raindrops: THREE.Points;
    private particleCount: number = 8000;
    private particleGeometry: THREE.BufferGeometry;
    private velocities: Float32Array;
    private isRaining: boolean = false;
    private lightningLight: THREE.PointLight;
    private lastLightningTime: number = 0;
    private scene: THREE.Scene;

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

        // Create raindrop material
        const rainMaterial = new THREE.PointsMaterial({
            color: 0x99ccff,
            size: 0.4,
            transparent: true,
            opacity: 0.8,
            blending: THREE.AdditiveBlending
        });

        // Create the particle system
        this.raindrops = new THREE.Points(this.particleGeometry, rainMaterial);
        scene.add(this.raindrops);
        this.raindrops.visible = false;

        // Create brighter lightning light
        this.lightningLight = new THREE.PointLight(0x7DF9FF, 0, 800);
        this.lightningLight.position.set(0, 100, -50);
        scene.add(this.lightningLight);
    }

    private createLightning(): void {
        if (!this.isRaining) return;

        // More frequent and intense lightning
        const x = (Math.random() - 0.5) * 400;
        const z = (Math.random() - 0.5) * 400 - 50;
        this.lightningLight.position.set(x, 100, z);

        const flash = () => {
            this.lightningLight.intensity = 3;
            
            setTimeout(() => {
                this.lightningLight.intensity = 0;
                setTimeout(() => {
                    this.lightningLight.intensity = 2;
                    setTimeout(() => {
                        this.lightningLight.intensity = 0;
                        setTimeout(() => {
                            this.lightningLight.intensity = 1;
                            setTimeout(() => {
                                this.lightningLight.intensity = 0;
                            }, 50);
                        }, 50);
                    }, 50);
                }, 50);
            }, 50);
        };

        flash();
    }

    startRain(): void {
        if (!this.isRaining) {
            this.isRaining = true;
            this.raindrops.visible = true;
            this.lastLightningTime = Date.now();
        }
    }

    stopRain(): void {
        if (this.isRaining) {
            this.isRaining = false;
            this.raindrops.visible = false;
            this.lightningLight.intensity = 0;
        }
    }

    update(): void {
        if (!this.isRaining) return;

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

        // More frequent lightning
        const now = Date.now();
        if (now - this.lastLightningTime > Math.random() * 5000 + 3000) {
            this.createLightning();
            this.lastLightningTime = now;
        }
    }
} 