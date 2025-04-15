import React, { useEffect } from 'react';
import { useDropzone, FileRejection, DropEvent } from 'react-dropzone';
import { API_BASE_URL, MEDIA_BASE_URL } from './api';
import './EditImages.css';

interface ImageWellProps {
  computerId: number;
  onAdd: (files: { id: number; image: string }[]) => void;
}

const ImageWell: React.FC<ImageWellProps> = ({ computerId, onAdd }) => {
  console.log('ImageWell component rendered');
  const [isDragActive, setIsDragActive] = React.useState(false);

  const { getRootProps, getInputProps } = useDropzone({
    onDragEnter: () => setIsDragActive(true),
    onDragLeave: () => setIsDragActive(false),
    onDrop: (acceptedFiles: File[], fileRejections: FileRejection[], event: DropEvent) => {
      setIsDragActive(false);
      console.log('Files dropped:', acceptedFiles);

      acceptedFiles.forEach(async (file) => {
        const formData = new FormData();
        formData.append('image', file);
        formData.append('computer', computerId.toString());

        try {
          const response = await fetch(`${API_BASE_URL}upload-picture/`, {
            method: 'POST',
            body: formData,
          });

          if (!response.ok) {
            throw new Error('Failed to upload image');
          }

          const data = await response.json();
          console.log('Image uploaded successfully:', data);

          const imageUrl = `${MEDIA_BASE_URL}${data.image}`;
          onAdd([{ id: data.id, image: imageUrl }]);
        } catch (error) {
          console.error('Error uploading image:', error);
        }
      });
    },
    accept: {
      'image/*': [],
    },
  });

  const handleDrop = React.useCallback((event: DragEvent) => {
    event.preventDefault();
    setIsDragActive(false); // Reset drag state
    console.log('Drop event triggered:', event);

    if (event.dataTransfer) {
      const items = event.dataTransfer.items;
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.kind === 'string' && item.type === 'text/uri-list') {
          item.getAsString(async (url: string) => {
            console.log(`Processing dropped URL: ${url}`);
            if (!url.startsWith('http')) {
              console.error('Invalid URL:', url);
              return;
            }
            try {
              const response = await fetch(url);
              if (!response.ok) {
                throw new Error(`Failed to fetch image from URL: ${url}`);
              }
              const blob = await response.blob();
              const fileName = url.split('/').pop() || 'downloaded_image';
              const file = new File([blob], fileName, { type: blob.type });

              const formData = new FormData();
              formData.append('image', file);
              formData.append('computer', computerId.toString());

              const uploadResponse = await fetch(`${API_BASE_URL}upload-picture/`, {
                method: 'POST',
                body: formData,
              });

              if (!uploadResponse.ok) {
                throw new Error('Failed to upload image');
              }

              const data = await uploadResponse.json();
              console.log('Image uploaded successfully:', data);

              const imageUrl = `${MEDIA_BASE_URL}${data.image}`;
              onAdd([{ id: data.id, image: imageUrl }]);
            } catch (error) {
              console.error('Error processing dropped URL:', error);
            }
          });
        }
      }
    }
  }, [computerId, onAdd]);

  useEffect(() => {
    const dropzoneElement = document.querySelector('.dropzone');
    dropzoneElement?.addEventListener('dragenter', () => setIsDragActive(true));
    dropzoneElement?.addEventListener('dragleave', () => setIsDragActive(false));
    dropzoneElement?.addEventListener('drop', handleDrop as EventListener);
    dropzoneElement?.addEventListener('dragover', ((event: Event) => event.preventDefault()) as EventListener);

    return () => {
      dropzoneElement?.removeEventListener('dragenter', () => setIsDragActive(true));
      dropzoneElement?.removeEventListener('dragleave', () => setIsDragActive(false));
      dropzoneElement?.removeEventListener('drop', handleDrop as EventListener);
      dropzoneElement?.removeEventListener('dragover', ((event: Event) => event.preventDefault()) as EventListener);
    };
  }, [computerId, onAdd, handleDrop]);

  return (
    <div
      {...getRootProps()}
      className={`dropzone ${isDragActive ? 'drag-active' : ''}`}
    >
      <input {...getInputProps()} />
      <p>Drag and drop images here, or click to select files</p>
    </div>
  );
};

export default ImageWell;