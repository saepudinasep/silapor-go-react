package controllers

import (
	"strconv"

	"github.com/saepudinasep/silapor-go-react/be-silapor/services"

	"github.com/gofiber/fiber/v2"
)

// PetugasController exposes HTTP handlers for petugas management (admin only).
type PetugasController struct {
	petugasService services.PetugasService
}

// NewPetugasController builds a PetugasController.
func NewPetugasController(petugasService services.PetugasService) *PetugasController {
	return &PetugasController{petugasService: petugasService}
}

type createPetugasRequest struct {
	Nama     string `json:"nama_petugas"`
	Username string `json:"username"`
	Password string `json:"password"`
	Telp     string `json:"telp"`
	Level    string `json:"level"`
}

type updatePetugasRequest struct {
	Nama  string `json:"nama_petugas"`
	Telp  string `json:"telp"`
	Level string `json:"level"`
}

type resetPasswordRequest struct {
	Password string `json:"password"`
}

// CreatePetugas handles POST /api/v1/petugas (admin)
func (ctl *PetugasController) CreatePetugas(c *fiber.Ctx) error {
	var req createPetugasRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"success": false, "message": "request tidak valid"})
	}
	p, err := ctl.petugasService.Create(req.Nama, req.Username, req.Password, req.Telp, req.Level)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"success": false, "message": err.Error()})
	}
	return c.Status(fiber.StatusCreated).JSON(fiber.Map{"success": true, "message": "petugas ditambahkan", "data": p})
}

// GetAllPetugas handles GET /api/v1/petugas (admin)
func (ctl *PetugasController) GetAllPetugas(c *fiber.Ctx) error {
	list, err := ctl.petugasService.GetAll()
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"success": false, "message": err.Error()})
	}
	return c.JSON(fiber.Map{"success": true, "data": list})
}

// UpdatePetugas handles PUT /api/v1/petugas/:id (admin)
func (ctl *PetugasController) UpdatePetugas(c *fiber.Ctx) error {
	id, err := strconv.Atoi(c.Params("id"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"success": false, "message": "id tidak valid"})
	}
	var req updatePetugasRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"success": false, "message": "request tidak valid"})
	}
	p, err := ctl.petugasService.Update(uint(id), req.Nama, req.Telp, req.Level)
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"success": false, "message": "petugas tidak ditemukan"})
	}
	return c.JSON(fiber.Map{"success": true, "message": "petugas diperbarui", "data": p})
}

// ResetPassword handles PUT /api/v1/petugas/:id/reset-password (admin)
func (ctl *PetugasController) ResetPassword(c *fiber.Ctx) error {
	id, err := strconv.Atoi(c.Params("id"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"success": false, "message": "id tidak valid"})
	}
	var req resetPasswordRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"success": false, "message": "request tidak valid"})
	}
	if err := ctl.petugasService.ResetPassword(uint(id), req.Password); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"success": false, "message": err.Error()})
	}
	return c.JSON(fiber.Map{"success": true, "message": "password direset"})
}

// DeletePetugas handles DELETE /api/v1/petugas/:id (admin)
func (ctl *PetugasController) DeletePetugas(c *fiber.Ctx) error {
	id, err := strconv.Atoi(c.Params("id"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"success": false, "message": "id tidak valid"})
	}
	if err := ctl.petugasService.Delete(uint(id)); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"success": false, "message": err.Error()})
	}
	return c.JSON(fiber.Map{"success": true, "message": "petugas dihapus"})
}
