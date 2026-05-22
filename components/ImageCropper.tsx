import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';

interface ImageCropperProps {
  imageSrc: string;
  characterId: string;
  onCropComplete: (imageUrl: string) => void;
  onCancel: () => void;
  themeColor?: string;
}

const getCroppedImgBlob = async (imageSrc: string, pixelCrop: any): Promise<Blob> => {
  return new Promise((resolve) => {
    const image = new Image();
    image.src = imageSrc;
    image.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      canvas.width = pixelCrop.width;
      canvas.height = pixelCrop.height;
      ctx.drawImage(
        image,
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height,
        0,
        0,
        pixelCrop.width,
        pixelCrop.height
      );
      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
      }, 'image/png');
    };
  });
};

export const ImageCropper: React.FC<ImageCropperProps> = ({ imageSrc, characterId, onCropComplete, onCancel, themeColor = '#22d3ee' }) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [isUploading, setIsUploading] = useState(false);

  const onCropCompleteHandler = useCallback((_croppedArea: any, currentCroppedAreaPixels: any) => {
    setCroppedAreaPixels(currentCroppedAreaPixels);
  }, []);

  const handleConfirm = async () => {
    if (croppedAreaPixels && !isUploading) {
      try {
        setIsUploading(true);
        const croppedBlob = await getCroppedImgBlob(imageSrc, croppedAreaPixels);
        
        const formData = new FormData();
        formData.append('file', croppedBlob, 'avatar.png');
        formData.append('characterId', characterId);

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData
        });

        if (!response.ok) throw new Error('Falha no upload');
        const data = await response.json();
        onCropComplete(data.url);
      } catch (error) {
        console.error('Erro no upload:', error);
        alert('Erro ao enviar imagem.');
      } finally {
        setIsUploading(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-black/90 flex flex-col p-4 sm:p-10 animate-in fade-in zoom-in-95">
      <div className="flex justify-between items-center mb-6 bg-zinc-900 p-4 rounded-3xl backdrop-blur-md border shadow-xl" style={{ borderColor: `${themeColor}60`, borderBottomWidth: '4px', borderBottomColor: themeColor }}>
        <h3 className="text-white font-black uppercase tracking-widest text-sm flex items-center gap-2" style={{ color: themeColor }}>
          <i className="fa-solid fa-crop-simple text-xl" /> Ajustar Imagem
        </h3>
        <div className="flex gap-3">
          <button 
            onClick={onCancel} 
            className="bg-zinc-800 hover:bg-zinc-700 text-white px-6 py-2.5 rounded-2xl font-bold uppercase text-[10px] transition-colors border border-zinc-700"
          >Cancelar</button>
          <button 
            onClick={handleConfirm}
            disabled={isUploading}
            className={`text-white px-8 py-2.5 rounded-2xl font-black uppercase text-[10px] shadow-[0_4px_15px_rgba(0,0,0,0.3)] transition-transform ${isUploading ? 'opacity-50' : 'hover:scale-105'} inline-flex items-center gap-1`}
            style={{ backgroundColor: themeColor }}
          ><i className="fa-solid fa-check" /> {isUploading ? 'Salvando...' : 'Confirmar'}</button>
        </div>
      </div>
      <div className="relative flex-1 bg-zinc-900 rounded-[2rem] overflow-hidden border-4 shadow-2xl" style={{ borderColor: themeColor }}>
         <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={1}
            onCropChange={setCrop}
            onCropComplete={onCropCompleteHandler}
            onZoomChange={setZoom}
            objectFit="contain"
            style={{
              containerStyle: { backgroundColor: 'transparent' },
              cropAreaStyle: { border: `4px dashed ${themeColor}`, boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.7)' }
            }}
         />
      </div>
    </div>
  );
};
