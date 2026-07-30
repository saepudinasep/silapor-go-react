package repositories

import (
	"github.com/saepudinasep/silapor-go-react/be/models"

	"gorm.io/gorm"
)

// TanggapanRepository defines the data-access contract for Tanggapan.
type TanggapanRepository interface {
	Create(t *models.Tanggapan) error
	FindByPengaduanID(idPengaduan uint) ([]models.Tanggapan, error)
	FindByID(id uint) (*models.Tanggapan, error)
	Update(t *models.Tanggapan) error
	Delete(id uint) error
}

type tanggapanRepository struct {
	db *gorm.DB
}

// NewTanggapanRepository builds a TanggapanRepository backed by GORM/MySQL.
func NewTanggapanRepository(db *gorm.DB) TanggapanRepository {
	return &tanggapanRepository{db: db}
}

func (r *tanggapanRepository) Create(t *models.Tanggapan) error {
	return r.db.Create(t).Error
}

func (r *tanggapanRepository) FindByPengaduanID(idPengaduan uint) ([]models.Tanggapan, error) {
	var list []models.Tanggapan
	err := r.db.Preload("Petugas").
		Where("id_pengaduan = ?", idPengaduan).
		Order("tgl_tanggapan asc").
		Find(&list).Error
	return list, err
}

func (r *tanggapanRepository) FindByID(id uint) (*models.Tanggapan, error) {
	var t models.Tanggapan
	if err := r.db.Preload("Petugas").First(&t, id).Error; err != nil {
		return nil, err
	}
	return &t, nil
}

func (r *tanggapanRepository) Update(t *models.Tanggapan) error {
	return r.db.Save(t).Error
}

func (r *tanggapanRepository) Delete(id uint) error {
	return r.db.Delete(&models.Tanggapan{}, id).Error
}
