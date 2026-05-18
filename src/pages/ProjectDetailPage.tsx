import { motion } from 'motion/react';
import { ProjectActivityPanel } from '../components/projects/detail/ProjectActivityPanel';
import { ProjectDetailHeader } from '../components/projects/detail/ProjectDetailHeader';
import { ProjectImagesPanel } from '../components/projects/detail/ProjectImagesPanel';
import { ProjectInfoPanel } from '../components/projects/detail/ProjectInfoPanel';
import { useProjectDetailController } from '../hooks/useProjectDetailController';

export function ProjectDetailPage() {
  const {
    activityRefreshKey,
    assignableUsers,
    canEdit,
    deletingPublicId,
    draggingField,
    errors,
    fileInputRef,
    groupedImages,
    handleBrowse,
    handleCancelEditing,
    handleDeleteImage,
    handleDrop,
    handleFileChange,
    handleStartEditing,
    handleSubmit,
    handleUploadImages,
    imageError,
    imageSuccess,
    isEditing,
    isLoading,
    isSubmitting,
    isUploadingImages,
    loadError,
    pendingImages,
    project,
    register,
    removePendingImage,
    saveError,
    saveSuccess,
    setDraggingField,
    showActiveState,
    showProjectControls,
    submitProject,
    user,
  } = useProjectDetailController();

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="mx-auto max-w-5xl space-y-5"
    >
      <ProjectDetailHeader />

      {isLoading ? (
        <div className="rounded-lg border border-slate-200 bg-white px-6 py-10 text-sm text-slate-500">Loading project...</div>
      ) : loadError ? (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-6 py-4 text-sm text-rose-700">{loadError}</div>
      ) : project ? (
        <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
          <ProjectInfoPanel
            assignableUsers={assignableUsers}
            canEdit={canEdit}
            errors={errors}
            isEditing={isEditing}
            isSubmitting={isSubmitting}
            isUploadingImages={isUploadingImages}
            onCancelEditing={handleCancelEditing}
            onStartEditing={handleStartEditing}
            onSubmit={handleSubmit(submitProject)}
            project={project}
            register={register}
            saveError={saveError}
            saveSuccess={saveSuccess}
            showActiveState={showActiveState}
            showProjectControls={showProjectControls}
          />

          <ProjectImagesPanel
            canEdit={canEdit}
            deletingPublicId={deletingPublicId}
            draggingField={draggingField}
            groupedImages={groupedImages}
            imageError={imageError}
            imageSuccess={imageSuccess}
            inputRef={fileInputRef}
            isEditing={isEditing}
            isUploadingImages={isUploadingImages}
            onBrowse={handleBrowse}
            onDeleteImage={handleDeleteImage}
            onDragLeave={() => setDraggingField(null)}
            onDragOver={setDraggingField}
            onDrop={handleDrop}
            onFileChange={handleFileChange}
            onRemovePendingImage={removePendingImage}
            onUploadImages={handleUploadImages}
            pendingImages={pendingImages}
          />

          <div className="lg:col-span-2">
            <ProjectActivityPanel canComment={user.role !== 'GUEST'} projectId={project.id} refreshKey={activityRefreshKey} />
          </div>
        </div>
      ) : (
        <div className="rounded-lg border border-slate-200 bg-white px-6 py-10 text-sm text-slate-500">Project not found.</div>
      )}
    </motion.div>
  );
}
