package services

import (
	"errors"
	"time"

	"github.com/saepudinasep/silapor-go-react/be/models"
	"github.com/saepudinasep/silapor-go-react/be/repositories"
)

// TanggapanService defines the business logic contract for Tanggapan.
type TanggapanService interface {
	Create(idPengaduan, idPetugas uint, isi string) (*models.Tanggapan, error)
	GetByPengaduanID(idPengaduan uint) ([]models.Tanggapan, error)
	Update(id uint, isi string) (*models.Tanggapan, error)
	Delete(id uint) error
}

type tanggapanService struct {
	tanggapanRepo repositories.TanggapanRepository
	pengaduanRepo repositories.PengaduanRepository
}

// NewTanggapanService builds a TanggapanService.
func NewTanggapanService(tr repositories.TanggapanRepository, pr repositories.PengaduanRepository) TanggapanService {
	return &tanggapanService{tanggapanRepo: tr, pengaduanRepo: pr}
}

func (s *tanggapanService) Create(idPengaduan, idPetugas uint, isi string) (*models.Tanggapan, error) {
	if isi == "" {
		return nil, errors.New("isi tanggapan tidak boleh kosong")
	}

	pengaduan, err := s.pengaduanRepo.FindByID(idPengaduan)
	if err != nil {
		return nil, errors.New("pengaduan tidak ditemukan")
	}

	t := &models.Tanggapan{
		IDPengaduan:  idPengaduan,
		IDPetugas:    idPetugas,
		TglTanggapan: time.Now(),
		Isi:          isi,
	}
	if err := s.tanggapanRepo.Create(t); err != nil {
		return nil, err
	}

	// otomatis ubah status pengaduan jadi "proses" jika masih "baru"
	if pengaduan.Status == "baru" {
		pengaduan.Status = "proses"
		_ = s.pengaduanRepo.Update(pengaduan)
	}

	return t, nil
}

func (s *tanggapanService) GetByPengaduanID(idPengaduan uint) ([]models.Tanggapan, error) {
	return s.tanggapanRepo.FindByPengaduanID(idPengaduan)
}

func (s *tanggapanService) Update(id uint, isi string) (*models.Tanggapan, error) {
	t, err := s.tanggapanRepo.FindByID(id)
	if err != nil {
		return nil, err
	}
	if isi != "" {
		t.Isi = isi
	}
	if err := s.tanggapanRepo.Update(t); err != nil {
		return nil, err
	}
	return t, nil
}

func (s *tanggapanService) Delete(id uint) error {
	return s.tanggapanRepo.Delete(id)
}
