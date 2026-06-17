// 把以 "/" 开头的站内静态资源路径解析为带 Vite base 前缀的实际路径，
// 这样部署到子目录（如 /paiya/）时 STL 模型、预览图等才能正确加载。
export function assetUrl(path: string): string {
  return `${import.meta.env.BASE_URL}${path.replace(/^\//, "")}`;
}
