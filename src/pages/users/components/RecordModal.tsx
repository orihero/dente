import React, { useState, useRef } from 'react';
import { X, Plus, AlertCircle, Upload, FileText } from 'lucide-react';
import { useLanguageStore } from '../../../store/languageStore';
import { translations } from '../../../i18n/translations';
import { ApplyServiceModal } from './ApplyServiceModal';
import { sendSMS } from '../../../lib/sms';
import { supabase } from '../../../lib/supabase';

interface RecordModalProps {
  showModal: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  loading: boolean;
  patientId: string;
}

export const RecordModal: React.FC<RecordModalProps> = ({
  showModal,
  onClose,
  onSubmit,
  loading,
  patientId
}) => {
  const { language } = useLanguageStore();
  const t = translations[language].users;
  const [error, setError] = useState<string | null>(null);
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [data, setData] = useState({
    diagnosis: '',
    services: [] as any[],
    total_price: 0,
    initial_payment: '',
    payment_type: '',
    files: [] as File[],
    uploadedFiles: [] as string[]
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientId) {
      setError('Patient ID is required');
      return;
    }

    if (data.initial_payment && !data.payment_type) {
      setError('Please select a payment type');
      return;
    }
    
    setIsUploading(true);
    try {
      // First upload all files
      const uploadedUrls: string[] = [];
      
      for (const file of data.files) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${crypto.randomUUID()}.${fileExt}`;
        const filePath = `${patientId}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('service-files')
          .upload(filePath, file, {
            upsert: false,
            contentType: file.type,
            cacheControl: '3600'
          });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('service-files')
          .getPublicUrl(filePath);

        uploadedUrls.push(publicUrl);
      }

      // Then create the record with file URLs
      await onSubmit({
        ...data,
        patient_id: patientId,
        initial_payment: data.initial_payment ? Number(data.initial_payment) : null,
        files: uploadedUrls
      });

      setData({
        diagnosis: '',
        services: [],
        total_price: 0,
        initial_payment: '',
        payment_type: '',
        files: [],
        uploadedFiles: []
      });

      // Get patient and dentist data for notification
      const { data: patient, error: patientError } = await supabase
        .from('patients')
        .select('*')
        .eq('id', patientId)
        .single();

      if (patientError) throw patientError;

      const { data: dentist, error: dentistError } = await supabase
        .from('dentists')
        .select('*')
        .eq('id', user.id)
        .single();

      if (dentistError) throw dentistError;

      // Generate registration token for Telegram bot
      const { data: token, error: tokenError } = await supabase
        .rpc('generate_telegram_registration_token', {
          patient_id: patientId
        });

      if (tokenError) throw tokenError;

      // Create notification based on patient's preferred method
      if (patient.telegram_registered && patient.telegram_chat_id) {
        // Send via Telegram
        await supabase
          .from('notifications')
          .insert({
            type: 'telegram',
            status: 'pending',
            recipient: patient.telegram_chat_id,
            message: patient.language === 'uz'
              ? `🦷 *Yangi tibbiy yozuv*\n\n` +
                `Hurmatli *${escape_markdown_v2(patient.full_name)}*,\n` +
                `*${escape_markdown_v2(dentist.full_name)}* shifokor tomonidan yangi tibbiy yozuv yaratildi\\.\n\n` +
                `*Tashxis:*\n${escape_markdown_v2(data.diagnosis)}`
              : `🦷 *Новая медицинская запись*\n\n` +
                `Уважаемый\\(ая\\) *${escape_markdown_v2(patient.full_name)}*,\n` +
                `Врач *${escape_markdown_v2(dentist.full_name)}* создал\\(а\\) новую медицинскую запись\\.\n\n` +
                `*Диагноз:*\n${escape_markdown_v2(data.diagnosis)}`
          });
      } else {
        // Send via SMS with bot invitation link
        const botLink = `https://t.me/denteuzbot?start=${token}`;
        await sendSMS({
          phone: patient.phone,
          text: patient.language === 'uz'
            ? `Hurmatli ${patient.full_name}, ${dentist.full_name} shifokor tomonidan yangi tibbiy yozuv yaratildi. ` +
              `Retsept va tavsiyalarni ko'rish uchun Telegram botimizga ulaning: ${botLink}`
            : `Уважаемый(ая) ${patient.full_name}, врач ${dentist.full_name} создал(а) новую медицинскую запись. ` +
              `Подключитесь к нашему Telegram боту, чтобы увидеть рецепт и рекомендации: ${botLink}`
        });
      }
    } catch (error: any) {
      console.error('Error creating record:', error);
      setError(error.message || 'Failed to create record');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleServiceApply = (services: any[]) => {
    setData(prev => ({
      ...prev,
      services,
      total_price: services.reduce((sum, service) => sum + Number(service.price), 0)
    }));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    handleFiles(droppedFiles);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      handleFiles(selectedFiles);
    }
  };

  const handleFiles = (files: File[]) => {
    // Validate files
    const validFiles = files.filter(file => {
      // Check file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        setError(`File ${file.name} is too large. Maximum size is 5MB`);
        return false;
      }

      // Check file type
      const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
      if (!validTypes.includes(file.type)) {
        setError(`File ${file.name} has invalid type. Allowed types are JPEG, PNG, WebP, and PDF`);
        return false;
      }

      return true;
    });

    setData(prev => ({
      ...prev,
      files: [...prev.files, ...validFiles]
    }));
  };

  const removeFile = (index: number) => {
    setData(prev => ({
      ...prev,
      files: prev.files.filter((_, i) => i !== index)
    }));
  };

  const paymentTypes = [
    { value: 'cash', label: t.cash },
    { value: 'card_transfer', label: t.cardTransfer },
    { value: 'card', label: t.card }
  ];

  if (!showModal) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white">
          <h2 className="text-lg font-semibold">Create Record</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
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

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Diagnosis
            </label>
            <textarea
              required
              value={data.diagnosis}
              onChange={(e) => setData({ ...data, diagnosis: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Services
              </label>
              <button
                type="button"
                onClick={() => setShowServiceModal(true)}
                className="flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-500"
              >
                <Plus className="w-4 h-4" />
                Apply Services
              </button>
            </div>
            
            {data.services.length > 0 ? (
              <div className="space-y-2">
                {data.services.map((service, index) => (
                  <div key={index} className="bg-gray-50 p-3 rounded-md">
                    <div className="flex justify-between">
                      <span className="font-medium">{service.name}</span>
                      <span>{service.price.toLocaleString()} UZS</span>
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      Duration: {service.duration} • Warranty: {service.warranty_months} months
                    </div>
                  </div>
                ))}
                <div className="flex justify-between items-center pt-2 border-t">
                  <span className="font-medium">Total Price:</span>
                  <input
                    type="number"
                    value={data.total_price}
                    onChange={(e) => setData({ ...data, total_price: Number(e.target.value) })}
                    className="w-32 px-2 py-1 border rounded focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-md">
                No services added
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Files
            </label>
            <div
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-indigo-500 transition-colors cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleFileSelect}
                accept="image/jpeg,image/png,image/webp,application/pdf"
                className="hidden"
              />
              <Upload className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-2 text-sm text-gray-600">
                Drag and drop files here, or click to select files
              </p>
              <p className="mt-1 text-xs text-gray-500">
                Maximum file size: 5MB. Supported formats: JPEG, PNG, WebP, PDF
              </p>
            </div>

            {data.files.length > 0 && (
              <div className="mt-4 space-y-2">
                {data.files.map((file, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-700">{file.name}</span>
                      <span className="text-xs text-gray-500">
                        ({(file.size / 1024 / 1024).toFixed(2)} MB)
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="p-1 hover:bg-gray-200 rounded"
                    >
                      <X className="w-4 h-4 text-gray-500" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="border-t pt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Initial Payment
            </label>
            <div className="flex gap-4">
              <div className="flex-1">
                <input
                  type="number"
                  value={data.initial_payment}
                  onChange={(e) => setData({ ...data, initial_payment: e.target.value })}
                  placeholder="Enter amount"
                  className="w-full px-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div className="flex gap-2">
                {paymentTypes.map((type) => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setData({ ...data, payment_type: type.value })}
                    className={`px-3 py-2 rounded-md text-sm ${
                      data.payment_type === type.value
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || isUploading || data.services.length === 0}
              className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {loading || isUploading ? 'Creating...' : 'Create Record'}
            </button>
          </div>
        </form>

        <ApplyServiceModal
          showModal={showServiceModal}
          onClose={() => setShowServiceModal(false)}
          onApply={handleServiceApply}
          selectedServices={data.services}
        />
      </div>
    </div>
  );
};