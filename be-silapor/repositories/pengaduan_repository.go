package repositories

import (
	"github.com/saepudinasep/silapor-go-react/be-silapor/models"

	"gorm.io/gorm"
)

// PengaduanRepository defines the data-access contract for Pengaduan.
type PengaduanRepository interface {
	Create(p *models.Pengaduan) error
	FindAll(status, startDate, endDate string) ([]models.Pengaduan, error)
	FindByNIK(nik string) ([]models.Pengaduan, error)
	FindByID(id uint) (*models.Pengaduan, error)
	Update(p *models.Pengaduan) error
	Delete(id uint) error
	CountByStatus() (map[string]int64, error)
	FindRecent(limit int) ([]models.Pengaduan, error)
}

type pengaduanRepository struct {
	db *gorm.DB
}

// NewPengaduanRepository builds a PengaduanRepository backed by GORM/MySQL.
func NewPengaduanRepository(db *gorm.DB) PengaduanRepository {
	return &pengaduanRepository{db: db}
}

func (r *pengaduanRepository) Create(p *models.Pengaduan) error {
	return r.db.Create(p).Error
}

// FindAll mengambil daftar pengaduan, opsional difilter berdasarkan status
// dan/atau rentang tanggal (format "YYYY-MM-DD"). Dipakai baik untuk daftar
// pengaduan biasa maupun untuk generate laporan rekap.
func (r *pengaduanRepository) FindAll(status, startDate, endDate string) ([]models.Pengaduan, error) {
	var list []models.Pengaduan
	q := r.db.Preload("Masyarakat").Order("tgl_pengaduan desc")
	if status != "" {
		q = q.Where("status = ?", status)
	}
	if startDate != "" {
		q = q.Where("tgl_pengaduan >= ?", startDate+" 00:00:00")
	}
	if endDate != "" {
		q = q.Where("tgl_pengaduan <= ?", endDate+" 23:59:59")
	}
	err := q.Find(&list).Error
	return list, err
}

func (r *pengaduanRepository) FindByNIK(nik string) ([]models.Pengaduan, error) {
	var list []models.Pengaduan
	err := r.db.Where("nik = ?", nik).Order("tgl_pengaduan desc").Find(&list).Error
	return list, err
}

func (r *pengaduanRepository) FindByID(id uint) (*models.Pengaduan, error) {
	var p models.Pengaduan
	if err := r.db.Preload("Masyarakat").
		Preload("Tanggapan").
		Preload("Tanggapan.Petugas").
		First(&p, id).Error; err != nil {
		return nil, err
	}
	return &p, nil
}

func (r *pengaduanRepository) Update(p *models.Pengaduan) error {
	return r.db.Save(p).Error
}

func (r *pengaduanRepository) Delete(id uint) error {
	return r.db.Delete(&models.Pengaduan{}, id).Error
}

func (r *pengaduanRepository) CountByStatus() (map[string]int64, error) {
	type row struct {
		Status string
		Total  int64
	}
	var rows []row
	if err := r.db.Model(&models.Pengaduan{}).
		Select("status, count(*) as total").
		Group("status").
		Scan(&rows).Error; err != nil {
		return nil, err
	}

	result := map[string]int64{"baru": 0, "proses": 0, "selesai": 0}
	for _, r := range rows {
		result[r.Status] = r.Total
	}
	return result, nil
}

// FindRecent mengambil N pengaduan terbaru (semua status), dipakai untuk
// menampilkan cuplikan pengaduan di landing page publik desa.
func (r *pengaduanRepository) FindRecent(limit int) ([]models.Pengaduan, error) {
	var list []models.Pengaduan
	err := r.db.Preload("Masyarakat").Order("tgl_pengaduan desc").Limit(limit).Find(&list).Error
	return list, err
}
