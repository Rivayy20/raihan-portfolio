import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { FaEdit, FaPlus, FaTimes, FaTrash } from 'react-icons/fa';
import { QUERY_KEYS } from '../../lib/queryClient';
import { useToast } from '../hooks/useToast';
import {
  createCollectionItem,
  deleteCollectionItem,
  discardCollectionDraft,
  discardSingletonDraft,
  fetchSingleton,
  invalidateCmsCaches,
  listCollection,
  publishCollectionItem,
  publishSingleton,
  reorderCollectionItems,
  resolveEffectiveRecord,
  saveCollectionDraft,
  saveSingletonDraft,
  unpublishCollectionItem,
} from '../services/contentWorkflowService';
import { extractZodErrors, isSafeUrl } from '../utils/urlValidation';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { DataTable } from '../components/ui/DataTable';
import { DraftPublishBar } from '../components/ui/DraftPublishBar';
import { ErrorState } from '../components/ui/ErrorState';
import {
  SectionCard,
  SelectField,
  TextField,
  ToggleField,
} from '../components/ui/FormField';
import { FormSkeleton } from '../components/ui/LoadingSkeleton';
import { OrderControls } from '../components/ui/OrderControls';
import { PageHeader } from '../components/ui/PageHeader';
import { StatusBadge } from '../components/ui/StatusBadge';

const navItemSchema = z.object({
  label: z.string().trim().min(1, 'Label menu wajib diisi.'),
  href: z
    .string()
    .trim()
    .min(1, 'Target href wajib diisi.')
    .refine(
      (v) => isSafeUrl(v, { allowAnchor: true }),
      'Gunakan anchor (#about) atau URL http/https yang valid.'
    ),
  section_id: z.string().trim().min(1, 'Section ID wajib diisi.'),
});

const ctaSchema = z.object({
  navbar_cta_label: z.string().trim().min(1, 'Label tombol CTA wajib diisi.'),
  navbar_cta_href: z
    .string()
    .trim()
    .min(1, 'Target tombol CTA wajib diisi.')
    .refine(
      (v) => isSafeUrl(v, { allowAnchor: true }),
      'Gunakan anchor (#contact) atau URL http/https yang valid.'
    ),
});

function NavItemForm({ item, totalCount, onClose }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const effective = resolveEffectiveRecord(item);

  const [form, setForm] = useState({
    label: effective?.label || '',
    href: effective?.href || '#',
    section_id: effective?.section_id || '',
    show_in_navbar: effective?.show_in_navbar ?? true,
    show_in_footer: effective?.show_in_footer ?? true,
    is_visible: effective?.is_visible ?? true,
  });

  const [errors, setErrors] = useState({});
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  const updateField = (key, val) => {
    setForm((prev) => ({ ...prev, [key]: val }));
    setIsDirty(true);
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const validate = () => {
    const parsed = navItemSchema.safeParse(form);
    if (!parsed.success) {
      setErrors(extractZodErrors(parsed.error.issues));
      toast.error('Periksa kembali field menu yang belum valid.');
      return null;
    }
    return {
      ...parsed.data,
      show_in_navbar: form.show_in_navbar,
      show_in_footer: form.show_in_footer,
      is_visible: form.is_visible,
      display_order: item ? item.display_order : totalCount,
    };
  };

  const handleSaveDraft = async () => {
    const valid = validate();
    if (!valid) return;
    setIsSaving(true);
    try {
      if (item) {
        await saveCollectionDraft({
          table: 'navigation_items',
          currentRow: item,
          payload: valid,
        });
      } else {
        await createCollectionItem({
          table: 'navigation_items',
          payload: valid,
          publishImmediately: false,
        });
      }
      await invalidateCmsCaches(queryClient, [QUERY_KEYS.cmsNavigation]);
      toast.success('Draft menu navigasi disimpan.');
      onClose();
    } catch (err) {
      toast.error(err?.message || 'Gagal menyimpan menu navigasi.');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublish = async () => {
    const valid = validate();
    if (!valid) return;
    setIsPublishing(true);
    try {
      if (item) {
        await publishCollectionItem({
          table: 'navigation_items',
          currentRow: item,
          payload: valid,
          summaryNote: `Published nav link: ${valid.label}`,
        });
      } else {
        await createCollectionItem({
          table: 'navigation_items',
          payload: valid,
          publishImmediately: true,
          summaryNote: `Published nav link: ${valid.label}`,
        });
      }
      await invalidateCmsCaches(queryClient, [QUERY_KEYS.cmsNavigation]);
      toast.success(`Menu "${valid.label}" dipublikasikan.`);
      onClose();
    } catch (err) {
      toast.error(err?.message || 'Gagal mempublikasikan menu.');
    } finally {
      setIsPublishing(false);
    }
  };

  const handleUnpublish = async () => {
    if (!item) return;
    setIsSaving(true);
    try {
      await unpublishCollectionItem({
        table: 'navigation_items',
        currentRow: item,
        summaryNote: `Unpublished nav link: ${item.label}`,
      });
      await invalidateCmsCaches(queryClient, [QUERY_KEYS.cmsNavigation]);
      toast.info(`Menu "${item.label}" ditarik ke draft.`);
      onClose();
    } catch (err) {
      toast.error(err?.message || 'Gagal unpublish menu.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDiscard = async () => {
    if (!item) return;
    setIsSaving(true);
    try {
      await discardCollectionDraft({ table: 'navigation_items', id: item.id });
      await invalidateCmsCaches(queryClient, [QUERY_KEYS.cmsNavigation]);
      toast.info('Draft perubahan menu dibuang.');
      onClose();
    } catch (err) {
      toast.error(err?.message || 'Gagal membuang draft.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SectionCard
      title={item ? `Edit Menu: ${effective?.label}` : 'Tambah Menu Navigasi Baru'}
      actions={
        <button
          type="button"
          onClick={onClose}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border-subtle bg-surface hover:bg-surface-subtle text-xs font-semibold text-ink cursor-pointer transition-colors"
        >
          <FaTimes /> Tutup
        </button>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <TextField
          label="Nama Menu"
          value={form.label}
          onChange={(e) => updateField('label', e.target.value)}
          placeholder="Projects"
          error={errors.label}
          required
        />
        <TextField
          label="Target Href"
          value={form.href}
          onChange={(e) => updateField('href', e.target.value)}
          placeholder="#projects"
          helperText="Gunakan # untuk Home atau #section-id"
          error={errors.href}
          required
        />
        <TextField
          label="Section ID (Scroll Spy)"
          value={form.section_id}
          onChange={(e) => updateField('section_id', e.target.value)}
          placeholder="projects"
          helperText="ID elemen <section> untuk highlight menu aktif"
          error={errors.section_id}
          required
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4 pt-4 border-t border-border-subtle">
        <ToggleField
          label="Aktif (Visible)"
          checked={form.is_visible}
          onChange={(val) => updateField('is_visible', val)}
        />
        <ToggleField
          label="Tampil di Navbar"
          checked={form.show_in_navbar}
          onChange={(val) => updateField('show_in_navbar', val)}
        />
        <ToggleField
          label="Tampil di Footer"
          checked={form.show_in_footer}
          onChange={(val) => updateField('show_in_footer', val)}
        />
      </div>

      <DraftPublishBar
        publicationStatus={item?.publication_status || 'draft'}
        hasUnpublishedChanges={Boolean(item?.has_unpublished_changes)}
        isDirty={isDirty}
        isSaving={isSaving}
        isPublishing={isPublishing}
        onSaveDraft={handleSaveDraft}
        onPublish={handlePublish}
        onUnpublish={item ? handleUnpublish : undefined}
        onDiscardDraft={item ? handleDiscard : undefined}
        onPreview={() => navigate('/preview')}
      />
    </SectionCard>
  );
}

function NavbarCtaForm({ rawSettings }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const effective = resolveEffectiveRecord(rawSettings) || {};

  const [form, setForm] = useState({
    navbar_cta_label: effective.navbar_cta_label ?? 'Hire Me',
    navbar_cta_href: effective.navbar_cta_href ?? '#contact',
    navbar_cta_variant: effective.navbar_cta_variant ?? 'accent',
    show_navbar_cta: effective.show_navbar_cta ?? true,
    show_mobile_cv_btn: effective.show_mobile_cv_btn ?? true,
    show_theme_toggle: effective.show_theme_toggle ?? true,
  });

  const [errors, setErrors] = useState({});
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  const updateField = (key, val) => {
    setForm((prev) => ({ ...prev, [key]: val }));
    setIsDirty(true);
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const validate = () => {
    const parsed = ctaSchema.safeParse(form);
    if (!parsed.success) {
      setErrors(extractZodErrors(parsed.error.issues));
      toast.error('Periksa kembali konfigurasi tombol CTA.');
      return null;
    }
    return {
      ...form,
      ...parsed.data,
    };
  };

  const handleSaveDraft = async () => {
    const valid = validate();
    if (!valid) return;
    setIsSaving(true);
    try {
      await saveSingletonDraft({
        table: 'site_settings',
        currentRow: rawSettings,
        payload: valid,
        mergePartial: true,
      });
      await invalidateCmsCaches(queryClient, [QUERY_KEYS.cmsSiteSettings]);
      setIsDirty(false);
      toast.success('Draft pengaturan CTA Navbar disimpan.');
    } catch (err) {
      toast.error(err?.message || 'Gagal menyimpan draft CTA.');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublish = async () => {
    const valid = validate();
    if (!valid) return;
    setIsPublishing(true);
    try {
      await publishSingleton({
        table: 'site_settings',
        currentRow: rawSettings,
        payload: valid,
        mergePartial: true,
        mediaIds: [
          effective.profile_image_id,
          effective.logo_media_id,
          effective.favicon_media_id,
          effective.default_og_image_id,
        ],
        summaryNote: 'Published Navbar CTA & Controls',
      });
      await invalidateCmsCaches(queryClient, [QUERY_KEYS.cmsSiteSettings]);
      setIsDirty(false);
      toast.success('Pengaturan CTA Navbar dipublikasikan.');
    } catch (err) {
      toast.error(err?.message || 'Gagal mempublikasikan CTA.');
    } finally {
      setIsPublishing(false);
    }
  };

  const handleDiscard = async () => {
    setIsSaving(true);
    try {
      await discardSingletonDraft({ table: 'site_settings' });
      await invalidateCmsCaches(queryClient, [QUERY_KEYS.cmsSiteSettings]);
      toast.info('Draft site_settings dibuang.');
    } catch (err) {
      toast.error(err?.message || 'Gagal membuang draft.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SectionCard
      title="Tombol CTA & Aksi Navbar"
      description="Kelola tombol CTA Hire Me, tombol CV mobile drawer, dan toggle Dark/Light mode."
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <TextField
          label="Teks Tombol CTA"
          value={form.navbar_cta_label}
          onChange={(e) => updateField('navbar_cta_label', e.target.value)}
          error={errors.navbar_cta_label}
          required
        />
        <TextField
          label="Target Tombol CTA"
          value={form.navbar_cta_href}
          onChange={(e) => updateField('navbar_cta_href', e.target.value)}
          error={errors.navbar_cta_href}
          required
        />
        <SelectField
          label="Varian Warna Tombol"
          value={form.navbar_cta_variant}
          onChange={(e) => updateField('navbar_cta_variant', e.target.value)}
          options={[
            { value: 'accent', label: 'Editorial Ink / Peach (Default)' },
            { value: 'primary', label: 'Sunset Coral (Primary)' },
            { value: 'secondary', label: 'Sunset Rose (Secondary)' },
            { value: 'white', label: 'Surface Light' },
          ]}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4 pt-4 border-t border-border-subtle">
        <ToggleField
          label="Tampilkan Tombol CTA"
          checked={form.show_navbar_cta}
          onChange={(val) => updateField('show_navbar_cta', val)}
        />
        <ToggleField
          label="Tampilkan View CV di Drawer Mobile"
          checked={form.show_mobile_cv_btn}
          onChange={(val) => updateField('show_mobile_cv_btn', val)}
        />
        <ToggleField
          label="Tampilkan Theme Toggle"
          checked={form.show_theme_toggle}
          onChange={(val) => updateField('show_theme_toggle', val)}
        />
      </div>

      <DraftPublishBar
        publicationStatus={rawSettings?.publication_status || 'draft'}
        hasUnpublishedChanges={Boolean(rawSettings?.has_unpublished_changes)}
        isDirty={isDirty}
        isSaving={isSaving}
        isPublishing={isPublishing}
        onSaveDraft={handleSaveDraft}
        onPublish={handlePublish}
        onDiscardDraft={handleDiscard}
        onPreview={() => navigate('/preview')}
      />
    </SectionCard>
  );
}

export function NavbarManagementPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [search, setSearch] = useState('');
  const [editingItem, setEditingItem] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isReordering, setIsReordering] = useState(false);

  const navQuery = useQuery({
    queryKey: QUERY_KEYS.cmsNavigation,
    queryFn: () => listCollection('navigation_items', { orderBy: 'display_order' }),
  });

  const settingsQuery = useQuery({
    queryKey: QUERY_KEYS.cmsSiteSettings,
    queryFn: () => fetchSingleton('site_settings'),
  });

  const items = navQuery.data || [];
  const filteredItems = search.trim()
    ? items.filter((item) => {
        const eff = resolveEffectiveRecord(item);
        return `${eff.label} ${eff.href} ${eff.section_id}`
          .toLowerCase()
          .includes(search.trim().toLowerCase());
      })
    : items;

  const handleMove = async (fromIdx, toIdx) => {
    if (toIdx < 0 || toIdx >= items.length) return;
    const reordered = [...items];
    const [moved] = reordered.splice(fromIdx, 1);
    reordered.splice(toIdx, 0, moved);

    setIsReordering(true);
    try {
      await reorderCollectionItems({
        table: 'navigation_items',
        orderedIds: reordered.map((x) => x.id),
      });
      await invalidateCmsCaches(queryClient, [QUERY_KEYS.cmsNavigation]);
      toast.success('Urutan menu navigasi diperbarui.');
    } catch (err) {
      toast.error(err?.message || 'Gagal mengubah urutan menu.');
    } finally {
      setIsReordering(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await deleteCollectionItem({
        table: 'navigation_items',
        currentRow: deleteTarget,
        summaryNote: `Deleted nav item: ${deleteTarget.label}`,
      });
      await invalidateCmsCaches(queryClient, [QUERY_KEYS.cmsNavigation]);
      toast.success(`Menu "${deleteTarget.label}" berhasil dihapus.`);
      setDeleteTarget(null);
    } catch (err) {
      toast.error(err?.message || 'Gagal menghapus menu.');
    } finally {
      setIsDeleting(false);
    }
  };

  const columns = [
    {
      key: 'order',
      label: 'Urutan',
      render: (row) => {
        const trueIndex = items.findIndex((i) => i.id === row.id);
        return (
          <OrderControls
            index={trueIndex}
            total={items.length}
            disabled={Boolean(search.trim()) || isReordering}
            onMoveUp={() => handleMove(trueIndex, trueIndex - 1)}
            onMoveDown={() => handleMove(trueIndex, trueIndex + 1)}
          />
        );
      },
    },
    {
      key: 'label',
      label: 'Menu',
      render: (row) => {
        const eff = resolveEffectiveRecord(row);
        return (
          <div>
            <p className="font-semibold text-ink">{eff.label}</p>
            <p className="text-xs text-muted font-mono">
              {eff.href} · #{eff.section_id}
            </p>
          </div>
        );
      },
    },
    {
      key: 'placement',
      label: 'Penempatan',
      render: (row) => {
        const eff = resolveEffectiveRecord(row);
        return (
          <div className="flex flex-wrap gap-1.5 text-xs">
            {eff.show_in_navbar && (
              <span className="px-2 py-0.5 rounded bg-surface-subtle text-ink font-medium">
                Navbar
              </span>
            )}
            {eff.show_in_footer && (
              <span className="px-2 py-0.5 rounded bg-surface-subtle text-ink font-medium">
                Footer
              </span>
            )}
          </div>
        );
      },
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => {
        const eff = resolveEffectiveRecord(row);
        const st =
          row.publication_status === 'published' && row.has_unpublished_changes
            ? 'edited'
            : row.publication_status;
        return (
          <div className="flex flex-wrap gap-1.5">
            <StatusBadge status={st} />
            <StatusBadge status={eff.is_visible ? 'visible' : 'hidden'} />
          </div>
        );
      },
    },
    {
      key: 'actions',
      label: 'Aksi',
      align: 'right',
      render: (row) => (
        <div className="inline-flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => {
              setIsCreating(false);
              setEditingItem(row);
            }}
            className="p-2 rounded-lg text-muted hover:text-primary hover:bg-surface-subtle cursor-pointer transition-colors"
            title="Edit"
          >
            <FaEdit className="text-xs" />
          </button>
          <button
            type="button"
            onClick={() => setDeleteTarget(row)}
            className="p-2 rounded-lg text-muted hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 cursor-pointer transition-colors"
            title="Hapus"
          >
            <FaTrash className="text-xs" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Navbar Management"
        description="Atur item menu navigasi, urutan, target section, serta tombol CTA Hire Me."
        actions={
          <button
            type="button"
            onClick={() => {
              setEditingItem(null);
              setIsCreating(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary hover:bg-[#f25858] text-white text-xs font-semibold cursor-pointer transition-colors"
          >
            <FaPlus /> Tambah Menu
          </button>
        }
      />

      {(isCreating || editingItem) && (
        <NavItemForm
          key={editingItem ? `${editingItem.id}-${editingItem.updated_at}` : 'new-nav'}
          item={editingItem}
          totalCount={items.length}
          onClose={() => {
            setIsCreating(false);
            setEditingItem(null);
          }}
        />
      )}

      <DataTable
        columns={columns}
        data={filteredItems}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Cari label menu atau target section..."
        isLoading={navQuery.isLoading}
        error={navQuery.error}
        onRetry={() => navQuery.refetch()}
        emptyTitle="Belum ada menu navigasi"
        emptyDescription="Tambahkan link navigasi baru untuk tampil di Navbar & Footer."
      />

      {settingsQuery.isLoading ? (
        <FormSkeleton fields={3} />
      ) : settingsQuery.isError ? (
        <ErrorState
          message={settingsQuery.error?.message}
          onRetry={() => settingsQuery.refetch()}
        />
      ) : (
        <NavbarCtaForm
          key={`${settingsQuery.data?.updated_at}-${settingsQuery.data?.has_unpublished_changes}`}
          rawSettings={settingsQuery.data}
        />
      )}

      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        title="Hapus Item Menu?"
        description={
          deleteTarget
            ? `Menu "${deleteTarget.label}" akan dihapus permanen dari daftar navigasi.`
            : ''
        }
        confirmLabel="Ya, Hapus"
        variant="danger"
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
