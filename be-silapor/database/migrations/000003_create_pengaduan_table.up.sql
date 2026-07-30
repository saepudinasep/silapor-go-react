CREATE TABLE IF NOT EXISTS pengaduan (
    id_pengaduan INT AUTO_INCREMENT PRIMARY KEY,
    nik CHAR(16) NOT NULL,
    tgl_pengaduan DATETIME NOT NULL,
    isi_laporan TEXT NOT NULL,
    foto VARCHAR(255),
    status ENUM('baru','proses','selesai') NOT NULL DEFAULT 'baru',
    created_at DATETIME NULL,
    updated_at DATETIME NULL,
    CONSTRAINT fk_pengaduan_nik FOREIGN KEY (nik) REFERENCES masyarakat(nik) ON DELETE CASCADE,
    INDEX idx_pengaduan_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
