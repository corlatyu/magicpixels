const canvas = document.querySelector("canvas");
const c = canvas.getContext("2d"); // Mengambil konteks gambar 2 dimensi dari elemen canvas

canvas.width = 16 * 64; // Lebar canvas diatur menjadi 1024 piksel, sesuai dengan ukuran satu tile kali lebar peta dalam jumlah tile
canvas.height = 16 * 36; // Tinggi canvas diatur menjadi 576 piksel, sesuai dengan ukuran satu tile kali tinggi peta dalam jumlah tile

// Musik permainan
let gameMusic = new sound("sounds/backgroundMusic.mp3");

// Suara yang diputar saat pemain menang
let winSound = new sound("sounds/winSound.wav");

const leaderboardRef = db.collection("Leaderboard");

let arrowInterval;

// Deklarasi variabel
let parsedCollisions;
let parserTrapCollisions;
let trapBlocks;
let collisionBlocks;
let background;
let winFlags;
let totalTimePaused = 0;
let startTime;
let finalTime;
let elapsed;
let isPaused = false;
let levelContainsArrows = false;

// Jumlah jam pasir yang diambil
let grabedHourglasses = 0;

let playerName;
let leaderboard = [];
let leaderboardListElement = document.getElementById("leaderboardList");
let leaderboardList;

// Digunakan untuk mencegah animate() berjalan lebih dari sekali dalam satu sesi
let gameHasStartedOnce = false;
const player = new Player({
  imageSrc: "./img/character/idle.png", // Sumber gambar untuk animasi diam ke kanan
  frameRate: 11, // Kecepatan frame animasi default

  // Daftar animasi untuk pemain
  animations: {
    idleRight: {
      frameRate: 11, // Kecepatan frame animasi diam ke kanan
      frameBuffer: 2, // Buffer frame untuk memperlambat kecepatan animasi
      loop: true, // Mengatur apakah animasi berulang atau tidak
      imageSrc: "./img/character/idle.png", // Sumber gambar untuk animasi diam ke kanan
    },
    idleLeft: {
      frameRate: 11, // Kecepatan frame animasi diam ke kiri
      frameBuffer: 2, // Buffer frame untuk memperlambat kecepatan animasi
      loop: true, // Mengatur apakah animasi berulang atau tidak
      imageSrc: "./img/character/idleLeft.png", // Sumber gambar untuk animasi diam ke kiri
    },
    runRight: {
      frameRate: 12, // Kecepatan frame animasi berlari ke kanan
      frameBuffer: 2, // Buffer frame untuk memperlambat kecepatan animasi
      loop: true, // Mengatur apakah animasi berulang atau tidak
      imageSrc: "./img/character/run.png", // Sumber gambar untuk animasi berlari ke kanan
    },
    runLeft: {
      frameRate: 12, // Kecepatan frame animasi berlari ke kiri
      frameBuffer: 2, // Buffer frame untuk memperlambat kecepatan animasi
      loop: true, // Mengatur apakah animasi berulang atau tidak
      imageSrc: "./img/character/runLeft.png", // Sumber gambar untuk animasi berlari ke kiri
    },
    jumpRight: {
      frameRate: 1, // Kecepatan frame animasi loncat ke kanan
      frameBuffer: 1, // Buffer frame untuk memperlambat kecepatan animasi
      loop: true, // Mengatur apakah animasi berulang atau tidak
      imageSrc: "./img/character/jump.png", // Sumber gambar untuk animasi loncat ke kanan
    },
    jumpLeft: {
      frameRate: 1, // Kecepatan frame animasi loncat ke kiri
      frameBuffer: 1, // Buffer frame untuk memperlambat kecepatan animasi
      loop: true, // Mengatur apakah animasi berulang atau tidak
      imageSrc: "./img/character/jumpLeft.png", // Sumber gambar untuk animasi loncat ke kiri
    },
    fallRight: {
      frameRate: 1, // Kecepatan frame animasi jatuh ke kanan
      frameBuffer: 1, // Buffer frame untuk memperlambat kecepatan animasi
      loop: true, // Mengatur apakah animasi berulang atau tidak
      imageSrc: "./img/character/fall.png", // Sumber gambar untuk animasi jatuh ke kanan
    },
    fallLeft: {
      frameRate: 1, // Kecepatan frame animasi jatuh ke kiri
      frameBuffer: 1, // Buffer frame untuk memperlambat kecepatan animasi
      loop: true, // Mengatur apakah animasi berulang atau tidak
      imageSrc: "./img/character/fallLeft.png", // Sumber gambar untuk animasi jatuh ke kiri
    },
  },
});

let level = 1; // Mendeklarasikan variabel level dan menginisialisasinya dengan nilai 1

function updateLevelText() {
  const levelTextElement = document.getElementById("level-text"); // Mendapatkan elemen dengan id "level-text"
  levelTextElement.innerText = `Level: ${level}`; // Mengubah teks elemen tersebut menjadi "Level: [nilai level]"
}

// Memanggil fungsi updateLevelText setelah inisialisasi level
let levels = {
  1: {
    // Mendefinisikan level 1
    init: () => {
      // Fungsi untuk menginisialisasi level 1
      level = 1; // Mengatur nilai level menjadi 1
      updateLevelText(); // Memanggil fungsi untuk memperbarui teks level di layar
      player.hasWon = false; // Menetapkan bahwa pemain belum memenangkan level
      player.hasBeatLevel = false; // Menetapkan bahwa pemain belum mengalahkan level
      // Mengurai peta menjadi array 2 dimensi, menambahkan blok tumbukan
      parsedCollisions = collisionsLevel1.parse2D(); // Parsing peta kolisi level 1 menjadi array 2 dimensi
      collisionBlocks = parsedCollisions.createObjectsFrom2D(); // Membuat objek blok kolisi dari array 2 dimensi
      player.collisionBlocks = collisionBlocks; // Menetapkan blok kolisi kepada pemain

      // Level ini tidak memiliki perangkap
      player.trapBlocks = []; // Menetapkan array perangkap pemain menjadi array kosong

      // Deklarasi jam pasir
      hourglasses = []; // Mendeklarasikan array jam pasir kosong

      // Menetapkan posisi awal pemain
      player.position.x = 200; // Menetapkan posisi x pemain
      player.position.y = 400; // Menetapkan posisi y pemain

      // Menetapkan latar belakang
      background = new Sprite({
        // Membuat objek latar belakang
        position: {
          x: 0,
          y: 0,
        },
        imageSrc: "./img/Level1PixelAdventure.png", // Sumber gambar latar belakang level 1
      });

      // Menginisialisasi array perangkap
      traps = []; // Mendeklarasikan array perangkap kosong

      // Menetapkan interval untuk membuat panah
      arrowInterval = setInterval(createArrow, 1500); // Menetapkan interval untuk memanggil fungsi createArrow setiap 1500 milidetik
      createArrow(); // Memanggil fungsi untuk membuat panah pertama
      function createArrow() {
        // Fungsi untuk membuat panah
        traps.push(
          // Menambahkan objek panah ke dalam array perangkap
          new Arrow({
            imageSrc: "./img/traps/PixelArrow.png", // Sumber gambar panah
            frameRate: 1, // Kecepatan frame animasi panah
            startX: 920.0, // Posisi awal x panah
            startY: player.position.y, // Posisi awal y panah (sama dengan posisi pemain)
            animations: {}, // Animasi panah kosong karena hanya menggunakan gambar tunggal
          })
        );
      }

      // Deklarasi bendera kemenangan
      winFlags = [
        // Mendeklarasikan array bendera kemenangan
        new Sprite({
          position: {
            x: 825,
            y: 465 - 64,
          },
          imageSrc: "./img/roomwin.png", // Sumber gambar bendera kemenangan
          frameRate: 10, // Kecepatan frame animasi bendera kemenangan
          frameBuffer: 4, // Buffer frame untuk memperlambat kecepatan animasi
          loop: true, // Mengatur agar animasi berulang
          autoplay: true, // Mengatur agar animasi diputar secara otomatis
        }),
      ];
    },
  },

  // Level 2
  2: {
    // Mendefinisikan level 2
    init: () => {
      // Fungsi untuk menginisialisasi level 2
      level = 2; // Mengatur nilai level menjadi 2
      updateLevelText(); // Memanggil fungsi untuk memperbarui teks level di layar
      player.hasBeatLevel = false; // Menetapkan bahwa pemain belum mengalahkan level
      // Mengurai peta menjadi array 2 dimensi, menambahkan blok tumbukan
      parsedCollisions = collisionsLevel2.parse2D(); // Parsing peta kolisi level 2 menjadi array 2 dimensi
      collisionBlocks = parsedCollisions.createObjectsFrom2D(); // Membuat objek blok kolisi dari array 2 dimensi
      player.collisionBlocks = collisionBlocks; // Menetapkan blok kolisi kepada pemain

      // Mengurai perangkap (duri)
      parserTrapCollisions = spikesLevel2.parse2D(); // Parsing perangkap level 2 menjadi array 2 dimensi
      trapBlocks = parserTrapCollisions.createTrapsFrom2D(); // Membuat perangkap dari array 2 dimensi
      player.trapBlocks = trapBlocks; // Menetapkan perangkap kepada pemain

      // Menetapkan posisi awal pemain
      player.position.x = 200; // Menetapkan posisi x pemain
      player.position.y = 400; // Menetapkan posisi y pemain
      player.hasBeatLevel = false; // Menetapkan bahwa pemain belum mengalahkan level

      // Set flag level tidak mengandung anak panah
      levelContainsArrows = false; // Mengatur bahwa level tidak mengandung anak panah

      // Menghentikan interval pembuatan anak panah jika ada
      clearInterval(arrowInterval); // Menghentikan interval untuk membuat anak panah

      // Mengatur latar belakang
      // Sets the background
      background = new Sprite({
        // Membuat objek latar belakang
        position: {
          x: 0,
          y: 0,
        },
        imageSrc: "./img/Level2PixelAdventure.png", // Sumber gambar latar belakang level 2
      });

      // Tidak ada perangkap bergerak pada level ini
      traps = []; // Menetapkan array perangkap bergerak menjadi array kosong

      // Deklarasi jam pasir
      hourglasses = [
        // Mendeklarasikan array jam pasir
        new Sprite({
          position: { x: 700, y: 300 }, // Menetapkan posisi jam pasir
          imageSrc: "./img/objects/PixelHourglass.png", // Sumber gambar jam pasir
          frameRate: 1, // Kecepatan frame animasi jam pasir
          frameBuffer: 1, // Buffer frame untuk memperlambat kecepatan animasi
          loop: false, // Mengatur agar animasi tidak berulang
          autoplay: false, // Mengatur agar animasi tidak diputar secara otomatis
        }),
      ];

      // Deklarasi bendera kemenangan
      winFlags = [
        // Mendeklarasikan array bendera kemenangan
        new Sprite({
          position: {
            x: 830,
            y: 448 - 48,
          },
          imageSrc: "./img/roomwin.png", // Sumber gambar bendera kemenangan
          frameRate: 10, // Kecepatan frame animasi bendera kemenangan
          frameBuffer: 4, // Buffer frame untuk memperlambat kecepatan animasi
          loop: true, // Mengatur agar animasi berulang
          autoplay: true, // Mengatur agar animasi diputar secara otomatis
        }),
      ];
    },
  },

  // Level 3
  3: {
    // Mendefinisikan level 3
    init: () => {
      // Fungsi untuk menginisialisasi level 3
      level = 3; // Mengatur nilai level menjadi 3
      updateLevelText(); // Memanggil fungsi untuk memperbarui teks level di layar
      player.hasBeatLevel = false; // Menetapkan bahwa pemain belum mengalahkan level
      // Mengurai peta menjadi array 2 dimensi, menambahkan blok tumbukan
      parsedCollisions = collisionsLevel3.parse2D(); // Parsing peta kolisi level 3 menjadi array 2 dimensi
      collisionBlocks = parsedCollisions.createObjectsFrom2D(); // Membuat objek blok kolisi dari array 2 dimensi
      player.collisionBlocks = collisionBlocks; // Menetapkan blok kolisi kepada pemain

      // Mengurai perangkap (duri)
      parserTrapCollisions = spikesLevel3.parse2D(); // Parsing perangkap level 3 menjadi array 2 dimensi
      trapBlocks = parserTrapCollisions.createTrapsFrom2D(); // Membuat perangkap dari array 2 dimensi
      player.trapBlocks = trapBlocks; // Menetapkan perangkap kepada pemain

      // Deklarasi jam pasir
      hourglasses = [
        // Mendeklarasikan array jam pasir
        new Sprite({
          position: { x: 600, y: 400 }, // Menetapkan posisi jam pasir
          imageSrc: "./img/objects/PixelHourglass.png", // Sumber gambar jam pasir
          frameRate: 1, // Kecepatan frame animasi jam pasir
          frameBuffer: 1, // Buffer frame untuk memperlambat kecepatan animasi
          loop: false, // Mengatur agar animasi tidak berulang
          autoplay: false, // Mengatur agar animasi tidak diputar secara otomatis
        }),
      ];

      // Menetapkan posisi awal pemain
      player.position.x = 200; // Menetapkan posisi x pemain
      player.position.y = 400; // Menetapkan posisi y pemain
      player.hasBeatLevel = false; // Menetapkan bahwa pemain belum mengalahkan level

      // Mengatur latar belakang
      // Sets the background
      background = new Sprite({
        // Membuat objek latar belakang
        position: {
          x: 0,
          y: 0,
        },
        imageSrc: "./img/Level3PixelAdventureBrown.png", // Sumber gambar latar belakang level 3
      });

      // Menetapkan posisi bendera kemenangan
      winFlags = [
        // Mendeklarasikan array bendera kemenangan
        new Sprite({
          position: {
            x: 830,
            y: 448 - 48,
          },
          imageSrc: "./img/roomwin.png", // Sumber gambar bendera kemenangan
          frameRate: 10, // Kecepatan frame animasi bendera kemenangan
          frameBuffer: 4, // Buffer frame untuk memperlambat kecepatan animasi
          loop: true, // Mengatur agar animasi berulang
          autoplay: true, // Mengatur agar animasi diputar secara otomatis
        }),
      ];
    },
  },

  // Level 4
  4: {
    // Mendefinisikan level 4
    init: () => {
      // Fungsi untuk menginisialisasi level 4
      level = 4; // Mengatur nilai level menjadi 4
      updateLevelText(); // Memanggil fungsi untuk memperbarui teks level di layar
      player.hasBeatLevel = false; // Menetapkan bahwa pemain belum mengalahkan level
      // Mengurai peta menjadi array 2 dimensi, menambahkan blok tumbukan
      parsedCollisions = collisionsLevel4.parse2D(); // Parsing peta kolisi level 4 menjadi array 2 dimensi
      collisionBlocks = parsedCollisions.createObjectsFrom2D(); // Membuat objek blok kolisi dari array 2 dimensi
      player.collisionBlocks = collisionBlocks; // Menetapkan blok kolisi kepada pemain

      // Mengurai perangkap (duri)
      parserTrapCollisions = spikesLevel4.parse2D(); // Parsing perangkap level 4 menjadi array 2 dimensi
      trapBlocks = parserTrapCollisions.createTrapsFrom2D(); // Membuat perangkap dari array 2 dimensi
      player.trapBlocks = trapBlocks; // Menetapkan perangkap kepada pemain

      // Deklarasi jam pasir
      hourglasses = []; // Mendeklarasikan array jam pasir kosong

      // Menyiapkan perangkap bergerak, gergaji
      traps = [
        // Mendeklarasikan array perangkap bergerak
        new Saw({
          // Membuat objek gergaji
          imageSrc: "./img/traps/OnSaw.png", // Sumber gambar gergaji
          frameRate: 8, // Kecepatan frame animasi gergaji
          animations: {}, // Animasi gergaji (kosong dalam contoh ini)
          x: 418.0, // Posisi awal x gergaji
          y: 214.0, // Posisi awal y gergaji
        }),
      ];

      // Menetapkan posisi awal pemain
      player.position.x = 200; // Menetapkan posisi x pemain
      player.position.y = 400; // Menetapkan posisi y pemain
      player.hasBeatLevel = false; // Menetapkan bahwa pemain belum mengalahkan level

      // Mengatur latar belakang
      background = new Sprite({
        // Membuat objek latar belakang
        position: {
          x: 0,
          y: 0,
        },
        imageSrc: "./img/Level4PixelAdventurePink.png", // Sumber gambar latar belakang level 4
      });

      // Deklarasi bendera kemenangan
      winFlags = [
        // Mendeklarasikan array bendera kemenangan
        new Sprite({
          position: {
            x: 830,
            y: 448 - 48,
          },
          imageSrc: "./img/roomwin.png", // Sumber gambar bendera kemenangan
          frameRate: 10, // Kecepatan frame animasi bendera kemenangan
          frameBuffer: 4, // Buffer frame untuk memperlambat kecepatan animasi
          loop: true, // Mengatur agar animasi berulang
          autoplay: true, // Mengatur agar animasi diputar secara otomatis
        }),
      ];
    },
  },

  // Level 5
  5: {
    init: () => {
      // Set level ke 5
      level = 5;
      // Panggil fungsi ini untuk memperbarui teks level
      updateLevelText();
      // Inisialisasi flag telah menyelesaikan level menjadi false
      player.hasBeatLevel = false;
      // Parsing peta level 5 menjadi array 2D dan menambahkan blok-blok kolisi
      parsedCollisions = collisionsLevel5.parse2D();
      collisionBlocks = parsedCollisions.createObjectsFrom2D();
      player.collisionBlocks = collisionBlocks;

      // Inisialisasi array untuk blok jebakan
      player.trapBlocks = [];

      // Mendefinisikan jebakan mobile, gergaji
      traps = [
        new Saw({
          imageSrc: "./img/traps/onSaw.png",
          frameRate: 8,
          animations: {},
          x: 387.0,
          y: 214.0,
        }),
        new Saw({
          imageSrc: "./img/traps/onSaw.png",
          frameRate: 8,
          animations: {},
          x: 515.0,
          y: 214.0,
        }),
        new Saw({
          imageSrc: "./img/traps/onSaw.png",
          frameRate: 8,
          animations: {},
          x: 643.0,
          y: 214.0,
        }),
      ];

      // Deklarasi jam pasir
      hourglasses = [];

      // Set posisi awal pemain
      player.position.x = 200;
      player.position.y = 400;
      // Inisialisasi flag telah menyelesaikan level menjadi false
      player.hasBeatLevel = false;

      // Mengatur latar belakang
      background = new Sprite({
        position: {
          x: 0,
          y: 0,
        },
        imageSrc: "./img/Level5PixelAdventure.png",
      });

      // Set interval untuk membuat anak panah dengan interval 1500 milidetik
      arrowInterval = setInterval(createArrow, 4500);
      // Memanggil fungsi untuk membuat anak panah pertama
      createArrow();
      // Fungsi untuk membuat anak panah
      function createArrow() {
        // Membuat sebuah objek anak panah dan menambahkannya ke dalam array traps
        traps.push(
          new Arrow({
            imageSrc: "./img/traps/PixelArrow.png", // Sumber gambar anak panah
            frameRate: 1, // Tingkat frame anak panah
            startX: 920.0, // Posisi awal x anak panah
            startY: player.position.y, // Posisi awal y anak panah, diambil dari posisi y pemain
            animations: {}, // Animasi anak panah (kosong dalam contoh ini)
          })
        );
      }

      // Deklarasi bendera kemenangan
      winFlags = [
        new Sprite({
          position: {
            x: 875,
            y: 448 - 48,
          },
          imageSrc: "./img/roomwin.png",
          frameRate: 10,
          frameBuffer: 4,
          loop: true,
          autoplay: true,
        }),
      ];
    },
  },

  // Level 6
  6: {
    init: () => {
      level = 6;
      updateLevelText(); // Panggil fungsi ini untuk memperbarui teks level
      player.hasBeatLevel = false;
      // Parses map into 2D array, adds colllision blocks
      parsedCollisions = collisionsLevel6.parse2D();
      collisionBlocks = parsedCollisions.createObjectsFrom2D();
      player.collisionBlocks = collisionBlocks;

      // Parses traps (spikes)
      parserTrapCollisions = spikesLevel6.parse2D();
      trapBlocks = parserTrapCollisions.createTrapsFrom2D();
      player.trapBlocks = trapBlocks;

      // Sets up mobile traps, saws
      traps = [
        new Saw({
          imageSrc: "./img/traps/onSaw.png",
          frameRate: 8,
          animations: {},
          x: 387.0,
          y: 214.0,
        }),
        new Saw({
          imageSrc: "./img/traps/onSaw.png",
          frameRate: 8,
          animations: {},
          x: 515.0,
          y: 214.0,
        }),
        new Saw({
          imageSrc: "./img/traps/onSaw.png",
          frameRate: 8,
          animations: {},
          x: 643.0,
          y: 214.0,
        }),
        new Saw({
          imageSrc: "./img/traps/onSaw.png",
          frameRate: 8,
          animations: {},
          x: 755.0,
          y: 214.0,
        }),
      ];

      // Hourglass declaration
      hourglasses = [];

      // Initial position of player
      player.position.x = 150;
      player.position.y = 450;
      player.hasBeatLevel = false;

      // Set flag level tidak mengandung anak panah
      levelContainsArrows = false;
      // Menghentikan interval pembuatan anak panah jika ada
      clearInterval(arrowInterval);
      // Mengatur latar belakang

      background = new Sprite({
        position: {
          x: 0,
          y: 0,
        },
        imageSrc: "./img/Level6PixelAdventure.png",
      });

      // Win flag declaration
      winFlags = [
        new Sprite({
          position: {
            x: 875,
            y: 448 - 48,
          },
          imageSrc: "./img/roomwin.png",
          frameRate: 10,
          frameBuffer: 4,
          loop: true,
          autoplay: true,
        }),
      ];
    },
  },

  // Level 7
  7: {
    init: () => {
      level = 7;
      updateLevelText(); // Panggil fungsi ini untuk memperbarui teks level
      player.hasBeatLevel = false;
      // Parses map into 2D array, adds colllision blocks
      parsedCollisions = collisionsLevel7.parse2D();
      collisionBlocks = parsedCollisions.createObjectsFrom2D();
      player.collisionBlocks = collisionBlocks;

      // Parses traps (spikes)
      parserTrapCollisions = spikesLevel7.parse2D();
      trapBlocks = parserTrapCollisions.createTrapsFrom2D();
      player.trapBlocks = trapBlocks;

      // Sets up mobile traps, saws
      traps = [];

      // Hourglass declaration
      hourglasses = [];

      // Initial position of player
      player.position.x = 150;
      player.position.y = 450;
      player.hasBeatLevel = false;

      background = new Sprite({
        position: {
          x: 0,
          y: 0,
        },
        imageSrc: "./img/Level7PixelAdventure.png",
      });

      // Win flag declaration
      winFlags = [
        new Sprite({
          position: {
            x: 875,
            y: 448 - 48,
          },
          imageSrc: "./img/roomwin.png",
          frameRate: 10,
          frameBuffer: 4,
          loop: true,
          autoplay: true,
        }),
      ];
    },
  },

  // Level 8
  8: {
    // Mendefinisikan level 8
    init: () => {
      // Fungsi untuk menginisialisasi level 8
      level = 8; // Mengatur nilai level menjadi 8
      updateLevelText(); // Memanggil fungsi untuk memperbarui teks level di layar
      player.hasBeatLevel = false; // Menetapkan bahwa pemain belum mengalahkan level
      // Mengurai peta menjadi array 2 dimensi, menambahkan blok tumbukan
      parsedCollisions = collisionsLevel8.parse2D(); // Parsing peta kolisi level 8 menjadi array 2 dimensi
      collisionBlocks = parsedCollisions.createObjectsFrom2D(); // Membuat objek blok kolisi dari array 2 dimensi
      player.collisionBlocks = collisionBlocks; // Menetapkan blok kolisi kepada pemain
      player.trapBlocks = []; // Mendeklarasikan array blok jebakan kosong

      // Menetapkan posisi awal pemain
      player.position.x = 150; // Menetapkan posisi x pemain
      player.position.y = 450; // Menetapkan posisi y pemain

      // Mendefinisikan perangkap, bola berduri
      traps = [
        // Mendeklarasikan array perangkap
        new SpikeBall({
          // Membuat objek bola berduri
          imageSrc: "./img/traps/SpikedBall.png", // Sumber gambar bola berduri
          frameRate: 1, // Kecepatan frame animasi bola berduri
          x: 500.0, // Posisi awal x bola berduri
          y: 240.0, // Posisi awal y bola berduri
          chainLength: 200, // Panjang rantai bola berduri
          animations: {}, // Animasi bola berduri (kosong dalam contoh ini)
        }),
      ];

      // Mengatur latar belakang
      background = new Sprite({
        // Membuat objek latar belakang
        position: { x: 0, y: 0 }, // Posisi latar belakang
        imageSrc: "./img/Level8PixelAdventure.png", // Sumber gambar latar belakang level 8
      });

      // Deklarasi jam pasir
      hourglasses = []; // Mendeklarasikan array jam pasir kosong

      // Deklarasi bendera kemenangan
      winFlags = [
        // Mendeklarasikan array bendera kemenangan
        new Sprite({
          position: { x: 875, y: 448 - 48 }, // Posisi bendera kemenangan
          imageSrc: "./img/roomwin.png", // Sumber gambar bendera kemenangan
          frameRate: 10, // Kecepatan frame animasi bendera kemenangan
          frameBuffer: 4, // Buffer frame untuk memperlambat kecepatan animasi
          loop: true, // Mengatur agar animasi berulang
          autoplay: true, // Mengatur agar animasi diputar secara otomatis
        }),
      ];
    },
  },

  // Level 9
  9: {
    init: () => {
      level = 9;
      updateLevelText(); // Panggil fungsi ini untuk memperbarui teks level
      player.hasBeatLevel = false;
      parsedCollisions = collisionsLevel9.parse2D();
      collisionBlocks = parsedCollisions.createObjectsFrom2D();
      player.collisionBlocks = collisionBlocks;
      player.position.x = 150;
      player.position.y = 450;
      traps = [];
      levelContainsArrows = true;
      arrowInterval = setInterval(createArrow, 1500);
      function createArrow() {
        traps.push(
          new Arrow({
            imageSrc: "./img/traps/PixelArrow.png",
            frameRate: 1,
            startX: 920.0,
            startY: player.position.y,
            animations: {},
          })
        );
      }
      background = new Sprite({
        position: { x: 0, y: 0 },
        imageSrc: "./img/Level9PixelAdventure.png",
      });
      hourglasses = [];
      winFlags = [
        new Sprite({
          position: { x: 875, y: 448 - 48 },
          imageSrc: "./img/roomwin.png",
          frameRate: 10,
          frameBuffer: 4,
          loop: true,
          autoplay: true,
        }),
      ];
    },
  },

  // Level 10
  10: {
    // Mendefinisikan level 10
    init: () => {
      // Fungsi untuk menginisialisasi level 10
      level = 10; // Mengatur nilai level menjadi 10
      updateLevelText(); // Memanggil fungsi untuk memperbarui teks level di layar
      player.hasBeatLevel = false; // Menetapkan bahwa pemain belum mengalahkan level
      // Mengurai peta menjadi array 2 dimensi, menambahkan blok tumbukan
      parsedCollisions = collisionsLevel10.parse2D(); // Parsing peta kolisi level 10 menjadi array 2 dimensi
      collisionBlocks = parsedCollisions.createObjectsFrom2D(); // Membuat objek blok kolisi dari array 2 dimensi
      player.collisionBlocks = collisionBlocks; // Menetapkan blok kolisi kepada pemain

      // Menetapkan posisi awal pemain
      player.position.x = 150; // Menetapkan posisi x pemain
      player.position.y = 450; // Menetapkan posisi y pemain

      // Mendefinisikan perangkap, bola berduri
      traps = [
        // Mendeklarasikan array perangkap
        new SpikeBall({
          // Membuat objek bola berduri
          imageSrc: "./img/traps/SpikedBall.png", // Sumber gambar bola berduri
          frameRate: 1, // Kecepatan frame animasi bola berduri
          x: 500.0, // Posisi awal x bola berduri
          y: 255.0, // Posisi awal y bola berduri
          chainLength: 200, // Panjang rantai bola berduri
          animations: {}, // Animasi bola berduri (kosong dalam contoh ini)
        }),
        new SpikeBall({
          // Membuat objek bola berduri
          imageSrc: "./img/traps/SpikedBall.png", // Sumber gambar bola berduri
          frameRate: 1, // Kecepatan frame animasi bola berduri
          x: 650.0, // Posisi awal x bola berduri
          y: 365.0, // Posisi awal y bola berduri
          chainLength: 120, // Panjang rantai bola berduri
          animations: {}, // Animasi bola berduri (kosong dalam contoh ini)
        }),
        new SpikeBall({
          // Membuat objek bola berduri
          imageSrc: "./img/traps/SpikedBall.png", // Sumber gambar bola berduri
          frameRate: 1, // Kecepatan frame animasi bola berduri
          x: 350.0, // Posisi awal x bola berduri
          y: 365.0, // Posisi awal y bola berduri
          chainLength: 120, // Panjang rantai bola berduri
          animations: {}, // Animasi bola berduri (kosong dalam contoh ini)
        }),
      ];

      // Menetapkan bahwa level tidak mengandung anak panah
      levelContainsArrows = false;
      // Menghentikan interval pembuatan anak panah jika ada
      clearInterval(arrowInterval);

      // Mengatur latar belakang
      background = new Sprite({
        // Membuat objek latar belakang
        position: { x: 0, y: 0 }, // Posisi latar belakang
        imageSrc: "./img/Level10PixelAdventure.png", // Sumber gambar latar belakang level 10
      });

      // Deklarasi jam pasir
      hourglasses = []; // Mendeklarasikan array jam pasir kosong

      // Deklarasi bendera kemenangan
      winFlags = [
        // Mendeklarasikan array bendera kemenangan
        new Sprite({
          position: { x: 875, y: 448 - 48 }, // Posisi bendera kemenangan
          imageSrc: "./img/roomwin.png", // Sumber gambar bendera kemenangan
          frameRate: 10, // Kecepatan frame animasi bendera kemenangan
          frameBuffer: 4, // Buffer frame untuk memperlambat kecepatan animasi
          loop: true, // Mengatur agar animasi berulang
          autoplay: true, // Mengatur agar animasi diputar secara otomatis
        }),
      ];
    },
  },

  // Level 11
  11: {
    // Mendefinisikan level 11
    init: () => {
      // Fungsi untuk menginisialisasi level 11
      level = 11; // Mengatur nilai level menjadi 11
      updateLevelText(); // Memanggil fungsi untuk memperbarui teks level di layar
      player.hasBeatLevel = false; // Menetapkan bahwa pemain belum mengalahkan level
      // Mengurai peta menjadi array 2 dimensi, menambahkan blok tumbukan
      parsedCollisions = collisionsLevel11.parse2D(); // Parsing peta kolisi level 11 menjadi array 2 dimensi
      collisionBlocks = parsedCollisions.createObjectsFrom2D(); // Membuat objek blok kolisi dari array 2 dimensi
      player.collisionBlocks = collisionBlocks; // Menetapkan blok kolisi kepada pemain

      // Menetapkan posisi awal pemain
      player.position.x = 150; // Menetapkan posisi x pemain
      player.position.y = 450; // Menetapkan posisi y pemain

      // Mendefinisikan perangkap, gergaji
      traps = [
        // Mendeklarasikan array perangkap
        new Saw({
          // Membuat objek gergaji
          imageSrc: "./img/traps/onSaw.png", // Sumber gambar gergaji
          frameRate: 8, // Kecepatan frame animasi gergaji
          animations: {}, // Animasi gergaji (kosong dalam contoh ini)
          x: 387.0, // Posisi awal x gergaji
          y: 214.0, // Posisi awal y gergaji
        }),
        new Saw({
          // Membuat objek gergaji
          imageSrc: "./img/traps/onSaw.png", // Sumber gambar gergaji
          frameRate: 8, // Kecepatan frame animasi gergaji
          animations: {}, // Animasi gergaji (kosong dalam contoh ini)
          x: 643.0, // Posisi awal x gergaji
          y: 214.0, // Posisi awal y gergaji
        }),
        new Saw({
          // Membuat objek gergaji
          imageSrc: "./img/traps/onSaw.png", // Sumber gambar gergaji
          frameRate: 8, // Kecepatan frame animasi gergaji
          animations: {}, // Animasi gergaji (kosong dalam contoh ini)
          x: 755.0, // Posisi awal x gergaji
          y: 214.0, // Posisi awal y gergaji
        }),
      ];

      // Menetapkan bahwa level tidak mengandung anak panah
      levelContainsArrows = false;
      // Menghentikan interval pembuatan anak panah jika ada
      clearInterval(arrowInterval);
      // Mengatur latar belakang
      background = new Sprite({
        // Membuat objek latar belakang
        position: { x: 0, y: 0 }, // Posisi latar belakang
        imageSrc: "./img/Level11PixelAdventure.png", // Sumber gambar latar belakang level 11
      });

      // Deklarasi jam pasir
      hourglasses = [
        // Mendeklarasikan array jam pasir
        new Sprite({
          position: { x: 522, y: 210 }, // Posisi jam pasir
          imageSrc: "./img/objects/PixelHourglass.png", // Sumber gambar jam pasir
          frameRate: 1, // Kecepatan frame animasi jam pasir
          frameBuffer: 1, // Buffer frame untuk memperlambat kecepatan animasi
          loop: false, // Mengatur agar animasi tidak berulang
          autoplay: false, // Mengatur agar animasi tidak diputar secara otomatis
        }),
      ];

      // Deklarasi bendera kemenangan
      winFlags = [
        // Mendeklarasikan array bendera kemenangan
        new Sprite({
          position: { x: 875, y: 448 - 48 }, // Posisi bendera kemenangan
          imageSrc: "./img/roomwin.png", // Sumber gambar bendera kemenangan
          frameRate: 10, // Kecepatan frame animasi bendera kemenangan
          frameBuffer: 4, // Buffer frame untuk memperlambat kecepatan animasi
          loop: true, // Mengatur agar animasi berulang
          autoplay: true, // Mengatur agar animasi diputar secara otomatis
        }),
      ];
    },
  },

  // Level 12
  12: {
    // Mendefinisikan level 12
    init: () => {
      // Fungsi untuk menginisialisasi level 12
      level = 12; // Mengatur nilai level menjadi 12
      updateLevelText(); // Memanggil fungsi untuk memperbarui teks level di layar
      player.hasBeatLevel = false; // Menetapkan bahwa pemain belum mengalahkan level
      // Mengurai peta menjadi array 2 dimensi, menambahkan blok tumbukan
      parsedCollisions = collisionsLevel12.parse2D(); // Parsing peta kolisi level 12 menjadi array 2 dimensi
      collisionBlocks = parsedCollisions.createObjectsFrom2D(); // Membuat objek blok kolisi dari array 2 dimensi
      player.collisionBlocks = collisionBlocks; // Menetapkan blok kolisi kepada pemain

      // Menetapkan posisi awal pemain
      player.position.x = 150; // Menetapkan posisi x pemain
      player.position.y = 450; // Menetapkan posisi y pemain

      // Mengosongkan array perangkap
      traps = []; // Mendeklarasikan array perangkap kosong

      // Menetapkan bahwa level mengandung anak panah
      levelContainsArrows = true;
      // Mengatur interval untuk membuat anak panah dengan interval 1000 milidetik
      arrowInterval = setInterval(createArrow, 1000); // Menjalankan fungsi createArrow setiap 1000 milidetik
      // Fungsi untuk membuat anak panah
      function createArrow() {
        // Membuat objek anak panah dan menambahkannya ke dalam array traps
        traps.push(
          new Arrow({
            imageSrc: "./img/traps/PixelArrow.png", // Sumber gambar anak panah
            frameRate: 1, // Kecepatan frame anak panah
            startX: 920.0, // Posisi awal x anak panah
            startY: player.position.y, // Posisi awal y anak panah, diambil dari posisi y pemain
            animations: {}, // Animasi anak panah (kosong dalam contoh ini)
          })
        );
      }

      // Menetapkan bahwa pemain belum mengalahkan level
      player.hasBeatLevel = false;

      // Mengatur latar belakang
      background = new Sprite({
        // Membuat objek latar belakang
        position: { x: 0, y: 0 }, // Posisi latar belakang
        imageSrc: "./img/Level12PixelAdventure.png", // Sumber gambar latar belakang level 12
      });

      // Deklarasi jam pasir
      hourglasses = [
        // Mendeklarasikan array jam pasir
        new Sprite({
          position: { x: 522, y: 210 }, // Posisi jam pasir
          imageSrc: "./img/objects/PixelHourglass.png", // Sumber gambar jam pasir
          frameRate: 1, // Kecepatan frame animasi jam pasir
          frameBuffer: 1, // Buffer frame untuk memperlambat kecepatan animasi
          loop: false, // Mengatur agar animasi tidak berulang
          autoplay: false, // Mengatur agar animasi tidak diputar secara otomatis
        }),
      ];

      // Deklarasi bendera kemenangan
      winFlags = [
        // Mendeklarasikan array bendera kemenangan
        new Sprite({
          position: { x: 875, y: 448 - 48 }, // Posisi bendera kemenangan
          imageSrc: "./img/roomwin.png", // Sumber gambar bendera kemenangan
          frameRate: 10, // Kecepatan frame animasi bendera kemenangan
          frameBuffer: 4, // Buffer frame untuk memperlambat kecepatan animasi
          loop: true, // Mengatur agar animasi berulang
          autoplay: true, // Mengatur agar animasi diputar secara otomatis
        }),
      ];
    },
  },

  // Level 13, layar kemenangan
  13: {
    // Mendefinisikan level 13
    init: () => {
      // Fungsi untuk menginisialisasi level 13
      level = 13; // Mengatur nilai level menjadi 13
      updateLevelText(); // Memanggil fungsi untuk memperbarui teks level di layar
      levelContainsArrows = false; // Menetapkan bahwa level tidak mengandung anak panah
      clearInterval(arrowInterval); // Menghentikan interval pembuatan anak panah jika ada

      showWinScreen(); // Memanggil fungsi untuk menampilkan layar kemenangan
    },
  },
};

function showHistory() {
  let gameHistory = JSON.parse(localStorage.getItem("gameHistory")) || [];
  let historyList = document.getElementById("historyList");
  historyList.innerHTML = "";

  if (gameHistory.length === 0) {
    historyList.innerHTML = "<li>No game history available.</li>";
  } else {
    gameHistory.forEach((entry, index) => {
      let listItem = document.createElement("li");
      listItem.textContent = `Game ${index + 1}: Time - ${
        entry.time
      }s, Date - ${entry.date}`;
      historyList.appendChild(listItem);
    });
  }

  document.getElementById("history-screen").style.display = "block";
  document.getElementById("start-screen").style.display = "none";
}

// Melacak tombol mana yang ditekan membantu dalam pergerakan pemain
const keys = {
  // Objek yang menyimpan status setiap tombol yang ditekan
  w: {
    pressed: false, // Tombol 'w' tidak ditekan pada awalnya
  },
  a: {
    pressed: false, // Tombol 'a' tidak ditekan pada awalnya
  },
  d: {
    pressed: false, // Tombol 'd' tidak ditekan pada awalnya
  },
};

// Overlay saat beralih level
const overlay = {
  // Objek yang menyimpan opasitas lapisan overlay
  opacity: 0, // Opasitas overlay pada awalnya adalah 0 (tidak terlihat)
};

// Loop utama permainan
function animate() {
  // Fungsi untuk membuat animasi permainan terus berjalan
  window.requestAnimationFrame(animate); // Mengatur fungsi ini untuk dijalankan sebelum render berikutnya oleh browser

  // Menggambar blok kolisi
  background.draw(); // Menggambar latar belakang
  collisionBlocks.forEach((collisionBlock) => {
    // Loop untuk menggambar setiap blok kolisi
    collisionBlock.draw(); // Menggambar blok kolisi
  });

  // Menggambar bendera kemenangan
  winFlags.forEach((winFlag) => {
    // Loop untuk menggambar setiap bendera kemenangan
    winFlag.draw(); // Menggambar bendera kemenangan
  });

  // Menggambar jam pasir
  hourglasses.forEach((hourglass) => {
    // Loop untuk menggambar setiap jam pasir
    hourglass.draw(); // Menggambar jam pasir
  });

  // Memperbarui dan menggambar setiap perangkap yang bergerak
  traps.forEach((trap) => {
    // Loop untuk memperbarui setiap perangkap
    trap.update(); // Memperbarui perangkap
  });

  // Memeriksa input pengguna dan menanganinya
  player.handleInput(keys); // Menangani input pengguna

  // Menggambar sprite pemain
  player.draw(); // Menggambar sprite pemain

  // Memperbarui posisi pemain, hitbox, dll
  player.update(); // Memperbarui pemain

  // Memeriksa apakah pemain mencapai bendera untuk melanjutkan ke level berikutnya
  player.checkForWinFlag(winFlags[0], level, levels); // Memeriksa kemenangan pemain

  // Memeriksa tabrakan dengan perangkap bergerak
  if (player.hasWon == false) {
    // Jika pemain belum memenangkan permainan
    player.checkForCollisionWithMovingTraps(traps); // Memeriksa tabrakan dengan perangkap bergerak
  }

  // Memeriksa tabrakan dengan Jam Pasir
  player.checkForCollisionWithHourglass(hourglasses); // Memeriksa tabrakan dengan Jam Pasir

  // Mereset kanvas
  c.save(); // Menyimpan keadaan kanvas sebelum diubah
  c.globalAlpha = overlay.opacity; // Mengatur opasitas global kanvas
  c.fillStyle = "black"; // Mengatur warna isi kanvas
  c.fillRect(0, 0, canvas.width, canvas.height); // Menggambar persegi panjang hitam di seluruh kanvas
  c.restore(); // Mengembalikan keadaan kanvas ke sebelumnya

  // Menggambar waktu jika permainan tidak dijeda
  if (!isPaused) {
    // Jika permainan tidak sedang dijeda
    drawElapsedTime(); // Menggambar waktu yang telah berlalu
    drawPauseInstructions(); // Menggambar instruksi untuk menjeda permainan
  }
}

// Fungsi untuk memulai permainan saat tombol memulai permainan ditekan
function startGame() {
  // Fungsi untuk memulai permainan
  player.hasWon = false; // Menetapkan bahwa pemain belum menang
  // Memastikan layar terlihat
  gsap.to(overlay, {
    // Menggunakan GSAP (GreenSock Animation Platform) untuk mengatur opasitas lapisan overlay
    opacity: 0, // Mengatur opasitas menjadi 0 sehingga lapisan overlay tidak terlihat
  });
  // Memeriksa apakah pengguna memasukkan nama
  playerName = document.getElementById("playerName").value; // Mendapatkan nama pemain dari elemen dengan ID "playerName"
  if (!playerName) return alert("Please enter your name!"); // Jika nama tidak dimasukkan, munculkan pesan peringatan

  gameMusic.play(); // Memainkan musik permainan

  toggleScreen("start-screen", false); // Menyembunyikan layar awal permainan
  toggleScreen("canvas", true); // Menampilkan layar permainan (canvas)
  levels[level].init(); // Memulai level yang sedang aktif
  startTime = new Date(); // Menetapkan waktu mulai permainan
  totalTimePaused = 0; // Menetapkan total waktu permainan yang dijeda menjadi 0
  if (!gameHasStartedOnce) {
    // Jika permainan belum pernah dimulai sebelumnya
    animate(); // Memulai loop animasi permainan
    gameHasStartedOnce = true; // Menandai bahwa permainan telah dimulai sekali
  }
}

// Fungsi tombol untuk melanjutkan permainan
// Dipanggil oleh tombol lanjutkan di menu jeda
function resumeGame() {
  // Fungsi untuk melanjutkan permainan
  // Mendapatkan waktu ketika permainan dijeda dan mengurangi dari waktu mulai
  totalTimePaused = parseInt(new Date() / 1000) - totalTimePaused; // Menghitung total waktu permainan yang dijeda
  console.log("Game paused for: " + totalTimePaused + " seconds"); // Mencetak waktu permainan yang dijeda ke konsol
  toggleScreen("pause-screen", false); // Menyembunyikan layar jeda permainan
  toggleScreen("canvas", true); // Menampilkan layar permainan (canvas)
  isPaused = false; // Menetapkan bahwa permainan tidak sedang dijeda
  gameMusic.play(); // Memainkan musik permainan
}

// Fungsi tombol untuk mengulang permainan
// Dipanggil oleh tombol ulang permainan di index.html
function restartGame() {
  // Fungsi untuk mengulang permainan
  player.hasWon = false; // Menetapkan bahwa pemain belum menang
  gameMusic.play(); // Memainkan musik permainan
  gsap.to(overlay, {
    // Menggunakan GSAP (GreenSock Animation Platform) untuk mengatur opasitas lapisan overlay
    opacity: 0, // Mengatur opasitas menjadi 0 sehingga lapisan overlay tidak terlihat
  });
  startTime = new Date(); // Menetapkan waktu mulai permainan
  totalTimePaused = 0; // Menetapkan total waktu permainan yang dijeda menjadi 0
  level = 1; // Mengatur level kembali ke level 1
  isPaused = false; // Menetapkan bahwa permainan tidak sedang dijeda
  // Menyembunyikan layar awal permainan, layar kemenangan, layar jeda permainan, dan layar petunjuk cara bermain
  toggleScreen("start-screen", false);
  toggleScreen("win-screen", false);
  toggleScreen("pause-screen", false);
  toggleScreen("canvas", true); // Menampilkan layar permainan (canvas)
  toggleScreen("how-to-play", false); // Menyembunyikan layar petunjuk cara bermain

  levels[level].init(); // Memulai level yang sedang aktif
}

// Fungsi tombol untuk kembali ke menu utama
// Dipanggil oleh tombol kembali ke menu utama di menu jeda dan layar kemenangan
function goToStartScreen() {
  // Fungsi untuk kembali ke layar menu utama
  startTime = new Date(); // Menetapkan waktu mulai permainan
  totalTimePaused = 0; // Menetapkan total waktu permainan yang dijeda menjadi 0
  level = 1; // Mengatur level kembali ke level 1
  isPaused = false; // Menetapkan bahwa permainan tidak sedang dijeda
  // Menyembunyikan layar kemenangan, layar jeda permainan, layar permainan, dan layar petunjuk cara bermain
  toggleScreen("win-screen", false);
  toggleScreen("pause-screen", false);
  toggleScreen("canvas", false);
  toggleScreen("start-screen", true); // Menampilkan layar menu utama
  toggleScreen("how-to-play", false); // Menyembunyikan layar petunjuk cara bermain
  gameMusic.stop(); // Menghentikan musik permainan
}

// Pergi ke layar petunjuk cara bermain
// Dipanggil oleh tombol petunjuk cara bermain di menu utama
function goToInstructionsScreen() {
  // Fungsi untuk pergi ke layar petunjuk cara bermain
  // Menyembunyikan layar kemenangan, layar jeda permainan, layar permainan, dan layar menu utama
  toggleScreen("win-screen", false);
  toggleScreen("pause-screen", false);
  toggleScreen("canvas", false);
  toggleScreen("start-screen", false);
  toggleScreen("how-to-play", true); // Menampilkan layar petunjuk cara bermain
}

// Fungsi untuk menjeda permainan (tombol Esc)
function pauseGame() {
  // Fungsi untuk menjeda permainan
  isPaused = true; // Menetapkan bahwa permainan sedang dijeda
  // Mendapatkan waktu ketika permainan dijeda
  totalTimePaused = parseInt(new Date() / 1000); // Menghitung total waktu permainan yang dijeda
  // Menyembunyikan layar menu utama, layar permainan, dan layar petunjuk cara bermain
  toggleScreen("start-screen", false);
  toggleScreen("canvas", false);
  toggleScreen("pause-screen", true); // Menampilkan layar jeda permainan
  toggleScreen("how-to-play", false); // Menyembunyikan layar petunjuk cara bermain
  gameMusic.stop(); // Menghentikan musik permainan
}

// Mengganti tampilan layar antara ditampilkan dan tidak ditampilkan
function toggleScreen(id, toggle) {
  // Fungsi untuk mengganti tampilan layar
  let element = document.getElementById(id); // Mendapatkan elemen dengan ID tertentu
  let display = toggle ? "block" : "none"; // Menetapkan nilai tampilan sesuai dengan nilai toggle
  element.style.display = display; // Mengatur tampilan elemen
}

// Fungsi Timer
// Dipanggil oleh fungsi animasi utama untuk menampilkan waktu
function drawElapsedTime() {
  // Fungsi untuk menggambar waktu yang sudah berlalu
  elapsed = // Menghitung waktu yang sudah berlalu
    parseInt((new Date() - startTime) / 1000) - // Waktu sejak mulai permainan dikurangi waktu yang dijeda
    totalTimePaused - // Waktu yang dijeda
    grabedHourglasses * 10; // Pengurangan waktu karena pengambilan jam pasir (10 detik per jam pasir)
  c.save(); // Menyimpan konteks gambar saat ini
  c.beginPath(); // Mulai jalur gambar baru
  c.fillStyle = "white"; // Mengatur warna isi teks menjadi putih
  c.font = "10px Arial, sans-serif"; // Mengatur ukuran dan jenis font teks
  // Menetapkan koordinat x dan y untuk menempatkan timer di pojok kiri atas
  var margin = 100;
  c.fillText(elapsed + " detik", 10, 40); // Menampilkan teks waktu yang sudah berlalu
  c.restore(); // Mengembalikan konteks gambar sebelumnya
}

// Fungsi untuk menggambar instruksi jeda permainan
function drawPauseInstructions() {
  // Fungsi untuk menggambar instruksi jeda permainan
  c.save(); // Menyimpan konteks gambar saat ini
  c.beginPath(); // Mulai jalur gambar baru
  c.fillStyle = "white"; // Mengatur warna isi teks menjadi putih
  c.font = "10px Arial, sans-serif"; // Mengatur ukuran dan jenis font teks
  c.fillText("Tekan tombol ESC untuk menjeda permainan", 10, 25); // Menampilkan teks instruksi
  c.restore(); // Mengembalikan konteks gambar sebelumnya
}

// Dipanggil ketika permainan selesai
// Dipanggil oleh level 13 ketika level 12 telah diselesaikan
function drawFinalScore() {
  // Fungsi untuk menggambar skor akhir
  // Menetapkan skor akhir hanya sekali
  if (finalTime == null) {
    finalTime = parseInt((new Date() - startTime) / 1000); // Menghitung waktu total permainan
  }
  c.save(); // Menyimpan konteks gambar saat ini
  c.beginPath(); // Mulai jalur gambar baru
  c.fillStyle = "red"; // Mengatur warna isi teks menjadi merah
  c.font = "30px Verdana"; // Mengatur ukuran dan jenis font teks
  c.fillText("Game Over: " + finalTime + " detik", 50, 35); // Menampilkan teks skor akhir
  c.restore(); // Mengembalikan konteks gambar sebelumnya
}

// Fungsi layar kemenangan
// Dipanggil ketika permainan selesai
function showWinScreen() {
  // Fungsi untuk menampilkan layar kemenangan
  gameMusic.stop(); // Menghentikan musik permainan
  winSound.play(); // Memainkan suara kemenangan
  player.hasWon = true; // Menandai bahwa pemain telah menang

  // Mendapatkan waktu akhir permainan
  finalTime = parseInt((new Date() - startTime) / 1000) - totalTimePaused;

  // Menambahkan pemain ke papan peringkat
  addPlayerToLeaderboard(finalTime);

  // Menyimpan skor ke papan peringkat
  localStorage.setItem(playerName, finalTime);

  // Menampilkan waktu akhir
  document.getElementById("timeElapsedSpan").innerHTML = finalTime;

  // Menyembunyikan layar permainan dan menampilkan layar kemenangan
  toggleScreen("canvas", false);
  toggleScreen("win-screen", true);

  // Mendapatkan 10 skor teratas dari basis data
  const query = leaderboardRef.orderBy("Score").limit(10);

  // Menampilkan papan peringkat dari Firebase
  query.get().then((scores) => {
    scores.forEach((doc) => {
      data = doc.data();
      node = document.createElement("li");
      textnode = document.createTextNode(
        data.Name + ": " + data.Score + " detik"
      );
      node.appendChild(textnode);
      document.getElementById("leaderboardList").appendChild(node);
    });
  });
}

// Menambahkan pemain ke papan peringkat yang disimpan di Firebase
// Dipanggil oleh fungsi showWinScreen
function addPlayerToLeaderboard(finalTime) {
  // Fungsi untuk menambahkan pemain ke papan peringkat
  db.collection("Leaderboard").add({
    // Menambahkan data pemain ke koleksi "Leaderboard"
    Name: playerName, // Nama pemain
    Score: finalTime, // Skor pemain
  });
}

// Menambahkan suara
// Dipanggil oleh berbagai suara yang dibuat dalam permainan
function sound(src) {
  // Fungsi untuk membuat objek suara
  this.sound = document.createElement("audio"); // Membuat elemen audio baru
  this.sound.src = src; // Mengatur sumber suara
  this.sound.setAttribute("preload", "auto"); // Mengatur atribut preload
  this.sound.setAttribute("controls", "none"); // Mengatur atribut controls
  this.sound.style.display = "none"; // Menyembunyikan elemen audio
  document.body.appendChild(this.sound); // Menambahkan elemen audio ke dalam dokumen HTML
  this.play = function () {
    // Metode untuk memainkan suara
    this.sound.play(); // Memainkan suara
  };
  this.stop = function () {
    // Metode untuk menghentikan suara
    this.sound.pause(); // Menghentikan suara
  };
}

// Menambahkan event listener untuk tombol kembali ke menu utama
document.addEventListener("DOMContentLoaded", function () {
  // Menunggu dokumen dimuat
  document
    .getElementById("mainMenuButton")
    .addEventListener("click", goToStartScreen); // Menambahkan event listener untuk tombol menu utama
});

// Fungsi untuk kembali ke layar utama
function goToStartScreen() {
  // Fungsi untuk kembali ke layar utama
  location.reload(); // Memuat ulang halaman
}
