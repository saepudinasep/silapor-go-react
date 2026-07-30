package models

import "time"

// Petugas represents a staff/admin account that can respond to pengaduan.
type Petugas struct {
	IDPetugas   uint      `gorm:"column:id_petugas;primaryKey;autoIncrement" json:"id_petugas"`
	NamaPetugas string    `gorm:"type:varchar(60);not null" json:"nama_petugas"`
	Username    string    `gorm:"type:varchar(25);uniqueIndex;not null" json:"username"`
	Password    string    `gorm:"type:varchar(255);not null" json:"-"`
	Telp        string    `gorm:"type:varchar(15)" json:"telp"`
	Level       string    `gorm:"type:enum('admin','petugas');not null;default:'petugas'" json:"level"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

func (Petugas) TableName() string {
	return "petugas"
}
