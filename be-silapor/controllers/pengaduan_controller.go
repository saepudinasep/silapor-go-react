package controllers

import (
	"fmt"
	"strconv"
	"strings"
	"time"

	"github.com/saepudinasep/silapor-go-react/be/services"

	"github.com/gofiber/fiber/v2"
)

// PengaduanController exposes HTTP handlers for pengaduan endpoints.
type PengaduanController struct {
	pengaduanService services.PengaduanService
	uploadDir        string
}

// NewPengaduanController builds a PengaduanController.
func NewPengaduanController(pengaduanService services.PengaduanService, uploadDir string) *PengaduanController {
	return &PengaduanController{pengaduanService: pengaduanService, uploadDir: uploadDir}
}

// CreatePengaduan handles POST /api/v1/pengaduan (multipart/form-data)
// Fields: isi_laporan (text), foto (file, optional)
func (ctl *PengaduanController) CreatePengaduan(c *fiber.Ctx) error {
	nik, _ := c.Locals("subject").(string)
	isiLaporan := c.FormValue("isi_laporan")

	fotoName := ""
	file, err := c.FormFile("foto")
	if err == nil && file != nil {
		fotoName = fmt.Sprintf("%d_%s", time.Now().UnixNano(), file.Filename)
		if err := c.SaveFile(file, fmt.Sprintf("%s/%s", ctl.uploadDir, fotoName)); err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"success": false, "message": "gagal menyimpan foto"})
		}
	}

	p, err := ctl.pengaduanService.Create(nik, isiLaporan, fotoName)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"success": false, "message": err.Error()})
	}
	return c.Status(fiber.StatusCreated).JSON(fiber.Map{"success": true, "message": "pengaduan berhasil dikirim", "data": p})
}

// GetAllPengaduan handles GET /api/v1/pengaduan?status=baru&start_date=2026-01-01&end_date=2026-01-31 (petugas/admin)
func (ctl *PengaduanController) GetAllPengaduan(c *fiber.Ctx) error {
	status := c.Query("status", "")
	startDate := c.Query("start_date", "")
	endDate := c.Query("end_date", "")
	list, err := ctl.pengaduanService.GetAll(status, startDate, endDate)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"success": false, "message": err.Error()})
	}
	return c.JSON(fiber.Map{"success": true, "data": list})
}

// GetMyPengaduan handles GET /api/v1/pengaduan/saya (masyarakat)
func (ctl *PengaduanController) GetMyPengaduan(c *fiber.Ctx) error {
	nik, _ := c.Locals("subject").(string)
	list, err := ctl.pengaduanService.GetByNIK(nik)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"success": false, "message": err.Error()})
	}
	return c.JSON(fiber.Map{"success": true, "data": list})
}

// GetPengaduan handles GET /api/v1/pengaduan/:id
func (ctl *PengaduanController) GetPengaduan(c *fiber.Ctx) error {
	id, err := strconv.Atoi(c.Params("id"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"success": false, "message": "id tidak valid"})
	}

	p, err := ctl.pengaduanService.GetByID(uint(id))
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"success": false, "message": "pengaduan tidak ditemukan"})
	}
	return c.JSON(fiber.Map{"success": true, "data": p})
}

type updateStatusRequest struct {
	Status string `json:"status"`
}

// UpdateStatus handles PUT /api/v1/pengaduan/:id/status (petugas/admin)
func (ctl *PengaduanController) UpdateStatus(c *fiber.Ctx) error {
	id, err := strconv.Atoi(c.Params("id"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"success": false, "message": "id tidak valid"})
	}

	var req updateStatusRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"success": false, "message": "request tidak valid"})
	}

	p, err := ctl.pengaduanService.UpdateStatus(uint(id), req.Status)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"success": false, "message": err.Error()})
	}
	return c.JSON(fiber.Map{"success": true, "message": "status diperbarui", "data": p})
}

// DeletePengaduan handles DELETE /api/v1/pengaduan/:id (admin)
func (ctl *PengaduanController) DeletePengaduan(c *fiber.Ctx) error {
	id, err := strconv.Atoi(c.Params("id"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"success": false, "message": "id tidak valid"})
	}
	if err := ctl.pengaduanService.Delete(uint(id)); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"success": false, "message": err.Error()})
	}
	return c.JSON(fiber.Map{"success": true, "message": "pengaduan dihapus"})
}

// Summary handles GET /api/v1/pengaduan/summary (dashboard petugas/admin)
func (ctl *PengaduanController) Summary(c *fiber.Ctx) error {
	summary, err := ctl.pengaduanService.Summary()
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"success": false, "message": err.Error()})
	}
	return c.JSON(fiber.Map{"success": true, "data": summary})
}

// publicPengaduanItem adalah representasi pengaduan yang aman ditampilkan ke
// publik (tanpa login): identitas pelapor disamarkan dan isi laporan
// dipotong, supaya tidak membocorkan data pribadi warga.
type publicPengaduanItem struct {
	ID         uint   `json:"id_pengaduan"`
	Tanggal    string `json:"tgl_pengaduan"`
	IsiLaporan string `json:"isi_laporan"`
	Status     string `json:"status"`
	Pelapor    string `json:"pelapor"`
}

// maskName menyamarkan nama lengkap jadi "Nama Depan I." demi privasi
// warga saat ditampilkan di halaman publik.
func maskName(fullName string) string {
	fullName = strings.TrimSpace(fullName)
	if fullName == "" {
		return "Warga"
	}
	parts := strings.Fields(fullName)
	if len(parts) == 1 {
		return parts[0]
	}
	initials := make([]string, 0, len(parts)-1)
	for _, p := range parts[1:] {
		if len(p) > 0 {
			initials = append(initials, strings.ToUpper(string(p[0]))+".")
		}
	}
	return parts[0] + " " + strings.Join(initials, " ")
}

func truncateText(s string, max int) string {
	r := []rune(s)
	if len(r) <= max {
		return s
	}
	return string(r[:max]) + "..."
}

// PublicBeranda handles GET /api/v1/public/beranda — data ringkasan &
// cuplikan pengaduan terbaru untuk landing page desa, dapat diakses TANPA
// login. Tidak membocorkan NIK, username, telepon, atau isi laporan penuh.
func (ctl *PengaduanController) PublicBeranda(c *fiber.Ctx) error {
	summary, err := ctl.pengaduanService.Summary()
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"success": false, "message": "gagal memuat data"})
	}

	recent, err := ctl.pengaduanService.GetRecent(8)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"success": false, "message": "gagal memuat data"})
	}

	items := make([]publicPengaduanItem, 0, len(recent))
	for _, p := range recent {
		items = append(items, publicPengaduanItem{
			ID:         p.IDPengaduan,
			Tanggal:    p.TglPengaduan.Format(time.RFC3339),
			IsiLaporan: truncateText(p.IsiLaporan, 140),
			Status:     p.Status,
			Pelapor:    maskName(p.Masyarakat.Nama),
		})
	}

	total := summary["baru"] + summary["proses"] + summary["selesai"]

	return c.JSON(fiber.Map{
		"success": true,
		"data": fiber.Map{
			"summary": fiber.Map{
				"total":   total,
				"baru":    summary["baru"],
				"proses":  summary["proses"],
				"selesai": summary["selesai"],
			},
			"recent": items,
		},
	})
}
