CREATE TABLE IF NOT EXISTS tanggapan (
    id_tanggapan INT AUTO_INCREMENT PRIMARY KEY,
    id_pengaduan INT NOT NULL,
    id_petugas INT NOT NULL,
    tgl_tanggapan DATETIME NOT NULL,
    tanggapan TEXT NOT NULL,
    created_at DATETIME NULL,
    updated_at DATETIME NULL,
    CONSTRAINT fk_tanggapan_pengaduan FOREIGN KEY (id_pengaduan) REFERENCES pengaduan(id_pengaduan) ON DELETE CASCADE,
    CONSTRAINT fk_tanggapan_petugas FOREIGN KEY (id_petugas) REFERENCES petugas(id_petugas) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
