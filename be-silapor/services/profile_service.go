package services

import (
	"errors"
	"strconv"

	"github.com/saepudinasep/silapor-go-react/be/middleware"
	"github.com/saepudinasep/silapor-go-react/be/repositories"
)

// ProfileService menangani profil akun milik sendiri (self-service),
// berlaku untuk role masyarakat maupun petugas/admin, dibedakan lewat
// klaim "role" & "subject" pada JWT yang sedang login.
type ProfileService interface {
	GetProfile(role, subject string) (interface{}, error)
	UpdateProfile(role, subject, nama, telp string) (interface{}, error)
	ChangePassword(role, subject, oldPassword, newPassword string) error
}

type profileService struct {
	masyarakatRepo repositories.MasyarakatRepository
	petugasRepo    repositories.PetugasRepository
}

// NewProfileService builds a ProfileService.
func NewProfileService(mr repositories.MasyarakatRepository, pr repositories.PetugasRepository) ProfileService {
	return &profileService{masyarakatRepo: mr, petugasRepo: pr}
}

func (s *profileService) GetProfile(role, subject string) (interface{}, error) {
	if role == "masyarakat" {
		m, err := s.masyarakatRepo.FindByNIK(subject)
		if err != nil {
			return nil, errors.New("profil tidak ditemukan")
		}
		return m, nil
	}

	id, err := strconv.Atoi(subject)
	if err != nil {
		return nil, errors.New("sesi tidak valid, silakan login ulang")
	}
	p, err := s.petugasRepo.FindByID(uint(id))
	if err != nil {
		return nil, errors.New("profil tidak ditemukan")
	}
	return p, nil
}

func (s *profileService) UpdateProfile(role, subject, nama, telp string) (interface{}, error) {
	if role == "masyarakat" {
		m, err := s.masyarakatRepo.FindByNIK(subject)
		if err != nil {
			return nil, errors.New("profil tidak ditemukan")
		}
		if nama != "" {
			m.Nama = nama
		}
		m.Telp = telp
		if err := s.masyarakatRepo.Update(m); err != nil {
			return nil, FriendlyDBError("update profile masyarakat", err)
		}
		return m, nil
	}

	id, err := strconv.Atoi(subject)
	if err != nil {
		return nil, errors.New("sesi tidak valid, silakan login ulang")
	}
	p, err := s.petugasRepo.FindByID(uint(id))
	if err != nil {
		return nil, errors.New("profil tidak ditemukan")
	}
	if nama != "" {
		p.NamaPetugas = nama
	}
	p.Telp = telp
	if err := s.petugasRepo.Update(p); err != nil {
		return nil, FriendlyDBError("update profile petugas", err)
	}
	return p, nil
}

func (s *profileService) ChangePassword(role, subject, oldPassword, newPassword string) error {
	if len(newPassword) < 6 {
		return errors.New("password baru minimal 6 karakter")
	}

	if role == "masyarakat" {
		m, err := s.masyarakatRepo.FindByNIK(subject)
		if err != nil {
			return errors.New("profil tidak ditemukan")
		}
		if !middleware.CheckPasswordHash(oldPassword, m.Password) {
			return errors.New("password lama tidak sesuai")
		}
		hashed, err := middleware.HashPassword(newPassword)
		if err != nil {
			return err
		}
		m.Password = hashed
		if err := s.masyarakatRepo.Update(m); err != nil {
			return FriendlyDBError("change password masyarakat", err)
		}
		return nil
	}

	id, err := strconv.Atoi(subject)
	if err != nil {
		return errors.New("sesi tidak valid, silakan login ulang")
	}
	p, err := s.petugasRepo.FindByID(uint(id))
	if err != nil {
		return errors.New("profil tidak ditemukan")
	}
	if !middleware.CheckPasswordHash(oldPassword, p.Password) {
		return errors.New("password lama tidak sesuai")
	}
	hashed, err := middleware.HashPassword(newPassword)
	if err != nil {
		return err
	}
	p.Password = hashed
	if err := s.petugasRepo.Update(p); err != nil {
		return FriendlyDBError("change password petugas", err)
	}
	return nil
}
