package models

import "time"

// Pengaduan represents a citizen complaint/report submitted by Masyarakat.
type Pengaduan struct {
	IDPengaduan  uint        `gorm:"column:id_pengaduan;primaryKey;autoIncrement" json:"id_pengaduan"`
	NIK          string      `gorm:"column:nik;type:char(16);not null;index" json:"nik"`
	Masyarakat   Masyarakat  `gorm:"foreignKey:NIK;references:NIK" json:"masyarakat,omitempty"`
	TglPengaduan time.Time   `gorm:"not null" json:"tgl_pengaduan"`
	IsiLaporan   string      `gorm:"type:text;not null" json:"isi_laporan"`
	Foto         string      `gorm:"type:varchar(255)" json:"foto"`
	Status       string      `gorm:"type:enum('baru','proses','selesai');not null;default:'baru'" json:"status"`
	Tanggapan    []Tanggapan `gorm:"foreignKey:IDPengaduan" json:"tanggapan,omitempty"`
	CreatedAt    time.Time   `json:"created_at"`
	UpdatedAt    time.Time   `json:"updated_at"`
}

func (Pengaduan) TableName() string {
	return "pengaduan"
}
