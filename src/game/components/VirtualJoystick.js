export class VirtualJoystick {
	constructor(scene) {
		this.scene = scene;
		this.active = false;
		this.baseX = 0;
		this.baseY = 0;
		this.thumbX = 0;
		this.thumbY = 0;
		this.force = 0;
		this.angle = 0;
		this.radius = 50;

		this.createGraphics();
		this.setupInput();
	}

	createGraphics() {
		this.base = this.scene.add.circle(0, 0, this.radius, 0x3b2731, 0.3);
		this.base.setDepth(1000);
		this.base.setScrollFactor(0);
		this.base.setVisible(false);

		this.thumb = this.scene.add.circle(0, 0, this.radius * 0.5, 0x3b2731, 0.6);
		this.thumb.setDepth(1001);
		this.thumb.setScrollFactor(0);
		this.thumb.setVisible(false);
	}

	setupInput() {
		this.scene.input.on("pointerdown", (pointer) => {
			if (pointer.y > this.scene.cameras.main.height / 2 || pointer.isDown) {
				this.start(pointer.x, pointer.y);
			}
		});

		this.scene.input.on("pointermove", (pointer) => {
			if (this.active && pointer.isDown) {
				this.move(pointer.x, pointer.y);
			}
		});

		this.scene.input.on("pointerup", () => {
			this.stop();
		});
	}

	start(x, y) {
		this.active = true;
		this.baseX = x;
		this.baseY = y;
		this.base.setPosition(x, y);
		this.thumb.setPosition(x, y);
		this.base.setVisible(true);
		this.thumb.setVisible(true);
	}

	move(x, y) {
		if (!this.active) return;

		const dx = x - this.baseX;
		const dy = y - this.baseY;
		const distance = Math.sqrt(dx * dx + dy * dy);

		this.angle = Math.atan2(dy, dx);

		if (distance > this.radius) {
			this.thumbX = this.baseX + Math.cos(this.angle) * this.radius;
			this.thumbY = this.baseY + Math.sin(this.angle) * this.radius;
			this.force = 1;
		} else {
			this.thumbX = x;
			this.thumbY = y;
			this.force = distance / this.radius;
		}

		this.thumb.setPosition(this.thumbX, this.thumbY);
	}

	stop() {
		this.active = false;
		this.force = 0;
		this.base.setVisible(false);
		this.thumb.setVisible(false);
	}

	getDirection() {
		if (!this.active || this.force < 0.1) {
			return { x: 0, y: 0 };
		}

		return {
			x: Math.cos(this.angle) * this.force,
			y: Math.sin(this.angle) * this.force,
		};
	}

	destroy() {
		this.base.destroy();
		this.thumb.destroy();
	}
}
