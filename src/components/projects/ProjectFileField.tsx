import { Box, ImageIcon, ReceiptText, UploadCloud, X } from 'lucide-react';
import { motion } from 'motion/react';
import type { DragEvent } from 'react';
import type { ImageType } from '../../types/project';
import type { PendingImage, ProjectImageField } from './projectFormSchema';

const fieldIcons = {
  IMAGE_2D: ImageIcon,
  IMAGE_3D: Box,
  PAY_SLIP: ReceiptText,
};

type ProjectFileFieldProps = {
  canCreate: boolean;
  draggingField: ImageType | null;
  field: ProjectImageField;
  images: PendingImage[];
  onBrowse: (type: ImageType) => void;
  onDragLeave: () => void;
  onDragOver: (type: ImageType) => void;
  onDrop: (type: ImageType, event: DragEvent<HTMLButtonElement>) => void;
  onRemove: (type: ImageType, imageId: string) => void;
};

export function ProjectFileField({
  canCreate,
  draggingField,
  field,
  images,
  onBrowse,
  onDragLeave,
  onDragOver,
  onDrop,
  onRemove,
}: ProjectFileFieldProps) {
  const FieldIcon = fieldIcons[field.type];
  const isCurrentDragging = draggingField === field.type;

  return (
    <motion.div
      layout
      whileHover={{ y: -2, boxShadow: '0 10px 24px rgb(15 23 42 / 0.06)' }}
      className="rounded border border-slate-200 p-3"
    >
      <div className="mb-3 flex items-start gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded bg-sky-50 text-sky-700">
          <FieldIcon size={18} />
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-900">{field.title}</p>
          <p className="mt-1 text-xs leading-5 text-slate-500">{field.description}</p>
        </div>
      </div>

      <motion.button
        type="button"
        disabled={!canCreate}
        onClick={() => onBrowse(field.type)}
        onDragOver={(event) => {
          event.preventDefault();
          onDragOver(field.type);
        }}
        onDragLeave={onDragLeave}
        onDrop={(event) => onDrop(field.type, event)}
        className={[
          'flex min-h-28 w-full flex-col items-center justify-center rounded border border-dashed px-4 py-5 text-center',
          isCurrentDragging ? 'border-sky-500 bg-sky-50' : 'border-slate-300 bg-slate-50 hover:border-sky-400 hover:bg-sky-50',
          !canCreate ? 'cursor-not-allowed opacity-60' : '',
        ].join(' ')}
        whileHover={!canCreate ? undefined : { scale: 1.01 }}
        whileTap={!canCreate ? undefined : { scale: 0.99 }}
      >
        <UploadCloud size={24} className="text-sky-600" />
        <span className="mt-2 text-sm font-medium text-slate-800">Drop files here or click to browse</span>
        <span className="mt-1 text-xs text-slate-500">PNG, JPG, WEBP files are accepted</span>
      </motion.button>

      {images.length > 0 ? (
        <div className="mt-3 grid gap-3">
          {images.map((image) => (
            <motion.div
              layout
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              key={image.id}
              className="grid gap-3 rounded border border-slate-200 p-2 sm:grid-cols-[88px_1fr_auto] sm:items-center"
            >
              <img src={image.previewUrl} alt={image.file.name} className="h-20 w-full rounded object-cover sm:w-20" />
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-slate-900">{image.file.name}</p>
                <p className="mt-1 w-fit rounded bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">
                  {field.type}
                </p>
              </div>
              <motion.button
                type="button"
                onClick={() => onRemove(field.type, image.id)}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                className="flex h-9 w-9 items-center justify-center rounded border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                aria-label={`Remove ${image.file.name}`}
              >
                <X size={16} />
              </motion.button>
            </motion.div>
          ))}
        </div>
      ) : null}
    </motion.div>
  );
}
