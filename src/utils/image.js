/**
 * Lê uma imagem enviada pelo usuário e devolve um dataURL redimensionado
 * (lado maior <= maxSize). PNG mantém a transparência; demais viram JPEG.
 */
export function resizeImageFile(file, maxSize = 400) {
  return new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith('image/')) {
      reject(new Error('Selecione um arquivo de imagem (PNG ou JPG).'))
      return
    }
    const reader = new FileReader()
    reader.onerror = () => reject(new Error('Não foi possível ler o arquivo.'))
    reader.onload = () => {
      const img = new Image()
      img.onerror = () => reject(new Error('Formato de imagem não suportado.'))
      img.onload = () => {
        const scale = Math.min(1, maxSize / Math.max(img.width, img.height))
        const w = Math.max(1, Math.round(img.width * scale))
        const h = Math.max(1, Math.round(img.height * scale))
        const canvas = document.createElement('canvas')
        canvas.width = w
        canvas.height = h
        const ctx = canvas.getContext('2d')
        const keepAlpha = file.type === 'image/png' || file.type === 'image/webp' || file.type === 'image/svg+xml'
        if (!keepAlpha) {
          ctx.fillStyle = '#ffffff'
          ctx.fillRect(0, 0, w, h)
        }
        ctx.drawImage(img, 0, 0, w, h)
        resolve({
          dataUrl: keepAlpha ? canvas.toDataURL('image/png') : canvas.toDataURL('image/jpeg', 0.88),
          width: w,
          height: h
        })
      }
      img.src = reader.result
    }
    reader.readAsDataURL(file)
  })
}
