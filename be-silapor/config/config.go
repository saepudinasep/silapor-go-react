package config

import (
	"log"
	"os"
	"strconv"

	"github.com/joho/godotenv"
)

type Config struct {
	AppName string
	AppPort string
	AppEnv  string

	DBHost     string
	DBPort     string
	DBUser     string
	DBPassword string
	DBName     string
	DBCharset  string

	JWTSecret       string
	JWTExpiresHours int

	SeedAdminEmail    string
	SeedAdminPassword string
}

var Cfg *Config

func LoadConfig() *Config {
	if err := godotenv.Load(); err != nil {
		log.Println("no .env file found, relying on system environment variables")
	}

	expiresHours, err := strconv.Atoi(os.Getenv("JWT_EXPIRES_HOURS"))
	if err != nil {
		expiresHours = 24 // default to 24 hours if not set or invalid
	}

	Cfg = &Config{
		AppName: os.Getenv("APP_NAME"),
		AppPort: os.Getenv("APP_PORT"),
		AppEnv:  os.Getenv("APP_ENV"),

		DBHost:     os.Getenv("DB_HOST"),
		DBPort:     os.Getenv("DB_PORT"),
		DBUser:     os.Getenv("DB_USER"),
		DBPassword: os.Getenv("DB_PASSWORD"),
		DBName:     os.Getenv("DB_NAME"),
		DBCharset:  os.Getenv("DB_CHARSET"),

		JWTSecret:       os.Getenv("JWT_SECRET"),
		JWTExpiresHours: expiresHours,

		SeedAdminEmail:    os.Getenv("SEED_ADMIN_EMAIL"),
		SeedAdminPassword: os.Getenv("SEED_ADMIN_PASSWORD"),
	}
	return Cfg
}
