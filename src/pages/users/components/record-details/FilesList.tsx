import React from 'react';
import { FileText, FileImage, File, Image } from 'lucide-react';

interface FilesListProps {
  files: Array<{
    id: string;
    file_url: string;
  }>;
}

export const FilesList: React.FC<FilesListProps> = ({ files }) => {
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
    <div className="space-y-3">
      <h3 className="font-medium text-gray-900">Files</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {files.map((file, index) => (
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
  );
};