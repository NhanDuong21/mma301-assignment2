function validateRecommendations(output, catalog) {
  if (!output || !Array.isArray(output.recommendations) || output.recommendations.length > 3) {
    throw new Error('AI trả kết quả sai định dạng. Hãy thử lại.');
  }
  const ids = new Set();
  return output.recommendations.map((entry) => {
    const product = catalog.find((item) => item.id === entry?.id);
    if (!product || ids.has(entry.id) || typeof entry.reason !== 'string' || !entry.reason.trim() || entry.reason.length > 600) {
      throw new Error('Kết quả AI có sản phẩm không tồn tại, bị trùng hoặc lý do không hợp lệ. Kết quả đã bị loại bỏ.');
    }
    ids.add(entry.id);
    return { product, reason: entry.reason.trim() };
  });
}
module.exports = { validateRecommendations };
