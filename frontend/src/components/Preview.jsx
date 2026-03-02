import { useState } from 'react';
import { X, Download, Trash2, Tag } from 'lucide-react';
import { downloadFile, deleteFile, getThumb } from '../api';

function formatBytes(bytes) {
  if (!bytes) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

function formatDate(d) {
  return new Date(d).toLocaleString(undefined, {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

export default function Preview({ file, onClose, onRefresh }) {
  const [imgErr, setImgErr] = useState(false);

  const isImage = file.mime_type?.startsWith('image/');
  const isPdf = file.mime_type === 'application/pdf';
  const isVideo = file.mime_type?.startsWith('video/');
  const isAudio = file.mime_type?.startsWith('audio/');

  const handleDownload = async () => {
    const res = await downloadFile(file.id);
    const url = URL.createObjectURL(res.data);
    const a = document.createElement('a');
    a.href = url; a.download = file.name; a.click();
    URL.revokeObjectURL(url);
  };

  const handleDelete = async () => {
    if (!confirm(`Delete "${file.name}"?`)) return;
    await deleteFile(file.id);
    onClose();
    onRefresh?.();
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-800 shrink-0">
          <h3 className="text-lg font-semibold text-white truncate pr-4">{file.name}</h3>
          <div className="flex items-center gap-2 shrink-0">
            <button onClick={handleDownload} className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition" title="Download">
              <Download className="w-5 h-5" />
            </button>
            <button onClick={handleDelete} className="p-2 rounded-lg text-gray-400 hover:text-red-400 hover:bg-gray-800 transition" title="Delete">
              <Trash2 className="w-5 h-5" />
            </button>
            <button onClick={onClose} className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Preview content */}
        <div className="flex-1 overflow-auto p-4 flex items-center justify-center bg-gray-950/50 min-h-[200px]">
          {isImage && !imgErr ? (
            <img
              src={`/api/files/${file.id}/download`}
              alt={file.name}
              className="max-w-full max-h-[60vh] object-contain rounded-lg"
              onError={() => setImgErr(true)}
            />
          ) : isPdf ? (
            <iframe
              src={`/api/files/${file.id}/download`}
              className="w-full h-[60vh] rounded-lg"
              title={file.name}
            />
          ) : isVideo ? (
            <video
              src={`/api/files/${file.id}/download`}
              controls
              className="max-w-full max-h-[60vh] rounded-lg"
            />
          ) : isAudio ? (
            <audio src={`/api/files/${file.id}/download`} controls className="w-full max-w-md" />
          ) : (
            <div className="text-center text-gray-500 py-10">
              <p className="text-lg mb-2">No preview available</p>
              <button onClick={handleDownload} className="text-ocean-400 hover:text-ocean-300 text-sm">
                Download file
              </button>
            </div>
          )}
        </div>

        {/* File info */}
        <div className="p-4 border-t border-gray-800 shrink-0">
          <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-gray-400">
            <span>Size: <span className="text-gray-300">{formatBytes(file.size)}</span></span>
            <span>Type: <span className="text-gray-300">{file.mime_type || 'Unknown'}</span></span>
            <span>Uploaded: <span className="text-gray-300">{formatDate(file.created_at)}</span></span>
            {file.checksum && (
              <span className="hidden lg:inline">SHA-256: <span className="text-gray-500 font-mono text-xs">{file.checksum.slice(0, 16)}…</span></span>
            )}
          </div>
          {file.tags?.length > 0 && (
            <div className="flex items-center gap-2 mt-2">
              <Tag className="w-3.5 h-3.5 text-gray-500" />
              <div className="flex flex-wrap gap-1">
                {file.tags.map((t) => (
                  <span
                    key={t.id}
                    className="text-xs px-2 py-0.5 rounded-full font-medium"
                    style={{ backgroundColor: t.color + '22', color: t.color }}
                  >
                    {t.name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
