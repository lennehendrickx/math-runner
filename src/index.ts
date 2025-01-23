import { THREE } from './three-imports';
import { Game } from './Game';

window.addEventListener('DOMContentLoaded', () => {
    const game = new Game();
    game.init();
    game.animate();
}); 