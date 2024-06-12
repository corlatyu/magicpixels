//
// Kelas Saw, perluasan dari sprite, perangkap bergerak
//
class Saw extends Sprite {
  constructor({ imageSrc, frameRate, animations, loop, x, y }) {
    super({ imageSrc, frameRate, animations, loop });
    // Posisi awal gergaji
    this.position = {
      x: x,
      y: y,
    };

    // Kecepatan awal gergaji
    this.velocity = {
      x: 0,
      y: 3,
    };

    // Arah awal gergaji, perhatikan TODO di atas
    this.direction = "down";

    // Rentang pergerakan gergaji
    // TODO: tambahkan posisi x untuk gergaji horizontal mungkin?
    this.minY = this.position.y;
    this.maxY = this.position.y + 189;
  }

  update() {
    // Perbarui hitbox
    this.updateHitbox();

    // Perbarui arah dan kecepatan pada sumbu y
    this.updateYPosition();

    // Perbarui hitbox setelah memperbarui kecepatan
    this.updateHitbox();

    // Gambar sprite
    this.draw();
  }

  // Perbarui hitbox Saw
  updateHitbox() {
    this.hitbox = {
      position: {
        x: this.position.x, // Tambahkan offset di sini jika diperlukan
        y: this.position.y, // tambahkan offset di sini jika diperlukan
      },
      width: 38, // lebar hitbox
      height: 38, // tinggi hitbox
    };
  }

  // Perbarui posisi y gergaji
  updateYPosition() {
    this.position.y += this.velocity.y;
    if (this.direction == "down" && this.position.y == this.maxY) {
      this.direction = "up";
      this.velocity.y = -3;
    } else if (this.direction == "up" && this.position.y == this.minY) {
      this.direction = "down";
      this.velocity.y = 3;
    }
  }
}
