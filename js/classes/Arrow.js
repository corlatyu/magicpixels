//
// Kelas Arrow, ekstensi dari Sprite, perangkap bergerak
// Anak panah akan bergerak dari kanan ke kiri, mungkin akan ditambahkan dari atas dan bawah nanti
//
class Arrow extends Sprite {
  constructor({ imageSrc, frameRate, animations, loop, startX, startY }) {
    super({ imageSrc, frameRate, animations, loop });
    // Posisi awal anak panah
    this.position = {
      x: startX,
      y: startY,
    };

    // Kecepatan awal anak panah
    this.velocity = {
      x: -5,
      y: 0,
    };
  }

  // Dipanggil oleh loop permainan utama di index.js
  update() {
    // Perbarui hitbox
    this.updateHitbox();

    // Perbarui arah dan kecepatan pada y
    this.updatePosition();

    // Perbarui hitbox setelah memperbarui kecepatan
    this.updateHitbox();

    // Gambar sprite
    this.draw();
  }

  // Memperbarui hitbox Saw
  updateHitbox() {
    this.hitbox = {
      position: {
        x: this.position.x, // Tambahkan offset di sini jika diperlukan
        y: this.position.y, // tambahkan offset di sini jika diperlukan
      },
      width: 38, // lebar hitbox
      height: 14, // tinggi hitbox
    };
  }

  // Memperbarui posisi anak panah
  updatePosition() {
    this.position.y += this.velocity.y;
    this.position.x += this.velocity.x;
    // Hapus dari tampilan jika posisi lebih besar dari peta
    if (this.position.x < 120) {
      this.width = 0;
      this.height = 0;
    }
  }
}
