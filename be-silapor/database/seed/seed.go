package main

// Jalankan seeder ini dengan:
//   go run database/seed/seed.go
//
// Membuat akun admin awal berdasarkan SEED_ADMIN_USERNAME / SEED_ADMIN_PASSWORD
// yang didefinisikan di file .env (fallback ke default jika tidak diset).

import (
	"log"

	"github.com/saepudinasep/silapor-go-react/be-silapor/config"
	"github.com/saepudinasep/silapor-go-react/be-silapor/middleware"
	"github.com/saepudinasep/silapor-go-react/be-silapor/models"
)

func main() {
	cfg := config.LoadConfig()
	db := config.ConnectDB(cfg)

	var count int64
	db.Model(&models.Petugas{}).Where("username = ?", cfg.SeedAdminUsername).Count(&count)
	if count > 0 {
		log.Printf("akun admin '%s' sudah ada, seeding dilewati\n", cfg.SeedAdminUsername)
		return
	}

	hashed, err := middleware.HashPassword(cfg.SeedAdminPassword)
	if err != nil {
		log.Fatalf("gagal hash password seeder: %v", err)
	}

	admin := models.Petugas{
		NamaPetugas: "Administrator",
		Username:    cfg.SeedAdminUsername,
		Password:    hashed,
		Level:       "admin",
	}

	if err := db.Create(&admin).Error; err != nil {
		log.Fatalf("gagal membuat akun admin: %v", err)
	}

	log.Printf("akun admin berhasil dibuat: %s / %s\n", cfg.SeedAdminUsername, cfg.SeedAdminPassword)
}
