type ResizeImageOptions = {
  maxHeight?: number;
  maxWidth?: number;
  quality?: number;
};

const DEFAULT_OPTIONS: Required<ResizeImageOptions> = {
  maxHeight: 720,
  maxWidth: 720,
  quality: 0.8,
};

export function resizeImageToBase64(file: File, options: ResizeImageOptions = {}) {
  const config = {
    ...DEFAULT_OPTIONS,
    ...options,
  };

  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();

    reader.onerror = reject;
    reader.onload = () => {
      const image = new Image();

      image.onerror = reject;
      image.onload = () => {
        const scale = Math.min(config.maxWidth / image.width, config.maxHeight / image.height, 1);
        const width = Math.round(image.width * scale);
        const height = Math.round(image.height * scale);
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');

        if (!context) {
          reject(new Error('Cannot create canvas context'));
          return;
        }

        canvas.width = width;
        canvas.height = height;
        context.drawImage(image, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', config.quality));
      };
      image.src = reader.result as string;
    };

    reader.readAsDataURL(file);
  });
}
