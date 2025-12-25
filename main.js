document.addEventListener('DOMContentLoaded', () => {
    const startButton = document.querySelector('.start-button');
    if (startButton) {
        startButton.addEventListener('click', () => {
            window.open('https://api.whatsapp.com/send?phone=212624550243&text=Hi%F0%9F%91%8B%0AAre%20you%20available%20to%20talk%3F', '_blank');
        });
    }

    // Background Animation
    const canvas = document.getElementById('bg-canvas');
    const ctx = canvas.getContext('2d');
    let particlesArray;

    // Set canvas size
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let mouse = {
        x: null,
        y: null,
        radius: (canvas.height / 80) * (canvas.width / 80) // Interaction radius
    };

    window.addEventListener('mousemove', (event) => {
        mouse.x = event.x;
        mouse.y = event.y;
    });

    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        mouse.radius = (canvas.height / 80) * (canvas.width / 80);
        init();
    });

    window.addEventListener('mouseout', () => {
        mouse.x = undefined;
        mouse.y = undefined;
    });

    window.addEventListener('click', (event) => {
        // Explosion effect: Spawn 5 particles at click position
        for (let i = 0; i < 5; i++) {
            particlesArray.push(new Particle(event.x, event.y, true)); // true = isTemporary
        }
    });

    // Particle class
    const colors = ['#e02b04', '#ffffff', '#ffffff']; // Replaced cyan with brand variations

    class Particle {
        constructor(x, y, isTemporary = false) {
            this.x = x || Math.random() * canvas.width;
            this.y = y || Math.random() * canvas.height;
            this.directionX = (Math.random() * 0.4) - 0.2;
            this.directionY = (Math.random() * 0.4) - 0.2;
            this.size = Math.random() * 1.5 + 1.5;
            this.color = colors[Math.floor(Math.random() * colors.length)];

            this.isTemporary = isTemporary;
            this.life = 400; // Lives for 400 frames (approx 5 seconds)
            this.opacity = 1;
            this.dead = false;
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2, false);
            // Hex to RGB to handle opacity for temporary particles
            // Simple way: just use globalAlpha for the context before drawing
            ctx.save(); // Save state
            if (this.isTemporary) {
                ctx.globalAlpha = this.opacity;
            }
            ctx.fillStyle = this.color;
            ctx.fill();
            ctx.restore(); // Restore state (reset alpha)
        }

        update() {
            if (this.x > canvas.width || this.x < 0) {
                this.directionX = -this.directionX;
            }
            if (this.y > canvas.height || this.y < 0) {
                this.directionY = -this.directionY;
            }

            // Mouse interaction (collision/repel optional, but let's do connection for now to keep it clean)
            // But if we want them to feel "alive", maybe they speed up slightly near mouse?
            // For now, simple movement.

            this.x += this.directionX;
            this.y += this.directionY;

            if (this.isTemporary) {
                this.life--;
                this.opacity = Math.max(0, this.life / 50); // Fade out quickly at the end
                if (this.opacity > 1) this.opacity = 1;

                if (this.life <= 0) {
                    this.dead = true;
                }
            }

            this.draw();
        }
    }

    // Packet class (Data Stream Pulses)
    let packetsArray = [];
    class Packet {
        constructor(x, y, tx, ty) {
            this.x = x;
            this.y = y;
            this.tx = tx;
            this.ty = ty;
            this.speed = 0.04; // Progress per frame (0 to 1)
            this.progress = 0;
            this.color = '#ff0000ff'; // White data packets
            this.dead = false;
        }

        update() {
            this.progress += this.speed;
            if (this.progress >= 1) {
                this.dead = true;
            }
        }

        draw() {
            if (this.dead) return;
            // Linear interpolation
            let curX = this.x + (this.tx - this.x) * this.progress;
            let curY = this.y + (this.ty - this.y) * this.progress;

            ctx.beginPath();
            ctx.arc(curX, curY, 2, 0, Math.PI * 2, false);
            ctx.fillStyle = this.color;
            ctx.fill();
        }
    }

    function init() {
        particlesArray = [];
        let numberOfParticles = (canvas.height * canvas.width) / 9000;
        for (let i = 0; i < numberOfParticles; i++) {
            particlesArray.push(new Particle());
        }
    }

    function animate() {
        requestAnimationFrame(animate);
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Dynamic Background Animation
        // "Life": Pulse the beam width (40% to 60%)
        const time = Date.now() * 0.001;
        const pulse = Math.sin(time) * 10 + 50; // Oscillates between 40 and 60

        // "Interact": Shift the center based on mouse X (if available)
        let shift = 0;
        if (mouse.x != undefined) {
            // Map mouse X (0 to width) to -20% to +20% shift
            const normalizedX = (mouse.x / canvas.width) - 0.5; // -0.5 to 0.5
            shift = normalizedX * 40;
        }

        const centerPos = 50 + shift;

        // Update body background
        // Linear gradient: 135deg, Black 0%, Red Center%, Black 100%
        document.body.style.background = `linear-gradient(135deg, #000000 0%, #3d0601 ${centerPos}%, #000000 100%)`;

        // Removed opaque fill to let CSS linear gradient show through

        for (let i = 0; i < particlesArray.length; i++) {
            particlesArray[i].update();
        }

        // Remove dead particles (interactively spawned ones)
        particlesArray = particlesArray.filter(p => !p.dead);

        // Update and draw packets
        for (let i = 0; i < packetsArray.length; i++) {
            packetsArray[i].update();
            packetsArray[i].draw();
        }
        // Remove dead packets
        packetsArray = packetsArray.filter(p => !p.dead);

        connect();
    }

    function connect() {
        let opacityValue = 1;
        for (let a = 0; a < particlesArray.length; a++) {
            // Connect to other particles
            for (let b = a; b < particlesArray.length; b++) {
                let distance = ((particlesArray[a].x - particlesArray[b].x) * (particlesArray[a].x - particlesArray[b].x)) +
                    ((particlesArray[a].y - particlesArray[b].y) * (particlesArray[a].y - particlesArray[b].y));
                if (distance < (canvas.width / 7) * (canvas.height / 7)) {
                    opacityValue = 1 - (distance / 20000);
                    ctx.strokeStyle = 'rgba(224, 43, 4,' + opacityValue + ')'; /* Brand Red #e02b04 */
                    // If either particle is the red one, maybe make line red?
                    // Let's mix it up or keep lines uniform for clean look. Uniform cyan lines look "tech".
                    // But if it's the main brand color, let's see.
                    // Let's use a dynamic color for lines based on particle color if we want it super cool.
                    // For now, keeping lines cyan/whiteish preserves the "grid" look.

                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(particlesArray[a].x, particlesArray[a].y);
                    ctx.lineTo(particlesArray[b].x, particlesArray[b].y);
                    ctx.stroke();

                    // Randomly spawn data packet pulse
                    if (Math.random() < 0.0003) { // Small chance per frame per connection
                        packetsArray.push(new Packet(particlesArray[a].x, particlesArray[a].y, particlesArray[b].x, particlesArray[b].y));
                    }
                }
            }

            // Connect to mouse
            if (mouse.x != undefined && mouse.y != undefined) {
                let mouseDistance = ((particlesArray[a].x - mouse.x) * (particlesArray[a].x - mouse.x)) +
                    ((particlesArray[a].y - mouse.y) * (particlesArray[a].y - mouse.y));
                if (mouseDistance < mouse.radius) {
                    // Line to mouse
                    ctx.strokeStyle = 'rgba(224, 43, 4, 1)'; // Brand color for mouse connections
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(particlesArray[a].x, particlesArray[a].y);
                    ctx.lineTo(mouse.x, mouse.y);
                    ctx.stroke();

                    // High chance to spawn packet to mouse
                    if (Math.random() < 0.05) {
                        packetsArray.push(new Packet(particlesArray[a].x, particlesArray[a].y, mouse.x, mouse.y));
                    }
                }
            }
        }
    }

    init();
    animate();
});
