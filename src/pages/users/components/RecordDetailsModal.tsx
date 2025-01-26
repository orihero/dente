import React, { useState } from 'react';
import { X, AlertCircle, FileText, Clock, Shield, Trash2, Edit2, Save, Image, FileImage, File, Send } from 'lucide-react';
import { useLanguageStore } from '../../../store/languageStore';
import { translations } from '../../../i18n/translations';
import { formatDateTime } from '../../../utils/dateUtils';
import { supabase } from '../../../lib/supabase';

interface RecordDetailsModalProps {
  showModal: boolean;
  onClose: () => void;
  record: any;
  onRefresh: () => Promise<void>;
}

export const RecordDetailsModal: React.FC<RecordDetailsModalProps> = ({
  showModal,
  onClose,
  record,
  onRefresh
}) => {
  const { language } = useLanguageStore();
  const t = translations[language].users;
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sendingRecipe, setSendingRecipe] = useState(false);
  const [data, setData] = useState({
    diagnosis: record?.diagnosis || '',
    total_price: record?.total_price || 0,
    recipe: record?.recipe || '',
    suggestions: record?.suggestions || ''
  });

  if (!showModal || !record) return null;

  const formatRecordNumber = (num: number) => {
    return String(num).padStart(6, '0');
  };

  const handleUpdate = async () => {
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase
        .from('patient_records')
        .update({
          diagnosis: data.diagnosis,
          total_price: data.total_price,
          recipe: data.recipe,
          suggestions: data.suggestions
        })
        .eq('id', record.id);

      if (error) throw error;
      await onRefresh();
      setIsEditing(false);
    } catch (error: any) {
      console.error('Error updating record:', error);
      setError(error.message || 'Failed to update record');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this record?')) return;

    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase
        .from('patient_records')
        .delete()
        .eq('id', record.id);

      if (error) throw error;
      await onRefresh();
      onClose();
    } catch (error: any) {
      console.error('Error deleting record:', error);
      setError(error.message || 'Failed to delete record');
    } finally {
      setLoading(false);
    }
  };

  const handleSendRecipe = async () => {
    if (!record) return;
    
    setSendingRecipe(true);
    try {
      const { error } = await supabase.rpc('send_record_recipe', {
        record_id: record.id
      });

      if (error) throw error;

      alert(language === 'uz' 
        ? 'Retsept muvaffaqiyatli yuborildi'
        : 'Рецепт успешно отправлен'
      );

      await onRefresh();
    } catch (error) {
      console.error('Error sending recipe:', error);
      alert(language === 'uz'
        ? 'Xatolik yuz berdi. Iltimos, keyinroq qayta urinib ko\'ring.'
        : 'Произошла ошибка. Пожалуйста, попробуйте позже.'
      );
    } finally {
      setSendingRecipe(false);
    }
  };

  const getFileIcon = (url: string) => {
    const extension = url.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'webp'].includes(extension || '')) {
      return <FileImage className="w-5 h-5" />;
    }
    if (extension === 'pdf') {
      return <File className="w-5 h-5" />;
    }
    return <FileText className="w-5 h-5" />;
  };

  const isImageFile = (url: string) => {
    const extension = url.split('.').pop()?.toLowerCase();
    return ['jpg', 'jpeg', 'png', 'webp'].includes(extension || '');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white">
          <div>
            <h2 className="text-lg font-semibold">
              Record #{formatRecordNumber(record.record_number)}
            </h2>
            <p className="text-sm text-gray-500">
              {formatDateTime(record.created_at)}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {!isEditing && (
              <>
                <button
                  onClick={() => setIsEditing(true)}
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full"
                >
                  <Edit2 className="w-5 h-5" />
                </button>
                <button
                  onClick={handleDelete}
                  disabled={loading}
                  className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-full"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </>
            )}
            <button
              onClick={onClose}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border-b border-red-100">
            <div className="flex items-center gap-2 text-red-700">
              <AlertCircle className="w-5 h-5" />
              <p>{error}</p>
            </div>
          </div>
        )}

        <div className="p-4 space-y-4">
          {isEditing ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Diagnosis
                </label>
                <textarea
                  value={data.diagnosis}
                  onChange={(e) => setData({ ...data, diagnosis: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Total Price
                </label>
                <input
                  type="number"
                  value={data.total_price}
                  onChange={(e) => setData({ ...data, total_price: Number(e.target.value) })}
                  className="w-full px-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {language === 'uz' ? 'Dori-darmonlar' : 'Лекарства'}
                </label>
                <textarea
                  value={data.recipe}
                  onChange={(e) => setData({ ...data, recipe: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder={language === 'uz' 
                    ? 'Dori-darmonlar va qo\'llash bo\'yicha ko\'rsatmalar'
                    : 'Лекарства и инструкции по применению'
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {language === 'uz' ? 'Tavsiyalar' : 'Рекомендации'}
                </label>
                <textarea
                  value={data.suggestions}
                  onChange={(e) => setData({ ...data, suggestions: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder={language === 'uz'
                    ? 'Bemorga tavsiyalar'
                    : 'Рекомендации пациенту'
                  }
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdate}
                  disabled={loading}
                  className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    'Saving...'
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="bg-gray-50 rounded p-3">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Diagnosis</h3>
                <p className="text-gray-900">{record.diagnosis}</p>
              </div>

              <div className="space-y-3">
                <h3 className="font-medium text-gray-900">Services</h3>
                {record.services.map((service: any, index: number) => (
                  <div key={index} className="flex justify-between items-start border-t pt-3">
                    <div>
                      <p className="font-medium text-gray-900">
                        {language === 'uz'
                          ? service.service.base_service.name_uz
                          : service.service.base_service.name_ru}
                      </p>
                      <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>{service.service.duration}</span>
                        </div>
                        {service.service.warranty_months > 0 && (
                          <div className="flex items-center gap-1">
                            <Shield className="w-4 h-4" />
                            <span>{service.service.warranty_months} months</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <p className="font-medium text-gray-900">
                      {service.price.toLocaleString()} UZS
                    </p>
                  </div>
                ))}
                <div className="flex justify-between items-center pt-4 border-t">
                  <span className="font-medium text-gray-900">Total Price:</span>
                  <span className="text-lg font-bold text-red-600">
                    {record.total_price.toLocaleString()} UZS
                  </span>
                </div>
              </div>

              {record.files?.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-medium text-gray-900">Files</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {record.files.map((file: any, index: number) => (
                      <div key={index} className="group relative">
                        {isImageFile(file.file_url) ? (
                          <div className="aspect-[4/3] w-full overflow-hidden rounded-lg bg-gray-100">
                            <img
                              src={file.file_url}
                              alt={`File ${index + 1}`}
                              className="h-full w-full object-cover object-center"
                            />
                          </div>
                        ) : (
                          <a
                            href={file.file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex flex-col items-center gap-2 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                          >
                            {getFileIcon(file.file_url)}
                            <span className="text-sm text-gray-700 truncate w-full text-center">
                              View File {index + 1}
                            </span>
                          </a>
                        )}
                        <a
                          href={file.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg ${
                            !isImageFile(file.file_url) && 'hidden'
                          }`}
                        >
                          <div className="text-white flex items-center gap-2">
                            <Image className="w-5 h-5" />
                            <span>View Image</span>
                          </div>
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {(record.recipe || record.suggestions) && (
                <div className="space-y-4 border-t pt-4">
                  {record.recipe && (
                    <div>
                      <h3 className="font-medium text-gray-900 mb-2">
                        {language === 'uz' ? 'Dori-darmonlar' : 'Лекарства'}
                      </h3>
                      <p className="text-gray-700 whitespace-pre-line">{record.recipe}</p>
                    </div>
                  )}

                  {record.suggestions && (
                    <div>
                      <h3 className="font-medium text-gray-900 mb-2">
                        {language === 'uz' ? 'Tavsiyalar' : 'Рекомендации'}
                      </h3>
                      <p className="text-gray-700 whitespace-pre-line">{record.suggestions}</p>
                    </div>
                  )}

                  <button
                    onClick={handleSendRecipe}
                    disabled={sendingRecipe || record.recipe_sent}
                    className={`flex items-center gap-2 px-4 py-2 rounded-md ${
                      record.recipe_sent
                        ? 'bg-green-100 text-green-800 cursor-not-allowed'
                        : 'bg-indigo-600 text-white hover:bg-indigo-700'
                    }`}
                  >
                    <Send className="w-4 h-4" />
                    <span>
                      {record.recipe_sent
                        ? (language === 'uz' ? 'Yuborilgan' : 'Отправлено')
                        : sendingRecipe
                        ? (language === 'uz' ? 'Yuborilmoqda...' : 'Отправка...')
                        : (language === 'uz' ? 'Retseptni yuborish' : 'Отправить рецепт')
                      }
                    </span>
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};