package services

import (
	"errors"
	"strconv"

	"github.com/saepudinasep/silapor-go-react/be/middleware"
	"github.com/saepudinasep/silapor-go-react/be/models"
	"github.com/saepudinasep/silapor-go-react/be/repositories"
)

// AuthService defines business logic for authentication of both
// Masyarakat and Petugas accounts.
type AuthService interface {
	RegisterMasyarakat(nik, nama, username, password, telp string) (*models.Masyarakat, error)
	LoginMasyarakat(username, password string) (string, *models.Masyarakat, error)
	LoginPetugas(username, password string) (string, *models.Petugas, error)
}

type authService struct {
	masyarakatRepo repositories.MasyarakatRepository
	petugasRepo    repositories.PetugasRepository
	jwtSecret      string
	jwtExpiresHr   int
}

// NewAuthService builds an AuthService.
func NewAuthService(mr repositories.MasyarakatRepository, pr repositories.PetugasRepository, jwtSecret string, jwtExpiresHr int) AuthService {
	return &authService{
		masyarakatRepo: mr,
		petugasRepo:    pr,
		jwtSecret:      jwtSecret,
		jwtExpiresHr:   jwtExpiresHr,
	}
}

func (s *authService) RegisterMasyarakat(nik, nama, username, password, telp string) (*models.Masyarakat, error) {
	if len(nik) != 16 {
		return nil, errors.New("NIK harus 16 digit")
	}

	if existing, _ := s.masyarakatRepo.FindByNIK(nik); existing != nil {
		return nil, errors.New("NIK sudah terdaftar")
	}
	if existing, _ := s.masyarakatRepo.FindByUsername(username); existing != nil {
		return nil, errors.New("username sudah digunakan")
	}

	hashed, err := middleware.HashPassword(password)
	if err != nil {
		return nil, err
	}

	m := &models.Masyarakat{
		NIK:      nik,
		Nama:     nama,
		Username: username,
		Password: hashed,
		Telp:     telp,
	}

	if err := s.masyarakatRepo.Create(m); err != nil {
		return nil, err
	}
	return m, nil
}

func (s *authService) LoginMasyarakat(username, password string) (string, *models.Masyarakat, error) {
	m, err := s.masyarakatRepo.FindByUsername(username)
	if err != nil {
		return "", nil, errors.New("username atau password salah")
	}
	if !middleware.CheckPasswordHash(password, m.Password) {
		return "", nil, errors.New("username atau password salah")
	}

	token, err := middleware.GenerateJWT(m.NIK, m.Nama, m.Username, "masyarakat", s.jwtSecret, s.jwtExpiresHr)
	if err != nil {
		return "", nil, err
	}
	return token, m, nil
}

func (s *authService) LoginPetugas(username, password string) (string, *models.Petugas, error) {
	p, err := s.petugasRepo.FindByUsername(username)
	if err != nil {
		return "", nil, errors.New("username atau password salah")
	}
	if !middleware.CheckPasswordHash(password, p.Password) {
		return "", nil, errors.New("username atau password salah")
	}

	subject := strconv.FormatUint(uint64(p.IDPetugas), 10)

	token, err := middleware.GenerateJWT(subject, p.NamaPetugas, p.Username, p.Level, s.jwtSecret, s.jwtExpiresHr)
	if err != nil {
		return "", nil, err
	}
	return token, p, nil
}
