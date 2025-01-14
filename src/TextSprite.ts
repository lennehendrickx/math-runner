import * as THREE from 'three';

export function createTextSprite(text: string): THREE.Sprite {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = 1024;
    canvas.height = 1024;

    if (context) {
        // Enable crisp text rendering
        context.imageSmoothingEnabled = false;
        
        // Fill with a semi-transparent black background for better contrast
        context.fillStyle = 'rgba(0, 0, 0, 0.6)';
        context.fillRect(0, 0, canvas.width, canvas.height);

        // Draw text with a larger font size and better anti-aliasing
        context.fillStyle = 'white';
        context.font = 'bold 280px Arial';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        
        // Add text stroke for better visibility
        context.strokeStyle = 'black';
        context.lineWidth = 12;
        
        // Draw multiple strokes for better edge quality
        for (let i = 0; i < 8; i++) {
            const angle = (i * Math.PI) / 4;
            const dx = Math.cos(angle) * 2;
            const dy = Math.sin(angle) * 2;
            context.strokeText(text, 512 + dx, 512 + dy);
        }
        
        // Draw the main text
        context.fillText(text, 512, 512);
    }

    const texture = new THREE.Texture(canvas);
    texture.needsUpdate = true;
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;

    const material = new THREE.SpriteMaterial({ 
        map: texture,
        sizeAttenuation: true,
        transparent: true
    });

    const sprite = new THREE.Sprite(material);
    sprite.scale.set(5, 2.5, 1);

    return sprite;
}

function addSparkles(context: CanvasRenderingContext2D) {
    context.fillStyle = 'white';
    for (let i = 0; i < 20; i++) {
        const x = Math.random() * 512;
        const y = Math.random() * 512;
        const size = Math.random() * 4 + 2;
        context.beginPath();
        context.arc(x, y, size, 0, Math.PI * 2);
        context.fill();
    }
} 