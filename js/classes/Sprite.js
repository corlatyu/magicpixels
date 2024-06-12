//
// Kelas Sprite. Semua objek didasarkan pada kelas ini.
//
class Sprite {
  /**
   * Konstruktor untuk membuat objek Sprite.
   * @param {Object} options - Opsi untuk objek Sprite.
   * @param {Object} options.position - Posisi awal objek Sprite.
   * @param {string} options.imageSrc - Sumber gambar untuk sprite.
   * @param {number} [options.frameRate=1] - Kecepatan frame animasi.
   * @param {Object} options.animations - Animasi yang diberikan untuk sprite.
   * @param {number} [options.frameBuffer=2] - Jumlah frame sebelum perubahan frame berikutnya.
   * @param {boolean} [options.loop=true] - Menentukan apakah animasi diulang atau tidak.
   * @param {boolean} [options.autoplay=true] - Menentukan apakah animasi berjalan secara otomatis.
   */
  constructor({
    position,
    imageSrc,
    frameRate = 1,
    animations,
    frameBuffer = 2,
    loop = true,
    autoplay = true,
  }) {
    this.position = position;
    this.image = new Image();
    this.image.onload = () => {
      this.loaded = true;
      // frameRate = jumlah frame, default 1
      this.width = this.image.width / this.frameRate;
      this.height = this.image.height;
    };
    this.image.src = imageSrc;
    this.loaded = false;
    // Frames per spritesheet
    this.frameRate = frameRate;
    this.currentFrame = 0;
    this.elapsedFrames = 0;
    this.frameBuffer = frameBuffer;
    this.animations = animations;
    this.loop = loop;
    this.autoplay = autoplay;
    this.currentAnimation;

    // Mendapatkan nama animasi
    if (this.animations) {
      for (let key in this.animations) {
        const image = new Image();
        image.src = this.animations[key].imageSrc;
        this.animations[key].image = image;
      }
    }
  }

  /**
   * Metode yang dipanggil oleh fungsi animasi utama.
   */
  draw() {
    if (!this.loaded) return;
    const cropbox = {
      position: {
        // Memilih frame
        x: this.width * this.currentFrame,
        y: 0,
      },
      width: this.width,
      height: this.height,
    };
    c.drawImage(
      this.image,
      cropbox.position.x,
      cropbox.position.y,
      cropbox.width,
      cropbox.height,
      this.position.x,
      this.position.y,
      this.width,
      this.height
    );

    this.updateFrames();
  }

  /**
   * Memainkan animasi.
   */
  play() {
    this.autoplay = true;
  }

  /**
   * Memperbarui frame animasi.
   */
  updateFrames() {
    if (!this.autoplay) return;
    this.elapsedFrames++;
    if (this.elapsedFrames % this.frameBuffer === 0) {
      if (this.currentFrame < this.frameRate - 1) this.currentFrame++;
      else if (this.loop) this.currentFrame = 0;
    }
  }
}
