//
// Kelas Utilitas
//
let blockSize = 16;
let rowSize = 64; // tile dalam lebar
Array.prototype.parse2D = function () {
  const rows = [];
  for (let i = 0; i < this.length; i += rowSize) {
    rows.push(this.slice(i, i + rowSize));
  }
  return rows;
};

// Digunakan untuk blok tabrakan
// Dipanggil pada setiap level oleh inisiasi level untuk membuat peta tabrakan
// Hasilnya diatur ke pemain
Array.prototype.createObjectsFrom2D = function () {
  const objects = [];
  this.forEach((row, y) => {
    row.forEach((symbol, x) => {
      if (symbol === 542) {
        // dorong tabrakan baru ke dalam array collisionblocks
        objects.push(
          new CollisionBlock({
            position: {
              x: x * blockSize,
              y: y * blockSize,
            },
          })
        );
      }
    });
  });
  return objects;
};

// Digunakan untuk blok perangkap (duri)
// Hasilnya diatur ke pemain
Array.prototype.createTrapsFrom2D = function () {
  const objects = [];
  this.forEach((row, y) => {
    row.forEach((symbol, x) => {
      if (symbol === 491) {
        // dorong perangkap baru ke dalam array collisionblocks
        objects.push(
          new TrapBlock({
            position: {
              x: x * blockSize,
              y: y * blockSize,
            },
          })
        );
      }
    });
  });
  return objects;
};
