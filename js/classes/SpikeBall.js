//
// Kelas SpikeBall, perangkap bergerak, menggunakan algoritma pendulum
//

class SpikeBall extends Sprite {
  /**
   * Constructor untuk membuat objek SpikeBall.
   * @param {Object} options - Opsi untuk objek SpikeBall.
   * @param {Array} [options.collisionBlocks=[]] - Blok tabrakan untuk deteksi tabrakan.
   * @param {string} options.imageSrc - Sumber gambar untuk sprite.
   * @param {number} options.frameRate - Kecepatan frame animasi.
   * @param {Object} options.animations - Animasi yang diberikan untuk sprite.
   * @param {boolean} options.loop - Menentukan apakah animasi diulang atau tidak.
   * @param {number} options.x - Koordinat x awal untuk SpikeBall.
   * @param {number} options.y - Koordinat y awal untuk SpikeBall.
   * @param {number} chainLength - Panjang rantai dari SpikeBall.
   */
  constructor({
    collisionBlocks = [],
    imageSrc,
    frameRate,
    animations,
    loop,
    x,
    y,
    chainLength,
  }) {
    super({ imageSrc, frameRate, animations, loop });

    // Inisialisasi posisi dan kecepatan SpikeBall
    this.position = { x: 0, y: 0 };
    this.velocity = { x: 0, y: 0 };

    // Gravitasi yang diterapkan pada SpikeBall
    this.gravity = 1.0;

    // Blok-blok tabrakan yang terdeteksi oleh SpikeBall
    this.collisionBlocks = collisionBlocks;

    // Status apakah SpikeBall telah melewati level
    this.hasBeatLevel = false;

    // Arah awal SpikeBall
    this.xDirection = "right";
    this.yDirection = "up";

    // Sudut awal dan kecepatan sudut SpikeBall
    this.angle = Math.PI / 2.0;
    this.angleV = 0.0;
    this.angleA = 0.0;

    // Titik asal dan panjang rantai SpikeBall
    this.origin = { x: x, y: y };
    this.length = chainLength;
  }

  /**
   * Metode untuk memperbarui posisi SpikeBall berdasarkan gerakan pendulum.
   */
  update() {
    // Memperbarui hitbox SpikeBall
    this.updateHitbox();

    // Memperbarui gerakan pendulum
    this.updatePendulum();

    // Menggambar garis rantai
    this.updateLine();

    // Menggambar sprite SpikeBall
    this.draw();
  }

  /**
   * Metode untuk memperbarui hitbox SpikeBall.
   */
  updateHitbox() {
    this.hitbox = {
      position: { x: this.position.x, y: this.position.y },
      width: 28, // Lebar hitbox SpikeBall
      height: 28, // Tinggi hitbox SpikeBall
    };
  }

  /**
   * Metode untuk memperbarui gerakan pendulum SpikeBall.
   */
  updatePendulum() {
    // Menghitung gaya dan percepatan sudut
    this.force = this.gravity * Math.sin(this.angle);
    this.angleA = (-0.5 * this.force) / this.length;
    this.angleV += this.angleA;
    this.angle += this.angleV;

    // Menghitung posisi berdasarkan gerakan pendulum
    this.position.x = this.length * Math.sin(this.angle) + this.origin.x;
    this.position.y = this.length * Math.cos(this.angle) + this.origin.y;
  }

  /**
   * Metode untuk menggambar garis rantai SpikeBall.
   */
  updateLine() {
    c.beginPath();
    c.moveTo(this.origin.x, this.origin.y);
    c.lineTo(this.position.x + 14, this.position.y + 14); // Menyesuaikan dengan pusat SpikeBall
    c.stroke();
  }
}
