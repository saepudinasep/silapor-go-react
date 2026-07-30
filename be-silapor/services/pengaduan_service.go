package services

import (
	"errors"
	"time"

	"github.com/saepudinasep/silapor-go-react/be/models"
	"github.com/saepudinasep/silapor-go-react/be/repositories"
)

// PengaduanService defines the business logic contract for Pengaduan.
type PengaduanService interface {
	Create(nik, isiLaporan, foto string) (*models.Pengaduan, error)
	GetAll(status, startDate, endDate string) ([]models.Pengaduan, error)
	GetByNIK(nik string) ([]models.Pengaduan, error)
	GetByID(id uint) (*models.Pengaduan, error)
	UpdateStatus(id uint, status string) (*models.Pengaduan, error)
	Delete(id uint) error
	Summary() (map[string]int64, error)
}

type pengaduanService struct {
	repo repositories.PengaduanRepository
}

// NewPengaduanService builds a PengaduanService.
func NewPengaduanService(repo repositories.PengaduanRepository) PengaduanService {
	return &pengaduanService{repo: repo}
}

func (s *pengaduanService) Create(nik, isiLaporan, foto string) (*models.Pengaduan, error) {
	if isiLaporan == "" {
		return nil, errors.New("isi laporan tidak boleh kosong")
	}

	p := &models.Pengaduan{
		NIK:          nik,
		TglPengaduan: time.Now(),
		IsiLaporan:   isiLaporan,
		Foto:         foto,
		Status:       "baru",
	}

	if err := s.repo.Create(p); err != nil {
		return nil, FriendlyDBError("create pengaduan", err)
	}
	return p, nil
}

func (s *pengaduanService) GetAll(status, startDate, endDate string) ([]models.Pengaduan, error) {
	return s.repo.FindAll(status, startDate, endDate)
}

func (s *pengaduanService) GetByNIK(nik string) ([]models.Pengaduan, error) {
	return s.repo.FindByNIK(nik)
}

func (s *pengaduanService) GetByID(id uint) (*models.Pengaduan, error) {
	return s.repo.FindByID(id)
}

func (s *pengaduanService) UpdateStatus(id uint, status string) (*models.Pengaduan, error) {
	if status != "baru" && status != "proses" && status != "selesai" {
		return nil, errors.New("status tidak valid")
	}

	p, err := s.repo.FindByID(id)
	if err != nil {
		return nil, errors.New("pengaduan tidak ditemukan")
	}
	p.Status = status

	if err := s.repo.Update(p); err != nil {
		return nil, FriendlyDBError("update status pengaduan", err)
	}
	return p, nil
}

func (s *pengaduanService) Delete(id uint) error {
	if err := s.repo.Delete(id); err != nil {
		return FriendlyDBError("delete pengaduan", err)
	}
	return nil
}

func (s *pengaduanService) Summary() (map[string]int64, error) {
	return s.repo.CountByStatus()
}
