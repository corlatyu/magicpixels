//
// Kelas TrapBlock. Digunakan untuk membuat blok perangkap dalam permainan.
//
class TrapBlock {
  /**
   * Konstruktor untuk membuat objek TrapBlock.
   * @param {Object} options - Opsi untuk objek TrapBlock.
   * @param {Object} options.position - Posisi blok perangkap.
   */
  constructor({ position }) {
    this.position = position;
    this.width = 16;
    this.height = 16;
  }

  /**
   * Metode untuk menggambar blok perangkap. (Metode ini dapat diperluas untuk menampilkan gambar atau animasi.)
   */
  draw() {
    // Kode untuk menggambar blok perangkap
  }
}
