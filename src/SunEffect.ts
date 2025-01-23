import { THREE } from './three-imports';

export class SunEffect {
    private sunLight: THREE.DirectionalLight;
    private sunSphere: THREE.Mesh;
    private glowSprite: THREE.Sprite;
    private scene: THREE.Scene;
    private isShining: boolean = false;
    private transitionDuration: number = 2000;
    private transitionStartTime: number = 0;
    private targetIntensity: number = 0;
    private currentIntensity: number = 0;

    constructor(scene: THREE.Scene) {
        this.scene = scene;

        // Create sun sphere
        const sunGeometry = new THREE.SphereGeometry(5, 32, 32);
        const sunMaterial = new THREE.MeshBasicMaterial({
            color: 0xffdd66,
            transparent: true,
            opacity: 0
        });
        this.sunSphere = new THREE.Mesh(sunGeometry, sunMaterial);
        this.sunSphere.position.set(30, 40, -50);
        scene.add(this.sunSphere);

        // Create sun glow sprite
        const glowTexture = this.createGlowTexture();
        const glowMaterial = new THREE.SpriteMaterial({
            map: glowTexture,
            color: 0xffdd66,
            transparent: true,
            opacity: 0,
            blending: THREE.AdditiveBlending
        });
        this.glowSprite = new THREE.Sprite(glowMaterial);
        this.glowSprite.scale.set(20, 20, 1);
        this.glowSprite.position.copy(this.sunSphere.position);
        scene.add(this.glowSprite);

        // Create sun light
        this.sunLight = new THREE.DirectionalLight(0xffdd66, 0);
        this.sunLight.position.copy(this.sunSphere.position);
        scene.add(this.sunLight);
    }

    private createGlowTexture(): THREE.Texture {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = 64;
        canvas.height = 64;

        if (context) {
            const gradient = context.createRadialGradient(
                32, 32, 0,
                32, 32, 32
            );
            gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
            gradient.addColorStop(0.5, 'rgba(255, 255, 200, 0.5)');
            gradient.addColorStop(1, 'rgba(255, 255, 200, 0)');

            context.fillStyle = gradient;
            context.fillRect(0, 0, 64, 64);
        }

        const texture = new THREE.Texture(canvas);
        texture.needsUpdate = true;
        return texture;
    }

    startShining(): void {
        this.isShining = true;
        this.transitionStartTime = Date.now();
        this.targetIntensity = 1;
    }

    stopShining(): void {
        this.transitionStartTime = Date.now();
        this.targetIntensity = 0;
    }

    update(): void {
        const now = Date.now();
        const elapsed = now - this.transitionStartTime;
        const progress = Math.min(elapsed / this.transitionDuration, 1);

        if (this.targetIntensity !== this.currentIntensity) {
            const lerpFactor = progress * 0.1;
            this.currentIntensity = THREE.MathUtils.lerp(
                this.currentIntensity,
                this.targetIntensity,
                lerpFactor
            );

            // Update all sun components
            this.sunLight.intensity = this.currentIntensity;
            (this.sunSphere.material as THREE.MeshBasicMaterial).opacity = this.currentIntensity * 0.8;
            (this.glowSprite.material as THREE.SpriteMaterial).opacity = this.currentIntensity * 0.6;

            if (Math.abs(this.currentIntensity - this.targetIntensity) < 0.001) {
                this.currentIntensity = this.targetIntensity;
                if (this.currentIntensity === 0) {
                    this.isShining = false;
                }
            }
        }

        // Add subtle pulsing effect when fully visible
        if (this.isShining && this.currentIntensity > 0.9) {
            const pulse = Math.sin(now * 0.002) * 0.1 + 0.9;
            this.glowSprite.scale.set(20 * pulse, 20 * pulse, 1);
        }
    }
} 