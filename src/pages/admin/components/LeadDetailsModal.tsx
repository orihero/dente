import React, { useState, useEffect } from 'react';
import { X, AlertCircle, MessageSquare } from 'lucide-react';
import { useLanguageStore } from '../../../store/languageStore';
import { supabase } from '../../../lib/supabase';
import { formatDateTime } from '../../../utils/dateUtils';

interface LeadDetailsModalProps {
  showModal: boolean;
  onClose: () => void;
  lead: any;
  onUpdate: () => Promise<void>;
}

export const LeadDetailsModal: React.FC<LeadDetailsModalProps> = ({
  showModal,
  onClose,
  lead,
  onUpdate
}) => {
  const { language } = useLanguageStore();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [data, setData] = useState({
    full_name: '',
    phone: '',
    email: '',
    status: ''
  });

  useEffect(() => {
    if (lead) {
      setData({
        full_name: lead.full_name || '',
        phone: lead.phone || '',
        email: lead.email || '',
        status: lead.status || 'new'
      });
      fetchComments();
    }
  }, [lead]);

  const fetchComments = async () => {
    try {
      const { data: comments, error } = await supabase
        .from('lead_comments')
        .select(`
          *,
          dentist:dentists(full_name)
        `)
        .eq('lead_id', lead.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setComments(comments || []);
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase
        .from('leads')
        .update(data)
        .eq('id', lead.id);

      if (error) throw error;
      await onUpdate();
      setIsEditing(false);
    } catch (error: any) {
      console.error('Error updating lead:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setLoading(true);
    setError(null);
    try {
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) throw new Error('No user found');

      // Add comment
      const { error: commentError } = await supabase
        .from('lead_comments')
        .insert({
          lead_id: lead.id,
          dentist_id: user.id,
          content: newComment.trim()
        });

      if (commentError) throw commentError;

      setNewComment('');
      await fetchComments();
      await onUpdate();
    } catch (error: any) {
      console.error('Error adding comment:', error);
      setError(language === 'uz'
        ? 'Izoh qo\'shishda xatolik yuz berdi'
        : 'Ошибка при добавлении комментария');
    } finally {
      setLoading(false);
    }
  };

  if (!showModal || !lead) return null;

  const statusLabels = {
    new: {
      uz: 'Yangi',
      ru: 'Новый',
      color: 'bg-blue-100 text-blue-800'
    },
    contacted: {
      uz: 'Bog\'lanildi',
      ru: 'Связались',
      color: 'bg-yellow-100 text-yellow-800'
    },
    converted: {
      uz: 'Ro\'yxatdan o\'tdi',
      ru: 'Зарегистрирован',
      color: 'bg-green-100 text-green-800'
    },
    rejected: {
      uz: 'Rad etildi',
      ru: 'Отклонен',
      color: 'bg-red-100 text-red-800'
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white">
          <div>
            <h2 className="text-lg font-semibold">
              {language === 'uz' ? 'So\'rov ma\'lumotlari' : 'Детали заявки'}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {formatDateTime(lead.created_at)}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border-b border-red-100">
            <div className="flex items-center gap-2 text-red-700">
              <AlertCircle className="w-5 h-5" />
              <p>{error}</p>
            </div>
          </div>
        )}

        <div className="p-4">
          {isEditing ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {language === 'uz' ? 'To\'liq ism' : 'Полное имя'}
                </label>
                <input
                  type="text"
                  value={data.full_name}
                  onChange={(e) => setData({ ...data, full_name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {language === 'uz' ? 'Telefon' : 'Телефон'}
                </label>
                <input
                  type="text"
                  value={data.phone}
                  onChange={(e) => setData({ ...data, phone: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={data.email || ''}
                  onChange={(e) => setData({ ...data, email: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {language === 'uz' ? 'Holat' : 'Статус'}
                </label>
                <select
                  value={data.status}
                  onChange={(e) => setData({ ...data, status: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                >
                  {Object.entries(statusLabels).map(([value, labels]) => (
                    <option key={value} value={value}>
                      {labels[language as keyof typeof labels]}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                >
                  {language === 'uz' ? 'Bekor qilish' : 'Отмена'}
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
                >
                  {loading 
                    ? (language === 'uz' ? 'Saqlanmoqda...' : 'Сохранение...')
                    : (language === 'uz' ? 'Saqlash' : 'Сохранить')}
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium text-gray-900">{lead.full_name}</h3>
                  <p className="text-gray-500">{lead.phone}</p>
                  {lead.email && (
                    <p className="text-gray-500">{lead.email}</p>
                  )}
                </div>
                <button
                  onClick={() => setIsEditing(true)}
                  className="text-indigo-600 hover:text-indigo-500"
                >
                  {language === 'uz' ? 'Tahrirlash' : 'Редактировать'}
                </button>
              </div>

              <div>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  statusLabels[lead.status as keyof typeof statusLabels].color
                }`}>
                  {statusLabels[lead.status as keyof typeof statusLabels][language as keyof typeof statusLabels.new]}
                </span>
              </div>

              {/* Comments Section */}
              <div className="border-t pt-4">
                <h3 className="font-medium text-gray-900 mb-4">
                  {language === 'uz' ? 'Izohlar' : 'Комментарии'}
                </h3>

                <form onSubmit={handleAddComment} className="mb-4">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder={language === 'uz' ? 'Izoh qo\'shish...' : 'Добавить комментарий...'}
                    className="w-full px-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    rows={3}
                  />
                  <div className="mt-2 flex justify-end">
                    <button
                      type="submit"
                      disabled={loading || !newComment.trim()}
                      className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50"
                    >
                      {loading 
                        ? (language === 'uz' ? 'Qo\'shilmoqda...' : 'Добавление...')
                        : (language === 'uz' ? 'Qo\'shish' : 'Добавить')}
                    </button>
                  </div>
                </form>

                <div className="space-y-4">
                  {comments.map((comment) => (
                    <div key={comment.id} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <p className="text-gray-900">{comment.content}</p>
                      </div>
                      <div className="mt-2 flex items-center justify-between text-sm text-gray-500">
                        <span>{comment.dentist?.full_name}</span>
                        <span>{formatDateTime(comment.created_at)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};