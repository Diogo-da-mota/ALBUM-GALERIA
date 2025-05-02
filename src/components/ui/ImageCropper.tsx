import React, { useState, useRef } from 'react';
import ReactCrop, { Crop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { Button } from './button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './dialog';

interface ImageCropperProps {
  imageUrl: string;
  onCropComplete: (croppedBlob: Blob) => void;
  aspectRatio?: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ImageCropper({ 
  imageUrl, 
  onCropComplete, 
  aspectRatio = 1, 
  open,
  onOpenChange
}: ImageCropperProps) {
  const [crop, setCrop] = useState<Crop>({
    unit: '%',
    width: 90,
    height: 90,
    x: 5,
    y: 5
  });
  
  const imageRef = useRef<HTMLImageElement>(null);

  const getCroppedImg = async (image: HTMLImageElement, crop: Crop): Promise<Blob> => {
    const canvas = document.createElement('canvas');
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    
    canvas.width = crop.width;
    canvas.height = crop.height;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('No 2d context');
    }

    ctx.drawImage(
      image,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      crop.width,
      crop.height
    );

    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Canvas is empty'));
            return;
          }
          resolve(blob);
        },
        'image/png',
        1
      );
    });
  };

  const handleComplete = async () => {
    if (!imageRef.current) return;
    
    try {
      const croppedBlob = await getCroppedImg(imageRef.current, crop);
      onCropComplete(croppedBlob);
      onOpenChange(false);
    } catch (error) {
      console.error('Erro ao recortar imagem:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] bg-[#1A1F2E] text-white">
        <DialogHeader>
          <DialogTitle>Ajustar Imagem</DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          <ReactCrop
            crop={crop}
            onChange={(c) => setCrop(c)}
            aspect={aspectRatio}
            className="max-h-[400px] object-contain"
          >
            <img
              ref={imageRef}
              src={imageUrl}
              alt="Imagem para recorte"
              className="max-h-[400px] w-auto"
            />
          </ReactCrop>
        </div>

        <div className="flex justify-end space-x-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleComplete}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Confirmar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
} 