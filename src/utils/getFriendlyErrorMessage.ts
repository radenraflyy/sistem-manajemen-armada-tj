export function getFriendlyErrorMessage(error: unknown, subject = 'data') {
  if (typeof error === 'object' && error !== null) {
    const value = error as {
      code?: unknown;
      message?: unknown;
      response?: { status?: unknown; data?: unknown; statusText?: unknown };
    };
    const message = typeof value.message === 'string' ? value.message : '';
    const status = value.response?.status;
    const responseData = value.response?.data;
    const responseErrors =
      typeof responseData === 'object' && responseData !== null && 'errors' in responseData
        ? responseData.errors
        : undefined;
    const errorDetails = Array.isArray(responseErrors)
      ? responseErrors
          .flatMap((item) => {
            if (typeof item !== 'object' || item === null) return [];
            const detail = 'detail' in item ? item.detail : undefined;
            const title = 'title' in item ? item.title : undefined;
            const code = 'code' in item ? item.code : undefined;
            const text = [detail, title, code].find(
              (entry): entry is string => typeof entry === 'string' && entry.length > 0,
            );
            return text ? [text] : [];
          })
          .join('; ')
      : '';

    if (
      value.code === 'ERR_NETWORK' ||
      message.includes('Network Error') ||
      message.includes('ERR_NAME_NOT_RESOLVED') ||
      message.includes('Failed to fetch')
    ) {
      return 'Tidak dapat terhubung ke server. Periksa koneksi internet, lalu coba lagi.';
    }
    if (status === 400) {
      return errorDetails
        ? `Permintaan ${subject} tidak valid: ${errorDetails}`
        : `Permintaan ${subject} tidak valid. Periksa filter atau parameter, lalu coba lagi.`;
    }
    if (status === 401) {
      return 'Autentikasi API gagal. Periksa konfigurasi akses API.';
    }
    if (status === 403) {
      return 'Akses ke API ditolak. Periksa izin untuk mengakses data ini.';
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
    if (typeof status === 'number') {
      return errorDetails
        ? `Permintaan ${subject} gagal (${status}): ${errorDetails}`
        : `Permintaan ${subject} gagal dengan kode ${status}. Coba lagi beberapa saat.`;
    }
  }

  return `Data ${subject} gagal dimuat. Coba lagi beberapa saat.`;
}
