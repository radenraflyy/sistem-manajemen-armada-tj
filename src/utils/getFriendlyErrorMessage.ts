export function getFriendlyErrorMessage(error: unknown, subject = 'data') {
  if (typeof error === 'object' && error !== null) {
    const value = error as {
      code?: unknown;
      message?: unknown;
      response?: { status?: unknown };
    };
    const message = typeof value.message === 'string' ? value.message : '';
    const status = value.response?.status;

    if (
      value.code === 'ERR_NETWORK' ||
      message.includes('Network Error') ||
      message.includes('ERR_NAME_NOT_RESOLVED') ||
      message.includes('Failed to fetch')
    ) {
      return 'Tidak dapat terhubung ke server. Periksa koneksi internet, lalu coba lagi.';
    }
    if (status === 401 || status === 403) {
      return 'Akses ke data ini ditolak. Periksa izin akses, lalu coba lagi.';
    }
    if (status === 404) {
      return 'Data yang diminta tidak ditemukan.';
    }
    if (status === 429) {
      return 'Permintaan terlalu banyak. Tunggu sebentar, lalu coba lagi.';
    }
    if (typeof status === 'number' && status >= 500) {
      return 'Server sedang mengalami kendala. Coba lagi beberapa saat.';
    }
  }

  return `Data ${subject} gagal dimuat. Coba lagi beberapa saat.`;
}
