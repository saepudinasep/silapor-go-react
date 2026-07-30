package controllers

import (
	"fmt"
	"strconv"
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

// GetAllPengaduan handles GET /api/v1/pengaduan?status=baru (petugas/admin)
func (ctl *PengaduanController) GetAllPengaduan(c *fiber.Ctx) error {
	status := c.Query("status", "")
	list, err := ctl.pengaduanService.GetAll(status)
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
