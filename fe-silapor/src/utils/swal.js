import Swal from 'sweetalert2'

// Instance SweetAlert2 yang sudah di-tema supaya nyatu dengan dashboard
// SiLapor (dark navy + aksen teal), dipakai di seluruh halaman lewat
// helper-helper di bawah alih-alih memanggil Swal.fire() langsung.
const themedSwal = Swal.mixin({
  background: '#162b4d', // var(--navy-card)
  color: '#f0f6ff', // var(--text)
  confirmButtonColor: '#00c9b1', // var(--teal)
  cancelButtonColor: 'transparent',
  customClass: {
    popup: 'silapor-swal-popup',
    confirmButton: 'silapor-swal-confirm',
    cancelButton: 'silapor-swal-cancel',
  },
  buttonsStyling: true,
  confirmButtonText: 'OK',
})

/** Toast kecil di pojok kanan atas, otomatis hilang. */
const toast = themedSwal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 2600,
  timerProgressBar: true,
  didOpen: (el) => {
    el.addEventListener('mouseenter', Swal.stopTimer)
    el.addEventListener('mouseleave', Swal.resumeTimer)
  },
})

export function alertSuccess(title, text) {
  return toast.fire({ icon: 'success', title, text })
}

export function alertError(title, text) {
  return themedSwal.fire({ icon: 'error', title, text: text || undefined })
}

export function alertInfo(title, text) {
  return toast.fire({ icon: 'info', title, text })
}

/**
 * Dialog konfirmasi (pengganti window.confirm bawaan browser).
 * Mengembalikan Promise<boolean> — true jika pengguna menekan tombol konfirmasi.
 */
export function confirmAction({
  title = 'Anda yakin?',
  text = '',
  confirmText = 'Ya, lanjutkan',
  cancelText = 'Batal',
  icon = 'warning',
  danger = false,
} = {}) {
  return themedSwal
    .fire({
      title,
      text,
      icon,
      showCancelButton: true,
      confirmButtonText: confirmText,
      cancelButtonText: cancelText,
      confirmButtonColor: danger ? '#f43f5e' : '#00c9b1',
      reverseButtons: true,
    })
    .then((res) => res.isConfirmed)
}

/**
 * Dialog input teks (pengganti window.prompt bawaan browser).
 * Mengembalikan Promise<string|null> — null jika dibatalkan.
 */
export function promptInput({
  title = 'Masukkan nilai',
  inputLabel = '',
  inputPlaceholder = '',
  inputType = 'text',
  confirmText = 'Simpan',
} = {}) {
  return themedSwal
    .fire({
      title,
      input: inputType,
      inputLabel,
      inputPlaceholder,
      showCancelButton: true,
      confirmButtonText: confirmText,
      cancelButtonText: 'Batal',
      reverseButtons: true,
      inputValidator: (value) => {
        if (!value) return 'Nilai tidak boleh kosong'
      },
    })
    .then((res) => (res.isConfirmed ? res.value : null))
}

export default themedSwal
