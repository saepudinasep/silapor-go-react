package controllers

import (
	"strconv"

	"github.com/saepudinasep/silapor-go-react/be/services"

	"github.com/gofiber/fiber/v2"
)

// TanggapanController exposes HTTP handlers for tanggapan endpoints.
type TanggapanController struct {
	tanggapanService services.TanggapanService
}

// NewTanggapanController builds a TanggapanController.
func NewTanggapanController(tanggapanService services.TanggapanService) *TanggapanController {
	return &TanggapanController{tanggapanService: tanggapanService}
}

type createTanggapanRequest struct {
	Tanggapan string `json:"tanggapan"`
}

// CreateTanggapan handles POST /api/v1/pengaduan/:id/tanggapan (petugas/admin)
func (ctl *TanggapanController) CreateTanggapan(c *fiber.Ctx) error {
	idPengaduan, err := strconv.Atoi(c.Params("id"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"success": false, "message": "id pengaduan tidak valid"})
	}

	var req createTanggapanRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"success": false, "message": "request tidak valid"})
	}

	idPetugasStr, _ := c.Locals("subject").(string)
	idPetugas, _ := strconv.Atoi(idPetugasStr)

	t, err := ctl.tanggapanService.Create(uint(idPengaduan), uint(idPetugas), req.Tanggapan)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"success": false, "message": err.Error()})
	}
	return c.Status(fiber.StatusCreated).JSON(fiber.Map{"success": true, "message": "tanggapan ditambahkan", "data": t})
}

// GetTanggapanByPengaduan handles GET /api/v1/pengaduan/:id/tanggapan
func (ctl *TanggapanController) GetTanggapanByPengaduan(c *fiber.Ctx) error {
	idPengaduan, err := strconv.Atoi(c.Params("id"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"success": false, "message": "id pengaduan tidak valid"})
	}

	list, err := ctl.tanggapanService.GetByPengaduanID(uint(idPengaduan))
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"success": false, "message": err.Error()})
	}
	return c.JSON(fiber.Map{"success": true, "data": list})
}

// DeleteTanggapan handles DELETE /api/v1/tanggapan/:id (admin)
func (ctl *TanggapanController) DeleteTanggapan(c *fiber.Ctx) error {
	id, err := strconv.Atoi(c.Params("id"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"success": false, "message": "id tidak valid"})
	}
	if err := ctl.tanggapanService.Delete(uint(id)); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"success": false, "message": err.Error()})
	}
	return c.JSON(fiber.Map{"success": true, "message": "tanggapan dihapus"})
}
