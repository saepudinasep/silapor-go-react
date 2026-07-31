package repositories

import (
	"github.com/saepudinasep/silapor-go-react/be-silapor/models"

	"gorm.io/gorm"
)

// MasyarakatRepository defines the data-access contract for Masyarakat.
type MasyarakatRepository interface {
	Create(m *models.Masyarakat) error
	FindAll() ([]models.Masyarakat, error)
	FindByNIK(nik string) (*models.Masyarakat, error)
	FindByUsername(username string) (*models.Masyarakat, error)
	Update(m *models.Masyarakat) error
	Delete(nik string) error
}

type masyarakatRepository struct {
	db *gorm.DB
}

// NewMasyarakatRepository builds a MasyarakatRepository backed by GORM/MySQL.
func NewMasyarakatRepository(db *gorm.DB) MasyarakatRepository {
	return &masyarakatRepository{db: db}
}

func (r *masyarakatRepository) Create(m *models.Masyarakat) error {
	return r.db.Create(m).Error
}

func (r *masyarakatRepository) FindAll() ([]models.Masyarakat, error) {
	var list []models.Masyarakat
	err := r.db.Order("nama asc").Find(&list).Error
	return list, err
}

func (r *masyarakatRepository) FindByNIK(nik string) (*models.Masyarakat, error) {
	var m models.Masyarakat
	if err := r.db.First(&m, "nik = ?", nik).Error; err != nil {
		return nil, err
	}
	return &m, nil
}

func (r *masyarakatRepository) FindByUsername(username string) (*models.Masyarakat, error) {
	var m models.Masyarakat
	if err := r.db.Where("username = ?", username).First(&m).Error; err != nil {
		return nil, err
	}
	return &m, nil
}

func (r *masyarakatRepository) Update(m *models.Masyarakat) error {
	return r.db.Save(m).Error
}

func (r *masyarakatRepository) Delete(nik string) error {
	return r.db.Delete(&models.Masyarakat{}, "nik = ?", nik).Error
}
