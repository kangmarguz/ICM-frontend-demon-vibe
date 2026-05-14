import { zodResolver } from '@hookform/resolvers/zod';
import { AxiosError } from 'axios';
import { Eye, EyeOff, KeyRound, LockKeyhole, Mail } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { login } from '../services/authApi';
import { useAuthStore } from '../stores/authStore';

const loginSchema = z.object({
  email: z.string().trim().min(1, 'กรอก email').email('รูปแบบ email ไม่ถูกต้อง'),
  password: z.string().min(8, 'password อย่างน้อย 8 ตัวอักษร'),
});

type LoginFormData = z.infer<typeof loginSchema>;

type LocationState = {
  from?: {
    pathname?: string;
  };
};

type ApiErrorResponse = {
  message?: string;
};

export function LoginPage() {
  const user = useAuthStore((state) => state.user);
  const actionSetSession = useAuthStore((state) => state.actionSetSession);
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as LocationState | null)?.from?.pathname ?? '/';
  const [authError, setAuthError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleLogin = async (data: LoginFormData) => {
    try {
      setAuthError('');
      const session = await login({
        email: data.email.trim(),
        password: data.password,
      });
      actionSetSession(session);
      navigate(from, { replace: true });
    } catch (error) {
      const message =
        error instanceof AxiosError
          ? (error.response?.data as ApiErrorResponse | undefined)?.message
          : undefined;

      setAuthError(message ?? 'ไม่สามารถเข้าสู่ระบบได้ กรุณาตรวจสอบข้อมูลอีกครั้ง');
    }
  };

  const PasswordIcon = showPassword ? EyeOff : Eye;

  return (
    <main className="flex min-h-screen items-center justify-center bg-sky-50 px-4 py-10 text-slate-900">
      <section className="grid w-full max-w-5xl overflow-hidden rounded-lg border border-sky-100 bg-white shadow-sm shadow-sky-100 md:grid-cols-[0.9fr_1.1fr]">
        <div className="flex min-h-[560px] flex-col justify-between bg-sky-100 p-8">
          <div>
            <div className="mb-8 flex h-12 w-12 items-center justify-center rounded bg-sky-500 text-white">
              <LockKeyhole size={24} />
            </div>
            <p className="text-sm font-semibold uppercase tracking-wide text-sky-700">Protected workspace</p>
            <h1 className="mt-3 text-3xl font-semibold leading-tight text-slate-950">Project Task Manager</h1>
            <p className="mt-4 text-sm leading-6 text-slate-600">
              เข้าสู่ระบบด้วยบัญชีจริงจาก backend ก่อนใช้งาน workspace และ route ภายในทั้งหมด
            </p>
          </div>

          <div className="rounded border border-sky-200 bg-white/70 p-4">
            <p className="text-sm font-semibold text-slate-950">Secure access</p>
            <p className="mt-1 text-sm leading-6 text-slate-600">
              ระบบจะตรวจสอบบัญชีก่อนเปิด workspace สำหรับ project, task และ permission ของแต่ละ role
            </p>
          </div>
        </div>

        <div className="flex items-center p-6 md:p-10">
          <div className="w-full">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-slate-950">Sign in</h2>
              <p className="mt-1 text-sm text-slate-500">กรอก email และ password เพื่อเข้า dashboard</p>
            </div>

            <form onSubmit={handleSubmit(handleLogin)} className="space-y-4">
              <label className="block">
                <span className="text-sm font-medium text-slate-700">Email</span>
                <span className="mt-1 flex items-center gap-2 rounded border border-sky-200 bg-sky-50/60 px-3 py-2 focus-within:border-sky-500 focus-within:bg-white">
                  <Mail size={18} className="text-sky-600" />
                  <input
                    {...register('email', {
                      onChange: () => setAuthError(''),
                    })}
                    type="email"
                    className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
                    placeholder="name@example.com"
                    autoComplete="email"
                  />
                </span>
                {errors.email ? <p className="mt-1 text-sm text-rose-600">{errors.email.message}</p> : null}
              </label>

              <label className="block">
                <span className="text-sm font-medium text-slate-700">Password</span>
                <span className="mt-1 flex items-center gap-2 rounded border border-sky-200 bg-sky-50/60 px-3 py-2 focus-within:border-sky-500 focus-within:bg-white">
                  <KeyRound size={18} className="text-sky-600" />
                  <input
                    {...register('password', {
                      onChange: () => setAuthError(''),
                    })}
                    type={showPassword ? 'text' : 'password'}
                    className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
                    placeholder="Your password"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((value) => !value)}
                    className="rounded p-1 text-slate-500 hover:bg-sky-100 hover:text-sky-700"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    <PasswordIcon size={17} />
                  </button>
                </span>
                {errors.password ? <p className="mt-1 text-sm text-rose-600">{errors.password.message}</p> : null}
              </label>

              {authError ? (
                <div className="rounded border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{authError}</div>
              ) : null}

              <button
                type="submit"
                disabled={isSubmitting}
                className="flex w-full items-center justify-center gap-2 rounded bg-sky-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-sky-600 disabled:cursor-not-allowed disabled:bg-sky-300"
              >
                <LockKeyhole size={16} />
                {isSubmitting ? 'Logging in...' : 'Login'}
              </button>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}
