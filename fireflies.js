/* ===== HIỆU ỨNG ĐOM ĐÓM (BAN ĐÊM) ===== */
document.addEventListener("DOMContentLoaded", () => {
    const canvas = document.getElementById('firefliesCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let width, height;
    let fireflies = [];
    const NUM_FIREFLIES = 50;

    function resize() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resize);
    resize();

    class Firefly {
        constructor() {
            this.reset();
        }
        reset() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.size = Math.random() * 2.5 + 1.5;
            // Bay lượn 4 phương (không rơi)
            this.speedX = Math.random() * 1 - 0.5;
            this.speedY = Math.random() * 1 - 0.5;
            this.alpha = Math.random();
            this.flickerSpeed = Math.random() * 0.03 + 0.01;
            this.angle = Math.random() * Math.PI * 2;
        }
        update() {
            // Di chuyển tự do
            this.x += this.speedX;
            this.y += this.speedY;
            
            // Nhấp nháy
            this.alpha += this.flickerSpeed;
            if (this.alpha > 1 || this.alpha < 0.1) {
                this.flickerSpeed = -this.flickerSpeed;
            }
            
            // Thêm chuyển động hình sin để bay mượt hơn
            this.angle += 0.02;
            this.x += Math.sin(this.angle) * 0.5;
            this.y += Math.cos(this.angle) * 0.5;

            // Nếu bay ra khỏi màn hình, reset ở một vị trí ngẫu nhiên
            if (this.x < -10 || this.x > width + 10 || this.y < -10 || this.y > height + 10) {
                this.x = Math.random() * width;
                this.y = Math.random() * height;
            }
        }
        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(180, 255, 120, ${this.alpha})`; 
            ctx.shadowBlur = 15;
            ctx.shadowColor = `rgba(180, 255, 120, ${this.alpha})`;
            ctx.fill();
        }
    }

    for (let i = 0; i < NUM_FIREFLIES; i++) {
        fireflies.push(new Firefly());
    }

    function animate() {
        ctx.clearRect(0, 0, width, height);
        // Chỉ vẽ khi ĐANG Ở dark mode
        if (document.body.classList.contains('dark-mode')) {
            fireflies.forEach(firefly => {
                firefly.update();
                firefly.draw();
            });
        }
        requestAnimationFrame(animate);
    }
    animate();
});