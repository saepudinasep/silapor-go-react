package services

import (
	"errors"
	"log"
	"strings"
)

// FriendlyDBError mengubah error mentah dari database (driver MySQL/GORM)
// menjadi pesan yang aman & mudah dipahami pengguna, tanpa membocorkan
// detail teknis seperti nama tabel, constraint, atau struktur skema.
//
// Error asli tetap dicatat ke log server untuk keperluan debugging,
// sedangkan yang dikembalikan ke pemanggil (lalu ke response API) adalah
// pesan yang sudah disaring.
func FriendlyDBError(context string, err error) error {
	if err == nil {
		return nil
	}

	// catat detail asli di log server, JANGAN dikirim ke client
	log.Printf("[DB ERROR] %s: %v", context, err)

	msg := strings.ToLower(err.Error())

	switch {
	case strings.Contains(msg, "duplicate entry"):
		return errors.New("data sudah terdaftar, silakan gunakan data lain")
	case strings.Contains(msg, "foreign key constraint"):
		return errors.New("data tidak dapat disimpan karena terkait data lain yang belum sesuai, silakan hubungi admin")
	case strings.Contains(msg, "record not found"):
		return errors.New("data tidak ditemukan")
	case strings.Contains(msg, "data too long"):
		return errors.New("salah satu isian terlalu panjang, silakan periksa kembali")
	case strings.Contains(msg, "connection refused"), strings.Contains(msg, "connect: "):
		return errors.New("tidak dapat terhubung ke server, silakan coba lagi nanti")
	default:
		return errors.New("terjadi kesalahan pada server, silakan coba lagi nanti")
	}
}
