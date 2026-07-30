package repositories

import (
	"github.com/saepudinasep/silapor-go-react/be/models"

	"gorm.io/gorm"
)

// PetugasRepository defines the data-access contract for Petugas.
type PetugasRepository interface {
	Create(p *models.Petugas) error
	FindAll() ([]models.Petugas, error)
	FindByID(id uint) (*models.Petugas, error)
	FindByUsername(username string) (*models.Petugas, error)
	Update(p *models.Petugas) error
	Delete(id uint) error
}

type petugasRepository struct {
	db *gorm.DB
}

// NewPetugasRepository builds a PetugasRepository backed by GORM/MySQL.
func NewPetugasRepository(db *gorm.DB) PetugasRepository {
	return &petugasRepository{db: db}
}

func (r *petugasRepository) Create(p *models.Petugas) error {
	return r.db.Create(p).Error
}

func (r *petugasRepository) FindAll() ([]models.Petugas, error) {
	var list []models.Petugas
	err := r.db.Order("id_petugas asc").Find(&list).Error
	return list, err
}

func (r *petugasRepository) FindByID(id uint) (*models.Petugas, error) {
	var p models.Petugas
	if err := r.db.First(&p, id).Error; err != nil {
		return nil, err
	}
	return &p, nil
}

func (r *petugasRepository) FindByUsername(username string) (*models.Petugas, error) {
	var p models.Petugas
	if err := r.db.Where("username = ?", username).First(&p).Error; err != nil {
		return nil, err
	}
	return &p, nil
}

func (r *petugasRepository) Update(p *models.Petugas) error {
	return r.db.Save(p).Error
}

func (r *petugasRepository) Delete(id uint) error {
	return r.db.Delete(&models.Petugas{}, id).Error
}
