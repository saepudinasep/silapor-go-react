package main

import (
	"log"
	"os"

	"github.com/saepudinasep/silapor-go-react/be/config"
	"github.com/saepudinasep/silapor-go-react/be/routes"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/gofiber/fiber/v2/middleware/recover"
)

func main() {
	// load config dari .env
	cfg := config.LoadConfig()

	// pastikan folder upload ada
	if err := os.MkdirAll(cfg.UploadDir, 0755); err != nil {
		log.Fatalf("gagal membuat folder upload: %v", err)
	}

	// koneksi database
	db := config.ConnectDB(cfg)

	app := fiber.New(fiber.Config{
		AppName:   cfg.AppName,
		BodyLimit: cfg.MaxUploadMB * 1024 * 1024,
	})

	app.Use(recover.New())
	app.Use(logger.New())
	app.Use(cors.New())

	routes.SetupRoutes(app, db, cfg)

	log.Printf("%s berjalan di port %s\n", cfg.AppName, cfg.AppPort)
	if err := app.Listen(":" + cfg.AppPort); err != nil {
		log.Fatalf("gagal menjalankan server: %v", err)
	}
}
