export async function requestJson(url, options = {}) {
  const { signal, timeout = 15000, ...init } = options;
  const controller = new AbortController();
  const abort = () => controller.abort();
  if (signal?.aborted) controller.abort();
  signal?.addEventListener('abort', abort);
  const timer = setTimeout(abort, timeout);
  try {
    const response = await fetch(url, { ...init, signal: controller.signal });
    if (!response.ok) {
      const body = await response.json().catch(() => null);
      throw new Error(
        typeof body?.error === 'string' && body.error.length <= 300
          ? body.error
          : response.status === 404
            ? 'Không tìm thấy dữ liệu.'
            : `Dịch vụ trả lỗi HTTP ${response.status}. Vui lòng thử lại.`,
      );
    }
    return await response.json();
  } catch (error) {
    if (signal?.aborted) throw error;
    if (controller.signal.aborted) throw new Error('Kết nối quá thời gian. Vui lòng thử lại.');
    throw error instanceof TypeError
      ? new Error('Không kết nối được mạng. Kiểm tra Internet rồi thử lại.')
      : error;
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener('abort', abort);
  }
}
