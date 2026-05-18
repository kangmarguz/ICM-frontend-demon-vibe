import { ImageIcon, Trash2, UploadCloud } from 'lucide-react';
import { motion } from 'motion/react';
import type { ChangeEvent, DragEvent, RefObject } from 'react';
import type { PendingImage } from '../projectFormSchema';
import { imageFields } from '../projectFormSchema';
import { ProjectFileField } from '../ProjectFileField';
import type { ImageType, ProjectImage } from '../../../types/project';

type ProjectImagesPanelProps = {
  canEdit: boolean;
  deletingPublicId: string | null;
  draggingField: ImageType | null;
  groupedImages: Record<ImageType, ProjectImage[]>;
  imageError: string;
  imageSuccess: string;
  inputRef: RefObject<HTMLInputElement>;
  isEditing: boolean;
  isUploadingImages: boolean;
  pendingImages: Record<ImageType, PendingImage[]>;
  onBrowse: (type: ImageType) => void;
  onDeleteImage: (publicId: string | null | undefined) => void;
  onDragLeave: () => void;
  onDragOver: (type: ImageType) => void;
  onDrop: (type: ImageType, event: DragEvent<HTMLButtonElement>) => void;
  onFileChange: (type: ImageType, event: ChangeEvent<HTMLInputElement>) => void;
  onRemovePendingImage: (type: ImageType, imageId: string) => void;
  onUploadImages: () => void;
};

export function ProjectImagesPanel({
  canEdit,
  deletingPublicId,
  draggingField,
  groupedImages,
  imageError,
  imageSuccess,
  inputRef,
  isEditing,
  isUploadingImages,
  onBrowse,
  onDeleteImage,
  onDragLeave,
  onDragOver,
  onDrop,
  onFileChange,
  onRemovePendingImage,
  onUploadImages,
  pendingImages,
}: ProjectImagesPanelProps) {
  return (
    <motion.aside
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.14, duration: 0.3, ease: 'easeOut' }}
      className="rounded-lg border border-slate-200 bg-white p-5"
    >
      <h3 className="font-semibold text-slate-950">Project images</h3>
      <p className="mt-1 text-sm text-slate-500">Images are grouped by backend image type.</p>

      <div className="mt-4 space-y-5">
        {Object.entries(groupedImages).map(([type, images]) => (
          <div key={type}>
            <p className="mb-2 text-xs font-semibold uppercase text-slate-500">{type}</p>
            {images.length === 0 ? (
              <div className="flex items-center gap-2 rounded border border-dashed border-slate-200 px-3 py-4 text-sm text-slate-500">
                <ImageIcon size={16} />
                No images
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {images.map((image) => (
                  <figure key={image.id} className="group overflow-hidden rounded border border-slate-200">
                    <a href={image.url} target="_blank" rel="noreferrer" className="relative block" title={image.name}>
                      <img src={image.url} alt={image.name} className="h-28 w-full object-cover" />
                      <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/75 via-slate-950/20 to-transparent px-2 py-2 opacity-0 transition-opacity group-hover:opacity-100">
                        <p className="truncate text-xs font-medium text-white">{image.name}</p>
                      </div>
                    </a>
                    <figcaption className="space-y-2 px-2 py-2">
                      {canEdit && isEditing && image.publicId ? (
                        <button
                          type="button"
                          onClick={() => onDeleteImage(image.publicId)}
                          disabled={deletingPublicId === image.publicId}
                          className="flex w-full items-center justify-center gap-1 rounded border border-rose-200 px-2 py-1 text-xs font-medium text-rose-600 hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          <Trash2 size={13} />
                          {deletingPublicId === image.publicId ? 'Deleting...' : 'Delete'}
                        </button>
                      ) : null}
                    </figcaption>
                  </figure>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {canEdit && isEditing ? (
        <div className="mt-6 border-t border-slate-200 pt-5">
          <div className="mb-3">
            <p className="text-sm font-semibold text-slate-950">Add images</p>
            <p className="mt-1 text-xs leading-5 text-slate-500">Upload new images to Cloudinary and save them to this project.</p>
          </div>

          <div className="space-y-3">
            {imageFields.map((field) => (
              <ProjectFileField
                key={field.type}
                canCreate={canEdit && !isUploadingImages}
                draggingField={draggingField}
                field={field}
                images={pendingImages[field.type]}
                onBrowse={onBrowse}
                onDragLeave={onDragLeave}
                onDragOver={onDragOver}
                onDrop={onDrop}
                onRemove={onRemovePendingImage}
              />
            ))}

            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(event) => {
                const type = event.currentTarget.getAttribute('data-image-type') as ImageType | null;

                if (type) {
                  onFileChange(type, event);
                }
              }}
            />

            <motion.button
              type="button"
              onClick={onUploadImages}
              disabled={isUploadingImages}
              whileHover={isUploadingImages ? undefined : { y: -1 }}
              whileTap={isUploadingImages ? undefined : { scale: 0.99 }}
              className="flex w-full items-center justify-center gap-2 rounded bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-700 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              <UploadCloud size={16} />
              {isUploadingImages ? 'Uploading...' : 'Upload images'}
            </motion.button>

            {imageError ? <div className="rounded border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{imageError}</div> : null}
            {imageSuccess ? <div className="rounded border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{imageSuccess}</div> : null}
          </div>
        </div>
      ) : null}
    </motion.aside>
  );
}
