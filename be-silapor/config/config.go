package config

import (
	"log"
	"os"
	"strconv"

	"github.com/joho/godotenv"
)

// Config holds all application configuration loaded from environment variables.
type Config struct {
	AppName string
	AppPort string
	AppEnv  string

	DBHost    string
	DBPort    string
	DBUser    string
	DBPass    string
	DBName    string
	DBCharset string

	// DBSSLMode: "disable" (default, untuk MySQL lokal), "skip-verify"
	// (enkripsi TLS aktif tapi tidak verifikasi sertifikat server — cukup
	// untuk Aiven dan sejenisnya), atau "verify-ca" (verifikasi penuh
	// pakai file CA certificate, lihat DBSSLCAPath).
	DBSSLMode   string
	DBSSLCAPath string

	JWTSecret       string
	JWTExpiresHours int

	UploadDir   string
	MaxUploadMB int

	SeedAdminUsername string
	SeedAdminPassword string
}

var Cfg *Config

// LoadConfig loads variables from .env (if present) into the process
// environment and returns a populated Config struct.
func LoadConfig() *Config {
	if err := godotenv.Load(); err != nil {
		log.Println("no .env file found, relying on system environment variables")
	}

	expiresHours, err := strconv.Atoi(getEnv("JWT_EXPIRES_HOURS", "24"))
	if err != nil {
		expiresHours = 24
	}

	maxUploadMB, err := strconv.Atoi(getEnv("MAX_UPLOAD_MB", "5"))
	if err != nil {
		maxUploadMB = 5
	}

	Cfg = &Config{
		AppName: getEnv("APP_NAME", "silapor-api"),
		AppPort: getEnv("APP_PORT", "8080"),
		AppEnv:  getEnv("APP_ENV", "local"),

		DBHost:    getEnv("DB_HOST", "127.0.0.1"),
		DBPort:    getEnv("DB_PORT", "3306"),
		DBUser:    getEnv("DB_USER", "root"),
		DBPass:    getEnv("DB_PASSWORD", ""),
		DBName:    getEnv("DB_NAME", "silapor"),
		DBCharset: getEnv("DB_CHARSET", "utf8mb4"),

		DBSSLMode:   getEnv("DB_SSL_MODE", "disable"),
		DBSSLCAPath: getEnv("DB_SSL_CA_PATH", ""),

		JWTSecret:       getEnv("JWT_SECRET", "secret"),
		JWTExpiresHours: expiresHours,

		UploadDir:   getEnv("UPLOAD_DIR", "uploads"),
		MaxUploadMB: maxUploadMB,

		SeedAdminUsername: getEnv("SEED_ADMIN_USERNAME", "admin"),
		SeedAdminPassword: getEnv("SEED_ADMIN_PASSWORD", "admin12345"),
	}

	return Cfg
}

func getEnv(key, fallback string) string {
	if value, ok := os.LookupEnv(key); ok && value != "" {
		return value
	}
	return fallback
}
