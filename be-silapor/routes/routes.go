package routes

import (
	"github.com/saepudinasep/silapor-go-react/be/config"
	"github.com/saepudinasep/silapor-go-react/be/controllers"
	"github.com/saepudinasep/silapor-go-react/be/middleware"
	"github.com/saepudinasep/silapor-go-react/be/repositories"
	"github.com/saepudinasep/silapor-go-react/be/services"

	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
)

// SetupRoutes wires repositories -> services -> controllers and registers
// all API endpoints on the given Fiber app.
func SetupRoutes(app *fiber.App, db *gorm.DB, cfg *config.Config) {
	// repositories
	masyarakatRepo := repositories.NewMasyarakatRepository(db)
	petugasRepo := repositories.NewPetugasRepository(db)
	pengaduanRepo := repositories.NewPengaduanRepository(db)
	tanggapanRepo := repositories.NewTanggapanRepository(db)

	// services
	authService := services.NewAuthService(masyarakatRepo, petugasRepo, cfg.JWTSecret, cfg.JWTExpiresHours)
	pengaduanService := services.NewPengaduanService(pengaduanRepo)
	tanggapanService := services.NewTanggapanService(tanggapanRepo, pengaduanRepo)
	petugasService := services.NewPetugasService(petugasRepo)

	// controllers
	authController := controllers.NewAuthController(authService)
	pengaduanController := controllers.NewPengaduanController(pengaduanService, cfg.UploadDir)
	tanggapanController := controllers.NewTanggapanController(tanggapanService)
	petugasController := controllers.NewPetugasController(petugasService)

	// health check
	app.Get("/health", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{"success": true, "message": "SiLapor API is healthy"})
	})

	// serve uploaded photos statically
	app.Static("/uploads", cfg.UploadDir)

	api := app.Group("/api/v1")
	authMW := middleware.IsAuth(cfg.JWTSecret)

	// ---------------- AUTH (public) ----------------
	auth := api.Group("/auth")
	auth.Post("/masyarakat/register", authController.RegisterMasyarakat)
	auth.Post("/masyarakat/login", authController.LoginMasyarakat)
	auth.Post("/petugas/login", authController.LoginPetugas)

	// ---------------- PENGADUAN ----------------
	pengaduan := api.Group("/pengaduan", authMW)
	pengaduan.Post("/", middleware.IsMasyarakat, pengaduanController.CreatePengaduan)
	pengaduan.Get("/saya", middleware.IsMasyarakat, pengaduanController.GetMyPengaduan)
	pengaduan.Get("/summary", middleware.IsPetugas, pengaduanController.Summary)
	pengaduan.Get("/", middleware.IsPetugas, pengaduanController.GetAllPengaduan)
	pengaduan.Get("/:id", pengaduanController.GetPengaduan)
	pengaduan.Put("/:id/status", middleware.IsPetugas, pengaduanController.UpdateStatus)
	pengaduan.Delete("/:id", middleware.IsAdmin, pengaduanController.DeletePengaduan)

	// tanggapan nested under pengaduan
	pengaduan.Post("/:id/tanggapan", middleware.IsPetugas, tanggapanController.CreateTanggapan)
	pengaduan.Get("/:id/tanggapan", tanggapanController.GetTanggapanByPengaduan)

	// ---------------- TANGGAPAN (direct) ----------------
	tanggapan := api.Group("/tanggapan", authMW)
	tanggapan.Delete("/:id", middleware.IsAdmin, tanggapanController.DeleteTanggapan)

	// ---------------- PETUGAS MANAGEMENT (admin only) ----------------
	petugas := api.Group("/petugas", authMW, middleware.IsAdmin)
	petugas.Post("/", petugasController.CreatePetugas)
	petugas.Get("/", petugasController.GetAllPetugas)
	petugas.Put("/:id", petugasController.UpdatePetugas)
	petugas.Put("/:id/reset-password", petugasController.ResetPassword)
	petugas.Delete("/:id", petugasController.DeletePetugas)
}
