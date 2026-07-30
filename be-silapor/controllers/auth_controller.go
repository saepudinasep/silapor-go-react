package controllers

import (
	"github.com/saepudinasep/silapor-go-react/be/services"

	"github.com/gofiber/fiber/v2"
)

// AuthController exposes HTTP handlers for authentication endpoints.
type AuthController struct {
	authService services.AuthService
}

// NewAuthController builds an AuthController.
func NewAuthController(authService services.AuthService) *AuthController {
	return &AuthController{authService: authService}
}

type registerMasyarakatRequest struct {
	NIK      string `json:"nik"`
	Nama     string `json:"nama"`
	Username string `json:"username"`
	Password string `json:"password"`
	Telp     string `json:"telp"`
}

type loginRequest struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

// RegisterMasyarakat handles POST /api/v1/auth/masyarakat/register
func (ctl *AuthController) RegisterMasyarakat(c *fiber.Ctx) error {
	var req registerMasyarakatRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"success": false, "message": "request tidak valid"})
	}

	m, err := ctl.authService.RegisterMasyarakat(req.NIK, req.Nama, req.Username, req.Password, req.Telp)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"success": false, "message": err.Error()})
	}
	return c.Status(fiber.StatusCreated).JSON(fiber.Map{"success": true, "message": "registrasi berhasil", "data": m})
}

// LoginMasyarakat handles POST /api/v1/auth/masyarakat/login
func (ctl *AuthController) LoginMasyarakat(c *fiber.Ctx) error {
	var req loginRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"success": false, "message": "request tidak valid"})
	}

	token, m, err := ctl.authService.LoginMasyarakat(req.Username, req.Password)
	if err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"success": false, "message": err.Error()})
	}
	return c.JSON(fiber.Map{
		"success": true,
		"message": "login berhasil",
		"data":    fiber.Map{"token": token, "user": m, "role": "masyarakat"},
	})
}

// LoginPetugas handles POST /api/v1/auth/petugas/login
func (ctl *AuthController) LoginPetugas(c *fiber.Ctx) error {
	var req loginRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"success": false, "message": "request tidak valid"})
	}

	token, p, err := ctl.authService.LoginPetugas(req.Username, req.Password)
	if err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"success": false, "message": err.Error()})
	}
	return c.JSON(fiber.Map{
		"success": true,
		"message": "login berhasil",
		"data":    fiber.Map{"token": token, "user": p, "role": p.Level},
	})
}
