package middleware

import (
	"strings"

	"github.com/gofiber/fiber/v2"
)

// IsAuth verifies the Authorization: Bearer <token> header and injects
// the authenticated subject's identity into the Fiber context locals.
func IsAuth(secret string) fiber.Handler {
	return func(c *fiber.Ctx) error {
		header := c.Get("Authorization")
		if header == "" || !strings.HasPrefix(header, "Bearer ") {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"success": false,
				"message": "missing or invalid Authorization header",
			})
		}

		tokenString := strings.TrimPrefix(header, "Bearer ")
		claims, err := ParseJWT(tokenString, secret)
		if err != nil {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"success": false,
				"message": "invalid or expired token",
			})
		}

		c.Locals("subject", claims.Subject)
		c.Locals("nama", claims.Nama)
		c.Locals("username", claims.Username)
		c.Locals("role", claims.Role)
		return c.Next()
	}
}

// IsMasyarakat ensures the authenticated user is a citizen (masyarakat).
func IsMasyarakat(c *fiber.Ctx) error {
	role, _ := c.Locals("role").(string)
	if role != "masyarakat" {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
			"success": false,
			"message": "akses khusus masyarakat",
		})
	}
	return c.Next()
}

// IsPetugas ensures the authenticated user is petugas or admin.
func IsPetugas(c *fiber.Ctx) error {
	role, _ := c.Locals("role").(string)
	if role != "petugas" && role != "admin" {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
			"success": false,
			"message": "akses khusus petugas/admin",
		})
	}
	return c.Next()
}

// IsAdmin ensures the authenticated user has the "admin" role.
func IsAdmin(c *fiber.Ctx) error {
	role, _ := c.Locals("role").(string)
	if role != "admin" {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
			"success": false,
			"message": "akses khusus admin",
		})
	}
	return c.Next()
}
