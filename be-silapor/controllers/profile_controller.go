package controllers

import (
	"github.com/saepudinasep/silapor-go-react/be-silapor/services"

	"github.com/gofiber/fiber/v2"
)

// ProfileController exposes HTTP handlers for the logged-in user's own
// profile (works for masyarakat & petugas/admin alike).
type ProfileController struct {
	profileService services.ProfileService
}

// NewProfileController builds a ProfileController.
func NewProfileController(profileService services.ProfileService) *ProfileController {
	return &ProfileController{profileService: profileService}
}

// GetProfile handles GET /api/v1/profile
func (ctl *ProfileController) GetProfile(c *fiber.Ctx) error {
	role, _ := c.Locals("role").(string)
	subject, _ := c.Locals("subject").(string)

	profile, err := ctl.profileService.GetProfile(role, subject)
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"success": false, "message": err.Error()})
	}
	return c.JSON(fiber.Map{"success": true, "data": fiber.Map{"profile": profile, "role": role}})
}

type updateProfileRequest struct {
	Nama string `json:"nama"`
	Telp string `json:"telp"`
}

// UpdateProfile handles PUT /api/v1/profile
func (ctl *ProfileController) UpdateProfile(c *fiber.Ctx) error {
	role, _ := c.Locals("role").(string)
	subject, _ := c.Locals("subject").(string)

	var req updateProfileRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"success": false, "message": "request tidak valid"})
	}

	profile, err := ctl.profileService.UpdateProfile(role, subject, req.Nama, req.Telp)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"success": false, "message": err.Error()})
	}
	return c.JSON(fiber.Map{"success": true, "message": "profil berhasil diperbarui", "data": fiber.Map{"profile": profile, "role": role}})
}

type changePasswordRequest struct {
	PasswordLama string `json:"password_lama"`
	PasswordBaru string `json:"password_baru"`
}

// ChangePassword handles PUT /api/v1/profile/password
func (ctl *ProfileController) ChangePassword(c *fiber.Ctx) error {
	role, _ := c.Locals("role").(string)
	subject, _ := c.Locals("subject").(string)

	var req changePasswordRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"success": false, "message": "request tidak valid"})
	}

	if err := ctl.profileService.ChangePassword(role, subject, req.PasswordLama, req.PasswordBaru); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"success": false, "message": err.Error()})
	}
	return c.JSON(fiber.Map{"success": true, "message": "password berhasil diperbarui"})
}
