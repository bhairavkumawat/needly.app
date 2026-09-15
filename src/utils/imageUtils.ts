/**
 * Safe image utility to resize and compress uploaded images before setting in state or localStorage.
 * Prevents memory issues, localStorage QuotaExceededError, and canvas tainted issues.
 */
export function compressImage(file: File, maxDimension = 900, quality = 0.8): Promise<string> {
  return new Promise((resolve) => {
    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        if (!result) return resolve('');

        try {
          const img = new Image();
          img.onload = () => {
            try {
              let width = img.width;
              let height = img.height;

              if (width > maxDimension || height > maxDimension) {
                if (width > height) {
                  height = Math.round((height * maxDimension) / width);
                  width = maxDimension;
                } else {
                  width = Math.round((width * maxDimension) / height);
                  height = maxDimension;
                }
              }

              const canvas = document.createElement('canvas');
              canvas.width = Math.max(width, 1);
              canvas.height = Math.max(height, 1);
              const ctx = canvas.getContext('2d');
              if (!ctx) {
                return resolve(result);
              }

              ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
              const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
              resolve(compressedDataUrl);
            } catch {
              resolve(result);
            }
          };
          img.onerror = () => resolve(result);
          img.src = result;
        } catch {
          resolve(result);
        }
      };
      reader.onerror = () => resolve('');
      reader.readAsDataURL(file);
    } catch {
      resolve('');
    }
  });
}
