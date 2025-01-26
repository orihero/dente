import React from 'react';
import { useForm } from 'react-hook-form';
import { Lock, Mail, AlertCircle } from 'lucide-react';
import { useLanguageStore } from '../../../store/languageStore';
import { translations } from '../../../i18n/translations';

interface LoginFormProps {
  onSubmit: (data: { emailPhone: string; password: string }) => Promise<void>;
  loading: boolean;
  error: string;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  onSubmit,
  loading,
  error
}) => {
  const { language } = useLanguageStore();
  const t = translations[language].login;
  
  const { register, handleSubmit, formState: { errors } } = useForm<{
    emailPhone: string;
    password: string;
  }>();

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
        </div>
      )}

      <div>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            {...register('emailPhone', { required: true })}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            placeholder={t.emailPhone}
          />
        </div>
        {errors.emailPhone && (
          <span className="text-sm text-red-500 mt-1">This field is required</span>
        )}
      </div>

      <div>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            {...register('password', { required: true })}
            type="password"
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            placeholder={t.password}
          />
        </div>
        {errors.password && (
          <span className="text-sm text-red-500 mt-1">This field is required</span>
        )}
      </div>

      <div className="flex items-center justify-between">
        <button
          type="button"
          className="text-sm text-indigo-600 hover:text-indigo-500"
        >
          {t.forgotPassword}
        </button>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
      >
        {loading ? t.loading : t.loginButton}
      </button>
    </form>
  );
};