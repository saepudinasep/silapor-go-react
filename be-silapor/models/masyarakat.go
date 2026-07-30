package models

import "time"

// Masyarakat represents a citizen account that can submit pengaduan (reports).
type Masyarakat struct {
	NIK       string    `gorm:"column:nik;type:char(16);primaryKey" json:"nik"`
	Nama      string    `gorm:"type:varchar(60);not null" json:"nama"`
	Username  string    `gorm:"type:varchar(25);uniqueIndex;not null" json:"username"`
	Password  string    `gorm:"type:varchar(255);not null" json:"-"`
	Telp      string    `gorm:"type:varchar(15)" json:"telp"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

func (Masyarakat) TableName() string {
	return "masyarakat"
}
