package models

import "time"

// Tanggapan represents a Petugas's response to a specific Pengaduan.
type Tanggapan struct {
	IDTanggapan  uint      `gorm:"column:id_tanggapan;primaryKey;autoIncrement" json:"id_tanggapan"`
	IDPengaduan  uint      `gorm:"column:id_pengaduan;not null;index" json:"id_pengaduan"`
	IDPetugas    uint      `gorm:"column:id_petugas;not null" json:"id_petugas"`
	Petugas      Petugas   `gorm:"foreignKey:IDPetugas" json:"petugas,omitempty"`
	TglTanggapan time.Time `gorm:"not null" json:"tgl_tanggapan"`
	Isi          string    `gorm:"column:tanggapan;type:text;not null" json:"tanggapan"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
}

func (Tanggapan) TableName() string {
	return "tanggapan"
}
