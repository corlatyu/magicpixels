//
// Kelas Player, ekstensi dari kelas Sprite, dikendalikan oleh pengguna
//
class Player extends Sprite {
  constructor({
    collisionBlocks = [],
    trapBlocks = [],
    imageSrc,
    frameRate,
    animations,
    loop,
  }) {
    super({ imageSrc, frameRate, animations, loop });

    // Posisi awal Player
    // TODO: Pertimbangkan untuk mengekstrak ini agar bisa unik setiap level
    this.position = {
      x: 220,
      y: 300,
    };

    // Simpan posisi awal pemain
    this.initialX = this.position.x;
    this.initialY = this.position.y;

    // Kecepatan awal
    this.velocity = {
      x: 0,
      y: 0,
    };

    // Gravitasi berlaku untuk pemain
    this.gravity = 1;

    // Atur blok kolisi dan jebakan
    this.collisionBlocks = collisionBlocks;
    this.trapBlocks = trapBlocks;

    // Tentukan apakah pemain telah menyelesaikan level, digunakan agar kolisi dengan bendera kemenangan hanya terjadi sekali
    this.hasBeatLevel = false;

    this.hitSound = new sound("sounds/hit.ogg");
    this.hasWon = false;
  }

  // Memperbarui hitbox pemain dan posisinya
  update() {
    this.position.x += this.velocity.x;
    // Periksa tabrakan horizontal (lalu terapkan gravitasi, lalu periksa tabrakan vertikal)

    // Memperbarui hitbox pemain
    this.updateHitbox();

    // Tabrakan horizontal
    this.checkForHorizontalCollisions();

    // Terapkan gravitasi
    this.applyGravity();

    // Memperbarui hitbox pemain lagi
    this.updateHitbox();

    // Periksa tabrakan vertikal
    this.checkForVerticalCollisions();

    // Periksa tabrakan jebakan
    this.checkForTrapCollisions();
  }

  // Menghandle input dari pengguna
  handleInput(keys) {
    this.velocity.x = 0;
    if (keys.d.pressed) {
      this.switchSprite("runRight");
      this.velocity.x = 5;
      this.lastDirection = "right";
    } else if (keys.a.pressed) {
      this.switchSprite("runLeft");
      this.velocity.x = -5;
      this.lastDirection = "left";
    } else {
      if (this.lastDirection === "left") {
        this.switchSprite("idleLeft");
      } else {
        this.switchSprite("idleRight");
      }
    }
  }

  // Fungsi-fungsi di bawah ini dipanggil oleh metode update pemain, karena ini
  // adalah pemeriksaan yang perlu dilakukan setiap frame

  // Mengganti sprite tergantung pada tindakan
  switchSprite(actionName) {
    if (this.image === this.animations[actionName].image) return;
    this.currentFrame = 0;
    this.image = this.animations[actionName].image;
    this.frameRate = this.animations[actionName].frameRate;
    this.frameBuffer = this.animations[actionName].frameBuffer;
    this.loop = this.animations[actionName].loop;
    this.currentAnimation = this.animations[actionName];
  }

  // Memperbarui hitbox pemain setelah pergerakan
  updateHitbox() {
    this.hitbox = {
      position: {
        x: this.position.x, // Tambahkan offset di sini jika diperlukan
        y: this.position.y, // tambahkan offset di sini jika diperlukan
      },
      width: 31, // lebar hitbox
      height: 31, // tinggi hitbox
    };
  }

  // Memeriksa tabrakan horizontal
  checkForHorizontalCollisions() {
    for (let i = 0; i < this.collisionBlocks.length; i++) {
      const collisionBlock = this.collisionBlocks[i];

      // jika terjadi tabrakan, pada salah satu sisi persegi panjang
      if (
        this.position.x <= collisionBlock.position.x + collisionBlock.width &&
        this.hitbox.position.x + this.hitbox.width >=
          collisionBlock.position.x &&
        this.hitbox.position.y + this.hitbox.height >=
          collisionBlock.position.y &&
        this.hitbox.position.y <=
          collisionBlock.position.y + collisionBlock.height
      ) {
        // tabrakan di sumbu x ke kiri
        if (this.velocity.x < 0) {
          const offset = this.hitbox.position.x - this.position.x;
          this.position.x =
            collisionBlock.position.x + collisionBlock.width - offset + 0.01;
          break;
        }
        // tabrakan di sumbu x ke kanan
        if (this.velocity.x > 0) {
          const offset =
            this.hitbox.position.x - this.position.x + this.hitbox.height;
          this.position.x = collisionBlock.position.x - offset - 0.01;
          break;
        }
      }
    }
  }

  // Menerapkan gravitasi
  applyGravity() {
    this.velocity.y += this.gravity;
    this.position.y += this.velocity.y;
  }

  // Memeriksa tabrakan vertikal
  checkForVerticalCollisions() {
    for (let i = 0; i < this.collisionBlocks.length; i++) {
      const collisionBlock = this.collisionBlocks[i];

      // jika terjadi tabrakan, pada salah satu sisi persegi panjang
      if (
        this.hitbox.position.x <=
          collisionBlock.position.x + collisionBlock.width &&
        this.hitbox.position.x + this.hitbox.width >=
          collisionBlock.position.x &&
        this.hitbox.position.y + this.hitbox.height >=
          collisionBlock.position.y &&
        this.hitbox.position.y <=
          collisionBlock.position.y + collisionBlock.height
      ) {
        // tabrakan di sumbu y, atas
        if (this.velocity.y < 0) {
          this.velocity.y = 0;
          const offset = this.hitbox.position.y - this.position.y;
          this.position.y =
            collisionBlock.position.y + collisionBlock.height - offset + 0.01;
          break;
        }
        // tabrakan di sumbu y, bawah
        if (this.velocity.y > 0) {
          this.velocity.y = 0;
          const offset =
            this.hitbox.position.y - this.position.y + this.hitbox.height;
          this.position.y = collisionBlock.position.y - offset - 0.01;
          break;
        }
      }
    }
  }

  // Memeriksa tabrakan dengan perangkap
  checkForTrapCollisions() {
    for (let i = 0; i < this.trapBlocks.length; i++) {
      const trapBlock = this.trapBlocks[i];

      // jika terjadi tabrakan, pada salah satu sisi persegi panjang
      if (
        this.position.x <= trapBlock.position.x + trapBlock.width &&
        this.hitbox.position.x + this.hitbox.width >= trapBlock.position.x &&
        this.hitbox.position.y + this.hitbox.height >= trapBlock.position.y &&
        this.hitbox.position.y <= trapBlock.position.y + trapBlock.height
      ) {
        // Bertabrakan dengan perangkap, kembali ke awal level
        this.position.x = 220;
        this.position.y = 300;
        console.log("HITTT!");
        // Memainkan suara benturan
        this.hitSound.play();
      }
    }
  }

  // Memeriksa tabrakan dengan bendera kemenangan
  checkForWinFlag(winflag, level, levels) {
    if (
      !this.hasBeatLevel &&
      this.position.x <= winflag.position.x + winflag.width &&
      // Geser sisi kiri bendera
      this.hitbox.position.x + this.hitbox.width >= winflag.position.x + 18 &&
      this.hitbox.position.y + this.hitbox.height >= winflag.position.y + 12 &&
      this.hitbox.position.y <= winflag.position.y + winflag.height + 12
    ) {
      this.hasBeatLevel = true;
      gsap.to(overlay, {
        opacity: 1,
        onComplete: () => {
          level++;

          // Periksa jika level lebih besar dari level terakhir, jika ya, kembali ke level 1
          levels[level].init();
          // Beralih sprite ke sprite awal
          gsap.to(overlay, {
            opacity: 0,
          });
        },
      });
    }
  }

  // Memeriksa tabrakan dengan perangkap yang bergerak
  checkForCollisionWithMovingTraps(traps) {
    traps.forEach((trap) => {
      if (
        this.position.x <= trap.position.x + trap.width &&
        this.hitbox.position.x + this.hitbox.width >= trap.position.x &&
        this.hitbox.position.y + this.hitbox.height >= trap.position.y &&
        this.hitbox.position.y <= trap.position.y + trap.height
      ) {
        // Bertabrakan dengan perangkap, kembali ke awal level
        this.position.x = 220;
        this.position.y = 300;

        // Memainkan suara benturan
        this.hitSound.play();
      }
    });
  }

  // Memeriksa tabrakan dengan Hourglass
  checkForCollisionWithHourglass(hourglasses) {
    hourglasses.forEach((hourglass) => {
      if (
        this.position.x <= hourglass.position.x + hourglass.width &&
        this.hitbox.position.x + this.hitbox.width >= hourglass.position.x &&
        this.hitbox.position.y + this.hitbox.height >= hourglass.position.y &&
        this.hitbox.position.y <= hourglass.position.y + hourglass.height
      ) {
        // Bertabrakan dengan hourglass, tambahkan hourglass yang diambil
        grabedHourglasses++;
        // Hapus hourglass
        hourglass.position.y = 0;
        hourglass.position.y = 0;
        hourglass.width = 0;
        hourglass.height = 0;
      }
    });
  }
}
