package services

import (
	"errors"

	"github.com/saepudinasep/silapor-go-react/be/middleware"
	"github.com/saepudinasep/silapor-go-react/be/models"
	"github.com/saepudinasep/silapor-go-react/be/repositories"
)

// PetugasService defines the business logic contract for managing Petugas
// accounts. Intended to be used from admin-only endpoints.
type PetugasService interface {
	Create(nama, username, password, telp, level string) (*models.Petugas, error)
	GetAll() ([]models.Petugas, error)
	GetByID(id uint) (*models.Petugas, error)
	Update(id uint, nama, telp, level string) (*models.Petugas, error)
	ResetPassword(id uint, newPassword string) error
	Delete(id uint) error
}

type petugasService struct {
	repo repositories.PetugasRepository
}

// NewPetugasService builds a PetugasService.
func NewPetugasService(repo repositories.PetugasRepository) PetugasService {
	return &petugasService{repo: repo}
}

func (s *petugasService) Create(nama, username, password, telp, level string) (*models.Petugas, error) {
	if existing, _ := s.repo.FindByUsername(username); existing != nil {
		return nil, errors.New("username sudah digunakan")
	}
	if level != "admin" && level != "petugas" {
		level = "petugas"
	}

	hashed, err := middleware.HashPassword(password)
	if err != nil {
		return nil, err
	}

	p := &models.Petugas{
		NamaPetugas: nama,
		Username:    username,
		Password:    hashed,
		Telp:        telp,
		Level:       level,
	}
	if err := s.repo.Create(p); err != nil {
		return nil, err
	}
	return p, nil
}

func (s *petugasService) GetAll() ([]models.Petugas, error) {
	return s.repo.FindAll()
}

func (s *petugasService) GetByID(id uint) (*models.Petugas, error) {
	return s.repo.FindByID(id)
}

func (s *petugasService) Update(id uint, nama, telp, level string) (*models.Petugas, error) {
	p, err := s.repo.FindByID(id)
	if err != nil {
		return nil, err
	}
	if nama != "" {
		p.NamaPetugas = nama
	}
	if telp != "" {
		p.Telp = telp
	}
	if level == "admin" || level == "petugas" {
		p.Level = level
	}
	if err := s.repo.Update(p); err != nil {
		return nil, err
	}
	return p, nil
}

func (s *petugasService) ResetPassword(id uint, newPassword string) error {
	p, err := s.repo.FindByID(id)
	if err != nil {
		return err
	}
	hashed, err := middleware.HashPassword(newPassword)
	if err != nil {
		return err
	}
	p.Password = hashed
	return s.repo.Update(p)
}

func (s *petugasService) Delete(id uint) error {
	return s.repo.Delete(id)
}
