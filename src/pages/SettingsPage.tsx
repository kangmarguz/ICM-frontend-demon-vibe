import { Settings } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';

export function SettingsPage() {
  const user = useAuthStore((state) => state.user)!;

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-6">
      <div className="mb-5 flex h-12 w-12 items-center justify-center rounded bg-slate-100 text-slate-700">
        <Settings size={22} />
      </div>
      <h2 className="text-lg font-semibold text-slate-950">Settings</h2>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
        โครงหน้านี้เตรียมไว้สำหรับตั้งค่า profile, permission, Cloudinary และการเชื่อมต่อ API ในขั้นถัดไป
      </p>
      <div className="mt-6 rounded border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
        Current role: <span className="font-semibold text-slate-950">{user.role}</span>
      </div>
    </section>
  );
}
