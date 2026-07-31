package config

import (
	"crypto/tls"
	"crypto/x509"
	"fmt"
	"log"
	"os"
	"time"

	"github.com/go-sql-driver/mysql"
	gormmysql "gorm.io/driver/mysql"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

// DB is the shared, global database connection used across the app.
var DB *gorm.DB

// ConnectDB opens a connection to MySQL using the loaded Config and
// stores it in the package-level DB variable. Supports plain connections
// (local MySQL) as well as TLS-required providers like Aiven, via
// cfg.DBSSLMode ("disable" | "skip-verify" | "verify-ca").
func ConnectDB(cfg *Config) *gorm.DB {
	tlsParam := buildTLSParam(cfg)

	dsn := fmt.Sprintf(
		"%s:%s@tcp(%s:%s)/%s?charset=%s&parseTime=True&loc=Local%s",
		cfg.DBUser, cfg.DBPass, cfg.DBHost, cfg.DBPort, cfg.DBName, cfg.DBCharset, tlsParam,
	)

	gormLogLevel := logger.Silent
	if cfg.AppEnv == "local" {
		gormLogLevel = logger.Info
	}

	db, err := gorm.Open(gormmysql.Open(dsn), &gorm.Config{
		Logger: logger.Default.LogMode(gormLogLevel),
	})
	if err != nil {
		log.Fatalf("failed to connect to database: %v", err)
	}

	sqlDB, err := db.DB()
	if err != nil {
		log.Fatalf("failed to get generic database object: %v", err)
	}
	sqlDB.SetMaxIdleConns(10)
	sqlDB.SetMaxOpenConns(100)
	sqlDB.SetConnMaxLifetime(time.Hour)

	DB = db
	log.Println("database connected successfully")
	return db
}

// buildTLSParam menyiapkan parameter "&tls=..." pada DSN sesuai DBSSLMode.
// Untuk "verify-ca", CA certificate didaftarkan ke driver MySQL dengan nama
// custom "aiven" agar hanya server dengan sertifikat yang cocok yang
// dipercaya (proteksi man-in-the-middle penuh).
func buildTLSParam(cfg *Config) string {
	switch cfg.DBSSLMode {
	case "skip-verify":
		return "&tls=skip-verify"

	case "verify-ca":
		if cfg.DBSSLCAPath == "" {
			log.Fatal("DB_SSL_CA_PATH wajib diisi ketika DB_SSL_MODE=verify-ca")
		}
		pem, err := os.ReadFile(cfg.DBSSLCAPath)
		if err != nil {
			log.Fatalf("gagal membaca CA certificate di %s: %v", cfg.DBSSLCAPath, err)
		}
		rootCertPool := x509.NewCertPool()
		if ok := rootCertPool.AppendCertsFromPEM(pem); !ok {
			log.Fatal("gagal parsing CA certificate, pastikan file .pem valid")
		}
		if err := mysql.RegisterTLSConfig("aiven", &tls.Config{RootCAs: rootCertPool}); err != nil {
			log.Fatalf("gagal mendaftarkan TLS config: %v", err)
		}
		return "&tls=aiven"

	default: // "disable" — koneksi biasa tanpa TLS, untuk MySQL lokal
		return ""
	}
}
